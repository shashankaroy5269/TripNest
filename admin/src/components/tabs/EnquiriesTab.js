"use client";

import React, { useState, useEffect } from "react";
import { inquiryApi } from "../../lib/api";
import { useToast } from "../Toast";
import {
  Headphones,
  Search,
  MessageCircle,
  PhoneCall,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
  RefreshCw,
  ExternalLink,
  MapPin,
  Calendar,
  User,
  FileText,
  X,
  Send,
  AlertCircle,
} from "lucide-react";

export default function EnquiriesTab({ searchQuery = "" }) {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, contacted: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [localSearch, setLocalSearch] = useState("");

  // Inspection / Notes Modal State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await inquiryApi.getAll({
        status: statusFilter,
        search: searchQuery || localSearch,
      });
      const data = res.data || [];
      setInquiries(data);
      if (res.meta?.stats) {
        setStats(res.meta.stats);
      }
    } catch (err) {
      console.error("Fetch inquiries error:", err);
      showToast("Error loading inquiries: " + (err.message || err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, searchQuery]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await inquiryApi.update(id, { status: newStatus });
      showToast(`Inquiry marked as ${newStatus}`, "success");
      fetchInquiries();
      if (selectedInquiry?._id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast("Failed to update status: " + (err.message || err), "error");
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    try {
      setIsUpdating(true);
      await inquiryApi.update(selectedInquiry._id, { adminNotes: noteText });
      showToast("Admin notes saved successfully", "success");
      setSelectedInquiry((prev) => ({ ...prev, adminNotes: noteText }));
      fetchInquiries();
    } catch (err) {
      showToast("Failed to save notes: " + (err.message || err), "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete inquiry from ${name}?`)) return;
    try {
      await inquiryApi.delete(id);
      showToast("Inquiry removed", "info");
      if (selectedInquiry?._id === id) setSelectedInquiry(null);
      fetchInquiries();
    } catch (err) {
      showToast("Failed to delete inquiry: " + (err.message || err), "error");
    }
  };

  const openWhatsApp = (phone, name, msg) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const text = encodeURIComponent(
      `Hello ${name}, greetings from TripNest Escapes! We received your travel inquiry: "${msg.slice(
        0,
        60
      )}...". How can we assist you with dates and customization today?`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const term = (searchQuery || localSearch).toLowerCase().trim();
    if (!term) return true;
    return (
      (inq.name || "").toLowerCase().includes(term) ||
      (inq.phone || "").toLowerCase().includes(term) ||
      (inq.message || "").toLowerCase().includes(term) ||
      (inq.destination || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 text-[#5B30D9] flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Customer Enquiries & Concierge Support
            </h2>
          </div>
          <p className="text-xs text-slate-500 ml-10">
            Review incoming traveler requests, connect via WhatsApp or Phone, and resolve travel inquiries in real-time.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-purple-200 text-xs font-semibold text-slate-700 hover:text-[#5B30D9] bg-white transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Enquiries
            </span>
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5B30D9] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              Pending Follow-up
            </span>
            <span className="text-2xl font-black text-amber-700">{stats.pending}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Contacted
            </span>
            <span className="text-2xl font-black text-blue-700">{stats.contacted}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <MessageCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Resolved & Booked
            </span>
            <span className="text-2xl font-black text-emerald-700">{stats.resolved}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Requests" },
            { id: "PENDING", label: "Pending" },
            { id: "CONTACTED", label: "Contacted" },
            { id: "RESOLVED", label: "Resolved" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-[#5B30D9] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search traveler, phone, request..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5B30D9] transition font-medium"
          />
        </div>
      </div>

      {/* Enquiries List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-[#5B30D9] mx-auto mb-2" />
            <p className="text-xs font-medium">Loading customer enquiries...</p>
          </div>
        ) : filteredInquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold tracking-wide border-b border-slate-100 uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Customer & Contact</th>
                  <th className="p-3.5">Destination / Theme</th>
                  <th className="p-3.5">Travel Plans / Message</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Resolve Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInquiries.map((inq) => {
                  const isPending = inq.status === "PENDING";
                  const isContacted = inq.status === "CONTACTED";
                  const isResolved = inq.status === "RESOLVED";

                  return (
                    <tr key={inq._id} className="hover:bg-slate-50/70 transition">
                      {/* Customer Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-50 text-[#5B30D9] flex items-center justify-center font-bold text-xs shrink-0 border border-purple-100">
                            {inq.name?.charAt(0) || "T"}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {inq.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-600 block mt-0.5">
                              📞 {inq.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <MapPin className="w-3 h-3 text-[#5B30D9]" />
                          {inq.destination || "India Escapes"}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {inq.guests || 2} Travelers
                        </span>
                      </td>

                      {/* Message Preview */}
                      <td className="p-3.5 max-w-xs">
                        <p className="text-slate-700 line-clamp-2 leading-relaxed">
                          {inq.message}
                        </p>
                        {inq.adminNotes && (
                          <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                            Note: {inq.adminNotes}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            PENDING
                          </span>
                        )}
                        {isContacted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            CONTACTED
                          </span>
                        )}
                        {isResolved && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            RESOLVED
                          </span>
                        )}
                      </td>

                      {/* Resolve Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Connect */}
                          <button
                            onClick={() => openWhatsApp(inq.phone, inq.name, inq.message)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg transition border border-emerald-200"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* Direct Call */}
                          <a
                            href={`tel:${inq.phone}`}
                            className="p-1.5 bg-slate-50 hover:bg-slate-700 text-slate-600 hover:text-white rounded-lg transition border border-slate-200"
                            title="Call Customer"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>

                          {/* Toggle Contacted */}
                          {!isResolved && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  inq._id,
                                  isContacted ? "PENDING" : "CONTACTED"
                                )
                              }
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                                isContacted
                                  ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-600 hover:text-white"
                              }`}
                            >
                              {isContacted ? "Unmark" : "Mark Contacted"}
                            </button>
                          )}

                          {/* Toggle Resolved */}
                          <button
                            onClick={() =>
                              handleStatusChange(
                                inq._id,
                                isResolved ? "CONTACTED" : "RESOLVED"
                              )
                            }
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                              isResolved
                                ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white"
                            }`}
                          >
                            {isResolved ? "Reopen" : "Resolve"}
                          </button>

                          {/* View & Notes */}
                          <button
                            onClick={() => {
                              setSelectedInquiry(inq);
                              setNoteText(inq.adminNotes || "");
                            }}
                            className="p-1.5 bg-purple-50 hover:bg-[#5B30D9] text-[#5B30D9] hover:text-white rounded-lg transition border border-purple-200"
                            title="View Details & Add Internal Notes"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(inq._id, inq.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <Headphones className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium">No customer travel enquiries match your filter.</p>
          </div>
        )}
      </div>

      {/* Details & Resolution Notes Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200/90 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#5B30D9] flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Enquiry from {selectedInquiry.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Received on {new Date(selectedInquiry.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Phone Number</span>
                  <span className="font-bold text-slate-800 text-sm">📞 {selectedInquiry.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Destination</span>
                  <span className="font-bold text-slate-800">{selectedInquiry.destination || "India Escapes"}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Customer Travel Request:</span>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-800 leading-relaxed font-serif text-xs border border-slate-200/60">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <span className="text-slate-500 font-bold block mb-1">Update Status:</span>
                <div className="flex gap-2">
                  {["PENDING", "CONTACTED", "RESOLVED"].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedInquiry._id, st)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                        selectedInquiry.status === st
                          ? "bg-[#5B30D9] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Internal Notes */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">
                  Internal Resolution Notes:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Sent 10-day Rajasthan palace itinerary PDF via WhatsApp. Client confirmed booking date for 15th Nov..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#5B30D9] resize-none"
                />
              </div>

              {/* Quick WhatsApp Link inside Modal */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  onClick={() =>
                    openWhatsApp(
                      selectedInquiry.phone,
                      selectedInquiry.name,
                      selectedInquiry.message
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Open WhatsApp Chat</span>
                </button>

                <button
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-[#5B30D9] hover:bg-[#4C24B8] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Save Notes</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
