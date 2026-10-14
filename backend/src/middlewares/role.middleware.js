const httpStatus =
  require("http-status-codes");

const AppError =
  require("../utils/appError");


const authorize =
  (...allowedRoles) => {

    return (
      req,
      res,
      next
    ) => {

      if (!req.user) {

        return next(
          new AppError(
            "Authentication required",

            httpStatus.StatusCodes
              .UNAUTHORIZED
          )
        );
      }


      if (
        !allowedRoles.includes(
          req.user.role
        )
      ) {

        return next(
          new AppError(
            "You do not have permission to access this resource",

            httpStatus.StatusCodes
              .FORBIDDEN
          )
        );
      }


      next();
    };
  };


module.exports =
  authorize;