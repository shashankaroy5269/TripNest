const Joi =
  require("joi");


const updateProfileSchema =
  Joi.object({

    name:
      Joi.string()
        .trim()
        .min(2)
        .max(100)
        .optional(),

    phone:
      Joi.string()
        .pattern(
          /^[0-9]{10}$/
        )
        .optional()

  });


const changePasswordSchema =
  Joi.object({

    currentPassword:
      Joi.string()
        .required(),

    newPassword:
      Joi.string()
        .min(6)
        .max(100)
        .required(),

    confirmPassword:
      Joi.any()
        .valid(
          Joi.ref(
            "newPassword"
          )
        )
        .required()
        .messages({

          "any.only":
            "Passwords do not match"

        })

  });


const forgotPasswordSchema =
  Joi.object({

    email:
      Joi.string()
        .email()
        .required()

  });


const resetPasswordSchema =
  Joi.object({

    token:
      Joi.string()
        .required(),

    newPassword:
      Joi.string()
        .min(6)
        .max(100)
        .required(),

    confirmPassword:
      Joi.any()
        .valid(
          Joi.ref(
            "newPassword"
          )
        )
        .required()
        .messages({

          "any.only":
            "Passwords do not match"

        })

  });


module.exports = {

  updateProfileSchema,

  changePasswordSchema,

  forgotPasswordSchema,

  resetPasswordSchema

};