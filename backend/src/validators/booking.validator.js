const Joi =
  require("joi");


const createHotelBookingSchema =
  Joi.object({

    roomId:
      Joi.string()
        .hex()
        .length(24)
        .required(),

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
        .required(),

    adults:
      Joi.number()
        .integer()
        .min(1)
        .required(),

    children:
      Joi.number()
        .integer()
        .min(0)
        .default(0),

    traveler: Joi.object({

      name:
        Joi.string()
          .trim()
          .min(2)
          .max(100)
          .required(),

      email:
        Joi.string()
          .email()
          .lowercase()
          .required(),

      phone:
        Joi.string()
          .pattern(/^[0-9]{10}$/)
          .required()

    }).required()

  });


module.exports = {
  createHotelBookingSchema
};