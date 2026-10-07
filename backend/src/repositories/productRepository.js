const pool = require("../config/database");

async function findProductBySku(sku) {
  const result = await pool.query(
    `
    SELECT product_id
    FROM catalog.products
    WHERE LOWER(sku) = LOWER($1)
    LIMIT 1
    `,
    [sku]
  );

  return result.rows[0] || null;
}

async function findProductById(productId) {
  const result = await pool.query(
    `
    SELECT
      p.product_id,
      p.sku,
      p.product_name,
      p.description,

      p.category_id,
      c.category_name,

      p.brand_id,
      b.brand_name,

      p.base_unit_id,
      u.unit_name AS base_unit_name,
      u.unit_symbol AS base_unit_symbol,
      u.unit_type AS base_unit_type,

      p.tax_category_id,
      tc.tax_code,
      tc.tax_name,
      tc.tax_rate,

      p.track_stock,
      p.allow_fractional_quantity,

      p.minimum_stock,
      p.reorder_quantity,

      p.is_active,

      p.created_at,
      p.updated_at

    FROM catalog.products p

    LEFT JOIN catalog.categories c
      ON p.category_id = c.category_id

    LEFT JOIN catalog.brands b
      ON p.brand_id = b.brand_id

    JOIN catalog.units u
      ON p.base_unit_id = u.unit_id

    JOIN catalog.tax_categories tc
      ON p.tax_category_id = tc.tax_category_id

    WHERE p.product_id = $1

    LIMIT 1
    `,
    [productId]
  );

  return result.rows[0] || null;
}

async function createProduct(data) {
  const result = await pool.query(
    `
    INSERT INTO catalog.products (
      sku,
      product_name,
      description,
      category_id,
      brand_id,
      base_unit_id,
      tax_category_id,
      track_stock,
      allow_fractional_quantity,
      minimum_stock,
      reorder_quantity
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11
    )

    RETURNING
      product_id,
      sku,
      product_name,
      description,
      category_id,
      brand_id,
      base_unit_id,
      tax_category_id,
      track_stock,
      allow_fractional_quantity,
      minimum_stock,
      reorder_quantity,
      is_active,
      created_at,
      updated_at
    `,
    [
      data.sku,
      data.productName,
      data.description,
      data.categoryId,
      data.brandId,
      data.baseUnitId,
      data.taxCategoryId,
      data.trackStock,
      data.allowFractionalQuantity,
      data.minimumStock,
      data.reorderQuantity,
    ]
  );

  return result.rows[0];
}

async function listProducts({
  search,
  categoryId,
  brandId,
  isActive,
  limit,
  offset,
}) {
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        p.product_name ILIKE $${values.length}
        OR p.sku ILIKE $${values.length}
        OR EXISTS (
          SELECT 1
          FROM catalog.product_barcodes pb
          WHERE pb.product_id = p.product_id
            AND pb.barcode ILIKE $${values.length}
        )
      )
    `);
  }

  if (categoryId) {
    values.push(categoryId);
    conditions.push(`p.category_id = $${values.length}`);
  }

  if (brandId) {
    values.push(brandId);
    conditions.push(`p.brand_id = $${values.length}`);
  }

  if (typeof isActive === "boolean") {
    values.push(isActive);
    conditions.push(`p.is_active = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const countResult = await pool.query(
    `
    SELECT COUNT(*)::INTEGER AS total

    FROM catalog.products p

    ${whereClause}
    `,
    values
  );

  const queryValues = [...values];

  queryValues.push(limit);
  const limitParameter = queryValues.length;

  queryValues.push(offset);
  const offsetParameter = queryValues.length;

  const result = await pool.query(
    `
    SELECT
      p.product_id,
      p.sku,
      p.product_name,

      c.category_name,
      b.brand_name,

      u.unit_name AS base_unit_name,
      u.unit_symbol AS base_unit_symbol,

      tc.tax_code,
      tc.tax_rate,

      p.track_stock,
      p.allow_fractional_quantity,

      p.minimum_stock,
      p.reorder_quantity,

      p.is_active,
      p.created_at,
      p.updated_at

    FROM catalog.products p

    LEFT JOIN catalog.categories c
      ON p.category_id = c.category_id

    LEFT JOIN catalog.brands b
      ON p.brand_id = b.brand_id

    JOIN catalog.units u
      ON p.base_unit_id = u.unit_id

    JOIN catalog.tax_categories tc
      ON p.tax_category_id = tc.tax_category_id

    ${whereClause}

    ORDER BY
      p.product_name,
      p.sku

    LIMIT $${limitParameter}
    OFFSET $${offsetParameter}
    `,
    queryValues
  );

  return {
    products: result.rows,
    total: countResult.rows[0].total,
  };
}

