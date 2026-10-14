import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F6FC] flex flex-col items-center justify-center p-6 text-slate-800 text-center">
      <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#5B30D9] mb-4">
        <Compass className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">404 - Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        The administrative console page or resource you requested does not exist or has been relocated.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#5B30D9] hover:bg-[#4C24B8] text-white rounded-xl text-sm font-semibold transition shadow-md shadow-[#5B30D9]/20"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
