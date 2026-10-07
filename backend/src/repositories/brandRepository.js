const pool = require("../config/database");

async function findAllBrands() {
  const result = await pool.query(
    `
    SELECT
      brand_id,
      brand_name,
      description,
      is_active,
      created_at,
      updated_at
    FROM catalog.brands
    ORDER BY brand_name
    `
  );

  return result.rows;
}

async function findBrandById(brandId) {
  const result = await pool.query(
    `
    SELECT
      brand_id,
      brand_name,
      description,
      is_active,
      created_at,
      updated_at
    FROM catalog.brands
    WHERE brand_id = $1
    LIMIT 1
    `,
    [brandId]
  );

  return result.rows[0] || null;
}

async function findBrandByName(brandName) {
  const result = await pool.query(
    `
    SELECT
      brand_id,
      brand_name,
      description,
      is_active,
      created_at,
      updated_at
    FROM catalog.brands
    WHERE LOWER(brand_name) = LOWER($1)
    LIMIT 1
    `,
    [brandName]
  );

  return result.rows[0] || null;
}

async function createBrand(data) {
  const result = await pool.query(
    `
    INSERT INTO catalog.brands (
      brand_name,
      description
    )
    VALUES ($1, $2)
    RETURNING
      brand_id,
      brand_name,
      description,
      is_active,
      created_at,
      updated_at
    `,
    [
      data.brandName,
      data.description || null,
    ]
  );

  return result.rows[0];
}

async function updateBrand(brandId, data) {
  const result = await pool.query(
    `
    UPDATE catalog.brands
    SET
      brand_name =
        CASE
          WHEN $2::boolean
          THEN $3
          ELSE brand_name
        END,

      description =
        CASE
          WHEN $4::boolean
          THEN $5
          ELSE description
        END,

      updated_at = CURRENT_TIMESTAMP

    WHERE brand_id = $1

    RETURNING
      brand_id,
      brand_name,
      description,
      is_active,
      created_at,
      updated_at
    `,
    [
      brandId,

      data.brandNameProvided,
      data.brandName || null,

      data.descriptionProvided,
      data.description ?? null,
    ]
  );

  return result.rows[0] || null;
}

async function updateBrandStatus(
  brandId,
  isActive
) {
  const result = await pool.query(
    `
    UPDATE catalog.brands
    SET
      is_active = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE brand_id = $1
    RETURNING
      brand_id,
      brand_name,
      description,
      is_active,
      created_at,
      updated_at
    `,
    [brandId, isActive]
  );

  return result.rows[0] || null;
}

module.exports = {
  findAllBrands,
  findBrandById,
  findBrandByName,
  createBrand,
  updateBrand,
  updateBrandStatus,
};