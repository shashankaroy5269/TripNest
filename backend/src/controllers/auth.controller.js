const httpStatus =
  require("http-status-codes");


const authService =
  require(
    "../services/auth.service"
  );


const ApiResponse =
  require(
    "../utils/apiResponse"
  );


class AuthController {


  // ==================================================
  // REGISTER
  // ==================================================

  register = async (
    req,
    res
  ) => {

    const user =
      await authService.register(
        req.body
      );


    return ApiResponse.success(
      res,
      {

        statusCode:
          httpStatus.StatusCodes
            .CREATED,

        message:
          "Registration successful",

        data:
          user

      }
    );
  };

  // ==================================================
  // CHECK ADMIN SETUP STATUS
  // ==================================================

  checkAdminSetup = async (req, res) => {
    const result = await authService.checkAdminSetup();
    return ApiResponse.success(res, {
      message: "Admin setup status fetched",
      data: result
    });
  };

  // ==================================================
  // REGISTER ADMIN / SETUP
  // ==================================================

  registerAdmin = async (req, res) => {
    const result = await authService.registerAdmin(req.body);
    this.setRefreshTokenCookie(res, result.refreshToken);

    return ApiResponse.success(res, {
      statusCode: httpStatus.StatusCodes.CREATED,
      message: "Admin account created successfully",
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user
      }
    });
  };


  // ==================================================
  // VERIFY EMAIL
  // ==================================================

  verifyEmail = async (
    req,
    res
  ) => {

    const token = req.query.token || req.body.token;

    const result =
      await authService.verifyEmail(
        token
      );

    return ApiResponse.success(
      res,
      {
        message: result.message,
        data: result
      }
    );
  };


  // ==================================================
  // RESEND VERIFICATION
  // ==================================================

  resendVerification = async (
    req,
    res
  ) => {

    const { email } = req.body;

    const result =
      await authService.resendVerification(
        email
      );

    return ApiResponse.success(
      res,
      {
        message: result.message,
        data: result
      }
    );
  };


  // ==================================================
  // LOGIN
  // ==================================================

  login = async (
    req,
    res
  ) => {

    const {
      email,
      password
    } = req.body;


    const result =
      await authService.login(
        email,
        password
      );


    this.setRefreshTokenCookie(
      res,
      result.refreshToken
    );


    return ApiResponse.success(
      res,
      {

        message:
          "Login successful",

        data: {
          accessToken:
            result.accessToken,
          refreshToken:
            result.refreshToken,
          user:
            result.user
        }
      }
    );
  };


  // ==================================================
  // REFRESH TOKEN
  // ==================================================

  refreshToken = async (
    req,
    res
  ) => {

    const cookieName =
      process.env.COOKIE_NAME ||
      "tripnest_refresh_token";

    const refreshToken =
      req.cookies[cookieName] ||
      req.body?.refreshToken;

    const result =
      await authService
        .refreshAccessToken(
          refreshToken
        );


    this.setRefreshTokenCookie(
      res,
      result.refreshToken
    );


    return ApiResponse.success(
      res,
      {

        message:
          "Access token refreshed",

        data: {

          accessToken:
            result.accessToken,

          refreshToken:
            result.refreshToken,

          user:
            result.user

        }

      }
    );
  };


  // ==================================================
  // LOGOUT
  // ==================================================

  logout = async (
    req,
    res
  ) => {

    const cookieName =
      process.env.COOKIE_NAME ||
      "tripnest_refresh_token";


    const refreshToken =
      req.cookies[
        cookieName
      ];


    await authService.logout(
      refreshToken
    );


    this.clearRefreshTokenCookie(
      res
    );


    return ApiResponse.success(
      res,
      {

        message:
          "Logout successful"

      }
    );
  };


  // ==================================================
  // LOGOUT ALL
  // ==================================================

  logoutAll = async (
    req,
    res
  ) => {

    await authService.logoutAll(
      req.user.userId
    );


    this.clearRefreshTokenCookie(
      res
    );


    return ApiResponse.success(
      res,
      {

        message:
          "Logged out from all devices"

      }
    );
  };


  // ==================================================
  // SET COOKIE
  // ==================================================

  setRefreshTokenCookie(
    res,
    refreshToken
  ) {

    const cookieName =
      process.env.COOKIE_NAME ||
      "tripnest_refresh_token";


    res.cookie(

      cookieName,

      refreshToken,

      {

        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000,

        path: "/"

      }
    );
  }


  // ==================================================
  // CLEAR COOKIE
  // ==================================================

  clearRefreshTokenCookie(
    res
  ) {

    const cookieName =
      process.env.COOKIE_NAME ||
      "tripnest_refresh_token";


    res.clearCookie(

      cookieName,

      {

        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",

        path: "/"

      }
    );
  }

}


module.exports =
  new AuthController();