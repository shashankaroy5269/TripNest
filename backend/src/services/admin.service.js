const { Booking } = require("../models/booking.model");
const { Hotel } = require("../models/hotel.model");
const { Package } = require("../models/package.model");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");
const ROLES = require("../constants/roles");
const AppError = require("../utils/appError");
const httpStatus = require("http-status-codes");

class AdminService {
  // ==================================================
  // DASHBOARD KPIS & STATS
  // ==================================================
  async getDashboardStats(user = null) {
    if (user?.role === ROLES.TRIP_MANAGER) {
      const [
        totalPackages,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        revenueResult
      ] = await Promise.all([
        Package.countDocuments(),
        Booking.countDocuments({ bookingType: "TRIP" }),
        Booking.countDocuments({ bookingType: "TRIP", status: "CONFIRMED" }),
        Booking.countDocuments({ bookingType: "TRIP", status: "PENDING" }),
        Booking.aggregate([
          { $match: { bookingType: "TRIP", status: { $in: ["CONFIRMED", "COMPLETED"] } } },
          { $group: { _id: null, totalRevenue: { $sum: "$priceSnapshot.totalAmount" } } }
        ])
      ]);

      const totalRevenue = revenueResult[0]?.totalRevenue || 0;

      return {
        totalUsers: 0,
        totalCustomers: 0,
        totalHotels: 0,
        pendingHotels: 0,
        totalPackages,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalRevenue
      };
    }

    if (user?.role === ROLES.HOTEL_ADMIN) {
      const [
        totalHotels,
        pendingHotels,
        totalBookings,
        revenueResult
      ] = await Promise.all([
        Hotel.countDocuments(),
        Hotel.countDocuments({ status: "PENDING" }),
        Booking.countDocuments({ bookingType: "HOTEL" }),
        Booking.aggregate([
          { $match: { bookingType: "HOTEL", status: { $in: ["CONFIRMED", "COMPLETED"] } } },
          { $group: { _id: null, totalRevenue: { $sum: "$priceSnapshot.totalAmount" } } }
        ])
      ]);

      const totalRevenue = revenueResult[0]?.totalRevenue || 0;

      return {
        totalUsers: 0,
        totalCustomers: 0,
        totalHotels,
        pendingHotels,
        totalPackages: 0,
        totalBookings,
        totalRevenue
      };
    }

    const [
      totalUsers,
      totalCustomers,
      totalHotels,
      pendingHotels,
      totalPackages,
      totalBookings,
      revenueResult
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: ROLES.CUSTOMER }),
      Hotel.countDocuments(),
      Hotel.countDocuments({ status: "PENDING" }),
      Package.countDocuments(),
      Booking.countDocuments(),
      Payment.aggregate([
        { $match: { status: "SUCCESS" } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
      ])
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    return {
      totalUsers,
      totalCustomers,
      totalHotels,
      pendingHotels,
      totalPackages,
      totalBookings,
      totalRevenue
    };
  }

