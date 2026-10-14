const ApiResponse =
  require("../utils/apiResponse");


const errorMiddleware =
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      err
    );


    if (err.name === "JsonWebTokenError") {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: "Invalid access token"
      });
    }

    if (err.name === "TokenExpiredError") {
      return ApiResponse.error(res, {
        statusCode: 401,
        message: "Access token has expired. Please sign in again."
      });
    }

    if (err.name === "CastError") {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: `Invalid ID format for resource: ${err.value}`
      });
    }

    const statusCode =
      err.statusCode ||
      500;

    return ApiResponse.error(
      res,
      {
        statusCode,
        message:
          err.isOperational
            ? err.message
            : (err.message && process.env.NODE_ENV !== "production" ? err.message : "Internal server error"),
        errors:
          err.errors || null
      }
    );
  };


module.exports =
  errorMiddleware;