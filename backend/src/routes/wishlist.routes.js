const express = require("express");
const wishlistController = require("../controllers/wishlist.controller");
const authenticate = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", authenticate, asyncHandler(wishlistController.getWishlist));
router.post("/toggle", authenticate, asyncHandler(wishlistController.toggleWishlist));

module.exports = router;
