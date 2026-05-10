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
      return res
        .status(400)
        .json({
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
      return res
        .status(400)
        .json({
          message: "Federation commission rate must be between 0 and 1",
        });
    }
    if (!Number.isFinite(coopRate) || coopRate < 0 || coopRate > 1) {
      return res
        .status(400)
        .json({
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
      return res
        .status(400)
        .json({
          message: "Federation commission rate must be between 0 and 1",
        });
    }
    if (!Number.isFinite(coopRate) || coopRate < 0 || coopRate > 1) {
      return res
        .status(400)
        .json({
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
    const t = await db.sequelize.transaction();
    try {
      const delivery = await db.DeliveryRecord.findByPk(req.params.id, {
        transaction: t,
      });
      if (!delivery) {
        await t.rollback();
        return res.status(404).json({ message: "Delivery not found" });
      }
      if (delivery.status !== "pending") {
        await t.rollback();
        return res
          .status(409)
          .json({ message: "Delivery is not in pending status" });
      }

      const { deliveryDate } = req.body;
      if (!deliveryDate) {
        await t.rollback();
        return res.status(400).json({ message: "Delivery date is required" });
      }

      // 1. Update delivery status
      await db.DeliveryRecord.update(
        { status: "delivered", deliveryDate },
        { where: { deliveryID: delivery.deliveryID }, transaction: t },
      );

      // 2. Resolve fulfilling farmers from the order chain
      const assignments = await db.CoopAssignment.findAll({
        where: { orderID: delivery.orderID },
        include: [
          {
            model: db.FarmerFulfillment,
            where: { status: ["confirmed", "ready"] },
            required: false,
            include: [{ model: db.Farmer, attributes: ["farmerID"] }],
          },
        ],
        transaction: t,
      });

      // Collect all fulfillments with their cooperative context
      const fulfillments = [];
      for (const assignment of assignments) {
        for (const ff of assignment.FarmerFulfillments || []) {
          fulfillments.push({
            farmerID: ff.farmerID,
            quantityCommitted: ff.quantityCommitted,
            primaryCoopID: assignment.primaryCoopID,
          });
        }
      }

      let salesRecordsCreated = 0;
      let feeRecordsCreated = 0;

      if (fulfillments.length > 0) {
        // 3. Calculate proportional amounts
        const totalQuantity = fulfillments.reduce(
          (s, f) => s + f.quantityCommitted,
          0,
        );
        const T = parseFloat(delivery.totalTransactionAmount);
        const RF = parseFloat(delivery.commissionRateFederation);
        const RC = parseFloat(delivery.commissionRateCoop);

        for (const ff of fulfillments) {
          const proportion = ff.quantityCommitted / totalQuantity;
          const grossAmount = parseFloat((proportion * T).toFixed(2));
          const federationFee = parseFloat((grossAmount * RF).toFixed(2));
          const coopFee = parseFloat((grossAmount * RC).toFixed(2));
          const commissionAmount = parseFloat(
            (federationFee + coopFee).toFixed(2),
          );
          const netAmount = parseFloat(
            (grossAmount - commissionAmount).toFixed(2),
          );

          // 4. Find or create FarmerAccount
          let farmerAccount = await db.FarmerAccount.findOne({
            where: { farmerID: ff.farmerID, primaryCoopID: ff.primaryCoopID },
            transaction: t,
          });
          if (!farmerAccount) {
            farmerAccount = await db.FarmerAccount.create(
              {
                farmerID: ff.farmerID,
                primaryCoopID: ff.primaryCoopID,
                createdDate: new Date(),
                status: "active",
              },
              { transaction: t },
            );
          }

          // 5. Create SalesRecord
          const salesRecord = await db.SalesRecord.create(
            {
              farmerAccountID: farmerAccount.farmerAccountID,
              deliveryID: delivery.deliveryID,
              grossAmount,
              commissionAmount,
              netAmount,
              transactionDate: deliveryDate,
              remarks: `Auto-generated from delivery DEL-${delivery.deliveryID}`,
            },
            { transaction: t },
          );
          salesRecordsCreated++;

          // 6. Create 4 FeeRecords
          const feeTypes = [
            { feeType: "federationFee", rate: RF, amount: federationFee },
            { feeType: "coopFee", rate: RC, amount: coopFee },
            { feeType: "capitalContribution", rate: 0, amount: 0 },
            { feeType: "capitalRetention", rate: 0, amount: 0 },
          ];

          for (const fee of feeTypes) {
            await db.FeeRecord.create(
              {
                farmerAccountID: farmerAccount.farmerAccountID,
                salesRecordID: salesRecord.salesRecordID,
                feeType: fee.feeType,
                rate: fee.rate,
                amount: fee.amount,
                status: "recorded",
              },
              { transaction: t },
            );
            feeRecordsCreated++;
          }
        }
      }

      // 7. Sync BuyerOrder status
      const allDeliveries = await db.DeliveryRecord.findAll({
        where: { orderID: delivery.orderID },
        transaction: t,
      });
      const allDelivered = allDeliveries.every((d) =>
        d.deliveryID === delivery.deliveryID ? true : d.status === "delivered",
      );
      if (allDelivered) {
        await db.BuyerOrder.update(
          { status: "completed" },
          { where: { orderID: delivery.orderID }, transaction: t },
        );
      }

      await t.commit();

      res.json({
        message: `Delivery completed. Generated ${salesRecordsCreated} sales records and ${feeRecordsCreated} fee records.`,
        salesRecordsCreated,
        feeRecordsCreated,
      });
    } catch (err) {
      await t.rollback();
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
