import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "node:path";

import { PORT } from "./config/env.config.js";

// Load env vars before anything else
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

import authRoutes from "./routes/auth.routes.js";
import cooperativeRoutes from "./routes/cooperative.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import farmerRoutes from "./routes/farmer.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import ledgerRoutes from "./routes/ledger.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();
const port = PORT || 8800;
const uploadsDir = path.resolve(process.cwd(), "uploads");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));

// ── Route Mounting ──
app.use("/api/auth", authRoutes);
app.use("/api/cooperatives", cooperativeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("ASAC System Backend is running!");
});

// ── Health Check ──
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "Image file is too large" });
  }

  if (err?.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }

  console.error("Unhandled server error:", err);
  return res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`API Server running at http://localhost:${port}`);
});
