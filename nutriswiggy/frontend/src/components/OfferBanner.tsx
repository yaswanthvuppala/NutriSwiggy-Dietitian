"use client";

import React, { useState, useEffect } from "react";
import { BANNERS } from "@/utils/mockData";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export const OfferBanner = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % BANNERS.length);
  };

  const activeBanner = BANNERS[index];

  return (
    <div id="offers" className="w-full relative overflow-hidden rounded-3xl border border-slate-800 shadow-2xl h-52 md:h-64 bg-slate-950">
      
      {/* Dynamic Slide Background/Layout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBanner.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-r ${activeBanner.bgColor} flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-4 md:py-0 overflow-hidden`}
        >
          {/* Decorative glowing particles */}
          <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-[#FC8019]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Left Text Column */}
          <div className="flex-1 space-y-2 md:space-y-3 text-center md:text-left relative z-10">
            {activeBanner.id === "banner-3" ? (
              <span className="inline-flex items-center gap-1 bg-[#FC8019]/10 text-[#FC8019] border border-[#FC8019]/25 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3.5 h-3.5 text-[#FC8019]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.034 24c-.376-.411-2.075-2.584-3.95-5.513-.547-.916-.901-1.63-.833-1.814.178-.48 3.355-.743 4.333-.308.298.132.29.307.29.409 0 .44-.022 1.619-.022 1.619a.441.441 0 1 0 .883-.002l-.005-2.939c0-.255-.278-.319-.331-.329-.511-.002-1.548-.006-2.661-.006-2.457 0-3.006.101-3.423-.172-.904-.591-2.383-4.577-2.417-6.819C3.849 4.964 5.723 2.225 8.362.868A8.13 8.13 0 0 1 12.026 0c4.177 0 7.617 3.153 8.075 7.209l.001.011c.084.981-5.321 1.189-6.39.904-.164-.044-.206-.212-.206-.284L13.5 4.996a.442.442 0 0 0-.884.002l.009 3.866a.33.33 0 0 0 .268.32l3.354-.001c1.79 0 2.542.207 3.042.588.333.254.461.739.349 1.37C18.633 16.755 12.273 23.71 12.034 24z" />
                </svg> Featured Assist
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-[#FC8019]/10 text-[#FC8019] border border-[#FC8019]/25 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Best Deal
              </span>
            )}
            
            <h2 className={`text-xl md:text-3xl font-black tracking-tight leading-tight ${activeBanner.textColor}`}>
              {activeBanner.title}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-lg font-medium leading-relaxed">
              {activeBanner.subtitle}
            </p>

            <div className="pt-2 md:pt-4">
              {activeBanner.id === "banner-3" ? (
                <Link
                  href="/dietitian"
                  className="inline-flex items-center gap-1 bg-gradient-to-r from-[#FC8019] to-amber-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#FC8019]/20 active:scale-95 transition-all duration-200"
                >
                  Consult AI Coach 🥗
                </Link>
              ) : (
                <Link
                  href="/#restaurants"
                  className="inline-flex items-center gap-1 bg-gradient-to-r from-[#FC8019] to-amber-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#FC8019]/20 active:scale-95 transition-all duration-200"
                >
                  Order Now
                </Link>
              )}
            </div>
          </div>

          {/* Right Image Column */}
          <div className="hidden md:block w-72 h-48 relative z-10 rounded-2xl overflow-hidden shadow-lg border border-slate-800/80">
            <img
              src={activeBanner.image}
              alt={activeBanner.title}
              className="w-full h-full object-cover transform hover:scale-102 transition-transform duration-500"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-90"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-90"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-25">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === index ? "w-5 bg-[#FC8019]" : "w-1.5 bg-slate-700 hover:bg-slate-600"
            }`}
          />
        ))}
      </div>

    </div>
  );
};
export default OfferBanner;
