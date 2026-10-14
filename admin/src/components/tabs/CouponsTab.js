"use client";

import React, { useState } from "react";
import { couponApi } from "../../lib/api";
import { useToast } from "../Toast";
import { Plus, Tag, Trash2, Loader2, Copy, Check, Sparkles } from "lucide-react";

export default function CouponsTab({ coupons = [], onRefresh, searchQuery = "" }) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "FIXED",
    discountValue: 500,
    minBookingAmount: 2500,
  });

  const filtered = coupons.filter((c) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (c.code || "").toLowerCase().includes(term);
  });

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        code: newCoupon.code.trim().toUpperCase(),
        type: newCoupon.discountType,
        discountType: newCoupon.discountType,
        value: Number(newCoupon.discountValue),
        discountValue: Number(newCoupon.discountValue),
        minAmount: Number(newCoupon.minBookingAmount || 0),
        minBookingAmount: Number(newCoupon.minBookingAmount || 0),
        maxDiscount: 10000,
        expiry: new Date(Date.now() + 180 * 86400000).toISOString(),
        isActive: true,
      };

      await couponApi.create(payload);
      showToast(`Coupon ${payload.code} created successfully!`, "success");
      setNewCoupon({
        code: "",
        discountType: "FIXED",
        discountValue: 500,
        minBookingAmount: 2500,
      });
      onRefresh();
    } catch (err) {
      showToast("Create coupon error: " + (err?.message || err), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      await couponApi.delete(id);
      showToast("Coupon removed.", "info");
      onRefresh();
    } catch (err) {
      showToast("Delete coupon error: " + (err?.message || err), "error");
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Copied ${code} to clipboard!`, "success");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Promotional Coupons & Discounts</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate campaign discount codes for hotel stays and holiday travel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 text-[#5B30D9] flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Create Promo Coupon</h3>
              <p className="text-[11px] text-slate-500">Set discount percentage or flat reduction</p>
            </div>
          </div>

          <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Coupon Code</label>
              <input
                type="text"
                required
                placeholder="e.g. SUMMER2026"
                value={newCoupon.code}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })
                }
                className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl font-mono uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/20 focus:border-[#5B30D9] transition font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Mechanism</label>
              <select
                value={newCoupon.discountType}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, discountType: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-[#5B30D9] font-bold focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/20 focus:border-[#5B30D9] transition"
              >
                <option value="FIXED">Flat Reduction (₹ Fixed Amount)</option>
                <option value="PERCENTAGE">Percentage (% Off Order)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Discount Value</label>
              <input
                type="number"
                required
                value={newCoupon.discountValue}
                onChange={(e) =>
                  setNewCoupon({
                    ...newCoupon,
                    discountValue: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/20 focus:border-[#5B30D9] transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Spend Threshold (₹)
              </label>
              <input
                type="number"
                value={newCoupon.minBookingAmount}
                onChange={(e) =>
                  setNewCoupon({
                    ...newCoupon,
                    minBookingAmount: Number(e.target.value),
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/20 focus:border-[#5B30D9] transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#5B30D9] hover:bg-[#4C24B8] text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 mt-1 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish Promo Code</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#5B30D9]" />
              Active Discount Coupons ({coupons.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered && filtered.length > 0 ? (
              filtered.map((c) => (
                <div
                  key={c._id}
                  className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/80 flex items-center justify-between hover:border-[#5B30D9]/40 hover:bg-white hover:shadow-xs transition group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#5B30D9] px-2 py-0.5 bg-purple-50 rounded-md border border-purple-100 tracking-wider">
                        {c.code}
                      </span>
                      <button
                        onClick={() => handleCopy(c.code)}
                        className="text-slate-400 hover:text-slate-700 transition"
                        title="Copy coupon code"
                      >
                        {copiedCode === c.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span className="text-xs font-semibold text-slate-800 block mt-1.5">
                      {(c.type || c.discountType) === "PERCENTAGE"
                        ? `${c.value || c.discountValue}% OFF Total`
                        : `₹${c.value || c.discountValue} Flat Reduction`}
                    </span>

                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Min Order: ₹{(c.minAmount || c.minBookingAmount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                      ACTIVE
                    </span>
                    <button
                      onClick={() => handleDeleteCoupon(c._id, c.code)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-10 text-center text-slate-400">
                <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium">No active promotional coupons. Use the builder on the left to create one.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
