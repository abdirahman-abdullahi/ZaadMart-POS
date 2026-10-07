function isValidUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

function validateBrandId(req) {
  const errors = [];

  if (!isValidUuid(req.params.brandId)) {
    errors.push(
      "Brand ID must be a valid UUID"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateCreateBrand(req) {
  const errors = [];

  if (
    typeof req.body.brandName !== "string" ||
    !req.body.brandName.trim()
  ) {
    errors.push("Brand name is required");
  }

  if (
    req.body.description !== undefined &&
    req.body.description !== null &&
    typeof req.body.description !== "string"
  ) {
    errors.push(
      "Description must be text"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateUpdateBrand(req) {
  const errors = [];

  if (!isValidUuid(req.params.brandId)) {
    errors.push(
      "Brand ID must be a valid UUID"
    );
  }

  if (
    req.body.brandName !== undefined &&
    (
      typeof req.body.brandName !== "string" ||
      !req.body.brandName.trim()
    )
  ) {
    errors.push(
      "Brand name cannot be empty"
    );
  }

  if (
    req.body.description !== undefined &&
    req.body.description !== null &&
    typeof req.body.description !== "string"
  ) {
    errors.push(
      "Description must be text or null"
    );
  }

  if (
    req.body.brandName === undefined &&
    req.body.description === undefined
  ) {
    errors.push(
      "At least one field must be provided"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateBrandStatus(req) {
  const errors = [];

  if (!isValidUuid(req.params.brandId)) {
    errors.push(
      "Brand ID must be a valid UUID"
    );
  }

  if (typeof req.body.isActive !== "boolean") {
    errors.push(
      "isActive must be true or false"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateBrandId,
  validateCreateBrand,
  validateUpdateBrand,
  validateBrandStatus,
};