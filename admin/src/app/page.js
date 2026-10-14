"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/authContext";
import { adminApi, hotelApi, packageApi, couponApi } from "../lib/api";
import { useToast } from "../components/Toast";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const TabLoader = () => (
  <div className="py-20 flex flex-col items-center justify-center text-center">
    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
    <p className="text-xs text-slate-400">Loading module...</p>
  </div>
);

const OverviewTab = dynamic(() => import("../components/tabs/OverviewTab"), {
  loading: () => <TabLoader />,
});
const AggregationsTab = dynamic(() => import("../components/tabs/AggregationsTab"), {
  loading: () => <TabLoader />,
});
const HotelsTab = dynamic(() => import("../components/tabs/HotelsTab"), {
  loading: () => <TabLoader />,
});
const RoomsTab = dynamic(() => import("../components/tabs/RoomsTab"), {
  loading: () => <TabLoader />,
});
const PackagesTab = dynamic(() => import("../components/tabs/PackagesTab"), {
  loading: () => <TabLoader />,
});
const BookingsTab = dynamic(() => import("../components/tabs/BookingsTab"), {
  loading: () => <TabLoader />,
});
const UsersTab = dynamic(() => import("../components/tabs/UsersTab"), {
  loading: () => <TabLoader />,
});
const CouponsTab = dynamic(() => import("../components/tabs/CouponsTab"), {
  loading: () => <TabLoader />,
});
const EnquiriesTab = dynamic(() => import("../components/tabs/EnquiriesTab"), {
  loading: () => <TabLoader />,
});

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [stats, setStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cross-tab selected hotel for RoomsTab navigation
  const [selectedHotelForRooms, setSelectedHotelForRooms] = useState(null);

  // Real-time Booking Notifications State
  const [notifications, setNotifications] = useState([]);
  const prevBookingsCountRef = useRef(0);
  const knownBookingIdsRef = useRef(new Set());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role) {
      if (user.role === "HOTEL_ADMIN") {
        setActiveTab("HOTELS");
      } else if (user.role === "TRIP_MANAGER") {
        setActiveTab("PACKAGES");
      }
    }
  }, [user]);

  // Convert raw booking to a friendly notification object
  const createNotificationFromBooking = (b, isNew = false) => {
    const custName =
      b.user?.name ||
      b.guestName ||
      b.customerName ||
      b.contactDetails?.name ||
      "Traveler";

    const title =
      b.hotel?.name ||
      b.package?.title ||
      b.hotelName ||
      b.packageName ||
      "Luxury Accomodation";

    let dates = "Upcoming Trip";
    if (b.checkIn && b.checkOut) {
      const inDate = new Date(b.checkIn).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      const outDate = new Date(b.checkOut).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      dates = `${inDate} — ${outDate}`;
    }

    return {
      id: b._id || `notif_${Date.now()}_${Math.random()}`,
      customerName: custName,
      hotelName: title,
      amount: b.totalAmount || b.amount || 4500,
      dates,
      timeAgo: isNew ? "Just now" : "Recently",
      isRead: !isNew,
      bookingId: b._id,
    };
  };

  const loadData = async (silent = false) => {
    if (!isAuthenticated) return;
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const [
        statsRes,
        monthlyRevRes,
        destRes,
        hotelsRes,
        usersRes,
        couponsRes,
        packagesRes,
        bookingsRes,
      ] = await Promise.all([
        adminApi.getStats().catch(() => ({ data: {} })),
        adminApi.getMonthlyRevenue().catch(() => ({ data: [] })),
        adminApi.getPopularDestinations().catch(() => ({ data: [] })),
        hotelApi.getAdminAll().catch(() => hotelApi.getAll().catch(() => ({ data: [] }))),
        adminApi.getUsers().catch(() => ({ data: [] })),
        couponApi.getAll().catch(() => ({ data: [] })),
        packageApi.getAll().catch(() => ({ data: [] })),
        adminApi.getAllBookings().catch(() => ({ data: [] })),
      ]);

      setStats(statsRes.data || statsRes || {});
      setMonthlyRevenue(monthlyRevRes.data || monthlyRevRes || []);
      setPopularDestinations(destRes.data || destRes || []);
      setHotels(hotelsRes.data || hotelsRes || []);
      setUsers(usersRes.data || usersRes || []);
      setCoupons(couponsRes.data || couponsRes || []);
      setPackages(packagesRes.data || packagesRes || []);

      const incomingBookings = bookingsRes.data || bookingsRes || [];
      setBookings(incomingBookings);

      // Check for newly arrived bookings (real-time notification trigger)
      if (Array.isArray(incomingBookings) && incomingBookings.length > 0) {
        if (knownBookingIdsRef.current.size > 0) {
          // Look for bookings not in known IDs
          const brandNew = incomingBookings.filter(
            (b) => b._id && !knownBookingIdsRef.current.has(b._id)
          );

          if (brandNew.length > 0) {
            brandNew.forEach((newB) => {
              const notif = createNotificationFromBooking(newB, true);
              setNotifications((prev) => [notif, ...prev]);
              showToast(
                `🔔 New Customer Booking! ${notif.customerName} reserved "${notif.hotelName}" for ₹${notif.amount?.toLocaleString()}`,
                "success"
              );
            });
          }
        } else {
          // Initial load: populate notifications from latest 6 bookings
          const initialNotifs = incomingBookings
            .slice(0, 6)
            .map((b) => createNotificationFromBooking(b, false));
          setNotifications(initialNotifs);
        }

        // Update known IDs set
        incomingBookings.forEach((b) => {
          if (b._id) knownBookingIdsRef.current.add(b._id);
        });
        prevBookingsCountRef.current = incomingBookings.length;
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
      showToast("Error refreshing platform data", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();

      // Live Polling every 25 seconds for new customer booking notifications
      const pollInterval = setInterval(() => {
        loadData(true);
      }, 25000);

      return () => clearInterval(pollInterval);
    }
  }, [isAuthenticated]);

  const handleManualRefresh = () => {
    loadData(true);
    showToast("Refreshing platform data...", "info");
  };

  // Notification action handlers
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast("All booking notifications marked as read.", "info");
  };

  const handleNotificationClick = (item) => {
    if (item?.id) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
    }
    setActiveTab("BOOKINGS");
  };

  // Simulate a live customer booking notification (for instant testing & verification)
  const handleSimulateBooking = () => {
    const demoCustomers = [
      "Aarav Sharma",
      "Priya Patel",
      "Rohan Mukherjee",
      "Ananya Sengupta",
      "Vikram Malhotra",
    ];
    const demoProperties = [
      "The Grand Azure Beachfront Resort",
      "Himalayan Pine Sanctuary",
      "Royal Heritage Palace & Spa",
      "Calangute Sunset Villa",
    ];
    const randomCustomer =
      demoCustomers[Math.floor(Math.random() * demoCustomers.length)];
    const randomProperty =
      hotels.length > 0
        ? hotels[Math.floor(Math.random() * hotels.length)].name
        : demoProperties[Math.floor(Math.random() * demoProperties.length)];
    const randomAmount = Math.floor(Math.random() * 8 + 3) * 2500;

    const fakeNotif = {
      id: `sim_${Date.now()}`,
      customerName: randomCustomer,
      hotelName: randomProperty,
      amount: randomAmount,
      dates: "20 Oct — 24 Oct",
      timeAgo: "Just now",
      isRead: false,
    };

    setNotifications((prev) => [fakeNotif, ...prev]);
    showToast(
      `🔔 New Customer Booking! ${fakeNotif.customerName} reserved "${fakeNotif.hotelName}" for ₹${fakeNotif.amount.toLocaleString()}`,
      "success"
    );
  };

  // Handler for jumping to RoomsTab from HotelsTab
  const handleSelectHotelForRooms = (hotel) => {
    setSelectedHotelForRooms(hotel._id);
    setActiveTab("ROOMS");
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen bg-[#F4F6FC] flex items-center justify-center text-slate-700">
        <Loader2 className="w-9 h-9 animate-spin text-[#5B30D9]" />
      </div>
    );
  }

  const pendingHotels = hotels.filter((h) => h.status === "PENDING").length;

  const getPageTitle = () => {
    switch (activeTab) {
      case "OVERVIEW":
        return "Executive Overview";
      case "AGGREGATIONS":
        return "Business Analytics & Reports";
      case "HOTELS":
        return "Hotel Management";
      case "ROOMS":
        return "Room & Inventory Management";
      case "PACKAGES":
        return "Holiday Tour Packages";
      case "BOOKINGS":
        return "Platform Reservations";
      case "USERS":
        return "User & Staff Access";
      case "COUPONS":
        return "Promotional Discount Coupons";
      default:
        return "Command Center";
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FC] text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        pendingHotelsCount={pendingHotels}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          title={getPageTitle()}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onNotificationClick={handleNotificationClick}
          onSimulateBooking={handleSimulateBooking}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 text-[#5B30D9] animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-700">
                Syncing administrative telemetry...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Fetching properties, reservations, and real-time business reports
              </p>
            </div>
          ) : (
            <div>
              {activeTab === "OVERVIEW" && (
                <OverviewTab
                  stats={stats}
                  hotelsCount={hotels.length}
                  usersCount={users.length}
                  packagesCount={packages.length}
                  bookings={bookings}
                  onSelectTab={setActiveTab}
                />
              )}

              {activeTab === "AGGREGATIONS" && (
                <AggregationsTab
                  monthlyRevenue={monthlyRevenue}
                  popularDestinations={popularDestinations}
                />
              )}

              {activeTab === "HOTELS" && (
                <HotelsTab
                  hotels={hotels}
                  onRefresh={() => loadData(true)}
                  searchQuery={searchQuery}
                  onSelectHotelForRooms={handleSelectHotelForRooms}
                />
              )}

              {activeTab === "ROOMS" && (
                <RoomsTab
                  hotels={hotels}
                  initialHotelId={selectedHotelForRooms}
                />
              )}

              {activeTab === "PACKAGES" && (
                <PackagesTab
                  packages={packages}
                  bookings={bookings}
                  onRefresh={() => loadData(true)}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === "BOOKINGS" && (
                <BookingsTab
                  bookings={bookings}
                  onRefresh={() => loadData(true)}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === "USERS" && (
                <UsersTab
                  users={users}
                  onRefresh={() => loadData(true)}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === "COUPONS" && (
                <CouponsTab
                  coupons={coupons}
                  onRefresh={() => loadData(true)}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === "ENQUIRIES" && (
                <EnquiriesTab
                  searchQuery={searchQuery}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
