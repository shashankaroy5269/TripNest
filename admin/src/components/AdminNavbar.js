"use client";

import React from "react";
import { useAuth } from "../lib/authContext";
import { ShieldCheck, LogOut, Compass, Hotel, Luggage, User } from "lucide-react";

export default function AdminNavbar() {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          label: "Super Admin",
          color: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
          icon: ShieldCheck,
        };
      case "HOTEL_ADMIN":
        return {
          label: "Hotel Admin",
          color: "bg-blue-500/20 text-blue-300 border-blue-400/30",
          icon: Hotel,
        };
      case "TRIP_MANAGER":
        return {
          label: "Trip Manager",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
          icon: Luggage,
        };
      default:
        return {
          label: role || "Staff",
          color: "bg-slate-500/20 text-slate-300 border-slate-400/30",
          icon: User,
        };
    }
  };

  const badge = getRoleBadge(user?.role);
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-40 bg-[#5B30D9] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-sm">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  TripNest
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/20 text-white">
                  Admin Portal
                </span>
              </div>
              <p className="text-[11px] text-white/80 font-medium -mt-0.5">
                Centralized Management Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-800 border border-slate-700">
              <div className="w-8 h-8 rounded-full bg-indigo-600/40 text-indigo-200 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-200 leading-tight">
                  {user?.name || "Admin"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                  >
                    <BadgeIcon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
