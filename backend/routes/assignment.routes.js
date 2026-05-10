import { Router } from "express";
import { createRequire } from "node:module";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

const router = Router();

// ── Helpers ──

async function getOfficerCoop(userID) {
  return db.PrimaryCooperative.findOne({ where: { userID, isDeleted: false } });
}

/** Update order status based on current assignments/fulfillments */
async function syncOrderStatus(orderID) {
  const assignments = await db.CoopAssignment.findAll({
    where: { orderID },
    include: [{ model: db.FarmerFulfillment }],
  });

  if (assignments.length === 0) {
    await db.BuyerOrder.update({ status: "pending" }, { where: { orderID } });
    return;
  }

  const allFulfillments = assignments.flatMap((a) => a.FarmerFulfillments || []);

  if (allFulfillments.length === 0) {
    await db.BuyerOrder.update({ status: "assigned" }, { where: { orderID } });
    return;
  }

  const allReady = allFulfillments.length > 0 && allFulfillments.every((f) => f.status === "ready");
  if (allReady) {
    await db.BuyerOrder.update({ status: "consolidated" }, { where: { orderID } });
  } else {
    await db.BuyerOrder.update({ status: "inProgress" }, { where: { orderID } });
  }
}

/** Update assignment status based on its fulfillments */
async function syncAssignmentStatus(assignmentID) {
  const fulfillments = await db.FarmerFulfillment.findAll({ where: { assignmentID } });

  if (fulfillments.length === 0) {
    await db.CoopAssignment.update({ status: "pending" }, { where: { assignmentID } });
    return;
  }

  const allReadyOrConfirmed = fulfillments.every((f) => f.status === "ready" || f.status === "confirmed");
  if (allReadyOrConfirmed) {
    await db.CoopAssignment.update({ status: "ready" }, { where: { assignmentID } });
  } else {
    await db.CoopAssignment.update({ status: "matched" }, { where: { assignmentID } });
  }
}

