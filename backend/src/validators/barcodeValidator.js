function isValidUuid(value) {
  if (typeof value !== "string") {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function validateCreateBarcode(req) {
  const errors = [];

  const { barcode, isPrimary } = req.body;

  if (!isValidUuid(req.params.productId)) {
    errors.push("Product ID must be a valid UUID");
  }

  if (
    !barcode ||
    typeof barcode !== "string" ||
    !barcode.trim()
  ) {
    errors.push("Barcode is required");
  }

  if (
    isPrimary !== undefined &&
    typeof isPrimary !== "boolean"
  ) {
    errors.push("isPrimary must be true or false");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateBarcodeId(req) {
  const errors = [];

  if (!isValidUuid(req.params.productId)) {
    errors.push("Product ID must be a valid UUID");
  }

  if (!isValidUuid(req.params.barcodeId)) {
    errors.push("Barcode ID must be a valid UUID");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateCreateBarcode,
  validateBarcodeId,
};