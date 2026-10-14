import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { hotelApi, reviewApi } from "../../api";
import { setBookingDraft } from "../../redux/slices/bookingSlice";
import RatingStars from "../../components/common/RatingStars";
import {
  MapPin,
  Users,
  Check,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Share2,
} from "lucide-react";

const DEFAULT_PHOTOS = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
];

const DEFAULT_AMENITIES = [
  "High-Speed Wi-Fi",
  "Swimming Pool",
  "Luxury Spa",
  "Air Conditioning",
  "Complimentary Breakfast",
  "Valet Parking",
];

export default function HotelDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkoutDate = new Date();
  checkoutDate.setDate(checkoutDate.getDate() + 3);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(checkoutDate.toISOString().split("T")[0]);
  const [guestsCount, setGuestsCount] = useState(2);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [roomsCount, setRoomsCount] = useState(1);

  useEffect(() => {
    async function loadHotel() {
      try {
        setLoading(true);
        const [hotelRes, roomsRes, reviewsRes] = await Promise.all([
          hotelApi.getById(id),
          hotelApi.getRoomsByHotel(id).catch(() => ({ data: [] })),
          reviewApi.getByEntity({ entityId: id, entityType: "HOTEL" }).catch(() => ({ data: [] })),
        ]);
        setHotel(hotelRes.data);
        setRooms(roomsRes.data || []);
        setReviews(reviewsRes.data || []);
        if (roomsRes.data && roomsRes.data.length > 0) {
          setSelectedRoomId(roomsRes.data[0]._id);
        }
      } catch (err) {
        console.error("Load hotel error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHotel();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-slate-500 font-medium">Loading hotel details...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Hotel not found</h2>
        <button
          onClick={() => navigate("/hotels")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm"
        >
          Back to Hotels
        </button>
      </div>
    );
  }

  const checkInD = new Date(checkIn);
  const checkOutD = new Date(checkOut);
  const nights = Math.max(
    1,
    Math.round((checkOutD - checkInD) / (1000 * 60 * 60 * 24))
  );

  const selectedRoom = rooms.find((r) => r._id === selectedRoomId) || rooms[0];
  const roomPricePerNight = selectedRoom?.finalPrice || selectedRoom?.pricePerNight || 3500;
  const subtotal = roomPricePerNight * nights * roomsCount;
  const estimatedTax = Math.round(subtotal * 0.12);
  const totalAmount = subtotal + estimatedTax;

  const handleProceedToBooking = () => {
    if (!isAuthenticated) {
      alert("Please sign in or create an account to book your stay.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    if (!selectedRoom) {
      alert("Please select a room type.");
      return;
    }

    dispatch(
      setBookingDraft({
        bookingType: "HOTEL",
        hotel: {
          _id: hotel._id,
          name: hotel.name,
          city: hotel.city,
          address: hotel.address,
          photos: hotel.photos,
        },
        room: {
          _id: selectedRoom._id,
          name: selectedRoom.name,
          roomType: selectedRoom.roomType,
          pricePerNight: selectedRoom.finalPrice || selectedRoom.pricePerNight,
          maxGuests: selectedRoom.maxGuests,
        },
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nights,
        roomsCount,
        guestCount: guestsCount,
        basePrice: subtotal,
        taxAmount: estimatedTax,
        discountAmount: 0,
        finalPrice: totalAmount,
        appliedCoupon: null,
      })
    );

    navigate("/checkout");
  };

  const photos = hotel.photos?.length ? hotel.photos : DEFAULT_PHOTOS;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                {hotel.hotelType || "HOTEL"}
              </span>
              <RatingStars
                rating={hotel.ratingsAverage || 4.5}
                count={hotel.ratingsQuantity || reviews.length}
                size="md"
              />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
              {hotel.name}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>
                {hotel.address}, {hotel.city}, {hotel.state}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert("Hotel link copied to clipboard!");
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 h-80 sm:h-96 rounded-3xl overflow-hidden shadow-sm">
          <div className="md:col-span-2 h-full">
            <img
              src={photos[0]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4 h-full">
            <img
              src={photos[1] || photos[0]}
              alt="Hotel view 2"
              className="w-full h-full object-cover"
            />
            <img
              src={photos[2] || photos[0]}
              alt="Hotel view 3"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                About this Property
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-6">
                {hotel.description}
              </p>

              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                Key Amenities & Services
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(hotel.amenities || DEFAULT_AMENITIES).map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Available Room Types
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Choose the perfect room configuration for your comfort.
              </p>

              <div className="space-y-4">
                {rooms.map((room) => {
                  const isSelected = selectedRoomId === room._id;
                  const price = room.finalPrice || room.pricePerNight || 3500;
                  return (
                    <div
                      key={room._id}
                      onClick={() => setSelectedRoomId(room._id)}
                      className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col sm:flex-row justify-between gap-4 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/30 shadow-md"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {room.roomType}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Max {room.maxGuests} Guests
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base mb-1">
                          {room.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                          {room.description || "Spacious room with modern decor and premium bath amenities."}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(room.amenities || ["King Bed", "City View", "Free WiFi"])
                            .slice(0, 3)
                            .map((a, i) => (
                              <span
                                key={i}
                                className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                              >
                                {a}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <div>
                          <span className="text-lg font-black text-slate-900">
                            ₹{price.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400"> / night</span>
                        </div>
                        <div className="mt-2">
                          <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            {isSelected ? "Selected" : "Select Room"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Guest Reviews & Ratings
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real feedback from verified guests who stayed at {hotel.name}
                  </p>
                </div>
                <RatingStars
                  rating={hotel.ratingsAverage || 4.5}
                  count={hotel.ratingsQuantity || reviews.length}
                  size="md"
                />
              </div>

              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No written reviews yet. Be the first guest to review after your stay!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="border-b border-slate-100 pb-4 last:border-none"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                            {rev.user?.name?.charAt(0) || "U"}
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            {rev.user?.name || "Verified Traveler"}
                          </span>
                        </div>
                        <RatingStars rating={rev.rating} />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{roomPricePerNight.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium"> / night</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Instant Confirmation
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Rooms
                    </label>
                    <select
                      value={roomsCount}
                      onChange={(e) => setRoomsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} Room{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Guests
                    </label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      {[1, 2, 3, 4, 6, 8].map((n) => (
                        <option key={n} value={n}>
                          {n} Guest{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>
                    ₹{roomPricePerNight.toLocaleString()} × {nights} nights × {roomsCount} room
                    {roomsCount > 1 ? "s" : ""}
                  </span>
                  <span className="font-semibold text-slate-800">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Hospitality Taxes (12%)</span>
                  <span className="font-semibold text-slate-800">
                    ₹{estimatedTax.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-indigo-600">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToBooking}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-600/30 transition transform active:scale-95 text-sm"
              >
                Proceed to Checkout
              </button>

              <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Free cancellation up to 7 days before check-in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
