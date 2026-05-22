"use client";

import React, { useState, useEffect } from "react";
import { RESTAURANTS } from "@/utils/mockData";
import { useCartStore } from "@/store/useCartStore";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { 
  Percent, 
  Star, 
  Zap, 
  Sparkles, 
  ArrowUpDown, 
  SlidersHorizontal, 
  Compass,
  Gift,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const availableCoupons = [
  {
    code: "SWIGGY50",
    discount: "50% OFF",
    title: "Welcome Offer",
    description: "Get 50% discount on your first healthy order.",
    minOrder: "₹199",
    maxDiscount: "₹150",
    color: "from-orange-500 to-amber-500",
  },
  {
    code: "NUTRI30",
    discount: "30% OFF",
    title: "AI Dietitian Special",
    description: "Enjoy 30% off on all dietitian recommended meals.",
    minOrder: "₹149",
    maxDiscount: "₹100",
    color: "from-emerald-500 to-teal-500",
  },
  {
    code: "HEALTHY20",
    discount: "20% OFF",
    title: "Daily Nutrition Boost",
    description: "Get 20% off on high protein and low carb dishes.",
    minOrder: "₹99",
    maxDiscount: "₹60",
    color: "from-blue-500 to-indigo-500",
  },
  {
    code: "DIET50",
    discount: "50% OFF",
    title: "Super Weight Loss Deal",
    description: "Flat 50% off on selected salads and keto options.",
    minOrder: "₹249",
    maxDiscount: "₹200",
    color: "from-rose-500 to-pink-500",
  }
];

function CouponCard({ coupon }: { coupon: typeof availableCoupons[0] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      {/* Decorative colored bar */}
      <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${coupon.color}`} />
      
      <div className="space-y-3 pl-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              PROMO CODE
            </span>
            <h4 className="text-lg font-black text-[#282C3F] mt-1.5">{coupon.discount}</h4>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#FC8019] group-hover:scale-110 transition-transform duration-300">
            <Percent className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h5 className="text-xs font-extrabold text-slate-700">{coupon.title}</h5>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">
            {coupon.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-bold border-t border-slate-50 pt-2">
          <span>Min. Order: {coupon.minOrder}</span>
          <span>•</span>
          <span>Max Disc: {coupon.maxDiscount}</span>
        </div>
      </div>

      <div className="mt-4 pl-2 pt-2 border-t border-dashed border-slate-150 flex items-center justify-between gap-3">
        <div className="bg-slate-50 border border-slate-200 border-dashed px-3 py-1.5 rounded-lg text-xs font-black tracking-wider text-[#282C3F] select-all">
          {coupon.code}
        </div>
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all duration-200 active:scale-95 ${
            copied
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
              : "bg-[#FC8019] hover:bg-[#e06f14] text-white shadow-md shadow-[#FC8019]/15"
          }`}
        >
          {copied ? "COPIED! ✅" : "Copy Code"}
        </button>
      </div>
    </div>
  );
}

export default function OffersPage() {
  const { dietitianMode, setDietitianMode } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "veg" | "top-rated" | "delivery" | "healthy">("all");
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "time" | "cost-asc" | "cost-desc">("relevance");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const getAvgHealthScore = (rest: any) => {
    if (!rest.menu || rest.menu.length === 0) return 0;
    const total = rest.menu.reduce((sum: number, item: any) => sum + item.healthScore, 0);
    return Math.round(total / rest.menu.length);
  };

  // Offers filtration logic (all items rendered must have rest.offer or be eligible)
  const offersRestaurants = RESTAURANTS.filter((rest) => {
    // Must possess an offer
    if (!rest.offer) return false;

    // Quick filters
    if (activeTab === "veg" && !rest.veg) return false;
    if (activeTab === "top-rated" && rest.rating < 4.5) return false;
    if (activeTab === "delivery" && rest.deliveryTime > 25) return false;
    
    // Dietitian Recommended (Avg Health Score >= 80)
    if (activeTab === "healthy") {
      const score = getAvgHealthScore(rest);
      if (score < 80) return false;
    }

    return true;
  });

  // Sorting logic
  const sortedRestaurants = [...offersRestaurants].sort((a, b) => {
    if (dietitianMode && sortBy === "relevance") {
      // Healthiest outlet first
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
        return 0;
    }
  });

  const sortOptions = [
    { id: "relevance", name: dietitianMode ? "Health Score (High to Low)" : "Relevance (Default)" },
    { id: "rating", name: "Rating: High to Low" },
    { id: "time", name: "Delivery Time: Fastest First" },
    { id: "cost-asc", name: "Cost: Low to High" },
    { id: "cost-desc", name: "Cost: High to Low" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-12 relative overflow-x-hidden min-h-screen bg-white">
      
      {/* Premium Header Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FC8019]/5 to-amber-500/5 border border-slate-100 p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FC8019]/10 border border-[#FC8019]/25 text-[#FC8019] text-[10px] font-black uppercase tracking-wider">
            <Percent className="w-3 h-3" />
            <span>Super Saver Hub</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-[#282C3F] tracking-tight">
            Offers & Deals for You
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-xl font-medium">
            Explore exclusive promo coupons, flat discounts, and dietitian-friendly saving vouchers across Bangalore's leading kitchen chains.
          </p>
        </div>
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#FC8019]/10 flex items-center justify-center text-[#FC8019] flex-shrink-0 animate-bounce-slow">
          <Gift className="w-12 h-12 md:w-16 md:h-16" />
        </div>
      </section>

      {/* SECTION 1: Platform Offers & Coupons */}
      <section className="space-y-6">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <div>
            <h3 className="text-lg md:text-xl font-black text-[#282C3F] flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#FC8019]" />
              <span>Platform Promo Vouchers</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Copy and apply these codes at checkout for instant cash savings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {availableCoupons.map((coupon) => (
            <CouponCard key={coupon.code} coupon={coupon} />
          ))}
        </div>
      </section>

      {/* SECTION 2: Restaurant Specific Offers */}
      <section id="restaurant-deals" className="space-y-6 pt-4">
        
        {/* Title */}
        <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
          <div>
            <h3 className="text-lg md:text-xl font-black text-[#282C3F] flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#FC8019]" />
              <span>Restaurants with Online Deals</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Order from these highly-rated kitchen partners to save on checkout totals</p>
          </div>
        </div>

        {/* Filters and Sort Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-150">
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 border border-slate-200 rounded-full cursor-pointer transition-all duration-200">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FC8019]" />
              <span className="text-xs font-bold">Filters</span>
            </div>

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
            
            {/* Dietitian Mode Switcher */}
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

        {/* RESTAURANT DEALS GRID */}
        {loading ? (
          <SkeletonLoader />
        ) : sortedRestaurants.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-3xl p-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#282C3F]">No deal-matching restaurants found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try resetting or switching filters to see other kitchen outlets.</p>
            <button
              onClick={() => {
                setActiveTab("all");
                setSortBy("relevance");
              }}
              className="mt-4 bg-white hover:bg-slate-50 active:scale-95 text-xs font-bold px-4 py-2 border border-slate-200 rounded-xl text-slate-700 transition-colors"
            >
              Reset Filters
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
