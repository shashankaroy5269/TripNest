const mongoose = require("mongoose");

const PACKAGE_TYPES = Object.freeze({
  FAMILY: "family",
  HONEYMOON: "honeymoon",
  ADVENTURE: "adventure",
  BEACH: "beach",
  RELIGIOUS: "religious",
  WILDLIFE: "wildlife",
  LUXURY: "luxury",
  BUDGET: "budget"
});

const itineraryDaySchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    sightseeing: [
      {
        type: String,
        trim: true
      }
    ],
    meals: [
      {
        type: String,
        trim: true
      }
    ],
    hotelInfo: {
      type: String,
      default: ""
    },
    transportation: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    duration: {
      days: {
        type: Number,
        required: true,
        min: 1
      },
      nights: {
        type: Number,
        required: true,
        min: 0
      }
    },
    startingPrice: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 30
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
      default: 30
    },
    packageType: {
      type: String,
      lowercase: true,
      trim: true,
      default: PACKAGE_TYPES.FAMILY,
      index: true
    },
    images: [
      {
        url: {
          type: String,
          required: true
        },
        publicId: {
          type: String,
          default: null
        }
      }
    ],
    inclusions: [
      {
        type: String,
        trim: true
      }
    ],
    exclusions: [
      {
        type: String,
        trim: true
      }
    ],
    cancellationPolicy: {
      type: String,
      default: "100% refund up to 7 days before departure. 50% refund between 3 to 7 days. Non-refundable under 3 days."
    },
    departureDates: [
      {
        type: Date
      }
    ],
    itinerary: [itineraryDaySchema],
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

packageSchema.virtual("pricePerPerson").get(function () {
  return this.startingPrice;
});

packageSchema.virtual("durationDays").get(function () {
  return this.duration?.days;
});

packageSchema.virtual("durationNights").get(function () {
  return this.duration?.nights;
});

packageSchema.virtual("photos").get(function () {
  return this.images?.map((img) => (typeof img === "string" ? img : img.url)) || [];
});

packageSchema.virtual("ratingsAverage").get(function () {
  return this.rating || 4.8;
});

packageSchema.virtual("ratingsQuantity").get(function () {
  return this.totalReviews || 18;
});

packageSchema.index({ destination: 1, packageType: 1, startingPrice: 1 });

module.exports = {
  Package: mongoose.model("Package", packageSchema),
  PACKAGE_TYPES
};
