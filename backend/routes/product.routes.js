import { Router } from "express";
import { createRequire } from "node:module";
import fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");
const { Op } = db.Sequelize;
const uploadDir = path.resolve(process.cwd(), "uploads", "products");
const publicImagePrefix = "/uploads/products";

const imageStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      callback(null, uploadDir);
    } catch (error) {
      callback(error, uploadDir);
    }
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image files are allowed"));
      return;
    }
    callback(null, true);
  },
});

const router = Router();

function getStoredImagePath(file) {
  if (!file) return undefined;
  return `${publicImagePrefix}/${file.filename}`;
}

function isManagedProductImage(imagePathValue) {
  return (
    typeof imagePathValue === "string" &&
    imagePathValue.startsWith(publicImagePrefix)
  );
}

async function deleteStoredImage(imagePathValue) {
  if (!isManagedProductImage(imagePathValue)) return;

  const fileName = path.basename(imagePathValue);
  const absolutePath = path.join(uploadDir, fileName);

  try {
    await fsPromises.unlink(absolutePath);
  } catch {
    // Ignore missing files so delete/update remains idempotent.
  }
}

function getProductIncludes() {
  return [
    {
      model: db.Farmer,
      include: [
        { model: db.User, attributes: ["email"] },
        {
          model: db.FarmerCooperative,
          include: [
            {
              model: db.PrimaryCooperative,
              attributes: ["primaryCoopID", "coopName"],
            },
          ],
        },
      ],
    },
    {
      model: db.CropType,
      attributes: ["cropTypeID", "cropName", "category"],
    },
  ];
}

async function getOfficerCoop(userID) {
  return db.PrimaryCooperative.findOne({
    where: { userID, isDeleted: false },
  });
}

async function getOfficerFarmerIDs(primaryCoopID) {
  const memberships = await db.FarmerCooperative.findAll({
    where: { primaryCoopID, status: "active" },
    attributes: ["farmerID"],
  });
  return memberships.map((membership) => membership.farmerID);
}

function productOrder() {
  return [
    [{ model: db.CropType, as: "CropType" }, "cropName", "ASC"],
    [{ model: db.Farmer, as: "Farmer" }, "lastName", "ASC"],
    [{ model: db.Farmer, as: "Farmer" }, "firstName", "ASC"],
  ];
}

async function listProducts({ where = {}, search = "", availability = "all" }) {
  const products = await db.Product.findAll({
    where: {
      isDeleted: false,
      ...where,
    },
    include: getProductIncludes(),
    order: productOrder(),
  });

  const query = search.trim().toLowerCase();

  return products.filter((product) => {
    const availableQuantity = Number(product.availableQuantity || 0);
    const cropName = product.CropType?.cropName || "";
    const cropCategory = product.CropType?.category || "";
    const farmerName = [product.Farmer?.firstName, product.Farmer?.lastName]
      .filter(Boolean)
      .join(" ");
    const coopName =
      product.Farmer?.FarmerCooperatives?.[0]?.PrimaryCooperative?.coopName ||
      "";
    const grade = product.qualityGrade || "";

    const matchesSearch =
      !query ||
      [cropName, cropCategory, farmerName, coopName, grade]
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesAvailability =
      availability === "all" ||
      (availability === "available" && availableQuantity > 0) ||
      (availability === "empty" && availableQuantity <= 0);

    return matchesSearch && matchesAvailability;
  });
}

