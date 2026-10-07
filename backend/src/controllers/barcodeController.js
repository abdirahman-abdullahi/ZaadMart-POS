const {
  addBarcode,
  getProductBarcodes,
  makePrimaryBarcode,
  removeProductBarcode,
  lookupProductByBarcode,
} = require("../services/barcodeService");

const {
  successResponse,
} = require("../utils/apiResponse");

async function createBarcode(req, res) {
  const barcode = await addBarcode(
    req.params.productId,
    req.body
  );

  return successResponse(res, {
    statusCode: 201,
    message: "Barcode added successfully",
    data: barcode,
  });
}

async function listProductBarcodes(req, res) {
  const barcodes = await getProductBarcodes(
    req.params.productId
  );

  return successResponse(res, {
    message: "Product barcodes retrieved successfully",
    data: barcodes,
  });
}

async function setPrimary(req, res) {
  const barcode = await makePrimaryBarcode(
    req.params.productId,
    req.params.barcodeId
  );

  return successResponse(res, {
    message: "Primary barcode updated successfully",
    data: barcode,
  });
}

async function removeBarcode(req, res) {
  const barcode = await removeProductBarcode(
    req.params.productId,
    req.params.barcodeId
  );

  return successResponse(res, {
    message: "Barcode removed successfully",
    data: barcode,
  });
}

async function barcodeLookup(req, res) {
  const product = await lookupProductByBarcode(
    req.params.barcode
  );

  return successResponse(res, {
    message: "Product found",
    data: product,
  });
}

module.exports = {
  createBarcode,
  listProductBarcodes,
  setPrimary,
  removeBarcode,
  barcodeLookup,
};