const Review = require("../models/review.model");
const { Booking } = require("../models/booking.model");
const { Hotel } = require("../models/hotel.model");
const { Package } = require("../models/package.model");
const ApiResponse = require("../utils/apiResponse");
const AppError = require("../utils/appError");
const httpStatus = require("http-status-codes");

class ReviewController {
  createReview = async (req, res) => {
    const { bookingId, rating, comment } = req.body;
    const userId = req.user.userId;

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      throw new AppError("Eligible booking not found", httpStatus.StatusCodes.NOT_FOUND);
    }

    if (!["CONFIRMED", "COMPLETED"].includes(booking.status)) {
      throw new AppError(
        "You can only review confirmed or completed reservations",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      throw new AppError("You have already submitted a review for this booking", httpStatus.StatusCodes.CONFLICT);
    }

    const review = await Review.create({
      user: userId,
      booking: bookingId,
      hotel: booking.hotel || null,
      package: booking.package || null,
      rating: Number(rating),
      comment: comment.trim(),
      status: "APPROVED"
    });

    // Update aggregate rating on Hotel or Package
    if (booking.hotel) {
      const allHotelReviews = await Review.find({ hotel: booking.hotel });
      const avg = allHotelReviews.reduce((sum, r) => sum + r.rating, 0) / allHotelReviews.length;
      await Hotel.findByIdAndUpdate(booking.hotel, {
        rating: Math.round(avg * 10) / 10,
        totalReviews: allHotelReviews.length
      });
    } else if (booking.package) {
      const allPkgReviews = await Review.find({ package: booking.package });
      const avg = allPkgReviews.reduce((sum, r) => sum + r.rating, 0) / allPkgReviews.length;
      await Package.findByIdAndUpdate(booking.package, {
        rating: Math.round(avg * 10) / 10,
        totalReviews: allPkgReviews.length
      });
    }

    return ApiResponse.success(res, {
      statusCode: 201,
      message: "Review submitted successfully",
      data: review
    });
  };

  getReviews = async (req, res) => {
    const { entityId, entityType, hotelId, packageId } = req.query;
    const filter = { status: "APPROVED" };

    if (entityType === "HOTEL" && entityId) {
      filter.hotel = entityId;
    } else if (entityType === "TRIP" && entityId) {
      filter.package = entityId;
    } else if (entityType === "PACKAGE" && entityId) {
      filter.package = entityId;
    } else if (hotelId) {
      filter.hotel = hotelId;
    } else if (packageId) {
      filter.package = packageId;
    } else if (entityId) {
      filter.$or = [{ hotel: entityId }, { package: entityId }];
    }

    const reviews = await Review.find(filter)
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, {
      message: "Reviews fetched",
      data: reviews
    });
  };

  getHotelReviews = async (req, res) => {
    const reviews = await Review.find({ hotel: req.params.hotelId, status: "APPROVED" })
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, {
      message: "Hotel reviews fetched",
      data: reviews
    });
  };

  getPackageReviews = async (req, res) => {
    const reviews = await Review.find({ package: req.params.packageId, status: "APPROVED" })
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, {
      message: "Package reviews fetched",
      data: reviews
    });
  };

  getMyReviews = async (req, res) => {
    const reviews = await Review.find({ user: req.user.userId })
      .populate("hotel", "name location images")
      .populate("package", "title destination images")
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, {
      message: "My reviews fetched",
      data: reviews
    });
  };

  deleteReview = async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new AppError("Review not found", httpStatus.StatusCodes.NOT_FOUND);
    }

    if (req.user.role !== "SUPER_ADMIN" && String(review.user) !== String(req.user.userId)) {
      throw new AppError("Unauthorized to delete this review", httpStatus.StatusCodes.FORBIDDEN);
    }

    await Review.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, {
      message: "Review deleted successfully"
    });
  };
}

module.exports = new ReviewController();
