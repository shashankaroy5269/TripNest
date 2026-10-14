const roomService =
  require(
    "../services/room.service"
  );

const ApiResponse =
  require(
    "../utils/apiResponse"
  );


class RoomController {

  // ==================================================
  // CREATE ROOM
  // ==================================================

  createRoom = async (
    req,
    res
  ) => {
    const hotelId = req.params.hotelId || req.params.id || req.body.hotelId;
    const body = {
      name: req.body.name,
      roomType: (req.body.roomType || "DELUXE").toUpperCase(),
      description: req.body.description || "",
      adults: Number(req.body.adults || req.body.maxGuests || 2),
      children: Number(req.body.children || 0),
      beds: req.body.beds || "1 King Bed",
      totalRooms: Number(req.body.totalRooms || req.body.totalInventory || 5),
      basePrice: Number(req.body.basePrice || req.body.pricePerNight || 3500),
      discountPercentage: Number(req.body.discountPercentage || 0),
      amenities: Array.isArray(req.body.amenities)
        ? req.body.amenities
        : (req.body.amenities || "").split(",").map(s => s.trim()).filter(Boolean)
    };

    const room =
      await roomService.createRoom(
        hotelId,
        req.user.userId,
        body,
        req.user.role
      );

    return ApiResponse.success(
      res,
      {
        statusCode: 201,
        message: "Room created successfully",
        data: room
      }
    );
  };


  // ==================================================
  // GET ROOM
  // ==================================================

  getRoom = async (
    req,
    res
  ) => {

    const room =
      await roomService.getRoom(
        req.params.id
      );

    return ApiResponse.success(
      res,
      {

        message:
          "Room fetched successfully",

        data:
          room

      }
    );
  };


  // ==================================================
  // GET HOTEL ROOMS
  // ==================================================

  getHotelRooms = async (
    req,
    res
  ) => {
    const hotelId = req.params.hotelId || req.params.id || req.query.hotelId;
    const rooms =
      await roomService
        .getHotelRooms(
          hotelId
        );

    return ApiResponse.success(
      res,
      {

        message:
          "Hotel rooms fetched successfully",

        data:
          rooms

      }
    );
  };


  // ==================================================
  // UPDATE ROOM
  // ==================================================

  updateRoom = async (
    req,
    res
  ) => {

    const room =
      await roomService.updateRoom(
        req.params.id,
        req.user.userId,
        req.body,
        req.user.role
      );

    return ApiResponse.success(
      res,
      {
        message:
          "Room updated successfully",
        data:
          room
      }
    );
  };


  // ==================================================
  // DELETE ROOM
  // ==================================================

  deleteRoom = async (
    req,
    res
  ) => {

    await roomService.deleteRoom(
      req.params.id,
      req.user.userId,
      req.user.role
    );

    return ApiResponse.success(
      res,
      {

        message:
          "Room deleted successfully"

      }
    );
  };

  // ==================================================
  // BULK CREATE ROOMS
  // ==================================================
  bulkCreateRooms = async (
    req,
    res
  ) => {
    const hotelId = req.params.hotelId || req.body.hotelId;
    const roomsData = req.body.rooms || req.body;

    const result = await roomService.bulkCreateRooms(
      hotelId,
      req.user.userId,
      roomsData,
      req.user.role
    );

    return ApiResponse.success(
      res,
      {
        statusCode: result.insertedCount > 0 ? 201 : 200,
        message: `Successfully processed bulk import: ${result.insertedCount} rooms created.`,
        data: result
      }
    );
  };

}


module.exports =
  new RoomController();