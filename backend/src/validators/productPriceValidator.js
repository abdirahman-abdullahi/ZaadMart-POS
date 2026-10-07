function isValidUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

function validateCreateProductPrice(req) {
  const errors = [];

  if (!isValidUuid(req.params.productId)) {
    errors.push("Product ID must be a valid UUID");
  }

  if (!req.body.unitId || !isValidUuid(req.body.unitId)) {
    errors.push("A valid unit ID is required");
  }

  if (
    typeof req.body.sellingPrice !== "number" ||
    req.body.sellingPrice <= 0
  ) {
    errors.push(
      "Selling price must be a number greater than zero"
    );
  }

  if (req.body.effectiveFrom !== undefined) {
    const date = new Date(req.body.effectiveFrom);

    if (Number.isNaN(date.getTime())) {
      errors.push("effectiveFrom must be a valid date");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateCreateProductPrice,
};