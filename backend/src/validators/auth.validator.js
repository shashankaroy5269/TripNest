const Joi =
  require("joi");


const registerSchema =
  Joi.object({

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
        .trim()
        .required(),

    phone:
      Joi.string()
        .pattern(/^[+]?[0-9\s-]{8,15}$/)
        .allow("", null)
        .optional(),

    password:
      Joi.string()
        .min(6)
        .max(100)
        .required()

  });


const loginSchema =
  Joi.object({

    email:
      Joi.string()
        .email()
        .required(),

    password:
      Joi.string()
        .required()

  });


module.exports = {

  registerSchema,

  loginSchema

};