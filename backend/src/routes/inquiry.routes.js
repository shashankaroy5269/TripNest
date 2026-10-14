const express = require("express");
const inquiryController = require("../controllers/inquiry.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const ROLES = require("../constants/roles");

const router = express.Router();

// Public route to submit inquiries
router.post("/", inquiryController.createInquiry);

// Admin routes to view, manage, and resolve inquiries
router.get(
  "/",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOTEL_ADMIN, ROLES.TRIP_MANAGER),
  inquiryController.getAllInquiries
);

router.patch(
  "/:id",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.HOTEL_ADMIN, ROLES.TRIP_MANAGER),
  inquiryController.updateInquiry
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  inquiryController.deleteInquiry
);

module.exports = router;
