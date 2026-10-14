const httpStatus = require("http-status-codes");
const { Package, PACKAGE_TYPES } = require("../models/package.model");
const { Booking } = require("../models/booking.model");
const Destination = require("../models/destination.model");
const AppError = require("../utils/appError");

class PackageService {
  // ==================================================
  // CREATE PACKAGE
  // ==================================================
  async createPackage(managerId, data) {
    const days = Number(data.durationDays || data.days || data.duration?.days || 3);
    const nights = Number(
      data.durationNights || data.nights || data.duration?.nights || Math.max(1, days - 1)
    );
    const startingPrice = Number(data.pricePerPerson || data.startingPrice || 15000);
    const capacity = Number(data.capacity || data.totalSeats || 30);
    const availableSeats = Number(data.availableSeats || capacity);
    const packageType = (data.packageType || PACKAGE_TYPES.FAMILY).toLowerCase();

    const inclusions = Array.isArray(data.inclusions)
      ? data.inclusions
      : (data.inclusions || "Resort Stay, Daily Breakfast, Airport Transfers, Sightseeing")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const exclusions = Array.isArray(data.exclusions)
      ? data.exclusions
      : (data.exclusions || "Flight Tickets, Personal Expenses")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    let departureDates = [
      new Date(Date.now() + 7 * 86400000),
      new Date(Date.now() + 14 * 86400000),
      new Date(Date.now() + 21 * 86400000)
    ];

    if (Array.isArray(data.departureDates) && data.departureDates.length > 0) {
      departureDates = data.departureDates.map((d) =>
        d.startDate ? new Date(d.startDate) : new Date(d)
      );
    }

    const pkg = await Package.create({
      title: data.title,
      destination: data.destination,
      description: data.description,
      duration: {
        days,
        nights
      },
      startingPrice,
      capacity,
      availableSeats,
      packageType,
      images: data.images || [
        {
          url:
            data.photos?.[0] ||
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
          publicId: null
        }
      ],
      inclusions,
      exclusions,
      cancellationPolicy:
        data.cancellationPolicy ||
        "100% refund up to 7 days before departure. 50% refund between 3 to 7 days.",
      departureDates,
      itinerary: (data.itinerary && data.itinerary.length > 0)
        ? data.itinerary
        : Array.from({ length: days }).map((_, i) => ({
            dayNumber: i + 1,
            title: i === 0 ? `Arrival in ${data.destination} & Leisure Welcome` : i === days - 1 ? `Farewell ${data.destination} & Departure` : `Day ${i + 1}: ${data.destination} Sightseeing & Adventures`,
            description: i === 0
              ? `Arrival in ${data.destination}. Transfer to hotel, check-in, relax and enjoy evening welcome dinner.`
              : i === days - 1
              ? `Breakfast at accommodation. Checkout and departure transfer.`
              : `Guided excursion covering key attractions, local viewpoints, and activities in ${data.destination}.`,
            meals: i === 0 ? ["Welcome Dinner"] : i === days - 1 ? ["Breakfast"] : ["Breakfast", "Lunch"],
            sightseeing: [`Top sights of ${data.destination}`, "Scenic viewpoint", "Local cultural experience"]
          })),
      manager: managerId,
      featured: data.featured ?? false,
      status: "ACTIVE"
    });

    // Also ensure destination exists
    if (data.destination) {
      await Destination.findOneAndUpdate(
        { name: new RegExp(`^${data.destination.trim()}$`, "i") },
        {
          name: data.destination.trim(),
          state: data.state || "India",
          description: `Explore the scenic beauty and attractions of ${data.destination}`,
          image: pkg.images?.[0]?.url || ""
        },
        { upsert: true, new: true }
      );
    }

    return pkg;
  }

  // ==================================================
  // GET ALL PACKAGES
  // ==================================================
  async getAllPackages(queryParams = {}) {
    const filter = { status: "ACTIVE" };

    if (queryParams.destination) {
      filter.destination = {
        $regex: new RegExp(queryParams.destination.trim(), "i")
      };
    }

    if (queryParams.search) {
      const regex = new RegExp(queryParams.search.trim(), "i");
      filter.$or = [
        { title: regex },
        { destination: regex },
        { description: regex }
      ];
    }

    if (queryParams.packageType) {
      filter.packageType = queryParams.packageType.toLowerCase();
    }

    if (queryParams.maxPrice) {
      filter.startingPrice = { $lte: Number(queryParams.maxPrice) };
    }

    if (queryParams.minPrice) {
      filter.startingPrice = {
        ...(filter.startingPrice || {}),
        $gte: Number(queryParams.minPrice)
      };
    }

    if (queryParams.durationDays) {
      filter["duration.days"] = { $lte: Number(queryParams.durationDays) };
    }

    let sort = { createdAt: -1 };
    if (queryParams.sort === "price_asc") sort = { startingPrice: 1 };
    if (queryParams.sort === "price_desc") sort = { startingPrice: -1 };
    if (queryParams.sort === "rating_desc") sort = { rating: -1 };

    return Package.find(filter).sort(sort).populate("manager", "name email");
  }

