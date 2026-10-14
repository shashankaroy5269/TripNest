const Razorpay = require("razorpay");

const getKeyId = () =>
  String(process.env.RAZORPAY_KEY_ID || "").replace(/['"]/g, "").trim();

const getKeySecret = () =>
  String(process.env.RAZORPAY_KEY_SECRET || "").replace(/['"]/g, "").trim();

const razorpay = new Razorpay({
  key_id: getKeyId(),
  key_secret: getKeySecret()
});

module.exports = razorpay;