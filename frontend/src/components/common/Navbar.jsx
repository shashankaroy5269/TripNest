import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import {
  Compass,
  Hotel,
  Calendar,
  Heart,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Luggage,
} from "lucide-react";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const getDashboardLink = () => {
    return "/my-bookings";
  };

  const getDashboardLabel = () => {
    return "My Bookings & Invoices";
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B1325]/90 backdrop-blur-md border-b border-[#C59D5F]/20 text-white transition-all shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border border-[#C59D5F] bg-[#162238] flex items-center justify-center text-[#C59D5F] shadow-sm group-hover:scale-105 transition transform">
              <span className="font-serif italic font-bold text-xl leading-none">T</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-cinzel font-bold tracking-[0.2em] text-[#FBF8F2] group-hover:text-[#C59D5F] transition">
                TRIPNEST <span className="text-[#C59D5F]">ESCAPES</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#C59D5F]/80 -mt-0.5 font-sans">
                Journeys Beyond Ordinary
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-[0.15em] font-medium text-slate-300">
            <a href="/#about" className="hover:text-[#C59D5F] transition">
              About
            </a>
            <a href="/#itinerary" className="hover:text-[#C59D5F] transition">
              Itinerary
            </a>
            <Link
              to="/hotels"
              className={`hover:text-[#C59D5F] transition ${
                location.pathname.startsWith("/hotels") ? "text-[#C59D5F] font-bold" : ""
              }`}
            >
              Hotels & Stays
            </Link>
            <Link
              to="/packages"
              className={`hover:text-[#C59D5F] transition ${
                location.pathname.startsWith("/packages") ? "text-[#C59D5F] font-bold" : ""
              }`}
            >
              Tour Packages
            </Link>
            <a href="/#included" className="hover:text-[#C59D5F] transition">
              Included
            </a>
            <a href="/#inquiry" className="hover:text-[#C59D5F] transition">
              Contact
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#C59D5F]/40 bg-[#162238]/80 hover:border-[#C59D5F] transition"
                >
                  <div className="text-left">
                    <div className="text-xs font-semibold text-[#FBF8F2] line-clamp-1">
                      {user?.name}
                    </div>
                    <div className="text-[9px] font-bold text-[#C59D5F] uppercase tracking-wider">
                      {user?.role?.replace("_", " ")}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#C59D5F] text-[#0B1325] flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#0E182D] rounded-2xl shadow-2xl border border-[#C59D5F]/30 py-2 z-50 animate-fadeIn text-slate-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-[11px] text-slate-400 font-medium">Signed in as</p>
                      <p className="text-xs font-bold text-white truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/my-bookings"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium hover:bg-[#C59D5F]/15 hover:text-[#C59D5F] transition"
                    >
                      <Calendar className="w-4 h-4 text-[#C59D5F]" />
                      My Bookings & Invoices
                    </Link>

                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium hover:bg-[#C59D5F]/15 hover:text-[#C59D5F] transition"
                    >
                      <Heart className="w-4 h-4 text-rose-400" />
                      Saved Wishlist
                    </Link>

                    <div className="border-t border-white/10 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs uppercase tracking-wider font-semibold text-slate-300 hover:text-[#C59D5F] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/packages"
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0B1325] bg-[#C59D5F] hover:bg-[#D4AF37] rounded-lg shadow-md shadow-[#C59D5F]/20 transition flex items-center gap-1.5 transform hover:scale-[1.02]"
                >
                  <span>Book Now</span>
                  <span className="text-sm">&rarr;</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-[#C59D5F] rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#C59D5F]/20 bg-[#0B1325] px-5 pt-4 pb-6 space-y-3 text-sm">
          <a
            href="/#about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-[#C59D5F]"
          >
            About The Tour
          </a>
          <a
            href="/#itinerary"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-[#C59D5F]"
          >
            10-Day Itinerary
          </a>
          <Link
            to="/hotels"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-slate-300 hover:text-[#C59D5F]"
          >
            <Hotel className="w-4 h-4 text-[#C59D5F]" />
            Hotels & Stays
          </Link>
          <Link
            to="/packages"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-slate-300 hover:text-[#C59D5F]"
          >
            <Luggage className="w-4 h-4 text-[#C59D5F]" />
            Tour Packages
          </Link>
          <a
            href="/#included"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-[#C59D5F]"
          >
            What's Included
          </a>
          <a
            href="/#inquiry"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-[#C59D5F]"
          >
            Contact & Plan Journey
          </a>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <Link
                to="/my-bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-[#C59D5F]"
              >
                <Calendar className="w-4 h-4" />
                My Bookings & Invoices
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 py-2 text-rose-400"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user?.name})
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs uppercase tracking-wider font-bold border border-[#C59D5F]/40 rounded-lg text-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/packages"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs uppercase tracking-wider font-bold bg-[#C59D5F] text-[#0B1325] rounded-lg shadow-sm"
              >
                Book Now &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
