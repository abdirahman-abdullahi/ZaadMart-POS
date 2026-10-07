const pool = require("../config/database");

/*
|--------------------------------------------------------------------------
| Find all / search customers
|--------------------------------------------------------------------------
*/
async function findCustomers({
  search = null,
  isActive = null,
  limit = 20,
  offset = 0,
}) {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        c.customer_name ILIKE $${values.length}
        OR c.customer_code ILIKE $${values.length}
        OR c.phone ILIKE $${values.length}
        OR c.email ILIKE $${values.length}
        OR c.kra_pin ILIKE $${values.length}
      )
    `);
  }

  if (isActive !== null) {
    values.push(isActive);

    conditions.push(
      `c.is_active = $${values.length}`
    );
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  values.push(limit);
  const limitPosition = values.length;

  values.push(offset);
  const offsetPosition = values.length;

  const result = await pool.query(
    `
    SELECT
      c.customer_id,
      c.customer_code,
      c.customer_name,
      c.phone,
      c.email,
      c.address,
      c.kra_pin,
      c.credit_limit,
      c.allow_credit,
      c.is_active,
      c.notes,
      c.created_at,
      c.updated_at
    FROM crm.customers c

    ${whereClause}

    ORDER BY c.customer_name

    LIMIT $${limitPosition}
    OFFSET $${offsetPosition}
    `,
    values
  );

  return result.rows;
}

/*
|--------------------------------------------------------------------------
| Count customers
|--------------------------------------------------------------------------
*/
async function countCustomers({
  search = null,
  isActive = null,
}) {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
      (
        customer_name ILIKE $${values.length}
        OR customer_code ILIKE $${values.length}
        OR phone ILIKE $${values.length}
        OR email ILIKE $${values.length}
        OR kra_pin ILIKE $${values.length}
      )
    `);
  }

  if (isActive !== null) {
    values.push(isActive);

    conditions.push(
      `is_active = $${values.length}`
    );
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  const result = await pool.query(
    `
    SELECT COUNT(*)::integer AS total
    FROM crm.customers
    ${whereClause}
    `,
    values
  );

  return result.rows[0].total;
}

/*
|--------------------------------------------------------------------------
| Find customer by ID
|--------------------------------------------------------------------------
*/
async function findCustomerById(customerId) {
  const result = await pool.query(
    `
    SELECT
      customer_id,
      customer_code,
      customer_name,
      phone,
      email,
      address,
      kra_pin,
      credit_limit,
      allow_credit,
      is_active,
      notes,
      created_at,
      updated_at
    FROM crm.customers
    WHERE customer_id = $1
    LIMIT 1
    `,
    [customerId]
  );

  return result.rows[0] || null;
}

/*
|--------------------------------------------------------------------------
| Find customer by customer code
|--------------------------------------------------------------------------
*/
async function findCustomerByCode(customerCode) {
  const result = await pool.query(
    `
    SELECT
      customer_id,
      customer_code,
      customer_name
    FROM crm.customers
    WHERE LOWER(customer_code) = LOWER($1)
    LIMIT 1
    `,
    [customerCode]
  );

  return result.rows[0] || null;
}

/*
|--------------------------------------------------------------------------
| Generate next customer code
|--------------------------------------------------------------------------
|
| Example:
| CUST-000001
| CUST-000002
| CUST-000003
|
*/
async function getNextCustomerCode() {
  const result = await pool.query(
    `
    SELECT
      COALESCE(
        MAX(
          CASE
            WHEN customer_code ~ '^CUST-[0-9]+$'
            THEN SUBSTRING(
              customer_code
              FROM '[0-9]+$'
            )::integer
            ELSE 0
          END
        ),
        0
      ) + 1 AS next_number
    FROM crm.customers
    `
  );

  const nextNumber =
    result.rows[0].next_number;

  return `CUST-${String(nextNumber).padStart(
    6,
    "0"
  )}`;
}

/*
|--------------------------------------------------------------------------
| Create customer
|--------------------------------------------------------------------------
*/
async function createCustomer(data) {
  const result = await pool.query(
    `
    INSERT INTO crm.customers (
      customer_code,
      customer_name,
      phone,
      email,
      address,
      kra_pin,
      credit_limit,
      allow_credit,
      notes
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
      $9
    )

    RETURNING
      customer_id,
      customer_code,
      customer_name,
      phone,
      email,
      address,
      kra_pin,
      credit_limit,
      allow_credit,
      is_active,
      notes,
      created_at,
      updated_at
    `,
    [
      data.customerCode,
      data.customerName,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.kraPin || null,
      data.creditLimit ?? 0,
      data.allowCredit ?? false,
      data.notes || null,
    ]
  );

  return result.rows[0];
}

