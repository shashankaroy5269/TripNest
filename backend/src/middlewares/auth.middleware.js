const httpStatus =
  require("http-status-codes");


const {
  verifyAccessToken
} =
  require("../utils/generateToken");


const authRepository =
  require(
    "../repositories/auth.repository"
  );


const AppError =
  require("../utils/appError");


const ACCOUNT_STATUS =
  require("../constants/status");


const authenticate =
  async (
    req,
    res,
    next
  ) => {

    try {

            // GET AUTHORIZATION HEADER
            const authHeader = req.headers.authorization;
      let token;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (req.query && req.query.token) {
        token = req.query.token;
      } else if (req.cookies && (req.cookies.tripnest_token || req.cookies.token)) {
        token = req.cookies.tripnest_token || req.cookies.token;
      }

      if (token === "undefined" || token === "null") {
        token = null;
      }

      if (!token || !token.trim()) {
        throw new AppError(
          "Access token required",
          httpStatus.StatusCodes.UNAUTHORIZED
        );
      }


            // VERIFY TOKEN
            const decoded =
        verifyAccessToken(
          token
        );


            // FIND USER
            const user =
        await authRepository.findById(
          decoded.userId
        );


      if (!user) {

        throw new AppError(
          "User not found",

          httpStatus.StatusCodes
            .UNAUTHORIZED
        );
      }


            // CHECK ACCOUNT STATUS
            if (
        user.status !==
        ACCOUNT_STATUS.ACTIVE
      ) {

        throw new AppError(
          "Your account is not active",

          httpStatus.StatusCodes
            .FORBIDDEN
        );
      }


            // ATTACH USER TO REQUEST
            req.user = {

        userId:
          user._id.toString(),

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        status:
          user.status

      };


      next();


    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        return next(
          new AppError(
            error.name === "TokenExpiredError"
              ? "Access token expired"
              : "Invalid access token",
            httpStatus.StatusCodes.UNAUTHORIZED
          )
        );
      }

      next(error);
    }
  };


module.exports =
  authenticate;