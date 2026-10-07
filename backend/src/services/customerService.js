const customerRepository =
  require("../repositories/customerRepository");

const {
  notFound,
  badRequest,
} = require("../utils/httpErrors");


/*
|--------------------------------------------------------------------------
| Create customer
|--------------------------------------------------------------------------
*/
async function createNewCustomer(data) {
  // customerRepository already contains the logic
  // for generating CUST-000001, CUST-000002, etc.
  const customerCode =
    await customerRepository.getNextCustomerCode();

  const customer =
    await customerRepository.createCustomer({
      customerCode,

      customerName:
        data.customerName.trim(),

      phone:
        data.phone?.trim() || null,

      email:
        data.email?.trim() || null,

      address:
        data.address?.trim() || null,

      kraPin:
        data.kraPin?.trim() || null,

      creditLimit:
        Number(data.creditLimit ?? 0),

      allowCredit:
        data.allowCredit ?? false,

      notes:
        data.notes?.trim() || null,
    });

  return customer;
}


/*
|--------------------------------------------------------------------------
| Get customers
|--------------------------------------------------------------------------
*/
async function getCustomers({
  search,
  isActive,
  limit,
  offset,
}) {
  const customers =
    await customerRepository.findCustomers({
      search,
      isActive,
      limit,
      offset,
    });

  const total =
    await customerRepository.countCustomers({
      search,
      isActive,
    });

  return {
    customers,
    total,
  };
}


/*
|--------------------------------------------------------------------------
| Get one customer
|--------------------------------------------------------------------------
*/
async function getCustomer(customerId) {
  const customer =
    await customerRepository.findCustomerById(
      customerId
    );

  if (!customer) {
    throw notFound("Customer not found");
  }

  return customer;
}


/*
|--------------------------------------------------------------------------
| Update customer
|--------------------------------------------------------------------------
*/
async function editCustomer(
  customerId,
  data
) {
  await getCustomer(customerId);

  const customer =
    await customerRepository.updateCustomer(
      customerId,
      {
        customerName:
          data.customerName !== undefined
            ? data.customerName.trim()
            : null,

        phoneProvided:
          data.phone !== undefined,

        phone:
          data.phone === null
            ? null
            : data.phone?.trim(),

        emailProvided:
          data.email !== undefined,

        email:
          data.email === null
            ? null
            : data.email?.trim(),

        addressProvided:
          data.address !== undefined,

        address:
          data.address === null
            ? null
            : data.address?.trim(),

        kraPinProvided:
          data.kraPin !== undefined,

        kraPin:
          data.kraPin === null
            ? null
            : data.kraPin?.trim(),

        notesProvided:
          data.notes !== undefined,

        notes:
          data.notes === null
            ? null
            : data.notes?.trim(),
      }
    );

  if (!customer) {
    throw notFound("Customer not found");
  }

  return customer;
}


/*
|--------------------------------------------------------------------------
| Change customer active status
|--------------------------------------------------------------------------
*/
async function changeCustomerStatus(
  customerId,
  isActive
) {
  await getCustomer(customerId);

  const customer =
    await customerRepository.updateCustomerStatus(
      customerId,
      isActive
    );

  if (!customer) {
    throw notFound("Customer not found");
  }

  return customer;
}


/*
|--------------------------------------------------------------------------
| Update credit settings
|--------------------------------------------------------------------------
*/
async function updateCustomerCredit(
  customerId,
  {
    allowCredit,
    creditLimit,
  }
) {
  await getCustomer(customerId);

  const numericLimit =
    Number(creditLimit);

  if (
    !Number.isFinite(numericLimit) ||
    numericLimit < 0
  ) {
    throw badRequest(
      "Credit limit must be greater than or equal to 0"
    );
  }

  /*
   * Business rule:
   * If credit is disabled, the limit should be 0.
   */
  const finalCreditLimit =
    allowCredit ? numericLimit : 0;

  const customer =
    await customerRepository.updateCustomerCredit(
      customerId,
      allowCredit,
      finalCreditLimit
    );

  if (!customer) {
    throw notFound("Customer not found");
  }

  return customer;
}


/*
|--------------------------------------------------------------------------
| Get customer balance
|--------------------------------------------------------------------------
*/
async function getCustomerBalance(
  customerId
) {
  await getCustomer(customerId);

  const balance =
    await customerRepository.findCustomerBalance(
      customerId
    );

  /*
   * Normally the customer_balances view should return
   * the customer even when no ledger entries exist.
   * This fallback keeps the API safe nevertheless.
   */
  if (!balance) {
    const customer =
      await getCustomer(customerId);

    return {
      customer_id: customer.customer_id,
      customer_code: customer.customer_code,
      customer_name: customer.customer_name,
      credit_limit: customer.credit_limit,
      allow_credit: customer.allow_credit,
      total_debit: "0.00",
      total_credit: "0.00",
      balance: "0.00",
    };
  }

  return balance;
}

async function getCustomerStatement(
  customerId,
  filters = {}
) {
  const { from, to } = filters;

  if (from && Number.isNaN(Date.parse(from))) {
    throw badRequest(
      "Invalid from date",
      "INVALID_FROM_DATE"
    );
  }

  if (to && Number.isNaN(Date.parse(to))) {
    throw badRequest(
      "Invalid to date",
      "INVALID_TO_DATE"
    );
  }

  if (from && to && new Date(from) > new Date(to)) {
    throw badRequest(
      "From date cannot be after to date",
      "INVALID_DATE_RANGE"
    );
  }

  const customer =
    customerRepository.findCustomerById(customerId)

  if (!customer) {
    throw notFound(
      "Customer not found",
      "CUSTOMER_NOT_FOUND"
    );
  }

  const openingBalance =
    await customerRepository.getCustomerStatementOpeningBalance(
      customerId,
      from
    );

  const transactions =
    await customerRepository.getCustomerStatementTransactions(
      customerId,
      from,
      to
    );

  let runningBalance = Number(openingBalance);

  const statementLines = transactions.map((transaction) => {
    const debit = Number(transaction.debit);
    const credit = Number(transaction.credit);

    runningBalance += debit - credit;

    return {
      customer_ledger_id:
        transaction.customer_ledger_id,

      transaction_date:
        transaction.transaction_date,

      transaction_type:
        transaction.transaction_type,

      reference_type:
        transaction.reference_type,

      reference_id:
        transaction.reference_id,

      description:
        transaction.description,

      debit,
      credit,

      running_balance:
        Number(runningBalance.toFixed(2)),
    };
  });

  const periodDebit = statementLines.reduce(
    (total, line) => total + line.debit,
    0
  );

  const periodCredit = statementLines.reduce(
    (total, line) => total + line.credit,
    0
  );

  return {
    customer: {
      customer_id: customer.customer_id,
      customer_code: customer.customer_code,
      customer_name: customer.customer_name,
      phone: customer.phone,
      allow_credit: customer.allow_credit,
      credit_limit: Number(customer.credit_limit),
    },

    period: {
      from: from || null,
      to: to || null,
    },

    summary: {
      opening_balance:
        Number(Number(openingBalance).toFixed(2)),

      total_debit:
        Number(periodDebit.toFixed(2)),

      total_credit:
        Number(periodCredit.toFixed(2)),

      closing_balance:
        Number(runningBalance.toFixed(2)),
    },

    transactions: statementLines,
  };
}

module.exports = {
  createNewCustomer,
  getCustomers,
  getCustomer,
  editCustomer,
  changeCustomerStatus,
  updateCustomerCredit,
  getCustomerBalance,
  getCustomerStatement,
};