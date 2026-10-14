import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { hotelApi } from "../../api";
import HotelCard from "../../components/hotels/HotelCard";
import { Search, Loader2 } from "lucide-react";

const CITIES = ["All", "Goa", "Manali", "Jaipur", "Kerala", "Udaipur"];

const HOTEL_TYPES = [
  { label: "All Types", value: "" },
  { label: "Hotels", value: "HOTEL" },
  { label: "Resorts", value: "RESORT" },
  { label: "Villas", value: "VILLA" },
  { label: "Homestays", value: "HOMESTAY" },
];

export default function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [hotelType, setHotelType] = useState(searchParams.get("hotelType") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "popular");

  useEffect(() => {
    fetchHotels();
  }, [searchParams]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams.entries());
      const res = await hotelApi.getAll(params);
      setHotels(res.data || []);
    } catch (err) {
      console.error("Fetch hotels error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set("search", searchTerm);
    if (city) newParams.set("city", city);
    if (hotelType) newParams.set("hotelType", hotelType);
    if (sort) newParams.set("sort", sort);
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCity("");
    setHotelType("");
    setSort("popular");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Explore Hotels, Resorts & Boutique Stays
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare verified properties with real traveler reviews and instant booking confirmation.
          </p>
        </div>

        <form
          onSubmit={handleApplyFilter}
          className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
        >
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Property or Location
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Hotel name, city, locality..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value === "All" ? "" : e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
            >
              {CITIES.map((c) => (
                <option key={c} value={c === "All" ? "" : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Property Type
            </label>
            <select
              value={hotelType}
              onChange={(e) => setHotelType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
            >
              {HOTEL_TYPES.map((t) => (
                <option key={t.label} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
            >
              <option value="popular">Most Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition"
            >
              Reset
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500 font-medium">Finding available hotels...</p>
          </div>
        ) : hotels.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No hotels found</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try adjusting your search filters or clearing city selections to see more results.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span>Showing {hotels.length} verified properties</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
