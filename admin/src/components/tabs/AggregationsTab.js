"use client";

import React from "react";
import { BarChart3, MapPin, TrendingUp, Sparkles, Calendar, DollarSign } from "lucide-react";

export default function AggregationsTab({ monthlyRevenue = [], popularDestinations = [] }) {
  const maxRevenue = Math.max(
    1,
    ...monthlyRevenue.map((m) => m.totalRevenue || 0)
  );

  const maxDestBookings = Math.max(
    1,
    ...popularDestinations.map((d) => d.totalBookings || 0)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 text-[#5B30D9] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Financial & Destination Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 ml-10">
            Real-time business performance, revenue velocity, and regional travel corridor metrics
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Platform Insights
          </span>
        </div>
      </div>

      {/* Monthly Revenue Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#5B30D9]" />
              Monthly Revenue & Performance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Summarizes platform cash flow, transaction volume, and Average Order Value (AOV)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-[#5B30D9] border border-purple-100 self-start sm:self-auto">
            Verified Payments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold tracking-wide border-b border-slate-100">
              <tr>
                <th className="p-3">Billing Period</th>
                <th className="p-3">Booking Count</th>
                <th className="p-3">Gross Revenue</th>
                <th className="p-3">Relative Volume</th>
                <th className="p-3 text-right">Avg Order Value (AOV)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyRevenue && monthlyRevenue.length > 0 ? (
                monthlyRevenue.map((item, idx) => {
                  const rev = item.totalRevenue || 0;
                  const pct = Math.min(100, Math.round((rev / maxRevenue) * 100));

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-900">
                        {item._id?.year || 2026} - Month {item._id?.month || 10}
                      </td>

                      <td className="p-3 text-slate-600 font-medium">
                        {item.bookingCount} bookings
                      </td>

                      <td className="p-3 font-bold text-slate-900 text-sm">
                        ₹{rev.toLocaleString()}
                      </td>

                      <td className="p-3 w-48">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#5B30D9] rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono font-medium">
                            {pct}%
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-right font-mono text-[#5B30D9] font-bold">
                        ₹{Math.round(item.averageBookingValue || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400">
                    <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-medium">No successful booking payments recorded yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular Destinations Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#5B30D9]" />
              Top Performing Travel Destinations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rankings of destinations based on booking numbers and generated market revenue
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-[#5B30D9] border border-purple-100 self-start sm:self-auto">
            Regional Demand
          </span>
        </div>

        {popularDestinations && popularDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {popularDestinations.map((d, i) => {
              const bCount = d.totalBookings || 1;
              const pct = Math.min(100, Math.round((bCount / maxDestBookings) * 100));

              return (
                <div
                  key={i}
                  className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 hover:border-[#5B30D9]/30 hover:bg-white hover:shadow-xs transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#5B30D9]" />
                        {d._id || "Goa"}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        ₹{(d.totalRevenue || 0).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      {bCount} total traveler bookings placed
                    </p>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-200/70">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Market Share Volume</span>
                      <span className="font-bold text-[#5B30D9]">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#5B30D9] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium">Destination metrics will compute automatically as bookings occur.</p>
          </div>
        )}
      </div>
    </div>
  );
}
