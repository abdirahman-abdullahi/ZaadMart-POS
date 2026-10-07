const {
  listPriceHistory,
  listCurrentPrices,
  setProductPrice,
} = require("../services/productPriceService");

const {
  successResponse,
} = require("../utils/apiResponse");

async function createProductPrice(req, res) {
  const userId =
    req.user?.user_id ||
    req.user?.userId ||
    req.user?.id ||
    null;

  const price = await setProductPrice(
    req.params.productId,
    req.body,
    userId
  );

  return successResponse(res, {
    statusCode: 201,
    message: "Product price set successfully",
    data: price,
  });
}

async function getProductPriceHistory(req, res) {
  const prices = await listPriceHistory(
    req.params.productId
  );

  return successResponse(res, {
    message:
      "Product price history retrieved successfully",
    data: prices,
  });
}

async function getCurrentProductPrices(req, res) {
  const prices = await listCurrentPrices(
    req.params.productId
  );

  return successResponse(res, {
    message:
      "Current product prices retrieved successfully",
    data: prices,
  });
}

module.exports = {
  createProductPrice,
  getProductPriceHistory,
  getCurrentProductPrices,
};