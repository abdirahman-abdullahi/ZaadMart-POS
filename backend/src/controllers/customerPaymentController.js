const {
  recordCustomerPayment,
} = require("../services/customerPaymentService");

const {
  successResponse,
} = require("../utils/apiResponse");

async function createCustomerPayment(
  req,
  res
) {
  const payment =
    await recordCustomerPayment({
      customerId:
        req.params.customerId,

      paymentCode:
        req.body.payment_code,

      amount:
        req.body.amount,

      referenceNumber:
        req.body.reference_number,

      notes:
        req.body.notes,

      userId:
        req.user.userId,

      ipAddress:
        req.ip,
    });

  return successResponse(res, {
    statusCode: 201,

    message:
      "Customer payment recorded successfully",

    data: payment,
  });
}

module.exports = {
  createCustomerPayment,
};