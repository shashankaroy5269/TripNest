const crypto = require("crypto");

const generateBookingNumber = () => {

  const timestamp =
    Date.now().toString(36).toUpperCase();

  const random =
    crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

  return `TN-${timestamp}-${random}`;
};

module.exports =
  generateBookingNumber;