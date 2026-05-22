"use client";

import React, { useState, useEffect } from "react";
import { RESTAURANTS } from "@/utils/mockData";
import { RestaurantCard } from "@/components/RestaurantCard";
import { FoodCard } from "@/components/FoodCard";
import { Search, Compass, Clock, X, ChevronRight, Percent } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"dishes" | "restaurants">("dishes");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Salads", "Biryani", "High Protein", "Paneer Tikka"
  ]);

  const trendingSearches = [
    "Healthy Quinoa Bowl", "Sourdough Margherita", "Lemon Asparagus Salmon", "Low Carb Veg"
  ];

  // Implement debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Search logic
  const searchResultsDishes: any[] = [];
  const searchResultsRestaurants: any[] = [];

  if (debouncedQuery.trim().length > 0) {
    const term = debouncedQuery.toLowerCase();
    RESTAURANTS.forEach((rest) => {
      // 1. Match restaurants
      const matchesRestName = rest.name.toLowerCase().includes(term) ||
                              rest.cuisines.some((c) => c.toLowerCase().includes(term));
      if (matchesRestName) {
        searchResultsRestaurants.push(rest);
      }

      // 2. Match dishes
      rest.menu.forEach((dish) => {
        const matchesDish = dish.name.toLowerCase().includes(term) ||
                            dish.description.toLowerCase().includes(term) ||
                            dish.category.toLowerCase().includes(term) ||
                            dish.badges.some((b) => b.toLowerCase().includes(term));
        if (matchesDish) {
          searchResultsDishes.push({
            ...dish,
            restaurantId: rest.id,
            restaurantName: rest.name,
          });
        }
      });
    });
  }

  const handleSelectQuery = (q: string) => {
    setQuery(q);
    // Add to recent searches if not present
    if (!recentSearches.includes(q)) {
      setRecentSearches((prev) => [q, ...prev.slice(0, 3)]);
    }
  };

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
      
      {/* Search Bar Input Panel */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for partner restaurants or delicious dishes..."
          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#FC8019] rounded-2xl pl-12 pr-12 py-3 text-sm focus:outline-none text-[#1E293B] placeholder-[#1E293B]/70 transition-colors shadow-sm focus:shadow-md"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Renders Empty State Trends & Recents if no active query */}
      {debouncedQuery.trim().length === 0 ? (
        <div className="space-y-6 pt-2">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs text-[#334155] font-bold uppercase tracking-wider">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuery(s)}
                    className="text-xs font-bold px-3.5 py-2 bg-[#F1F5F9] border border-slate-200 rounded-xl hover:bg-slate-200/60 hover:border-slate-300 text-[#334155] hover:text-[#1E293B] transition-colors flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="space-y-3">
            <h3 className="text-xs text-[#334155] font-bold uppercase tracking-wider">Popular Searches</h3>
            <div className="flex flex-col border border-slate-800/60 rounded-2xl bg-slate-900/10 overflow-hidden divide-y divide-slate-850">
              {trendingSearches.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectQuery(s)}
                  className="w-full px-4 py-3 hover:bg-slate-900/40 text-left text-xs font-bold text-slate-300 hover:text-[#FC8019] transition-all flex justify-between items-center"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    {s}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Renders Search Results */
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("dishes")}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider relative transition-colors ${
                activeTab === "dishes" ? "text-[#FC8019]" : "text-slate-500 hover:text-black"
              }`}
            >
              Dishes ({searchResultsDishes.length})
              {activeTab === "dishes" && (
                <motion.div layoutId="searchTabUnderline" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#FC8019] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("restaurants")}
              className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider relative transition-colors ${
                activeTab === "restaurants" ? "text-[#FC8019]" : "text-slate-500 hover:text-black"
              }`}
            >
              Restaurants ({searchResultsRestaurants.length})
              {activeTab === "restaurants" && (
                <motion.div layoutId="searchTabUnderline" className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#FC8019] rounded-full" />
              )}
            </button>
          </div>

          {/* Results Listings */}
          <div className="space-y-4">
            {activeTab === "dishes" ? (
              searchResultsDishes.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/20 border border-slate-800/50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-350">No dishes match your query "{debouncedQuery}"</p>
                  <p className="text-[11px] text-slate-500 mt-1">Try looking for general items like 'salad', 'protein', or 'pizza'.</p>
                </div>
              ) : (
                searchResultsDishes.map((dish) => (
                  <FoodCard
                    key={dish.id}
                    item={dish}
                    restaurantId={dish.restaurantId}
                    restaurantName={dish.restaurantName}
                  />
                ))
              )
            ) : (
              searchResultsRestaurants.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/20 border border-slate-800/50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-350">No outlets match your query "{debouncedQuery}"</p>
                  <p className="text-[11px] text-slate-500 mt-1">Try looking for cuisines like 'Salads' or restaurant names.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {searchResultsRestaurants.map((rest) => (
                    <RestaurantCard key={rest.id} restaurant={rest} />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}

    </div>
  );
}
