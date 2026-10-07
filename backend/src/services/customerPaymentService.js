const pool = require("../config/database");

const customerPaymentRepository =
  require("../repositories/customerPaymentRepository");

const {
  badRequest,
  notFound,
} = require("../utils/httpErrors");

async function recordCustomerPayment({
  customerId,
  paymentCode,
  amount,
  referenceNumber,
  notes,
  userId,
  ipAddress,
}) {
  const numericAmount = Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    throw badRequest(
      "Payment amount must be greater than zero",
      "INVALID_PAYMENT_AMOUNT"
    );
  }

  const normalizedPaymentCode =
    String(paymentCode || "")
      .trim()
      .toUpperCase();

  if (!normalizedPaymentCode) {
    throw badRequest(
      "Payment method is required",
      "PAYMENT_METHOD_REQUIRED"
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // -------------------------------------------------
    // 1. Find and lock customer
    // -------------------------------------------------

    const customerResult = await client.query(
      `
        SELECT
          customer_id,
          customer_code,
          customer_name,
          phone,
          allow_credit,
          credit_limit,
          is_active
        FROM crm.customers
        WHERE customer_id = $1
        FOR UPDATE
      `,
      [customerId]
    );

    const customer =
      customerResult.rows[0];

    if (!customer) {
      throw notFound(
        "Customer not found",
        "CUSTOMER_NOT_FOUND"
      );
    }

    if (!customer.is_active) {
      throw badRequest(
        "Cannot record payment for an inactive customer",
        "CUSTOMER_INACTIVE"
      );
    }

    // -------------------------------------------------
    // 2. Get payment method
    // -------------------------------------------------

    const paymentMethod =
      await customerPaymentRepository
        .getPaymentMethodByCode(
          client,
          normalizedPaymentCode
        );

    if (
      !paymentMethod ||
      !paymentMethod.is_active
    ) {
      throw badRequest(
        "Invalid or inactive payment method",
        "INVALID_PAYMENT_METHOD"
      );
    }

    // -------------------------------------------------
    // 3. Validate reference
    // -------------------------------------------------

    const cleanedReference =
      String(referenceNumber || "").trim();

    if (
      paymentMethod.requires_reference &&
      !cleanedReference
    ) {
      throw badRequest(
        `${paymentMethod.payment_name} requires a reference number`,
        "PAYMENT_REFERENCE_REQUIRED"
      );
    }

    // -------------------------------------------------
    // Check customer's current outstanding balance
    // -------------------------------------------------

    const balanceResult = await client.query(
        `
            SELECT
                COALESCE(SUM(debit), 0) -
                COALESCE(SUM(credit), 0) AS balance
            FROM crm.customer_ledger
            WHERE customer_id = $1
        `,
        [customerId]
    );

    const outstandingBalance =
        Number(balanceResult.rows[0].balance);

    if (outstandingBalance <= 0) {
        throw badRequest(
            "Customer does not have an outstanding balance",
            "NO_OUTSTANDING_BALANCE"
        );
    }

    if (numericAmount > outstandingBalance) {
        throw badRequest(
            `Payment amount exceeds outstanding balance of KES ${outstandingBalance.toFixed(
            2
        )}`,
        "PAYMENT_EXCEEDS_BALANCE"
    );
    }

    // -------------------------------------------------
    // 4. Generate CP-########
    // -------------------------------------------------

    const paymentNumber =
      await customerPaymentRepository
        .generatePaymentNumber(client);

    // -------------------------------------------------
    // 5. Create customer payment
    // -------------------------------------------------

    const payment =
      await customerPaymentRepository
        .createCustomerPayment(
          client,
          {
            paymentNumber,
            customerId,
            paymentMethodId:
              paymentMethod.payment_method_id,
            amount: numericAmount,
            referenceNumber:
              cleanedReference || null,
            notes:
              notes
                ? String(notes).trim()
                : null,
            receivedBy: userId,
          }
        );

    // -------------------------------------------------
    // 6. Credit customer ledger
    // -------------------------------------------------

    await customerPaymentRepository
      .postCustomerLedgerCredit(
        client,
        {
          customerId,
          customerPaymentId:
            payment.customer_payment_id,
          paymentNumber,
          amount: numericAmount,
          createdBy: userId,
        }
      );

    // -------------------------------------------------
    // 7. Audit
    // -------------------------------------------------

    await customerPaymentRepository
      .createPaymentAuditLog(
        client,
        {
          userId,
          customerPaymentId:
            payment.customer_payment_id,

          payment: {
            payment_number:
              payment.payment_number,

            customer_id:
              customer.customer_id,

            customer_code:
              customer.customer_code,

            payment_method:
              paymentMethod.payment_code,

            amount:
              numericAmount,

            reference_number:
              payment.reference_number,
          },

          ipAddress,
        }
      );

    // -------------------------------------------------
    // 8. Commit everything
    // -------------------------------------------------

    await client.query("COMMIT");

    return {
      customer_payment_id:
        payment.customer_payment_id,

      payment_number:
        payment.payment_number,

      customer: {
        customer_id:
          customer.customer_id,

        customer_code:
          customer.customer_code,

        customer_name:
          customer.customer_name,
      },

      payment_method: {
        payment_method_id:
          paymentMethod.payment_method_id,

        payment_code:
          paymentMethod.payment_code,

        payment_name:
          paymentMethod.payment_name,
      },

      amount:
        Number(payment.amount),

      reference_number:
        payment.reference_number,

      notes:
        payment.notes,

      payment_date:
        payment.payment_date,

      received_by:
        payment.received_by,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  recordCustomerPayment,
};