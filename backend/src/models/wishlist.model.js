const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    hotels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel"
      }
    ],
    packages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
