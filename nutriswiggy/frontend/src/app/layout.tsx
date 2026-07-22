import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "NutriSwiggy | Swiggy AI Dietitian & Food Discovery Platform",
  description: "Experience premium food delivery integrated with a personal AI Dietitian. Get instant macro counts, health scoring, and diet recommendations directly from restaurant menus.",
  keywords: "swiggy, dietitian, fitness meals, healthy food delivery, macro counting, protein food, keto diet planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased text-[#282C3F] bg-white min-h-screen flex flex-col relative selection:bg-swiggy-orange selection:text-white">
        
        {/* Sticky desktop header / navbar */}
        <Navbar />

        {/* Global Ambient Glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-swiggy-orange/[0.03] rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-healthy-emerald/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Main Content Area */}
        <main className="flex-1 w-full relative z-10 pb-20 lg:pb-8">
          {children}
        </main>

        {/* Sticky Mobile bottom navigator bar */}
        <MobileNav />

        {/* Global Desktop Footer */}
        <footer className="hidden lg:block bg-[#090D1A] border-t border-slate-800 text-center py-8 text-[11px] text-slate-400 z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>© 2026 Swiggy Builders Club • NutriSwiggy AI Dietitian Delivery Assistant</p>
            <div className="flex gap-4">
              <span className="hover:text-swiggy-orange transition-colors cursor-pointer">About Us</span>
              <span className="hover:text-swiggy-orange transition-colors cursor-pointer">Terms & Conditions</span>
              <span className="hover:text-swiggy-orange transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-swiggy-orange transition-colors cursor-pointer">Dietitian API</span>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
