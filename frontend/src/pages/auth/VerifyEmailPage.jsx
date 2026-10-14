import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authApi } from "../../api";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  ArrowRight,
  Send,
  KeyRound,
} from "lucide-react";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();

  const tokenFromUrl = searchParams.get("token");
  const emailFromUrl = searchParams.get("email") || "";

  const [loading, setLoading] = useState(Boolean(tokenFromUrl));
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [email, setEmail] = useState(emailFromUrl);
  const [manualToken, setManualToken] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const [isResending, setIsResending] = useState(false);

  const verifyToken = async (tok) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.verifyEmail(tok);
      setSuccess(true);
    } catch (err) {
      let errStr = "Invalid or expired verification token.";
      if (typeof err === "string") {
        errStr = err;
      } else if (err && err.message) {
        errStr = err.message;
      }
      setError(errStr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      verifyToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (manualToken) {
      verifyToken(manualToken.trim());
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsResending(true);
      setResendStatus("");
      await authApi.resendVerification(email);
      setResendStatus("A fresh verification link has been sent to your email!");
    } catch (err) {
      setResendStatus("Error: " + (err || "Could not resend email."));
    } finally {
      setIsResending(false);
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

      <div className="relative z-10 max-w-md w-full space-y-6 bg-[#0E182D]/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-2xl border border-[#C59D5F]/35 text-white text-center">
        {/* Brand Monogram Emblem & Heading */}
        <Link to="/" className="inline-flex items-center gap-3 mb-2 group">
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

        {loading ? (
          <div className="py-10">
            <Loader2 className="w-12 h-12 text-[#C59D5F] animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-cinzel font-bold text-[#FBF8F2]">
              Verifying Your Royal Access...
            </h3>
            <p className="text-xs text-slate-300 font-serif mt-1">
              Please wait while we confirm your credentials with our sanctuary registry.
            </p>
          </div>
        ) : success ? (
          <div className="space-y-5 py-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#C59D5F]/20 border border-[#C59D5F] text-[#C59D5F] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-cinzel font-bold text-[#FBF8F2]">
                Email Verified Successfully!
              </h3>
              <p className="text-xs text-slate-300 font-serif leading-relaxed mt-1">
                Your TripNest Escapes account is now fully activated. You may now sign in and explore bespoke royal journeys.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full py-3 bg-[#C59D5F] hover:bg-[#D4AF37] text-[#0B1325] font-cinzel font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-[#C59D5F]/20 transition flex items-center justify-center gap-2 transform hover:scale-[1.01]"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-left">
            <div className="text-center">
              <h3 className="text-2xl font-cinzel font-bold text-[#FBF8F2] tracking-wide">
                Email Verification
              </h3>
              <p className="text-xs text-slate-300 font-serif mt-1">
                Verify your account to access palatial stays and bespoke expeditions.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleManualVerify} className="space-y-2">
              <label className="block text-[10px] font-cinzel font-bold text-[#C59D5F] uppercase tracking-widest">
                Verification Token
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-[#C59D5F] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Paste token from email link"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-[#C59D5F] font-mono text-white placeholder-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualToken}
                  className="px-4 py-2 bg-[#C59D5F] hover:bg-[#D4AF37] text-[#0B1325] text-xs font-cinzel font-bold tracking-wider rounded-xl transition disabled:opacity-50"
                >
                  Verify
                </button>
              </div>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase tracking-widest font-cinzel">
                Or Resend Link
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleResend} className="space-y-3">
              <div>
                <label className="block text-[10px] font-cinzel font-bold text-[#C59D5F] uppercase tracking-widest mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#C59D5F] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="traveler@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-[#C59D5F] text-white placeholder-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isResending}
                className="w-full py-2.5 bg-[#162238] hover:bg-[#1E2D4A] border border-[#C59D5F]/40 text-[#FBF8F2] font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C59D5F]" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#C59D5F]" />
                    <span>Send Fresh Verification Email</span>
                  </>
                )}
              </button>

              {resendStatus && (
                <p className="text-xs text-center font-medium text-[#C59D5F] mt-2 font-serif">
                  {resendStatus}
                </p>
              )}
            </form>

            <div className="text-center pt-2 border-t border-white/10">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-400 hover:text-[#C59D5F] transition"
              >
                &larr; Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
