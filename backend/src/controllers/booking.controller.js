const bookingService =
  require(
    "../services/booking.service"
  );


const ApiResponse =
  require(
    "../utils/apiResponse"
  );


class BookingController {

    // CREATE BOOKING (HOTEL OR TRIP - UNIFIED ENDPOINT)
    createBooking = async (req, res) => {
    const isTrip = req.body.bookingType === "TRIP" || !!req.body.package;
    const traveler = req.body.primaryContact || req.body.traveler || {
      name: req.user?.name || "Guest Traveler",
      email: req.user?.email || "guest@tripnest.com",
      phone: "9876543210"
    };

    if (isTrip) {
      const tripData = {
        packageId: req.body.package || req.body.packageId,
        adults: req.body.guestCount || req.body.travelersCount || req.body.adults || 1,
        children: req.body.children || 0,
        traveler,
        departureDate: req.body.travelDate || req.body.departureDate,
        couponCode: req.body.couponCode || req.body.coupon,
        couponDiscount: req.body.couponDiscount || 0,
        taxAmount: req.body.taxAmount,
        specialRequests: req.body.specialRequests
      };
      const booking = await bookingService.createTripBooking(req.user.userId, tripData);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Holiday trip booking created successfully",
        data: booking
      });
    } else {
      const hotelData = {
        roomId: req.body.room || req.body.roomId,
        checkIn: req.body.checkInDate || req.body.checkIn,
        checkOut: req.body.checkOutDate || req.body.checkOut,
        rooms: req.body.numberOfRooms || req.body.roomsCount || req.body.rooms || 1,
        adults: req.body.guestCount || req.body.adults || 1,
        children: req.body.children || 0,
        traveler,
        couponCode: req.body.couponCode || req.body.coupon,
        couponDiscount: req.body.couponDiscount || 0,
        taxAmount: req.body.taxAmount,
        specialRequests: req.body.specialRequests
      };
      const booking = await bookingService.createHotelBooking(req.user.userId, hotelData);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Hotel booking created successfully",
        data: booking
      });
    }
  };

    // CREATE HOTEL BOOKING
    createHotelBooking = async (
    req,
    res
  ) => {

    const booking =
      await bookingService
        .createHotelBooking(

          req.user.userId,

          req.body

        );


    return ApiResponse.success(
      res,
      {

        statusCode: 201,

        message:
          "Hotel booking created successfully",

        data:
          booking

      }
    );

  };


    // CREATE TRIP BOOKING
    createTripBooking = async (
    req,
    res
  ) => {

    const booking =
      await bookingService
        .createTripBooking(
          req.user.userId,
          req.body
        );

    return ApiResponse.success(
      res,
      {
        statusCode: 201,
        message: "Holiday trip booking created successfully",
        data: booking
      }
    );

  };


    // MY BOOKINGS
    getMyBookings = async (
    req,
    res
  ) => {

    const bookings =
      await bookingService
        .getMyBookings(
          req.user.userId
        );


    return ApiResponse.success(
      res,
      {

        message:
          "Bookings fetched successfully",

        data:
          bookings

      }
    );

  };


    // SINGLE BOOKING
    getMyBooking = async (
    req,
    res
  ) => {

    const booking =
      await bookingService
        .getMyBooking(

          req.params.id,

          req.user.userId

        );


    return ApiResponse.success(
      res,
      {

        message:
          "Booking fetched successfully",

        data:
          booking

      }
    );

  };


    // CANCEL BOOKING
    cancelBooking = async (
    req,
    res
  ) => {

    const booking =
      await bookingService
        .cancelBooking(
          req.params.id,
          req.user.userId,
          req.body?.cancellationReason || req.body?.reason
        );


    return ApiResponse.success(
      res,
      {

        message:
          "Booking cancelled successfully",

        data:
          booking

      }
    );

  };


    // DOWNLOAD INVOICE PDF
    downloadInvoice = async (
    req,
    res
  ) => {

    const {
      pdfBuffer,
      bookingNumber
    } = await bookingService
      .getBookingInvoicePdf(
        req.params.id,
        req.user.userId,
        req.user.role
      );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="TripNest-${bookingNumber}.pdf"`
    );
    res.setHeader(
      "Content-Length",
      pdfBuffer.length
    );

    return res.end(pdfBuffer);
  };

}


module.exports =
  new BookingController();