"use client";

import React, { useState, useEffect } from "react";
import { hotelApi, availabilityApi } from "../../lib/api";
import { useToast } from "../Toast";
import {
  Hotel,
  Bed,
  Plus,
  Trash2,
  Loader2,
  Users,
  CheckCircle2,
  XCircle,
  X,
  Layers,
  Calendar,
  Tag,
  Percent,
  Check,
  Image as ImageIcon,
  Calculator,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";

export default function RoomsTab({ hotels = [], initialHotelId = null }) {
  const { showToast } = useToast();
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState(null);

  // 7.2 Date-Based Availability Inspector State
  const [inspectRoomId, setInspectRoomId] = useState("");
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const threeDaysLater = new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0];
  const [inspectCheckIn, setInspectCheckIn] = useState(tomorrow);
  const [inspectCheckOut, setInspectCheckOut] = useState(threeDaysLater);
  const [inspectRequestedRooms, setInspectRequestedRooms] = useState(1);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // 7.1 Room Creation Form State
  const initialRoomState = {
    name: "",
    roomType: "DELUXE",
    description: "Spacious, elegantly furnished room featuring premium bedding, climate control, and scenic views.",
    adults: 2,
    children: 1,
    beds: "1 King Bed",
    basePrice: 5000,
    discountPercentage: 10,
    totalRooms: 10,
    amenities: ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Mini Bar", "Balcony View"],
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80",
    ],
  };

  const [newRoom, setNewRoom] = useState(initialRoomState);
  const [customAmenity, setCustomAmenity] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");

  const popularRoomAmenities = [
    "Free Wi-Fi",
    "Air Conditioning",
    "Flat-screen TV",
    "Mini Bar",
    "Balcony View",
    "Work Desk",
    "Jacuzzi",
    "Coffee Maker",
    "In-room Safe",
    "Complimentary Breakfast",
  ];

  // Set default selected hotel
  useEffect(() => {
    if (hotels && hotels.length > 0) {
      if (initialHotelId) {
        const found = hotels.find((h) => h._id === initialHotelId);
        if (found) {
          setSelectedHotel(found);
          return;
        }
      }
      if (!selectedHotel) {
        setSelectedHotel(hotels[0]);
      }
    }
  }, [hotels, initialHotelId]);

  // Load rooms when selected hotel changes
  useEffect(() => {
    if (selectedHotel?._id) {
      loadRooms(selectedHotel._id);
    }
  }, [selectedHotel]);

  // Automatically select first room for inspection
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      if (!inspectRoomId || !rooms.find((r) => r._id === inspectRoomId)) {
        setInspectRoomId(rooms[0]._id);
      }
    } else {
      setInspectRoomId("");
      setAvailabilityResult(null);
    }
  }, [rooms]);

  const loadRooms = async (hotelId) => {
    try {
      setLoading(true);
      const res = await hotelApi.getRoomsByHotel(hotelId);
      const roomList = res.data || res || [];
      setRooms(roomList);
    } catch (err) {
      console.error("Load rooms error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 7.1 Create Room Handler
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!selectedHotel) return;
    setIsSubmitting(true);
    try {
      const bPrice = Number(newRoom.basePrice);
      const disc = Number(newRoom.discountPercentage);
      const fPrice = Math.round(bPrice - (bPrice * disc) / 100);

      const payload = {
        hotelId: selectedHotel._id,
        name: newRoom.name.trim(),
        roomType: newRoom.roomType,
        description: newRoom.description.trim(),
        adults: Number(newRoom.adults),
        children: Number(newRoom.children || 0),
        capacity: {
          adults: Number(newRoom.adults),
          children: Number(newRoom.children || 0),
        },
        beds: newRoom.beds.trim() || "1 King Bed",
        basePrice: bPrice,
        discountPercentage: disc,
        finalPrice: fPrice,
        pricePerNight: fPrice,
        totalRooms: Number(newRoom.totalRooms),
        amenities: newRoom.amenities,
        images: newRoom.images.filter((img) => img.trim().length > 0),
      };

      await hotelApi.createRoom(payload);
      showToast(`Room "${newRoom.name}" successfully added to ${selectedHotel.name}!`, "success");
      setIsAddRoomOpen(false);
      setNewRoom(initialRoomState);
      loadRooms(selectedHotel._id);
    } catch (err) {
      showToast("Failed to create room: " + (err?.response?.data?.message || err?.message || err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7.2 Run Date-Based Availability Check
  const handleCheckAvailability = async (e) => {
    if (e) e.preventDefault();
    if (!inspectRoomId) {
      showToast("Please select a room to check availability.", "warning");
      return;
    }

    if (new Date(inspectCheckIn) >= new Date(inspectCheckOut)) {
      showToast("Check-out date must be after Check-in date.", "error");
      return;
    }

    try {
      setIsCheckingAvailability(true);
      const res = await availabilityApi.check({
        roomId: inspectRoomId,
        checkIn: inspectCheckIn,
        checkOut: inspectCheckOut,
        rooms: inspectRequestedRooms,
      });

      const data = res.data?.data || res.data || res;
      setAvailabilityResult(data);
    } catch (err) {
      showToast("Availability check failed: " + (err?.response?.data?.message || err?.message || err), "error");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Are you sure you want to delete this room type? Existing bookings for this room will remain.")) return;
    setDeletingRoomId(roomId);
    try {
      await hotelApi.deleteRoom(roomId);
      showToast("Room listing deleted successfully.", "info");
      loadRooms(selectedHotel._id);
      if (inspectRoomId === roomId) {
        setAvailabilityResult(null);
      }
    } catch (err) {
      showToast("Failed to delete room: " + (err?.response?.data?.message || err?.message || err), "error");
    } finally {
      setDeletingRoomId(null);
    }
  };

  const toggleRoomAmenity = (item) => {
    if (newRoom.amenities.includes(item)) {
      setNewRoom({
        ...newRoom,
        amenities: newRoom.amenities.filter((a) => a !== item),
      });
    } else {
      setNewRoom({
        ...newRoom,
        amenities: [...newRoom.amenities, item],
      });
    }
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !newRoom.amenities.includes(trimmed)) {
      setNewRoom({
        ...newRoom,
        amenities: [...newRoom.amenities, trimmed],
      });
      setCustomAmenity("");
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (trimmed && !newRoom.images.includes(trimmed)) {
      setNewRoom({
        ...newRoom,
        images: [...newRoom.images, trimmed],
      });
      setCustomImageUrl("");
    }
  };

  const handleRemoveImage = (index) => {
    setNewRoom({
      ...newRoom,
      images: newRoom.images.filter((_, i) => i !== index),
    });
  };

  const activeInspectRoom = rooms.find((r) => r._id === inspectRoomId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Room &amp; Inventory Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure room types, tariffs, and inspect real-time booking availability
          </p>
        </div>

        {selectedHotel && (
          <button
            onClick={() => setIsAddRoomOpen(true)}
            className="px-4 py-2 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl text-xs font-bold shadow-md shadow-[#5B30D9]/25 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room Type</span>
          </button>
        )}
      </div>

      {hotels && hotels.length > 0 ? (
        <div className="space-y-6">
          {/* Active Managed Property Switcher Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/80 text-[#5B30D9] flex items-center justify-center shrink-0">
                <Hotel className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Active Managed Property
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {selectedHotel?.name}
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  ({selectedHotel?.location?.city || selectedHotel?.city}, {selectedHotel?.hotelType || "HOTEL"})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold hidden md:inline">
                Switch Property:
              </span>
              <select
                value={selectedHotel?._id || ""}
                onChange={(e) => {
                  const found = hotels.find((h) => h._id === e.target.value);
                  if (found) {
                    setSelectedHotel(found);
                    setAvailabilityResult(null);
                  }
                }}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#5B30D9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
              >
                {hotels.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name} — {h.location?.city || h.city} ({h.status || "PENDING"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 7.2 DATE-BASED AVAILABILITY INSPECTOR (Interactive Panel) */}
          {/* ========================================================= */}
          {rooms.length > 0 && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-50 text-[#5B30D9] border border-purple-200/80">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>Date-Based Availability Inspector</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Verify booking dates and inspect remaining available room inventory in real-time
                    </p>
                  </div>
                </div>
              </div>

              {/* Inspector Controls */}
              <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Room Type</label>
                  <select
                    value={inspectRoomId}
                    onChange={(e) => {
                      setInspectRoomId(e.target.value);
                      setAvailabilityResult(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#5B30D9] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  >
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.roomType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={inspectCheckIn}
                    onChange={(e) => {
                      setInspectCheckIn(e.target.value);
                      setAvailabilityResult(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-out Date</label>
                  <input
                    type="date"
                    required
                    value={inspectCheckOut}
                    onChange={(e) => {
                      setInspectCheckOut(e.target.value);
                      setAvailabilityResult(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rooms Requested</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={inspectRequestedRooms}
                    onChange={(e) => {
                      setInspectRequestedRooms(Number(e.target.value));
                      setAvailabilityResult(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isCheckingAvailability}
                    className="w-full py-2 px-3 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl font-bold shadow-md shadow-[#5B30D9]/25 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isCheckingAvailability ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Inspect Availability</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Inspector Result Card */}
              {availabilityResult && (
                <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 border border-purple-200/80 animate-fadeIn space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                          availabilityResult.available
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                            : "bg-rose-100 text-rose-700 border border-rose-300"
                        }`}
                      >
                        {availabilityResult.available ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            availabilityResult.available
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {availabilityResult.available ? "AVAILABLE FOR BOOKING" : "SOLD OUT / INSUFFICIENT"}
                        </span>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">
                          {activeInspectRoom?.name} • {inspectCheckIn} to {inspectCheckOut}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Rate / Night</span>
                      <span className="text-base font-black text-[#5B30D9]">
                        ₹
                        {(
                          availabilityResult.price?.finalPricePerRoom ||
                          activeInspectRoom?.finalPrice ||
                          activeInspectRoom?.basePrice ||
                          0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 7.2 Conceptual Calculation Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-purple-200/60 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Total Room Inventory
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {availabilityResult.totalRooms ?? activeInspectRoom?.totalRooms ?? 0}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-[10px] text-amber-600 uppercase font-bold block">
                        Booked Rooms
                      </span>
                      <span className="text-lg font-black text-amber-600">
                        {availabilityResult.bookedRooms ?? 0}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-[10px] text-emerald-600 uppercase font-bold block">
                        Available Rooms
                      </span>
                      <span className="text-lg font-black text-emerald-600">
                        {availabilityResult.availableRooms ?? 0}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                      <span className="text-[10px] text-[#5B30D9] uppercase font-bold block">
                        Requested Quantity
                      </span>
                      <span className="text-lg font-black text-[#5B30D9]">
                        {inspectRequestedRooms}
                      </span>
                    </div>
                  </div>

                  {/* Availability Status Callout */}
                  <div className="p-3 bg-white rounded-xl border border-purple-200/80 text-xs text-slate-700 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#5B30D9] shrink-0" />
                      <span>
                        {availabilityResult.availableRooms >= inspectRequestedRooms
                          ? `✓ Inventory Confirmed: ${availabilityResult.availableRooms} room(s) available for selected dates.`
                          : `✗ Insufficient Rooms: Only ${availabilityResult.availableRooms} room(s) available (requested ${inspectRequestedRooms}).`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 7.1 ROOM TYPES LISTING GRID */}
          {/* ========================================================= */}
          {selectedHotel && (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-[#5B30D9]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Configured Room Types ({rooms.length}) for {selectedHotel.name}
                  </h3>
                </div>

                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                  {selectedHotel.status || "APPROVED"}
                </span>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#5B30D9]" />
                  <span className="text-xs">Loading rooms from database...</span>
                </div>
              ) : rooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room) => {
                    const thumb =
                      (Array.isArray(room.images) && room.images[0]?.url) ||
                      (typeof room.images?.[0] === "string" ? room.images[0] : null) ||
                      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&auto=format&fit=crop&q=80";

                    return (
                      <div
                        key={room._id}
                        className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden relative flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition group shadow-xs"
                      >
                        {/* Room Image Banner (Compact h-32) */}
                        <div className="h-32 w-full bg-slate-100 relative overflow-hidden">
                          <img
                            src={thumb}
                            alt={room.name}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 bg-white/95 backdrop-blur-sm text-[#5B30D9] rounded-lg border border-purple-200 shadow-xs">
                            {room.roomType}
                          </span>

                          <button
                            onClick={() => handleDeleteRoom(room._id)}
                            disabled={deletingRoomId === room._id}
                            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg bg-white/90 hover:bg-rose-50 border border-slate-200 transition disabled:opacity-50 shadow-xs"
                            title="Delete Room"
                          >
                            {deletingRoomId === room._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Room Info */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#5B30D9] transition">
                              {room.name}
                            </h4>

                            {room.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                {room.description}
                              </p>
                            )}

                            {/* Capacity & Beds */}
                            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 mt-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-[#5B30D9] shrink-0" />
                                <span>
                                  {room.capacity?.adults || room.adults || 2} Adults
                                  {room.capacity?.children ? `, ${room.capacity.children} Ch` : ""}
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Bed className="w-3.5 h-3.5 text-[#5B30D9] shrink-0" />
                                <span className="truncate">{room.beds || "1 King Bed"}</span>
                              </span>
                              <span className="col-span-2 text-[10px] text-slate-500 pt-0.5 border-t border-slate-200/60">
                                Inventory: <strong className="text-slate-800">{room.totalRooms || 5} Total Rooms</strong>
                              </span>
                            </div>

                            {/* Amenities Chips */}
                            {room.amenities && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(Array.isArray(room.amenities)
                                  ? room.amenities
                                  : String(room.amenities).split(",")
                                )
                                  .slice(0, 3)
                                  .map((am, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-[#5B30D9] border border-purple-200/60 font-medium"
                                    >
                                      {typeof am === "string" ? am.trim() : ""}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>

                          {/* Price per night */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              {room.discountPercentage > 0 && (
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="line-through text-slate-400">
                                    ₹{room.basePrice?.toLocaleString()}
                                  </span>
                                  <span className="text-emerald-600 font-bold">
                                    {room.discountPercentage}% OFF
                                  </span>
                                </div>
                              )}
                              <span className="text-sm font-black text-[#5B30D9]">
                                ₹
                                {(
                                  room.finalPrice ||
                                  room.basePrice ||
                                  room.pricePerNight ||
                                  0
                                ).toLocaleString()}
                                <span className="text-[10px] font-normal text-slate-500"> / night</span>
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setInspectRoomId(room._id);
                                window.scrollTo({ top: 300, behavior: "smooth" });
                              }}
                              className="text-[11px] font-bold text-[#5B30D9] hover:text-[#4C24B8] py-1 px-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 transition"
                            >
                              Check Dates →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <Bed className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    No room inventory configured
                  </p>
                  <p className="text-xs text-slate-400 mb-4">
                    Add room options so travelers can reserve stays at this property.
                  </p>
                  <button
                    onClick={() => setIsAddRoomOpen(true)}
                    className="px-4 py-2 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#5B30D9]/25"
                  >
                    Add Room Type
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center text-slate-400 shadow-sm">
          <Hotel className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No properties registered</p>
          <p className="text-xs text-slate-400 mt-1">
            Create a hotel property in the Properties tab before adding room types.
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7.1 ADD ROOM TYPE MODAL */}
      {/* ========================================================= */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white text-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddRoomOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Bed className="w-5 h-5 text-[#5B30D9]" />
                Add Room Type &amp; Inventory
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Property: <span className="font-semibold text-slate-900">{selectedHotel?.name}</span>
            </p>

            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              {/* Room Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Room Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deluxe Ocean View Suite"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room Category *</label>
                  <select
                    value={newRoom.roomType}
                    onChange={(e) => setNewRoom({ ...newRoom, roomType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#5B30D9] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="DELUXE">DELUXE</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="EXECUTIVE">EXECUTIVE</option>
                    <option value="SUITE">SUITE</option>
                    <option value="FAMILY">FAMILY</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Room Description</label>
                <textarea
                  rows={2}
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  placeholder="Spacious room featuring floor-to-ceiling windows, king bed, and luxury rain shower."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>

              {/* Capacity & Beds */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Adults *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newRoom.adults}
                    onChange={(e) => setNewRoom({ ...newRoom, adults: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Children</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={newRoom.children}
                    onChange={(e) => setNewRoom({ ...newRoom, children: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bed Configuration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 King Bed"
                    value={newRoom.beds}
                    onChange={(e) => setNewRoom({ ...newRoom, beds: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing & Discount */}
              <div className="grid grid-cols-3 gap-3 bg-purple-50/50 p-3.5 rounded-2xl border border-purple-200/70">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Price / Night (₹) *</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={newRoom.basePrice}
                    onChange={(e) => setNewRoom({ ...newRoom, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={newRoom.discountPercentage}
                    onChange={(e) => setNewRoom({ ...newRoom, discountPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Final Price / Night</label>
                  <div className="px-3 py-2 bg-white border border-emerald-200 rounded-xl text-emerald-700 font-black text-sm">
                    ₹
                    {Math.round(
                      newRoom.basePrice - (newRoom.basePrice * (newRoom.discountPercentage || 0)) / 100
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Total Room Inventory */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Room Inventory Count *</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={newRoom.totalRooms}
                  onChange={(e) => setNewRoom({ ...newRoom, totalRooms: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Room Amenities</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {popularRoomAmenities.map((am) => {
                    const isSelected = newRoom.amenities.includes(am);
                    return (
                      <button
                        type="button"
                        key={am}
                        onClick={() => toggleRoomAmenity(am)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 ${
                          isSelected
                            ? "bg-[#5B30D9] text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {am}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom amenity..."
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B30D9] font-bold rounded-xl border border-purple-200"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Room Images */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Room Images ({newRoom.images.length})
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {newRoom.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-14 rounded-xl overflow-hidden shrink-0 group border border-slate-200">
                      <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute inset-0 bg-rose-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#5B30D9] font-bold rounded-xl border border-purple-200"
                  >
                    + Add Image
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-[#5B30D9]/25 transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Room Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
