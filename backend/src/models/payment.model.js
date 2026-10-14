const mongoose = require("mongoose");
const PAYMENT_STATUS = require("../constants/paymentStatus");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR"
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    razorpayPaymentId: {
      type: String,
      default: null,
      index: true
    },

    razorpaySignature: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true
    },

    failureReason: {
      type: String,
      default: null
    },

    paidAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({
  user: 1,
  status: 1
});

module.exports = mongoose.model("Payment", paymentSchema);