function isValidUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

function validateCreateProductUnit(req) {
  const errors = [];

  const {
    unitId,
    conversionFactor,
    isPurchaseUnit,
    isSaleUnit,
    isDefaultPurchaseUnit,
    isDefaultSaleUnit,
  } = req.body;

  if (!isValidUuid(req.params.productId)) {
    errors.push("Product ID must be a valid UUID");
  }

  if (!unitId || !isValidUuid(unitId)) {
    errors.push("A valid unit ID is required");
  }

  if (
    typeof conversionFactor !== "number" ||
    conversionFactor <= 0
  ) {
    errors.push(
      "Conversion factor must be greater than zero"
    );
  }

  for (const [name, value] of Object.entries({
    isPurchaseUnit,
    isSaleUnit,
    isDefaultPurchaseUnit,
    isDefaultSaleUnit,
  })) {
    if (
      value !== undefined &&
      typeof value !== "boolean"
    ) {
      errors.push(`${name} must be true or false`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateProductUnitId(req) {
  const errors = [];

  if (!isValidUuid(req.params.productId)) {
    errors.push("Product ID must be a valid UUID");
  }

  if (!isValidUuid(req.params.productUnitId)) {
    errors.push("Product unit ID must be a valid UUID");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateCreateProductUnit,
  validateProductUnitId,
};