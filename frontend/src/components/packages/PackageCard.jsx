import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, Heart, CheckCircle2 } from "lucide-react";
import RatingStars from "../common/RatingStars";
import { wishlistApi } from "../../api";
import { useSelector } from "react-redux";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";

export default function PackageCard({ pkg }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const mainImage = pkg.photos?.[0] || FALLBACK_IMAGE;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert("Please login to save items to your wishlist.");
      return;
    }
    try {
      await wishlistApi.toggle(pkg._id, "TRIP");
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={mainImage}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[11px] font-bold text-indigo-700 shadow-sm uppercase tracking-wide">
            {pkg.packageType || "HOLIDAY"}
          </span>

          <button
            onClick={handleWishlistToggle}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition backdrop-blur-md ${
              isWishlisted
                ? "bg-rose-500 text-white"
                : "bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500"
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {pkg.durationDays} Days / {pkg.durationNights || pkg.durationDays - 1} Nights
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <RatingStars
              rating={pkg.ratingsAverage || 4.7}
              count={pkg.ratingsQuantity || 18}
            />
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              {pkg.destination}
            </span>
          </div>

          <h3 className="font-cinzel font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#A8813C] transition mb-1">
            {pkg.title}
          </h3>

          <p className="text-xs text-slate-500 font-serif line-clamp-2 mb-3 leading-relaxed">
            {pkg.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {(pkg.inclusions || ["Guided Tour", "Daily Breakfast", "Resort Stay"])
              .slice(0, 3)
              .map((inc, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-700 bg-[#FAF7F2] border border-[#C59D5F]/20 px-2 py-0.5 rounded-md font-medium"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#C59D5F]" />
                  {inc}
                </span>
              ))}
          </div>
        </div>

        <div className="pt-3 border-t border-[#C59D5F]/15 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block font-cinzel">
              Starting from
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-cinzel font-bold text-slate-900">
                ₹{pkg.pricePerPerson?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-medium font-serif">/ person</span>
            </div>
          </div>

          <Link
            to={`/packages/${pkg._id}`}
            className="px-3.5 py-1.5 bg-[#C59D5F] hover:bg-[#D4AF37] text-[#0B1325] rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider transition flex items-center gap-1 shadow-2xs"
          >
            View Itinerary
          </Link>
        </div>
      </div>
    </div>
  );
}
