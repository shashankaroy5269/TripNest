import "./globals.css";
import { Providers } from "../components/Providers";

export const metadata = {
  title: "TripNest Admin Command Center",
  description: "Enterprise administrative portal for TripNest hotels, tours, analytics and operations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F4F6FC] text-slate-800 antialiased selection:bg-[#5B30D9] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
