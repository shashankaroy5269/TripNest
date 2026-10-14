const express =
  require("express");


const bookingController =
  require(
    "../controllers/booking.controller"
  );


const authenticate =
  require(
    "../middlewares/auth.middleware"
  );


const validate =
  require(
    "../middlewares/validate.middleware"
  );


const asyncHandler =
  require(
    "../utils/asyncHandler"
  );


const {
  createHotelBookingSchema
} =
  require(
    "../validators/booking.validator"
  );


const router =
  express.Router();


// CREATE BOOKING (UNIFIED ROUTE)
router.post(
  "/",
  authenticate,
  asyncHandler(
    bookingController.createBooking
  )
);

// CREATE HOTEL BOOKING
router.post(
  "/hotel",
  authenticate,
  validate(
    createHotelBookingSchema
  ),
  asyncHandler(
    bookingController.createHotelBooking
  )
);


// CREATE TRIP BOOKING
router.post(

  "/trip",

  authenticate,

  asyncHandler(
    bookingController.createTripBooking
  )

);


// MY BOOKINGS
router.get(
  "/my",
  authenticate,
  asyncHandler(
    bookingController.getMyBookings
  )
);

router.get(
  "/my-bookings",
  authenticate,
  asyncHandler(
    bookingController.getMyBookings
  )
);


// SINGLE MY BOOKING
router.get(
  "/:id",
  authenticate,
  asyncHandler(
    bookingController.getMyBooking
  )
);


// CANCEL BOOKING
router.post(
  "/:id/cancel",
  authenticate,
  asyncHandler(
    bookingController.cancelBooking
  )
);

router.patch(
  "/:id/cancel",
  authenticate,
  asyncHandler(
    bookingController.cancelBooking
  )
);


// DOWNLOAD INVOICE PDF
router.get(

  "/:id/invoice",

  authenticate,

  asyncHandler(
    bookingController.downloadInvoice
  )

);


module.exports =
  router;