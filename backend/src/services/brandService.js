const {
  conflict,
  notFound,
} = require("../utils/httpErrors");

const {
  findAllBrands,
  findBrandById,
  findBrandByName,
  createBrand,
  updateBrand,
  updateBrandStatus,
} = require("../repositories/brandRepository");

async function listBrands() {
  return findAllBrands();
}

async function getBrand(brandId) {
  const brand = await findBrandById(brandId);

  if (!brand) {
    throw notFound(
      "Brand not found",
      "BRAND_NOT_FOUND"
    );
  }

  return brand;
}

async function addBrand(data) {
  const brandName = data.brandName.trim();

  const existing =
    await findBrandByName(brandName);

  if (existing) {
    throw conflict(
      "A brand with this name already exists",
      "BRAND_NAME_EXISTS"
    );
  }

  return createBrand({
    brandName,
    description:
      data.description === undefined ||
      data.description === null
        ? null
        : data.description.trim(),
  });
}

async function editBrand(brandId, data) {
  const brand = await findBrandById(brandId);

  if (!brand) {
    throw notFound(
      "Brand not found",
      "BRAND_NOT_FOUND"
    );
  }

  if (data.brandName !== undefined) {
    const brandName =
      data.brandName.trim();

    const existing =
      await findBrandByName(brandName);

    if (
      existing &&
      existing.brand_id !== brandId
    ) {
      throw conflict(
        "A brand with this name already exists",
        "BRAND_NAME_EXISTS"
      );
    }
  }

  return updateBrand(brandId, {
    brandNameProvided:
      data.brandName !== undefined,

    brandName:
      data.brandName !== undefined
        ? data.brandName.trim()
        : null,

    descriptionProvided:
      data.description !== undefined,

    description:
      data.description === null
        ? null
        : data.description?.trim(),
  });
}

async function changeBrandStatus(
  brandId,
  isActive
) {
  const brand = await findBrandById(brandId);

  if (!brand) {
    throw notFound(
      "Brand not found",
      "BRAND_NOT_FOUND"
    );
  }

  return updateBrandStatus(
    brandId,
    isActive
  );
}

module.exports = {
  listBrands,
  getBrand,
  addBrand,
  editBrand,
  changeBrandStatus,
};