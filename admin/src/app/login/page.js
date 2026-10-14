"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/authContext";
import { authApi } from "../../lib/api";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await authApi.getAdminSetupStatus();
        const data = res.data || res;
        if (data && data.hasSuperAdmin === false) {
          setSetupRequired(true);
        }
      } catch (e) {
        // ignore setup check failure
      }
    }
    checkSetup();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push("/");
    } catch (err) {
      setErrorMessage(typeof err === "string" ? err : err.message || "Failed to sign in");
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
            Admin Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            TripNest Administration Portal • Next.js
          </p>
        </div>

        {setupRequired && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#5B30D9] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#5B30D9] mb-0.5">Initial Setup Required</p>
              <p className="text-slate-600">
                No Super Admin account has been configured yet. Create your administrator account to get started.
              </p>
              <Link
                href="/register"
                className="inline-block mt-2 font-bold text-[#5B30D9] hover:underline"
              >
                Set Up Super Admin Account &rarr;
              </Link>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tripnest.com"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/20 focus:border-[#5B30D9] font-medium text-slate-900 placeholder-slate-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B30D9]/20 focus:border-[#5B30D9] font-medium text-slate-900 placeholder-slate-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#5B30D9] hover:bg-[#4C24B8] text-white font-bold text-sm rounded-xl shadow-md shadow-[#5B30D9]/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Need to register or set up an Admin account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#5B30D9] hover:underline"
            >
              Create Admin Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
