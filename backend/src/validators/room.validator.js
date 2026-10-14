const Joi = require("joi");

const createRoomSchema = Joi.object({

  name: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .required(),

  roomType: Joi.string()
    .valid(
      "STANDARD",
      "DELUXE",
      "PREMIUM",
      "EXECUTIVE",
      "SUPER_DELUXE",
      "SUITE",
      "FAMILY"
    )
    .required(),

  description: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow(""),

  adults: Joi.number()
    .integer()
    .min(1)
    .required(),

  children: Joi.number()
    .integer()
    .min(0)
    .default(0),

  beds: Joi.string()
    .trim()
    .max(100)
    .required(),

  totalRooms: Joi.number()
    .integer()
    .min(1)
    .required(),

  basePrice: Joi.number()
    .min(0)
    .required(),

  discountPercentage: Joi.number()
    .min(0)
    .max(100)
    .default(0),

  amenities: Joi.array()
    .items(
      Joi.string().trim().max(100)
    )
    .optional(),

  images: Joi.array()
    .items(Joi.any())
    .optional()
});


const updateRoomSchema = Joi.object({

  name: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .optional(),

  roomType: Joi.string()
    .valid(
      "STANDARD",
      "DELUXE",
      "PREMIUM",
      "EXECUTIVE",
      "SUPER_DELUXE",
      "SUITE",
      "FAMILY"
    )
    .optional(),

  description: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow(""),

  adults: Joi.number()
    .integer()
    .min(1)
    .optional(),

  children: Joi.number()
    .integer()
    .min(0)
    .optional(),

  beds: Joi.string()
    .trim()
    .max(100)
    .optional(),

  totalRooms: Joi.number()
    .integer()
    .min(1)
    .optional(),

  basePrice: Joi.number()
    .min(0)
    .optional(),

  discountPercentage: Joi.number()
    .min(0)
    .max(100)
    .optional(),

  amenities: Joi.array()
    .items(
      Joi.string().trim().max(100)
    )
    .optional(),

  status: Joi.string()
    .valid(
      "ACTIVE",
      "INACTIVE"
    )
    .optional()

});


const bulkCreateRoomItemSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  roomType: Joi.string().valid(
    "STANDARD",
    "DELUXE",
    "PREMIUM",
    "EXECUTIVE",
    "SUPER_DELUXE",
    "SUITE",
    "FAMILY"
  ).required(),
  description: Joi.string().trim().max(2000).optional().allow(""),
  adults: Joi.number().integer().min(1).required(),
  children: Joi.number().integer().min(0).default(0),
  beds: Joi.string().trim().max(100).required(),
  totalRooms: Joi.number().integer().min(1).required(),
  basePrice: Joi.number().min(0).required(),
  discountPercentage: Joi.number().min(0).max(100).default(0),
  amenities: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim().max(100)),
    Joi.string().allow("")
  ).optional(),
  images: Joi.array().items(Joi.any()).optional(),
  originalRow: Joi.number().optional()
});

const bulkCreateRoomSchema = Joi.object({
  rooms: Joi.array().items(bulkCreateRoomItemSchema).min(1).required(),
  hotelId: Joi.string().optional()
});


module.exports = {
  createRoomSchema,
  updateRoomSchema,
  bulkCreateRoomSchema
};