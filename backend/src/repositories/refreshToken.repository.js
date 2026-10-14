const RefreshToken =
  require("../models/refreshToken.model");

class RefreshTokenRepository {

  async create(data) {
    return RefreshToken.create(data);
  }

  async findByTokenHash(tokenHash) {
    return RefreshToken.findOne({
      tokenHash
    });
  }

  async deleteById(id) {
    return RefreshToken.findByIdAndDelete(id);
  }

  async deleteByUser(userId) {
    return RefreshToken.deleteMany({
      user: userId
    });
  }

}

module.exports =
  new RefreshTokenRepository();