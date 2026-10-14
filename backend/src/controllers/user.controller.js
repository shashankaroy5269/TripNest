const httpStatus =
  require("http-status-codes");


const userService =
  require(
    "../services/user.service"
  );


const ApiResponse =
  require(
    "../utils/apiResponse"
  );


class UserController {


    // GET MY PROFILE
    getProfile = async (
    req,
    res
  ) => {

    const user =
      await userService.getProfile(
        req.user.userId
      );


    return ApiResponse.success(
      res,
      {

        message:
          "Profile fetched successfully",

        data:
          user

      }
    );
  };


    // UPDATE PROFILE
    updateProfile = async (
    req,
    res
  ) => {

    const user =
      await userService.updateProfile(

        req.user.userId,

        req.body

      );


    return ApiResponse.success(
      res,
      {

        message:
          "Profile updated successfully",

        data:
          user

      }
    );
  };


    // CHANGE PASSWORD
    changePassword = async (
    req,
    res
  ) => {

    await userService.changePassword(

      req.user.userId,

      req.body.currentPassword,

      req.body.newPassword

    );


    return ApiResponse.success(
      res,
      {

        message:
          "Password changed successfully"

      }
    );
  };


    // PROFILE IMAGE
    uploadProfileImage = async (
    req,
    res
  ) => {

    const user =
      await userService
        .uploadProfileImage(

          req.user.userId,

          req.file

        );


    return ApiResponse.success(
      res,
      {

        message:
          "Profile image uploaded successfully",

        data:
          user

      }
    );
  };


    // FORGOT PASSWORD
    forgotPassword = async (
    req,
    res
  ) => {

    await userService
      .forgotPassword(
        req.body.email
      );


    return ApiResponse.success(
      res,
      {

        message:
          "If the email exists, a password reset link has been generated"

      }
    );
  };


    // RESET PASSWORD
    resetPassword = async (
    req,
    res
  ) => {

    await userService.resetPassword(

      req.body.token,

      req.body.newPassword

    );


    return ApiResponse.success(
      res,
      {

        message:
          "Password reset successful"

      }
    );
  };

}


module.exports =
  new UserController();