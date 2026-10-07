const pool = require("../config/database");

async function getProductUnits(productId) {
  const result = await pool.query(
    `
    SELECT
      pu.product_unit_id,
      pu.product_id,
      pu.unit_id,

      u.unit_name,
      u.unit_symbol,
      u.unit_type,

      pu.conversion_factor,

      pu.is_purchase_unit,
      pu.is_sale_unit,

      pu.is_default_purchase_unit,
      pu.is_default_sale_unit,

      pu.created_at

    FROM catalog.product_units pu

    JOIN catalog.units u
      ON pu.unit_id = u.unit_id

    WHERE pu.product_id = $1

    ORDER BY
      pu.is_default_sale_unit DESC,
      pu.is_default_purchase_unit DESC,
      u.unit_name
    `,
    [productId]
  );

  return result.rows;
}

async function getProductUnitById(productUnitId) {
  const result = await pool.query(
    `
    SELECT
      product_unit_id,
      product_id,
      unit_id,
      conversion_factor,
      is_purchase_unit,
      is_sale_unit,
      is_default_purchase_unit,
      is_default_sale_unit,
      created_at
    FROM catalog.product_units
    WHERE product_unit_id = $1
    LIMIT 1
    `,
    [productUnitId]
  );

  return result.rows[0] || null;
}

async function findProductUnitByUnitId(productId, unitId) {
  const result = await pool.query(
    `
    SELECT
      product_unit_id,
      product_id,
      unit_id
    FROM catalog.product_units
    WHERE product_id = $1
      AND unit_id = $2
    LIMIT 1
    `,
    [productId, unitId]
  );

  return result.rows[0] || null;
}

async function createProductUnit(client, data) {
  const result = await client.query(
    `
    INSERT INTO catalog.product_units (
      product_id,
      unit_id,
      conversion_factor,
      is_purchase_unit,
      is_sale_unit,
      is_default_purchase_unit,
      is_default_sale_unit
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7
    )
    RETURNING
      product_unit_id,
      product_id,
      unit_id,
      conversion_factor,
      is_purchase_unit,
      is_sale_unit,
      is_default_purchase_unit,
      is_default_sale_unit,
      created_at
    `,
    [
      data.productId,
      data.unitId,
      data.conversionFactor,
      data.isPurchaseUnit,
      data.isSaleUnit,
      data.isDefaultPurchaseUnit,
      data.isDefaultSaleUnit,
    ]
  );

  return result.rows[0];
}

async function updateProductUnit(productUnitId, data) {
  const result = await pool.query(
    `
    UPDATE catalog.product_units
    SET
      conversion_factor = $2,
      is_purchase_unit = $3,
      is_sale_unit = $4
    WHERE product_unit_id = $1
    RETURNING
      product_unit_id,
      product_id,
      unit_id,
      conversion_factor,
      is_purchase_unit,
      is_sale_unit,
      is_default_purchase_unit,
      is_default_sale_unit
    `,
    [
      productUnitId,
      data.conversionFactor,
      data.isPurchaseUnit,
      data.isSaleUnit,
    ]
  );

  return result.rows[0] || null;
}

async function clearDefaultPurchaseUnit(client, productId) {
  await client.query(
    `
    UPDATE catalog.product_units
    SET is_default_purchase_unit = FALSE
    WHERE product_id = $1
    `,
    [productId]
  );
}

async function clearDefaultSaleUnit(client, productId) {
  await client.query(
    `
    UPDATE catalog.product_units
    SET is_default_sale_unit = FALSE
    WHERE product_id = $1
    `,
    [productId]
  );
}

async function setDefaultPurchaseUnit(
  client,
  productId,
  productUnitId
) {
  const result = await client.query(
    `
    UPDATE catalog.product_units
    SET
      is_default_purchase_unit = TRUE,
      is_purchase_unit = TRUE
    WHERE product_unit_id = $1
      AND product_id = $2
    RETURNING *
    `,
    [productUnitId, productId]
  );

  return result.rows[0] || null;
}

async function setDefaultSaleUnit(
  client,
  productId,
  productUnitId
) {
  const result = await client.query(
    `
    UPDATE catalog.product_units
    SET
      is_default_sale_unit = TRUE,
      is_sale_unit = TRUE
    WHERE product_unit_id = $1
      AND product_id = $2
    RETURNING *
    `,
    [productUnitId, productId]
  );

  return result.rows[0] || null;
}

async function deleteProductUnit(productId, productUnitId) {
  const result = await pool.query(
    `
    DELETE FROM catalog.product_units
    WHERE product_unit_id = $1
      AND product_id = $2
    RETURNING *
    `,
    [productUnitId, productId]
  );

  return result.rows[0] || null;
}

module.exports = {
  getProductUnits,
  getProductUnitById,
  findProductUnitByUnitId,
  createProductUnit,
  updateProductUnit,
  clearDefaultPurchaseUnit,
  clearDefaultSaleUnit,
  setDefaultPurchaseUnit,
  setDefaultSaleUnit,
  deleteProductUnit,
};