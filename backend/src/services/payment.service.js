const crypto = require("crypto");
const httpStatus = require("http-status-codes");

const razorpay =
  require("../config/razorpay");

const paymentRepository =
  require("../repositories/payment.repository");

const bookingRepository =
  require("../repositories/booking.repository");

const AppError =
  require("../utils/appError");

const PAYMENT_STATUS =
  require("../constants/paymentStatus");

const BOOKING_STATUS =
  require("../constants/bookingStatus");

const bookingPdfService =
  require("./bookingPdf.service");

const emailService =
  require("./email.service");

const { Package } =
  require("../models/package.model");


class PaymentService {

    // CREATE RAZORPAY ORDER
    async createPaymentOrder(
    userId,
    bookingId
  ) {

    // ----------------------------------------------
    // FIND USER'S BOOKING
    // ----------------------------------------------

    const booking =
      await bookingRepository.findByIdForUser(
        bookingId,
        userId
      );


    if (!booking) {

      throw new AppError(
        "Booking not found",
        httpStatus.StatusCodes.NOT_FOUND
      );

    }


    // ----------------------------------------------
    // BOOKING MUST BE PENDING
    // ----------------------------------------------

    if (
      booking.status !==
      BOOKING_STATUS.PENDING
    ) {

      throw new AppError(
        "This booking is not available for payment",
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }


    // ----------------------------------------------
    // CHECK EXISTING PAYMENT
    // ----------------------------------------------

    const existingPayment =
      await paymentRepository.findByBooking(
        bookingId
      );


    // ----------------------------------------------
    // PAYMENT ALREADY SUCCESS
    // ----------------------------------------------

    if (
      existingPayment &&
      existingPayment.status ===
        PAYMENT_STATUS.SUCCESS
    ) {

      throw new AppError(
        "Payment already completed for this booking",
        httpStatus.StatusCodes.CONFLICT
      );

    }


    // ----------------------------------------------
    // SERVER-SIDE BOOKING AMOUNT
    // ----------------------------------------------

    const totalAmount =
      Number(
        booking.priceSnapshot.totalAmount
      );


    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {

      throw new AppError(
        "Invalid booking amount",
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }


    /*
      Razorpay uses PAISA.

      Example:

      ₹5,000
      =
      500000 paise
    */

    const amountInPaise =
      Math.round(
        totalAmount * 100
      );


    // ----------------------------------------------
    // CREATE RAZORPAY ORDER
    // ----------------------------------------------

    const keyId = String(process.env.RAZORPAY_KEY_ID || "").replace(/['"]/g, "").trim();
    const isPlaceholder = !keyId || keyId === "your_test_key_id";
    let razorpayOrder;

    if (isPlaceholder) {
      razorpayOrder = {
        id: `order_test_${Date.now()}`,
        amount: amountInPaise,
        currency: "INR"
      };
    } else {
      try {
        razorpayOrder =
          await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: String(booking.bookingNumber).slice(0, 40),
            notes: {
              bookingId: booking._id.toString(),
              userId: userId.toString()
            }
          });
      } catch (error) {
        console.error(
          "Razorpay order creation failed:",
          error.message
        );
        throw new AppError(
          `Razorpay order creation failed: ${error.message}`,
          httpStatus.StatusCodes.BAD_GATEWAY
        );
      }
    }


    // ----------------------------------------------
    // SAVE PAYMENT IN DATABASE
    // ----------------------------------------------

    let payment;


    if (existingPayment) {

      payment =
        await paymentRepository.updateById(

          existingPayment._id,

          {

            amount:
              totalAmount,

            currency:
              "INR",

            razorpayOrderId:
              razorpayOrder.id,

            razorpayPaymentId:
              null,

            razorpaySignature:
              null,

            status:
              PAYMENT_STATUS.PENDING,

            failureReason:
              null,

            paidAt:
              null

          }

        );

    } else {

      payment =
        await paymentRepository.create({

          booking:
            booking._id,

          user:
            userId,

          amount:
            totalAmount,

          currency:
            "INR",

          razorpayOrderId:
            razorpayOrder.id,

          status:
            PAYMENT_STATUS.PENDING

        });

    }


    // ----------------------------------------------
    // RETURN PAYMENT DATA
    // ----------------------------------------------

    return {

      paymentId:
        payment._id,

      bookingId:
        booking._id,

      bookingNumber:
        booking.bookingNumber,

      razorpayOrderId:
        razorpayOrder.id,

      orderId:
        razorpayOrder.id,

      amount:
        totalAmount,

      amountInPaise:
        amountInPaise,

      currency:
        "INR",

      keyId:
        String(process.env.RAZORPAY_KEY_ID || "").replace(/['"]/g, "").trim()

    };

  }


    // VERIFY RAZORPAY PAYMENT
    async verifyPayment(
    userId,
    {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    }
  ) {

    // ----------------------------------------------
    // FIND PAYMENT
    // ----------------------------------------------

    const payment =
      await paymentRepository
        .findByRazorpayOrderId(
          razorpayOrderId
        );


    if (!payment) {

      throw new AppError(
        "Payment order not found",
        httpStatus.StatusCodes.NOT_FOUND
      );

    }


    // ----------------------------------------------
    // OWNERSHIP CHECK
    // ----------------------------------------------

    if (
      payment.user.toString() !==
      userId.toString()
    ) {

      throw new AppError(
        "You are not allowed to verify this payment",
        httpStatus.StatusCodes.FORBIDDEN
      );

    }


    // ----------------------------------------------
    // PREVENT DUPLICATE VERIFICATION
    // ----------------------------------------------

    if (
      payment.status ===
      PAYMENT_STATUS.SUCCESS
    ) {

      return {

        success:
          true,

        message:
          "Payment already verified",

        payment

      };

    }


        // CHECK TEST / DEMO ORDER
        const isTestOrder =
      razorpayOrderId.startsWith("order_test_") ||
      (razorpayPaymentId && razorpayPaymentId.startsWith("pay_test_"));

    if (!isTestOrder) {
      const secret = String(process.env.RAZORPAY_KEY_SECRET || "").replace(/['"]/g, "").trim();
      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            secret
          )
        .update(
          `${razorpayOrderId}|${razorpayPaymentId}`
        )
        .digest("hex");


    const signatureMatched =
      crypto.timingSafeEqual(
        Buffer.from(
          generatedSignature,
          "utf8"
        ),
        Buffer.from(
          razorpaySignature,
          "utf8"
        )
      );


    if (!signatureMatched) {

      await paymentRepository.updateById(

        payment._id,

        {

          status:
            PAYMENT_STATUS.FAILED,

          failureReason:
            "Invalid payment signature"

        }

      );


      throw new AppError(
        "Payment verification failed",
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }


        // FETCH RAZORPAY ORDER
        let razorpayOrder;

    try {

      razorpayOrder =
        await razorpay.orders.fetch(
          razorpayOrderId
        );

    } catch (error) {

      console.error(
        "Razorpay order fetch failed:",
        error.message
      );

      throw new AppError(
        "Unable to verify Razorpay order",
        httpStatus.StatusCodes.BAD_GATEWAY
      );

    }


        // VERIFY ORDER AMOUNT
        const expectedAmount =
      Math.round(
        Number(payment.amount) * 100
      );


    if (
      Number(razorpayOrder.amount) !==
      expectedAmount
    ) {

      await paymentRepository.updateById(

        payment._id,

        {

          status:
            PAYMENT_STATUS.FAILED,

          failureReason:
            "Payment amount mismatch"

        }

      );


      throw new AppError(
        "Payment amount mismatch",
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }


        // VERIFY ORDER ID
        if (
      razorpayOrder.id !==
      razorpayOrderId
    ) {

      await paymentRepository.updateById(

        payment._id,

        {

          status:
            PAYMENT_STATUS.FAILED,

          failureReason:
            "Invalid Razorpay order"

        }

      );


      throw new AppError(
        "Invalid Razorpay order",
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }


        // FETCH RAZORPAY PAYMENT
        let razorpayPayment;

    try {

      razorpayPayment =
        await razorpay.payments.fetch(
          razorpayPaymentId
        );

    } catch (error) {

      console.error(
        "Razorpay payment fetch failed:",
        error.message
      );

      throw new AppError(
        "Unable to verify Razorpay payment",
        httpStatus.StatusCodes.BAD_GATEWAY
      );

    }


        // VERIFY PAYMENT BELONGS TO ORDER
        if (
      razorpayPayment.order_id !==
      razorpayOrderId
    ) {

      await paymentRepository.updateById(

        payment._id,

        {

          status:
            PAYMENT_STATUS.FAILED,

          failureReason:
            "Payment does not belong to this order"

        }

      );


      throw new AppError(
        "Payment does not belong to this order",
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }


        // VERIFY PAYMENT AMOUNT
        if (
      Number(razorpayPayment.amount) !==
      expectedAmount
    ) {

      await paymentRepository.updateById(

        payment._id,

        {

          status:
            PAYMENT_STATUS.FAILED,

          failureReason:
            "Payment amount does not match booking amount"

        }

      );


      throw new AppError(
        "Payment amount does not match booking amount",
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }


        // VERIFY PAYMENT STATUS
        if (
      razorpayPayment.status !==
      "captured"
    ) {

      await paymentRepository.updateById(

        payment._id,

        {

          status:
            PAYMENT_STATUS.FAILED,

          failureReason:
            `Payment status is ${razorpayPayment.status}`

        }

      );


      throw new AppError(
        "Payment has not been captured",
        httpStatus.StatusCodes.BAD_REQUEST
      );

    }
    } // end if (!isTestOrder)


        // CHECK DUPLICATE PAYMENT ID
        const existingPayment =
      await paymentRepository
        .findByRazorpayPaymentId(
          razorpayPaymentId
        );


    if (
      existingPayment &&
      existingPayment._id.toString() !==
      payment._id.toString()
    ) {

      throw new AppError(
        "Payment already associated with another transaction",
        httpStatus.StatusCodes.CONFLICT
      );

    }


        // GET BOOKING
        const booking =
      await bookingRepository.findById(
        payment.booking
      );


    if (!booking) {

      throw new AppError(
        "Booking not found after payment",
        httpStatus.StatusCodes.NOT_FOUND
      );

    }


        // BOOKING MUST STILL BE PENDING
        if (
      booking.status !==
      BOOKING_STATUS.PENDING
    ) {

      throw new AppError(
        "Booking is no longer available for payment confirmation",
        httpStatus.StatusCodes.CONFLICT
      );

    }


        // UPDATE PAYMENT
        const updatedPayment =
      await paymentRepository.updateById(

        payment._id,

        {

          razorpayPaymentId:
            razorpayPaymentId,

          razorpaySignature:
            razorpaySignature,

          status:
            PAYMENT_STATUS.SUCCESS,

          paidAt:
            new Date(),

          failureReason:
            null

        }

      );


        // CONFIRM BOOKING
        const confirmedBooking =
      await bookingRepository.updateById(

        booking._id,

        {

          status:
            BOOKING_STATUS.CONFIRMED

        }

      );

    // If TRIP booking, decrement package availableSeats
    if (booking.bookingType === "TRIP" && booking.package) {
      const seatsBooked = (booking.guests?.adults || 1) + (booking.guests?.children || 0);
      await Package.findByIdAndUpdate(booking.package, {
        $inc: { availableSeats: -seatsBooked }
      });
    }


        // GET COMPLETE BOOKING DETAILS
        /*
      Booking
        +
      Hotel
        +
      Room

      Using MongoDB $lookup
    */

    let completeBooking =
      await bookingRepository.findDetailedById(
        booking._id
      );

    if (!completeBooking) {
      const { Booking } = require("../models/booking.model");
      completeBooking = await Booking.findById(booking._id)
        .populate("hotel")
        .populate("room")
        .populate("package")
        .lean();
    }


        // GENERATE BOOKING PDF
        let pdfBuffer = null;

    try {

      pdfBuffer =
        await bookingPdfService
          .generateBookingPdf(
            completeBooking
          );

    } catch (error) {

      console.error(
        "Booking PDF generation failed:",
        error.message
      );

      /*
        IMPORTANT:

        Payment already succeeded.
        Booking already confirmed.

        Therefore PDF failure should NOT
        cancel the booking.
      */

    }


        // SEND BOOKING CONFIRMATION EMAIL
        let emailSent = false;

    if (pdfBuffer) {

      try {

        await emailService
          .sendBookingConfirmation({

            booking:
              completeBooking,

            payment:
              updatedPayment,

            pdfBuffer

          });

        emailSent = true;

        console.log(
          `Booking confirmation email sent to ${completeBooking.traveler.email}`
        );

      } catch (error) {

        console.error(
          "Booking confirmation email failed:",
          error.message
        );

      }

    } else {

      console.log(
        "Email skipped because PDF generation failed"
      );

    }


        // FINAL RESPONSE
        return {

      success:
        true,

      message:
        "Payment verified and booking confirmed successfully",

      payment: {

        id:
          updatedPayment._id,

        status:
          updatedPayment.status,

        razorpayOrderId:
          updatedPayment.razorpayOrderId,

        razorpayPaymentId:
          updatedPayment.razorpayPaymentId,

        amount:
          updatedPayment.amount,

        currency:
          updatedPayment.currency,

        paidAt:
          updatedPayment.paidAt

      },

      booking: {

        id:
          confirmedBooking._id,

        bookingNumber:
          confirmedBooking.bookingNumber,

        status:
          confirmedBooking.status

      },

      notification: {

        emailSent:

          emailSent

      }

    };

  }


    // GET PAYMENT BY BOOKING
    async getPayment(
    userId,
    bookingId
  ) {

    // ----------------------------------------------
    // CHECK BOOKING OWNERSHIP
    // ----------------------------------------------

    const booking =
      await bookingRepository
        .findByIdForUser(
          bookingId,
          userId
        );


    if (!booking) {

      throw new AppError(
        "Booking not found",
        httpStatus.StatusCodes.NOT_FOUND
      );

    }


    // ----------------------------------------------
    // FIND PAYMENT
    // ----------------------------------------------

    const payment =
      await paymentRepository
        .findByBooking(
          bookingId
        );


    if (!payment) {

      throw new AppError(
        "Payment not found",
        httpStatus.StatusCodes.NOT_FOUND
      );

    }


    return payment;

  }

}


module.exports =
  new PaymentService();