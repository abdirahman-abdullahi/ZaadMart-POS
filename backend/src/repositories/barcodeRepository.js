const pool = require("../config/database");

async function findBarcode(barcode) {
  const result = await pool.query(
    `
    SELECT
      pb.barcode_id,
      pb.product_id,
      pb.barcode,
      pb.is_primary,
      pb.created_at
    FROM catalog.product_barcodes pb
    WHERE pb.barcode = $1
    LIMIT 1
    `,
    [barcode]
  );

  return result.rows[0] || null;
}

async function getBarcodesForProduct(productId) {
  const result = await pool.query(
    `
    SELECT
      barcode_id,
      product_id,
      barcode,
      is_primary,
      created_at
    FROM catalog.product_barcodes
    WHERE product_id = $1
    ORDER BY
      is_primary DESC,
      created_at ASC
    `,
    [productId]
  );

  return result.rows;
}

async function createBarcode(
  client,
  productId,
  barcode,
  isPrimary
) {
  const result = await client.query(
    `
    INSERT INTO catalog.product_barcodes (
      product_id,
      barcode,
      is_primary
    )
    VALUES ($1, $2, $3)
    RETURNING
      barcode_id,
      product_id,
      barcode,
      is_primary,
      created_at
    `,
    [productId, barcode, isPrimary]
  );

  return result.rows[0];
}

async function clearPrimaryBarcodes(client, productId) {
  await client.query(
    `
    UPDATE catalog.product_barcodes
    SET is_primary = FALSE
    WHERE product_id = $1
    `,
    [productId]
  );
}

async function findBarcodeById(barcodeId) {
  const result = await pool.query(
    `
    SELECT
      barcode_id,
      product_id,
      barcode,
      is_primary,
      created_at
    FROM catalog.product_barcodes
    WHERE barcode_id = $1
    LIMIT 1
    `,
    [barcodeId]
  );

  return result.rows[0] || null;
}

async function setPrimaryBarcode(
  client,
  productId,
  barcodeId
) {
  await client.query(
    `
    UPDATE catalog.product_barcodes
    SET is_primary = FALSE
    WHERE product_id = $1
    `,
    [productId]
  );

  const result = await client.query(
    `
    UPDATE catalog.product_barcodes
    SET is_primary = TRUE
    WHERE barcode_id = $1
      AND product_id = $2
    RETURNING
      barcode_id,
      product_id,
      barcode,
      is_primary,
      created_at
    `,
    [barcodeId, productId]
  );

  return result.rows[0] || null;
}

async function deleteBarcode(productId, barcodeId) {
  const result = await pool.query(
    `
    DELETE FROM catalog.product_barcodes
    WHERE barcode_id = $1
      AND product_id = $2
    RETURNING
      barcode_id,
      barcode,
      is_primary
    `,
    [barcodeId, productId]
  );

  return result.rows[0] || null;
}

async function findProductByBarcode(barcode) {
  const result = await pool.query(
    `
    SELECT
      p.product_id,
      p.sku,
      p.product_name,
      p.description,

      pb.barcode,
      pb.is_primary,

      p.category_id,
      c.category_name,

      p.brand_id,
      b.brand_name,

      p.base_unit_id,
      u.unit_name AS base_unit_name,
      u.unit_symbol AS base_unit_symbol,

      p.tax_category_id,
      tc.tax_code,
      tc.tax_name,
      tc.tax_rate,

      p.track_stock,
      p.allow_fractional_quantity,
      p.minimum_stock,
      p.reorder_quantity,
      p.is_active

    FROM catalog.product_barcodes pb

    JOIN catalog.products p
      ON pb.product_id = p.product_id

    LEFT JOIN catalog.categories c
      ON p.category_id = c.category_id

    LEFT JOIN catalog.brands b
      ON p.brand_id = b.brand_id

    JOIN catalog.units u
      ON p.base_unit_id = u.unit_id

    JOIN catalog.tax_categories tc
      ON p.tax_category_id = tc.tax_category_id

    WHERE pb.barcode = $1

    LIMIT 1
    `,
    [barcode]
  );

  return result.rows[0] || null;
}

module.exports = {
  findBarcode,
  getBarcodesForProduct,
  createBarcode,
  clearPrimaryBarcodes,
  findBarcodeById,
  setPrimaryBarcode,
  deleteBarcode,
  findProductByBarcode,
};