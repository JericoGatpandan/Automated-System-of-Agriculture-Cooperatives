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

    // If Officer, they also need to match their specific primaryCoopID
    if (role === "Officer") {
      // Fetch the user's primaryCoopID first
      const user = await db.User.findByPk(req.user.userID);
      if (user && user.primaryCoopID) {
        whereClause.recipientID = user.primaryCoopID;
      } else {
        // If they don't have a coop ID, they have no notifications
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
