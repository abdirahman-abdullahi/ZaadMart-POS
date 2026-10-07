const express = require("express");

const authenticate =
  require("../middleware/authenticate");

const requirePermission =
  require("../middleware/requirePermission");

const validate =
  require("../middleware/validate");

const asyncHandler =
  require("../utils/asyncHandler");

const {
  validateCategoryId,
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryStatus,
} = require("../validators/categoryValidator");

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  setCategoryStatus,
} = require("../controllers/categoryController");

const router = express.Router();

router.use(authenticate);

// List all categories
router.get(
  "/",
  requirePermission("product.view"),
  asyncHandler(getCategories)
);

// Get one category
router.get(
  "/:categoryId",
  requirePermission("product.view"),
  validate(validateCategoryId),
  asyncHandler(getCategoryById)
);

// Create category
router.post(
  "/",
  requirePermission("product.edit"),
  validate(validateCreateCategory),
  asyncHandler(createCategory)
);

// Edit category
router.patch(
  "/:categoryId",
  requirePermission("product.edit"),
  validate(validateUpdateCategory),
  asyncHandler(updateCategory)
);

// Activate/deactivate category
router.patch(
  "/:categoryId/status",
  requirePermission("product.edit"),
  validate(validateCategoryStatus),
  asyncHandler(setCategoryStatus)
);

module.exports = router;