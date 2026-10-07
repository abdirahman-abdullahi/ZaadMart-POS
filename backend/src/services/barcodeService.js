const { withTransaction } = require("../config/transaction");

const {
  conflict,
  notFound,
  badRequest,
} = require("../utils/httpErrors");

const {
  findProductById,
} = require("../repositories/productRepository");

const {
  findBarcode,
  getBarcodesForProduct,
  createBarcode,
  clearPrimaryBarcodes,
  findBarcodeById,
  setPrimaryBarcode,
  deleteBarcode,
  findProductByBarcode,
} = require("../repositories/barcodeRepository");

async function addBarcode(productId, data) {
  const product = await findProductById(productId);

  if (!product) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  const barcode = data.barcode.trim();

  const existingBarcode = await findBarcode(barcode);

  if (existingBarcode) {
    throw conflict(
      "This barcode is already assigned to a product",
      "BARCODE_EXISTS"
    );
  }

  const existingBarcodes =
    await getBarcodesForProduct(productId);

  const shouldBePrimary =
    data.isPrimary === true ||
    existingBarcodes.length === 0;

  const created = await withTransaction(
    async (client) => {
      if (shouldBePrimary) {
        await clearPrimaryBarcodes(
          client,
          productId
        );
      }

      return createBarcode(
        client,
        productId,
        barcode,
        shouldBePrimary
      );
    }
  );

  return created;
}

async function getProductBarcodes(productId) {
  const product = await findProductById(productId);

  if (!product) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  return getBarcodesForProduct(productId);
}

async function makePrimaryBarcode(
  productId,
  barcodeId
) {
  const product = await findProductById(productId);

  if (!product) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  const barcode = await findBarcodeById(barcodeId);

  if (!barcode) {
    throw notFound(
      "Barcode not found",
      "BARCODE_NOT_FOUND"
    );
  }

  if (barcode.product_id !== productId) {
    throw badRequest(
      "Barcode does not belong to this product",
      "BARCODE_PRODUCT_MISMATCH"
    );
  }

  return withTransaction(async (client) => {
    return setPrimaryBarcode(
      client,
      productId,
      barcodeId
    );
  });
}

async function removeProductBarcode(
  productId,
  barcodeId
) {
  const product = await findProductById(productId);

  if (!product) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  const barcode = await findBarcodeById(barcodeId);

  if (!barcode) {
    throw notFound(
      "Barcode not found",
      "BARCODE_NOT_FOUND"
    );
  }

  if (barcode.product_id !== productId) {
    throw badRequest(
      "Barcode does not belong to this product",
      "BARCODE_PRODUCT_MISMATCH"
    );
  }

  const barcodes =
    await getBarcodesForProduct(productId);

  if (
    barcode.is_primary &&
    barcodes.length > 1
  ) {
    throw badRequest(
      "Set another barcode as primary before removing the current primary barcode",
      "PRIMARY_BARCODE_REMOVAL_NOT_ALLOWED"
    );
  }

  return deleteBarcode(
    productId,
    barcodeId
  );
}

async function lookupProductByBarcode(barcode) {
  const product = await findProductByBarcode(
    barcode.trim()
  );

  if (!product) {
    throw notFound(
      "No product found for this barcode",
      "BARCODE_NOT_FOUND"
    );
  }

  if (!product.is_active) {
    throw badRequest(
      "Product assigned to this barcode is inactive",
      "PRODUCT_INACTIVE"
    );
  }

  return product;
}

module.exports = {
  addBarcode,
  getProductBarcodes,
  makePrimaryBarcode,
  removeProductBarcode,
  lookupProductByBarcode,
};