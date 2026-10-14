const Wishlist = require("../models/wishlist.model");
const ApiResponse = require("../utils/apiResponse");

class WishlistController {
  getWishlist = async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user.userId })
      .populate("hotels", "name description location images rating startingPrice totalReviews")
      .populate("packages", "title destination duration startingPrice images rating totalReviews packageType");

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.userId, hotels: [], packages: [] });
    }

    return ApiResponse.success(res, {
      message: "Wishlist fetched successfully",
      data: wishlist
    });
  };

  toggleWishlist = async (req, res) => {
    const itemId = req.body.itemId || req.body.entityId;
    const rawType = (req.body.itemType || req.body.entityType || "HOTEL").toUpperCase();
    const itemType = (rawType === "TRIP" || rawType === "PACKAGE") ? "PACKAGE" : "HOTEL";

    if (!itemId) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: "Item ID or Entity ID is required"
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.userId, hotels: [], packages: [] });
    }

    let isAdded = false;
    if (itemType === "HOTEL") {
      const idx = wishlist.hotels.findIndex((id) => String(id) === String(itemId));
      if (idx > -1) {
        wishlist.hotels.splice(idx, 1);
        isAdded = false;
      } else {
        wishlist.hotels.push(itemId);
        isAdded = true;
      }
    } else {
      const idx = wishlist.packages.findIndex((id) => String(id) === String(itemId));
      if (idx > -1) {
        wishlist.packages.splice(idx, 1);
        isAdded = false;
      } else {
        wishlist.packages.push(itemId);
        isAdded = true;
      }
    }

    await wishlist.save();

    return ApiResponse.success(res, {
      message: isAdded ? "Added to wishlist" : "Removed from wishlist",
      data: { isAdded, wishlist }
    });
  };
}

module.exports = new WishlistController();
