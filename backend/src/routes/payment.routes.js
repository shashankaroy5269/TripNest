const express = require("express");

const paymentController =
  require("../controllers/payment.controller");

const authenticate =
  require("../middlewares/auth.middleware");

const validate =
  require("../middlewares/validate.middleware");

const asyncHandler =
  require("../utils/asyncHandler");

const {
  createPaymentOrderSchema,
  verifyPaymentSchema
} = require("../validators/payment.validator");

const router = express.Router();


// Create Razorpay Order

router.post(
  "/create-order",
  authenticate,
  validate(createPaymentOrderSchema),
  asyncHandler(
    paymentController.createOrder
  )
);


// Verify Razorpay Payment

router.post(
  "/verify",
  authenticate,
  validate(verifyPaymentSchema),
  asyncHandler(
    paymentController.verifyPayment
  )
);


// Get payment for booking

router.get(
  "/booking/:bookingId",
  authenticate,
  asyncHandler(
    paymentController.getPayment
  )
);


module.exports = router;