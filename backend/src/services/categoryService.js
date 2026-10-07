const {
  conflict,
  notFound,
  badRequest,
} = require("../utils/httpErrors");

const {
  findAllCategories,
  findCategoryById,
  findCategoryByName,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  isDescendant,
} = require("../repositories/categoryRepository");

async function listCategories() {
  return findAllCategories();
}

async function getCategory(categoryId) {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw notFound(
      "Category not found",
      "CATEGORY_NOT_FOUND"
    );
  }

  return category;
}

async function addCategory(data) {
  const categoryName = data.categoryName.trim();

  const existing =
    await findCategoryByName(categoryName);

  if (existing) {
    throw conflict(
      "A category with this name already exists",
      "CATEGORY_NAME_EXISTS"
    );
  }

  if (data.parentCategoryId) {
    const parent = await findCategoryById(
      data.parentCategoryId
    );

    if (!parent) {
      throw badRequest(
        "Parent category not found",
        "PARENT_CATEGORY_NOT_FOUND"
      );
    }

    if (!parent.is_active) {
      throw badRequest(
        "An inactive category cannot be used as a parent",
        "PARENT_CATEGORY_INACTIVE"
      );
    }
  }

  return createCategory({
    categoryName,
    parentCategoryId:
      data.parentCategoryId || null,
    description:
      data.description?.trim() || null,
  });
}

async function editCategory(categoryId, data) {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw notFound(
      "Category not found",
      "CATEGORY_NOT_FOUND"
    );
  }

  if (data.categoryName !== undefined) {
    const name = data.categoryName.trim();

    const existing = await findCategoryByName(name);

    if (
      existing &&
      existing.category_id !== categoryId
    ) {
      throw conflict(
        "A category with this name already exists",
        "CATEGORY_NAME_EXISTS"
      );
    }
  }

  if (data.parentCategoryId !== undefined) {
    if (data.parentCategoryId === categoryId) {
      throw badRequest(
        "A category cannot be its own parent",
        "CATEGORY_CANNOT_PARENT_ITSELF"
      );
    }

    if (data.parentCategoryId !== null) {
      const parent = await findCategoryById(
        data.parentCategoryId
      );

      if (!parent) {
        throw badRequest(
          "Parent category not found",
          "PARENT_CATEGORY_NOT_FOUND"
        );
      }

      if (!parent.is_active) {
        throw badRequest(
          "An inactive category cannot be used as a parent",
          "PARENT_CATEGORY_INACTIVE"
        );
      }

      const createsCycle = await isDescendant(
        categoryId,
        data.parentCategoryId
      );

      if (createsCycle) {
        throw badRequest(
          "This parent selection would create a category hierarchy cycle",
          "CATEGORY_HIERARCHY_CYCLE"
        );
      }
    }
  }

  return updateCategory(categoryId, {
    categoryNameProvided:
      data.categoryName !== undefined,

    categoryName:
      data.categoryName !== undefined
        ? data.categoryName.trim()
        : null,

    parentCategoryIdProvided:
      data.parentCategoryId !== undefined,

    parentCategoryId:
      data.parentCategoryId ?? null,

    descriptionProvided:
      data.description !== undefined,

    description:
      data.description === null
        ? null
        : data.description?.trim(),
  });
}

async function changeCategoryStatus(
  categoryId,
  isActive
) {
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw notFound(
      "Category not found",
      "CATEGORY_NOT_FOUND"
    );
  }

  return updateCategoryStatus(
    categoryId,
    isActive
  );
}

module.exports = {
  listCategories,
  getCategory,
  addCategory,
  editCategory,
  changeCategoryStatus,
};