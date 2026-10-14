const express = require("express");
const reviewController = require("../controllers/review.controller");
const authenticate = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(reviewController.getReviews));
router.get("/hotel/:hotelId", asyncHandler(reviewController.getHotelReviews));
router.get("/package/:packageId", asyncHandler(reviewController.getPackageReviews));
router.get("/my-reviews", authenticate, asyncHandler(reviewController.getMyReviews));
router.post("/", authenticate, asyncHandler(reviewController.createReview));
router.delete("/:id", authenticate, asyncHandler(reviewController.deleteReview));

module.exports = router;