// ─────────────────────────────────────────────────────────
// GET /api/assignments/my-coop  — Officer: list own coop assignments
// ─────────────────────────────────────────────────────────
router.get(
  "/my-coop",
  authenticate,
  authorize("Officer"),
  async (req, res) => {
    try {
      const coop = await getOfficerCoop(req.user.userID);
      if (!coop) return res.status(404).json({ message: "Cooperative not found" });

      const assignments = await db.CoopAssignment.findAll({
        where: { primaryCoopID: coop.primaryCoopID },
        include: [
          {
            model: db.BuyerOrder,
            include: [{ model: db.CropType, attributes: ["cropName"] }],
          },
        ],
        order: [["assignedDate", "DESC"]],
      });

      res.json({ assignments });
    } catch (err) {
      console.error("Officer assignments error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// GET /api/assignments/:id  — Officer/Admin: assignment detail
// ─────────────────────────────────────────────────────────
router.get(
  "/:id",
  authenticate,
  authorize("Officer", "Admin"),
  async (req, res) => {
    try {
      const assignment = await db.CoopAssignment.findByPk(req.params.id, {
        include: [
          {
            model: db.BuyerOrder,
            include: [{ model: db.CropType, attributes: ["cropTypeID", "cropName", "category"] }],
          },
          { model: db.PrimaryCooperative, attributes: ["primaryCoopID", "coopName"] },
          {
            model: db.FarmerFulfillment,
            include: [
              {
                model: db.Farmer,
                attributes: ["farmerID", "firstName", "lastName", "farmName"],
              },
            ],
          },
        ],
      });

      if (!assignment) return res.status(404).json({ message: "Assignment not found" });

      // Officer scope check
      if (req.user.role === "Officer") {
        const coop = await getOfficerCoop(req.user.userID);
        if (!coop || assignment.primaryCoopID !== coop.primaryCoopID) {
          return res.status(403).json({ message: "Assignment not in your cooperative" });
        }
      }

      res.json({ assignment });
    } catch (err) {
      console.error("Assignment detail error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// POST /api/assignments  — Admin: create assignment for an order
// ─────────────────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    try {
      const { orderID, primaryCoopID, quantityRequired } = req.body;

      if (!orderID || !primaryCoopID || !quantityRequired) {
        return res.status(400).json({ message: "Order ID, cooperative, and quantity are required" });
      }

      const order = await db.BuyerOrder.findByPk(orderID);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const coop = await db.PrimaryCooperative.findByPk(primaryCoopID);
      if (!coop || coop.isDeleted) return res.status(404).json({ message: "Cooperative not found" });

      const assignment = await db.CoopAssignment.create({
        orderID,
        primaryCoopID,
        assignedBy: req.user.userID,
        assignedDate: new Date(),
        quantityRequired,
        status: "pending",
      });

      await syncOrderStatus(orderID);

      res.status(201).json({ message: "Cooperative assigned", assignment });
    } catch (err) {
      console.error("Create assignment error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// DELETE /api/assignments/:id  — Admin: remove assignment
// ─────────────────────────────────────────────────────────
router.delete(
  "/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    try {
      const assignment = await db.CoopAssignment.findByPk(req.params.id);
      if (!assignment) return res.status(404).json({ message: "Assignment not found" });

      // Block if fulfillments exist
      const fulfillmentCount = await db.FarmerFulfillment.count({ where: { assignmentID: assignment.assignmentID } });
      if (fulfillmentCount > 0) {
        return res.status(409).json({ message: "Cannot remove assignment with existing farmer fulfillments" });
      }

      const orderID = assignment.orderID;
      await db.CoopAssignment.destroy({ where: { assignmentID: assignment.assignmentID } });
      await syncOrderStatus(orderID);

      res.json({ message: "Assignment removed" });
    } catch (err) {
      console.error("Delete assignment error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// POST /api/assignments/:id/fulfillments  — Officer: assign farmer
// ─────────────────────────────────────────────────────────
router.post(
  "/:id/fulfillments",
  authenticate,
  authorize("Officer"),
  async (req, res) => {
    try {
      const assignment = await db.CoopAssignment.findByPk(req.params.id);
      if (!assignment) return res.status(404).json({ message: "Assignment not found" });

      // Scope check
      const coop = await getOfficerCoop(req.user.userID);
      if (!coop || assignment.primaryCoopID !== coop.primaryCoopID) {
        return res.status(403).json({ message: "Assignment not in your cooperative" });
      }

      const { farmerID, quantityCommitted, notes } = req.body;
      if (!farmerID || !quantityCommitted) {
        return res.status(400).json({ message: "Farmer and quantity are required" });
      }

      const fulfillment = await db.FarmerFulfillment.create({
        assignmentID: assignment.assignmentID,
        farmerID,
        assignedBy: req.user.userID,
        quantityCommitted,
        status: "assigned",
        notes: notes || null,
      });

      await syncAssignmentStatus(assignment.assignmentID);
      await syncOrderStatus(assignment.orderID);

      res.status(201).json({ message: "Farmer assigned", fulfillment });
    } catch (err) {
      console.error("Create fulfillment error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// PUT /api/assignments/:assignmentId/fulfillments/:fulfillmentId
// Officer: update fulfillment status/notes
// ─────────────────────────────────────────────────────────
router.put(
  "/:assignmentId/fulfillments/:fulfillmentId",
  authenticate,
  authorize("Officer"),
  async (req, res) => {
    try {
      const fulfillment = await db.FarmerFulfillment.findByPk(req.params.fulfillmentId);
      if (!fulfillment || fulfillment.assignmentID !== parseInt(req.params.assignmentId)) {
        return res.status(404).json({ message: "Fulfillment not found" });
      }

      // Scope check
      const assignment = await db.CoopAssignment.findByPk(fulfillment.assignmentID);
      const coop = await getOfficerCoop(req.user.userID);
      if (!coop || assignment.primaryCoopID !== coop.primaryCoopID) {
        return res.status(403).json({ message: "Not in your cooperative" });
      }

      const { status, notes } = req.body;
      const updateData = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      await db.FarmerFulfillment.update(updateData, { where: { fulfillmentID: fulfillment.fulfillmentID } });

      await syncAssignmentStatus(assignment.assignmentID);
      await syncOrderStatus(assignment.orderID);

      res.json({ message: "Fulfillment updated" });
    } catch (err) {
      console.error("Update fulfillment error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// DELETE /api/assignments/:assignmentId/fulfillments/:fulfillmentId
// Officer: remove fulfillment (only if status=assigned)
// ─────────────────────────────────────────────────────────
router.delete(
  "/:assignmentId/fulfillments/:fulfillmentId",
  authenticate,
  authorize("Officer"),
  async (req, res) => {
    try {
      const fulfillment = await db.FarmerFulfillment.findByPk(req.params.fulfillmentId);
      if (!fulfillment || fulfillment.assignmentID !== parseInt(req.params.assignmentId)) {
        return res.status(404).json({ message: "Fulfillment not found" });
      }

      if (fulfillment.status !== "assigned") {
        return res.status(409).json({ message: "Can only remove fulfillments with 'assigned' status" });
      }

      // Scope check
      const assignment = await db.CoopAssignment.findByPk(fulfillment.assignmentID);
      const coop = await getOfficerCoop(req.user.userID);
      if (!coop || assignment.primaryCoopID !== coop.primaryCoopID) {
        return res.status(403).json({ message: "Not in your cooperative" });
      }

      await db.FarmerFulfillment.destroy({ where: { fulfillmentID: fulfillment.fulfillmentID } });

      await syncAssignmentStatus(assignment.assignmentID);
      await syncOrderStatus(assignment.orderID);

      res.json({ message: "Fulfillment removed" });
    } catch (err) {
      console.error("Delete fulfillment error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
