import React, { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";

export default function InvoiceDownloadButton({ bookingId, bookingReference, variant = "primary" }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      setIsDownloading(true);
      const token = localStorage.getItem("tripnest_token");

      const response = await fetch(`/api/bookings/${bookingId}/invoice?token=${token}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Invoice download failed. Please ensure the booking is paid.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `TripNest-Invoice-${bookingReference || bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "Failed to download invoice");
    } finally {
      setIsDownloading(false);
    }
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/70 text-xs font-semibold transition disabled:opacity-50"
        title="Download official PDF Invoice"
      >
        {isDownloading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span>PDF Invoice</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50"
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      <span>{isDownloading ? "Generating PDF..." : "Download PDF Invoice"}</span>
    </button>
  );
}
