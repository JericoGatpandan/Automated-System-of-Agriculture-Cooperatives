import { Router } from "express";
import { createRequire } from "node:module";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

const router = Router();

// ─────────────────────────────────────────────────────────
// GET /api/deliveries  — Admin: list all deliveries
// ─────────────────────────────────────────────────────────
router.get("/", authenticate, authorize("Admin"), async (_req, res) => {
  try {
    const deliveries = await db.DeliveryRecord.findAll({
      include: [
        {
          model: db.BuyerOrder,
          attributes: ["orderID", "buyerName", "buyerCompany"],
        },
      ],
      order: [["consolidationDate", "DESC"]],
    });
    res.json({ deliveries });
  } catch (err) {
    console.error("Delivery list error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/deliveries/:id  — Admin: delivery detail + sales records
// ─────────────────────────────────────────────────────────
router.get("/:id", authenticate, authorize("Admin"), async (req, res) => {
  try {
    const delivery = await db.DeliveryRecord.findByPk(req.params.id, {
      include: [
        {
          model: db.BuyerOrder,
          attributes: [
            "orderID",
            "buyerName",
            "buyerCompany",
            "buyerContact",
            "cropTypeID",
            "requestedQuantity",
            "status",
          ],
          include: [{ model: db.CropType, attributes: ["cropName"] }],
        },
        {
          model: db.SalesRecord,
          include: [
            {
              model: db.FarmerAccount,
              include: [
                {
                  model: db.Farmer,
                  attributes: ["farmerID", "firstName", "lastName"],
                },
                { model: db.PrimaryCooperative, attributes: ["coopName"] },
              ],
            },
          ],
        },
      ],
    });
    if (!delivery)
      return res.status(404).json({ message: "Delivery not found" });
    res.json({ delivery });
  } catch (err) {
    console.error("Delivery detail error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/deliveries  — Admin: create delivery record
// ─────────────────────────────────────────────────────────
router.post("/", authenticate, authorize("Admin"), async (req, res) => {
  try {
    const {
      orderID,
      consolidationDate,
      totalTransactionAmount,
      commissionRateFederation,
      commissionRateCoop,
      notes,
    } = req.body;

    if (
      !orderID ||
      !consolidationDate ||
      totalTransactionAmount === undefined
    ) {
      return res.status(400).json({
        message: "Order, consolidation date, and amount are required",
      });
    }

    const amountValue = Number(totalTransactionAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return res
        .status(400)
        .json({ message: "Total transaction amount must be greater than 0" });
    }

    const federationRate =
      commissionRateFederation !== undefined
        ? Number(commissionRateFederation)
        : 0.03;
    const coopRate =
      commissionRateCoop !== undefined ? Number(commissionRateCoop) : 0.05;
    if (
      !Number.isFinite(federationRate) ||
      federationRate < 0 ||
      federationRate > 1
    ) {
      return res.status(400).json({
        message: "Federation commission rate must be between 0 and 1",
      });
    }
    if (!Number.isFinite(coopRate) || coopRate < 0 || coopRate > 1) {
      return res.status(400).json({
        message: "Cooperative commission rate must be between 0 and 1",
      });
    }

    const order = await db.BuyerOrder.findByPk(orderID);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!["consolidated", "inProgress"].includes(order.status)) {
      return res
        .status(409)
        .json({ message: "Order status is not eligible for delivery" });
    }

    const delivery = await db.DeliveryRecord.create({
      orderID,
      managedBy: req.user.userID,
      consolidationDate,
      deliveryDate: null,
      totalTransactionAmount: amountValue,
      commissionRateFederation: federationRate,
      commissionRateCoop: coopRate,
      status: "pending",
      notes: notes || null,
    });

    res.status(201).json({ message: "Delivery created", delivery });
  } catch (err) {
    console.error("Create delivery error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/deliveries/:id  — Admin: update delivery fields
// ─────────────────────────────────────────────────────────
router.put("/:id", authenticate, authorize("Admin"), async (req, res) => {
  try {
    const delivery = await db.DeliveryRecord.findByPk(req.params.id);
    if (!delivery)
      return res.status(404).json({ message: "Delivery not found" });

    const {
      orderID,
      consolidationDate,
      totalTransactionAmount,
      commissionRateFederation,
      commissionRateCoop,
      notes,
    } = req.body;

    const nextOrderID = orderID ?? delivery.orderID;
    if (orderID !== undefined) {
      const order = await db.BuyerOrder.findByPk(nextOrderID);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (!["consolidated", "inProgress"].includes(order.status)) {
        return res
          .status(409)
          .json({ message: "Order status is not eligible for delivery" });
      }
    }

    const amountValue =
      totalTransactionAmount !== undefined
        ? Number(totalTransactionAmount)
        : Number(delivery.totalTransactionAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return res
        .status(400)
        .json({ message: "Total transaction amount must be greater than 0" });
    }

    const federationRate =
      commissionRateFederation !== undefined
        ? Number(commissionRateFederation)
        : Number(delivery.commissionRateFederation);
    const coopRate =
      commissionRateCoop !== undefined
        ? Number(commissionRateCoop)
        : Number(delivery.commissionRateCoop);
    if (
      !Number.isFinite(federationRate) ||
      federationRate < 0 ||
      federationRate > 1
    ) {
      return res.status(400).json({
        message: "Federation commission rate must be between 0 and 1",
      });
    }
    if (!Number.isFinite(coopRate) || coopRate < 0 || coopRate > 1) {
      return res.status(400).json({
        message: "Cooperative commission rate must be between 0 and 1",
      });
    }

    await db.DeliveryRecord.update(
      {
        orderID: nextOrderID,
        consolidationDate: consolidationDate ?? delivery.consolidationDate,
        totalTransactionAmount: amountValue,
        commissionRateFederation: federationRate,
        commissionRateCoop: coopRate,
        notes: notes !== undefined ? notes : delivery.notes,
      },
      { where: { deliveryID: req.params.id } },
    );

    res.json({ message: "Delivery updated" });
  } catch (err) {
    console.error("Update delivery error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────────────────
// PUT /api/deliveries/:id/deliver  — THE KEY ENDPOINT
// Mark as delivered → generate SalesRecords + FeeRecords
// ─────────────────────────────────────────────────────────
router.put(
  "/:id/deliver",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    try {
      const delivery = await db.DeliveryRecord.findByPk(req.params.id);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      if (delivery.status !== "pending") {
        return res
          .status(409)
          .json({ message: "Delivery is not in pending status" });
      }

      const { deliveryDate } = req.body;
      if (!deliveryDate) {
        return res.status(400).json({ message: "Delivery date is required" });
      }
      await db.DeliveryRecord.update(
        { deliveryDate },
        { where: { deliveryID: delivery.deliveryID } },
      );

      await db.sequelize.query("CALL sp_complete_delivery_v2(:deliveryID);", {
        replacements: { deliveryID: delivery.deliveryID },
      });

      res.json({
        message: "Delivery completed. Sales and fee records generated.",
      });
    } catch (err) {
      console.error("Deliver error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// ─────────────────────────────────────────────────────────
// PUT /api/deliveries/:id/cancel  — Admin: cancel delivery
// ─────────────────────────────────────────────────────────
router.put(
  "/:id/cancel",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    try {
      const delivery = await db.DeliveryRecord.findByPk(req.params.id);
      if (!delivery)
        return res.status(404).json({ message: "Delivery not found" });
      if (delivery.status !== "pending") {
        return res
          .status(409)
          .json({ message: "Only pending deliveries can be cancelled" });
      }

      await db.DeliveryRecord.update(
        { status: "cancelled" },
        { where: { deliveryID: req.params.id } },
      );

      res.json({ message: "Delivery cancelled" });
    } catch (err) {
      console.error("Cancel delivery error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default router;
