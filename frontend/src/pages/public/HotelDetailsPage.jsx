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
  Bed,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
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
  const [viewingRoomModal, setViewingRoomModal] = useState(null);
  const [activeRoomImgIndex, setActiveRoomImgIndex] = useState(0);

  const openRoomModal = (room) => {
    setViewingRoomModal(room);
    setActiveRoomImgIndex(0);
  };

  const getRoomThumb = (r) => {
    if (r?.images && r.images.length > 0) {
      const first = r.images[0];
      if (typeof first === "string" && first.trim()) return first;
      if (first?.url) return first.url;
    }
    return "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80";
  };

  const getRoomImages = (r) => {
    if (r?.images && r.images.length > 0) {
      const valid = r.images
        .map((img) => (typeof img === "string" ? img : img?.url))
        .filter((url) => typeof url === "string" && url.trim().length > 0);
      if (valid.length > 0) return valid;
    }
    return [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1000&auto=format&fit=crop&q=80",
    ];
  };

  const getRoomCapacity = (r) => {
    if (!r) return { adults: 2, children: 0, total: 2 };
    if (r.capacity) {
      const adults = Number(r.capacity.adults) || 2;
      const children = Number(r.capacity.children) || 0;
      return { adults, children, total: adults + children };
    }
    const max = Number(r.maxGuests) || 2;
    return { adults: max, children: 0, total: max };
  };

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
          maxGuests: getRoomCapacity(selectedRoom).total,
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
                  const capacity = getRoomCapacity(room);
                  const thumb = getRoomThumb(room);
                  const roomAmenities = room.amenities?.length
                    ? room.amenities
                    : ["King Bed", "Ensuite Bath", "Free WiFi", "Air Conditioning"];

                  return (
                    <div
                      key={room._id}
                      onClick={() => setSelectedRoomId(room._id)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col md:flex-row gap-4 sm:gap-5 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/20 shadow-md ring-1 ring-indigo-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {/* Left Room Thumbnail */}
                      <div
                        className="w-full md:w-48 h-36 sm:h-40 rounded-xl overflow-hidden shrink-0 relative bg-slate-100 group border border-slate-200/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRoomModal(room);
                        }}
                      >
                        <img
                          src={thumb}
                          alt={room.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition flex items-center justify-center">
                          <span className="opacity-90 group-hover:opacity-100 transition px-2.5 py-1 rounded-full bg-white/95 text-slate-800 text-[11px] font-bold shadow-md flex items-center gap-1 backdrop-blur-sm">
                            <Eye className="w-3.5 h-3.5 text-indigo-600" /> Room Photos
                          </span>
                        </div>
                      </div>

                      {/* Room Center Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {room.roomType || "STANDARD"}
                            </span>
                            <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                              <Bed className="w-3.5 h-3.5 text-slate-400" /> {room.beds || "1 King Bed"}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                              <Users className="w-3.5 h-3.5 text-slate-400" /> Max {capacity.total} Guests
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-base sm:text-lg mb-1 leading-snug">
                            {room.name}
                          </h4>

                          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                            {room.description || "Thoughtfully curated space with luxury bedding, modern amenities and city tranquility."}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {roomAmenities.slice(0, 3).map((a, i) => (
                              <span
                                key={i}
                                className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                              >
                                {a}
                              </span>
                            ))}
                            {roomAmenities.length > 3 && (
                              <span className="text-[11px] text-indigo-600 font-semibold px-1">
                                +{roomAmenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openRoomModal(room);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline-offset-2 hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Room Details & Inclusions
                          </button>
                        </div>
                      </div>

                      {/* Right Pricing & Select Action */}
                      <div className="md:w-44 shrink-0 flex md:flex-col justify-between items-end md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                        <div className="text-left md:text-right">
                          {room.discountPercentage > 0 && room.basePrice > price && (
                            <div className="flex items-center gap-1 md:justify-end">
                              <span className="text-xs text-slate-400 line-through">
                                ₹{room.basePrice.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                                {room.discountPercentage}% OFF
                              </span>
                            </div>
                          )}
                          <div className="flex items-baseline md:justify-end gap-1">
                            <span className="text-lg sm:text-xl font-black text-slate-900">
                              ₹{price.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-400">/ night</span>
                          </div>
                          <span className="text-[10px] text-slate-400 hidden md:block">
                            + taxes & fees
                          </span>
                        </div>

                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRoomId(room._id);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-indigo-600/20"
                                : "bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200"
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Selected</span>
                              </>
                            ) : (
                              <span>Select Room</span>
                            )}
                          </button>
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

              {/* Selected Room Preview */}
              {selectedRoom && (
                <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100/90 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      Selected Room
                    </span>
                    <button
                      type="button"
                      onClick={() => openRoomModal(selectedRoom)}
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-900 underline font-semibold normal-case"
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={getRoomThumb(selectedRoom)}
                      alt={selectedRoom.name}
                      onClick={() => openRoomModal(selectedRoom)}
                      className="w-16 h-14 object-cover rounded-xl border border-indigo-200/80 cursor-pointer shrink-0 hover:opacity-90 transition shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {selectedRoom.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                        <Bed className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span>{selectedRoom.beds || "1 King Bed"}</span>
                        <span>•</span>
                        <span>Max {getRoomCapacity(selectedRoom).total} Guests</span>
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-indigo-600 border border-indigo-200">
                        {selectedRoom.roomType || "STANDARD"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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

      {/* ROOM DETAILS MODAL */}
      {viewingRoomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setViewingRoomModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {viewingRoomModal.roomType || "ROOM"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {hotel.name}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  {viewingRoomModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingRoomModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Photo Gallery / Carousel */}
              {(() => {
                const roomPhotos = getRoomImages(viewingRoomModal);
                const currentImg = roomPhotos[activeRoomImgIndex] || roomPhotos[0];
                return (
                  <div className="space-y-2">
                    <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 group border border-slate-200/60 shadow-inner">
                      <img
                        src={currentImg}
                        alt={`${viewingRoomModal.name} photo ${activeRoomImgIndex + 1}`}
                        className="w-full h-full object-cover transition duration-300"
                      />
                      {roomPhotos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveRoomImgIndex(
                                (prev) => (prev - 1 + roomPhotos.length) % roomPhotos.length
                              )
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveRoomImgIndex((prev) => (prev + 1) % roomPhotos.length)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-semibold backdrop-blur-sm">
                            {activeRoomImgIndex + 1} / {roomPhotos.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Selector Strip */}
                    {roomPhotos.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {roomPhotos.map((thumbUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveRoomImgIndex(idx)}
                            className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                              activeRoomImgIndex === idx
                                ? "border-indigo-600 ring-2 ring-indigo-400/30"
                                : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={thumbUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Room Specifications Quick Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <Bed className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bedding</span>
                  <span className="text-xs font-bold text-slate-800">{viewingRoomModal.beds || "1 King Bed"}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <Users className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Capacity</span>
                  <span className="text-xs font-bold text-slate-800">
                    {getRoomCapacity(viewingRoomModal).total} Guests ({getRoomCapacity(viewingRoomModal).adults} Adults)
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <Layers className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                  <span className="text-xs font-bold text-slate-800">{viewingRoomModal.roomType || "Standard"}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <Sparkles className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Room Service</span>
                  <span className="text-xs font-bold text-slate-800">24/7 Available</span>
                </div>
              </div>

              {/* Room Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Room Overview
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                  {viewingRoomModal.description ||
                    "Indulge in spacious elegance with thoughtfully designed interiors, plush linens, soundproof architecture, and premium bath amenities designed for the modern connoisseur."}
                </p>
              </div>

              {/* Full Amenities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  In-Room Amenities & Perks
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    viewingRoomModal.amenities?.length
                      ? viewingRoomModal.amenities
                      : ["King Size Bed", "Air Conditioning", "High-Speed Wi-Fi", "Ensuite Bathroom", "Smart LED TV", "Electric Kettle", "Hair Dryer", "Daily Housekeeping"]
                  ).map((am, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{am}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Sticky Footer CTA */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-4 rounded-b-3xl">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">
                    ₹{(viewingRoomModal.finalPrice || viewingRoomModal.pricePerNight || 3500).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">/ night</span>
                </div>
                {viewingRoomModal.discountPercentage > 0 && (
                  <span className="text-[10px] text-emerald-600 font-bold">
                    {viewingRoomModal.discountPercentage}% Special Discount Applied
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedRoomId === viewingRoomModal._id ? (
                  <button
                    type="button"
                    disabled
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    Selected for Booking
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoomId(viewingRoomModal._id);
                      setViewingRoomModal(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
                  >
                    Select This Room
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
