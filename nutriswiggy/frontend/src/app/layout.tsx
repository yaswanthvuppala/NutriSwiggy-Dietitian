import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "NutriSwiggy | AI Healthy Food Recommendation Assistant",
  description: "Discover healthy food options, calculate macros, and score meals intelligently with NutriSwiggy AI Dietitian for the Swiggy Builders Club Hackathon.",
  keywords: "healthy food, swiggy, dietitian, fitness goals, calories counter, macro estimation, meal ranking, builders club",
  authors: [{ name: "Swiggy Builders Club Hackathon" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} scroll-smooth`}>
      <body className="font-sans antialiased text-slate-100 bg-[#0b0f19] min-h-screen selection:bg-swiggy-orange selection:text-white">
        {children}
      </body>
    </html>
  );
}
