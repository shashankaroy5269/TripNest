const packageService = require("../services/package.service");
const ApiResponse = require("../utils/apiResponse");

class PackageController {
  createPackage = async (req, res) => {
    const pkg = await packageService.createPackage(req.user.userId, req.body);
    return ApiResponse.success(res, {
      statusCode: 201,
      message: "Holiday package created successfully",
      data: pkg
    });
  };

  getAllPackages = async (req, res) => {
    const packages = await packageService.getAllPackages(req.query);
    return ApiResponse.success(res, {
      message: "Packages fetched successfully",
      data: packages
    });
  };

  getPackage = async (req, res) => {
    const pkg = await packageService.getPackageById(req.params.id);
    return ApiResponse.success(res, {
      message: "Package details fetched successfully",
      data: pkg
    });
  };

  updatePackage = async (req, res) => {
    const pkg = await packageService.updatePackage(
      req.params.id,
      req.user.userId,
      req.body,
      req.user.role
    );
    return ApiResponse.success(res, {
      message: "Package updated successfully",
      data: pkg
    });
  };

  deletePackage = async (req, res) => {
    await packageService.deletePackage(req.params.id, req.user.userId, req.user.role);
    return ApiResponse.success(res, {
      message: "Package deleted successfully"
    });
  };

  checkSeats = async (req, res) => {
    const result = await packageService.checkSeatsAvailability(
      req.params.id,
      req.query.seats || 1
    );
    return ApiResponse.success(res, {
      message: result.available ? "Seats are available" : "Requested seats exceed available capacity",
      data: result
    });
  };

  getFeaturedPackages = async (req, res) => {
    const packages = await packageService.getFeaturedPackages();
    return ApiResponse.success(res, {
      message: "Featured packages fetched",
      data: packages
    });
  };

  getDestinations = async (req, res) => {
    const destinations = await packageService.getDestinations();
    return ApiResponse.success(res, {
      message: "Destinations fetched",
      data: destinations
    });
  };

  getPackageBookings = async (req, res) => {
    const bookings = await packageService.getPackageBookings(req.params.id, req.user);
    return ApiResponse.success(res, {
      message: "Package passenger bookings fetched successfully",
      data: bookings
    });
  };
}

module.exports = new PackageController();
