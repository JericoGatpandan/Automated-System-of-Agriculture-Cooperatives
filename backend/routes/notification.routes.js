import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

const router = Router();

/**
 * GET /api/notifications
 * Fetches notifications for the logged in user based on their role and ID.
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const { role } = req.user;
    
    // Base where clause matches the recipientRole
    const whereClause = {
      recipientRole: role,
      isRead: false
    };

    // If Officer, resolve their primaryCoopID via PrimaryCooperatives table
    if (role === "Officer") {
      const coop = await db.PrimaryCooperative.findOne({
        where: { userID: req.user.userID, isDeleted: false },
        attributes: ["primaryCoopID"],
      });
      if (coop) {
        whereClause.recipientID = coop.primaryCoopID;
      } else {
        return res.json([]);
      }
    }

    // If Farmer, match recipientID to their farmerID
    if (role === "Farmer") {
      const farmer = await db.Farmer.findOne({
        where: { userID: req.user.userID, isDeleted: false },
        attributes: ["farmerID"],
      });
      if (farmer) {
        whereClause.recipientID = farmer.farmerID;
      } else {
        return res.json([]);
      }
    }

    const notifications = await db.Notification.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: 50 // Keep payload light
    });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to load notifications." });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Marks a specific notification as read.
 */
router.put("/:id/read", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await db.Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Marked as read", notification });
  } catch (error) {
    console.error("Error marking notification read:", error);
    res.status(500).json({ message: "Failed to update notification." });
  }
});

export default router;
