const AppError = require("../utils/AppError");

function notFoundHandler(req, res, next) {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      404,
      "ROUTE_NOT_FOUND"
    )
  );
}

module.exports = notFoundHandler;