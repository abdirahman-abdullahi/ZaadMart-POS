const pool = require("../config/database");

async function getProductPriceHistory(productId) {
  const result = await pool.query(
    `
    SELECT
      pp.product_price_id,
      pp.product_id,
      pp.unit_id,
      u.unit_name,
      u.unit_symbol,
      pp.selling_price,
      pp.effective_from,
      pp.effective_to,
      pp.is_active,
      pp.created_by,
      pp.created_at
    FROM catalog.product_prices pp
    JOIN catalog.units u
      ON u.unit_id = pp.unit_id
    WHERE pp.product_id = $1
    ORDER BY pp.effective_from DESC
    `,
    [productId]
  );

  return result.rows;
}

async function getCurrentProductPrices(productId) {
  const result = await pool.query(
    `
    SELECT
      pp.product_price_id,
      pp.product_id,
      pp.unit_id,
      u.unit_name,
      u.unit_symbol,
      pp.selling_price,
      pp.effective_from,
      pp.effective_to,
      pp.is_active,
      pp.created_by,
      pp.created_at
    FROM catalog.product_prices pp
    JOIN catalog.units u
      ON u.unit_id = pp.unit_id
    WHERE pp.product_id = $1
      AND pp.is_active = TRUE
      AND pp.effective_to IS NULL
    ORDER BY u.unit_name
    `,
    [productId]
  );

  return result.rows;
}

async function getCurrentPriceForUnit(
  client,
  productId,
  unitId
) {
  const result = await client.query(
    `
    SELECT *
    FROM catalog.product_prices
    WHERE product_id = $1
      AND unit_id = $2
      AND is_active = TRUE
      AND effective_to IS NULL
    ORDER BY effective_from DESC
    LIMIT 1
    FOR UPDATE
    `,
    [productId, unitId]
  );

  return result.rows[0] || null;
}

async function closeCurrentPrice(
  client,
  productPriceId,
  effectiveTo
) {
  const result = await client.query(
    `
    UPDATE catalog.product_prices
    SET
      effective_to = $2,
      is_active = FALSE
    WHERE product_price_id = $1
    RETURNING *
    `,
    [productPriceId, effectiveTo]
  );

  return result.rows[0] || null;
}

async function createProductPrice(client, data) {
  const result = await client.query(
    `
    INSERT INTO catalog.product_prices (
      product_id,
      unit_id,
      selling_price,
      effective_from,
      effective_to,
      is_active,
      created_by
    )
    VALUES ($1, $2, $3, $4, NULL, TRUE, $5)
    RETURNING *
    `,
    [
      data.productId,
      data.unitId,
      data.sellingPrice,
      data.effectiveFrom,
      data.createdBy,
    ]
  );

  return result.rows[0];
}

module.exports = {
  getProductPriceHistory,
  getCurrentProductPrices,
  getCurrentPriceForUnit,
  closeCurrentPrice,
  createProductPrice,
};