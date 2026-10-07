const {
  conflict,
  notFound,
  badRequest,
} = require("../utils/httpErrors");

const {
  findProductBySku,
  findProductById,
  createProduct,
  listProducts,
  updateProduct,
  setProductActive,

  getCategoryById,
  getBrandById,
  getUnitById,
  getTaxCategoryById,

  getReferenceData,
} = require("../repositories/productRepository");

async function validateReferences({
  categoryId,
  brandId,
  baseUnitId,
  taxCategoryId,
}) {
  if (categoryId) {
    const category = await getCategoryById(categoryId);

    if (!category || !category.is_active) {
      throw badRequest(
        "Invalid or inactive category",
        "INVALID_CATEGORY"
      );
    }
  }

  if (brandId) {
    const brand = await getBrandById(brandId);

    if (!brand || !brand.is_active) {
      throw badRequest(
        "Invalid or inactive brand",
        "INVALID_BRAND"
      );
    }
  }

  if (baseUnitId) {
    const unit = await getUnitById(baseUnitId);

    if (!unit || !unit.is_active) {
      throw badRequest(
        "Invalid or inactive base unit",
        "INVALID_BASE_UNIT"
      );
    }
  }

  if (taxCategoryId) {
    const taxCategory =
      await getTaxCategoryById(taxCategoryId);

    if (!taxCategory || !taxCategory.is_active) {
      throw badRequest(
        "Invalid or inactive tax category",
        "INVALID_TAX_CATEGORY"
      );
    }
  }
}

async function createNewProduct(data) {
  const normalizedSku = data.sku.trim();
  const normalizedName = data.productName.trim();

  const existingSku =
    await findProductBySku(normalizedSku);

  if (existingSku) {
    throw conflict(
      "A product with this SKU already exists",
      "SKU_EXISTS"
    );
  }

  await validateReferences({
    categoryId: data.categoryId || null,
    brandId: data.brandId || null,
    baseUnitId: data.baseUnitId,
    taxCategoryId: data.taxCategoryId,
  });

  const product = await createProduct({
    sku: normalizedSku,
    productName: normalizedName,
    description: data.description?.trim() || null,

    categoryId: data.categoryId || null,
    brandId: data.brandId || null,

    baseUnitId: data.baseUnitId,
    taxCategoryId: data.taxCategoryId,

    trackStock:
      data.trackStock === undefined
        ? true
        : data.trackStock,

    allowFractionalQuantity:
      data.allowFractionalQuantity === undefined
        ? false
        : data.allowFractionalQuantity,

    minimumStock:
      data.minimumStock === undefined
        ? 0
        : data.minimumStock,

    reorderQuantity:
      data.reorderQuantity === undefined
        ? 0
        : data.reorderQuantity,
  });

  return findProductById(product.product_id);
}

async function getProduct(productId) {
  const product = await findProductById(productId);

  if (!product) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  return product;
}

async function getProducts(options) {
  return listProducts(options);
}

async function editProduct(productId, changes) {
  const existing = await findProductById(productId);

  if (!existing) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  const sku =
    changes.sku !== undefined
      ? changes.sku.trim()
      : existing.sku;

  if (!sku) {
    throw badRequest(
      "SKU cannot be empty",
      "INVALID_SKU"
    );
  }

  if (
    changes.sku !== undefined &&
    sku.toLowerCase() !== existing.sku.toLowerCase()
  ) {
    const duplicate = await findProductBySku(sku);

    if (duplicate) {
      throw conflict(
        "A product with this SKU already exists",
        "SKU_EXISTS"
      );
    }
  }

  const productName =
    changes.productName !== undefined
      ? changes.productName.trim()
      : existing.product_name;

  if (!productName) {
    throw badRequest(
      "Product name cannot be empty",
      "INVALID_PRODUCT_NAME"
    );
  }

  const categoryId =
    changes.categoryId !== undefined
      ? changes.categoryId
      : existing.category_id;

  const brandId =
    changes.brandId !== undefined
      ? changes.brandId
      : existing.brand_id;

  const baseUnitId =
    changes.baseUnitId !== undefined
      ? changes.baseUnitId
      : existing.base_unit_id;

  const taxCategoryId =
    changes.taxCategoryId !== undefined
      ? changes.taxCategoryId
      : existing.tax_category_id;

  await validateReferences({
    categoryId,
    brandId,
    baseUnitId,
    taxCategoryId,
  });

  await updateProduct(productId, {
    sku,
    productName,

    description:
      changes.description !== undefined
        ? changes.description?.trim() || null
        : existing.description,

    categoryId,
    brandId,
    baseUnitId,
    taxCategoryId,

    trackStock:
      changes.trackStock !== undefined
        ? changes.trackStock
        : existing.track_stock,

    allowFractionalQuantity:
      changes.allowFractionalQuantity !== undefined
        ? changes.allowFractionalQuantity
        : existing.allow_fractional_quantity,

    minimumStock:
      changes.minimumStock !== undefined
        ? changes.minimumStock
        : Number(existing.minimum_stock),

    reorderQuantity:
      changes.reorderQuantity !== undefined
        ? changes.reorderQuantity
        : Number(existing.reorder_quantity),
  });

  return findProductById(productId);
}

async function changeProductStatus(
  productId,
  isActive
) {
  const existing = await findProductById(productId);

  if (!existing) {
    throw notFound(
      "Product not found",
      "PRODUCT_NOT_FOUND"
    );
  }

  await setProductActive(productId, isActive);

  return findProductById(productId);
}

async function getProductReferenceData() {
  return getReferenceData();
}

module.exports = {
  createNewProduct,
  getProduct,
  getProducts,
  editProduct,
  changeProductStatus,
  getProductReferenceData,
};