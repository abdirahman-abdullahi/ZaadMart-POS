const {
  createNewCustomer,
  getCustomers,
  getCustomer,
  editCustomer,
  changeCustomerStatus,
  updateCustomerCredit,
  getCustomerBalance,
  getCustomerStatement,
} = require("../services/customerService");

const {
  successResponse,
} = require("../utils/apiResponse");

const {
  getPagination,
  getPaginationMeta,
} = require("../utils/pagination");

const {
  normalizeSearch,
  parseBoolean,
} = require("../utils/queryHelpers");


/*
|--------------------------------------------------------------------------
| Create customer
|--------------------------------------------------------------------------
*/

async function createCustomer(req, res) {
  const customer =
    await createNewCustomer(req.body);

  return successResponse(res, {
    statusCode: 201,
    message:
      "Customer created successfully",
    data: customer,
  });
}


/*
|--------------------------------------------------------------------------
| List/search customers
|--------------------------------------------------------------------------
*/

async function listCustomers(req, res) {
  const {
    page,
    limit,
    offset,
  } = getPagination(req.query);

  const search =
    normalizeSearch(req.query.search);

  const isActive =
    parseBoolean(req.query.active);

  const result =
    await getCustomers({
      search,
      isActive,
      limit,
      offset,
    });

  return successResponse(res, {
    message:
      "Customers retrieved successfully",

    data: result.customers,

    meta: getPaginationMeta({
      page,
      limit,
      total: result.total,
    }),
  });
}


/*
|--------------------------------------------------------------------------
| Get customer
|--------------------------------------------------------------------------
*/

async function getCustomerById(
  req,
  res
) {
  const customer =
    await getCustomer(
      req.params.customerId
    );

  return successResponse(res, {
    message:
      "Customer retrieved successfully",
    data: customer,
  });
}


/*
|--------------------------------------------------------------------------
| Update customer
|--------------------------------------------------------------------------
*/

async function updateCustomer(
  req,
  res
) {
  const customer =
    await editCustomer(
      req.params.customerId,
      req.body
    );

  return successResponse(res, {
    message:
      "Customer updated successfully",
    data: customer,
  });
}


/*
|--------------------------------------------------------------------------
| Activate customer
|--------------------------------------------------------------------------
*/

async function activateCustomer(
  req,
  res
) {
  const customer =
    await changeCustomerStatus(
      req.params.customerId,
      true
    );

  return successResponse(res, {
    message:
      "Customer activated successfully",
    data: customer,
  });
}


/*
|--------------------------------------------------------------------------
| Deactivate customer
|--------------------------------------------------------------------------
*/

async function deactivateCustomer(
  req,
  res
) {
  const customer =
    await changeCustomerStatus(
      req.params.customerId,
      false
    );

  return successResponse(res, {
    message:
      "Customer deactivated successfully",
    data: customer,
  });
}


/*
|--------------------------------------------------------------------------
| Update credit settings
|--------------------------------------------------------------------------
*/

async function setCustomerCredit(
  req,
  res
) {
  const customer =
    await updateCustomerCredit(
      req.params.customerId,
      req.body
    );

  return successResponse(res, {
    message:
      "Customer credit settings updated successfully",
    data: customer,
  });
}


/*
|--------------------------------------------------------------------------
| Customer balance
|--------------------------------------------------------------------------
*/

async function viewCustomerBalance(
  req,
  res
) {
  const balance =
    await getCustomerBalance(
      req.params.customerId
    );

  return successResponse(res, {
    message:
      "Customer balance retrieved successfully",
    data: balance,
  });
}

async function getStatement(req, res) {
  const { customerId } = req.params;
  const { from, to } = req.query;

  const statement = await getCustomerStatement(
    customerId,
    {
      from,
      to,
    }
  );

  return successResponse(res, {
    message:
      "Customer statement retrieved successfully",
    data: statement,
  });
}


module.exports = {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  activateCustomer,
  deactivateCustomer,
  setCustomerCredit,
  viewCustomerBalance,
  getStatement,
};