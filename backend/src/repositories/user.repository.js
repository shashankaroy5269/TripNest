const User =
  require("../models/user.model");

class UserRepository {

  // ==========================================
  // FIND USER BY ID
  // ==========================================

  async findById(userId) {

    return User.findById(
      userId
    );
  }


  // ==========================================
  // FIND USER BY ID WITH PASSWORD
  // ==========================================

  async findByIdWithPassword(
    userId
  ) {

    return User
      .findById(userId)
      .select("+passwordHash");
  }


  // ==========================================
  // UPDATE USER
  // ==========================================

  async updateById(
    userId,
    updateData
  ) {

    return User.findByIdAndUpdate(

      userId,

      {
        $set: updateData
      },

      {
        new: true,
        runValidators: true
      }
    );
  }


  // ==========================================
  // UPDATE PASSWORD
  // ==========================================

  async updatePassword(
    userId,
    passwordHash
  ) {

    return User.findByIdAndUpdate(

      userId,

      {
        $set: {
          passwordHash
        }
      },

      {
        new: true
      }
    );
  }


  // ==========================================
  // FIND USER BY EMAIL
  // ==========================================

  async findByEmail(
    email
  ) {

    return User.findOne({
      email
    });
  }


  // ==========================================
  // SAVE RESET TOKEN
  // ==========================================

  async saveResetToken(
    userId,
    resetTokenHash,
    resetTokenExpires
  ) {

    return User.findByIdAndUpdate(

      userId,

      {
        $set: {

          passwordResetToken:
            resetTokenHash,

          passwordResetExpires:
            resetTokenExpires

        }
      },

      {
        new: true
      }
    );
  }


  // ==========================================
  // FIND USER BY RESET TOKEN
  // ==========================================

  async findByResetToken(
    resetTokenHash
  ) {

    return User.findOne({

      passwordResetToken:
        resetTokenHash,

      passwordResetExpires: {
        $gt: new Date()
      }

    }).select(
      "+passwordResetToken"
    );
  }


  // ==========================================
  // CLEAR RESET TOKEN
  // ==========================================

  async clearResetToken(
    userId
  ) {

    return User.findByIdAndUpdate(

      userId,

      {
        $unset: {
          passwordResetToken: 1,
          passwordResetExpires: 1
        }
      },

      {
        new: true
      }
    );
  }

}

module.exports =
  new UserRepository();