import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { authenticate } from "../middleware/auth.middleware.js";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

// ── Avatar upload config ──
const avatarDir = path.resolve(process.cwd(), "uploads", "avatars");
const publicAvatarPrefix = "/uploads/avatars";

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(avatarDir, { recursive: true });
    cb(null, avatarDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const AVATAR_SIZE = 256;
const AVATAR_QUALITY = 80;

const router = Router();

// Role name mapping: DB → Frontend
const ROLE_MAP = {
  "FACCS Admin": "Admin",
  "Coop Officer": "Officer",
  Farmer: "Farmer",
};

/**
 * GET /api/profile
 * Return full profile for the currently authenticated user.
 * Includes role-specific organization data.
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.userID, {
      include: [{ model: db.Role, attributes: ["roleName"] }],
    });

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = ROLE_MAP[user.Role.roleName] || user.Role.roleName;

    let organization = null;

    // Officer → cooperative details
    if (role === "Officer") {
      const coop = await db.PrimaryCooperative.findOne({
        where: { userID: user.userID, isDeleted: false },
      });
      if (coop) {
        organization = {
          type: "cooperative",
          primaryCoopID: coop.primaryCoopID,
          coopName: coop.coopName,
          barangay: coop.barangay,
          municipality: coop.municipality,
          phone: coop.phone,
          registrationNumber: coop.registrationNumber,
        };
      }
    }

    // Farmer → farm details + cooperative memberships
    if (role === "Farmer") {
      const farmer = await db.Farmer.findOne({
        where: { userID: user.userID, isDeleted: false },
      });
      if (farmer) {
        const memberships = await db.FarmerCooperative.findAll({
          where: { farmerID: farmer.farmerID },
          include: [
            {
              model: db.PrimaryCooperative,
              attributes: ["coopName"],
            },
          ],
        });
        organization = {
          type: "farmer",
          farmerID: farmer.farmerID,
          firstName: farmer.firstName,
          middleName: farmer.middleName,
          lastName: farmer.lastName,
          suffixName: farmer.suffixName,
          farmName: farmer.farmName,
          municipality: farmer.municipality,
          barangay: farmer.barangay,
          cooperatives: memberships.map((m) => ({
            coopName: m.PrimaryCooperative?.coopName || "Unknown",
            status: m.status,
            joinedDate: m.joinedDate,
          })),
        };
      }
    }

    res.json({
      profile: {
        id: user.userID,
        email: user.email,
        role,
        profilePicture: user.profilePicture || null,
        createdAt: user.createdAt,
        organization,
      },
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PUT /api/profile/email
 * Update the current user's email address.
 */
router.put("/email", authenticate, async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail || !newEmail.includes("@")) {
      return res
        .status(400)
        .json({ message: "Valid email address is required" });
    }

    // Check uniqueness
    const existing = await db.User.findOne({
      where: { email: newEmail, isDeleted: false },
    });
    if (existing && existing.userID !== req.user.userID) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    await db.User.update(
      { email: newEmail },
      { where: { userID: req.user.userID } },
    );

    res.json({ message: "Email updated", email: newEmail });
  } catch (err) {
    console.error("Email update error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PUT /api/profile/password
 * Change password. Requires current password for verification.
 */
router.put("/password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "All password fields are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    const user = await db.User.findByPk(req.user.userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(newPassword, salt);

    await db.User.update(
      { password_hash: hash },
      { where: { userID: req.user.userID } },
    );

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/profile
 * Soft-delete (deactivate) own account. Requires password confirmation.
 * Admin accounts cannot self-delete if they are the last active admin.
 */
router.delete("/", authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ message: "Password confirmation is required" });
    }

    const user = await db.User.findByPk(req.user.userID, {
      include: [{ model: db.Role, attributes: ["roleName"] }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    const role = ROLE_MAP[user.Role.roleName] || user.Role.roleName;

    // Prevent last admin from self-deleting
    if (role === "Admin") {
      const adminRole = await db.Role.findOne({
        where: { roleName: "FACCS Admin" },
      });
      if (adminRole) {
        const activeAdminCount = await db.User.count({
          where: { roleID: adminRole.roleID, isDeleted: false },
        });
        if (activeAdminCount <= 1) {
          return res
            .status(403)
            .json({ message: "Cannot deactivate the last admin account" });
        }
      }
    }

    // Soft-delete user
    await db.User.update(
      { isDeleted: true },
      { where: { userID: user.userID } },
    );

    // Soft-delete linked cooperative (Officer)
    if (role === "Officer") {
      await db.PrimaryCooperative.update(
        { isDeleted: true },
        { where: { userID: user.userID } },
      );
    }

    // Soft-delete linked farmer (Farmer)
    if (role === "Farmer") {
      await db.Farmer.update(
        { isDeleted: true },
        { where: { userID: user.userID } },
      );
    }

    res.json({ message: "Account deactivated" });
  } catch (err) {
    console.error("Account deactivation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PUT /api/profile/avatar
 * Upload or replace profile picture. Compresses to 256x256 PNG.
 */
router.put(
  "/avatar",
  authenticate,
  avatarUpload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Compress and resize to a consistent square PNG
      const outputName = `avatar-${req.user.userID}-${Date.now()}.png`;
      const outputPath = path.join(avatarDir, outputName);

      await sharp(req.file.path)
        .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: "center" })
        .png({ quality: AVATAR_QUALITY })
        .toFile(outputPath);

      // Remove the raw upload (different file)
      if (req.file.path !== outputPath) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (_) {}
      }

      // Remove old avatar if it exists
      const user = await db.User.findByPk(req.user.userID);
      if (user?.profilePicture) {
        const oldPath = path.resolve(
          process.cwd(),
          user.profilePicture.replace(/^\//, ""),
        );
        try {
          fs.unlinkSync(oldPath);
        } catch (_) {}
      }

      const publicPath = `${publicAvatarPrefix}/${outputName}`;

      await db.User.update(
        { profilePicture: publicPath },
        { where: { userID: req.user.userID } },
      );

      res.json({
        message: "Profile picture updated",
        profilePicture: publicPath,
      });
    } catch (err) {
      console.error("Avatar upload error:", err);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  },
);

/**
 * DELETE /api/profile/avatar
 * Remove the current profile picture, reverting to default.
 */
router.delete("/avatar", authenticate, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.userID);
    if (user?.profilePicture) {
      const oldPath = path.resolve(
        process.cwd(),
        user.profilePicture.replace(/^\//, ""),
      );
      try {
        fs.unlinkSync(oldPath);
      } catch (_) {}
    }

    await db.User.update(
      { profilePicture: null },
      { where: { userID: req.user.userID } },
    );

    res.json({ message: "Profile picture removed" });
  } catch (err) {
    console.error("Avatar delete error:", err);
    res.status(500).json({ message: "Failed to remove profile picture" });
  }
});

export default router;
