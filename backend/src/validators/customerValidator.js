function isValidUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

/*
|--------------------------------------------------------------------------
| Validate customer ID
|--------------------------------------------------------------------------
*/
function validateCustomerId(req) {
  const errors = [];

  if (!isValidUuid(req.params.customerId)) {
    errors.push(
      "Customer ID must be a valid UUID"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/*
|--------------------------------------------------------------------------
| Validate create customer
|--------------------------------------------------------------------------
*/
function validateCreateCustomer(req) {
  const errors = [];

  const {
    customerName,
    phone,
    email,
    address,
    kraPin,
    creditLimit,
    allowCredit,
    notes,
  } = req.body;

  if (
    typeof customerName !== "string" ||
    !customerName.trim()
  ) {
    errors.push("Customer name is required");
  }

  if (
    phone !== undefined &&
    phone !== null &&
    typeof phone !== "string"
  ) {
    errors.push("Phone must be text");
  }

  if (
    email !== undefined &&
    email !== null &&
    typeof email !== "string"
  ) {
    errors.push("Email must be text");
  }

  if (
    address !== undefined &&
    address !== null &&
    typeof address !== "string"
  ) {
    errors.push("Address must be text");
  }

  if (
    kraPin !== undefined &&
    kraPin !== null &&
    typeof kraPin !== "string"
  ) {
    errors.push("KRA PIN must be text");
  }

  if (
    notes !== undefined &&
    notes !== null &&
    typeof notes !== "string"
  ) {
    errors.push("Notes must be text");
  }

  if (allowCredit !== undefined) {
    if (typeof allowCredit !== "boolean") {
      errors.push(
        "allowCredit must be true or false"
      );
    }
  }

  if (creditLimit !== undefined) {
    const numericLimit =
      Number(creditLimit);

    if (
      !Number.isFinite(numericLimit) ||
      numericLimit < 0
    ) {
      errors.push(
        "Credit limit must be a number greater than or equal to 0"
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/*
|--------------------------------------------------------------------------
| Validate customer update
|--------------------------------------------------------------------------
*/
function validateUpdateCustomer(req) {
  const errors = [];

  if (!isValidUuid(req.params.customerId)) {
    errors.push(
      "Customer ID must be a valid UUID"
    );
  }

  const allowedFields = [
    "customerName",
    "phone",
    "email",
    "address",
    "kraPin",
    "notes",
  ];

  const providedFields =
    allowedFields.filter(
      (field) =>
        req.body[field] !== undefined
    );

  if (providedFields.length === 0) {
    errors.push(
      "At least one customer field must be provided"
    );
  }

  if (
    req.body.customerName !== undefined &&
    (
      typeof req.body.customerName !==
        "string" ||
      !req.body.customerName.trim()
    )
  ) {
    errors.push(
      "Customer name cannot be empty"
    );
  }

  const optionalTextFields = [
    ["phone", "Phone"],
    ["email", "Email"],
    ["address", "Address"],
    ["kraPin", "KRA PIN"],
    ["notes", "Notes"],
  ];

  for (const [field, label] of optionalTextFields) {
    if (
      req.body[field] !== undefined &&
      req.body[field] !== null &&
      typeof req.body[field] !== "string"
    ) {
      errors.push(
        `${label} must be text or null`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/*
|--------------------------------------------------------------------------
| Validate credit settings
|--------------------------------------------------------------------------
*/
function validateCustomerCredit(req) {
  const errors = [];

  if (!isValidUuid(req.params.customerId)) {
    errors.push(
      "Customer ID must be a valid UUID"
    );
  }

  const {
    allowCredit,
    creditLimit,
  } = req.body;

  if (typeof allowCredit !== "boolean") {
    errors.push(
      "allowCredit must be true or false"
    );
  }

  const numericLimit =
    Number(creditLimit);

  if (
    creditLimit === undefined ||
    creditLimit === null ||
    creditLimit === "" ||
    !Number.isFinite(numericLimit) ||
    numericLimit < 0
  ) {
    errors.push(
      "Credit limit must be a number greater than or equal to 0"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/*
|--------------------------------------------------------------------------
| Validate active status
|--------------------------------------------------------------------------
*/
function validateCustomerStatus(req) {
  const errors = [];

  if (!isValidUuid(req.params.customerId)) {
    errors.push(
      "Customer ID must be a valid UUID"
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
  validateCustomerId,
  validateCreateCustomer,
  validateUpdateCustomer,
  validateCustomerCredit,
  validateCustomerStatus,
};
