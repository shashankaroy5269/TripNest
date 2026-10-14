import React from "react";
import { Link } from "react-router-dom";
import { Compass, Mail, Phone, MapPin, CheckCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#070D18] text-slate-300 pt-16 pb-12 border-t border-[#C59D5F]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#C59D5F] bg-[#162238] flex items-center justify-center text-[#C59D5F] shadow-sm">
                <span className="font-serif italic font-bold text-xl leading-none">T</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-cinzel font-bold tracking-[0.2em] text-[#FBF8F2]">
                  TRIPNEST <span className="text-[#C59D5F]">ESCAPES</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#C59D5F]/80 -mt-0.5 font-sans">
                  Journeys Beyond Ordinary
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India’s premier royal heritage travel and luxury stays platform. Crafted 10-day expeditions, handpicked palace hotels, and private seamless chauffeur transfers.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#C59D5F] font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Certified Royal Itineraries & 24/7 Dedicated Concierge</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold font-cinzel text-[#C59D5F] uppercase tracking-[0.2em] mb-4">
              Iconic Corridors
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/hotels?city=Jaipur" className="hover:text-[#C59D5F] transition">
                  Jaipur • Royal Rajputana Palaces
                </Link>
              </li>
              <li>
                <Link to="/hotels?city=Kerala" className="hover:text-[#C59D5F] transition">
                  Kerala • Serene Vembanad Backwaters
                </Link>
              </li>
              <li>
                <Link to="/hotels?city=Manali" className="hover:text-[#C59D5F] transition">
                  Himachal • Snow Peaks & Pine Trails
                </Link>
              </li>
              <li>
                <Link to="/hotels?city=Goa" className="hover:text-[#C59D5F] transition">
                  Goa • Private Beachfront Villas
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-[#C59D5F] transition font-semibold text-[#FBF8F2]">
                  Explore All Handcrafted Tour Packages &rarr;
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold font-cinzel text-[#C59D5F] uppercase tracking-[0.2em] mb-4">
              Royal Concierge & Helpline
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#C59D5F]" />
                <span>concierge@tripnest.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#C59D5F]" />
                <span className="text-slate-200 font-semibold">+91 98765 43210 (24x7 India Helpline)</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C59D5F] shrink-0 mt-0.5" />
                <span>TripNest Escapes, Cyber City, Gurugram, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} TripNest Travel Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[#C59D5F]/80">
            <a href="#about" className="hover:text-[#C59D5F]">About Tour</a>
            <a href="#itinerary" className="hover:text-[#C59D5F]">Itinerary</a>
            <a href="#included" className="hover:text-[#C59D5F]">What's Included</a>
            <a href="#inquiry" className="hover:text-[#C59D5F]">Inquiry</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
