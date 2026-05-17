import { Router } from "express";
import { createRequire } from "node:module";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

const router = Router();

// ─────────────────────────────────────────────────────────
// GET /api/orders  — Admin: list all buyer orders
// ─────────────────────────────────────────────────────────
router.get(
  "/",
  authenticate,
  authorize("Admin"),
  async (_req, res) => {
    try {
      const orders = await db.BuyerOrder.findAll({
        include: [{ model: db.CropType, attributes: ["cropName", "category"] }],
        order: [["orderDate", "DESC"]],
      });
      res.json({ orders });
    } catch (err) {
      console.error("Order list error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// GET /api/orders/:id/available-coops  — Admin: cooperatives with inventory context
// ─────────────────────────────────────────────────────────
router.get(
  "/:id/available-coops",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    try {
      const order = await db.BuyerOrder.findByPk(req.params.id, {
        include: [{ model: db.CropType, attributes: ["cropTypeID", "cropName", "category"] }],
      });
      if (!order) return res.status(404).json({ message: "Order not found" });

      const cropTypeID = order.cropTypeID;

      // Get all active cooperatives
      const cooperatives = await db.PrimaryCooperative.findAll({
        where: { isDeleted: false },
        attributes: ["primaryCoopID", "coopName"],
        order: [["coopName", "ASC"]],
      });

      // For each cooperative, aggregate product availability for the matching cropTypeID
      const result = await Promise.all(
        cooperatives.map(async (coop) => {
          // Find farmers in this coop
          const farmerCoops = await db.FarmerCooperative.findAll({
            where: { primaryCoopID: coop.primaryCoopID, status: "active" },
            attributes: ["farmerID"],
            include: [
              {
                model: db.Farmer,
                attributes: ["farmerID"],
                where: { isDeleted: false },
                required: true,
                include: [
                  {
                    model: db.Product,
                    where: { cropTypeID, isDeleted: false },
                    attributes: ["availableQuantity"],
                    required: false,
                  },
                ],
              },
            ],
          });

          let totalAvailableQuantity = 0;
          let farmerCount = 0;

          for (const fc of farmerCoops) {
            const products = fc.Farmer?.Products || [];
            if (products.length > 0) {
              farmerCount++;
              totalAvailableQuantity += products.reduce(
                (sum, p) => sum + (parseFloat(p.availableQuantity) || 0),
                0
              );
            }
          }

          return {
            primaryCoopID: coop.primaryCoopID,
            coopName: coop.coopName,
            hasCrop: farmerCount > 0,
            totalAvailableQuantity,
            farmerCount,
          };
        })
      );

      // Sort: cooperatives with matching crop first (by available quantity desc), then without
      result.sort((a, b) => {
        if (a.hasCrop && !b.hasCrop) return -1;
        if (!a.hasCrop && b.hasCrop) return 1;
        return b.totalAvailableQuantity - a.totalAvailableQuantity;
      });

      res.json({
        cropType: order.CropType,
        cooperatives: result,
      });
    } catch (err) {
      console.error("Available coops error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// GET /api/orders/:id  — Admin: order detail with assignments
// ─────────────────────────────────────────────────────────
router.get(
  "/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    try {
      const order = await db.BuyerOrder.findByPk(req.params.id, {
        include: [
          { model: db.CropType, attributes: ["cropTypeID", "cropName", "category"] },
          {
            model: db.CoopAssignment,
            include: [
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
          },
        ],
      });
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json({ order });
    } catch (err) {
      console.error("Order detail error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// POST /api/orders  — Admin: create buyer order
// ─────────────────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    try {
      const { buyerName, buyerCompany, buyerContact, cropTypeID, requestedQuantity, urgencyLevel, orderDate, notes } = req.body;

      if (!buyerName || !buyerContact || !cropTypeID || !requestedQuantity || !urgencyLevel || !orderDate) {
        return res.status(400).json({ message: "Buyer name, contact, crop type, quantity, urgency, and date are required" });
      }

      const order = await db.BuyerOrder.create({
        managedBy: req.user.userID,
        buyerName,
        buyerCompany: buyerCompany || null,
        buyerContact,
        cropTypeID,
        requestedQuantity,
        urgencyLevel,
        orderDate,
        status: "pending",
        notes: notes || null,
      });

      res.status(201).json({ message: "Order created", order });
    } catch (err) {
      console.error("Create order error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// PUT /api/orders/:id  — Admin: update order
// ─────────────────────────────────────────────────────────
router.put(
  "/:id",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    try {
      const order = await db.BuyerOrder.findByPk(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const { buyerName, buyerCompany, buyerContact, cropTypeID, requestedQuantity, urgencyLevel, orderDate, notes } = req.body;

      await db.BuyerOrder.update(
        {
          buyerName: buyerName || order.buyerName,
          buyerCompany: buyerCompany !== undefined ? buyerCompany : order.buyerCompany,
          buyerContact: buyerContact || order.buyerContact,
          cropTypeID: cropTypeID || order.cropTypeID,
          requestedQuantity: requestedQuantity || order.requestedQuantity,
          urgencyLevel: urgencyLevel || order.urgencyLevel,
          orderDate: orderDate || order.orderDate,
          notes: notes !== undefined ? notes : order.notes,
        },
        { where: { orderID: req.params.id } }
      );

      res.json({ message: "Order updated" });
    } catch (err) {
      console.error("Update order error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ─────────────────────────────────────────────────────────
// PUT /api/orders/:id/cancel  — Admin: cancel order
// ─────────────────────────────────────────────────────────
router.put(
  "/:id/cancel",
  authenticate,
  authorize("Admin"),
  async (req, res) => {
    try {
      const order = await db.BuyerOrder.findByPk(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      await db.BuyerOrder.update(
        { status: "cancelled" },
        { where: { orderID: req.params.id } }
      );

      res.json({ message: "Order cancelled" });
    } catch (err) {
      console.error("Cancel order error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
