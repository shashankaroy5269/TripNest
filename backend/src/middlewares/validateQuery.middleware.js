const AppError =
  require("../utils/appError");


const validateQuery =
  (schema) => {

    return (
      req,
      res,
      next
    ) => {

      const {
        error,
        value
      } =
        schema.validate(
          req.query,
          {
            abortEarly: false,
            stripUnknown: true
          }
        );


      if (error) {

        const errors =
          error.details.map(
            (item) => ({

              field:
                item.path.join("."),

              message:
                item.message

            })
          );


        return next(
          new AppError(
            "Query validation failed",
            400,
            errors
          )
        );
      }


      req.query =
        value;


      next();
    };
  };


module.exports =
  validateQuery;