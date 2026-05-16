import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

const router = Router();

/**
 * POST /api/requests
 * Public endpoint to submit a new partnership inquiry.
 */
router.post("/", async (req, res) => {
  try {
    const { coopName, contactPerson, email, phone, message } = req.body;

    if (!coopName || !contactPerson || !email || !phone) {
      return res.status(400).json({ message: "Please fill out all required fields." });
    }

    const newRequest = await db.PartnershipRequest.create({
      coopName,
      contactPerson,
      email,
      phone,
      message,
      status: "pending"
    });

    res.status(201).json({ message: "Inquiry sent successfully", request: newRequest });
  } catch (error) {
    console.error("Error submitting request:", error);
    res.status(500).json({ message: "Failed to submit request." });
  }
});

/**
 * GET /api/requests
 * Protected endpoint for Admin to view incoming inquiries.
 */
router.get("/", authenticate, authorize("Admin"), async (req, res) => {
  try {
    const requests = await db.PartnershipRequest.findAll({
      order: [["createdAt", "DESC"]]
    });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Failed to fetch requests." });
  }
});

/**
 * PUT /api/requests/:id/status
 * Protected endpoint for Admin to update inquiry status.
 */
router.put("/:id/status", authenticate, authorize("Admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const request = await db.PartnershipRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ message: "Failed to update request." });
  }
});

export default router;
