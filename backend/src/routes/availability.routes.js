const express =
  require("express");

const availabilityController =
  require(
    "../controllers/availability.controller"
  );

const authenticate =
  require(
    "../middlewares/auth.middleware"
  );

const validateQuery =
  require(
    "../middlewares/validateQuery.middleware"
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
  availabilityQuerySchema,
  bookingPriceSchema
} =
  require(
    "../validators/availability.validator"
  );


const router =
  express.Router();


// ==================================================
// CHECK ROOM AVAILABILITY (PUBLIC)
// ==================================================

router.get(
  "/check",
  asyncHandler(
    availabilityController.checkAvailability
  )
);

router.get(
  "/hotel/:hotelId",
  asyncHandler(
    availabilityController.checkHotelAvailability
  )
);

router.get(
  "/calculate-price",
  asyncHandler(
    availabilityController.calculatePrice
  )
);

router.post(
  "/calculate-price",
  asyncHandler(
    availabilityController.calculatePrice
  )
);

router.get(
  "/room/:roomId",
  validateQuery(
    availabilityQuerySchema
  ),
  asyncHandler(
    availabilityController
      .checkAvailability
  )
);


// ==================================================
// CALCULATE BOOKING PRICE (PUBLIC)
// ==================================================

router.post(

  "/room/:roomId/calculate-price",

  validate(
    bookingPriceSchema
  ),

  asyncHandler(
    availabilityController
      .calculatePrice
  )

);


module.exports =
  router;