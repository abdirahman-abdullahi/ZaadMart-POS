const express =
  require("express");

const authenticate =
  require("../middleware/authenticate");

const requirePermission =
  require("../middleware/requirePermission");

const validate =
  require("../middleware/validate");

const asyncHandler =
  require("../utils/asyncHandler");

const {
  validateCustomerId,
  validateCreateCustomer,
  validateUpdateCustomer,
  validateCustomerCredit,
} = require("../validators/customerValidator");

const {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
  activateCustomer,
  deactivateCustomer,
  setCustomerCredit,
  viewCustomerBalance,
  getStatement,
} = require("../controllers/customerController");

const {
  createCustomerPayment,
} = require(
  "../controllers/customerPaymentController"
);


const router = express.Router();

router.use(authenticate);


/*
|--------------------------------------------------------------------------
| Customer list/search
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  requirePermission("customer.view"),
  asyncHandler(listCustomers)
);


/*
|--------------------------------------------------------------------------
| Create customer
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  requirePermission("customer.create"),
  validate(validateCreateCustomer),
  asyncHandler(createCustomer)
);


/*
|--------------------------------------------------------------------------
| Customer balance
|--------------------------------------------------------------------------
*/

router.get(
  "/:customerId/balance",
  requirePermission("customer.view"),
  validate(validateCustomerId),
  asyncHandler(viewCustomerBalance)
);


/*
|--------------------------------------------------------------------------
| Customer credit settings
|--------------------------------------------------------------------------
*/

router.patch(
  "/:customerId/credit",
  requirePermission("customer.edit"),
  validate(validateCustomerCredit),
  asyncHandler(setCustomerCredit)
);


/*
|--------------------------------------------------------------------------
| Activate
|--------------------------------------------------------------------------
*/

router.patch(
  "/:customerId/activate",
  requirePermission("customer.edit"),
  validate(validateCustomerId),
  asyncHandler(activateCustomer)
);


/*
|--------------------------------------------------------------------------
| Deactivate
|--------------------------------------------------------------------------
*/

router.patch(
  "/:customerId/deactivate",
  requirePermission("customer.edit"),
  validate(validateCustomerId),
  asyncHandler(deactivateCustomer)
);

/*
|--------------------------------------------------------------------------
| Update customer
|--------------------------------------------------------------------------
*/

router.patch(
  "/:customerId",
  requirePermission("customer.edit"),
  validate(validateUpdateCustomer),
  asyncHandler(updateCustomer)
);

/*
|--------------------------------------------------------------------------
| Customer Payment
|--------------------------------------------------------------------------
*/


router.post(
  "/:customerId/payments",
  authenticate,
  requirePermission(
    "customer.receive_payment"
  ),
  asyncHandler(
    createCustomerPayment
  )
);

/*
|--------------------------------------------------------------------------
| Customer Statement
|--------------------------------------------------------------------------
*/

router.get(
  "/:customerId/statement",
  authenticate,
  requirePermission("customer.view"),
  asyncHandler(getStatement)
);


/*
|--------------------------------------------------------------------------
| View customer
|--------------------------------------------------------------------------
*/

router.get(
  "/:customerId",
  requirePermission("customer.view"),
  validate(validateCustomerId),
  asyncHandler(getCustomerById)
);





module.exports = router;