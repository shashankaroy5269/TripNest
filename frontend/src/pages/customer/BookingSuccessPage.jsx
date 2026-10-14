import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { bookingApi } from "../../api";
import InvoiceDownloadButton from "../../components/bookings/InvoiceDownloadButton";
import {
  CheckCircle2,
  Mail,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function BookingSuccessPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error("Confetti error:", e);
    }

    async function loadBooking() {
      try {
        setLoading(true);
        const res = await bookingApi.getById(bookingId);
        setBooking(res.data);
      } catch (err) {
        console.error("Load booking success error:", err);
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
        <p className="text-slate-500 font-medium">Generating your invoice & booking details...</p>
      </div>
    );
  }

  const finalAmount =
    booking?.priceSnapshot?.totalAmount ||
    booking?.pricing?.finalPrice ||
    booking?.pricing?.totalPrice ||
    0;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-100">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
              Payment Confirmed
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">
              Booking Confirmed!
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Booking Reference:{" "}
              <span className="font-mono font-bold text-slate-800">
                {booking?.bookingReference}
              </span>
            </p>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 text-left flex items-start gap-3.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-950">
                Confirmation Email Sent with PDF Invoice!
              </h4>
              <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
                A booking receipt and your official A4 travel voucher PDF have been sent to{" "}
                <span className="font-semibold">{booking?.primaryContact?.email}</span>.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase">
                  Service Booked
                </span>
                <span className="text-base font-bold text-slate-900">
                  {booking?.hotel?.name || booking?.package?.title || "TripNest Booking"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold block uppercase">
                  Total Paid
                </span>
                <span className="text-base font-bold text-emerald-600">
                  ₹{finalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
              <div>
                <span className="text-slate-400 block">Dates / Schedule:</span>
                <span className="font-semibold text-slate-800">
                  {booking?.checkInDate
                    ? `${booking.checkInDate} to ${booking.checkOutDate}`
                    : booking?.travelDate || "Confirmed"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Primary Guest:</span>
                <span className="font-semibold text-slate-800">
                  {booking?.primaryContact?.name} ({booking?.guestCount} Guest)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="mb-2">
              <span className="text-xs text-slate-500 font-medium">
                Need a copy right away? Download your PDF invoice now:
              </span>
            </div>
            <InvoiceDownloadButton
              bookingId={booking?._id}
              bookingReference={booking?.bookingReference}
              variant="primary"
            />
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/my-bookings"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>View in My Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/hotels"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition"
            >
              Explore More Destinations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
