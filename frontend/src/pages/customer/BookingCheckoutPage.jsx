import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { bookingApi, couponApi } from "../../api";
import { updateDraftPricing, setLastCreatedBooking } from "../../redux/slices/bookingSlice";
import {
  Hotel,
  Luggage,
  Users,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function BookingCheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { draft } = useSelector((state) => state.booking);

  if (!draft) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">No active booking draft found</h2>
        <p className="text-xs text-slate-500 mb-4">Please choose a hotel or holiday package first.</p>
        <button
          onClick={() => navigate("/hotels")}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Browse Hotels
        </button>
      </div>
    );
  }

  const [primaryContact, setPrimaryContact] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "9876543210",
  });
  const [specialRequests, setSpecialRequests] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(draft.appliedCoupon || null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const basePrice = draft.basePrice;
  const taxAmount = draft.taxAmount;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPrice = Math.max(0, basePrice + taxAmount - discountAmount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setCouponLoading(true);
      setCouponError(null);

      const res = await couponApi.validate(
        couponCode.trim().toUpperCase(),
        basePrice,
        draft.bookingType
      );

      const discount = res.data?.discountAmount || res.discountAmount || 0;
      const couponObj = {
        code: couponCode.trim().toUpperCase(),
        discountAmount: discount,
      };

      setAppliedCoupon(couponObj);
      dispatch(
        updateDraftPricing({
          appliedCoupon: couponObj,
          discountAmount: discount,
          finalPrice: Math.max(0, basePrice + taxAmount - discount),
        })
      );
    } catch (err) {
      setCouponError(typeof err === "string" ? err : err.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    dispatch(
      updateDraftPricing({
        appliedCoupon: null,
        discountAmount: 0,
        finalPrice: basePrice + taxAmount,
      })
    );
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const bookingPayload = {
        bookingType: draft.bookingType,
        hotel: draft.bookingType === "HOTEL" ? draft.hotel._id : undefined,
        room: draft.bookingType === "HOTEL" ? draft.room._id : undefined,
        package: draft.bookingType === "TRIP" ? draft.packageData._id : undefined,
        checkInDate: draft.checkInDate,
        checkOutDate: draft.checkOutDate,
        travelDate: draft.travelDate,
        numberOfRooms: draft.roomsCount || 1,
        guestCount: draft.guestCount || 1,
        primaryContact,
        specialRequests,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        couponDiscount: appliedCoupon ? appliedCoupon.discountAmount : 0,
        taxAmount: taxAmount,
        basePrice: basePrice,
        finalPrice: finalPrice,
      };

      const res = await bookingApi.create(bookingPayload);
      const createdBooking = res.data;
      dispatch(setLastCreatedBooking(createdBooking));

      navigate(`/payment/${createdBooking._id}`);
    } catch (err) {
      alert("Booking creation failed: " + (err || "Please check details and try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Review Booking & Traveler Details
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ensure guest details are accurate before continuing to payment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Primary Traveler / Guest Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryContact.name}
                    onChange={(e) =>
                      setPrimaryContact({ ...primaryContact, name: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email for Confirmation & Invoice PDF
                  </label>
                  <input
                    type="email"
                    required
                    value={primaryContact.email}
                    onChange={(e) =>
                      setPrimaryContact({ ...primaryContact, email: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={primaryContact.phone}
                    onChange={(e) =>
                      setPrimaryContact({ ...primaryContact, phone: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Special Requests (Optional)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Early check-in, dietary restrictions, non-smoking room, or airport transfer notes.
              </p>
              <textarea
                rows={3}
                placeholder="e.g. Vegetarian breakfast preferred, quiet high-floor room requested..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-500" />
                Have a Promo or Coupon Code?
              </h3>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-800 font-mono">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-emerald-700 ml-2">
                        Applied (-₹{appliedCoupon.discountAmount.toLocaleString()})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter WELCOME500, TRIPNEST10, etc."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {couponLoading ? "Checking..." : "Apply Code"}
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-xs text-rose-600 mt-2 font-medium">{couponError}</p>
              )}

              <div className="flex gap-2 mt-3">
                {["WELCOME500", "TRIPNEST10", "SUMMER2026"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCouponCode(code)}
                    className="text-[10px] font-mono bg-slate-100 hover:bg-indigo-50 text-slate-600 px-2 py-1 rounded border border-slate-200"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
                Booking Summary
              </h3>

              {draft.bookingType === "HOTEL" ? (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase mb-1">
                    <Hotel className="w-3.5 h-3.5" />
                    Hotel Stay
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {draft.hotel.name}
                  </h4>
                  <p className="text-xs text-slate-500">{draft.hotel.city}</p>
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div>
                      <span className="text-slate-400">Room:</span>{" "}
                      <span className="font-semibold text-slate-800">{draft.room.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Dates:</span>{" "}
                      <span className="font-semibold text-slate-800">
                        {draft.checkInDate} to {draft.checkOutDate} ({draft.nights} Nights)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Guests:</span>{" "}
                      <span className="font-semibold text-slate-800">
                        {draft.guestCount} Guests, {draft.roomsCount} Room(s)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase mb-1">
                    <Luggage className="w-3.5 h-3.5" />
                    Holiday Tour Package
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {draft.packageData.title}
                  </h4>
                  <p className="text-xs text-slate-500">{draft.packageData.destination}</p>
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div>
                      <span className="text-slate-400">Departure:</span>{" "}
                      <span className="font-semibold text-slate-800">{draft.travelDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Travelers:</span>{" "}
                      <span className="font-semibold text-slate-800">
                        {draft.travelersCount} Person(s)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Base Rate</span>
                  <span className="font-semibold text-slate-800">₹{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Taxes & Fees</span>
                  <span className="font-semibold text-slate-800">₹{taxAmount.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3 flex justify-between text-base font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-indigo-600">₹{finalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-600/30 transition transform active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Pay Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>SSL Encrypted & Safe Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
