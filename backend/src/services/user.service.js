const bcrypt =
  require("bcryptjs");

const crypto =
  require("crypto");

const httpStatus =
  require("http-status-codes");


const userRepository =
  require(
    "../repositories/user.repository"
  );


const refreshTokenRepository =
  require(
    "../repositories/refreshToken.repository"
  );


const AppError =
  require("../utils/appError");


const cloudinary =
  require("../config/cloudinary");


class UserService {


    // GET PROFILE
    async getProfile(
    userId
  ) {

    const user =
      await userRepository.findById(
        userId
      );


    if (!user) {

      throw new AppError(
        "User not found",

        httpStatus.StatusCodes
          .NOT_FOUND
      );
    }


    return this.sanitizeUser(
      user
    );
  }


    // UPDATE PROFILE
    async updateProfile(
    userId,
    data
  ) {

    const allowedFields = {

      name:
        data.name,

      phone:
        data.phone

    };


    // Remove undefined fields

    Object.keys(
      allowedFields
    ).forEach(
      (key) => {

        if (
          allowedFields[key] ===
          undefined
        ) {

          delete allowedFields[key];
        }
      }
    );


    const user =
      await userRepository
        .updateById(
          userId,
          allowedFields
        );


    if (!user) {

      throw new AppError(
        "User not found",

        httpStatus.StatusCodes
          .NOT_FOUND
      );
    }


    return this.sanitizeUser(
      user
    );
  }


    // CHANGE PASSWORD
    async changePassword(
    userId,
    currentPassword,
    newPassword
  ) {

    const user =
      await userRepository
        .findByIdWithPassword(
          userId
        );


    if (!user) {

      throw new AppError(
        "User not found",

        httpStatus.StatusCodes
          .NOT_FOUND
      );
    }


    const isPasswordCorrect =
      await bcrypt.compare(

        currentPassword,

        user.passwordHash

      );


    if (!isPasswordCorrect) {

      throw new AppError(
        "Current password is incorrect",

        httpStatus.StatusCodes
          .BAD_REQUEST
      );
    }


    if (
      currentPassword ===
      newPassword
    ) {

      throw new AppError(
        "New password must be different from current password",

        httpStatus.StatusCodes
          .BAD_REQUEST
      );
    }


    const passwordHash =
      await bcrypt.hash(
        newPassword,
        12
      );


    await userRepository
      .updatePassword(
        userId,
        passwordHash
      );


    // Invalidate all existing sessions
    // after password change

    await refreshTokenRepository
      .deleteByUser(
        userId
      );


    return true;
  }


    // UPLOAD PROFILE IMAGE
    async uploadProfileImage(
    userId,
    file
  ) {

    if (!file) {

      throw new AppError(
        "Profile image is required",

        httpStatus.StatusCodes
          .BAD_REQUEST
      );
    }


    const user =
      await userRepository.findById(
        userId
      );


    if (!user) {

      throw new AppError(
        "User not found",

        httpStatus.StatusCodes
          .NOT_FOUND
      );
    }


        // DELETE OLD CLOUDINARY IMAGE
        if (
      user.profileImage &&
      user.profileImage.publicId
    ) {

      try {

        await cloudinary.uploader
          .destroy(
            user.profileImage.publicId
          );

      } catch (error) {

        console.error(
          "Old profile image deletion failed:",
          error.message
        );
      }
    }


        // UPLOAD NEW IMAGE
        const uploadResult =
      await new Promise(
        (resolve, reject) => {

          const stream =
            cloudinary.uploader
              .upload_stream(

                {
                  folder:
                    "tripnest/users/profile"
                },

                (
                  error,
                  result
                ) => {

                  if (error) {

                    reject(
                      error
                    );

                  } else {

                    resolve(
                      result
                    );
                  }
                }
              );


          stream.end(
            file.buffer
          );
        }
      );


    const updatedUser =
      await userRepository
        .updateById(

          userId,

          {
            profileImage: {

              url:
                uploadResult.secure_url,

              publicId:
                uploadResult.public_id

            }
          }
        );


    return this.sanitizeUser(
      updatedUser
    );
  }


    // FORGOT PASSWORD
    async forgotPassword(
    email
  ) {

    const user =
      await userRepository
        .findByEmail(
          email
        );


    /*
      Security rule:

      Don't reveal whether
      email exists or not.
    */

    if (!user) {

      return true;
    }


    const resetToken =
      crypto.randomBytes(
        32
      ).toString("hex");


    const resetTokenHash =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");


    const resetTokenExpires =
      new Date(
        Date.now() +
        15 * 60 * 1000
      );


    await userRepository
      .saveResetToken(

        user._id,

        resetTokenHash,

        resetTokenExpires

      );


    /*
      For now we log the token
      during development.

      Later Nodemailer will send it.
    */

    if (
      process.env.NODE_ENV !==
      "production"
    ) {

      console.log(
        "PASSWORD RESET TOKEN:",
        resetToken
      );
    }


    return true;
  }


    // RESET PASSWORD
    async resetPassword(
    token,
    newPassword
  ) {

    const resetTokenHash =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");


    const user =
      await userRepository
        .findByResetToken(
          resetTokenHash
        );


    if (!user) {

      throw new AppError(
        "Invalid or expired password reset token",

        httpStatus.StatusCodes
          .BAD_REQUEST
      );
    }


    const passwordHash =
      await bcrypt.hash(
        newPassword,
        12
      );


    await userRepository
      .updatePassword(
        user._id,
        passwordHash
      );


    await userRepository
      .clearResetToken(
        user._id
      );


    // Invalidate all sessions
    // after password reset

    await refreshTokenRepository
      .deleteByUser(
        user._id
      );


    return true;
  }


    // SANITIZE USER
    sanitizeUser(
    user
  ) {

    return {

      id:
        user._id,

      name:
        user.name,

      email:
        user.email,

      phone:
        user.phone,

      role:
        user.role,

      status:
        user.status,

      profileImage:
        user.profileImage,

      emailVerified:
        user.emailVerified,

      createdAt:
        user.createdAt,

      updatedAt:
        user.updatedAt

    };
  }

}


module.exports =
  new UserService();