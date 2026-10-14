const httpStatus = require("http-status-codes");

const paymentService =
  require("../services/payment.service");

const ApiResponse =
  require("../utils/apiResponse");

class PaymentController {

  // POST /api/payments/create-order

  createOrder = async (req, res) => {

    const result =
      await paymentService.createPaymentOrder(
        req.user.userId,
        req.body.bookingId
      );

    return ApiResponse.success(res, {
      statusCode: httpStatus.StatusCodes.CREATED,
      message: "Payment order created successfully",
      data: result
    });
  };


  // POST /api/payments/verify

  verifyPayment = async (req, res) => {
    const payload = {
      razorpayOrderId: req.body.razorpayOrderId || req.body.razorpay_order_id,
      razorpayPaymentId: req.body.razorpayPaymentId || req.body.razorpay_payment_id,
      razorpaySignature: req.body.razorpaySignature || req.body.razorpay_signature,
      bookingId: req.body.bookingId
    };

    const result =
      await paymentService.verifyPayment(
        req.user.userId,
        payload
      );

    return ApiResponse.success(res, {
      statusCode: httpStatus.StatusCodes.OK,
      message: result.message,
      data: result
    });
  };


  // GET /api/payments/booking/:bookingId

  getPayment = async (req, res) => {

    const payment =
      await paymentService.getPayment(
        req.user.userId,
        req.params.bookingId
      );

    return ApiResponse.success(res, {
      statusCode: httpStatus.StatusCodes.OK,
      message: "Payment fetched successfully",
      data: payment
    });
  };
}

module.exports = new PaymentController();