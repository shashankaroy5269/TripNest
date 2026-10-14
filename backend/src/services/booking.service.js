const httpStatus =
  require("http-status-codes");


const bookingRepository =
  require(
    "../repositories/booking.repository"
  );


const roomRepository =
  require(
    "../repositories/room.repository"
  );


const hotelRepository =
  require(
    "../repositories/hotel.repository"
  );


const availabilityService =
  require(
    "./availability.service"
  );


const AppError =
  require("../utils/appError");


const generateBookingNumber =
  require(
    "../utils/generateBookingNumber"
  );


const BOOKING_STATUS =
  require(
    "../constants/bookingStatus"
  );

const bookingPdfService =
  require("./bookingPdf.service");

const { Package } =
  require("../models/package.model");

const Coupon =
  require("../models/coupon.model");


class BookingService {


  // ==================================================
  // CREATE HOTEL BOOKING
  // ==================================================

  async createHotelBooking(
    userId,
    data
  ) {

    // ------------------------------------------
    // GET ROOM
    // ------------------------------------------

    const room =
      await roomRepository.findById(
        data.roomId
      );


    if (!room) {

      throw new AppError(
        "Room not found",
        httpStatus.StatusCodes.NOT_FOUND
      );

    }


    if (
      room.status !==
      "ACTIVE"
    ) {

      throw new AppError(
        "Room is currently unavailable",
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }


    // ------------------------------------------
    // GET HOTEL
    // ------------------------------------------

    const hotel =
      await hotelRepository.findById(
        room.hotel
      );


    if (!hotel) {

      throw new AppError(
        "Hotel not found",
        httpStatus.StatusCodes.NOT_FOUND
      );

    }


    if (
      hotel.status !==
      "APPROVED"
    ) {

      throw new AppError(
        "Hotel is not available for booking",
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }


    // ------------------------------------------
    // GUEST CAPACITY CHECK
    // ------------------------------------------

    const requestedAdults =
      Number(data.adults);


    const requestedChildren =
      Number(data.children || 0);


    const totalRequestedGuests =
      requestedAdults +
      requestedChildren;


    const roomCapacity =
      (
        room.capacity.adults +
        room.capacity.children
      ) *
      Number(data.rooms);


    if (
      totalRequestedGuests >
      roomCapacity
    ) {

      throw new AppError(
        `Room capacity exceeded. Maximum capacity is ${roomCapacity} guests`,
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }


    // ------------------------------------------
    // FINAL AVAILABILITY CHECK
    // ------------------------------------------
    // IMPORTANT:
    // We check again immediately before
    // creating the booking.
    // ------------------------------------------

    const availability =
      await availabilityService
        .checkRoomAvailability({

          roomId:
            data.roomId,

          checkIn:
            data.checkIn,

          checkOut:
            data.checkOut,

          requestedRooms:
            data.rooms

        });


    if (
      !availability.available
    ) {

      throw new AppError(
        `Only ${availability.availableRooms} room(s) available for selected dates`,
        httpStatus.StatusCodes.CONFLICT
      );

    }


    // ------------------------------------------
    // SERVER-SIDE PRICE
    // ------------------------------------------

    const price =
      await availabilityService
        .calculateBookingPrice({

          roomId:
            data.roomId,

          checkIn:
            data.checkIn,

          checkOut:
            data.checkOut,

          requestedRooms:
            data.rooms

        });


    // ------------------------------------------
    // TAXES, COUPON & TOTAL PRICE CALCULATION
    // ------------------------------------------
    const subtotal = price.totalAmount;
    const taxAmount =
      data.taxAmount !== undefined && !isNaN(Number(data.taxAmount))
        ? Number(data.taxAmount)
        : Math.round(subtotal * 0.12);

    let couponDiscount = Number(data.couponDiscount || 0);
    let appliedCouponCode = data.couponCode
      ? data.couponCode.trim().toUpperCase()
      : null;

    if (appliedCouponCode) {
      try {
        const coupon = await Coupon.findOne({
          code: appliedCouponCode,
          isActive: true,
          expiry: { $gt: new Date() }
        });
        if (
          coupon &&
          (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
          subtotal >= (coupon.minAmount || 0)
        ) {
          if (coupon.type === "PERCENTAGE") {
            const calculatedDiscount = Math.round((subtotal * coupon.value) / 100);
            couponDiscount =
              coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount
                ? coupon.maxDiscount
                : calculatedDiscount;
          } else {
            couponDiscount = coupon.value;
          }
          await Coupon.findByIdAndUpdate(coupon._id, {
            $inc: { usageCount: 1 }
          });
        }
      } catch (couponErr) {
        console.warn("Coupon validation error in createHotelBooking:", couponErr.message);
      }
    }

    const totalAmount = Math.max(0, subtotal + taxAmount - couponDiscount);

    // ------------------------------------------
    // CREATE BOOKING
    // ------------------------------------------

    const booking =
      await bookingRepository.create({

        bookingNumber:
          generateBookingNumber(),

        user:
          userId,

        bookingType:
          "HOTEL",

        hotel:
          hotel._id,

        room:
          room._id,

        traveler: {

          name:
            data.traveler.name,

          email:
            data.traveler.email,

          phone:
            data.traveler.phone

        },

        checkIn:
          price.checkIn,

        checkOut:
          price.checkOut,

        roomsBooked:
          Number(data.rooms),

        guests: {

          adults:
            requestedAdults,

          children:
            requestedChildren

        },

        coupon:
          appliedCouponCode,

        couponDiscount:
          couponDiscount,

        specialRequests:
          data.specialRequests || "",

        priceSnapshot: {
          basePrice: price.priceSnapshot.basePrice,
          discountPercentage: price.priceSnapshot.discountPercentage || 0,
          finalPricePerRoom: price.pricePerRoom,
          nights: price.nights,
          subtotal: subtotal,
          taxAmount: taxAmount,
          couponDiscount: couponDiscount,
          totalAmount: totalAmount
        },

        status:
          BOOKING_STATUS.PENDING

      });


    return booking;

  }


  // ==================================================
  // CREATE TRIP / PACKAGE BOOKING
  // ==================================================

  async createTripBooking(
    userId,
    data
  ) {

    const pkg =
      await Package.findById(
        data.packageId
      );

    if (!pkg) {
      throw new AppError(
        "Holiday package not found",
        httpStatus.StatusCodes.NOT_FOUND
      );
    }

    if (pkg.status !== "ACTIVE") {
      throw new AppError(
        "Holiday package is currently unavailable",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }

    const requestedAdults = Number(data.adults || 1);
    const requestedChildren = Number(data.children || 0);
    const totalTravelers = requestedAdults + requestedChildren;

    if (totalTravelers > pkg.availableSeats) {
      throw new AppError(
        `Only ${pkg.availableSeats} seat(s) available for this package`,
        httpStatus.StatusCodes.CONFLICT
      );
    }

    const basePricePerPerson = pkg.startingPrice;
    const baseTotal = basePricePerPerson * totalTravelers;
    const subtotal = baseTotal;
    const taxAmount =
      data.taxAmount !== undefined && !isNaN(Number(data.taxAmount))
        ? Number(data.taxAmount)
        : Math.round(subtotal * 0.12);

    let couponDiscount = Number(data.couponDiscount || 0);
    let appliedCouponCode = data.couponCode
      ? data.couponCode.trim().toUpperCase()
      : null;

    if (appliedCouponCode) {
      try {
        const coupon = await Coupon.findOne({
          code: appliedCouponCode,
          isActive: true,
          expiry: { $gt: new Date() }
        });
        if (
          coupon &&
          (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
          subtotal >= (coupon.minAmount || 0)
        ) {
          if (coupon.type === "PERCENTAGE") {
            const calculatedDiscount = Math.round((subtotal * coupon.value) / 100);
            couponDiscount =
              coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount
                ? coupon.maxDiscount
                : calculatedDiscount;
          } else {
            couponDiscount = coupon.value;
          }
          await Coupon.findByIdAndUpdate(coupon._id, {
            $inc: { usageCount: 1 }
          });
        }
      } catch (couponErr) {
        console.warn("Coupon validation error in createTripBooking:", couponErr.message);
      }
    }

    const totalAmount = Math.max(0, subtotal + taxAmount - couponDiscount);

    const booking =
      await bookingRepository.create({

        bookingNumber:
          generateBookingNumber(),

        user:
          userId,

        bookingType:
          "TRIP",

        package:
          pkg._id,

        departureDate:
          data.departureDate ? new Date(data.departureDate) : (pkg.departureDates?.[0] || new Date()),

        traveler: {
          name: data.traveler.name,
          email: data.traveler.email,
          phone: data.traveler.phone
        },

        guests: {
          adults: requestedAdults,
          children: requestedChildren
        },

        coupon: appliedCouponCode,
        couponDiscount,
        specialRequests: data.specialRequests || "",

        priceSnapshot: {
          basePrice: basePricePerPerson,
          discountPercentage: 0,
          finalPricePerRoom: basePricePerPerson,
          nights: pkg.duration?.nights || 1,
          subtotal: subtotal,
          taxAmount: taxAmount,
          couponDiscount: couponDiscount,
          totalAmount: totalAmount
        },

        status:
          BOOKING_STATUS.PENDING

      });

    return booking;

  }


  // ==================================================
  // GET MY BOOKINGS
  // ==================================================

  async getMyBookings(
    userId
  ) {

    return bookingRepository
      .findByUser(
        userId
      );

  }


  // ==================================================
  // GET MY BOOKING
  // ==================================================

  async getMyBooking(
    bookingId,
    userId
  ) {

    const booking =
      await bookingRepository
        .findByIdForUser(
          bookingId,
          userId
        );


    if (!booking) {

      throw new AppError(
        "Booking not found",
        httpStatus.StatusCodes.NOT_FOUND
      );

    }


    return booking;

  }


  // ==================================================
  // CANCEL BOOKING
  // ==================================================

  async cancelBooking(
    bookingId,
    userId
  ) {

    const booking =
      await bookingRepository
        .findByIdForUser(
          bookingId,
          userId
        );


    if (!booking) {

      throw new AppError(
        "Booking not found",
        httpStatus.StatusCodes.NOT_FOUND
      );

    }


    if (
      [
        BOOKING_STATUS.CANCELLED,
        BOOKING_STATUS.REFUNDED
      ].includes(
        booking.status
      )
    ) {

      throw new AppError(
        "Booking is already cancelled",
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }


    if (
      booking.status ===
      BOOKING_STATUS.COMPLETED
    ) {

      throw new AppError(
        "Completed booking cannot be cancelled",
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }

    // Calculate Refund Slabs (Section 12 of Scope)
    const travelDate = booking.checkIn || booking.departureDate || new Date();
    const msDiff = new Date(travelDate).getTime() - Date.now();
    const daysBefore = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    let refundPercent = 0;
    if (daysBefore > 7) {
      refundPercent = 100;
    } else if (daysBefore >= 3) {
      refundPercent = 50;
    } else {
      refundPercent = 0;
    }

    const paidAmount = Number(booking.priceSnapshot?.totalAmount || 0);
    const refundAmount = Math.round((paidAmount * refundPercent) / 100);

    const updatedBooking =
      await bookingRepository
        .updateById(

          bookingId,

          {
            status:
              refundAmount > 0 ? BOOKING_STATUS.REFUND_PENDING : BOOKING_STATUS.CANCELLED,
            refundAmount,
            cancellationReason: `Cancelled ${daysBefore > 0 ? daysBefore : 0} days before travel (${refundPercent}% refund policy applied)`
          }

        );

    // If trip booking, restore seats to package
    if (booking.bookingType === "TRIP" && booking.package) {
      const seatsToRestore = (booking.guests?.adults || 1) + (booking.guests?.children || 0);
      await Package.findByIdAndUpdate(booking.package, {
        $inc: { availableSeats: seatsToRestore }
      });
    }

    return updatedBooking;

  }


  // ==================================================
  // GET BOOKING INVOICE PDF
  // ==================================================

  async getBookingInvoicePdf(
    bookingId,
    userId,
    userRole
  ) {

    const booking =
      await bookingRepository
        .findDetailedById(
          bookingId
        );

    if (!booking) {
      throw new AppError(
        "Booking not found",
        httpStatus.StatusCodes.NOT_FOUND
      );
    }

    if (
      userRole !== "SUPER_ADMIN" &&
      String(booking.user) !== String(userId)
    ) {
      throw new AppError(
        "You do not have permission to download this invoice",
        httpStatus.StatusCodes.FORBIDDEN
      );
    }

    const pdfBuffer =
      await bookingPdfService
        .generateBookingPdf(
          booking
        );

    return {
      pdfBuffer,
      bookingNumber:
        booking.bookingNumber
    };
  }

}


module.exports =
  new BookingService();