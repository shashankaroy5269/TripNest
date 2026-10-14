const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const asyncHandler = require("../utils/asyncHandler");
const adminController = require("../controllers/admin.controller");
const ROLES = require("../constants/roles");

const router = express.Router();

router.use(authenticate);

// Dashboard & KPIs (Super Admin, Trip Manager, Hotel Admin)
router.get(
  "/dashboard",
  authorize(ROLES.SUPER_ADMIN, ROLES.TRIP_MANAGER, ROLES.HOTEL_ADMIN),
  asyncHandler(adminController.dashboard)
);
router.get(
  "/stats",
  authorize(ROLES.SUPER_ADMIN, ROLES.TRIP_MANAGER, ROLES.HOTEL_ADMIN),
  asyncHandler(adminController.getStats)
);

// Aggregations & Analytical Reports
router.get("/reports", authorize(ROLES.SUPER_ADMIN), asyncHandler(adminController.getReports));
router.get(
  "/reports/monthly-revenue",
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(adminController.getMonthlyRevenue)
);
router.get(
  "/reports/popular-destinations",
  authorize(ROLES.SUPER_ADMIN, ROLES.TRIP_MANAGER),
  asyncHandler(adminController.getPopularDestinations)
);
router.get(
  "/reports/hotel-performance",
  authorize(ROLES.SUPER_ADMIN, ROLES.HOTEL_ADMIN),
  asyncHandler(adminController.getHotelPerformance)
);
router.get(
  "/reports/booking-status",
  authorize(ROLES.SUPER_ADMIN, ROLES.TRIP_MANAGER, ROLES.HOTEL_ADMIN),
  asyncHandler(adminController.getBookingStatus)
);

// User Governance (SUPER_ADMIN only)
router.get("/users", authorize(ROLES.SUPER_ADMIN), asyncHandler(adminController.getUsers));
router.post("/users", authorize(ROLES.SUPER_ADMIN), asyncHandler(adminController.createUser));
router.patch("/users/:id/toggle-status", authorize(ROLES.SUPER_ADMIN), asyncHandler(adminController.toggleUserStatus));
router.post("/users/:id/toggle-status", authorize(ROLES.SUPER_ADMIN), asyncHandler(adminController.toggleUserStatus));
router.put("/users/:id/toggle-status", authorize(ROLES.SUPER_ADMIN), asyncHandler(adminController.toggleUserStatus));

// Bookings (Super Admin, Trip Manager, Hotel Admin)
router.get(
  "/bookings",
  authorize(ROLES.SUPER_ADMIN, ROLES.TRIP_MANAGER, ROLES.HOTEL_ADMIN),
  asyncHandler(adminController.getAllBookings)
);
router.patch(
  "/bookings/:id/status",
  authorize(ROLES.SUPER_ADMIN, ROLES.TRIP_MANAGER, ROLES.HOTEL_ADMIN),
  asyncHandler(adminController.updateBookingStatus)
);

module.exports = router;