import { Router } from "express";
import bcrypt from "bcryptjs";
import { createRequire } from "node:module";
import { authenticate } from "../middleware/auth.middleware.js";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

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

export default router;
