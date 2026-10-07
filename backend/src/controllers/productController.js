const {
  createNewProduct,
  getProduct,
  getProducts,
  editProduct,
  changeProductStatus,
  getProductReferenceData,
} = require("../services/productService");

const {
  successResponse,
} = require("../utils/apiResponse");

const {
  getPagination,
  getPaginationMeta,
} = require("../utils/pagination");

const {
  normalizeSearch,
  parseBoolean,
} = require("../utils/queryHelpers");

async function createProduct(req, res) {
  const product = await createNewProduct(req.body);

  return successResponse(res, {
    statusCode: 201,
    message: "Product created successfully",
    data: product,
  });
}

async function listProducts(req, res) {
  const { page, limit, offset } =
    getPagination(req.query);

  const search = normalizeSearch(req.query.search);

  const isActive =
    parseBoolean(req.query.active);

  const result = await getProducts({
    search,
    categoryId: req.query.categoryId || null,
    brandId: req.query.brandId || null,
    isActive,
    limit,
    offset,
  });

  return successResponse(res, {
    message: "Products retrieved successfully",

    data: result.products,

    meta: getPaginationMeta({
      page,
      limit,
      total: result.total,
    }),
  });
}

async function getProductById(req, res) {
  const product = await getProduct(
    req.params.productId
  );

  return successResponse(res, {
    message: "Product retrieved successfully",
    data: product,
  });
}

async function updateProduct(req, res) {
  const product = await editProduct(
    req.params.productId,
    req.body
  );

  return successResponse(res, {
    message: "Product updated successfully",
    data: product,
  });
}

async function activateProduct(req, res) {
  const product = await changeProductStatus(
    req.params.productId,
    true
  );

  return successResponse(res, {
    message: "Product activated successfully",
    data: product,
  });
}

async function deactivateProduct(req, res) {
  const product = await changeProductStatus(
    req.params.productId,
    false
  );

  return successResponse(res, {
    message: "Product deactivated successfully",
    data: product,
  });
}

async function getReferenceData(req, res) {
  const data = await getProductReferenceData();

  return successResponse(res, {
    message:
      "Product reference data retrieved successfully",
    data,
  });
}

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  activateProduct,
  deactivateProduct,
  getReferenceData,
};