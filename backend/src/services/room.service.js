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

const AppError =
  require("../utils/appError");

const {
  HOTEL_STATUS
} =
  require("../models/hotel.model");


class RoomService {

  // ==================================================
  // CHECK HOTEL OWNERSHIP
  // ==================================================

  async checkHotelOwnership(
    hotelId,
    ownerId,
    userRole
  ) {

    const hotel =
      await hotelRepository.findById(
        hotelId
      );

    if (!hotel) {

      throw new AppError(
        "Hotel not found",
        httpStatus.StatusCodes.NOT_FOUND
      );
    }

    if (
      userRole !== "SUPER_ADMIN" &&
      hotel.owner.toString() !== ownerId.toString()
    ) {

      throw new AppError(
        "You can only manage rooms of your own hotel",
        httpStatus.StatusCodes.FORBIDDEN
      );
    }

    if (
      hotel.status ===
      HOTEL_STATUS.BLOCKED
    ) {

      throw new AppError(
        "Blocked hotel cannot manage rooms",
        httpStatus.StatusCodes.FORBIDDEN
      );
    }

    return hotel;
  }


  // ==================================================
  // CREATE ROOM
  // ==================================================

  async createRoom(
    hotelId,
    ownerId,
    data,
    userRole
  ) {

    await this.checkHotelOwnership(
      hotelId,
      ownerId,
      userRole
    );

    const finalPrice =
      this.calculateFinalPrice(
        data.basePrice,
        data.discountPercentage
      );

    const room =
      await roomRepository.create({

        hotel:
          hotelId,

        name:
          data.name,

        roomType:
          data.roomType,

        description:
          data.description,

        capacity: {

          adults:
            data.adults,

          children:
            data.children || 0

        },

        beds:
          data.beds,

        totalRooms:
          data.totalRooms,

        basePrice:
          data.basePrice,

        discountPercentage:
          data.discountPercentage || 0,

        finalPrice,

        amenities:
          data.amenities || [],

        images: Array.isArray(data.images) && data.images.length > 0
          ? data.images.map((img, idx) =>
              typeof img === "string"
                ? { url: img, publicId: `room_img_${Date.now()}_${idx}` }
                : img
            )
          : [
              {
                url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
                publicId: "default_room_" + Date.now()
              }
            ]

      });

    return room;
  }


  // ==================================================
  // GET ROOM
  // ==================================================

  async getRoom(
    roomId
  ) {

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

    return room;
  }


  // ==================================================
  // GET HOTEL ROOMS
  // ==================================================

  async getHotelRooms(
    hotelId
  ) {

    const hotel =
      await hotelRepository.findById(
        hotelId
      );

    if (!hotel) {

      throw new AppError(
        "Hotel not found",
        httpStatus.StatusCodes.NOT_FOUND
      );
    }

    return roomRepository.findByHotel(
      hotelId
    );
  }


  // ==================================================
  // UPDATE ROOM
  // ==================================================

  async updateRoom(
    roomId,
    ownerId,
    data,
    userRole
  ) {

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

    await this.checkHotelOwnership(
      room.hotel,
      ownerId,
      userRole
    );

    const updateData = {};

    const basePrice =
      data.basePrice !== undefined
        ? data.basePrice
        : room.basePrice;

    const discountPercentage =
      data.discountPercentage !==
      undefined
        ? data.discountPercentage
        : room.discountPercentage;

    updateData.finalPrice =
      this.calculateFinalPrice(
        basePrice,
        discountPercentage
      );


    const allowedFields = [
      "name",
      "roomType",
      "description",
      "beds",
      "basePrice",
      "discountPercentage",
      "amenities",
      "status"
    ];

    for (
      const field
      of allowedFields
    ) {

      if (
        data[field] !==
        undefined
      ) {

        updateData[field] =
          data[field];
      }
    }


    if (
      data.adults !== undefined ||
      data.children !== undefined
    ) {

      updateData.capacity = {

        adults:
          data.adults !== undefined
            ? data.adults
            : room.capacity.adults,

        children:
          data.children !== undefined
            ? data.children
            : room.capacity.children

      };
    }


    if (
      data.totalRooms !==
      undefined
    ) {

      updateData.totalRooms =
        data.totalRooms;
    }


    return roomRepository.updateById(
      roomId,
      updateData
    );
  }


  // ==================================================
  // DELETE ROOM
  // ==================================================

  async deleteRoom(
    roomId,
    ownerId,
    userRole
  ) {

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

    await this.checkHotelOwnership(
      room.hotel,
      ownerId,
      userRole
    );

    await roomRepository.deleteById(
      roomId
    );

    return true;
  }


  // ==================================================
  // CALCULATE FINAL PRICE
  // ==================================================

  calculateFinalPrice(
    basePrice,
    discountPercentage
  ) {

    const discount =
      (
        basePrice *
        discountPercentage
      ) / 100;

    return Number(
      (
        basePrice -
        discount
      ).toFixed(2)
    );
  }

}


module.exports =
  new RoomService();