const { withTransaction } = require("../config/transaction");

const {
  notFound,
  conflict,
  badRequest,
} = require("../utils/httpErrors");

const {
  findProductById,
  getUnitById,
} = require("../repositories/productRepository");

const {
  getProductUnits,
  getProductUnitById,
  findProductUnitByUnitId,
  createProductUnit,
  updateProductUnit,
  clearDefaultPurchaseUnit,
  clearDefaultSaleUnit,
  setDefaultPurchaseUnit,
  setDefaultSaleUnit,
  deleteProductUnit,
} = require("../repositories/productUnitRepository");

async function addProductUnit(productId, data) {
  const product = await findProductById(productId);

  if (!product) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  const unit = await getUnitById(data.unitId);

  if (!unit || !unit.is_active) {
    throw badRequest(
      "Invalid or inactive unit",
      "INVALID_UNIT"
    );
  }

  const existing = await findProductUnitByUnitId(
    productId,
    data.unitId
  );

  if (existing) {
    throw conflict(
      "This unit is already configured for this product",
      "PRODUCT_UNIT_EXISTS"
    );
  }

  const isDefaultPurchaseUnit =
    data.isDefaultPurchaseUnit === true;

  const isDefaultSaleUnit =
    data.isDefaultSaleUnit === true;

  const created = await withTransaction(
    async (client) => {
      if (isDefaultPurchaseUnit) {
        await clearDefaultPurchaseUnit(
          client,
          productId
        );
      }

      if (isDefaultSaleUnit) {
        await clearDefaultSaleUnit(
          client,
          productId
        );
      }

      return createProductUnit(client, {
        productId,
        unitId: data.unitId,
        conversionFactor: data.conversionFactor,

        isPurchaseUnit:
          data.isPurchaseUnit === true ||
          isDefaultPurchaseUnit,

        isSaleUnit:
          data.isSaleUnit === true ||
          isDefaultSaleUnit,

        isDefaultPurchaseUnit,
        isDefaultSaleUnit,
      });
    }
  );

  return created;
}

async function listProductUnits(productId) {
  const product = await findProductById(productId);

  if (!product) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  return getProductUnits(productId);
}

async function editProductUnit(
  productId,
  productUnitId,
  changes
) {
  const product = await findProductById(productId);

  if (!product) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  const existing =
    await getProductUnitById(productUnitId);

  if (
    !existing ||
    existing.product_id !== productId
  ) {
    throw notFound(
      "Product unit not found",
      "PRODUCT_UNIT_NOT_FOUND"
    );
  }

  const conversionFactor =
    changes.conversionFactor !== undefined
      ? changes.conversionFactor
      : Number(existing.conversion_factor);

  if (conversionFactor <= 0) {
    throw badRequest(
      "Conversion factor must be greater than zero",
      "INVALID_CONVERSION_FACTOR"
    );
  }

  return updateProductUnit(productUnitId, {
    conversionFactor,

    isPurchaseUnit:
      changes.isPurchaseUnit !== undefined
        ? changes.isPurchaseUnit
        : existing.is_purchase_unit,

    isSaleUnit:
      changes.isSaleUnit !== undefined
        ? changes.isSaleUnit
        : existing.is_sale_unit,
  });
}

async function makeDefaultPurchaseUnit(
  productId,
  productUnitId
) {
  const unit = await getProductUnitById(
    productUnitId
  );

  if (
    !unit ||
    unit.product_id !== productId
  ) {
    throw notFound(
      "Product unit not found",
      "PRODUCT_UNIT_NOT_FOUND"
    );
  }

  return withTransaction(async (client) => {
    await clearDefaultPurchaseUnit(
      client,
      productId
    );

    return setDefaultPurchaseUnit(
      client,
      productId,
      productUnitId
    );
  });
}

async function makeDefaultSaleUnit(
  productId,
  productUnitId
) {
  const unit = await getProductUnitById(
    productUnitId
  );

  if (
    !unit ||
    unit.product_id !== productId
  ) {
    throw notFound(
      "Product unit not found",
      "PRODUCT_UNIT_NOT_FOUND"
    );
  }

  return withTransaction(async (client) => {
    await clearDefaultSaleUnit(
      client,
      productId
    );

    return setDefaultSaleUnit(
      client,
      productId,
      productUnitId
    );
  });
}

async function removeProductUnit(
  productId,
  productUnitId
) {
  const unit = await getProductUnitById(
    productUnitId
  );

  if (
    !unit ||
    unit.product_id !== productId
  ) {
    throw notFound(
      "Product unit not found",
      "PRODUCT_UNIT_NOT_FOUND"
    );
  }

  if (
    unit.is_default_purchase_unit ||
    unit.is_default_sale_unit
  ) {
    throw badRequest(
      "A default purchase or sale unit cannot be deleted until another unit is made default",
      "DEFAULT_PRODUCT_UNIT_REMOVAL_NOT_ALLOWED"
    );
  }

  return deleteProductUnit(
    productId,
    productUnitId
  );
}

module.exports = {
  addProductUnit,
  listProductUnits,
  editProductUnit,
  makeDefaultPurchaseUnit,
  makeDefaultSaleUnit,
  removeProductUnit,
};