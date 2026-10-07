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
  validateBrandId,
  validateCreateBrand,
  validateUpdateBrand,
  validateBrandStatus,
} = require("../validators/brandValidator");

const {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  setBrandStatus,
} = require("../controllers/brandController");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  requirePermission("product.view"),
  asyncHandler(getBrands)
);

router.get(
  "/:brandId",
  requirePermission("product.view"),
  validate(validateBrandId),
  asyncHandler(getBrandById)
);

router.post(
  "/",
  requirePermission("product.edit"),
  validate(validateCreateBrand),
  asyncHandler(createBrand)
);

router.patch(
  "/:brandId",
  requirePermission("product.edit"),
  validate(validateUpdateBrand),
  asyncHandler(updateBrand)
);

router.patch(
  "/:brandId/status",
  requirePermission("product.edit"),
  validate(validateBrandStatus),
  asyncHandler(setBrandStatus)
);

module.exports = router;