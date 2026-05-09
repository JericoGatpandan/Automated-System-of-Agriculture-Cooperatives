import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createRequire } from "node:module";
import { authenticate } from "../middleware/auth.middleware.js";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

const router = Router();

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

// Role name mapping: DB → Frontend
const ROLE_MAP = {
  "FACCS Admin": "Admin",
  "Coop Officer": "Officer",
  Farmer: "Farmer",
};

/**
 * POST /api/auth/login
 * Authenticate against Users table with bcryptjs.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await db.User.findOne({
      where: { email, isDeleted: false },
      include: [{ model: db.Role, attributes: ["roleName"] }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const role = ROLE_MAP[user.Role.roleName] || user.Role.roleName;

    const token = jwt.sign({ id: user.userID, role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN || "1d",
    });

    res.json({
      token,
      user: {
        id: user.userID,
        email: user.email,
        role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/auth/me
 * Return the current authenticated user from DB.
 */
router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.userID,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
