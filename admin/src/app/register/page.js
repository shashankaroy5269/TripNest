"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/authContext";
import { authApi } from "../../lib/api";
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  Key,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function AdminRegisterPage() {
  const router = useRouter();
  const { registerAdmin, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "SUPER_ADMIN",
    adminSecret: "",
  });

  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await authApi.getAdminSetupStatus();
        const data = res.data || res;
        if (data && data.hasSuperAdmin === false) {
          setIsFirstAdmin(true);
        }
      } catch (e) {
        // ignore
      }
    }
    checkSetup();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await registerAdmin(formData);
      setSuccessMessage("Admin account created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err) {
      setErrorMessage(typeof err === "string" ? err : err.message || "Failed to create admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FC] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200/80 text-slate-800">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#5B30D9] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-[#5B30D9]/25">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Create Admin Account
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            TripNest Administration Setup • Next.js
          </p>
        </div>

        {isFirstAdmin && (
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
            <span className="font-bold text-[#5B30D9] block mb-0.5">🚀 Initial Setup Mode:</span>
            No Super Admin currently exists in the database. You are creating the primary Super Administrator account.
          </div>
        )}

        {successMessage ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-sm text-slate-900">{successMessage}</p>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Roy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B30D9]/20 focus:border-[#5B30D9] font-medium text-slate-900 placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="admin@tripnest.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B30D9]/20 focus:border-[#5B30D9] font-medium text-slate-900 placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B30D9]/20 focus:border-[#5B30D9] font-medium text-slate-900 placeholder-slate-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Admin Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B30D9]/20 focus:border-[#5B30D9] font-bold text-[#5B30D9] transition"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Platform)</option>
                    <option value="HOTEL_ADMIN">HOTEL_ADMIN (Properties)</option>
                    <option value="TRIP_MANAGER">TRIP_MANAGER (Tours)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B30D9]/20 focus:border-[#5B30D9] font-medium text-slate-900 placeholder-slate-400 transition"
                  />
                </div>
              </div>

              {!isFirstAdmin && (
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Admin Secret Key
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      placeholder="Enter Admin Secret key"
                      value={formData.adminSecret}
                      onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5B30D9]/20 focus:border-[#5B30D9] font-medium text-slate-900 placeholder-slate-400 transition"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#5B30D9] hover:bg-[#4C24B8] text-white font-bold text-sm rounded-xl shadow-md shadow-[#5B30D9]/20 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Create & Access Admin Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Already have an admin account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#5B30D9] hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
