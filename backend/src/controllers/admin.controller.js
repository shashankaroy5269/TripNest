const adminService = require("../services/admin.service");
const ApiResponse = require("../utils/apiResponse");

class AdminController {
  dashboard = async (req, res) => {
    const stats = await adminService.getDashboardStats(req.user);
    return ApiResponse.success(res, {
      message: "Dashboard KPIs fetched successfully",
      data: stats
    });
  };

  getStats = async (req, res) => {
    const stats = await adminService.getDashboardStats(req.user);
    return ApiResponse.success(res, {
      message: "Dashboard KPIs fetched successfully",
      data: stats
    });
  };

  getMonthlyRevenue = async (req, res) => {
    const data = await adminService.getMonthlyRevenueReport();
    return ApiResponse.success(res, {
      message: "Monthly revenue report fetched",
      data
    });
  };

  getPopularDestinations = async (req, res) => {
    const data = await adminService.getPopularDestinationsReport();
    return ApiResponse.success(res, {
      message: "Popular destinations report fetched",
      data
    });
  };

  getHotelPerformance = async (req, res) => {
    const data = await adminService.getHotelPerformanceReport();
    return ApiResponse.success(res, {
      message: "Hotel performance report fetched",
      data
    });
  };

  getBookingStatus = async (req, res) => {
    const data = await adminService.getBookingStatusReport();
    return ApiResponse.success(res, {
      message: "Booking status report fetched",
      data
    });
  };

  getReports = async (req, res) => {
    const [monthlyRevenue, popularDestinations, bookingStatus, hotelPerformance] =
      await Promise.all([
        adminService.getMonthlyRevenueReport(),
        adminService.getPopularDestinationsReport(),
        adminService.getBookingStatusReport(),
        adminService.getHotelPerformanceReport()
      ]);

    return ApiResponse.success(res, {
      message: "Aggregation reports generated successfully",
      data: {
        monthlyRevenue,
        popularDestinations,
        bookingStatus,
        hotelPerformance
      }
    });
  };

  getUsers = async (req, res) => {
    const users = await adminService.getAllUsers(req.query);
    return ApiResponse.success(res, {
      message: "Users fetched successfully",
      data: users
    });
  };

  toggleUserStatus = async (req, res) => {
    const adminId = req.user?.userId;
    const user = await adminService.toggleUserStatus(req.params.id, adminId);
    return ApiResponse.success(res, {
      message: `User status changed to ${user.status}`,
      data: user
    });
  };

  createUser = async (req, res) => {
    const user = await adminService.createUser(req.body);
    return ApiResponse.success(res, {
      message: "User created successfully",
      data: user
    });
  };

  getAllBookings = async (req, res) => {
    const bookings = await adminService.getAllBookings(req.user, req.query);
    return ApiResponse.success(res, {
      message: "Platform bookings fetched successfully",
      data: bookings
    });
  };

  updateBookingStatus = async (req, res) => {
    const booking = await adminService.updateBookingStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    return ApiResponse.success(res, {
      message: `Booking status updated to ${booking.status}`,
      data: booking
    });
  };
}

module.exports = new AdminController();