  // ==================================================
  // MONTHLY REVENUE AGGREGATION REPORT ($lookup & $group)
  // ==================================================
  async getMonthlyRevenueReport() {
    const report = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      {
        $group: {
          _id: {
            year: { $year: "$paidAt" },
            month: { $month: "$paidAt" }
          },
          revenue: { $sum: "$amount" },
          transactions: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          revenue: 1,
          transactions: 1
        }
      }
    ]);

    return report;
  }

  // ==================================================
  // POPULAR DESTINATIONS AGGREGATION ($lookup, $project, $group)
  // ==================================================
  async getPopularDestinationsReport() {
    const report = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["CONFIRMED", "COMPLETED", "PENDING"] }
        }
      },
      {
        $lookup: {
          from: "hotels",
          localField: "hotel",
          foreignField: "_id",
          as: "hotelDoc"
        }
      },
      {
        $lookup: {
          from: "packages",
          localField: "package",
          foreignField: "_id",
          as: "packageDoc"
        }
      },
      {
        $project: {
          destination: {
            $ifNull: [
              { $arrayElemAt: ["$hotelDoc.location.city", 0] },
              { $arrayElemAt: ["$packageDoc.destination", 0] }
            ]
          },
          travelers: {
            $add: ["$guests.adults", { $ifNull: ["$guests.children", 0] }]
          },
          amount: "$priceSnapshot.totalAmount"
        }
      },
      {
        $match: {
          destination: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$destination",
          totalBookings: { $sum: 1 },
          totalTravelers: { $sum: "$travelers" },
          totalRevenue: { $sum: "$amount" }
        }
      },
      {
        $sort: {
          totalBookings: -1
        }
      },
      {
        $limit: 8
      },
      {
        $project: {
          _id: 0,
          destination: "$_id",
          totalBookings: 1,
          totalTravelers: 1,
          totalRevenue: 1
        }
      }
    ]);

    return report;
  }

  // ==================================================
  // BOOKING STATUS SUMMARY REPORT
  // ==================================================
  async getBookingStatusReport() {
    const report = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$priceSnapshot.totalAmount" },
          refundAmount: { $sum: { $ifNull: ["$refundAmount", 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
          totalAmount: 1,
          refundAmount: 1
        }
      }
    ]);

    return report;
  }

  // ==================================================
  // HOTEL PERFORMANCE REPORT ($lookup with Bookings)
  // ==================================================
  async getHotelPerformanceReport() {
    const report = await Hotel.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "hotel",
          as: "hotelBookings"
        }
      },
      {
        $project: {
          name: 1,
          city: "$location.city",
          status: 1,
          rating: 1,
          totalReviews: 1,
          bookingCount: { $size: "$hotelBookings" }
        }
      },
      {
        $sort: {
          bookingCount: -1
        }
      },
      {
        $limit: 10
      }
    ]);

    return report;
  }

  // ==================================================
  // USER MANAGEMENT
  // ==================================================
  async getAllUsers(queryParams = {}) {
    const filter = {};
    if (queryParams.role) filter.role = queryParams.role;
    if (queryParams.status) filter.status = queryParams.status;
    if (queryParams.search) {
      const regex = new RegExp(queryParams.search.trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    return User.find(filter).sort({ createdAt: -1 });
  }

  async toggleUserStatus(userId, adminId) {
    if (adminId && userId.toString() === adminId.toString()) {
      throw new AppError("You cannot block your own super admin account", httpStatus.StatusCodes.BAD_REQUEST);
    }
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", httpStatus.StatusCodes.NOT_FOUND);
    if (user.role === ROLES.SUPER_ADMIN && user.status === "ACTIVE") {
      throw new AppError("Super Admin accounts cannot be blocked", httpStatus.StatusCodes.BAD_REQUEST);
    }
    const nextStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: nextStatus },
      { new: true, runValidators: false }
    );
    return updatedUser;
  }

  async createUser({ name, email, phone, password, role = ROLES.CUSTOMER }) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError("Email already in use", httpStatus.StatusCodes.CONFLICT);
    }
    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      phone: phone || "",
      passwordHash,
      role,
      status: "ACTIVE",
      emailVerified: true
    });
    return user;
  }

  // ==================================================
  // ALL BOOKINGS FOR ADMIN / TRIP MANAGER / HOTEL ADMIN
  // ==================================================
  async getAllBookings(user = null, queryParams = {}) {
    const filter = {};

    if (user?.role === ROLES.TRIP_MANAGER) {
      filter.bookingType = "TRIP";
    } else if (user?.role === ROLES.HOTEL_ADMIN) {
      filter.bookingType = "HOTEL";
    }

    if (queryParams.status && queryParams.status !== "ALL") {
      filter.status = queryParams.status;
    }

    if (queryParams.packageId) {
      filter.package = queryParams.packageId;
    }

    return Booking.find(filter)
      .populate("hotel", "name location images rating")
      .populate("package", "title destination packageType startingPrice duration departureDates manager capacity availableSeats")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
  }

  async updateBookingStatus(bookingId, status, user = null) {
    const booking = await Booking.findById(bookingId).populate("package").populate("hotel");
    if (!booking) {
      throw new AppError("Booking not found", httpStatus.StatusCodes.NOT_FOUND);
    }

    if (user?.role === ROLES.TRIP_MANAGER && booking.bookingType !== "TRIP") {
      throw new AppError("Trip managers can only manage trip bookings", httpStatus.StatusCodes.FORBIDDEN);
    }
    if (user?.role === ROLES.HOTEL_ADMIN && booking.bookingType !== "HOTEL") {
      throw new AppError("Hotel admins can only manage hotel bookings", httpStatus.StatusCodes.FORBIDDEN);
    }

    booking.status = status;
    await booking.save();
    return booking;
  }
}

module.exports = new AdminService();
