import jwt from "jsonwebtoken";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

const { JWT_SECRET } = process.env;

// Role name mapping: DB → Frontend
const ROLE_MAP = {
  "FACCS Admin": "Admin",
  "Coop Officer": "Officer",
  Farmer: "Farmer",
};

/**
 * Verify JWT and attach user to request.
 * Sets req.user = { userID, email, role (frontend name), roleID }
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB to ensure they still exist and aren't deleted
    const user = await db.User.findOne({
      where: { userID: decoded.id, isDeleted: false },
      include: [{ model: db.Role, attributes: ["roleName"] }],
    });

    if (!user) {
      return res.status(401).json({ message: "User not found or deactivated" });
    }

    req.user = {
      userID: user.userID,
      email: user.email,
      roleID: user.roleID,
      role: ROLE_MAP[user.Role.roleName] || user.Role.roleName,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * Authorize by role. Uses frontend role names (Admin, Officer, Farmer).
 * Usage: authorize("Admin") or authorize("Admin", "Officer")
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}
