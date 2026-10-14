import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../api";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getMailUrl = (email) => {
    if (!email) return "https://mail.google.com";
    const domain = email.split("@")[1]?.toLowerCase() || "";
    const username = email.split("@")[0] || "";
    if (domain.includes("gmail")) return "https://mail.google.com";
    if (domain.includes("yopmail")) return `https://yopmail.com?${encodeURIComponent(username)}`;
    if (domain.includes("yahoo")) return "https://mail.yahoo.com";
    if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live")) return "https://outlook.live.com";
    if (domain.includes("icloud")) return "https://www.icloud.com/mail";
    if (domain.includes("proton")) return "https://mail.proton.me";
    return `https://${domain}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await authApi.register(formData);
      setSuccessData({
        email: formData.email,
        message: res.data?.message || "Registration successful! Please verify your email.",
      });
    } catch (err) {
      let errStr = "Registration failed";
      if (typeof err === "string") {
        errStr = err;
      } else if (err && err.message) {
        errStr = err.message;
      }
      setErrorMessage(errStr);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#0A1222] overflow-hidden">
      {/* Background Golden Hour Palace Panorama */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=85"
          alt="Udaipur Palace Twilight"
          className="w-full h-full object-cover filter brightness-[0.45] contrast-[1.1] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1222] via-[#0A1222]/40 to-black/70" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-6 bg-[#0E182D]/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-2xl border border-[#C59D5F]/35 text-white">
        {/* Brand Monogram Emblem & Heading */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
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
            Create Customer Account
          </h2>
          <p className="text-xs text-slate-300 font-serif mt-1">
            Join TripNest Escapes to reserve verified palaces and curated expeditions.
          </p>
        </div>

        {successData ? (
          <div className="space-y-6 text-center animate-fadeIn py-4">
            <div className="w-16 h-16 rounded-full bg-[#C59D5F]/20 border border-[#C59D5F] text-[#C59D5F] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-cinzel font-bold text-white mb-1">
                Account Created Successfully!
              </h3>
              <p className="text-xs text-slate-300 font-serif leading-relaxed">
                We've sent a verification link to{" "}
                <span className="font-semibold text-[#E5C77A]">{successData.email}</span>.
                Please check your inbox (and spam folder) and click the link to activate your account.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={getMailUrl(successData.email)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#C59D5F] hover:bg-[#D4AF37] text-[#0B1325] font-cinzel font-bold text-xs uppercase tracking-[0.15em] rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Go to Email Inbox</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                to="/login"
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-cinzel font-bold text-[#C59D5F] uppercase tracking-widest mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#C59D5F] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="shashanka roy"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-[#C59D5F] font-medium text-white placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-cinzel font-bold text-[#C59D5F] uppercase tracking-widest mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#C59D5F] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="shashanka@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-[#C59D5F] font-medium text-white placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-cinzel font-bold text-[#C59D5F] uppercase tracking-widest mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#C59D5F] absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-[#C59D5F] font-medium text-white placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-cinzel font-bold text-[#C59D5F] uppercase tracking-widest mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#C59D5F] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-black/40 border border-white/20 rounded-xl focus:outline-none focus:border-[#C59D5F] font-medium text-white placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-serif">
                By registering, you agree that an email verification link will be sent to activate your royal account.
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
                    <span>Create Royal Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-white/10">
              <p className="text-xs text-slate-400">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-bold text-[#C59D5F] hover:underline"
                >
                  Sign In &rarr;
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