async function updateProduct(productId, data) {
  const result = await pool.query(
    `
    UPDATE catalog.products

    SET
      sku = $2,
      product_name = $3,
      description = $4,
      category_id = $5,
      brand_id = $6,
      base_unit_id = $7,
      tax_category_id = $8,
      track_stock = $9,
      allow_fractional_quantity = $10,
      minimum_stock = $11,
      reorder_quantity = $12

    WHERE product_id = $1

    RETURNING product_id
    `,
    [
      productId,
      data.sku,
      data.productName,
      data.description,
      data.categoryId,
      data.brandId,
      data.baseUnitId,
      data.taxCategoryId,
      data.trackStock,
      data.allowFractionalQuantity,
      data.minimumStock,
      data.reorderQuantity,
    ]
  );

  return result.rows[0] || null;
}

async function setProductActive(productId, isActive) {
  const result = await pool.query(
    `
    UPDATE catalog.products

    SET is_active = $2

    WHERE product_id = $1

    RETURNING product_id
    `,
    [productId, isActive]
  );

  return result.rows[0] || null;
}

async function getCategoryById(categoryId) {
  const result = await pool.query(
    `
    SELECT
      category_id,
      category_name,
      is_active
    FROM catalog.categories
    WHERE category_id = $1
    LIMIT 1
    `,
    [categoryId]
  );

  return result.rows[0] || null;
}

async function getBrandById(brandId) {
  const result = await pool.query(
    `
    SELECT
      brand_id,
      brand_name,
      is_active
    FROM catalog.brands
    WHERE brand_id = $1
    LIMIT 1
    `,
    [brandId]
  );

  return result.rows[0] || null;
}

async function getUnitById(unitId) {
  const result = await pool.query(
    `
    SELECT
      unit_id,
      unit_name,
      unit_symbol,
      unit_type,
      is_active
    FROM catalog.units
    WHERE unit_id = $1
    LIMIT 1
    `,
    [unitId]
  );

  return result.rows[0] || null;
}

async function getTaxCategoryById(taxCategoryId) {
  const result = await pool.query(
    `
    SELECT
      tax_category_id,
      tax_code,
      tax_name,
      tax_rate,
      is_active
    FROM catalog.tax_categories
    WHERE tax_category_id = $1
    LIMIT 1
    `,
    [taxCategoryId]
  );

  return result.rows[0] || null;
}

async function getReferenceData() {
  const [
    categories,
    brands,
    units,
    taxCategories,
  ] = await Promise.all([
    pool.query(`
      SELECT
        category_id,
        category_name,
        parent_category_id
      FROM catalog.categories
      WHERE is_active = TRUE
      ORDER BY category_name
    `),

    pool.query(`
      SELECT
        brand_id,
        brand_name
      FROM catalog.brands
      WHERE is_active = TRUE
      ORDER BY brand_name
    `),

    pool.query(`
      SELECT
        unit_id,
        unit_name,
        unit_symbol,
        unit_type
      FROM catalog.units
      WHERE is_active = TRUE
      ORDER BY unit_name
    `),

    pool.query(`
      SELECT
        tax_category_id,
        tax_code,
        tax_name,
        tax_rate
      FROM catalog.tax_categories
      WHERE is_active = TRUE
      ORDER BY tax_code
    `),
  ]);

  return {
    categories: categories.rows,
    brands: brands.rows,
    units: units.rows,
    taxCategories: taxCategories.rows,
  };
}

module.exports = {
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
};