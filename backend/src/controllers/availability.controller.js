const availabilityService =
  require(
    "../services/availability.service"
  );

const ApiResponse =
  require(
    "../utils/apiResponse"
  );


class AvailabilityController {

    // CHECK AVAILABILITY
    checkAvailability = async (
    req,
    res
  ) => {
    let roomId =
      req.params.roomId ||
      req.query.roomId ||
      req.body?.roomId;

    if (!roomId && req.query.hotelId) {
      const { Room } = require("../models/room.model");
      const room = await Room.findOne({ hotel: req.query.hotelId, status: "ACTIVE" });
      if (room) {
        roomId = room._id.toString();
      }
    }

    if (!roomId) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: "Room ID or valid Hotel ID is required for availability check"
      });
    }

    const checkIn = req.query.checkIn || req.body?.checkIn || new Date(Date.now() + 86400000).toISOString();
    const checkOut = req.query.checkOut || req.body?.checkOut || new Date(Date.now() + 86400000 * 3).toISOString();

    const result =
      await availabilityService
        .checkRoomAvailability({
          roomId,
          checkIn,
          checkOut,
          requestedRooms:
            req.query.rooms || req.query.numberOfRooms || req.body?.rooms || 1
        });

    return ApiResponse.success(
      res,
      {
        message:
          result.available
            ? "Room is available"
            : "Room is not available",
        data:
          result
      }
    );
  };


    // CHECK HOTEL ROOMS AVAILABILITY
    checkHotelAvailability = async (
    req,
    res
  ) => {
    const hotelId =
      req.params.hotelId ||
      req.query.hotelId ||
      req.body?.hotelId;

    if (!hotelId) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: "Hotel ID is required"
      });
    }

    const checkIn =
      req.query.checkIn ||
      req.body?.checkIn ||
      new Date(Date.now() + 86400000).toISOString();

    const checkOut =
      req.query.checkOut ||
      req.body?.checkOut ||
      new Date(Date.now() + 86400000 * 3).toISOString();

    const requestedRooms =
      req.query.rooms ||
      req.query.numberOfRooms ||
      req.body?.rooms ||
      1;

    const result =
      await availabilityService
        .checkHotelRoomsAvailability({
          hotelId,
          checkIn,
          checkOut,
          requestedRooms
        });

    return ApiResponse.success(
      res,
      {
        message: "Hotel rooms availability retrieved successfully",
        data: result
      }
    );
  };


    // CALCULATE BOOKING PRICE
    calculatePrice = async (
    req,
    res
  ) => {
    const roomId =
      req.params.roomId ||
      req.query.roomId ||
      req.body?.roomId;

    if (!roomId) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: "Room ID is required to calculate price"
      });
    }

    const checkIn = req.body?.checkIn || req.query.checkIn || new Date(Date.now() + 86400000).toISOString();
    const checkOut = req.body?.checkOut || req.query.checkOut || new Date(Date.now() + 86400000 * 3).toISOString();
    const requestedRooms = req.body?.rooms || req.query.rooms || req.body?.numberOfRooms || 1;

    const result =
      await availabilityService
        .calculateBookingPrice({
          roomId,
          checkIn,
          checkOut,
          requestedRooms
        });

    return ApiResponse.success(
      res,
      {
        message:
          "Booking price calculated successfully",
        data: {
          ...result,
          totalPrice: result.totalAmount
        }
      }
    );
  };

}


module.exports =
  new AvailabilityController();