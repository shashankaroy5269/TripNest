import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../../redux/slices/authSlice";
import { authApi } from "../../api";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setUnverifiedEmail("");
    setResendStatus("");
    setIsSubmitting(true);

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      const from = location.state?.from?.pathname || "/";
      navigate(from);
    } catch (err) {
      let errStr = "Invalid credentials";
      if (typeof err === "string") {
        errStr = err;
      } else if (err && err.message) {
        errStr = err.message;
      }

      setErrorMessage(errStr);

      if (errStr.toLowerCase().includes("verify your email")) {
        setUnverifiedEmail(email);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResendStatus("Sending...");
      await authApi.resendVerification(unverifiedEmail);
      setResendStatus("Verification email sent! Please check your inbox.");
    } catch (err) {
      setResendStatus("Failed to resend: " + (err || "Please try again"));
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#0A1222] overflow-hidden">
      {/* Background Golden Hour Palace Panorama */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2400&q=85"
          alt="Palace Heritage Sunset"
          className="w-full h-full object-cover filter brightness-[0.45] contrast-[1.1] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1222] via-[#0A1222]/40 to-black/70" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-7 bg-[#0E182D]/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-2xl border border-[#C59D5F]/35 text-white">
        {/* Brand Monogram Emblem & Heading */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
            <div className="w-11 h-11 rounded-full border border-[#C59D5F] bg-[#162238] flex items-center justify-center text-[#C59D5F] shadow-sm group-hover:scale-105 transition transform">
              <span className="font-serif italic font-bold text-2xl leading-none">T</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-cinzel font-bold tracking-[0.2em] text-[#FBF8F2] group-hover:text-[#C59D5F] transition">
                TRIPNEST <span className="text-[#C59D5F]">ESCAPES</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#C59D5F]/80 -mt-0.5 font-sans">
                Journeys Beyond Ordinary
              </span>
            </div>
          </Link>

          <h2 className="text-2xl font-cinzel font-bold text-[#FBF8F2] tracking-wide">
            Customer Sign In
          </h2>
          <p className="text-xs text-slate-300 font-serif mt-1">
            Access your palace reservations, 10-day expeditions, and saved journeys.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <span>{errorMessage}</span>
              {unverifiedEmail && (
                <div className="mt-2 pt-2 border-t border-rose-500/30">
                  <p className="text-[11px] text-rose-300 mb-1">
                    Haven't verified your email yet?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-xs font-bold text-[#C59D5F] hover:underline"
                  >
                    Resend Verification Link
                  </button>
                  {resendStatus && (
                    <p className="text-[11px] text-slate-200 mt-1 font-semibold">
                      {resendStatus}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-cinzel font-bold text-[#C59D5F] uppercase tracking-widest mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#C59D5F] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@example.com"
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-[#C59D5F] font-medium text-white placeholder-slate-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-cinzel font-bold text-[#C59D5F] uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#C59D5F] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-[#C59D5F] font-medium text-white placeholder-slate-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#C59D5F] hover:bg-[#D4AF37] text-[#0B1325] font-cinzel font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#C59D5F]/20 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer transform hover:scale-[1.01]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Escapes</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/10">
          <p className="text-xs text-slate-400">
            Don’t have an account yet?{" "}
            <Link
              to="/register"
              className="font-bold text-[#C59D5F] hover:underline"
            >
              Create Account &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
