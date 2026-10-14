import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { bookingApi, wishlistApi, reviewApi } from "../../api";
import InvoiceDownloadButton from "../../components/bookings/InvoiceDownloadButton";
import CancelBookingModal from "../../components/bookings/CancelBookingModal";
import {
  Calendar,
  Heart,
  User,
  Star,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function CustomerDashboardPage() {
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("BOOKINGS");
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState({ hotels: [], packages: [] });
  const [loading, setLoading] = useState(true);

  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);

  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, wishlistRes] = await Promise.all([
        bookingApi.getMyBookings(),
        wishlistApi.get().catch(() => ({ data: { hotels: [], packages: [] } })),
      ]);
      setBookings(bookingsRes.data || []);
      setWishlist(wishlistRes.data || { hotels: [], packages: [] });
    } catch (err) {
      console.error("Load customer data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;
    try {
      setReviewSubmitting(true);
      const entityType = reviewBooking.bookingType === "HOTEL" ? "HOTEL" : "TRIP";
      const entityId =
        reviewBooking.hotel?._id || reviewBooking.package?._id || reviewBooking.room?._id;

      await reviewApi.create({
        bookingId: reviewBooking._id,
        entityType,
        entityId,
        rating: reviewRating,
        comment: reviewComment,
      });

      alert("Review submitted successfully! Thank you for your feedback.");
      setReviewBooking(null);
      setReviewComment("");
    } catch (err) {
      alert("Failed to submit review: " + (err || "Please try again"));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-indigo-200">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">
                  Welcome back, {user?.name}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                  {user?.role?.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab("BOOKINGS")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "BOOKINGS"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
            </button>
            <button
              onClick={() => setActiveTab("WISHLIST")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "WISHLIST"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Wishlist</span>
            </button>
            <button
              onClick={() => setActiveTab("PROFILE")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "PROFILE"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {activeTab === "BOOKINGS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Reservation History & Invoices
              </h2>
              <span className="text-xs text-slate-500">
                Total Bookings: {bookings.length}
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Fetching reservations...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  No reservations found
                </h3>
                <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                  You haven’t booked any hotels or holiday trips yet. Explore our premier destinations to get started.
                </p>
                <Link
                  to="/hotels"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition"
                >
                  Explore Stays & Packages
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bookings.map((b) => {
                  const isHotel = b.bookingType === "HOTEL";
                  const title = isHotel ? b.hotel?.name : b.package?.title;
                  const finalPaid =
                    b.pricing?.finalPrice || b.pricing?.totalPrice || 0;
                  const canCancel =
                    b.bookingStatus === "CONFIRMED" || b.bookingStatus === "PENDING";

                  return (
                    <div
                      key={b._id}
                      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase ${getStatusBadge(
                              b.bookingStatus
                            )}`}
                          >
                            {b.bookingStatus}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            Ref: {b.bookingReference}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900">
                          {title || "TripNest Booking"}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {b.checkInDate
                              ? `${b.checkInDate} → ${b.checkOutDate}`
                              : b.travelDate}
                          </span>
                          <span>•</span>
                          <span>{b.guestCount || 1} Guest(s)</span>
                          <span>•</span>
                          <span className="font-bold text-slate-800">
                            ₹{finalPaid.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                        <InvoiceDownloadButton
                          bookingId={b._id}
                          bookingReference={b.bookingReference}
                          variant="compact"
                        />

                        {b.bookingStatus === "CONFIRMED" && (
                          <button
                            onClick={() => setReviewBooking(b)}
                            className="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-semibold transition flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>Review</span>
                          </button>
                        )}

                        {canCancel && (
                          <button
                            onClick={() => setSelectedBookingForCancel(b)}
                            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "WISHLIST" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Saved Wishlist</h2>
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
              <Heart className="w-10 h-10 text-rose-500 fill-rose-100 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">
                Your saved items are synced with your account.
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Click the heart icon on any hotel or tour package to easily find it later.
              </p>
              <Link
                to="/hotels"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Browse Hotels
              </Link>
            </div>
          </div>
        )}

        {activeTab === "PROFILE" && (
          <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Account Details</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Name</span>
                <span className="font-semibold text-slate-800">{user?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-800">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Phone</span>
                <span className="font-semibold text-slate-800">{user?.phone || "Not set"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Account Role</span>
                <span className="font-bold text-indigo-600">{user?.role}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Email Verified Status</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          </div>
        )}

        <CancelBookingModal
          booking={selectedBookingForCancel}
          isOpen={!!selectedBookingForCancel}
          onClose={() => setSelectedBookingForCancel(null)}
          onSuccess={loadCustomerData}
        />

        {reviewBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Write a Review
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Share your experience for {reviewBooking.hotel?.name || reviewBooking.package?.title}
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            reviewRating >= star
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Review & Feedback
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the hospitality, cleanliness, amenities..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewBooking(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
