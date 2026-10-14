const Joi = require("joi");

const createHotelSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(150)
    .required(),

  description: Joi.string()
    .trim()
    .min(20)
    .max(3000)
    .required(),

  hotelType: Joi.string()
    .valid(
      "HOTEL",
      "RESORT",
      "VILLA",
      "HOMESTAY",
      "GUEST_HOUSE",
      "APARTMENT"
    )
    .required(),

  phone: Joi.string()
    .trim()
    .optional()
    .allow(""),

  email: Joi.string()
    .email()
    .trim()
    .optional()
    .allow(""),

  images: Joi.array()
    .items(Joi.any())
    .optional(),

  address: Joi.string()
    .trim()
    .max(300)
    .required(),

  city: Joi.string()
    .trim()
    .max(100)
    .required(),

  state: Joi.string()
    .trim()
    .max(100)
    .required(),

  country: Joi.string()
    .trim()
    .max(100)
    .default("India"),

  pincode: Joi.string()
    .trim()
    .optional()
    .allow(""),

  latitude: Joi.number()
    .min(-90)
    .max(90)
    .optional()
    .allow(null),

  longitude: Joi.number()
    .min(-180)
    .max(180)
    .optional()
    .allow(null),

  amenities: Joi.array()
    .items(
      Joi.string()
        .trim()
        .max(100)
    )
    .optional(),

  checkIn: Joi.string()
    .trim()
    .optional(),

  checkOut: Joi.string()
    .trim()
    .optional(),

  cancellation: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow(""),

  childrenAllowed: Joi.boolean()
    .optional(),

  petsAllowed: Joi.boolean()
    .optional()
});


const updateHotelSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(150)
    .optional(),

  description: Joi.string()
    .trim()
    .min(20)
    .max(3000)
    .optional(),

  hotelType: Joi.string()
    .valid(
      "HOTEL",
      "RESORT",
      "VILLA",
      "HOMESTAY",
      "GUEST_HOUSE",
      "APARTMENT"
    )
    .optional(),

  phone: Joi.string()
    .trim()
    .optional()
    .allow(""),

  email: Joi.string()
    .email()
    .trim()
    .optional()
    .allow(""),

  images: Joi.array()
    .items(Joi.any())
    .optional(),

  address: Joi.string()
    .trim()
    .max(300)
    .optional(),

  city: Joi.string()
    .trim()
    .max(100)
    .optional(),

  state: Joi.string()
    .trim()
    .max(100)
    .optional(),

  country: Joi.string()
    .trim()
    .max(100)
    .optional(),

  pincode: Joi.string()
    .trim()
    .pattern(/^[0-9]{6}$/)
    .optional(),

  latitude: Joi.number()
    .min(-90)
    .max(90)
    .optional(),

  longitude: Joi.number()
    .min(-180)
    .max(180)
    .optional(),

  amenities: Joi.array()
    .items(
      Joi.string()
        .trim()
        .max(100)
    )
    .optional(),

  checkIn: Joi.string()
    .trim()
    .optional(),

  checkOut: Joi.string()
    .trim()
    .optional(),

  cancellation: Joi.string()
    .trim()
    .max(1000)
    .optional(),

  childrenAllowed: Joi.boolean()
    .optional(),

  petsAllowed: Joi.boolean()
    .optional()
});


const rejectHotelSchema = Joi.object({
  reason: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .required()
});


module.exports = {
  createHotelSchema,
  updateHotelSchema,
  rejectHotelSchema
};