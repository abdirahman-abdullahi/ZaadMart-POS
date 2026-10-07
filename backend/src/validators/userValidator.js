function validateCreateUser(req) {
  const errors = [];

  const {
    username,
    password,
    firstName,
    roleName,
  } = req.body;

  if (!username || typeof username !== "string") {
    errors.push("Username is required");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else if (password.length < 8) {
    errors.push("Password must contain at least 8 characters");
  }

  if (!firstName || typeof firstName !== "string") {
    errors.push("First name is required");
  }

  if (!roleName || typeof roleName !== "string") {
    errors.push("Role name is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateResetPassword(req) {
  const errors = [];

  const { password } = req.body;

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else if (password.length < 8) {
    errors.push("Password must contain at least 8 characters");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateCreateUser,
  validateResetPassword,
};