const express =
  require("express");

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

const {
  createRoomSchema,
  updateRoomSchema,
  bulkCreateRoomSchema
} =
  require(
    "../validators/room.validator"
  );


const router =
  express.Router();


// ==================================================
// BULK CREATE ROOMS (EXCEL / CSV IMPORT)
// ==================================================

router.post(
  "/hotel/:hotelId/bulk",
  authenticate,
  authorize(
    ROLES.HOTEL_ADMIN,
    ROLES.SUPER_ADMIN
  ),
  validate(
    bulkCreateRoomSchema
  ),
  asyncHandler(
    roomController.bulkCreateRooms
  )
);

router.post(
  "/bulk",
  authenticate,
  authorize(
    ROLES.HOTEL_ADMIN,
    ROLES.SUPER_ADMIN
  ),
  validate(
    bulkCreateRoomSchema
  ),
  asyncHandler(
    roomController.bulkCreateRooms
  )
);


// ==================================================
// CREATE ROOM
// ==================================================

// CREATE ROOM (Direct or with hotelId parameter)
router.post(
  "/",
  authenticate,
  authorize(
    ROLES.HOTEL_ADMIN,
    ROLES.SUPER_ADMIN
  ),
  asyncHandler(
    roomController.createRoom
  )
);

router.post(
  "/hotel/:hotelId",
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
// GET HOTEL ROOMS (PUBLIC)
// ==================================================

router.get(

  "/hotel/:hotelId",

  asyncHandler(
    roomController.getHotelRooms
  )

);


// ==================================================
// GET SINGLE ROOM (PUBLIC)
// ==================================================

router.get(

  "/:id",

  asyncHandler(
    roomController.getRoom
  )

);


// ==================================================
// UPDATE ROOM
// ==================================================

router.put(

  "/:id",

  authenticate,

  authorize(
    ROLES.HOTEL_ADMIN,
    ROLES.SUPER_ADMIN
  ),

  validate(
    updateRoomSchema
  ),

  asyncHandler(
    roomController.updateRoom
  )

);


// ==================================================
// DELETE ROOM
// ==================================================

router.delete(

  "/:id",

  authenticate,

  authorize(
    ROLES.HOTEL_ADMIN,
    ROLES.SUPER_ADMIN
  ),

  asyncHandler(
    roomController.deleteRoom
  )

);


module.exports =
  router;