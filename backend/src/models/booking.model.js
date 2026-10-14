const mongoose = require("mongoose");

const BOOKING_TYPES = Object.freeze({
  HOTEL: "HOTEL",
  TRIP: "TRIP"
});

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    bookingType: {
      type: String,
      enum: [
        "HOTEL",
        "TRIP"
      ],
      default: "HOTEL"
    },

    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: function () {
        return this.bookingType === "HOTEL";
      },
      index: true
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: function () {
        return this.bookingType === "HOTEL";
      },
      index: true
    },

    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: function () {
        return this.bookingType === "TRIP";
      },
      index: true
    },

    departureDate: {
      type: Date,
      index: true
    },

    traveler: {
      name: {
        type: String,
        required: true,
        trim: true
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
      },

      phone: {
        type: String,
        required: true,
        trim: true
      }
    },

    checkIn: {
      type: Date,
      required: function () {
        return this.bookingType === "HOTEL";
      },
      index: true
    },

    checkOut: {
      type: Date,
      required: function () {
        return this.bookingType === "HOTEL";
      },
      index: true
    },

    roomsBooked: {
      type: Number,
      default: 1,
      min: 1
    },

    guests: {
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

    coupon: {
      type: String,
      default: null
    },

    couponDiscount: {
      type: Number,
      default: 0
    },

    refundAmount: {
      type: Number,
      default: 0
    },

    cancellationReason: {
      type: String,
      default: null
    },

    priceSnapshot: {
      basePrice: {
        type: Number,
        required: true
      },

      discountPercentage: {
        type: Number,
        default: 0
      },

      finalPricePerRoom: {
        type: Number,
        default: 0
      },

      nights: {
        type: Number,
        default: 1
      },

      subtotal: {
        type: Number,
        default: 0
      },

      taxAmount: {
        type: Number,
        default: 0
      },

      couponDiscount: {
        type: Number,
        default: 0
      },

      totalAmount: {
        type: Number,
        required: true
      }
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "COMPLETED",
        "REFUND_PENDING",
        "REFUNDED"
      ],
      default: "PENDING",
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

bookingSchema.virtual("bookingStatus").get(function () {
  return this.status;
});

bookingSchema.virtual("bookingReference").get(function () {
  return this.bookingNumber;
});

bookingSchema.virtual("pricing").get(function () {
  const total = this.priceSnapshot?.totalAmount || 0;
  const subtotal = this.priceSnapshot?.subtotal || (this.priceSnapshot?.finalPricePerRoom ? (this.priceSnapshot.finalPricePerRoom * (this.priceSnapshot.nights || 1) * (this.roomsBooked || 1)) : this.priceSnapshot?.basePrice) || total;
  const tax = this.priceSnapshot?.taxAmount || 0;
  const discount = this.couponDiscount || this.priceSnapshot?.couponDiscount || 0;
  return {
    finalPrice: total,
    totalPrice: total,
    totalAmount: total,
    subtotal: subtotal,
    taxAmount: tax,
    couponDiscount: discount,
    basePrice: this.priceSnapshot?.basePrice || total
  };
});

bookingSchema.virtual("primaryContact").get(function () {
  return this.traveler;
});

bookingSchema.virtual("guestCount").get(function () {
  return (this.guests?.adults || 0) + (this.guests?.children || 0);
});

bookingSchema.virtual("checkInDate").get(function () {
  return this.checkIn ? this.checkIn.toISOString().split("T")[0] : null;
});

bookingSchema.virtual("checkOutDate").get(function () {
  return this.checkOut ? this.checkOut.toISOString().split("T")[0] : null;
});

bookingSchema.virtual("travelDate").get(function () {
  return this.departureDate ? this.departureDate.toISOString().split("T")[0] : null;
});

bookingSchema.index({
  room: 1,
  status: 1,
  checkIn: 1,
  checkOut: 1
});

bookingSchema.index({
  user: 1,
  status: 1
});

module.exports = {
  Booking: mongoose.model(
    "Booking",
    bookingSchema
  ),
  BOOKING_TYPES
};