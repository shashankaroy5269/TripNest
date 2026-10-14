const User =
  require("../models/user.model");

class AuthRepository {


  async createUser(userData) {

    return User.create(
      userData
    );
  }


  async findByEmail(email) {

    return User
      .findOne({
        email
      })
      .select("+passwordHash");
  }


  async findById(id) {

    return User.findById(id);
  }

}

module.exports =
  new AuthRepository();