// GET /api/products/crop-types — list crop references
router.get(
  "/crop-types",
  authenticate,
  authorize("Admin", "Officer"),
  async (_req, res) => {
    try {
      const cropTypes = await db.CropType.findAll({
        order: [["cropName", "ASC"]],
      });
      res.json({ cropTypes });
    } catch (err) {
      console.error("Crop type list error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// GET /api/products — Admin: browse all products
router.get("/", authenticate, authorize("Admin"), async (req, res) => {
  try {
    const { search = "", availability = "all" } = req.query;
    const products = await listProducts({ search, availability });
    res.json({ products });
  } catch (err) {
    console.error("Admin product list error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/products/my-coop — Officer: browse products in own coop
router.get("/my-coop", authenticate, authorize("Officer"), async (req, res) => {
  try {
    const coop = await getOfficerCoop(req.user.userID);
    if (!coop)
      return res.status(404).json({ message: "Cooperative not found" });

    const farmerIDs = await getOfficerFarmerIDs(coop.primaryCoopID);
    const products = farmerIDs.length
      ? await listProducts({
          where: { farmerID: farmerIDs },
          search: req.query.search || "",
          availability: req.query.availability || "all",
        })
      : [];

    res.json({ products });
  } catch (err) {
    console.error("Officer product list error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/products/:id — Admin or Officer: single product detail
router.get(
  "/:id",
  authenticate,
  authorize("Admin", "Officer"),
  async (req, res) => {
    try {
      const product = await db.Product.findOne({
        where: { productID: req.params.id, isDeleted: false },
        include: getProductIncludes(),
      });

      if (!product)
        return res.status(404).json({ message: "Product not found" });

      if (req.user.role === "Officer") {
        const coop = await getOfficerCoop(req.user.userID);
        if (!coop)
          return res.status(404).json({ message: "Cooperative not found" });

        const farmerIDs = await getOfficerFarmerIDs(coop.primaryCoopID);
        if (!farmerIDs.includes(product.farmerID)) {
          return res
            .status(403)
            .json({ message: "Product not in your cooperative" });
        }
      }

      res.json({ product });
    } catch (err) {
      console.error("Product detail error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// POST /api/products — Officer: create product for a farmer in own coop
router.post(
  "/",
  authenticate,
  authorize("Officer"),
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        farmerID,
        cropTypeID,
        unitPrice,
        availableQuantity,
        qualityGrade,
        imagePath,
      } = req.body;
      const uploadedImagePath = getStoredImagePath(req.file);
      const resolvedImagePath = uploadedImagePath ?? imagePath ?? null;

      if (!farmerID || !cropTypeID) {
        return res
          .status(400)
          .json({ message: "Farmer and crop type are required" });
      }

      const coop = await getOfficerCoop(req.user.userID);
      if (!coop)
        return res.status(404).json({ message: "Cooperative not found" });

      const farmerIDs = await getOfficerFarmerIDs(coop.primaryCoopID);
      if (!farmerIDs.includes(Number(farmerID))) {
        return res
          .status(403)
          .json({ message: "Farmer not in your cooperative" });
      }

      const product = await db.Product.create({
        farmerID: Number(farmerID),
        cropTypeID: Number(cropTypeID),
        unitPrice: unitPrice ?? null,
        availableQuantity: availableQuantity ?? 0,
        qualityGrade: qualityGrade || null,
        imagePath: resolvedImagePath,
        isDeleted: false,
      });

      res
        .status(201)
        .json({ message: "Product created successfully", product });
    } catch (err) {
      console.error("Create product error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// PUT /api/products/:id — Officer: update product in own coop
router.put(
  "/:id",
  authenticate,
  authorize("Officer"),
  upload.single("image"),
  async (req, res) => {
    try {
      const coop = await getOfficerCoop(req.user.userID);
      if (!coop)
        return res.status(404).json({ message: "Cooperative not found" });

      const farmerIDs = await getOfficerFarmerIDs(coop.primaryCoopID);
      const product = await db.Product.findOne({
        where: { productID: req.params.id, isDeleted: false },
      });

      if (!product)
        return res.status(404).json({ message: "Product not found" });
      if (!farmerIDs.includes(product.farmerID)) {
        return res
          .status(403)
          .json({ message: "Product not in your cooperative" });
      }

      const {
        farmerID,
        cropTypeID,
        unitPrice,
        availableQuantity,
        qualityGrade,
        imagePath,
      } = req.body;
      const uploadedImagePath = getStoredImagePath(req.file);
      const nextImagePath = uploadedImagePath ?? imagePath;

      if (farmerID !== undefined && !farmerIDs.includes(Number(farmerID))) {
        return res
          .status(403)
          .json({ message: "Farmer not in your cooperative" });
      }

      const previousImagePath = product.imagePath;

      await product.update({
        farmerID: farmerID !== undefined ? Number(farmerID) : product.farmerID,
        cropTypeID:
          cropTypeID !== undefined ? Number(cropTypeID) : product.cropTypeID,
        unitPrice: unitPrice !== undefined ? unitPrice : product.unitPrice,
        availableQuantity:
          availableQuantity !== undefined
            ? Number(availableQuantity)
            : product.availableQuantity,
        qualityGrade:
          qualityGrade !== undefined ? qualityGrade : product.qualityGrade,
        imagePath:
          nextImagePath !== undefined ? nextImagePath : product.imagePath,
      });

      if (uploadedImagePath && previousImagePath !== uploadedImagePath) {
        await deleteStoredImage(previousImagePath);
      }

      res.json({ message: "Product updated successfully", product });
    } catch (err) {
      console.error("Update product error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// DELETE /api/products/:id — Officer: soft-delete product in own coop
router.delete("/:id", authenticate, authorize("Officer"), async (req, res) => {
  try {
    const coop = await getOfficerCoop(req.user.userID);
    if (!coop)
      return res.status(404).json({ message: "Cooperative not found" });

    const farmerIDs = await getOfficerFarmerIDs(coop.primaryCoopID);
    const product = await db.Product.findOne({
      where: { productID: req.params.id, isDeleted: false },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!farmerIDs.includes(product.farmerID)) {
      return res
        .status(403)
        .json({ message: "Product not in your cooperative" });
    }

    await deleteStoredImage(product.imagePath);
    await product.update({ isDeleted: true });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
