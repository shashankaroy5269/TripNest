const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ["FIXED", "PERCENTAGE"],
      default: "FIXED"
    },
    value: {
      type: Number,
      required: true,
      min: 1
    },
    minAmount: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number,
      default: 10000
    },
    expiry: {
      type: Date,
      required: true
    },
    usageLimit: {
      type: Number,
      default: 100
    },
    usageCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Coupon", couponSchema);
