function errorHandler(error, req, res, next) {
  console.error(error);

  const statusCode = error.statusCode || 500;

  const response = {
    success: false,
    message:
      statusCode === 500
        ? "An unexpected server error occurred"
        : error.message,
  };

  if (error.code) {
    response.code = error.code;
  }

  if (error.details) {
    response.details = error.details;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;