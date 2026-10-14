import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { packageApi } from "../../api";
import PackageCard from "../../components/packages/PackageCard";
import { Search, Loader2 } from "lucide-react";

const PACKAGE_CATEGORIES = [
  { label: "All Themes", value: "" },
  { label: "Honeymoon", value: "HONEYMOON" },
  { label: "Adventure", value: "ADVENTURE" },
  { label: "Family", value: "FAMILY" },
  { label: "Beach", value: "BEACH" },
  { label: "Cultural & Heritage", value: "CULTURAL" },
  { label: "Wildlife", value: "WILDLIFE" },
];

export default function PackagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [packageType, setPackageType] = useState(searchParams.get("packageType") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  useEffect(() => {
    fetchPackages();
  }, [searchParams]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams.entries());
      const res = await packageApi.getAll(params);
      setPackages(res.data || []);
    } catch (err) {
      console.error("Fetch packages error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set("search", searchTerm);
    if (packageType) newParams.set("packageType", packageType);
    if (maxPrice) newParams.set("maxPrice", maxPrice);
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setPackageType("");
    setMaxPrice("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Handcrafted Holiday Packages & Escapes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            All-inclusive trips with day-by-day itineraries, comfortable stays, and local guidance.
          </p>
        </div>

        <form
          onSubmit={handleApplyFilter}
          className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Trip or Destination
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Goa, Manali, Kerala, Rajasthan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Holiday Theme
            </label>
            <select
              value={packageType}
              onChange={(e) => setPackageType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
            >
              {PACKAGE_CATEGORIES.map((c) => (
                <option key={c.label} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Max Budget (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 30000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
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
            <p className="text-sm text-slate-500 font-medium">Loading holiday packages...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">No packages found</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try changing your theme or budget filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
