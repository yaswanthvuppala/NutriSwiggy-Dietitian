"use client";

import React, { useState, useEffect, useRef } from "react";
import { RESTAURANTS, CATEGORIES } from "@/utils/mockData";
import { useCartStore } from "@/store/useCartStore";
import { OfferBanner } from "@/components/OfferBanner";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { 
  SlidersHorizontal, 
  Compass, 
  Trophy, 
  Star, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Percent, 
  Zap, 
  UtensilsCrossed 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const { 
    activeFilter, 
    setActiveFilter, 
    dietitianMode, 
    setDietitianMode 
  } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "veg" | "top-rated" | "delivery" | "offers" | "healthy">("all");
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "time" | "cost-asc" | "cost-desc">("relevance");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const topChainsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollChains = (direction: "left" | "right") => {
    if (topChainsContainerRef.current) {
      const { scrollLeft, clientWidth } = topChainsContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      topChainsContainerRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const getAvgHealthScore = (rest: any) => {
    if (!rest.menu || rest.menu.length === 0) return 0;
    const total = rest.menu.reduce((sum: number, item: any) => sum + item.healthScore, 0);
    return Math.round(total / rest.menu.length);
  };

  // 1. Filtering Logic
  const filteredRestaurants = RESTAURANTS.filter((rest) => {
    // Category Filter
    if (activeFilter !== "All") {
      const hasCategory = rest.menu.some(
        (item) => item.category.toLowerCase().includes(activeFilter.toLowerCase()) || 
                  item.name.toLowerCase().includes(activeFilter.toLowerCase())
      );
      if (!hasCategory) return false;
    }

    // Quick Filters
    if (activeTab === "veg" && !rest.veg) return false;
    if (activeTab === "top-rated" && rest.rating < 4.5) return false;
    if (activeTab === "delivery" && rest.deliveryTime > 25) return false;
    if (activeTab === "offers" && !rest.offer) return false;
    
    // Dietitian Recommended (Avg Health Score >= 80)
    if (activeTab === "healthy") {
      const score = getAvgHealthScore(rest);
      if (score < 80) return false;
    }

    // Under dietitian mode, if 'healthy' isn't explicitly active, still filter out extremely low health score outlets if desired
    if (dietitianMode && activeTab === "all") {
      // Show all but we rank them by health score first
    }

    return true;
  });

  // 2. Sorting Logic
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (dietitianMode && sortBy === "relevance") {
      // In Dietitian Mode, default sorting is by Health Score
      return getAvgHealthScore(b) - getAvgHealthScore(a);
    }

    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "time":
        return a.deliveryTime - b.deliveryTime;
      case "cost-asc":
        return a.costForTwo - b.costForTwo;
      case "cost-desc":
        return b.costForTwo - a.costForTwo;
      default:
        return 0; // relevance / default id order
    }
  });

  const popularChains = RESTAURANTS.filter((r) => r.isPopular);

  const sortOptions = [
    { id: "relevance", name: dietitianMode ? "Health Score (High to Low)" : "Relevance (Default)" },
    { id: "rating", name: "Rating: High to Low" },
    { id: "time", name: "Delivery Time: Fastest First" },
    { id: "cost-asc", name: "Cost: Low to High" },
    { id: "cost-desc", name: "Cost: High to Low" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-10 relative overflow-x-hidden">
      
      {/* Promotional Offers Banner */}
      <section className="relative z-10">
        <OfferBanner />
      </section>

      {/* CAROUSEL 1: "What's on your mind?" (Swiggy Replica Circular Grid) */}
      <section className="space-y-4 relative z-10">
        <div className="flex justify-between items-end border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#282C3F] tracking-tight">
              What's on your mind?
            </h2>
            <p className="text-xs text-slate-500 mt-1">Discover popular cuisines and healthy favorites</p>
          </div>
        </div>
        
        {/* Horizontal scroll of circular categories */}
        <div className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none scroll-smooth">
          {/* 'All Foods' Circle */}
          <button
            onClick={() => setActiveFilter("All")}
            className="flex-shrink-0 flex flex-col items-center gap-2 group outline-none"
          >
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 border-2 ${
              activeFilter === "All"
                ? "border-[#FC8019] bg-[#FC8019]/10 shadow-lg shadow-[#FC8019]/25 scale-105"
                : "border-slate-200 bg-slate-50 group-hover:border-slate-300"
            }`}>
              <UtensilsCrossed className={`w-8 h-8 ${activeFilter === "All" ? "text-[#FC8019]" : "text-slate-500 group-hover:text-[#282C3F]"}`} />
            </div>
            <span className={`text-xs font-extrabold tracking-wide uppercase ${activeFilter === "All" ? "text-[#FC8019]" : "text-slate-500 group-hover:text-[#282C3F]"}`}>
              All Foods
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = activeFilter === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(isSelected ? "All" : cat.name)}
                className="flex-shrink-0 flex flex-col items-center gap-2 group outline-none"
              >
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden transition-all duration-300 border-2 ${
                  isSelected
                    ? "border-[#FC8019] shadow-lg shadow-[#FC8019]/25 scale-105"
                    : "border-slate-200 bg-slate-50 group-hover:border-slate-300"
                }`}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className={`text-xs font-extrabold tracking-wide uppercase transition-colors duration-200 ${
                  isSelected ? "text-[#FC8019]" : "text-slate-500 group-hover:text-[#282C3F]"
                }`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* CAROUSEL 2: "Top restaurant chains in Bangalore" (Swiggy Horizontal Slider) */}
      <section className="space-y-4 relative z-10">
        <div className="flex justify-between items-end border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#282C3F] tracking-tight">
              Top restaurant chains in Bangalore
            </h2>
            <p className="text-xs text-slate-500 mt-1">Popular outlets offering premium services nearby</p>
          </div>
          
          {/* Scroll buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleScrollChains("left")}
              className="p-2 rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-550 hover:text-[#282C3F] transition-all active:scale-90 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleScrollChains("right")}
              className="p-2 rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-550 hover:text-[#282C3F] transition-all active:scale-90 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal flex container */}
        <div 
          ref={topChainsContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none scroll-smooth snap-x snap-mandatory"
        >
          {popularChains.map((rest) => (
            <div key={rest.id} className="w-[280px] md:w-[320px] flex-shrink-0 snap-start">
              <RestaurantCard restaurant={rest} />
            </div>
          ))}
        </div>
      </section>

      {/* AI Dietitian Active Banner */}
      <AnimatePresence>
        {dietitianMode && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border-2 border-[#FC8019]/50 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FC8019]/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="w-12 h-12 rounded-2xl bg-[#FC8019]/10 border border-[#FC8019]/35 flex items-center justify-center flex-shrink-0 text-[#FC8019] shadow">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#282C3F] flex items-center justify-center md:justify-start gap-2">
                  <span>AI Dietitian Mode Active</span>
                  <span className="bg-[#FC8019]/15 text-[#FC8019] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#FC8019]/25">Enabled</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Currently showcasing calculated average health scores (1-100), highlighting customized macro balances, and prioritizing diet-friendly food categories under Swiggy style!
                </p>
              </div>
            </div>
            <Link
              href="/dietitian"
              className="bg-gradient-to-r from-[#FC8019] to-amber-500 hover:shadow-lg hover:shadow-[#FC8019]/20 text-white font-extrabold text-xs px-5 py-3 rounded-xl active:scale-95 transition-all flex-shrink-0 flex items-center gap-1.5"
            >
              Consult AI Coach 🥦
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN LIST: "Restaurants with online food delivery in Bangalore" */}
      <section id="restaurants" className="space-y-6 relative z-10 pt-4">
        
        {/* Title */}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#282C3F] tracking-tight">
            Restaurants with online food delivery in Bangalore
          </h2>
          <p className="text-xs text-slate-500 mt-1">Explore partner outlets delivering delicious meals to your doorstep</p>
        </div>

        {/* SWIGGY FILTER & SORT BAR (Replicated with dietitian toggle in place of corporate) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-150">
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Standard Filter Button */}
            <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 border border-slate-200 rounded-full cursor-pointer transition-all duration-200">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FC8019]" />
              <span className="text-xs font-bold">Filters</span>
            </div>

            {/* Quick filter tabs */}
            <button
              onClick={() => setActiveTab(activeTab === "all" ? "all" : "all")}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 ${
                activeTab === "all"
                  ? "bg-[#FC8019]/10 border-[#FC8019] text-[#FC8019]"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-[#282C3F]"
              }`}
            >
              All Outlets
            </button>

            <button
              onClick={() => setActiveTab(activeTab === "veg" ? "all" : "veg")}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === "veg"
                  ? "bg-[#FC8019]/10 border-[#FC8019] text-[#FC8019]"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-[#282C3F]"
              }`}
            >
              <span>Pure Veg</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>

            <button
              onClick={() => setActiveTab(activeTab === "top-rated" ? "all" : "top-rated")}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-1 ${
                activeTab === "top-rated"
                  ? "bg-[#FC8019]/10 border-[#FC8019] text-[#FC8019]"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-[#282C3F]"
              }`}
            >
              <span>Ratings 4.5+</span>
              <Star className="w-3 h-3 text-[#FC8019] fill-current" />
            </button>

            <button
              onClick={() => setActiveTab(activeTab === "delivery" ? "all" : "delivery")}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-1 ${
                activeTab === "delivery"
                  ? "bg-[#FC8019]/10 border-[#FC8019] text-[#FC8019]"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-[#282C3F]"
              }`}
            >
              <span>Fast Delivery</span>
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
            </button>

            <button
              onClick={() => setActiveTab(activeTab === "offers" ? "all" : "offers")}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-1 ${
                activeTab === "offers"
                  ? "bg-[#FC8019]/10 border-[#FC8019] text-[#FC8019]"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-[#282C3F]"
              }`}
            >
              <span>Offers</span>
              <Percent className="w-3.5 h-3.5 text-[#FC8019]" />
            </button>

            {/* Dietitian Recommended Filter (Only visible/meaningful when dietitianMode is ON or togglable) */}
            {dietitianMode && (
              <button
                onClick={() => setActiveTab(activeTab === "healthy" ? "all" : "healthy")}
                className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === "healthy"
                    ? "bg-[#FC8019]/15 border-[#FC8019] text-[#FC8019] shadow-md shadow-[#FC8019]/5 animate-pulse"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-[#282C3F]"
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#FC8019]" />
                <span>Dietitian Recommended</span>
              </button>
            )}
          </div>

          {/* Sort By Dropdown and Dietitian Switcher */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Dashboard Dietitian Toggle (Replacing Swiggy Corporate Switcher) */}
            <div 
              className="flex items-center bg-slate-100 p-1 border border-slate-200 rounded-full h-10 w-[200px] relative cursor-pointer select-none" 
              onClick={() => setDietitianMode(!dietitianMode)}
            >
              <motion.div
                className="absolute top-1 bottom-1 rounded-full bg-[#FC8019] shadow-md shadow-[#FC8019]/25"
                initial={false}
                animate={{
                  left: dietitianMode ? "100px" : "4px",
                  right: dietitianMode ? "4px" : "100px",
                }}
                transition={{ type: "spring", stiffness: 350, damping: 26 }}
              />
              <div className={`z-10 w-1/2 text-center text-[10px] font-black tracking-wider uppercase transition-colors duration-200 ${!dietitianMode ? "text-white" : "text-slate-500 hover:text-[#282C3F]"}`}>
                Personal
              </div>
              <div className={`z-10 w-1/2 text-center text-[10px] font-black tracking-wider uppercase transition-colors duration-200 ${dietitianMode ? "text-white" : "text-slate-500 hover:text-[#282C3F]"}`}>
                Dietitian 🥦
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100 px-4 py-2 border border-slate-200 rounded-full cursor-pointer transition-all duration-200 text-xs font-bold"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#FC8019]" />
                <span>Sort By: {sortOptions.find(o => o.id === sortBy)?.name.split(":")[0]}</span>
              </button>

              <AnimatePresence>
                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowSortDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl p-2 shadow-2xl z-30 overflow-hidden"
                    >
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSortBy(opt.id as any);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                            sortBy === opt.id
                              ? "bg-[#FC8019]/10 text-[#FC8019]"
                              : "text-slate-700 hover:bg-slate-50 hover:text-[#282C3F]"
                          }`}
                        >
                          {opt.name}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

        {/* ACTIVE GRID */}
        {loading ? (
          <SkeletonLoader />
        ) : sortedRestaurants.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-3xl p-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#282C3F]">No restaurants match your filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try resetting your active category filters to explore more options.</p>
            <button
              onClick={() => {
                setActiveFilter("All");
                setActiveTab("all");
                setSortBy("relevance");
              }}
              className="mt-4 bg-white hover:bg-slate-50 active:scale-95 text-xs font-bold px-4 py-2 border border-slate-200 rounded-xl text-slate-700 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedRestaurants.map((rest) => (
              <RestaurantCard key={rest.id} restaurant={rest} />
            ))}
          </div>
        )}

      </section>

    </div>
  );
}
