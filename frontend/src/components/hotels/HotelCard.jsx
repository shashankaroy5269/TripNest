import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Heart, Award } from "lucide-react";
import RatingStars from "../common/RatingStars";
import { wishlistApi } from "../../api";
import { useSelector } from "react-redux";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

export default function HotelCard({ hotel }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const mainImage = hotel?.photos?.[0] || FALLBACK_IMAGE;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert("Please login to save items to your wishlist.");
      return;
    }
    try {
      await wishlistApi.toggle(hotel._id, "HOTEL");
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
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"></div>

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[11px] font-bold text-slate-800 shadow-sm uppercase tracking-wide">
            {hotel.hotelType || "HOTEL"}
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

        <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-xs font-semibold drop-shadow">
          <MapPin className="w-4 h-4 text-rose-400" />
          <span>
            {hotel.city}, {hotel.state}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <RatingStars
              rating={hotel.ratingsAverage || 4.5}
              count={hotel.ratingsQuantity || 12}
            />
            {hotel.starRating && (
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {hotel.starRating} Star
              </span>
            )}
          </div>

          <h3 className="font-cinzel font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#A8813C] transition mb-1">
            {hotel.name}
          </h3>

          <p className="text-xs text-slate-500 font-serif line-clamp-2 mb-3 leading-relaxed">
            {hotel.description ||
              "Experience world-class hospitality, deluxe bedding, high-speed Wi-Fi and scenic vistas."}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {(hotel.amenities || ["Free WiFi", "Swimming Pool", "Spa"])
              .slice(0, 3)
              .map((amenity, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-700 bg-[#FAF7F2] border border-[#C59D5F]/20 px-2 py-0.5 rounded-md"
                >
                  <Award className="w-3 h-3 text-[#C59D5F]" />
                  {amenity}
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
                ₹{(hotel.minPrice || 3500).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-medium font-serif">/ night</span>
            </div>
          </div>

          <Link
            to={`/hotels/${hotel._id}`}
            className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#C59D5F] border border-[#C59D5F]/30 text-[#8B6728] hover:text-[#0B1325] rounded-lg text-xs font-cinzel font-bold uppercase tracking-wider transition flex items-center gap-1 shadow-2xs"
          >
            Check Rooms
          </Link>
        </div>
      </div>
    </div>
  );
}
