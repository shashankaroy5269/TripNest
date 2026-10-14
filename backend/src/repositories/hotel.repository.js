const {
  Hotel
} = require("../models/hotel.model");

class HotelRepository {

  async create(data) {
    return Hotel.create(data);
  }

  async findById(hotelId) {
    return Hotel.findById(hotelId);
  }

  async findByIdWithOwner(hotelId) {
    return Hotel.findById(hotelId)
      .populate("owner", "name email role");
  }

  async findByOwner(ownerId) {
    return Hotel.find({
      owner: ownerId
    })
      .populate("owner", "name email role")
      .sort({
        createdAt: -1
      });
  }

  async findAll(filter = {}, sort = { createdAt: -1 }) {
    return Hotel.find(filter)
      .populate(
        "owner",
        "name email role"
      )
      .sort(sort);
  }

  async updateById(hotelId, updateData) {
    const update = Object.keys(updateData).some((k) => k.startsWith("$"))
      ? updateData
      : { $set: updateData };

    return Hotel.findByIdAndUpdate(
      hotelId,
      update,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async updateOne(
  filter,
  update
) {

  return Hotel.findOneAndUpdate(

    filter,

    update,

    {
      new: true,
      runValidators: true
    }

  );
}
  async deleteById(hotelId) {
    return Hotel.findByIdAndDelete(
      hotelId
    );
  }

  async insertMany(hotels) {
    return Hotel.insertMany(hotels);
  }

  async findByNameAndCity(name, city) {
    return Hotel.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
      "location.city": new RegExp(`^${city.trim()}$`, "i"),
    });
  }
}

module.exports =
  new HotelRepository();