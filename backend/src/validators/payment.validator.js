const Joi = require("joi");

const createPaymentOrderSchema = Joi.object({
  bookingId: Joi.string()
    .hex()
    .length(24)
    .required()
});

const verifyPaymentSchema = Joi.object({
  razorpayOrderId: Joi.string().trim().optional(),
  razorpay_order_id: Joi.string().trim().optional(),
  razorpayPaymentId: Joi.string().trim().optional(),
  razorpay_payment_id: Joi.string().trim().optional(),
  razorpaySignature: Joi.string().trim().optional(),
  razorpay_signature: Joi.string().trim().optional(),
  bookingId: Joi.string().hex().length(24).optional()
}).or("razorpayOrderId", "razorpay_order_id")
  .or("razorpayPaymentId", "razorpay_payment_id")
  .or("razorpaySignature", "razorpay_signature");

module.exports = {
  createPaymentOrderSchema,
  verifyPaymentSchema
};