const AppError =
  require("../utils/appError");


const validate =
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
          req.body,
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
            "Validation failed",

            400,

            errors
          )
        );
      }


      req.body = value;

      next();
    };
  };


module.exports =
  validate;