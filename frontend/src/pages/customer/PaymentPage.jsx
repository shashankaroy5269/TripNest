import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookingApi } from "../../api";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Loader2,
  AlertCircle,
  Zap,
  Building,
  Wallet,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    // Preload Razorpay Checkout script in background
    loadRazorpayScript();

    async function loadBooking() {
      try {
        setLoading(true);
        const res = await bookingApi.getById(bookingId);
        setBooking(res.data);
      } catch (err) {
        console.error("Load booking for payment error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-slate-500 font-medium">Preparing secure payment gateway...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h3 className="text-lg font-bold text-slate-800">Booking not found</h3>
        <button
          onClick={() => navigate("/hotels")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  const finalAmount =
    booking.priceSnapshot?.totalAmount ||
    booking.pricing?.finalPrice ||
    booking.pricing?.totalPrice ||
    5000;

  const basePrice =
    booking.priceSnapshot?.subtotal ||
    (booking.priceSnapshot?.finalPricePerRoom && booking.priceSnapshot?.nights
      ? booking.priceSnapshot.finalPricePerRoom * booking.priceSnapshot.nights * (booking.roomsBooked || 1)
      : null) ||
    booking.pricing?.subtotal ||
    booking.pricing?.basePrice ||
    null;

  const taxAmount =
    booking.priceSnapshot?.taxAmount ??
    booking.pricing?.taxAmount ??
    0;

  const discountAmount =
    booking.couponDiscount ||
    booking.priceSnapshot?.couponDiscount ||
    booking.pricing?.couponDiscount ||
    0;

  const couponCode = booking.coupon;

  const handleOpenRazorpay = async () => {
    try {
      setProcessingPayment(true);
      setPaymentError(null);

      // 1. Ensure Razorpay checkout script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.");
      }

      // 2. Create Razorpay order on backend
      const orderRes = await bookingApi.createPaymentOrder(booking._id);
      const orderData = orderRes.data;

      const keyId =
        orderData.keyId ||
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        "rzp_test_TmqQIJwrjgmZa0";

      // 3. Configure dynamic Razorpay modal options
      const options = {
        key: keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || "INR",
        name: "TripNest",
        description: `Booking #${booking.bookingReference || booking.bookingNumber} (${booking.bookingType === "HOTEL" ? "Hotel Stay" : "Tour Package"})`,
        image: "https://cdn-icons-png.flaticon.com/512/201/201623.png",
        order_id: orderData.orderId,
        prefill: {
          name: booking.traveler?.name || "",
          email: booking.traveler?.email || "",
          contact: booking.traveler?.phone || "",
        },
        notes: {
          bookingId: String(booking._id),
          bookingNumber: String(booking.bookingNumber || booking.bookingReference),
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async function (response) {
          try {
            setProcessingPayment(true);
            setPaymentError(null);

            await bookingApi.verifyPayment({
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            navigate(`/booking-success/${booking._id}`);
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            setPaymentError(
              typeof verifyErr === "string"
                ? verifyErr
                : verifyErr.message || "Payment verification failed. Please try again."
            );
          } finally {
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on("payment.failed", function (response) {
        console.error("Payment transaction failed:", response.error);
        setPaymentError(
          response.error?.description ||
            response.error?.reason ||
            "Payment transaction was not completed. Please try again."
        );
        setProcessingPayment(false);
      });

      rzpInstance.open();
    } catch (err) {
      console.error("Razorpay initiation error:", err);
      setPaymentError(
        typeof err === "string" ? err : err.message || "Failed to initiate payment."
      );
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            Razorpay 256-Bit SSL Encrypted
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Complete Your Payment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reference: <span className="font-mono font-bold text-slate-700">{booking.bookingReference}</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
          {/* Price Header & Breakdown */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                  Total Amount Payable
                </span>
                <span className="text-3xl font-black text-slate-900">
                  ₹{finalAmount.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-indigo-600 block">
                  {booking.bookingType === "HOTEL" ? "Hotel Reservation" : "Holiday Package"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {booking.guestCount || 1} Guest(s)
                </span>
              </div>
            </div>

            {(basePrice !== null || taxAmount > 0 || discountAmount > 0) && (
              <div className="pt-3 border-t border-slate-200/80 text-xs text-slate-500 space-y-1.5">
                {basePrice !== null && (
                  <div className="flex justify-between">
                    <span>Base Rate:</span>
                    <span className="font-semibold text-slate-800">₹{basePrice.toLocaleString()}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Estimated Taxes & Fees (12%):</span>
                    <span className="font-semibold text-slate-800">+₹{taxAmount.toLocaleString()}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount {couponCode ? `(${couponCode})` : ""}:</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Traveler Details Summary */}
          <div className="bg-indigo-50/40 rounded-2xl p-4 border border-indigo-100/60">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
              Billing & Traveler Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Guest:</span>
                <span className="font-semibold text-slate-800">{booking.traveler?.name || "Customer"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Email:</span>
                <span className="font-semibold text-slate-800 truncate block">{booking.traveler?.email || "-"}</span>
              </div>
            </div>
          </div>

          {/* Supported Razorpay Payment Options Info */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Supported Payment Methods
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Official Razorpay Gateway
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white flex flex-col items-center text-center gap-1 text-slate-700 shadow-2xs">
                <Zap className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold">UPI / QR</span>
                <span className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white flex flex-col items-center text-center gap-1 text-slate-700 shadow-2xs">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold">Cards</span>
                <span className="text-[10px] text-slate-400">Credit & Debit Cards</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white flex flex-col items-center text-center gap-1 text-slate-700 shadow-2xs">
                <Building className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold">Net Banking</span>
                <span className="text-[10px] text-slate-400">50+ Indian Banks</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white flex flex-col items-center text-center gap-1 text-slate-700 shadow-2xs">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold">Wallets</span>
                <span className="text-[10px] text-slate-400">Paytm, Mobikwik, etc.</span>
              </div>
            </div>
          </div>

          {paymentError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* Pay with Razorpay Button */}
          <button
            onClick={handleOpenRazorpay}
            disabled={processingPayment}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {processingPayment ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Opening Razorpay Secure Gateway...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Pay ₹{finalAmount.toLocaleString()} with Razorpay</span>
                <Sparkles className="w-4 h-4 text-indigo-200" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>PCI-DSS compliant • 100% Secure Checkout powered by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
