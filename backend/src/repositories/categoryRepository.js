const pool = require("../config/database");

async function findAllCategories() {
  const result = await pool.query(`
    SELECT
      c.category_id,
      c.category_name,
      c.parent_category_id,
      p.category_name AS parent_category_name,
      c.description,
      c.is_active,
      c.created_at,
      c.updated_at
    FROM catalog.categories c
    LEFT JOIN catalog.categories p
      ON p.category_id = c.parent_category_id
    ORDER BY
      COALESCE(p.category_name, c.category_name),
      c.parent_category_id NULLS FIRST,
      c.category_name
  `);

  return result.rows;
}

async function findCategoryById(categoryId) {
  const result = await pool.query(
    `
    SELECT
      c.category_id,
      c.category_name,
      c.parent_category_id,
      p.category_name AS parent_category_name,
      c.description,
      c.is_active,
      c.created_at,
      c.updated_at
    FROM catalog.categories c
    LEFT JOIN catalog.categories p
      ON p.category_id = c.parent_category_id
    WHERE c.category_id = $1
    `,
    [categoryId]
  );

  return result.rows[0] || null;
}

async function findCategoryByName(categoryName) {
  const result = await pool.query(
    `
    SELECT *
    FROM catalog.categories
    WHERE LOWER(category_name) = LOWER($1)
    LIMIT 1
    `,
    [categoryName]
  );

  return result.rows[0] || null;
}

async function createCategory(data) {
  const result = await pool.query(
    `
    INSERT INTO catalog.categories (
      category_name,
      parent_category_id,
      description
    )
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [
      data.categoryName,
      data.parentCategoryId || null,
      data.description || null,
    ]
  );

  return result.rows[0];
}

async function updateCategory(categoryId, data) {
  const result = await pool.query(
    `
    UPDATE catalog.categories
    SET
      category_name =
        CASE WHEN $2::boolean
          THEN $3
          ELSE category_name
        END,

      parent_category_id =
        CASE WHEN $4::boolean
          THEN $5::uuid
          ELSE parent_category_id
        END,

      description =
        CASE WHEN $6::boolean
          THEN $7
          ELSE description
        END,

      updated_at = CURRENT_TIMESTAMP

    WHERE category_id = $1
    RETURNING *
    `,
    [
      categoryId,

      data.categoryNameProvided,
      data.categoryName || null,

      data.parentCategoryIdProvided,
      data.parentCategoryId || null,

      data.descriptionProvided,
      data.description ?? null,
    ]
  );

  return result.rows[0] || null;
}

async function updateCategoryStatus(categoryId, isActive) {
  const result = await pool.query(
    `
    UPDATE catalog.categories
    SET
      is_active = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE category_id = $1
    RETURNING *
    `,
    [categoryId, isActive]
  );

  return result.rows[0] || null;
}

/*
 * Returns true if proposedParentId is already somewhere
 * below categoryId in the category tree.
 *
 * This prevents:
 *
 * Food
 *   └── Beverages
 *        └── Soft Drinks
 *
 * from later making Food a child of Soft Drinks.
 */
async function isDescendant(categoryId, proposedParentId) {
  const result = await pool.query(
    `
    WITH RECURSIVE descendants AS (
      SELECT category_id
      FROM catalog.categories
      WHERE parent_category_id = $1

      UNION ALL

      SELECT c.category_id
      FROM catalog.categories c
      INNER JOIN descendants d
        ON c.parent_category_id = d.category_id
    )
    SELECT EXISTS (
      SELECT 1
      FROM descendants
      WHERE category_id = $2
    ) AS is_descendant
    `,
    [categoryId, proposedParentId]
  );

  return result.rows[0].is_descendant;
}

module.exports = {
  findAllCategories,
  findCategoryById,
  findCategoryByName,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  isDescendant,
};