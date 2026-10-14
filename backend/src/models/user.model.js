const mongoose = require("mongoose");

const ROLES =
    require("../constants/roles");

const ACCOUNT_STATUS =
    require("../constants/status");

const userSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
      },

      phone: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
      },

      passwordHash: {
        type: String,
        required: true,
        select: false
      },

      passwordResetToken: {
        type: String,
        select: false
      },

      passwordResetExpires: {
        type: Date,
        select: false
      },

      role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.CUSTOMER
      },

      status: {
        type: String,
        enum: Object.values(ACCOUNT_STATUS),
        default: ACCOUNT_STATUS.ACTIVE
      },

      profileImage: {
        url: {
          type: String,
          default: null
        },

        publicId: {
          type: String,
          default: null
        }
      },

      emailVerified: {
        type: Boolean,
        default: false
      },

      emailVerificationToken: {
        type: String,
        select: false
      },

      emailVerificationExpires: {
        type: Date,
        select: false
      }
    },

    {
      timestamps: true
    }
  );


userSchema.index({
    role: 1
});

userSchema.index({
    status: 1
});

module.exports =
    mongoose.model(
        "User",
        userSchema
    );