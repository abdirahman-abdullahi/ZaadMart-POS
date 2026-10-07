function isValidUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

function validateCategoryId(req) {
  const errors = [];

  if (!isValidUuid(req.params.categoryId)) {
    errors.push("Category ID must be a valid UUID");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateCreateCategory(req) {
  const errors = [];

  if (
    typeof req.body.categoryName !== "string" ||
    !req.body.categoryName.trim()
  ) {
    errors.push("Category name is required");
  }

  if (
    req.body.parentCategoryId !== undefined &&
    req.body.parentCategoryId !== null &&
    !isValidUuid(req.body.parentCategoryId)
  ) {
    errors.push(
      "Parent category ID must be a valid UUID or null"
    );
  }

  if (
    req.body.description !== undefined &&
    req.body.description !== null &&
    typeof req.body.description !== "string"
  ) {
    errors.push("Description must be text");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateUpdateCategory(req) {
  const errors = [];

  if (!isValidUuid(req.params.categoryId)) {
    errors.push("Category ID must be a valid UUID");
  }

  if (
    req.body.categoryName !== undefined &&
    (
      typeof req.body.categoryName !== "string" ||
      !req.body.categoryName.trim()
    )
  ) {
    errors.push("Category name cannot be empty");
  }

  if (
    req.body.parentCategoryId !== undefined &&
    req.body.parentCategoryId !== null &&
    !isValidUuid(req.body.parentCategoryId)
  ) {
    errors.push(
      "Parent category ID must be a valid UUID or null"
    );
  }

  if (
    req.body.description !== undefined &&
    req.body.description !== null &&
    typeof req.body.description !== "string"
  ) {
    errors.push("Description must be text or null");
  }

  if (
    req.body.categoryName === undefined &&
    req.body.parentCategoryId === undefined &&
    req.body.description === undefined
  ) {
    errors.push("At least one field must be provided");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateCategoryStatus(req) {
  const errors = [];

  if (!isValidUuid(req.params.categoryId)) {
    errors.push("Category ID must be a valid UUID");
  }

  if (typeof req.body.isActive !== "boolean") {
    errors.push("isActive must be true or false");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateCategoryId,
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryStatus,
};