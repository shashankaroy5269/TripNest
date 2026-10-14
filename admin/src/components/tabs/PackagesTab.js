"use client";

import React, { useState } from "react";
import { packageApi, adminApi } from "../../lib/api";
import { useToast } from "../Toast";
import {
  Compass,
  Plus,
  Trash2,
  MapPin,
  Loader2,
  Calendar,
  Users,
  Luggage,
  Sparkles,
  X,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Search,
  Filter,
  Eye,
  ChevronRight,
  Receipt,
  UserCheck,
} from "lucide-react";

export default function PackagesTab({
  packages = [],
  bookings = [],
  onRefresh,
  searchQuery = "",
}) {
  const { showToast } = useToast();
  const [activeSubView, setActiveSubView] = useState("CATALOG"); // "CATALOG" | "MANIFEST"
  const [themeFilter, setThemeFilter] = useState("ALL");
  const [manifestStatusFilter, setManifestStatusFilter] = useState("ALL");
  const [selectedPackageFilter, setSelectedPackageFilter] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manifestModalPkg, setManifestModalPkg] = useState(null);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const [newPkg, setNewPkg] = useState({
    title: "",
    destination: "Goa",
    durationDays: 4,
    pricePerPerson: 18500,
    packageType: "BEACH",
    description:
      "An exciting curated getaway with beach activities, dolphin safari and boutique resort stay.",
    inclusions: "Resort Stay, Daily Breakfast, Airport Transfers, Sightseeing",
    exclusions: "Flight Tickets, Personal Expenses",
  });

  // Filter trip bookings
  const tripBookings = (bookings || []).filter(
    (b) => b.bookingType === "TRIP" || !!b.package
  );

  // Compute Trip KPIs
  const totalTravelers = tripBookings.reduce(
    (sum, b) => sum + (b.guests?.adults || 1) + (b.guests?.children || 0),
    0
  );
  const confirmedCount = tripBookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "COMPLETED"
  ).length;
  const pendingCount = tripBookings.filter((b) => b.status === "PENDING").length;
  const totalTripRevenue = tripBookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce(
      (sum, b) =>
        sum + (b.priceSnapshot?.totalAmount || b.totalAmount || 0),
      0
    );

  // Filter packages for catalog
  const filteredPackages = packages.filter((pkg) => {
    const pkgType = (pkg.packageType || "").toUpperCase();
    const matchesTheme = themeFilter === "ALL" || pkgType === themeFilter;

    const term = searchQuery.toLowerCase().trim();
    if (!term) return matchesTheme;

    const title = (pkg.title || "").toLowerCase();
    const dest = (pkg.destination || "").toLowerCase();

    return matchesTheme && (title.includes(term) || dest.includes(term));
  });

  // Filter bookings for manifest
  const filteredBookings = tripBookings.filter((b) => {
    const matchesStatus =
      manifestStatusFilter === "ALL" || b.status === manifestStatusFilter;

    const pkgId = b.package?._id || b.package;
    const matchesPkg =
      selectedPackageFilter === "ALL" || String(pkgId) === String(selectedPackageFilter);

    const term = searchQuery.toLowerCase().trim();
    if (!term) return matchesStatus && matchesPkg;

    const bNum = (b.bookingNumber || "").toLowerCase();
    const travelerName = (b.traveler?.name || b.user?.name || "").toLowerCase();
    const travelerEmail = (b.traveler?.email || b.user?.email || "").toLowerCase();
    const travelerPhone = (b.traveler?.phone || "").toLowerCase();
    const pkgTitle = (b.package?.title || "").toLowerCase();
    const pkgDest = (b.package?.destination || "").toLowerCase();

    const matchesSearch =
      bNum.includes(term) ||
      travelerName.includes(term) ||
      travelerEmail.includes(term) ||
      travelerPhone.includes(term) ||
      pkgTitle.includes(term) ||
      pkgDest.includes(term);

    return matchesStatus && matchesPkg && matchesSearch;
  });

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const departureDate = new Date();
      departureDate.setDate(departureDate.getDate() + 14);

      await packageApi.create({
        ...newPkg,
        packageType: newPkg.packageType.toLowerCase(),
        durationDays: Number(newPkg.durationDays),
        days: Number(newPkg.durationDays),
        nights: Math.max(1, Number(newPkg.durationDays) - 1),
        pricePerPerson: Number(newPkg.pricePerPerson),
        startingPrice: Number(newPkg.pricePerPerson),
        capacity: 20,
        availableSeats: 20,
        inclusions: newPkg.inclusions.split(",").map((s) => s.trim()),
        exclusions: newPkg.exclusions.split(",").map((s) => s.trim()),
        departureDates: [departureDate],
        itinerary: [
          {
            dayNumber: 1,
            title: "Arrival & Welcome",
            description: "Meet our representative and transfer to resort.",
          },
          {
            dayNumber: 2,
            title: "Full Day Guided Tour",
            description: "Guided excursion to key regional sights and beaches.",
          },
        ],
      });

      showToast("Holiday tour package published successfully!", "success");
      setIsAddOpen(false);
      setNewPkg({
        title: "",
        destination: "Goa",
        durationDays: 4,
        pricePerPerson: 18500,
        packageType: "BEACH",
        description:
          "An exciting curated getaway with beach activities, dolphin safari and boutique resort stay.",
        inclusions: "Resort Stay, Daily Breakfast, Airport Transfers, Sightseeing",
        exclusions: "Flight Tickets, Personal Expenses",
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("Failed to create package: " + (err?.message || err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!confirm("Are you sure you want to delete this tour package?")) return;
    try {
      await packageApi.delete(id);
      showToast("Package deleted successfully.", "info");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("Failed to delete package: " + (err?.message || err), "error");
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setStatusUpdatingId(bookingId);
      await adminApi.updateBookingStatus(bookingId, newStatus);
      showToast(`Booking status marked as ${newStatus}`, "success");
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("Status update failed: " + (err?.message || err), "error");
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
      {/* Top Banner & Quick KPI Metric Cards (Compact) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200/80 text-[#5B30D9] flex items-center justify-center shrink-0">
            <Luggage className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tour Packages</p>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900">{packages.length}</h4>
            <span className="text-[10px] text-slate-400 font-semibold">
              Curated itineraries
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Booked Travelers</p>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900">{totalTravelers}</h4>
            <span className="text-[10px] text-[#5B30D9] font-semibold">
              {tripBookings.length} total reservations
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Confirmed Batches</p>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900">{confirmedCount}</h4>
            <span className="text-[10px] text-amber-600 font-semibold">
              {pendingCount} pending confirmation
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Trip Bookings Revenue</p>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900">
              ₹{totalTripRevenue.toLocaleString()}
            </h4>
            <span className="text-[10px] text-emerald-600 font-semibold">
              Verified receipts
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Segment Control & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        {/* Sub-view Switcher */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveSubView("CATALOG")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSubView === "CATALOG"
                ? "bg-[#5B30D9] text-white shadow-sm shadow-[#5B30D9]/25"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Luggage className="w-4 h-4" />
            <span>Tour Catalog ({packages.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView("MANIFEST")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSubView === "MANIFEST"
                ? "bg-[#5B30D9] text-white shadow-sm shadow-[#5B30D9]/25"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Passenger Manifest & Bookings ({tripBookings.length})</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2.5">
          {activeSubView === "CATALOG" ? (
            <>
              {/* Theme Filters */}
              <div className="hidden lg:flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
                {["ALL", "BEACH", "ADVENTURE", "LUXURY", "HONEYMOON"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setThemeFilter(t)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      themeFilter === t
                        ? "bg-[#5B30D9] text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl text-xs font-bold shadow-md shadow-[#5B30D9]/25 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Package</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Package filter dropdown */}
              <select
                value={selectedPackageFilter}
                onChange={(e) => setSelectedPackageFilter(e.target.value)}
                className="bg-white text-slate-800 border border-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
              >
                <option value="ALL">All Tour Packages</option>
                {packages.map((pkg) => (
                  <option key={pkg._id} value={pkg._id}>
                    {pkg.title} ({pkg.destination})
                  </option>
                ))}
              </select>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
                {["ALL", "CONFIRMED", "PENDING", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setManifestStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                      manifestStatusFilter === st
                        ? "bg-[#5B30D9] text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: TOUR CATALOG VIEW */}
      {/* ======================================================== */}
      {activeSubView === "CATALOG" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages && filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => {
              const pkgBookings = tripBookings.filter(
                (b) => String(b.package?._id || b.package) === String(pkg._id)
              );
              const bookedTravelersCount = pkgBookings.reduce(
                (sum, b) =>
                  sum + (b.guests?.adults || 1) + (b.guests?.children || 0),
                0
              );

              return (
                <div
                  key={pkg._id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition group relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#5B30D9] border border-purple-200 uppercase">
                        {pkg.packageType || "HOLIDAY"}
                      </span>

                      <button
                        onClick={() => handleDeletePackage(pkg._id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                        title="Delete Package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-[#5B30D9] transition line-clamp-1">
                      {pkg.title}
                    </h3>

                    <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-2.5">
                      <span className="flex items-center gap-1 text-[#5B30D9] font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        {pkg.destination}
                      </span>
                      <span>•</span>
                      <span>
                        {pkg.duration?.days || pkg.durationDays || 4} Days /{" "}
                        {Math.max(1, (pkg.duration?.days || pkg.durationDays || 4) - 1)}{" "}
                        Nights
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Booking Stats for this package */}
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#5B30D9]" />
                        <span className="text-xs font-bold text-slate-800">
                          {pkgBookings.length} Bookings
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#5B30D9]">
                        {bookedTravelersCount} Travelers
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block -mb-0.5">
                          Starting from
                        </span>
                        <span className="text-base font-black text-[#5B30D9]">
                          ₹
                          {(
                            pkg.startingPrice ||
                            pkg.pricePerPerson ||
                            0
                          ).toLocaleString()}
                          <span className="text-[10px] font-normal text-slate-500">
                            {" "}
                            / person
                          </span>
                        </span>
                      </div>

                      <span className="text-[10px] font-bold text-[#5B30D9] px-2 py-0.5 bg-purple-50 rounded-lg border border-purple-200">
                        {pkg.departureDates?.length || 1} Batches
                      </span>
                    </div>

                    {/* Quick Button to View Manifest */}
                    <button
                      onClick={() => {
                        setSelectedPackageFilter(pkg._id);
                        setActiveSubView("MANIFEST");
                      }}
                      className="w-full py-1.5 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#5B30D9] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-200"
                    >
                      <Users className="w-3.5 h-3.5 text-[#5B30D9]" />
                      <span>View Passenger Manifest ({pkgBookings.length})</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-2xl p-10 border border-slate-200/80 text-center text-slate-400 shadow-sm">
              <Luggage className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">
                No tour packages match criteria
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Click &quot;Publish Package&quot; above to create a holiday tour.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: TRIP BOOKINGS & PASSENGER MANIFEST TABLE */}
      {/* ======================================================== */}
      {activeSubView === "MANIFEST" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#5B30D9]" />
                <span>Holiday Tour Passenger Manifest</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time roster of confirmed and pending holiday travelers across all departure batches
              </p>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Showing <span className="font-bold text-slate-900">{filteredBookings.length}</span> passenger bookings
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200/80">
                <tr>
                  <th className="p-3.5">Booking Ref</th>
                  <th className="p-3.5">Traveler / Contact</th>
                  <th className="p-3.5">Package / Destination</th>
                  <th className="p-3.5">Departure Date</th>
                  <th className="p-3.5">Travelers</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((b) => {
                    const badge = getStatusBadge(b.status);
                    const BadgeIcon = badge.icon;
                    const pkgTitle =
                      b.package?.title || "Curated Tour Package";
                    const pkgDest =
                      b.package?.destination || "Vacation";
                    const travelerCount =
                      (b.guests?.adults || 1) + (b.guests?.children || 0);

                    const depDate = b.departureDate
                      ? new Date(b.departureDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Upcoming Batch";

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
                              : ""}
                          </div>
                        </td>

                        {/* Traveler / Contact */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 text-xs">
                            {b.traveler?.name || b.user?.name || "Customer"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {b.traveler?.email || b.user?.email || "—"}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {b.traveler?.phone || b.user?.phone || "—"}
                          </div>
                        </td>

                        {/* Package / Destination */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800 line-clamp-1 text-xs">
                            {pkgTitle}
                          </div>
                          <div className="text-[11px] text-[#5B30D9] flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3" />
                            <span>{pkgDest}</span>
                          </div>
                        </td>

                        {/* Departure Date */}
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-[#5B30D9]" />
                            <span>{depDate}</span>
                          </div>
                        </td>

                        {/* Travelers */}
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                            <Users className="w-3 h-3 text-[#5B30D9]" />
                            <span>
                              {b.guests?.adults || 1} Adults
                              {b.guests?.children ? `, ${b.guests.children} Ch` : ""}
                            </span>
                          </span>
                        </td>

                        {/* Total Amount */}
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
                                title="Confirm this reservation"
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
                                title="Mark trip as completed"
                              >
                                Complete
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedBookingDetails(b)}
                              className="p-1.5 text-slate-400 hover:text-[#5B30D9] rounded-lg hover:bg-purple-50 transition"
                              title="View Passenger Details"
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
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">
                        No passenger bookings found
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedPackageFilter !== "ALL"
                          ? "No travelers booked for this package yet."
                          : "Customer trip bookings will show up here as soon as orders are placed."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PASSENGER DETAILS MODAL */}
      {/* ======================================================== */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative">
            <button
              onClick={() => setSelectedBookingDetails(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Luggage className="w-5 h-5 text-[#5B30D9]" />
              Traveler Manifest &amp; Booking Details
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              Reference: <span className="text-[#5B30D9] font-bold">{selectedBookingDetails.bookingNumber}</span>
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Package Information
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {selectedBookingDetails.package?.title || "Tour Package"}
                </p>
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1 text-[#5B30D9] font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedBookingDetails.package?.destination || "Destination"}
                  </span>
                  <span>•</span>
                  <span>
                    Departure:{" "}
                    {selectedBookingDetails.departureDate
                      ? new Date(
                          selectedBookingDetails.departureDate
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Pending"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Passenger Contact Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Contact</span>
                    <span className="font-bold text-slate-800">
                      {selectedBookingDetails.traveler?.name ||
                        selectedBookingDetails.user?.name ||
                        "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email</span>
                    <span className="font-mono text-slate-800">
                      {selectedBookingDetails.traveler?.email ||
                        selectedBookingDetails.user?.email ||
                        "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone</span>
                    <span className="font-mono text-slate-800">
                      {selectedBookingDetails.traveler?.phone || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Passenger Manifest</span>
                    <span className="font-bold text-[#5B30D9]">
                      {selectedBookingDetails.guests?.adults || 1} Adult(s),{" "}
                      {selectedBookingDetails.guests?.children || 0} Child(ren)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tariff Paid</span>
                  <span className="text-base font-black text-slate-900">
                    ₹
                    {(
                      selectedBookingDetails.priceSnapshot?.totalAmount ||
                      selectedBookingDetails.totalAmount ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] text-right">Status</span>
                  <span className="font-bold uppercase text-xs text-slate-900">
                    {selectedBookingDetails.status}
                  </span>
                </div>
              </div>

              {selectedBookingDetails.status === "PENDING" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedBookingDetails._id, "CONFIRMED");
                      setSelectedBookingDetails(null);
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition text-xs shadow-xs"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedBookingDetails._id, "CANCELLED");
                      setSelectedBookingDetails(null);
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

      {/* ======================================================== */}
      {/* CREATE PACKAGE MODAL */}
      {/* ======================================================== */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#5B30D9]" />
              Publish Tour Package
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Publish a curated vacation with itineraries and inclusions
            </p>

            <form onSubmit={handleCreatePackage} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Package Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-Day Splendors of Kashmir & Dal Lake"
                  value={newPkg.title}
                  onChange={(e) =>
                    setNewPkg({ ...newPkg, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    required
                    value={newPkg.destination}
                    onChange={(e) =>
                      setNewPkg({ ...newPkg, destination: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Theme / Category
                  </label>
                  <select
                    value={newPkg.packageType}
                    onChange={(e) =>
                      setNewPkg({ ...newPkg, packageType: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#5B30D9] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  >
                    <option value="BEACH">BEACH</option>
                    <option value="ADVENTURE">ADVENTURE</option>
                    <option value="HONEYMOON">HONEYMOON</option>
                    <option value="LUXURY">LUXURY</option>
                    <option value="FAMILY">FAMILY</option>
                    <option value="CULTURAL">CULTURAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={newPkg.durationDays}
                    onChange={(e) =>
                      setNewPkg({ ...newPkg, durationDays: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Price / Person (₹)
                  </label>
                  <input
                    type="number"
                    value={newPkg.pricePerPerson}
                    onChange={(e) =>
                      setNewPkg({ ...newPkg, pricePerPerson: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Inclusions (Comma separated)
                </label>
                <input
                  type="text"
                  value={newPkg.inclusions}
                  onChange={(e) =>
                    setNewPkg({ ...newPkg, inclusions: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newPkg.description}
                  onChange={(e) =>
                    setNewPkg({ ...newPkg, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/25"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-[#5B30D9]/25 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Publish Package"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
