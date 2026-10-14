const asyncHandler =
  (controllerMethod) => {

    return (
      req,
      res,
      next
    ) => {

      Promise
        .resolve(
          controllerMethod(
            req,
            res,
            next
          )
        )
        .catch(next);
    };
  };

module.exports =
  asyncHandler;