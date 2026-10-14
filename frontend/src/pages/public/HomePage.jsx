import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Hotel,
  Luggage,
  Calendar,
  MapPin,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Percent,
  ChevronRight,
  Compass,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  Car,
  Heart,
  Copy,
  Check,
  Send,
  Loader2,
  Utensils,
  MessageCircle,
  PhoneCall,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { hotelApi, packageApi, inquiryApi } from "../../api";
import HotelCard from "../../components/hotels/HotelCard";
import PackageCard from "../../components/packages/PackageCard";

// Destination Cards Preview Strip (Directly matching reference image)
const HERO_DESTINATIONS = [
  {
    name: "Jaipur",
    tagline: "ROYAL HERITAGE",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    cityQuery: "Jaipur",
  },
  {
    name: "Varanasi",
    tagline: "SPIRITUAL SOUL",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    cityQuery: "Varanasi",
  },
  {
    name: "Kerala",
    tagline: "SERENE ESCAPES",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    cityQuery: "Kerala",
  },
  {
    name: "Himachal",
    tagline: "MAJESTIC HILLS",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    cityQuery: "Manali",
  },
];

// Interactive 10-Day Journey Roadmap (Matching reference image)
const JOURNEY_DAYS = [
  {
    days: "Days 1 – 3",
    destination: "Jaipur",
    subtitle: "Palaces, forts and a royal welcome",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
    highlights: ["Amer Fort Private Safari", "Hawa Mahal Jharokha Tour", "Royal Rajput Dinner"],
  },
  {
    days: "Days 4 – 6",
    destination: "Varanasi",
    subtitle: "Sacred rituals, ancient wisdom",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80",
    highlights: ["Sunrise Ganga Boat Aarti", "Kashi Vishwanath Corridor", "Weavers Silk Trail"],
  },
  {
    days: "Days 7 – 8",
    destination: "Kerala",
    subtitle: "Backwaters, beaches and calm",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80",
    highlights: ["Private Houseboat Cruise", "Ayurvedic Herbal Therapy", "Sunset Spice Plantation"],
  },
  {
    days: "Days 9 – 10",
    destination: "Himachal",
    subtitle: "Mountains, nature and fresh perspectives",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80",
    highlights: ["Solang Valley Alpine Views", "Atal Tunnel Expedition", "Pine Forest Bonfire Night"],
  },
];

// What's Included Features
const INCLUDED_FEATURES = [
  {
    icon: Users,
    title: "Expert Guides",
    desc: "Friendly, knowledgeable local historians and cultural guides.",
  },
  {
    icon: Hotel,
    title: "Premium Stays",
    desc: "Handpicked 5-star heritage palaces and luxury boutique resorts.",
  },
  {
    icon: Car,
    title: "All Transfers",
    desc: "Comfortable, private chauffeur-driven luxury vehicle throughout.",
  },
  {
    icon: Utensils,
    title: "Local Experiences",
    desc: "Curated royal culinary trails, folk music, and private ceremonies.",
  },
];

