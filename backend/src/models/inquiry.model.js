const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Contact phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: [true, "Inquiry details or travel plans required"],
      trim: true,
    },
    destination: {
      type: String,
      trim: true,
      default: "India Escapes",
    },
    guests: {
      type: Number,
      default: 2,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONTACTED", "RESOLVED", "CANCELLED"],
      default: "PENDING",
    },
    contactMethod: {
      type: String,
      enum: ["WHATSAPP", "PHONE", "EMAIL"],
      default: "WHATSAPP",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast sorting by date and status
inquirySchema.index({ createdAt: -1, status: 1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
