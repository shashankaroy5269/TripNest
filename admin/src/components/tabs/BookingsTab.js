"use client";

import React, { useState } from "react";
import { adminApi } from "../../lib/api";
import { useToast } from "../Toast";
import {
  CalendarCheck,
  Search,
  Filter,
  Hotel,
  Luggage,
  User,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Eye,
  Calendar,
  Phone,
  Mail,
  X,
} from "lucide-react";

export default function BookingsTab({
  bookings = [],
  onRefresh,
  searchQuery = "",
}) {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL"); // "ALL" | "TRIP" | "HOTEL"
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const filtered = (bookings || []).filter((b) => {
    const matchesStatus =
      statusFilter === "ALL" || b.status === statusFilter;

    const bType = b.bookingType || (b.package ? "TRIP" : "HOTEL");
    const matchesType = typeFilter === "ALL" || bType === typeFilter;

    const term = searchQuery.toLowerCase().trim();
    if (!term) return matchesStatus && matchesType;

    const bNum = (b.bookingNumber || "").toLowerCase();
    const guestName = (b.traveler?.name || b.user?.name || "").toLowerCase();
    const guestEmail = (b.traveler?.email || b.user?.email || "").toLowerCase();
    const guestPhone = (b.traveler?.phone || "").toLowerCase();
    const itemName = (
      b.hotel?.name ||
      b.package?.title ||
      ""
    ).toLowerCase();
    const destination = (
      b.hotel?.location?.city ||
      b.package?.destination ||
      ""
    ).toLowerCase();

    const matchesSearch =
      bNum.includes(term) ||
      guestName.includes(term) ||
      guestEmail.includes(term) ||
      guestPhone.includes(term) ||
      itemName.includes(term) ||
      destination.includes(term);

    return matchesStatus && matchesType && matchesSearch;
  });

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setStatusUpdatingId(bookingId);
      await adminApi.updateBookingStatus(bookingId, newStatus);
      showToast(`Booking marked as ${newStatus}`, "success");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("Failed to update status: " + (err?.message || err), "error");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return {
          icon: CheckCircle2,
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "PENDING":
        return {
          icon: Clock,
          color: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "COMPLETED":
        return {
          icon: CheckCircle2,
          color: "bg-purple-50 text-[#5B30D9] border border-purple-200",
        };
      case "CANCELLED":
        return {
          icon: XCircle,
          color: "bg-rose-50 text-rose-700 border-rose-200",
        };
      default:
        return {
          icon: Clock,
          color: "bg-slate-100 text-slate-600 border-slate-200",
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Platform Bookings &amp; Reservations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit customer reservations, departure manifests, payment status and guest manifests
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Booking Type Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
            {[
              { id: "ALL", label: "All" },
              { id: "TRIP", label: "Holiday Trips" },
              { id: "HOTEL", label: "Hotels" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  typeFilter === t.id
                    ? "bg-[#5B30D9] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Status Badges Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
            {["ALL", "CONFIRMED", "PENDING", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === st
                    ? "bg-[#5B30D9] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200/80">
              <tr>
                <th className="p-3.5">Booking Ref</th>
                <th className="p-3.5">Customer / Guest</th>
                <th className="p-3.5">Reserved Property / Tour</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Schedule / Date</th>
                <th className="p-3.5">Tariff</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((b) => {
                  const badge = getStatusBadge(b.status);
                  const BadgeIcon = badge.icon;
                  const isTrip = b.bookingType === "TRIP" || !!b.package;
                  const itemName =
                    b.package?.title || b.hotel?.name || "Reservation";
                  const destination =
                    b.package?.destination ||
                    b.hotel?.location?.city ||
                    b.hotel?.location?.state ||
                    "—";

                  const scheduleText = isTrip
                    ? b.departureDate
                      ? new Date(b.departureDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Tour Batch"
                    : b.checkIn
                    ? `${new Date(b.checkIn).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })} - ${new Date(b.checkOut).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}`
                    : "Flexible Stay";

                  return (
                    <tr
                      key={b._id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Booking Ref */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-[#5B30D9] text-xs">
                          {b.bookingNumber || b._id?.slice(-8)}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {b.createdAt
                            ? new Date(b.createdAt).toLocaleDateString("en-IN")
                            : "—"}
                        </div>
                      </td>

                      {/* Customer / Guest */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-xs">
                          {b.traveler?.name || b.user?.name || "Customer"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.traveler?.email || b.user?.email || "—"}
                        </div>
                        {b.traveler?.phone && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {b.traveler.phone}
                          </div>
                        )}
                      </td>

                      {/* Reserved Property / Tour */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 line-clamp-1 text-xs">
                          {itemName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {destination}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isTrip
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-purple-50 text-[#5B30D9] border-purple-200"
                          }`}
                        >
                          {isTrip ? (
                            <Luggage className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Hotel className="w-3 h-3 text-[#5B30D9]" />
                          )}
                          {isTrip ? "TRIP" : "HOTEL"}
                        </span>
                      </td>

                      {/* Schedule / Date */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                          <Calendar className="w-3.5 h-3.5 text-[#5B30D9]" />
                          <span>{scheduleText}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {(b.guests?.adults || 1) + (b.guests?.children || 0)} Traveler(s)
                        </div>
                      </td>

                      {/* Tariff */}
                      <td className="p-3.5">
                        <span className="font-black text-xs text-slate-900">
                          ₹
                          {(
                            b.priceSnapshot?.totalAmount ||
                            b.totalAmount ||
                            0
                          ).toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === "PENDING" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(b._id, "CONFIRMED")
                              }
                              disabled={statusUpdatingId === b._id}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition"
                            >
                              {statusUpdatingId === b._id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Confirm"
                              )}
                            </button>
                          )}

                          {b.status === "CONFIRMED" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(b._id, "COMPLETED")
                              }
                              disabled={statusUpdatingId === b._id}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#5B30D9] rounded-lg text-[10px] font-bold border border-purple-200 transition"
                            >
                              Complete
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 text-slate-400 hover:text-[#5B30D9] rounded-lg hover:bg-purple-50 transition"
                            title="View Booking Manifest"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="p-10 text-center text-slate-400">
                    <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">
                      No matching booking records found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Customer bookings will appear here once placed on the portal.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#5B30D9]" />
              Reservation Overview &amp; Manifest
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              Reference: <span className="font-bold text-[#5B30D9]">{selectedBooking.bookingNumber}</span>
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {selectedBooking.bookingType === "TRIP"
                    ? "Holiday Tour Package"
                    : "Hotel Property Stay"}
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {selectedBooking.package?.title ||
                    selectedBooking.hotel?.name ||
                    "Reservation"}
                </p>
                <p className="text-slate-500">
                  {selectedBooking.package?.destination ||
                    selectedBooking.hotel?.location?.city ||
                    "—"}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Guest &amp; Traveler Info
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Name</span>
                    <span className="font-bold text-slate-800">
                      {selectedBooking.traveler?.name ||
                        selectedBooking.user?.name ||
                        "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Email</span>
                    <span className="font-mono text-slate-800">
                      {selectedBooking.traveler?.email ||
                        selectedBooking.user?.email ||
                        "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Phone</span>
                    <span className="font-mono text-slate-800">
                      {selectedBooking.traveler?.phone || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Party Size</span>
                    <span className="font-bold text-[#5B30D9]">
                      {selectedBooking.guests?.adults || 1} Adult(s)
                      {selectedBooking.guests?.children
                        ? `, ${selectedBooking.guests.children} Child(ren)`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block">Total Amount</span>
                  <span className="text-base font-black text-slate-900">
                    ₹
                    {(
                      selectedBooking.priceSnapshot?.totalAmount ||
                      selectedBooking.totalAmount ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block text-right">Status</span>
                  <span className="font-bold uppercase text-xs text-slate-900">
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {selectedBooking.status === "PENDING" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking._id, "CONFIRMED");
                      setSelectedBooking(null);
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition text-xs shadow-xs"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking._id, "CANCELLED");
                      setSelectedBooking(null);
                    }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