/*
|--------------------------------------------------------------------------
| Update customer
|--------------------------------------------------------------------------
*/
async function updateCustomer(customerId, data) {
  const result = await pool.query(
    `
    UPDATE crm.customers

    SET
      customer_name =
        COALESCE($2, customer_name),

      phone =
        CASE
          WHEN $3::boolean
          THEN $4
          ELSE phone
        END,

      email =
        CASE
          WHEN $5::boolean
          THEN $6
          ELSE email
        END,

      address =
        CASE
          WHEN $7::boolean
          THEN $8
          ELSE address
        END,

      kra_pin =
        CASE
          WHEN $9::boolean
          THEN $10
          ELSE kra_pin
        END,

      notes =
        CASE
          WHEN $11::boolean
          THEN $12
          ELSE notes
        END,

      updated_at = CURRENT_TIMESTAMP

    WHERE customer_id = $1

    RETURNING
      customer_id,
      customer_code,
      customer_name,
      phone,
      email,
      address,
      kra_pin,
      credit_limit,
      allow_credit,
      is_active,
      notes,
      created_at,
      updated_at
    `,
    [
      customerId,

      data.customerName ?? null,

      data.phoneProvided,
      data.phone ?? null,

      data.emailProvided,
      data.email ?? null,

      data.addressProvided,
      data.address ?? null,

      data.kraPinProvided,
      data.kraPin ?? null,

      data.notesProvided,
      data.notes ?? null,
    ]
  );

  return result.rows[0] || null;
}

/*
|--------------------------------------------------------------------------
| Update credit settings
|--------------------------------------------------------------------------
*/
async function updateCustomerCredit(
  customerId,
  allowCredit,
  creditLimit
) {
  const result = await pool.query(
    `
    UPDATE crm.customers

    SET
      allow_credit = $2,
      credit_limit = $3,
      updated_at = CURRENT_TIMESTAMP

    WHERE customer_id = $1

    RETURNING
      customer_id,
      customer_code,
      customer_name,
      allow_credit,
      credit_limit,
      updated_at
    `,
    [
      customerId,
      allowCredit,
      creditLimit,
    ]
  );

  return result.rows[0] || null;
}

/*
|--------------------------------------------------------------------------
| Update active status
|--------------------------------------------------------------------------
*/
async function updateCustomerStatus(
  customerId,
  isActive
) {
  const result = await pool.query(
    `
    UPDATE crm.customers

    SET
      is_active = $2,
      updated_at = CURRENT_TIMESTAMP

    WHERE customer_id = $1

    RETURNING
      customer_id,
      customer_code,
      customer_name,
      is_active,
      updated_at
    `,
    [customerId, isActive]
  );

  return result.rows[0] || null;
}

/*
|--------------------------------------------------------------------------
| Get customer balance
|--------------------------------------------------------------------------
*/
async function findCustomerBalance(customerId) {
  const result = await pool.query(
    `
    SELECT
      customer_id,
      customer_code,
      customer_name,
      credit_limit,
      allow_credit,
      total_debit,
      total_credit,
      balance
    FROM crm.customer_balances
    WHERE customer_id = $1
    LIMIT 1
    `,
    [customerId]
  );

  return result.rows[0] || null;
}

async function getCustomerStatementOpeningBalance(
  customerId,
  fromDate = null
) {
  if (!fromDate) {
    return 0;
  }

  const result = await pool.query(
    `
      SELECT
        COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0)
          AS opening_balance
      FROM crm.customer_ledger
      WHERE customer_id = $1
        AND transaction_date < $2::date
    `,
    [customerId, fromDate]
  );

  return Number(result.rows[0].opening_balance);
}

async function getCustomerStatementTransactions(
  customerId,
  fromDate = null,
  toDate = null
) {
  const values = [customerId];
  const conditions = ["customer_id = $1"];

  if (fromDate) {
    values.push(fromDate);
    conditions.push(
      `transaction_date >= $${values.length}::date`
    );
  }

  if (toDate) {
    values.push(toDate);
    conditions.push(
      `transaction_date < ($${values.length}::date + INTERVAL '1 day')`
    );
  }

  const result = await pool.query(
    `
      SELECT
        customer_ledger_id,
        transaction_type,
        reference_type,
        reference_id,
        debit,
        credit,
        description,
        transaction_date,
        created_by,
        created_at
      FROM crm.customer_ledger
      WHERE ${conditions.join(" AND ")}
      ORDER BY transaction_date ASC, created_at ASC,
               customer_ledger_id ASC
    `,
    values
  );

  return result.rows;
}

async function getCustomerLedgerTotals(customerId) {
  const result = await pool.query(
    `
      SELECT
        COALESCE(SUM(debit), 0) AS total_debit,
        COALESCE(SUM(credit), 0) AS total_credit,
        COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0)
          AS balance
      FROM crm.customer_ledger
      WHERE customer_id = $1
    `,
    [customerId]
  );

  return result.rows[0];
}

module.exports = {
  findCustomers,
  countCustomers,
  findCustomerById,
  findCustomerByCode,
  getNextCustomerCode,
  createCustomer,
  updateCustomer,
  updateCustomerCredit,
  updateCustomerStatus,
  findCustomerBalance,
  getCustomerStatementOpeningBalance,
  getCustomerStatementTransactions,
  getCustomerLedgerTotals,
};