  // ==================================================
  // GET SINGLE PACKAGE
  // ==================================================
  async getPackageById(packageId) {
    const pkg = await Package.findById(packageId).populate("manager", "name email");
    if (!pkg) {
      throw new AppError("Holiday package not found", httpStatus.StatusCodes.NOT_FOUND);
    }

    if (!pkg.itinerary || pkg.itinerary.length === 0) {
      const days = pkg.duration?.days || 4;
      const dest = pkg.destination || "Destination";
      const autoItinerary = [];
      for (let i = 1; i <= days; i++) {
        if (i === 1) {
          autoItinerary.push({
            dayNumber: 1,
            title: `Arrival in ${dest} & Welcome Reception`,
            description: `Meet your TripNest travel representative upon arrival in ${dest}. Private transfer to your luxury accommodation. Relax by the pool, unpack, and enjoy a curated welcome dinner with local delicacies.`,
            meals: ["Welcome Dinner"],
            sightseeing: ["Hotel check-in", "Sunset stroll", "Welcome drinks"]
          });
        } else if (i === days) {
          autoItinerary.push({
            dayNumber: i,
            title: `Farewell ${dest} & Departure Transfer`,
            description: `Enjoy a hearty buffet breakfast at your resort. Complete checkout formalities and private transfer to airport/station with sweet memories of ${dest}.`,
            meals: ["Breakfast"],
            sightseeing: ["Souvenir shopping", "Departure transfer"]
          });
        } else {
          autoItinerary.push({
            dayNumber: i,
            title: `Day ${i}: ${dest} Scenic Sights & Cultural Experience`,
            description: `Full day guided excursion covering scenic viewpoints, cultural heritage landmarks, photography points, adventure activities, and authentic regional cuisine in ${dest}.`,
            meals: ["Breakfast", "Lunch"],
            sightseeing: [`Top landmarks of ${dest}`, "Scenic viewpoint", "Local cultural experience"]
          });
        }
      }
      pkg.itinerary = autoItinerary;
      await Package.findByIdAndUpdate(packageId, { itinerary: autoItinerary });
    }

    return pkg;
  }

  // ==================================================
  // UPDATE PACKAGE
  // ==================================================
  async updatePackage(packageId, managerId, data, userRole) {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      throw new AppError("Package not found", httpStatus.StatusCodes.NOT_FOUND);
    }

    if (userRole !== "SUPER_ADMIN" && String(pkg.manager) !== String(managerId)) {
      throw new AppError("You can only modify packages you created", httpStatus.StatusCodes.FORBIDDEN);
    }

    Object.assign(pkg, data);
    return pkg.save();
  }

  // ==================================================
  // DELETE PACKAGE
  // ==================================================
  async deletePackage(packageId, managerId, userRole) {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      throw new AppError("Package not found", httpStatus.StatusCodes.NOT_FOUND);
    }

    if (userRole !== "SUPER_ADMIN" && String(pkg.manager) !== String(managerId)) {
      throw new AppError("You can only delete packages you created", httpStatus.StatusCodes.FORBIDDEN);
    }

    return Package.findByIdAndDelete(packageId);
  }

  // ==================================================
  // CHECK SEAT AVAILABILITY
  // ==================================================
  async checkSeatsAvailability(packageId, requestedSeats = 1) {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      throw new AppError("Package not found", httpStatus.StatusCodes.NOT_FOUND);
    }

    const available = pkg.availableSeats >= Number(requestedSeats);
    return {
      available,
      availableSeats: pkg.availableSeats,
      totalCapacity: pkg.capacity,
      requestedSeats: Number(requestedSeats)
    };
  }

  // ==================================================
  // GET FEATURED PACKAGES
  // ==================================================
  async getFeaturedPackages() {
    return Package.find({ status: "ACTIVE" }).sort({ rating: -1, createdAt: -1 }).limit(6);
  }

  // ==================================================
  // GET DESTINATIONS
  // ==================================================
  async getDestinations() {
    return Destination.find().sort({ popular: -1, name: 1 });
  }

  // ==================================================
  // GET PASSENGER BOOKINGS FOR SPECIFIC PACKAGE
  // ==================================================
  async getPackageBookings(packageId, user) {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      throw new AppError("Package not found", httpStatus.StatusCodes.NOT_FOUND);
    }

    return Booking.find({ package: packageId, bookingType: "TRIP" })
      .populate("user", "name email phone")
      .populate("package", "title destination departureDates duration startingPrice")
      .sort({ createdAt: -1 });
  }
}

module.exports = new PackageService();
