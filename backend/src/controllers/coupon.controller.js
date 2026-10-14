const Coupon = require("../models/coupon.model");
const ApiResponse = require("../utils/apiResponse");
const AppError = require("../utils/appError");
const httpStatus = require("http-status-codes");

class CouponController {
  // Validate Coupon
  validateCoupon = async (req, res) => {
    const code = req.body.code;
    const amount = req.body.bookingAmount || req.body.amount || 0;
    if (!code) {
      throw new AppError("Coupon code is required", httpStatus.StatusCodes.BAD_REQUEST);
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
      expiry: { $gt: new Date() }
    });

    if (!coupon) {
      throw new AppError("Invalid or expired coupon code", httpStatus.StatusCodes.NOT_FOUND);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError("Coupon usage limit has been reached", httpStatus.StatusCodes.BAD_REQUEST);
    }

    const bookingAmount = Number(amount || 0);
    if (bookingAmount < coupon.minAmount) {
      throw new AppError(
        `Minimum booking amount for this coupon is ₹${coupon.minAmount}`,
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = Math.round((bookingAmount * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    return ApiResponse.success(res, {
      message: `Coupon ${coupon.code} applied successfully!`,
      data: {
        code: coupon.code,
        discount,
        discountAmount: discount,
        discountType: coupon.type,
        value: coupon.value
      }
    });
  };

  // Get active coupons for homepage
  getActiveCoupons = async (req, res) => {
    const coupons = await Coupon.find({
      isActive: true,
      expiry: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    return ApiResponse.success(res, {
      message: "Active coupons fetched",
      data: coupons
    });
  };

  // Admin: Get all coupons
  getAllCoupons = async (req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return ApiResponse.success(res, {
      message: "All coupons fetched",
      data: coupons
    });
  };

  // Admin: Create coupon
  createCoupon = async (req, res) => {
    const {
      code,
      type,
      discountType,
      value,
      discountValue,
      minAmount,
      minBookingAmount,
      maxDiscount,
      expiry,
      usageLimit
    } = req.body;

    if (!code || !code.trim()) {
      throw new AppError("Coupon code is required", httpStatus.StatusCodes.BAD_REQUEST);
    }

    const formattedCode = code.trim().toUpperCase();
    const couponType = (type || discountType || "FIXED").toUpperCase();
    const couponValue = Number(value !== undefined ? value : discountValue !== undefined ? discountValue : 500);
    const couponMinAmount = Number(minAmount !== undefined ? minAmount : minBookingAmount !== undefined ? minBookingAmount : 0);

    // Default expiry to 6 months from now if not specified
    const defaultExpiry = new Date();
    defaultExpiry.setMonth(defaultExpiry.getMonth() + 6);
    const couponExpiry = expiry ? new Date(expiry) : defaultExpiry;

    const existing = await Coupon.findOne({ code: formattedCode });
    if (existing) {
      existing.type = couponType;
      existing.value = couponValue;
      existing.minAmount = couponMinAmount;
      existing.maxDiscount = Number(maxDiscount || 10000);
      existing.expiry = couponExpiry;
      existing.usageLimit = Number(usageLimit || 100);
      existing.isActive = true;
      await existing.save();

      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Coupon ${formattedCode} updated successfully`,
        data: existing
      });
    }

    const coupon = await Coupon.create({
      code: formattedCode,
      type: couponType,
      value: couponValue,
      minAmount: couponMinAmount,
      maxDiscount: Number(maxDiscount || 10000),
      expiry: couponExpiry,
      usageLimit: Number(usageLimit || 100),
      isActive: true
    });

    return ApiResponse.success(res, {
      statusCode: 201,
      message: `Coupon ${coupon.code} created successfully`,
      data: coupon
    });
  };

  // Admin: Delete coupon
  deleteCoupon = async (req, res) => {
    await Coupon.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, {
      message: "Coupon deleted successfully"
    });
  };
}

module.exports = new CouponController();
