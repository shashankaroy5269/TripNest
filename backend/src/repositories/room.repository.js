const {
  Room
} = require("../models/room.model");

class RoomRepository {

  async create(data) {
    return Room.create(data);
  }

  async findById(roomId) {
    return Room.findById(roomId);
  }

  async findByHotel(hotelId) {
    return Room.find({
      hotel: hotelId
    }).sort({
      createdAt: -1
    });
  }

  async findActiveByHotel(hotelId) {
    return Room.find({
      hotel: hotelId,
      status: "ACTIVE"
    });
  }

  async updateById(
    roomId,
    updateData
  ) {
    return Room.findByIdAndUpdate(
      roomId,
      {
        $set: updateData
      },
      {
        new: true,
        runValidators: true
      }
    );
  }

  async deleteById(roomId) {
    return Room.findByIdAndDelete(
      roomId
    );
  }

  async insertMany(rooms) {
    return Room.insertMany(rooms);
  }

  async findByHotelAndName(hotelId, name) {
    return Room.findOne({
      hotel: hotelId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") }
    });
  }
}

module.exports =
  new RoomRepository();