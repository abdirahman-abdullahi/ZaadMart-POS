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
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
} = require("../validators/productValidator");

const {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  activateProduct,
  deactivateProduct,
  getReferenceData,
} = require("../controllers/productController");

const {
  validateCreateBarcode,
  validateBarcodeId,
} = require("../validators/barcodeValidator");

const {
  createBarcode,
  listProductBarcodes,
  setPrimary,
  removeBarcode,
  barcodeLookup,
} = require("../controllers/barcodeController");

const {
  validateCreateProductUnit,
  validateProductUnitId,
} = require("../validators/productUnitValidator");

const {
  createProductUnit,
  getProductUnits,
  updateProductUnit,
  setDefaultPurchase,
  setDefaultSale,
  deleteProductUnit,
} = require("../controllers/productUnitController");

const {
  validateCreateProductPrice,
} = require("../validators/productPriceValidator");

const {
  createProductPrice,
  getProductPriceHistory,
  getCurrentProductPrices,
} = require("../controllers/productPriceController");

const router = express.Router();

router.use(authenticate);

router.get(
  "/:productId/prices/current",
  requirePermission("product.view"),
  validate(validateProductId),
  asyncHandler(getCurrentProductPrices)
);

router.get(
  "/:productId/prices",
  requirePermission("product.view"),
  validate(validateProductId),
  asyncHandler(getProductPriceHistory)
);

router.post(
  "/:productId/prices",
  requirePermission("product.edit"),
  validate(validateCreateProductPrice),
  asyncHandler(createProductPrice)
);

router.get(
  "/:productId/units",
  requirePermission("product.view"),
  validate(validateProductId),
  asyncHandler(getProductUnits)
);

router.post(
  "/:productId/units",
  requirePermission("product.edit"),
  validate(validateCreateProductUnit),
  asyncHandler(createProductUnit)
);

router.patch(
  "/:productId/units/:productUnitId",
  requirePermission("product.edit"),
  validate(validateProductUnitId),
  asyncHandler(updateProductUnit)
);

router.patch(
  "/:productId/units/:productUnitId/default-purchase",
  requirePermission("product.edit"),
  validate(validateProductUnitId),
  asyncHandler(setDefaultPurchase)
);

router.patch(
  "/:productId/units/:productUnitId/default-sale",
  requirePermission("product.edit"),
  validate(validateProductUnitId),
  asyncHandler(setDefaultSale)
);

router.delete(
  "/:productId/units/:productUnitId",
  requirePermission("product.edit"),
  validate(validateProductUnitId),
  asyncHandler(deleteProductUnit)
);

router.get(
  "/barcode/:barcode",
  requirePermission("product.view"),
  asyncHandler(barcodeLookup)
);

router.get(
  "/:productId/barcodes",
  requirePermission("product.view"),
  validate(validateProductId),
  asyncHandler(listProductBarcodes)
);

router.post(
  "/:productId/barcodes",
  requirePermission("product.edit"),
  validate(validateCreateBarcode),
  asyncHandler(createBarcode)
);

router.patch(
  "/:productId/barcodes/:barcodeId/primary",
  requirePermission("product.edit"),
  validate(validateBarcodeId),
  asyncHandler(setPrimary)
);

router.delete(
  "/:productId/barcodes/:barcodeId",
  requirePermission("product.edit"),
  validate(validateBarcodeId),
  asyncHandler(removeBarcode)
);

router.get(
  "/reference-data",
  requirePermission("product.view"),
  asyncHandler(getReferenceData)
);

router.get(
  "/",
  requirePermission("product.view"),
  asyncHandler(listProducts)
);

router.post(
  "/",
  requirePermission("product.create"),
  validate(validateCreateProduct),
  asyncHandler(createProduct)
);

router.get(
  "/:productId",
  requirePermission("product.view"),
  validate(validateProductId),
  asyncHandler(getProductById)
);

router.patch(
  "/:productId",
  requirePermission("product.edit"),
  validate(validateUpdateProduct),
  asyncHandler(updateProduct)
);

router.patch(
  "/:productId/activate",
  requirePermission("product.edit"),
  validate(validateProductId),
  asyncHandler(activateProduct)
);

router.patch(
  "/:productId/deactivate",
  requirePermission("product.edit"),
  validate(validateProductId),
  asyncHandler(deactivateProduct)
);



module.exports = router;