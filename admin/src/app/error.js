"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // If chunk load error occurs due to build skew, auto-reload once
    if (
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Loading chunk") ||
      error?.message?.includes("timeout")
    ) {
      const hasReloaded = sessionStorage.getItem("tripnest_chunk_reload");
      if (!hasReloaded) {
        sessionStorage.setItem("tripnest_chunk_reload", "true");
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F4F6FC] flex flex-col items-center justify-center p-6 text-slate-800 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Dashboard Connection Notice</h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        {error?.message || "A temporary script loading delay occurred while loading administrative resources."}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            sessionStorage.removeItem("tripnest_chunk_reload");
            if (reset) reset();
            else window.location.reload();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-[#5B30D9]/20"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Dashboard
        </button>
      </div>
    </div>
  );
}
