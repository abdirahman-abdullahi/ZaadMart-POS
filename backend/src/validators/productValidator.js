function isValidUuid(value) {
  if (typeof value !== "string") {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function validateCreateProduct(req) {
  const errors = [];

  const {
    sku,
    productName,
    categoryId,
    brandId,
    baseUnitId,
    taxCategoryId,
    trackStock,
    allowFractionalQuantity,
    minimumStock,
    reorderQuantity,
  } = req.body;

  if (!sku || typeof sku !== "string" || !sku.trim()) {
    errors.push("SKU is required");
  }

  if (
    !productName ||
    typeof productName !== "string" ||
    !productName.trim()
  ) {
    errors.push("Product name is required");
  }

  if (!baseUnitId || !isValidUuid(baseUnitId)) {
    errors.push("A valid base unit ID is required");
  }

  if (!taxCategoryId || !isValidUuid(taxCategoryId)) {
    errors.push("A valid tax category ID is required");
  }

  if (
    categoryId !== undefined &&
    categoryId !== null &&
    !isValidUuid(categoryId)
  ) {
    errors.push("Category ID must be a valid UUID");
  }

  if (
    brandId !== undefined &&
    brandId !== null &&
    !isValidUuid(brandId)
  ) {
    errors.push("Brand ID must be a valid UUID");
  }

  if (
    trackStock !== undefined &&
    typeof trackStock !== "boolean"
  ) {
    errors.push("trackStock must be true or false");
  }

  if (
    allowFractionalQuantity !== undefined &&
    typeof allowFractionalQuantity !== "boolean"
  ) {
    errors.push(
      "allowFractionalQuantity must be true or false"
    );
  }

  if (
    minimumStock !== undefined &&
    (
      typeof minimumStock !== "number" ||
      minimumStock < 0
    )
  ) {
    errors.push(
      "Minimum stock must be a non-negative number"
    );
  }

  if (
    reorderQuantity !== undefined &&
    (
      typeof reorderQuantity !== "number" ||
      reorderQuantity < 0
    )
  ) {
    errors.push(
      "Reorder quantity must be a non-negative number"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateUpdateProduct(req) {
  const errors = [];

  if (!isValidUuid(req.params.productId)) {
    errors.push("Product ID must be a valid UUID");
  }

  if (
    req.body.baseUnitId !== undefined &&
    !isValidUuid(req.body.baseUnitId)
  ) {
    errors.push("Base unit ID must be a valid UUID");
  }

  if (
    req.body.taxCategoryId !== undefined &&
    !isValidUuid(req.body.taxCategoryId)
  ) {
    errors.push(
      "Tax category ID must be a valid UUID"
    );
  }

  if (
    req.body.categoryId !== undefined &&
    req.body.categoryId !== null &&
    !isValidUuid(req.body.categoryId)
  ) {
    errors.push("Category ID must be a valid UUID");
  }

  if (
    req.body.brandId !== undefined &&
    req.body.brandId !== null &&
    !isValidUuid(req.body.brandId)
  ) {
    errors.push("Brand ID must be a valid UUID");
  }

  if (
    req.body.minimumStock !== undefined &&
    (
      typeof req.body.minimumStock !== "number" ||
      req.body.minimumStock < 0
    )
  ) {
    errors.push(
      "Minimum stock must be a non-negative number"
    );
  }

  if (
    req.body.reorderQuantity !== undefined &&
    (
      typeof req.body.reorderQuantity !== "number" ||
      req.body.reorderQuantity < 0
    )
  ) {
    errors.push(
      "Reorder quantity must be a non-negative number"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateProductId(req) {
  const errors = [];

  if (!isValidUuid(req.params.productId)) {
    errors.push("Product ID must be a valid UUID");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
};