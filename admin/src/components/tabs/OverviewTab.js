"use client";

import React from "react";
import {
  TrendingUp,
  CalendarCheck,
  Building2,
  Users,
  ArrowUpRight,
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Hotel,
  Luggage,
  Sparkles,
  Star,
  MapPin,
  Clock,
  ChevronRight,
} from "lucide-react";

export default function OverviewTab({
  stats,
  hotelsCount = 0,
  usersCount = 0,
  packagesCount = 0,
  bookings = [],
  onSelectTab,
}) {
  const kpis = [
    {
      title: "Gross Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      change: "+18.4%",
      changeType: "up",
      note: "From confirmed payments",
      icon: TrendingUp,
      iconColor: "text-[#5B30D9] bg-purple-50",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || bookings.length || 0,
      change: "+12.1%",
      changeType: "up",
      note: "Rooms & tour packages",
      icon: CalendarCheck,
      iconColor: "text-blue-600 bg-blue-50",
    },
    {
      title: "Properties Listed",
      value: hotelsCount || stats?.totalHotels || 0,
      change: stats?.pendingHotels ? `${stats.pendingHotels} Pending` : "100% Live",
      changeType: stats?.pendingHotels ? "alert" : "neutral",
      note: "Across premier destinations",
      icon: Building2,
      iconColor: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Registered Users",
      value: usersCount || stats?.totalUsers || 0,
      change: "+9.2%",
      changeType: "up",
      note: "Active platform travelers",
      icon: Users,
      iconColor: "text-amber-600 bg-amber-50",
    },
  ];

  // Sample curated properties for "Popular Resorts" section (matching the reference image layout)
  const popularResorts = [
    {
      id: "resort_1",
      name: "The Grand Azure Resort",
      city: "Goa",
      rating: 4.8,
      reviews: 142,
      price: 6850,
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=80",
      tag: "RESORT",
    },
    {
      id: "resort_2",
      name: "Rajwada Palace Heritage",
      city: "Jaipur",
      rating: 4.7,
      reviews: 98,
      price: 5200,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
      tag: "PALACE",
    },
    {
      id: "resort_3",
      name: "Kerala Backwater Palm Lagoon",
      city: "Kumarakom",
      rating: 4.9,
      reviews: 210,
      price: 8400,
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80",
      tag: "VILLA",
    },
    {
      id: "resort_4",
      name: "Himalayan Pine Cliff Retreat",
      city: "Manali",
      rating: 4.6,
      reviews: 86,
      price: 4900,
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80",
      tag: "RETREAT",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome / Quick Action Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5B30D9] via-[#635BFF] to-[#7C3AED] p-5 sm:p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider text-white">
              <Sparkles className="w-3 h-3" />
              <span>TripNest Travel Administration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome to the Travel Command Center
            </h2>
            <p className="text-xs text-purple-100 leading-relaxed">
              Real-time telemetry across guest bookings, properties, tariffs, and revenue analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectTab("HOTELS")}
              className="px-3.5 py-2 rounded-xl bg-white text-[#5B30D9] hover:bg-white/95 font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" />
              <span>Manage Properties</span>
            </button>
            <button
              onClick={() => onSelectTab("BOOKINGS")}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5"
            >
              <span>View Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Compact KPI Metric Cards ("choto and professional") */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    {kpi.title}
                  </span>
                  <div className={`p-2 rounded-xl ${kpi.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {kpi.value}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium truncate">
                  {kpi.note}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                    kpi.changeType === "up"
                      ? "bg-emerald-50 text-emerald-700"
                      : kpi.changeType === "alert"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {kpi.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* "Popular Resorts" Compact Cards Section (Styled exactly like the reference UI) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Popular Resorts &amp; Properties
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-[#5B30D9] font-bold">
              Featured
            </span>
          </div>

          <button
            onClick={() => onSelectTab("HOTELS")}
            className="text-xs font-bold text-[#5B30D9] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Compact Resort Cards Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {popularResorts.map((resort) => (
            <div
              key={resort.id}
              onClick={() => onSelectTab("HOTELS")}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              {/* Compact Image Container with Rating Pill */}
              <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                <img
                  src={resort.image}
                  alt={resort.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Rating badge like the reference image */}
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{resort.rating}</span>
                </div>
                {/* Tag badge */}
                <div className="absolute bottom-2 left-2 bg-[#5B30D9]/90 text-white px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide">
                  {resort.tag}
                </div>
              </div>

              {/* Compact Card Details */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#5B30D9] transition">
                    {resort.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                    <span>{resort.city}</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">from </span>
                    <span className="font-extrabold text-[#5B30D9]">₹{resort.price.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400">/nt</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {resort.reviews} reviews
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Lower Grid: Operations Quick Links & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Operations Modules (1 column) */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            Quick Modules
          </h3>

          <div
            onClick={() => onSelectTab("ROOMS")}
            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5B30D9] flex items-center justify-center shrink-0">
                <Hotel className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#5B30D9] transition">
                  Room Tariffs &amp; Stock
                </h4>
                <p className="text-[10px] text-slate-400">
                  Manage inventory allotments &amp; rates
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#5B30D9] transition" />
          </div>

          <div
            onClick={() => onSelectTab("PACKAGES")}
            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Luggage className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition">
                  Tour Packages ({packagesCount})
                </h4>
                <p className="text-[10px] text-slate-400">
                  Curate seasonal holiday itineraries
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
          </div>

          <div
            onClick={() => onSelectTab("AGGREGATIONS")}
            className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                  Financial Analytics
                </h4>
                <p className="text-[10px] text-slate-400">
                  Monthly revenue &amp; destination growth
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
          </div>
        </div>

        {/* Recent Reservations Ledger (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-[#5B30D9]" />
                Recent Platform Reservations
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Live customer transactions and check-in statuses
              </p>
            </div>

            <button
              onClick={() => onSelectTab("BOOKINGS")}
              className="text-xs font-bold text-[#5B30D9] hover:underline"
            >
              Ledger &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-2.5">Ref</th>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Item</th>
                  <th className="p-2.5">Amount</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings && bookings.length > 0 ? (
                  bookings.slice(0, 5).map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition">
                      <td className="p-2.5 font-mono font-bold text-[#5B30D9]">
                        {b.bookingNumber || b._id?.slice(-6)}
                      </td>
                      <td className="p-2.5 font-bold text-slate-800">
                        {b.traveler?.name || b.user?.name || "Traveler"}
                      </td>
                      <td className="p-2.5 text-slate-600 truncate max-w-[150px]">
                        {b.hotel?.name || b.package?.title || "Booking"}
                      </td>
                      <td className="p-2.5 font-bold text-emerald-600">
                        ₹{(b.priceSnapshot?.totalAmount || b.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-400">
                      No customer reservations recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
