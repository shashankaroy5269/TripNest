import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F4F6FC] flex flex-col items-center justify-center text-slate-800">
      <Loader2 className="w-10 h-10 animate-spin text-[#5B30D9] mb-3" />
      <p className="text-sm text-slate-500 font-medium">Loading TripNest Admin...</p>
    </div>
  );
}
