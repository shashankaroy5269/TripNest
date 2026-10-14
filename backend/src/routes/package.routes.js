const express = require("express");
const packageController = require("../controllers/package.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const asyncHandler = require("../utils/asyncHandler");
const ROLES = require("../constants/roles");

const router = express.Router();

// Public routes
router.get("/featured", asyncHandler(packageController.getFeaturedPackages));
router.get("/destinations", asyncHandler(packageController.getDestinations));
router.get("/", asyncHandler(packageController.getAllPackages));
router.get("/:id/seats", asyncHandler(packageController.checkSeats));
router.get("/:id", asyncHandler(packageController.getPackage));

// Trip Manager / Super Admin routes
router.post(
  "/",
  authenticate,
  authorize(ROLES.TRIP_MANAGER, ROLES.SUPER_ADMIN),
  asyncHandler(packageController.createPackage)
);

router.put(
  "/:id",
  authenticate,
  authorize(ROLES.TRIP_MANAGER, ROLES.SUPER_ADMIN),
  asyncHandler(packageController.updatePackage)
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.TRIP_MANAGER, ROLES.SUPER_ADMIN),
  asyncHandler(packageController.deletePackage)
);

router.get(
  "/:id/bookings",
  authenticate,
  authorize(ROLES.TRIP_MANAGER, ROLES.SUPER_ADMIN),
  asyncHandler(packageController.getPackageBookings)
);

module.exports = router;
