const express =
  require("express");

const hotelController =
  require(
    "../controllers/hotel.controller"
  );

const roomController =
  require(
    "../controllers/room.controller"
  );

const authenticate =
  require(
    "../middlewares/auth.middleware"
  );

const authorize =
  require(
    "../middlewares/role.middleware"
  );

const validate =
  require(
    "../middlewares/validate.middleware"
  );

const asyncHandler =
  require(
    "../utils/asyncHandler"
  );

const ROLES =
  require(
    "../constants/roles"
  );

  const upload =
  require(
    "../middlewares/upload.middleware"
  );

const {
  createHotelSchema,
  updateHotelSchema,
  rejectHotelSchema
} =
  require(
    "../validators/hotel.validator"
  );


const router =
  express.Router();


// ==================================================
// CREATE HOTEL
// HOTEL_ADMIN only
// ==================================================

router.post(

  "/",

  authenticate,

  authorize(
    ROLES.HOTEL_ADMIN,
    ROLES.SUPER_ADMIN
  ),

  validate(
    createHotelSchema
  ),

  asyncHandler(
    hotelController.createHotel
  )

);


// ==================================================
// MY HOTELS
// HOTEL_ADMIN / SUPER_ADMIN
// ==================================================

router.get(

  "/my-hotels",

  authenticate,

  authorize(
    ROLES.HOTEL_ADMIN,
    ROLES.SUPER_ADMIN
  ),

  asyncHandler(
    hotelController.getMyHotels
  )

);


// ==================================================
// ALL HOTELS FOR SUPER_ADMIN
// ==================================================

router.get(

  "/admin/all",

  authenticate,

  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.HOTEL_ADMIN
  ),

  asyncHandler(
    hotelController.getAllHotels
  )

);


// ==================================================
// SEARCH & DISCOVER HOTELS (PUBLIC)
// ==================================================

router.get(

  "/",

  asyncHandler(
    hotelController.getAllHotels
  )

);


// ==================================================
// UPLOAD IMAGES FROM PC (STANDALONE UPLOAD)
// ==================================================

router.post(
  "/upload-image",

  authenticate,

  authorize(
    ROLES.HOTEL_ADMIN,
    ROLES.SUPER_ADMIN,
    ROLES.TRIP_MANAGER
  ),

  upload.array(
    "images",
    10
  ),

  asyncHandler(
    hotelController.uploadImagesStandalone
  )
);


// ==================================================
// GET SINGLE HOTEL (PUBLIC)
// ==================================================

router.get(
  "/:id",
  asyncHandler(
    hotelController.getHotel
  )
);

// GET ROOMS FOR SPECIFIC HOTEL
router.get(
  "/:id/rooms",
  asyncHandler(
    roomController.getHotelRooms
  )
);

// ADD ROOM FOR SPECIFIC HOTEL
router.post(
  "/:id/rooms",
  authenticate,
  authorize(
    ROLES.HOTEL_ADMIN,
    ROLES.SUPER_ADMIN
  ),
  asyncHandler(
    roomController.createRoom
  )
);


// ==================================================
// UPDATE HOTEL
// HOTEL_ADMIN only
// Ownership checked in service
// ==================================================

router.put(

  "/:id",

  authenticate,

  authorize(
    ROLES.HOTEL_ADMIN,
    ROLES.SUPER_ADMIN
  ),

  validate(
    updateHotelSchema
  ),

  asyncHandler(
    hotelController.updateHotel
  )

);


// ==================================================
// DELETE HOTEL
// HOTEL_ADMIN / SUPER_ADMIN
// Ownership checked in service
// ==================================================

router.delete(

  "/:id",

  authenticate,

  authorize(
    ROLES.HOTEL_ADMIN,
    ROLES.SUPER_ADMIN
  ),

  asyncHandler(
    hotelController.deleteHotel
  )

);


// ==================================================
// APPROVE HOTEL
// SUPER_ADMIN only
// ==================================================

router.patch(

  "/:id/approve",

  authenticate,

  authorize(
    ROLES.SUPER_ADMIN
  ),

  asyncHandler(
    hotelController.approveHotel
  )

);


// ==================================================
// REJECT HOTEL
// SUPER_ADMIN only
// ==================================================

router.patch(

  "/:id/reject",

  authenticate,

  authorize(
    ROLES.SUPER_ADMIN
  ),

  validate(
    rejectHotelSchema
  ),

  asyncHandler(
    hotelController.rejectHotel
  )

);


// ==================================================
// BLOCK HOTEL
// SUPER_ADMIN only
// ==================================================

router.patch(

  "/:id/block",

  authenticate,

  authorize(
    ROLES.SUPER_ADMIN
  ),

  asyncHandler(
    hotelController.blockHotel
  )

);

// ==================================================
// ADD HOTEL IMAGES
// ==================================================

router.post(

  "/:id/images",

  authenticate,

  authorize(
    ROLES.HOTEL_ADMIN
  ),

  upload.array(
    "images",
    10
  ),

  asyncHandler(
    hotelController.addHotelImages
  )

);

// ==================================================
// DELETE HOTEL IMAGE
// ==================================================

router.delete(

  "/:id/images",

  authenticate,

  authorize(
    ROLES.HOTEL_ADMIN
  ),

  asyncHandler(
    hotelController.deleteHotelImage
  )

);


module.exports =
  router;