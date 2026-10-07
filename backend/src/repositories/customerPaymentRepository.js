const pool = require("../config/database");

async function getPaymentMethodByCode(
  client,
  paymentCode
) {
  const result = await client.query(
    `
      SELECT
        payment_method_id,
        payment_code,
        payment_name,
        requires_reference,
        is_cash,
        is_active
      FROM sales.payment_methods
      WHERE payment_code = $1
    `,
    [paymentCode]
  );

  return result.rows[0] || null;
}

async function generatePaymentNumber(client) {
  const result = await client.query(
    `
      SELECT public.next_document_number(
        'CUSTOMER_PAYMENT'
      ) AS payment_number
    `
  );

  return result.rows[0].payment_number;
}

async function createCustomerPayment(
  client,
  {
    paymentNumber,
    customerId,
    paymentMethodId,
    amount,
    referenceNumber,
    notes,
    receivedBy,
  }
) {
  const result = await client.query(
    `
      INSERT INTO crm.customer_payments (
        payment_number,
        customer_id,
        payment_method_id,
        amount,
        reference_number,
        notes,
        received_by
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      )
      RETURNING *
    `,
    [
      paymentNumber,
      customerId,
      paymentMethodId,
      amount,
      referenceNumber || null,
      notes || null,
      receivedBy,
    ]
  );

  return result.rows[0];
}

async function postCustomerLedgerCredit(
  client,
  {
    customerId,
    customerPaymentId,
    paymentNumber,
    amount,
    createdBy,
  }
) {
  const result = await client.query(
    `
      INSERT INTO crm.customer_ledger (
        customer_id,
        transaction_type,
        reference_type,
        reference_id,
        debit,
        credit,
        description,
        created_by
      )
      VALUES (
        $1,
        'PAYMENT',
        'CUSTOMER_PAYMENT',
        $2,
        0,
        $3,
        $4,
        $5
      )
      RETURNING *
    `,
    [
      customerId,
      customerPaymentId,
      amount,
      `Customer payment ${paymentNumber}`,
      createdBy,
    ]
  );

  return result.rows[0];
}

async function createPaymentAuditLog(
  client,
  {
    userId,
    customerPaymentId,
    payment,
    ipAddress,
  }
) {
  const result = await client.query(
    `
      INSERT INTO audit.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        reason,
        ip_address
      )
      VALUES (
        $1,
        'CREATE_CUSTOMER_PAYMENT',
        'CUSTOMER_PAYMENT',
        $2,
        NULL,
        $3::jsonb,
        'Customer payment recorded',
        $4
      )
      RETURNING *
    `,
    [
      userId,
      customerPaymentId,
      JSON.stringify(payment),
      ipAddress || null,
    ]
  );

  return result.rows[0];
}

module.exports = {
  getPaymentMethodByCode,
  generatePaymentNumber,
  createCustomerPayment,
  postCustomerLedgerCredit,
  createPaymentAuditLog,
};