const {
  listBrands,
  getBrand,
  addBrand,
  editBrand,
  changeBrandStatus,
} = require("../services/brandService");

const {
  successResponse,
} = require("../utils/apiResponse");

async function getBrands(req, res) {
  const brands = await listBrands();

  return successResponse(res, {
    message:
      "Brands retrieved successfully",
    data: brands,
  });
}

async function getBrandById(req, res) {
  const brand = await getBrand(
    req.params.brandId
  );

  return successResponse(res, {
    message:
      "Brand retrieved successfully",
    data: brand,
  });
}

async function createBrand(req, res) {
  const brand = await addBrand(req.body);

  return successResponse(res, {
    statusCode: 201,
    message:
      "Brand created successfully",
    data: brand,
  });
}

async function updateBrand(req, res) {
  const brand = await editBrand(
    req.params.brandId,
    req.body
  );

  return successResponse(res, {
    message:
      "Brand updated successfully",
    data: brand,
  });
}

async function setBrandStatus(req, res) {
  const brand = await changeBrandStatus(
    req.params.brandId,
    req.body.isActive
  );

  return successResponse(res, {
    message: req.body.isActive
      ? "Brand activated successfully"
      : "Brand deactivated successfully",
    data: brand,
  });
}

module.exports = {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  setBrandStatus,
};