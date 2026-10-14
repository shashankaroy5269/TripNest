const mongoose = require("mongoose");

const ROOM_TYPES = Object.freeze({
  STANDARD: "STANDARD",
  DELUXE: "DELUXE",
  PREMIUM: "PREMIUM",
  EXECUTIVE: "EXECUTIVE",
  SUPER_DELUXE: "SUPER_DELUXE",
  SUITE: "SUITE",
  FAMILY: "FAMILY"
});

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    roomType: {
      type: String,
      enum: Object.values(ROOM_TYPES),
      required: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000
    },

    capacity: {
      adults: {
        type: Number,
        required: true,
        min: 1
      },

      children: {
        type: Number,
        default: 0,
        min: 0
      }
    },

    beds: {
      type: String,
      required: true,
      trim: true
    },

    totalRooms: {
      type: Number,
      required: true,
      min: 1
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    finalPrice: {
      type: Number,
      required: true,
      min: 0
    },

    amenities: [
      {
        type: String,
        trim: true
      }
    ],

    images: [
      {
        url: {
          type: String,
          required: true
        },

        publicId: {
          type: String,
          required: true
        }
      }
    ],

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "INACTIVE"
      ],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

roomSchema.virtual("maxGuests").get(function () {
  return (this.capacity?.adults || 2) + (this.capacity?.children || 0);
});

roomSchema.virtual("pricePerNight").get(function () {
  return this.finalPrice || this.basePrice || 3500;
});

roomSchema.virtual("totalInventory").get(function () {
  return this.totalRooms || 5;
});

roomSchema.index({
  hotel: 1,
  roomType: 1
});

roomSchema.index({
  hotel: 1,
  status: 1
});

module.exports = {
  Room: mongoose.model("Room", roomSchema),
  ROOM_TYPES
};