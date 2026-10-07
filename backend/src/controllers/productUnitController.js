const {
  addProductUnit,
  listProductUnits,
  editProductUnit,
  makeDefaultPurchaseUnit,
  makeDefaultSaleUnit,
  removeProductUnit,
} = require("../services/productUnitService");

const {
  successResponse,
} = require("../utils/apiResponse");

async function createProductUnit(req, res) {
  const unit = await addProductUnit(
    req.params.productId,
    req.body
  );

  return successResponse(res, {
    statusCode: 201,
    message:
      "Product unit configured successfully",
    data: unit,
  });
}

async function getProductUnits(req, res) {
  const units = await listProductUnits(
    req.params.productId
  );

  return successResponse(res, {
    message:
      "Product units retrieved successfully",
    data: units,
  });
}

async function updateProductUnit(req, res) {
  const unit = await editProductUnit(
    req.params.productId,
    req.params.productUnitId,
    req.body
  );

  return successResponse(res, {
    message:
      "Product unit updated successfully",
    data: unit,
  });
}

async function setDefaultPurchase(req, res) {
  const unit = await makeDefaultPurchaseUnit(
    req.params.productId,
    req.params.productUnitId
  );

  return successResponse(res, {
    message:
      "Default purchase unit updated successfully",
    data: unit,
  });
}

async function setDefaultSale(req, res) {
  const unit = await makeDefaultSaleUnit(
    req.params.productId,
    req.params.productUnitId
  );

  return successResponse(res, {
    message:
      "Default sale unit updated successfully",
    data: unit,
  });
}

async function deleteProductUnit(req, res) {
  const unit = await removeProductUnit(
    req.params.productId,
    req.params.productUnitId
  );

  return successResponse(res, {
    message:
      "Product unit removed successfully",
    data: unit,
  });
}

module.exports = {
  createProductUnit,
  getProductUnits,
  updateProductUnit,
  setDefaultPurchase,
  setDefaultSale,
  deleteProductUnit,
};