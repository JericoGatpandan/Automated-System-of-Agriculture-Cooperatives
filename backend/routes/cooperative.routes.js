import { Router } from "express";
import bcrypt from "bcryptjs";
import { createRequire } from "node:module";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

const router = Router();

// All routes require authentication + Admin role
router.use(authenticate);
router.use(authorize("Admin"));

/**
 * GET /api/cooperatives
 * List all non-deleted cooperatives with their officer info.
 */
router.get("/", async (req, res) => {
  try {
    const cooperatives = await db.PrimaryCooperative.findAll({
      where: { isDeleted: false },
      include: [
        {
          model: db.User,
          attributes: ["userID", "email"],
        },
      ],
      order: [["primaryCoopID", "ASC"]],
    });

    res.json({ cooperatives });
  } catch (err) {
    console.error("List cooperatives error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/cooperatives/:id
 * Get a single cooperative by ID.
 */
router.get("/:id", async (req, res) => {
  try {
    const cooperative = await db.PrimaryCooperative.findOne({
      where: { primaryCoopID: req.params.id, isDeleted: false },
      include: [
        {
          model: db.User,
          attributes: ["userID", "email"],
        },
      ],
    });

    if (!cooperative) {
      return res.status(404).json({ message: "Cooperative not found" });
    }

    res.json({ cooperative });
  } catch (err) {
    console.error("Get cooperative error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/cooperatives
 * Create a new cooperative and its linked Coop Officer user.
 *
 * Body: { coopName, barangay, municipality, phone, registrationNumber,
 *         officerEmail, officerPassword }
 */
router.post("/", async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      coopName,
      barangay,
      municipality,
      phone,
      registrationNumber,
      officerEmail,
      officerPassword,
    } = req.body;

    // Validation
    if (
      !coopName ||
      !barangay ||
      !municipality ||
      !registrationNumber ||
      !officerEmail ||
      !officerPassword
    ) {
      await t.rollback();
      return res.status(400).json({
        message:
          "coopName, barangay, municipality, registrationNumber, officerEmail, and officerPassword are required",
      });
    }

    // Check for duplicate registration number
    const existingCoop = await db.PrimaryCooperative.findOne({
      where: { registrationNumber, isDeleted: false },
      transaction: t,
    });

    if (existingCoop) {
      await t.rollback();
      return res.status(409).json({
        message: "A cooperative with this registration number already exists",
      });
    }

    // Check for duplicate officer email
    const existingUser = await db.User.findOne({
      where: { email: officerEmail, isDeleted: false },
      transaction: t,
    });

    if (existingUser) {
      await t.rollback();
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    // Get the Coop Officer role ID
    const officerRole = await db.Role.findOne({
      where: { roleName: "Coop Officer" },
      transaction: t,
    });

    if (!officerRole) {
      await t.rollback();
      return res.status(500).json({
        message: "Coop Officer role not found in database",
      });
    }

    // Create the officer user
    const passwordHash = await bcrypt.hash(officerPassword, 10);
    const officerUser = await db.User.create(
      {
        roleID: officerRole.roleID,
        email: officerEmail,
        password_hash: passwordHash,
        isDeleted: false,
      },
      { transaction: t },
    );

    // Create the cooperative linked to the officer
    const cooperative = await db.PrimaryCooperative.create(
      {
        userID: officerUser.userID,
        coopName,
        barangay,
        municipality,
        phone: phone || null,
        registrationNumber,
        isDeleted: false,
      },
      { transaction: t },
    );

    await t.commit();

    res.status(201).json({
      message: "Cooperative created successfully",
      cooperative: {
        ...cooperative.toJSON(),
        User: { userID: officerUser.userID, email: officerUser.email },
      },
    });
  } catch (err) {
    await t.rollback();
    console.error("Create cooperative error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PUT /api/cooperatives/:id
 * Update cooperative details (not the officer user).
 */
router.put("/:id", async (req, res) => {
  try {
    const cooperative = await db.PrimaryCooperative.findOne({
      where: { primaryCoopID: req.params.id, isDeleted: false },
    });

    if (!cooperative) {
      return res.status(404).json({ message: "Cooperative not found" });
    }

    const { coopName, barangay, municipality, phone, registrationNumber } =
      req.body;

    // Check for duplicate registration number (excluding current)
    if (registrationNumber && registrationNumber !== cooperative.registrationNumber) {
      const duplicate = await db.PrimaryCooperative.findOne({
        where: { registrationNumber, isDeleted: false },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "A cooperative with this registration number already exists",
        });
      }
    }

    await cooperative.update({
      coopName: coopName ?? cooperative.coopName,
      barangay: barangay ?? cooperative.barangay,
      municipality: municipality ?? cooperative.municipality,
      phone: phone ?? cooperative.phone,
      registrationNumber: registrationNumber ?? cooperative.registrationNumber,
    });

    // Re-fetch with User association for the response
    const updated = await db.PrimaryCooperative.findOne({
      where: { primaryCoopID: req.params.id },
      include: [{ model: db.User, attributes: ["userID", "email"] }],
    });

    res.json({ message: "Cooperative updated successfully", cooperative: updated });
  } catch (err) {
    console.error("Update cooperative error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/cooperatives/:id
 * Soft-delete a cooperative (set isDeleted = true).
 */
router.delete("/:id", async (req, res) => {
  try {
    const cooperative = await db.PrimaryCooperative.findOne({
      where: { primaryCoopID: req.params.id, isDeleted: false },
    });

    if (!cooperative) {
      return res.status(404).json({ message: "Cooperative not found" });
    }

    await cooperative.update({ isDeleted: true });

    // Also soft-delete the linked officer user
    await db.User.update(
      { isDeleted: true },
      { where: { userID: cooperative.userID } },
    );

    res.json({ message: "Cooperative deactivated successfully" });
  } catch (err) {
    console.error("Delete cooperative error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
