"use client";

import React from "react";
import { useAuth } from "../lib/authContext";
import {
  Compass,
  LayoutDashboard,
  BarChart3,
  Building2,
  BedDouble,
  Luggage,
  CalendarCheck,
  Users,
  Tag,
  LogOut,
  ShieldCheck,
  Hotel,
  X,
  Headphones,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
  pendingHotelsCount = 0,
}) {
  const { user, logout } = useAuth();
  const role = user?.role || "SUPER_ADMIN";

  const getRoleBadge = (r) => {
    switch (r) {
      case "SUPER_ADMIN":
        return {
          label: "Super Admin",
          color: "bg-purple-50 text-[#5B30D9] border-purple-200",
          icon: ShieldCheck,
        };
      case "HOTEL_ADMIN":
        return {
          label: "Hotel Admin",
          color: "bg-blue-50 text-blue-600 border-blue-200",
          icon: Hotel,
        };
      case "TRIP_MANAGER":
        return {
          label: "Trip Manager",
          color: "bg-emerald-50 text-emerald-600 border-emerald-200",
          icon: Luggage,
        };
      default:
        return {
          label: r || "Staff",
          color: "bg-slate-100 text-slate-600 border-slate-200",
          icon: ShieldCheck,
        };
    }
  };

  const roleInfo = getRoleBadge(role);
  const RoleIcon = roleInfo.icon;

  const sections = [
    {
      group: "MAIN & ANALYTICS",
      allowed: ["SUPER_ADMIN"],
      items: [
        {
          id: "OVERVIEW",
          label: "Dashboard Overview",
          icon: LayoutDashboard,
        },
        {
          id: "AGGREGATIONS",
          label: "Analytics & Reports",
          icon: BarChart3,
          badge: "Live",
          badgeColor: "bg-purple-100 text-[#5B30D9] border-purple-200",
        },
      ],
    },
    {
      group: "CATALOG & RESERVATIONS",
      allowed: ["SUPER_ADMIN", "HOTEL_ADMIN", "TRIP_MANAGER"],
      items: [
        {
          id: "HOTELS",
          label: "Properties & Approvals",
          icon: Building2,
          roles: ["SUPER_ADMIN", "HOTEL_ADMIN"],
          badge: pendingHotelsCount > 0 ? `${pendingHotelsCount} pending` : null,
          badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
        },
        {
          id: "ROOMS",
          label: "Room Inventory",
          icon: BedDouble,
          roles: ["SUPER_ADMIN", "HOTEL_ADMIN"],
        },
        {
          id: "PACKAGES",
          label: "Tour Packages",
          icon: Luggage,
          roles: ["SUPER_ADMIN", "TRIP_MANAGER"],
        },
        {
          id: "BOOKINGS",
          label: "Platform Bookings",
          icon: CalendarCheck,
          roles: ["SUPER_ADMIN", "HOTEL_ADMIN", "TRIP_MANAGER"],
        },
      ],
    },
    {
      group: "PLATFORM GOVERNANCE",
      allowed: ["SUPER_ADMIN"],
      items: [
        {
          id: "USERS",
          label: "User & Staff Access",
          icon: Users,
          roles: ["SUPER_ADMIN"],
        },
        {
          id: "COUPONS",
          label: "Promotional Coupons",
          icon: Tag,
          roles: ["SUPER_ADMIN"],
        },
      ],
    },
    {
      group: "SUPPORT & CONCIERGE",
      allowed: ["SUPER_ADMIN", "HOTEL_ADMIN", "TRIP_MANAGER"],
      items: [
        {
          id: "ENQUIRIES",
          label: "Customer Enquiries",
          icon: Headphones,
          roles: ["SUPER_ADMIN", "HOTEL_ADMIN", "TRIP_MANAGER"],
        },
      ],
    },
  ];

  const handleItemClick = (id) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 shadow-sm">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5B30D9] flex items-center justify-center text-white shadow-md shadow-[#5B30D9]/25">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900">
                Trip<span className="text-[#5B30D9]">Nest</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-purple-100 text-[#5B30D9]">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide">
              Management Portal
            </p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-thin">
        {sections.map((sec, secIdx) => {
          const visibleItems = sec.items.filter(
            (item) => !item.roles || item.roles.includes(role)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={secIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {sec.group}
              </span>
              <div className="space-y-1 pt-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                        isActive
                          ? "bg-[#5B30D9] text-white shadow-md shadow-[#5B30D9]/25 font-bold"
                          : "text-slate-600 hover:text-[#5B30D9] hover:bg-purple-50/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition ${
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-[#5B30D9]"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isActive
                              ? "bg-white/20 text-white border-white/30"
                              : item.badgeColor ||
                                "bg-purple-100 text-[#5B30D9] border-purple-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Info & Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#5B30D9] flex items-center justify-center font-black text-xs shrink-0">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {user?.name || "Administrator"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${roleInfo.color}`}
                >
                  <RoleIcon className="w-2.5 h-2.5" />
                  {roleInfo.label}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
