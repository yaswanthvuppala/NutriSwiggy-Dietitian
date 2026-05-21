"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RESTAURANTS } from "@/utils/mockData";
import { FoodCard } from "@/components/FoodCard";
import { RatingBadge } from "@/components/RatingBadge";
import { DietitianDrawer } from "@/components/DietitianDrawer";
import { ArrowLeft, Clock, MapPin, ShieldAlert, Sparkles, Compass, Search } from "lucide-react";
import Link from "next/link";

export default function RestaurantDetails() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDietitianOpen, setIsDietitianOpen] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      const found = RESTAURANTS.find((r) => r.id === restaurantId);
      if (found) {
        setRestaurant(found);
        // Default to first category available
        if (found.menu && found.menu.length > 0) {
          const categories = Array.from(new Set(found.menu.map((item) => item.category)));
          setSelectedCategory(categories[0] as string);
        }
      }
    }
  }, [restaurantId]);

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-rose-500">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#282C3F]">Restaurant Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The outlet you are searching for does not exist or has moved.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 bg-[#FC8019] hover:bg-[#E06D0F] active:scale-95 text-xs font-bold px-4 py-2.5 rounded-xl text-white transition-all shadow"
        >
          Return to Discovery
        </button>
      </div>
    );
  }

  // Get list of menu categories
  const categories = Array.from(new Set(restaurant.menu.map((item: any) => item.category))) as string[];

  // Filter menu items by category + search query
  const filteredMenuItems = restaurant.menu.filter((item: any) => {
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6 relative">
      
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/")}
          className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-655 hover:text-[#282C3F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
          Home / Bangalore / <span className="text-[#282C3F] font-extrabold">{restaurant.name}</span>
        </span>
      </div>

      {/* Restaurant Header Banner Card */}
      <section className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FC8019]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#282C3F] tracking-tight">{restaurant.name}</h2>
          <p className="text-xs text-slate-500 mt-1">{restaurant.cuisines.join(", ")}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-500 font-semibold">
            <RatingBadge rating={restaurant.rating} />
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{restaurant.deliveryTime} mins</span>
            </div>
            <span className="text-slate-300">•</span>
            <span>₹{restaurant.costForTwo} for two</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 text-[10px] text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-[#FC8019]" />
            <span>{restaurant.address}</span>
          </div>
        </div>

        {/* Highlighted active offer banner */}
        <div className="bg-slate-50 border border-[#FC8019]/25 rounded-2xl p-4 flex flex-col gap-1 flex-shrink-0 w-full md:w-auto md:min-w-[200px] shadow-sm">
          <span className="text-[9px] text-[#FC8019] font-black uppercase tracking-wider">Active Deals</span>
          <span className="text-xs font-black text-[#282C3F]">{restaurant.offer.split("|")[0]}</span>
          <span className="text-[10px] text-slate-500">{restaurant.offer.split("|")[1] || "All payments accepted"}</span>
        </div>
      </section>

      {/* Dietitian Consultation Feature banner */}
      <section className="bg-white border-2 border-[#FC8019]/40 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
        <div className="flex items-center gap-3.5 text-center sm:text-left flex-col sm:flex-row">
          <div className="w-10 h-10 rounded-xl bg-[#FC8019]/10 border border-[#FC8019]/25 flex items-center justify-center text-[#FC8019] shadow">
            <svg
              role="img"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5.5 h-5.5 text-[#FC8019]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.034 24c-.376-.411-2.075-2.584-3.95-5.513-.547-.916-.901-1.63-.833-1.814.178-.48 3.355-.743 4.333-.308.298.132.29.307.29.409 0 .44-.022 1.619-.022 1.619a.441.441 0 1 0 .883-.002l-.005-2.939c0-.255-.278-.319-.331-.329-.511-.002-1.548-.006-2.661-.006-2.457 0-3.006.101-3.423-.172-.904-.591-2.383-4.577-2.417-6.819C3.849 4.964 5.723 2.225 8.362.868A8.13 8.13 0 0 1 12.026 0c4.177 0 7.617 3.153 8.075 7.209l.001.011c.084.981-5.321 1.189-6.39.904-.164-.044-.206-.212-.206-.284L13.5 4.996a.442.442 0 0 0-.884.002l.009 3.866a.33.33 0 0 0 .268.32l3.354-.001c1.79 0 2.542.207 3.042.588.333.254.461.739.349 1.37C18.633 16.755 12.273 23.71 12.034 24z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-black text-[#282C3F] uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FC8019] animate-pulse" />
              <span>Dietitian Coach Mode</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Let AI scan this specific menu, rank calories, and select proteins!</p>
          </div>
        </div>
        <button
          onClick={() => setIsDietitianOpen(true)}
          className="bg-gradient-to-r from-[#FC8019] to-amber-500 hover:shadow-lg hover:shadow-[#FC8019]/20 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl active:scale-95 transition-all flex-shrink-0 flex items-center gap-1.5"
        >
          <svg
            role="img"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3.5 h-3.5 text-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.034 24c-.376-.411-2.075-2.584-3.95-5.513-.547-.916-.901-1.63-.833-1.814.178-.48 3.355-.743 4.333-.308.298.132.29.307.29.409 0 .44-.022 1.619-.022 1.619a.441.441 0 1 0 .883-.002l-.005-2.939c0-.255-.278-.319-.331-.329-.511-.002-1.548-.006-2.661-.006-2.457 0-3.006.101-3.423-.172-.904-.591-2.383-4.577-2.417-6.819C3.849 4.964 5.723 2.225 8.362.868A8.13 8.13 0 0 1 12.026 0c4.177 0 7.617 3.153 8.075 7.209l.001.011c.084.981-5.321 1.189-6.39.904-.164-.044-.206-.212-.206-.284L13.5 4.996a.442.442 0 0 0-.884.002l.009 3.866a.33.33 0 0 0 .268.32l3.354-.001c1.79 0 2.542.207 3.042.588.333.254.461.739.349 1.37C18.633 16.755 12.273 23.71 12.034 24z" />
          </svg>
          <span>Consult Dietitian 🥦</span>
        </button>
      </section>

      {/* Menu Categories Nav and Dishes Search Bar */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pb-2 border-b border-slate-100">
          
          {/* Menu Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-black px-3.5 py-2 rounded-xl border flex-shrink-0 transition-all ${
                    isSelected
                      ? "bg-[#FC8019] border-[#FC8019] text-white shadow-md shadow-[#FC8019]/10"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-[#282C3F]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Menu items search input */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FC8019] rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none text-[#282C3F] placeholder-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="space-y-4">
          {filteredMenuItems.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                <Compass className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#282C3F]">No dishes match your active filters</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Try looking for another category or searching differently.</p>
            </div>
          ) : (
            filteredMenuItems.map((item: any) => (
              <FoodCard
                key={item.id}
                item={item}
                restaurantId={restaurant.id}
                restaurantName={restaurant.name}
              />
            ))
          )}
        </div>
      </section>

      {/* Floating Side Dietitian Drawer Panel */}
      <DietitianDrawer
        isOpen={isDietitianOpen}
        onClose={() => setIsDietitianOpen(false)}
        restaurant={restaurant}
      />

    </div>
  );
}
