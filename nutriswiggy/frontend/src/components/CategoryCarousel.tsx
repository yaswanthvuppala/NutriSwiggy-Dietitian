"use client";

import React from "react";
import { CATEGORIES } from "@/utils/mockData";
import { useCartStore } from "@/store/useCartStore";
import { Leaf } from "lucide-react";

export const CategoryCarousel = () => {
  const { activeFilter, setActiveFilter } = useCartStore();

  const handleSelectCategory = (catName: string) => {
    if (activeFilter === catName) {
      setActiveFilter("All");
    } else {
      setActiveFilter(catName);
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 pr-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
        
        {/* 'All' category chip */}
        <button
          onClick={() => setActiveFilter("All")}
          className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-bold transition-all duration-200 hover:scale-102 ${
            activeFilter === "All"
              ? "bg-[#FC8019] border-[#FC8019] text-white shadow-lg shadow-[#FC8019]/25"
              : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
          }`}
        >
          <span>All Foods</span>
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = activeFilter === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.name)}
              className={`flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-2xl border text-sm font-bold transition-all duration-200 hover:scale-102 ${
                isSelected
                  ? "bg-[#FC8019] border-[#FC8019] text-white shadow-lg shadow-[#FC8019]/25"
                  : cat.name.includes("Healthy")
                  ? "bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40 text-healthy-emerald"
                  : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default CategoryCarousel;
