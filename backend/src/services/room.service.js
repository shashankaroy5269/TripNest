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

const {
  ROOM_TYPES
} =
  require("../models/room.model");


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

  // ==================================================
  // BULK CREATE ROOMS
  // ==================================================
  async bulkCreateRooms(
    hotelId,
    ownerId,
    roomsData,
    userRole
  ) {
    const hotel = await this.checkHotelOwnership(
      hotelId,
      ownerId,
      userRole
    );

    if (!Array.isArray(roomsData) || roomsData.length === 0) {
      throw new AppError(
        "No room records provided for bulk import",
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }

    // Fetch existing rooms to detect duplicates in hotel
    const existingRooms = await roomRepository.findByHotel(hotelId);
    const existingNamesSet = new Set(
      existingRooms.map((r) => r.name.trim().toLowerCase())
    );

    const validToInsert = [];
    const errors = [];
    const skipped = [];
    const seenInBatch = new Set();

    for (let i = 0; i < roomsData.length; i++) {
      const item = roomsData[i];
      const rowNum = item.originalRow || i + 2;

      // 1. Name validation
      if (!item.name || typeof item.name !== "string" || item.name.trim().length < 2) {
        errors.push({
          row: rowNum,
          error: `Row ${rowNum}: Room name is required and must be at least 2 characters.`
        });
        continue;
      }

      const trimmedName = item.name.trim();

      // 2. Room Type validation
      const normalizedType = (item.roomType || "").toString().trim().toUpperCase();
      if (!Object.values(ROOM_TYPES).includes(normalizedType)) {
        errors.push({
          row: rowNum,
          error: `Row ${rowNum}: Invalid roomType "${item.roomType}". Must be one of: ${Object.values(ROOM_TYPES).join(", ")}.`
        });
        continue;
      }

      // 3. Capacity validation
      const adults = Number(item.adults);
      if (isNaN(adults) || adults < 1) {
        errors.push({
          row: rowNum,
          error: `Row ${rowNum}: Adults capacity must be a number of at least 1.`
        });
        continue;
      }

      const children = item.children !== undefined ? Number(item.children) : 0;
      if (isNaN(children) || children < 0) {
        errors.push({
          row: rowNum,
          error: `Row ${rowNum}: Children capacity cannot be negative.`
        });
        continue;
      }

      // 4. Beds validation
      if (!item.beds || typeof item.beds !== "string" || !item.beds.trim()) {
        errors.push({
          row: rowNum,
          error: `Row ${rowNum}: Bed configuration is required.`
        });
        continue;
      }

      // 5. Total Rooms Inventory validation
      const totalRooms = Number(item.totalRooms);
      if (isNaN(totalRooms) || totalRooms < 1) {
        errors.push({
          row: rowNum,
          error: `Row ${rowNum}: Total rooms inventory count must be at least 1.`
        });
        continue;
      }

      // 6. Base Price validation
      const basePrice = Number(item.basePrice);
      if (isNaN(basePrice) || basePrice < 0) {
        errors.push({
          row: rowNum,
          error: `Row ${rowNum}: Base price per night cannot be negative.`
        });
        continue;
      }

      // 7. Discount Percentage validation
      const discountPercentage = item.discountPercentage !== undefined ? Number(item.discountPercentage) : 0;
      if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
        errors.push({
          row: rowNum,
          error: `Row ${rowNum}: Discount percentage must be between 0 and 100.`
        });
        continue;
      }

      // 8. Duplicate checking within batch
      const nameKey = trimmedName.toLowerCase();
      if (seenInBatch.has(nameKey)) {
        skipped.push({
          row: rowNum,
          name: trimmedName,
          reason: `Duplicate within import batch: "${trimmedName}" was already included earlier in this import.`
        });
        continue;
      }

      // 9. Duplicate checking against existing hotel rooms
      if (existingNamesSet.has(nameKey)) {
        skipped.push({
          row: rowNum,
          name: trimmedName,
          reason: `Already exists: A room named "${trimmedName}" already exists in ${hotel.name}.`
        });
        continue;
      }

      seenInBatch.add(nameKey);

      // Amenities parsing
      let amenitiesList = [];
      if (Array.isArray(item.amenities)) {
        amenitiesList = item.amenities.map((a) => String(a).trim()).filter(Boolean);
      } else if (typeof item.amenities === "string") {
        amenitiesList = item.amenities.split(/[,;|]/).map((a) => a.trim()).filter(Boolean);
      }

      const finalPrice = this.calculateFinalPrice(basePrice, discountPercentage);

      validToInsert.push({
        hotel: hotelId,
        name: trimmedName,
        roomType: normalizedType,
        description: item.description
          ? String(item.description).trim()
          : `Luxurious ${normalizedType.toLowerCase()} room with premium comfort and amenities.`,
        capacity: { adults, children },
        beds: String(item.beds).trim(),
        totalRooms,
        basePrice,
        discountPercentage,
        finalPrice,
        amenities:
          amenitiesList.length > 0
            ? amenitiesList
            : ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV"],
        images:
          Array.isArray(item.images) && item.images.length > 0
            ? item.images.map((img, idx) =>
                typeof img === "string"
                  ? { url: img, publicId: `room_bulk_${Date.now()}_${idx}` }
                  : img
              )
            : [
                {
                  url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                  publicId: `default_room_${Date.now()}_${i}`
                }
              ],
        status: "ACTIVE"
      });
    }

    let insertedRooms = [];
    if (validToInsert.length > 0) {
      insertedRooms = await roomRepository.insertMany(validToInsert);
    }

    return {
      insertedCount: insertedRooms.length,
      insertedRooms,
      skippedCount: skipped.length,
      skipped,
      errorCount: errors.length,
      errors
    };
  }
}


module.exports =
  new RoomService();