const PROMO_COUPONS = [
  { code: "WELCOME500", desc: "₹500 OFF (Min ₹2,500)" },
  { code: "TRIPNEST10", desc: "10% OFF up to ₹2,000" },
  { code: "SUMMER2026", desc: "15% OFF up to ₹3,000" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("HOTELS");
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(2);

  // Live API States
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Inquiry Form State
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        const [hotelsRes, packagesRes] = await Promise.all([
          hotelApi.getAll({ limit: 4 }),
          packageApi.getAll({ limit: 4 }),
        ]);
        setFeaturedHotels(hotelsRes.data || []);
        setFeaturedPackages(packagesRes.data || []);
      } catch (err) {
        console.error("Home page data error:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === "HOTELS") {
      const params = new URLSearchParams();
      if (destination) params.append("search", destination);
      if (checkIn) params.append("checkIn", checkIn);
      if (checkOut) params.append("checkOut", checkOut);
      if (guestCount) params.append("guests", guestCount);
      navigate(`/hotels?${params.toString()}`);
    } else {
      const params = new URLSearchParams();
      if (destination) params.append("search", destination);
      navigate(`/packages?${params.toString()}`);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;
    try {
      setInquirySubmitting(true);
      await inquiryApi.create({
        name: inquiryName.trim(),
        phone: inquiryPhone.trim(),
        message: inquiryMessage.trim() || "Interested in India Escapes curated luxury tour.",
        destination: destination || "India Escapes",
      });
      setInquirySubmitted(true);
    } catch (err) {
      console.error("Inquiry submission error:", err);
      setInquirySubmitted(true);
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F2] text-slate-900 selection:bg-[#C59D5F] selection:text-[#0B1325]">
      {/* =========================================================================
          HERO SECTION: "EXPLORE INDIA" - Matches exact reference screenshot
          ========================================================================= */}
      <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#0A1222]">
        {/* Background Panoramic Photography with Golden Hour Fortress */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2400&q=85"
            alt="Amber Fort Amber Palace Sunrise"
            className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.08] scale-105 animate-subtleZoom"
          />
          {/* Gradients to match the warm golden ambiance & deep shadows */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1325] via-[#0B1325]/30 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
          <div className="absolute inset-0 bg-[#C59D5F]/10 mix-blend-color-dodge" />
        </div>

        {/* Hero Top Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 w-full">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            {/* Left Big Regal Typography */}
            <div className="max-w-2xl text-left">
              <p className="text-xs sm:text-sm font-cinzel font-semibold tracking-[0.35em] text-[#C59D5F] uppercase mb-3 flex items-center gap-2">
                <span className="w-6 h-[1px] bg-[#C59D5F]" />
                Timeless Places. Meaningful Journeys.
              </p>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-cinzel font-black tracking-[0.08em] text-[#FBF8F2] uppercase leading-[0.95] drop-shadow-2xl">
                Explore <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBF8F2] via-[#E5C77A] to-[#C59D5F]">
                  India
                </span>
              </h1>
            </div>

            {/* Right Side Vertical Tagline (as seen in screenshot) */}
            <div className="hidden md:flex flex-col items-end text-right font-cinzel tracking-[0.3em] text-[11px] text-[#FBF8F2]/80 space-y-2 border-r border-[#C59D5F]/40 pr-4">
              <span>CULTURE</span>
              <span>PEOPLE</span>
              <span>PLACES</span>
              <span className="text-[#C59D5F] font-bold">A DEEPER YOU</span>
            </div>
          </div>
        </div>

        {/* Hero Bottom Strip: 4 Destination Cards + "Plan Your Trip" CTA */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full mt-12 md:mt-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            {/* 4 Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 flex-1">
              {HERO_DESTINATIONS.map((dest) => (
                <div
                  key={dest.name}
                  onClick={() => navigate(`/hotels?city=${dest.cityQuery}`)}
                  className="group relative h-40 sm:h-44 rounded-xl overflow-hidden border border-[#C59D5F]/30 hover:border-[#C59D5F] shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-cinzel font-bold text-base sm:text-lg text-[#FBF8F2] tracking-wider leading-tight">
                      {dest.name}
                    </h3>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#C59D5F] font-semibold mt-0.5">
                      {dest.tagline}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side Action: "A Journey Through A Billion Stories" */}
            <div className="lg:max-w-xs flex flex-col items-start lg:items-end justify-end text-left lg:text-right shrink-0">
              <p className="text-xs font-cinzel tracking-[0.25em] text-[#FBF8F2]/90 uppercase mb-2">
                A Journey Through <br />
                <span className="text-[#C59D5F] font-bold">A Billion Stories</span>
              </p>
              <a
                href="#itinerary"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C59D5F] hover:bg-[#D4AF37] text-[#0B1325] text-xs font-cinzel font-bold uppercase tracking-[0.15em] transition shadow-lg shadow-[#C59D5F]/20 transform hover:scale-105"
              >
                <span>Plan Your Trip</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>

          {/* Integrated Live Fast Booking / Search Bar */}
          <div className="mt-8 bg-[#0E182D]/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#C59D5F]/40 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-4 text-xs font-cinzel font-semibold tracking-wider">
              <button
                type="button"
                onClick={() => setActiveTab("HOTELS")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  activeTab === "HOTELS"
                    ? "bg-[#C59D5F] text-[#0B1325]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Hotel className="w-3.5 h-3.5" />
                <span>Palaces & Heritage Hotels</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PACKAGES")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  activeTab === "PACKAGES"
                    ? "bg-[#C59D5F] text-[#0B1325]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Luggage className="w-3.5 h-3.5" />
                <span>Curated Tour Packages</span>
              </button>
            </div>

            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold font-cinzel text-[#C59D5F] uppercase tracking-widest mb-1">
                  Destination / Royal Corridor
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#C59D5F] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Jaipur, Kerala, Manali..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#C59D5F] transition"
                  />
                </div>
              </div>

              {activeTab === "HOTELS" ? (
                <>
                  <div>
                    <label className="block text-[10px] font-bold font-cinzel text-[#C59D5F] uppercase tracking-widest mb-1">
                      Check-in Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-[#C59D5F] absolute left-3 top-3" />
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#C59D5F] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold font-cinzel text-[#C59D5F] uppercase tracking-widest mb-1">
                      Check-out Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-[#C59D5F] absolute left-3 top-3" />
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#C59D5F] transition"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold font-cinzel text-[#C59D5F] uppercase tracking-widest mb-1">
                    Theme / Experience Style
                  </label>
                  <div className="flex gap-2">
                    {["All", "Royal Heritage", "Spiritual", "Backwaters", "Alpine Snow"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDestination(t === "All" ? "" : t)}
                        className="px-2.5 py-1.5 text-[11px] bg-black/40 hover:bg-[#C59D5F]/20 border border-white/15 hover:border-[#C59D5F] rounded-lg text-slate-200 transition"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#C59D5F] hover:bg-[#D4AF37] text-[#0B1325] font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search {activeTab === "HOTELS" ? "Palaces" : "Expeditions"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: "OUR STORY / ABOUT THE TOUR" - Matches reference layout
          ========================================================================= */}
      <section id="about" className="py-20 bg-[#F9F6F0] relative overflow-hidden">
        {/* Subtle decorative mandala & ornamental background watermark */}
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-[#C59D5F]/20 opacity-30 pointer-events-none" />
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-[#C59D5F]/20 opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Story Column */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-cinzel font-bold tracking-[0.3em] text-[#C59D5F] uppercase block mb-1">
                  Our Story
                </span>
                <h2 className="text-3xl sm:text-5xl font-cinzel font-black tracking-tight text-slate-900 leading-tight">
                  ABOUT <br />
                  <span className="text-[#A8813C]">THE TOUR</span>
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-serif">
                India is not just a destination, it's an emotion. Our 10-day journey brings you the perfect blend of royal heritage, spiritual depth, natural beauty and local experiences — crafted for curious travellers like you.
              </p>

              {/* 4 Feature Badges (Curated Itineraries, Local Experts, Safe, Authentic) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-[#C59D5F]/30 shadow-xs flex flex-col items-center text-center">
                  <Compass className="w-5 h-5 text-[#C59D5F] mb-1.5" />
                  <span className="text-[11px] font-cinzel font-bold text-slate-800 tracking-wider">
                    Curated Itineraries
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#C59D5F]/30 shadow-xs flex flex-col items-center text-center">
                  <Users className="w-5 h-5 text-[#C59D5F] mb-1.5" />
                  <span className="text-[11px] font-cinzel font-bold text-slate-800 tracking-wider">
                    Local Experts
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#C59D5F]/30 shadow-xs flex flex-col items-center text-center">
                  <ShieldCheck className="w-5 h-5 text-[#C59D5F] mb-1.5" />
                  <span className="text-[11px] font-cinzel font-bold text-slate-800 tracking-wider">
                    Safe & Hassle-Free
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#C59D5F]/30 shadow-xs flex flex-col items-center text-center">
                  <Heart className="w-5 h-5 text-[#C59D5F] mb-1.5" />
                  <span className="text-[11px] font-cinzel font-bold text-slate-800 tracking-wider">
                    Authentic Experiences
                  </span>
                </div>
              </div>
            </div>

            {/* Right Quote & Vintage Palace Imagery */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="p-4 bg-white rounded-2xl border border-[#C59D5F]/40 shadow-xl">
                  <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80"
                      alt="Udaipur Lake Palace & Rajasthan Heritage"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                  <blockquote className="font-playfair italic text-lg sm:text-xl text-[#0B1325] text-center font-bold">
                    “Different landscapes. <br />
                    <span className="text-[#A8813C]">One incredible India.”</span>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: "THE JOURNEY / 10 DAYS 4 INCREDIBLE DESTINATIONS"
          ========================================================================= */}
      <section id="itinerary" className="py-24 bg-[#0B1528] text-white relative overflow-hidden">
        {/* Architectural backdrop & subtle watermarks */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C59D5F_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Header & CTA */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-cinzel font-bold tracking-[0.3em] text-[#C59D5F] uppercase block mb-1">
                  The Journey
                </span>
                <h2 className="text-3xl sm:text-5xl font-cinzel font-black tracking-tight text-[#FBF8F2] leading-tight">
                  10 DAYS <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBF8F2] via-[#E5C77A] to-[#C59D5F]">
                    4 INCREDIBLE DESTINATIONS
                  </span>
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif">
                From royal palaces to sacred ghats, peaceful backwaters to snow-capped mountains — experience the many colours of India in one unforgettable journey.
              </p>

              <div>
                <Link
                  to="/packages"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C59D5F] hover:bg-[#D4AF37] text-[#0B1325] text-xs font-cinzel font-bold uppercase tracking-[0.15em] transition shadow-lg shadow-[#C59D5F]/20 transform hover:scale-105"
                >
                  <span>View Detailed Itinerary</span>
                  <span>&rarr;</span>
                </Link>
              </div>

              <div className="pt-4 font-playfair italic text-lg text-[#C59D5F]">
                Same Land, A Million Emotions
              </div>
            </div>

            {/* Right Interactive Day-Wise Roadmap Cards */}
            <div className="lg:col-span-7 relative">
              {/* Vertical connecting line */}
              <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-gradient-to-b from-[#C59D5F] via-[#C59D5F]/50 to-[#C59D5F]" />

              <div className="space-y-6">
                {JOURNEY_DAYS.map((step, idx) => (
                  <div
                    key={step.destination}
                    className="relative pl-14 group"
                  >
                    {/* Glowing timeline node */}
                    <div className="absolute left-4 top-4 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0B1528] border-2 border-[#C59D5F] flex items-center justify-center group-hover:scale-125 transition">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C59D5F]" />
                    </div>

                    {/* Step Card */}
                    <div className="bg-[#121F38]/90 rounded-2xl p-4 border border-[#C59D5F]/30 hover:border-[#C59D5F] transition flex flex-col sm:flex-row items-center gap-4 shadow-xl">
                      <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <img
                          src={step.image}
                          alt={step.destination}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-cinzel font-bold text-[#C59D5F] uppercase tracking-wider">
                            {step.days}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {idx === 0 ? "Rajasthan" : idx === 1 ? "Uttar Pradesh" : idx === 2 ? "South India" : "Himalayas"}
                          </span>
                        </div>
                        <h4 className="text-base font-cinzel font-bold text-[#FBF8F2] tracking-wide">
                          {step.destination}
                        </h4>
                        <p className="text-xs text-slate-300 font-serif line-clamp-1">
                          {step.subtitle}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <button
                          onClick={() => navigate(`/packages`)}
                          className="px-3 py-1.5 rounded-lg border border-[#C59D5F]/40 hover:border-[#C59D5F] text-[11px] font-cinzel text-[#C59D5F] hover:bg-[#C59D5F] hover:text-[#0B1325] transition"
                        >
                          Explore &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Vertical Signature */}
              <div className="hidden xl:block absolute -right-6 top-1/2 -translate-y-1/2 rotate-90 font-cinzel text-[10px] tracking-[0.3em] text-[#C59D5F]/70 uppercase">
                FOUR PLACES • A DEEPER YOU
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: "TRAVEL BETTER / WHAT'S INCLUDED"
          ========================================================================= */}
      <section id="included" className="py-20 bg-[#FBF8F2] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 border-b border-[#C59D5F]/20 pb-6">
            <div>
              <span className="text-xs font-cinzel font-bold tracking-[0.3em] text-[#C59D5F] uppercase block mb-1">
                Travel Better
              </span>
              <h2 className="text-3xl sm:text-4xl font-cinzel font-black tracking-tight text-slate-900">
                WHAT'S <span className="text-[#A8813C]">INCLUDED</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-cinzel tracking-wider text-slate-500 uppercase">
              Every detail taken care of, so you can just explore.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INCLUDED_FEATURES.map((feat) => {
              const IconComponent = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 bg-white rounded-2xl border border-[#C59D5F]/30 hover:border-[#C59D5F] shadow-sm hover:shadow-lg transition flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F5EFE6] border border-[#C59D5F]/40 text-[#A8813C] flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-cinzel font-bold text-sm text-slate-900 tracking-wider mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-serif">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center font-playfair italic text-lg text-[#A8813C]">
            Good People, Great Journey
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: LIVE BACKEND API INTEGRATIONS (Hotels, Packages, Coupons)
          ========================================================================= */}
      {/* Promo Coupons Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-[#121F38] rounded-2xl p-4 sm:p-5 text-white border border-[#C59D5F]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#C59D5F]/20 text-[#C59D5F] rounded-xl border border-[#C59D5F]/40">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-cinzel font-bold text-sm text-[#FBF8F2] tracking-wider">
                Exclusive Royal Promo Codes
              </h4>
              <p className="text-[11px] text-slate-300 font-serif">
                Apply codes at checkout for instant discounts on luxury suites and guided tours.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PROMO_COUPONS.map((c) => (
              <button
                key={c.code}
                onClick={() => handleCopyCode(c.code)}
                className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-[#C59D5F]/20 border border-[#C59D5F]/40 text-left transition flex items-center gap-2 group cursor-pointer"
                title="Click to copy coupon code"
              >
                <div>
                  <span className="font-mono font-bold text-xs text-[#E5C77A] tracking-wider block">
                    {c.code}
                  </span>
                  <span className="text-[9px] text-slate-300 block">{c.desc}</span>
                </div>
                {copiedCoupon === c.code ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#C59D5F] opacity-70 group-hover:opacity-100" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Live Featured Hotels / Palaces */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8 border-b border-[#C59D5F]/20 pb-4">
          <div>
            <span className="text-xs font-cinzel font-bold tracking-[0.25em] text-[#C59D5F] uppercase block mb-1">
              Handpicked Properties
            </span>
            <h2 className="text-2xl sm:text-3xl font-cinzel font-black tracking-tight text-slate-900">
              FEATURED LUXURY PALACES & STAYS
            </h2>
          </div>
          <Link
            to="/hotels"
            className="flex items-center gap-1 text-xs font-cinzel font-bold tracking-wider text-[#A8813C] hover:text-[#C59D5F] transition"
          >
            <span>View All Hotels</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingData ? (
          <div className="py-12 flex justify-center items-center text-[#C59D5F]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredHotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>

      {/* Live Featured Tour Packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 border-b border-[#C59D5F]/20 pb-4">
          <div>
            <span className="text-xs font-cinzel font-bold tracking-[0.25em] text-[#C59D5F] uppercase block mb-1">
              Curated Expeditions
            </span>
            <h2 className="text-2xl sm:text-3xl font-cinzel font-black tracking-tight text-slate-900">
              HANDCRAFTED HOLIDAY PACKAGES
            </h2>
          </div>
          <Link
            to="/packages"
            className="flex items-center gap-1 text-xs font-cinzel font-bold tracking-wider text-[#A8813C] hover:text-[#C59D5F] transition"
          >
            <span>View All Packages</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingData ? (
          <div className="py-12 flex justify-center items-center text-[#C59D5F]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPackages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 6: "LET'S PLAN YOUR JOURNEY / READY TO EXPLORE INDIA?"
          (Matches exact bottom inquiry section of the user screenshot)
          ========================================================================= */}
      <section id="inquiry" className="relative py-24 overflow-hidden bg-[#0A1222]">
        {/* Twilight Lake Palace / River Backdrop */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=85"
            alt="Lake Palace Twilight Sunset"
            className="w-full h-full object-cover filter brightness-[0.55] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/80" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Prompt */}
            <div className="lg:col-span-6 space-y-4 text-left text-white">
              <span className="text-xs font-cinzel font-bold tracking-[0.3em] text-[#C59D5F] uppercase block">
                Let's Plan Your Journey
              </span>
              <h2 className="text-4xl sm:text-6xl font-cinzel font-black tracking-tight leading-tight text-[#FBF8F2]">
                Ready to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBF8F2] via-[#E5C77A] to-[#C59D5F]">
                  Explore India?
                </span>
              </h2>
              <p className="text-sm text-slate-300 font-serif leading-relaxed max-w-md">
                Tell us a little about your travel plans, and our luxury travel specialists will curate a personalized royal itinerary tailored to your schedule.
              </p>
            </div>

            {/* Right Translucent Dark Glassmorphic Inquiry Form */}
            <div className="lg:col-span-6">
              <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl">
                {inquirySubmitted ? (
                  <div className="py-2 space-y-5 animate-fadeIn">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-[#C59D5F]/20 border border-[#C59D5F] flex items-center justify-center text-[#C59D5F] mx-auto mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-cinzel font-bold text-white tracking-wide">
                        Inquiry Received With Honor!
                      </h3>
                      <p className="text-xs text-slate-300 font-serif max-w-sm mx-auto leading-relaxed">
                        Our Royal Concierge Specialist will connect with you via WhatsApp or phone call within 2 hours.
                      </p>
                    </div>

                    {/* Instant Resolution Options (Immediate Assistance) */}
                    <div className="pt-2 border-t border-white/10 space-y-2.5">
                      <p className="text-[10px] font-cinzel font-bold uppercase tracking-[0.2em] text-[#C59D5F] text-center">
                        Need Instant Assistance? Solve It Now:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <a
                          href="https://wa.me/919876543210?text=Hello%20TripNest%20Concierge,%20I%20just%20submitted%20a%20travel%20inquiry%20and%20would%20like%20immediate%20details."
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-cinzel font-bold tracking-wider transition shadow-md shadow-emerald-900/30"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Chat on WhatsApp</span>
                        </a>

                        <a
                          href="tel:+919876543210"
                          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#FBF8F2] text-xs font-cinzel font-bold tracking-wider transition"
                        >
                          <PhoneCall className="w-4 h-4 text-[#C59D5F]" />
                          <span>Direct Call Helpline</span>
                        </a>
                      </div>
                    </div>

                    {/* Interactive Trip FAQ Accordion */}
                    <div className="pt-3 border-t border-white/10 space-y-2 text-left">
                      <p className="text-[10px] font-cinzel font-bold uppercase tracking-[0.15em] text-slate-400">
                        Quick Answers to Common Queries:
                      </p>

                      <div className="space-y-1.5 text-xs">
                        <div
                          onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
                          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 cursor-pointer transition"
                        >
                          <div className="flex items-center justify-between text-[#FBF8F2] font-semibold text-[11px]">
                            <span>Can I customize the destinations & days?</span>
                            {activeFaq === 1 ? <ChevronUp className="w-3.5 h-3.5 text-[#C59D5F]" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                          {activeFaq === 1 && (
                            <p className="text-[11px] text-slate-300 font-serif mt-2 pt-2 border-t border-white/10 leading-relaxed">
                              Yes! You can adjust days, add special palace excursions, upgrade room suites, and request dedicated private chauffeur SUVs.
                            </p>
                          )}
                        </div>

                        <div
                          onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
                          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 cursor-pointer transition"
                        >
                          <div className="flex items-center justify-between text-[#FBF8F2] font-semibold text-[11px]">
                            <span>What is the payment & cancellation policy?</span>
                            {activeFaq === 2 ? <ChevronUp className="w-3.5 h-3.5 text-[#C59D5F]" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                          {activeFaq === 2 && (
                            <p className="text-[11px] text-slate-300 font-serif mt-2 pt-2 border-t border-white/10 leading-relaxed">
                              Only 30% advance deposit is required to reserve dates. 100% full refund is provided if cancelled 7+ days before departure.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setInquirySubmitted(false);
                          setInquiryName("");
                          setInquiryPhone("");
                          setInquiryMessage("");
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-cinzel text-[#C59D5F] hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Submit Another Inquiry / Modify Details</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendInquiry} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#C59D5F] transition"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Phone Number / WhatsApp"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#C59D5F] transition"
                      />
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        placeholder="Tell us about your trip (Preferred destinations, traveler count, dates)..."
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#C59D5F] transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={inquirySubmitting}
                      className="w-full py-3.5 bg-[#C59D5F] hover:bg-[#D4AF37] text-[#0B1325] font-cinzel font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#C59D5F]/20 transition flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      {inquirySubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Send Inquiry</span>
                          <span>&rarr;</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
