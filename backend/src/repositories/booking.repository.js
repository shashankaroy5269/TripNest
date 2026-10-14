const mongoose = require("mongoose");

const {
  Booking
} = require("../models/booking.model");

const BOOKING_STATUS =
  require("../constants/bookingStatus");


class BookingRepository {

    // CREATE BOOKING
    async create(data) {

    return Booking.create(data);

  }


    // FIND BOOKING BY ID
    async findById(bookingId) {
    return Booking.findById(
      bookingId
    )
      .populate("hotel")
      .populate("room")
      .populate("package");
  }


    // FIND BOOKING FOR SPECIFIC USER
    // Prevents user from accessing another user's booking

  async findByIdForUser(
    bookingId,
    userId
  ) {
    return Booking.findOne({
      _id: bookingId,
      user: userId
    })
      .populate("hotel")
      .populate("room")
      .populate("package");
  }


    // GET USER BOOKINGS
    async findByUser(userId) {
    return Booking.find({
      user: userId
    })
      .populate("hotel")
      .populate("room")
      .populate("package")
      .sort({
        createdAt: -1
      });
  }


    // GET HOTEL BOOKINGS
    async findByHotel(hotelId) {

    return Booking.find({

      hotel: hotelId

    })
      .sort({
        createdAt: -1
      });

  }


    // UPDATE BOOKING
    async updateById(
    bookingId,
    updateData
  ) {

    return Booking.findByIdAndUpdate(

      bookingId,

      {
        $set: updateData
      },

      {
        new: true,
        runValidators: true
      }

    );

  }


    // GET OVERLAPPING BOOKINGS
    /*
    Date overlap condition:

    existing.checkIn < requested.checkOut

    AND

    existing.checkOut > requested.checkIn

    This means:

    Existing:
    10 Oct → 13 Oct

    Requested:
    13 Oct → 15 Oct

    No overlap.
  */

  async getOverlappingBookings(
    roomId,
    checkIn,
    checkOut
  ) {
    const roomObjectId =
      mongoose.Types.ObjectId.isValid(roomId)
        ? new mongoose.Types.ObjectId(roomId)
        : roomId;

    const startDate = checkIn instanceof Date ? checkIn : new Date(checkIn);
    const endDate = checkOut instanceof Date ? checkOut : new Date(checkOut);

    return Booking.find({

      room: roomObjectId,

      status: {
        $in: [
          BOOKING_STATUS.PENDING,
          BOOKING_STATUS.CONFIRMED
        ]
      },

      checkIn: {
        $lt: endDate
      },

      checkOut: {
        $gt: startDate
      }

    })
      .sort({
        checkIn: 1
      });

  }


    // GET BOOKED ROOM COUNT
    /*
    Used for room availability.

    Example:

    Total Rooms = 5

    Booking 1 = 2 rooms
    Booking 2 = 1 room

    Booked Rooms = 3

    Available Rooms = 5 - 3 = 2
  */

  async getBookedRoomCount(
    roomId,
    checkIn,
    checkOut
  ) {
    const roomObjectId =
      mongoose.Types.ObjectId.isValid(roomId)
        ? new mongoose.Types.ObjectId(roomId)
        : roomId;

    const startDate = checkIn instanceof Date ? checkIn : new Date(checkIn);
    const endDate = checkOut instanceof Date ? checkOut : new Date(checkOut);

    const result =
      await Booking.aggregate([

        // ------------------------------------------
        // MATCH ROOM + ACTIVE BOOKINGS
        // ------------------------------------------

        {
          $match: {

            room: roomObjectId,

            status: {
              $in: [
                BOOKING_STATUS.PENDING,
                BOOKING_STATUS.CONFIRMED
              ]
            },

            // --------------------------------------
            // DATE OVERLAP
            // --------------------------------------

            checkIn: {
              $lt: endDate
            },

            checkOut: {
              $gt: startDate
            }

          }
        },


        // ------------------------------------------
        // SUM BOOKED ROOMS
        // ------------------------------------------

        {
          $group: {

            _id: null,

            bookedRooms: {
              $sum: { $ifNull: ["$roomsBooked", 1] }
            }

          }
        },


        // ------------------------------------------
        // CLEAN RESPONSE
        // ------------------------------------------

        {
          $project: {

            _id: 0,

            bookedRooms: 1

          }
        }

      ]);


    return result.length > 0
      ? result[0].bookedRooms
      : 0;

  }


    // GET COMPLETE BOOKING DETAILS
  // BOOKING + HOTEL + ROOM
    /*
    Used for:

    - Booking confirmation email
    - Booking PDF
    - Booking details page
    - Invoice/Ticket
  */

  async findDetailedById(
    bookingId
  ) {

    // ------------------------------------------
    // VALIDATE OBJECT ID
    // ------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        bookingId
      )
    ) {

      return null;

    }


    // ------------------------------------------
    // CONVERT STRING TO OBJECT ID
    // ------------------------------------------

    const bookingObjectId =
      new mongoose.Types.ObjectId(
        bookingId
      );


    // ------------------------------------------
    // AGGREGATION PIPELINE
    // ------------------------------------------

    const result =
      await Booking.aggregate([

                // MATCH BOOKING
                {
          $match: {

            _id:
              bookingObjectId

          }

        },


                // HOTEL LOOKUP
                {
          $lookup: {

            from:
              "hotels",

            localField:
              "hotel",

            foreignField:
              "_id",

            as:
              "hotel"

          }

        },


                // ROOM LOOKUP
                {
          $lookup: {

            from:
              "rooms",

            localField:
              "room",

            foreignField:
              "_id",

            as:
              "room"

          }

        },


                // UNWIND HOTEL
                {
          $unwind: {

            path:
              "$hotel",

            preserveNullAndEmptyArrays:
              true

          }

        },


                // UNWIND ROOM
                {
          $unwind: {

            path:
              "$room",

            preserveNullAndEmptyArrays:
              true

          }

        },

                // PACKAGE LOOKUP (FOR TRIP BOOKINGS)
                {
          $lookup: {

            from:
              "packages",

            localField:
              "package",

            foreignField:
              "_id",

            as:
              "package"

          }

        },

        {
          $unwind: {

            path:
              "$package",

            preserveNullAndEmptyArrays:
              true

          }

        }

      ]);


    // ------------------------------------------
    // RETURN BOOKING
    // ------------------------------------------

    return result.length > 0
      ? result[0]
      : null;

  }

}


module.exports =
  new BookingRepository();