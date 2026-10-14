import React, { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { bookingApi } from "../../api";

export default function CancelBookingModal({ booking, isOpen, onClose, onSuccess }) {
  const [reason, setReason] = useState("Change of travel plans");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !booking) return null;

  const startDate = new Date(booking.checkInDate || booking.travelDate);
  const now = new Date();
  const diffDays = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));

  let refundPercent = 0;
  let policyNotice = "";

  if (diffDays > 7) {
    refundPercent = 100;
    policyNotice = "Full Refund (100%): Cancellation is more than 7 days prior to start date.";
  } else if (diffDays >= 3) {
    refundPercent = 50;
    policyNotice = "Partial Refund (50%): Cancellation is between 3 and 7 days prior to start date.";
  } else {
    refundPercent = 0;
    policyNotice = "No Refund (0%): Cancellation is within 3 days of travel / check-in date.";
  }

  const finalPaid = booking.pricing?.finalPrice || booking.pricing?.totalPrice || 0;
  const estimatedRefund = (finalPaid * refundPercent) / 100;

  const handleCancelBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const chosenReason = reason === "Other" ? customReason : reason;
      await bookingApi.cancel(booking._id, chosenReason);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err || "Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Cancel Booking ({booking.bookingReference})
            </h3>
            <p className="text-xs text-slate-500">
              Please review the cancellation policy and refund estimate.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            TripNest Automated Refund Policy
          </div>
          <p className="text-xs text-slate-700 mb-3">{policyNotice}</p>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200">
            <div className="p-2 rounded-lg bg-white border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Total Paid</span>
              <span className="text-sm font-bold text-slate-800">₹{finalPaid.toLocaleString()}</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Refund %</span>
              <span className={`text-sm font-bold ${refundPercent > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {refundPercent}%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-medium">Est. Refund</span>
              <span className="text-sm font-bold text-emerald-600">₹{estimatedRefund.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Reason for cancellation
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          >
            <option value="Change of travel plans">Change of travel plans</option>
            <option value="Booked by mistake">Booked by mistake</option>
            <option value="Found better pricing elsewhere">Found better pricing elsewhere</option>
            <option value="Emergency or unforeseen circumstances">Emergency or unforeseen circumstances</option>
            <option value="Other">Other reason...</option>
          </select>
        </div>

        {reason === "Other" && (
          <div className="mb-4">
            <textarea
              placeholder="Please describe your reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              rows={2}
            />
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            Keep Booking
          </button>
          <button
            onClick={handleCancelBooking}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}
