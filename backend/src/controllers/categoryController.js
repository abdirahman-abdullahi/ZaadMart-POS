const {
  listCategories,
  getCategory,
  addCategory,
  editCategory,
  changeCategoryStatus,
} = require("../services/categoryService");

const {
  successResponse,
} = require("../utils/apiResponse");

async function getCategories(req, res) {
  const categories = await listCategories();

  return successResponse(res, {
    message: "Categories retrieved successfully",
    data: categories,
  });
}

async function getCategoryById(req, res) {
  const category = await getCategory(
    req.params.categoryId
  );

  return successResponse(res, {
    message: "Category retrieved successfully",
    data: category,
  });
}

async function createCategory(req, res) {
  const category = await addCategory(req.body);

  return successResponse(res, {
    statusCode: 201,
    message: "Category created successfully",
    data: category,
  });
}

async function updateCategory(req, res) {
  const category = await editCategory(
    req.params.categoryId,
    req.body
  );

  return successResponse(res, {
    message: "Category updated successfully",
    data: category,
  });
}

async function setCategoryStatus(req, res) {
  const category = await changeCategoryStatus(
    req.params.categoryId,
    req.body.isActive
  );

  return successResponse(res, {
    message: req.body.isActive
      ? "Category activated successfully"
      : "Category deactivated successfully",
    data: category,
  });
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  setCategoryStatus,
};