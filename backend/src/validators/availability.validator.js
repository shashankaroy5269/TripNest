const Joi =
  require("joi");


const availabilityQuerySchema =
  Joi.object({

    checkIn:
      Joi.date()
        .iso()
        .required(),

    checkOut:
      Joi.date()
        .iso()
        .required(),

    rooms:
      Joi.number()
        .integer()
        .min(1)
        .default(1)

  });


const bookingPriceSchema =
  Joi.object({

    checkIn:
      Joi.date()
        .iso()
        .required(),

    checkOut:
      Joi.date()
        .iso()
        .required(),

    rooms:
      Joi.number()
        .integer()
        .min(1)
        .required()

  });


module.exports = {

  availabilityQuerySchema,

  bookingPriceSchema

};