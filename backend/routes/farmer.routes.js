import { Router } from "express";
import bcrypt from "bcryptjs";
import { createRequire } from "node:module";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

const router = Router();

// ── Helpers ──

/** Resolve the officer's cooperative from their userID */
async function getOfficerCoop(userID) {
  return db.PrimaryCooperative.findOne({
    where: { userID, isDeleted: false },
  });
}

/** Standard farmer include for list queries */
const FARMER_INCLUDES = [
  { model: db.User, attributes: ["email"] },
  {
    model: db.FarmerCooperative,
    include: [
      { model: db.PrimaryCooperative, attributes: ["coopName", "primaryCoopID"] },
    ],
  },
  {
    model: db.Product,
    where: { isDeleted: false },
    required: false,
    include: [{ model: db.CropType, attributes: ["cropName", "category"] }],
  },
];

// ─────────────────────────────────────────────────────────
// GET /api/farmers  — Admin: list ALL farmers
// ─────────────────────────────────────────────────────────
router.get(
  "/",
  authenticate,
  authorize("Admin"),
  async (_req, res) => {
    try {
      const farmers = await db.Farmer.findAll({
        where: { isDeleted: false },
        include: FARMER_INCLUDES,
        order: [["lastName", "ASC"], ["firstName", "ASC"]],
      });
      res.json({ farmers });
    } catch (err) {
      console.error("Admin farmer list error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// GET /api/farmers/my-coop  — Officer: list own coop farmers
// ─────────────────────────────────────────────────────────
router.get(
  "/my-coop",
  authenticate,
  authorize("Officer"),
  async (req, res) => {
    try {
      const coop = await getOfficerCoop(req.user.userID);
      if (!coop) return res.status(404).json({ message: "Cooperative not found" });

      // Find farmer IDs linked to this coop
      const memberships = await db.FarmerCooperative.findAll({
        where: { primaryCoopID: coop.primaryCoopID },
        attributes: ["farmerID"],
      });
      const farmerIDs = memberships.map((m) => m.farmerID);

      if (farmerIDs.length === 0) return res.json({ farmers: [] });

      const farmers = await db.Farmer.findAll({
        where: { farmerID: farmerIDs, isDeleted: false },
        include: FARMER_INCLUDES,
        order: [["lastName", "ASC"], ["firstName", "ASC"]],
      });

      res.json({ farmers });
    } catch (err) {
      console.error("Officer farmer list error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// GET /api/farmers/:id  — Admin or Officer: single farmer detail
// ─────────────────────────────────────────────────────────
router.get(
  "/:id",
  authenticate,
  authorize("Admin", "Officer"),
  async (req, res) => {
    try {
      const farmer = await db.Farmer.findOne({
        where: { farmerID: req.params.id, isDeleted: false },
        include: FARMER_INCLUDES,
      });

      if (!farmer) return res.status(404).json({ message: "Farmer not found" });

      // Officer scope check
      if (req.user.role === "Officer") {
        const coop = await getOfficerCoop(req.user.userID);
        if (!coop) return res.status(403).json({ message: "Cooperative not found" });
        const isMember = farmer.FarmerCooperatives?.some(
          (fc) => fc.PrimaryCooperative?.primaryCoopID === coop.primaryCoopID
        );
        if (!isMember) return res.status(403).json({ message: "Farmer not in your cooperative" });
      }

      res.json({ farmer });
    } catch (err) {
      console.error("Farmer detail error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// POST /api/farmers  — Officer: create farmer (transactional)
// ─────────────────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  authorize("Officer"),
  async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      const { firstName, middleName, lastName, suffixName, email, password, farmName, farmLocation } = req.body;

      // Validation
      if (!firstName || !lastName || !email || !password || !farmLocation) {
        await t.rollback();
        return res.status(400).json({ message: "First name, last name, email, password, and farm location are required" });
      }
      if (password.length < 8) {
        await t.rollback();
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      // Check email uniqueness
      const existing = await db.User.findOne({ where: { email }, transaction: t });
      if (existing) {
        await t.rollback();
        return res.status(409).json({ message: "Email is already in use" });
      }

      const coop = await getOfficerCoop(req.user.userID);
      if (!coop) {
        await t.rollback();
        return res.status(404).json({ message: "Your cooperative was not found" });
      }

      // Get Farmer role ID
      const farmerRole = await db.Role.findOne({ where: { roleName: "Farmer" }, transaction: t });

      // 1. Create User
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(password, salt);
      const user = await db.User.create(
        { roleID: farmerRole.roleID, email, password_hash: hash, isDeleted: false },
        { transaction: t }
      );

      // 2. Create Farmer
      const farmer = await db.Farmer.create(
        {
          userID: user.userID,
          firstName,
          middleName: middleName || null,
          lastName,
          suffixName: suffixName || null,
          farmName: farmName || null,
          farmLocation,
          isDeleted: false,
        },
        { transaction: t }
      );

      // 3. Create FarmerCooperative membership
      await db.FarmerCooperative.create(
        {
          farmerID: farmer.farmerID,
          primaryCoopID: coop.primaryCoopID,
          joinedDate: new Date(),
          status: "active",
        },
        { transaction: t }
      );

      await t.commit();

      res.status(201).json({
        message: "Farmer registered successfully",
        farmer: {
          farmerID: farmer.farmerID,
          firstName,
          lastName,
          email,
        },
      });
    } catch (err) {
      await t.rollback();
      console.error("Create farmer error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// PUT /api/farmers/:id  — Officer: update farmer
// ─────────────────────────────────────────────────────────
router.put(
  "/:id",
  authenticate,
  authorize("Officer"),
  async (req, res) => {
    try {
      const coop = await getOfficerCoop(req.user.userID);
      if (!coop) return res.status(404).json({ message: "Cooperative not found" });

      // Scope check
      const membership = await db.FarmerCooperative.findOne({
        where: { farmerID: req.params.id, primaryCoopID: coop.primaryCoopID },
      });
      if (!membership) return res.status(403).json({ message: "Farmer not in your cooperative" });

      const { firstName, middleName, lastName, suffixName, farmName, farmLocation } = req.body;

      await db.Farmer.update(
        {
          firstName: firstName || undefined,
          middleName: middleName !== undefined ? middleName : undefined,
          lastName: lastName || undefined,
          suffixName: suffixName !== undefined ? suffixName : undefined,
          farmName: farmName !== undefined ? farmName : undefined,
          farmLocation: farmLocation || undefined,
        },
        { where: { farmerID: req.params.id } }
      );

      res.json({ message: "Farmer updated successfully" });
    } catch (err) {
      console.error("Update farmer error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// DELETE /api/farmers/:id  — Officer: soft-delete farmer
// ─────────────────────────────────────────────────────────
router.delete(
  "/:id",
  authenticate,
  authorize("Officer"),
  async (req, res) => {
    try {
      const coop = await getOfficerCoop(req.user.userID);
      if (!coop) return res.status(404).json({ message: "Cooperative not found" });

      const membership = await db.FarmerCooperative.findOne({
        where: { farmerID: req.params.id, primaryCoopID: coop.primaryCoopID },
      });
      if (!membership) return res.status(403).json({ message: "Farmer not in your cooperative" });

      const farmer = await db.Farmer.findByPk(req.params.id);
      if (!farmer) return res.status(404).json({ message: "Farmer not found" });

      // Soft-delete farmer and user
      await db.Farmer.update({ isDeleted: true }, { where: { farmerID: farmer.farmerID } });
      await db.User.update({ isDeleted: true }, { where: { userID: farmer.userID } });

      res.json({ message: "Farmer deactivated" });
    } catch (err) {
      console.error("Delete farmer error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// POST /api/farmers/bulk-delete  — Officer: bulk soft-delete
// ─────────────────────────────────────────────────────────
router.post(
  "/bulk-delete",
  authenticate,
  authorize("Officer"),
  async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      const { farmerIDs } = req.body;
      if (!farmerIDs || !Array.isArray(farmerIDs) || farmerIDs.length === 0) {
        await t.rollback();
        return res.status(400).json({ message: "farmerIDs array is required" });
      }

      const coop = await getOfficerCoop(req.user.userID);
      if (!coop) {
        await t.rollback();
        return res.status(404).json({ message: "Cooperative not found" });
      }

      // Verify all farmers belong to this coop
      const memberships = await db.FarmerCooperative.findAll({
        where: { farmerID: farmerIDs, primaryCoopID: coop.primaryCoopID },
        transaction: t,
      });
      const validIDs = memberships.map((m) => m.farmerID);

      if (validIDs.length === 0) {
        await t.rollback();
        return res.status(403).json({ message: "None of the farmers belong to your cooperative" });
      }

      // Get userIDs for these farmers
      const farmers = await db.Farmer.findAll({
        where: { farmerID: validIDs },
        attributes: ["farmerID", "userID"],
        transaction: t,
      });
      const userIDs = farmers.map((f) => f.userID);

      await db.Farmer.update({ isDeleted: true }, { where: { farmerID: validIDs }, transaction: t });
      await db.User.update({ isDeleted: true }, { where: { userID: userIDs }, transaction: t });

      await t.commit();
      res.json({ message: `${validIDs.length} farmer(s) deactivated` });
    } catch (err) {
      await t.rollback();
      console.error("Bulk delete error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// GET /api/farmers/crop-types  — Any auth: list crop types
// ─────────────────────────────────────────────────────────
router.get(
  "/crop-types",
  authenticate,
  async (_req, res) => {
    try {
      const cropTypes = await db.CropType.findAll({
        order: [["cropName", "ASC"]],
      });
      res.json({ cropTypes });
    } catch (err) {
      console.error("Crop types error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
