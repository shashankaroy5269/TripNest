const httpStatus =
  require("http-status-codes");

const roomRepository =
  require(
    "../repositories/room.repository"
  );

const hotelRepository =
  require(
    "../repositories/hotel.repository"
  );

const bookingRepository =
  require(
    "../repositories/booking.repository"
  );

const AppError =
  require("../utils/appError");


class AvailabilityService {

  // ==================================================
  // CHECK ROOM AVAILABILITY
  // ==================================================

  async checkRoomAvailability({

    roomId,

    checkIn,

    checkOut,

    requestedRooms = 1

  }) {

    // ------------------------------------------
    // VALIDATE DATES
    // ------------------------------------------

    const startDate =
      this.parseDate(checkIn);

    const endDate =
      this.parseDate(checkOut);


    if (
      !startDate ||
      !endDate
    ) {

      throw new AppError(
        "Invalid check-in or check-out date",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }


    if (
      startDate >= endDate
    ) {

      throw new AppError(
        "Check-out must be after check-in",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }


    // ------------------------------------------
    // VALIDATE REQUESTED ROOMS
    // ------------------------------------------

    if (
      !Number.isInteger(
        Number(requestedRooms)
      ) ||
      Number(requestedRooms) < 1
    ) {

      throw new AppError(
        "Requested rooms must be at least 1",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }


    // ------------------------------------------
    // FIND ROOM
    // ------------------------------------------

    const room =
      await roomRepository.findById(
        roomId
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
        "Room is currently inactive",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }


    // ------------------------------------------
    // FIND HOTEL
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
        "Hotel is not currently available for booking",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }


    // ------------------------------------------
    // CALCULATE BOOKED ROOMS
    // ------------------------------------------

    const bookedRooms =
      await bookingRepository
        .getBookedRoomCount(

          roomId,

          startDate,

          endDate

        );


    // ------------------------------------------
    // CALCULATE AVAILABLE ROOMS
    // ------------------------------------------

    const availableRooms =
      Math.max(

        room.totalRooms -
        bookedRooms,

        0

      );


    // ------------------------------------------
    // AVAILABILITY RESULT
    // ------------------------------------------

    const available =
      availableRooms >=
      Number(requestedRooms);


    return {

      roomId:
        room._id,

      hotelId:
        hotel._id,

      checkIn:
        startDate,

      checkOut:
        endDate,

      requestedRooms:
        Number(requestedRooms),

      totalRooms:
        room.totalRooms,

      bookedRooms,

      availableRooms,

      available,

      price: {

        basePrice:
          room.basePrice,

        discountPercentage:
          room.discountPercentage,

        finalPricePerRoom:
          room.finalPrice

      }

    };
  }


  // ==================================================
  // CALCULATE NIGHTS
  // ==================================================

  calculateNights(
    checkIn,
    checkOut
  ) {

    const start =
      this.parseDate(checkIn);

    const end =
      this.parseDate(checkOut);

    if (
      !start ||
      !end ||
      start >= end
    ) {

      throw new AppError(
        "Invalid booking dates",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }


    const millisecondsPerDay =
      1000 *
      60 *
      60 *
      24;


    return Math.ceil(

      (
        end.getTime() -
        start.getTime()
      ) /
      millisecondsPerDay

    );
  }


  // ==================================================
  // SERVER-SIDE TOTAL PRICE
  // ==================================================

  async calculateBookingPrice({

    roomId,

    checkIn,

    checkOut,

    requestedRooms

  }) {

    const availability =
      await this.checkRoomAvailability({

        roomId,

        checkIn,

        checkOut,

        requestedRooms

      });


    if (
      !availability.available
    ) {

      throw new AppError(
        "Requested number of rooms is not available",
        httpStatus.StatusCodes.CONFLICT
      );
    }


    const nights =
      this.calculateNights(
        checkIn,
        checkOut
      );


    const pricePerRoom =
      availability.price
        .finalPricePerRoom;


    const totalAmount =
      pricePerRoom *
      Number(requestedRooms) *
      nights;


    return {

      roomId:
        availability.roomId,

      checkIn:
        availability.checkIn,

      checkOut:
        availability.checkOut,

      nights,

      rooms:
        Number(requestedRooms),

      pricePerRoom,

      totalAmount,

      priceSnapshot: {

        basePrice:
          availability.price
            .basePrice,

        discountPercentage:
          availability.price
            .discountPercentage,

        finalPricePerRoom:
          pricePerRoom,

        nights,

        totalAmount

      }

    };
  }


  // ==================================================
  // DATE PARSER
  // ==================================================

  parseDate(
    value
  ) {

    if (!value) {
      return null;
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return null;
    }


    return date;
  }

}


module.exports =
  new AvailabilityService();