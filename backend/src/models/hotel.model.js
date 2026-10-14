const mongoose = require("mongoose");

const HOTEL_STATUS = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  BLOCKED: "BLOCKED"
});

const HOTEL_TYPES = Object.freeze({
  HOTEL: "HOTEL",
  RESORT: "RESORT",
  VILLA: "VILLA",
  HOMESTAY: "HOMESTAY",
  GUEST_HOUSE: "GUEST_HOUSE",
  APARTMENT: "APARTMENT"
});

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    },

    hotelType: {
      type: String,
      enum: Object.values(HOTEL_TYPES),
      default: HOTEL_TYPES.HOTEL,
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    contact: {
      phone: {
        type: String,
        trim: true,
        default: ""
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ""
      }
    },

    location: {
      address: {
        type: String,
        required: true,
        trim: true
      },

      city: {
        type: String,
        required: true,
        trim: true,
        index: true
      },

      state: {
        type: String,
        required: true,
        trim: true
      },

      country: {
        type: String,
        required: true,
        trim: true,
        default: "India"
      },

      pincode: {
        type: String,
        trim: true
      },

      coordinates: {
        latitude: {
          type: Number
        },

        longitude: {
          type: Number
        }
      }
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    },

    amenities: [
      {
        type: String,
        trim: true
      }
    ],

    policies: {
      checkIn: {
        type: String,
        default: "12:00 PM"
      },

      checkOut: {
        type: String,
        default: "11:00 AM"
      },

      cancellation: {
        type: String,
        default: ""
      },

      childrenAllowed: {
        type: Boolean,
        default: true
      },

      petsAllowed: {
        type: Boolean,
        default: false
      }
    },

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
      enum: Object.values(HOTEL_STATUS),
      default: HOTEL_STATUS.PENDING,
      index: true
    },

    rejectionReason: {
      type: String,
      default: null
    },

    approvedAt: {
      type: Date,
      default: null
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

hotelSchema.virtual("city").get(function () {
  return this.location?.city || "";
});

hotelSchema.virtual("state").get(function () {
  return this.location?.state || "";
});

hotelSchema.virtual("address").get(function () {
  return this.location?.address || "";
});

hotelSchema.virtual("ratingsAverage").get(function () {
  return this.rating || 4.5;
});

hotelSchema.virtual("ratingsQuantity").get(function () {
  return this.totalReviews || 12;
});

hotelSchema.virtual("photos").get(function () {
  return this.images?.map((img) => (typeof img === "string" ? img : img.url)) || [];
});

hotelSchema.index({
  "location.city": 1,
  status: 1
});

hotelSchema.index({
  owner: 1,
  status: 1
});

module.exports = {
  Hotel: mongoose.model("Hotel", hotelSchema),
  HOTEL_STATUS,
  HOTEL_TYPES
};