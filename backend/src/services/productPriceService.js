const { withTransaction } = require("../config/transaction");

const {
  notFound,
  badRequest,
} = require("../utils/httpErrors");

const {
  findProductById,
} = require("../repositories/productRepository");

const {
  findProductUnitByUnitId,
} = require("../repositories/productUnitRepository");

const {
  getProductPriceHistory,
  getCurrentProductPrices,
  getCurrentPriceForUnit,
  closeCurrentPrice,
  createProductPrice,
} = require("../repositories/productPriceRepository");

async function listPriceHistory(productId) {
  const product = await findProductById(productId);

  if (!product) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  return getProductPriceHistory(productId);
}

async function listCurrentPrices(productId) {
  const product = await findProductById(productId);

  if (!product) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  return getCurrentProductPrices(productId);
}

async function setProductPrice(productId, data, userId) {
  const product = await findProductById(productId);

  if (!product) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  const configuredUnit =
    await findProductUnitByUnitId(
      productId,
      data.unitId
    );

  if (!configuredUnit) {
    throw badRequest(
      "This unit is not configured for this product",
      "PRODUCT_UNIT_NOT_CONFIGURED"
    );
  }

  const sellingPrice = Number(data.sellingPrice);

  if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
    throw badRequest(
      "Selling price must be greater than zero",
      "INVALID_SELLING_PRICE"
    );
  }

  const effectiveFrom = data.effectiveFrom
    ? new Date(data.effectiveFrom)
    : new Date();

  if (Number.isNaN(effectiveFrom.getTime())) {
    throw badRequest(
      "Invalid effective date",
      "INVALID_EFFECTIVE_DATE"
    );
  }

  return withTransaction(async (client) => {
    const currentPrice = await getCurrentPriceForUnit(
      client,
      productId,
      data.unitId
    );

    if (currentPrice) {
      /*
       * Prevent the new price from starting before
       * the existing price began.
       */
      if (
        effectiveFrom <=
        new Date(currentPrice.effective_from)
      ) {
        throw badRequest(
          "New price effective date must be later than the current price effective date",
          "INVALID_PRICE_EFFECTIVE_DATE"
        );
      }

      await closeCurrentPrice(
        client,
        currentPrice.product_price_id,
        effectiveFrom
      );
    }

    return createProductPrice(client, {
      productId,
      unitId: data.unitId,
      sellingPrice,
      effectiveFrom,
      createdBy: userId || null,
    });
  });
}

module.exports = {
  listPriceHistory,
  listCurrentPrices,
  setProductPrice,
};