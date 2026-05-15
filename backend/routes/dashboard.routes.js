import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

const router = Router();

/**
 * GET /api/dashboard/admin
 * Admin Dashboard - Returns overall stats from vw_admin_dashboard_stats
 * and the 5 most recent BuyerOrders.
 */
router.get("/admin", authenticate, authorize(["Admin"]), async (req, res) => {
  try {
    const statsResult = await db.sequelize.query(
      "SELECT * FROM vw_admin_dashboard_stats LIMIT 1",
      { type: db.sequelize.QueryTypes.SELECT }
    );
    
    const stats = statsResult[0] || {
      totalCooperatives: 0,
      totalFarmers: 0,
      pendingOrders: 0,
      totalSalesVolume: 0
    };

    const recentOrders = await db.BuyerOrder.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        { model: db.CropType, attributes: ["cropName"] }
      ]
    });

    res.json({
      stats,
      recentActivity: recentOrders
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ message: "Failed to load dashboard data." });
  }
});

/**
 * GET /api/dashboard/coop/:id
 * Coop Dashboard - Returns stats for specific coop from vw_coop_dashboard_stats
 * and the 5 most recent CoopAssignments.
 */
router.get("/coop/:id", authenticate, authorize(["Admin", "Officer"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const statsResult = await db.sequelize.query(
      "SELECT * FROM vw_coop_dashboard_stats WHERE primaryCoopID = :id LIMIT 1",
      { 
        replacements: { id },
        type: db.sequelize.QueryTypes.SELECT 
      }
    );

    const stats = statsResult[0] || {
      primaryCoopID: id,
      coopName: "Unknown Cooperative",
      activeFarmers: 0,
      pendingAssignments: 0,
      totalLoansOut: 0,
      totalCoopSales: 0
    };

    const recentAssignments = await db.CoopAssignment.findAll({
      where: { primaryCoopID: id },
      limit: 5,
      order: [["assignedDate", "DESC"]],
      include: [
        { 
          model: db.BuyerOrder, 
          attributes: ["buyerCompany", "requestedQuantity", "urgencyLevel", "status"],
          include: [{ model: db.CropType, attributes: ["cropName"] }]
        }
      ]
    });

    res.json({
      stats,
      recentActivity: recentAssignments
    });
  } catch (error) {
    console.error("Error fetching coop dashboard:", error);
    res.status(500).json({ message: "Failed to load dashboard data." });
  }
});

export default router;
