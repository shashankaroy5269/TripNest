const express = require("express");
const couponController = require("../controllers/coupon.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const asyncHandler = require("../utils/asyncHandler");
const ROLES = require("../constants/roles");

const router = express.Router();

router.post("/validate", asyncHandler(couponController.validateCoupon));
router.get("/active", asyncHandler(couponController.getActiveCoupons));

router.get(
  "/",
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(couponController.getAllCoupons)
);

router.post(
  "/",
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(couponController.createCoupon)
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(couponController.deleteCoupon)
);

module.exports = router;
