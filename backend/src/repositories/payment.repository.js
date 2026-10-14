const Payment = require("../models/payment.model");

class PaymentRepository {

  async create(data) {
    return Payment.create(data);
  }

  async findById(id) {
    return Payment.findById(id);
  }

  async findByBooking(bookingId) {
    return Payment.findOne({
      booking: bookingId
    });
  }

  async findByRazorpayOrderId(orderId) {
    return Payment.findOne({
      razorpayOrderId: orderId
    });
  }

  async findByRazorpayPaymentId(paymentId) {
    return Payment.findOne({
      razorpayPaymentId: paymentId
    });
  }

  async updateById(id, data) {
    return Payment.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true
      }
    );
  }
}

module.exports = new PaymentRepository();