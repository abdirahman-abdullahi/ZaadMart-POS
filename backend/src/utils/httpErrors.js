const AppError = require("./AppError");

function badRequest(message = "Bad request", code = "BAD_REQUEST", details = null) {
  return new AppError(message, 400, code, details);
}

function unauthorized(
  message = "Authentication required",
  code = "UNAUTHORIZED"
) {
  return new AppError(message, 401, code);
}

function forbidden(
  message = "You do not have permission to perform this action",
  code = "FORBIDDEN"
) {
  return new AppError(message, 403, code);
}

function notFound(message = "Resource not found", code = "NOT_FOUND") {
  return new AppError(message, 404, code);
}

function conflict(message = "Resource conflict", code = "CONFLICT") {
  return new AppError(message, 409, code);
}

module.exports = {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
};