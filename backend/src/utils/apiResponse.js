function successResponse(
  res,
  {
    statusCode = 200,
    message = "Request successful",
    data = null,
    meta = undefined,
  } = {}
) {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

module.exports = {
  successResponse,
};