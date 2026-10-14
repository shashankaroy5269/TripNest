"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../lib/authContext";
import {
  Menu,
  Search,
  RefreshCw,
  Sparkles,
  Bell,
  CheckCheck,
  Building2,
  Calendar,
  CreditCard,
  ArrowRight,
  X,
  Compass,
} from "lucide-react";

export default function Header({
  onOpenMobileSidebar,
  onRefresh,
  isRefreshing,
  searchQuery,
  onSearchChange,
  title = "Command Center",
  onQuickAction,
  notifications = [],
  onMarkAllRead,
  onNotificationClick,
  onSimulateBooking,
}) {
  const { user } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 sm:h-20 bg-[#5B30D9] text-white shadow-md px-4 sm:px-8 flex items-center justify-between gap-4 transition-all">
      {/* Mobile Menu & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-white/90 hover:text-white rounded-xl hover:bg-white/10 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-[11px] text-purple-200/90 font-medium hidden sm:block">
            TripNest Management Platform
          </p>
        </div>
      </div>

      {/* Global Filter / Search Bar (Styled like the reference design) */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search hotels, packages, users, bookings..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white text-slate-800 placeholder-slate-400 rounded-full border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/80 transition"
          />
        </div>
      </div>

      {/* Action Controls & Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 sm:p-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white transition shadow-sm disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>

        {/* Notification Bell Icon */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2 sm:p-2.5 rounded-full border border-white/20 transition shadow-sm relative ${
              isNotifOpen
                ? "bg-white text-[#5B30D9]"
                : "bg-white/15 hover:bg-white/25 text-white"
            }`}
            title="Customer Booking Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-md shadow-rose-500/40 animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Flyout Menu (Clean White Card) */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn text-slate-800">
              {/* Header */}
              <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-[#5B30D9]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Booking Notifications</h4>
                    <p className="text-[10px] text-slate-500">Live booking alerts</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && onMarkAllRead && (
                    <button
                      onClick={onMarkAllRead}
                      className="text-[10px] font-bold text-[#5B30D9] hover:underline flex items-center gap-1 px-2 py-0.5 rounded transition"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Read All</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications && notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (onNotificationClick) onNotificationClick(item);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3 hover:bg-slate-50 transition cursor-pointer relative ${
                        !item.isRead ? "bg-purple-50/30" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            !item.isRead
                              ? "bg-purple-100 text-[#5B30D9]"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {item.customerName || "Customer"}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {item.timeAgo || "Just now"}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                            {item.hotelName || item.title || "Luxury Stay"}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                            <span>{item.dates || "Upcoming Stay"}</span>
                            <span className="font-bold text-emerald-600">
                              ₹{(item.amount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#5B30D9] shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-60" />
                    <p className="text-xs font-bold text-slate-600">No recent alerts</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Customer bookings will trigger real-time notifications here.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    if (onNotificationClick) onNotificationClick({ tab: "BOOKINGS" });
                    setIsNotifOpen(false);
                  }}
                  className="text-[11px] font-bold text-[#5B30D9] hover:underline transition flex items-center justify-center gap-1 w-full"
                >
                  <span>View All Bookings in Ledger</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge (Rightmost pill matching reference design) */}
        <div className="hidden sm:flex items-center gap-2 pl-1 sm:pl-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-[#5B30D9] flex items-center justify-center font-black text-xs shadow-sm border-2 border-white/40">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <p className="text-xs font-bold text-white truncate max-w-[120px]">
              {user?.name || "Administrator"}
            </p>
            <p className="text-[10px] text-purple-200 capitalize truncate">
              {user?.role === "HOTEL_ADMIN"
                ? "Hotel Admin"
                : user?.role === "SUPER_ADMIN"
                ? "Super Admin"
                : "Staff"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
