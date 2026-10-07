function validateLogin(req) {
  const errors = [];

  const { username, password } = req.body;

  if (!username || typeof username !== "string") {
    errors.push("Username is required");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateLogin,
};