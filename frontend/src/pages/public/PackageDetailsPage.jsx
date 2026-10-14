import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { packageApi } from "../../api";
import { setBookingDraft } from "../../redux/slices/bookingSlice";
import RatingStars from "../../components/common/RatingStars";
import {
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Share2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const DEFAULT_PHOTOS = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
];

const DEFAULT_INCLUSIONS = [
  "3-4 Star Certified Accommodation",
  "Daily Gourmet Breakfast & Dinner",
  "AC Private Cab for Transfers",
  "Entry Tickets to Heritage Sights",
  "English / Hindi Speaking Tour Guide",
];

const DEFAULT_EXCLUSIONS = [
  "Personal shopping & beverages",
  "Airfare / Train tickets to destination",
  "Optional adventure sport fees",
  "Personal travel insurance",
];

export default function PackageDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  const [travelersCount, setTravelersCount] = useState(2);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    async function loadPackage() {
      try {
        setLoading(true);
        const res = await packageApi.getById(id);
        const p = res.data;
        setPkg(p);
        if (p?.departureDates && p.departureDates.length > 0) {
          const raw = p.departureDates[0];
          const dateVal = typeof raw === "string" ? raw : (raw?.startDate || raw);
          const parsed = new Date(dateVal);
          const firstDate = !isNaN(parsed.getTime())
            ? parsed.toISOString().split("T")[0]
            : new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0];
          setSelectedDate(firstDate);
        } else {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          setSelectedDate(d.toISOString().split("T")[0]);
        }
      } catch (err) {
        console.error("Load package error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPackage();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-slate-500 font-medium">Loading holiday itinerary...</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Package not found</h2>
        <button
          onClick={() => navigate("/packages")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm"
        >
          Back to Packages
        </button>
      </div>
    );
  }

  const durationDays = pkg.durationDays || pkg.duration?.days || 4;
  const durationNights = pkg.durationNights || pkg.duration?.nights || Math.max(0, durationDays - 1);
  const pricePerPerson = pkg.pricePerPerson || pkg.startingPrice || 15000;
  const subtotal = pricePerPerson * travelersCount;
  const estimatedTax = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + estimatedTax;

  const totalDays = durationDays;
  const displayItinerary =
    pkg.itinerary && pkg.itinerary.length > 0
      ? pkg.itinerary
      : Array.from({ length: totalDays }, (_, i) => {
          const dayNum = i + 1;
          const dest = pkg.destination || "Destination";
          if (dayNum === 1) {
            return {
              dayNumber: 1,
              title: `Arrival in ${dest} & Welcome Reception`,
              description: `Airport / Station pickup and check-in to your certified hotel in ${dest}. Relax, explore the surroundings, and enjoy a curated welcome dinner.`,
              meals: ["Welcome Dinner"],
              sightseeing: ["Hotel check-in", "Sunset stroll", "Welcome refreshments"],
            };
          } else if (dayNum === totalDays) {
            return {
              dayNumber: dayNum,
              title: `Farewell ${dest} & Departure`,
              description: `Savor breakfast at the hotel, complete check-out formalities, and enjoy a comfortable private transfer for your onward journey.`,
              meals: ["Breakfast"],
              sightseeing: ["Souvenir shopping", "Departure transfer"],
            };
          } else {
            return {
              dayNumber: dayNum,
              title: `Day ${dayNum}: ${dest} Guided Sightseeing & Exploration`,
              description: `Full day guided tour covering iconic local landmarks, scenic viewpoints, regional markets, and cultural highlights of ${dest}.`,
              meals: ["Breakfast", "Dinner"],
              sightseeing: [`Highlights of ${dest}`, "Scenic viewpoint", "Cultural exploration"],
            };
          }
        });

  const photos =
    pkg.photos && pkg.photos.length > 0
      ? pkg.photos
      : pkg.images && pkg.images.length > 0
      ? pkg.images.map((img) => (typeof img === "string" ? img : img.url))
      : DEFAULT_PHOTOS;

  const handleBookPackage = () => {
    if (!isAuthenticated) {
      alert("Please sign in or create an account to book your holiday package.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    if (!selectedDate) {
      alert("Please select a travel departure date.");
      return;
    }

    dispatch(
      setBookingDraft({
        bookingType: "TRIP",
        packageData: {
          _id: pkg._id,
          title: pkg.title,
          destination: pkg.destination,
          photos: photos,
          durationDays: durationDays,
          pricePerPerson,
        },
        travelDate: selectedDate,
        travelersCount,
        guestCount: travelersCount,
        basePrice: subtotal,
        taxAmount: estimatedTax,
        discountAmount: 0,
        finalPrice: totalAmount,
        appliedCoupon: null,
      })
    );

    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
                {pkg.packageType || "HOLIDAY"}
              </span>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {durationDays} Days / {durationNights} Nights
              </span>
              <RatingStars
                rating={pkg.ratingsAverage || 4.7}
                count={pkg.ratingsQuantity || 18}
                size="md"
              />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
              {pkg.title}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>{pkg.destination}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert("Trip link copied to clipboard!");
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 transition"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden shadow-sm mb-10 relative">
          <img
            src={photos[0]}
            alt={pkg.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white max-w-xl">
            <p className="text-lg font-bold drop-shadow">
              Handcrafted Experience in {pkg.destination}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Tour Overview
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {pkg.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Day-by-Day Itinerary
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Your carefully sequenced travel schedule designed for relaxation and discovery.
              </p>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-200">
                {displayItinerary.map((day, idx) => {
                  const dayNum = day.dayNumber || idx + 1;
                  const meals = Array.isArray(day.meals)
                    ? day.meals
                    : typeof day.meals === "string"
                    ? [day.meals]
                    : day.mealIncluded
                    ? ["Meals Included"]
                    : [];
                  const sightseeing = Array.isArray(day.sightseeing)
                    ? day.sightseeing
                    : typeof day.sightseeing === "string"
                    ? [day.sightseeing]
                    : [];

                  return (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-300">
                        {dayNum}
                      </div>

                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 hover:border-indigo-200 transition-colors shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                            Day {dayNum}
                          </span>
                          {meals.length > 0 && (
                            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                              🍽️ {meals.join(", ")}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-900 text-base mb-1.5">
                          {day.title}
                        </h4>

                        <p className="text-sm text-slate-600 leading-relaxed mb-3">
                          {day.description}
                        </p>

                        {sightseeing.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                              Highlights:
                            </span>
                            {sightseeing.map((item, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-xs bg-white text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 shadow-xs"
                              >
                                <MapPin className="w-3 h-3 text-indigo-500" />
                                {item}
                              </span>
                            ))}
                          </div>
                        )}

                        {(day.hotelInfo || day.transportation) && (
                          <div className="mt-2.5 text-xs text-slate-500 flex flex-wrap gap-4 pt-2 border-t border-dashed border-slate-200">
                            {day.hotelInfo && (
                              <span>🏨 Stay: <strong className="text-slate-700">{day.hotelInfo}</strong></span>
                            )}
                            {day.transportation && (
                              <span>🚗 Transfer: <strong className="text-slate-700">{day.transportation}</strong></span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What’s Included
                </h3>
                <ul className="space-y-2">
                  {(pkg.inclusions || DEFAULT_INCLUSIONS).map((inc, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-700 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  What’s Excluded
                </h3>
                <ul className="space-y-2">
                  {(pkg.exclusions || DEFAULT_EXCLUSIONS).map((exc, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-500 flex items-start gap-2"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Starting Price
                </span>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black text-slate-900">
                      ₹{pricePerPerson.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium"> / traveler</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                    All-Inclusive
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Departure Date
                </label>
                {pkg.departureDates && pkg.departureDates.length > 0 ? (
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    {pkg.departureDates.map((d, idx) => {
                      const raw = typeof d === "string" ? d : (d?.startDate || d);
                      const parsed = new Date(raw);
                      const isValid = !isNaN(parsed.getTime());
                      const dtStr = isValid ? parsed.toISOString().split("T")[0] : "";
                      const displayDate = isValid
                        ? parsed.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : `Departure Date #${idx + 1}`;
                      const seats = typeof d === "object" && d?.availableSeats !== undefined
                        ? d.availableSeats
                        : pkg.availableSeats || 10;
                      return (
                        <option key={idx} value={dtStr}>
                          {displayDate} ({seats} seats left)
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Travelers / Guests
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTravelersCount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                        travelersCount === num
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>
                    ₹{pricePerPerson.toLocaleString()} × {travelersCount} traveler{travelersCount > 1 ? "s" : ""}
                  </span>
                  <span className="font-semibold text-slate-800">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Service Charge (5%)</span>
                  <span className="font-semibold text-slate-800">
                    ₹{estimatedTax.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-indigo-600">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleBookPackage}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-600/30 transition transform active:scale-95 text-sm"
              >
                Book This Holiday
              </button>

              <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Refund guaranteed if cancelled 7+ days prior</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
