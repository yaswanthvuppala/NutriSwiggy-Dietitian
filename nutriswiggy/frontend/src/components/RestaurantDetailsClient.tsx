"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RESTAURANTS } from "@/utils/mockData";
import { FoodCard } from "@/components/FoodCard";
import { RatingBadge } from "@/components/RatingBadge";
import { DietitianDrawer } from "@/components/DietitianDrawer";
import { ArrowLeft, Clock, MapPin, ShieldAlert, Sparkles, Compass, Search } from "lucide-react";
import { NativeBridge } from "@/services/nativeBridge";

interface RestaurantDetailsClientProps {
  initialRestaurantId?: string;
}

export const RestaurantDetailsClient: React.FC<RestaurantDetailsClientProps> = ({ initialRestaurantId }) => {
  const params = useParams();
  const router = useRouter();
  const restaurantId = (initialRestaurantId || params?.id) as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDietitianOpen, setIsDietitianOpen] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      const found = RESTAURANTS.find((r) => r.id === restaurantId);
      if (found) {
        setRestaurant(found);
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
          onClick={() => {
            NativeBridge.triggerHaptic("light");
            router.push("/");
          }}
          className="mt-6 bg-[#FC8019] hover:bg-[#E06D0F] active:scale-95 text-xs font-bold px-4 py-2.5 rounded-xl text-white transition-all shadow"
        >
          Return to Discovery
        </button>
      </div>
    );
  }

  const categories = Array.from(new Set(restaurant.menu.map((item: any) => item.category))) as string[];

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
          onClick={() => {
            NativeBridge.triggerHaptic("light");
            router.push("/");
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-300 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
          Home / Bangalore / <span className="text-white font-extrabold">{restaurant.name}</span>
        </span>
      </div>

      {/* Restaurant Header Banner Card */}
      <section className="bg-slate-800/80 border border-slate-700 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FC8019]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">{restaurant.name}</h2>
          <p className="text-xs text-slate-400 mt-1">{restaurant.cuisines.join(", ")}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-400 font-semibold">
            <RatingBadge rating={restaurant.rating} />
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{restaurant.deliveryTime} mins</span>
            </div>
            <span className="text-slate-600">•</span>
            <span>₹{restaurant.costForTwo} for two</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3.5 text-[10px] text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-[#FC8019]" />
            <span>{restaurant.address}</span>
          </div>
        </div>

        {/* Highlighted active offer banner */}
        <div className="bg-slate-900/60 border border-[#FC8019]/25 rounded-2xl p-4 flex flex-col gap-1 flex-shrink-0 w-full md:w-auto md:min-w-[200px] shadow-sm">
          <span className="text-[9px] text-[#FC8019] font-black uppercase tracking-wider">Active Deals</span>
          <span className="text-xs font-black text-white">{restaurant.offer.split("|")[0]}</span>
          <span className="text-[10px] text-slate-400">{restaurant.offer.split("|")[1] || "All payments accepted"}</span>
        </div>
      </section>

      {/* Dietitian Consultation Feature banner */}
      <section className="bg-slate-800/90 border-2 border-[#FC8019]/40 rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 text-center sm:text-left flex-col sm:flex-row">
          <div className="w-10 h-10 rounded-xl bg-[#FC8019]/15 border border-[#FC8019]/30 flex items-center justify-center text-[#FC8019] shadow">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1">
              <span>Dietitian Coach Mode</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Let AI scan this specific menu, rank calories, and select proteins!</p>
          </div>
        </div>
        <button
          onClick={() => {
            NativeBridge.triggerHaptic("medium");
            setIsDietitianOpen(true);
          }}
          className="bg-gradient-to-r from-[#FC8019] to-amber-500 hover:shadow-lg hover:shadow-[#FC8019]/20 text-white font-extrabold text-xs px-5 py-3 rounded-xl active:scale-95 transition-all flex-shrink-0 flex items-center gap-1.5 shadow"
        >
          <span>Consult Dietitian 🥦</span>
        </button>
      </section>

      {/* Menu Categories Nav and Dishes Search Bar */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pb-2 border-b border-slate-800">
          {/* Menu Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin touch-scroll">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    NativeBridge.triggerHaptic("light");
                    setSelectedCategory(cat);
                  }}
                  className={`text-xs font-black px-4 py-2.5 rounded-xl border flex-shrink-0 active:scale-95 transition-all ${
                    isSelected
                      ? "bg-[#FC8019] border-[#FC8019] text-white shadow-md shadow-[#FC8019]/20"
                      : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
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
              className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-[#FC8019] rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none text-white placeholder-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="space-y-4">
          {filteredMenuItems.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                <Compass className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white">No dishes match your active filters</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try looking for another category or searching differently.</p>
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
};
