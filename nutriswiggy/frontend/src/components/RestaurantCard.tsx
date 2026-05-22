"use client";

import React from "react";
import Link from "next/link";
import { RatingBadge } from "./RatingBadge";
import { Compass, Leaf, Clock, Tag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";

interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    rating: number;
    ratingCount: string;
    deliveryTime: number;
    distance: number;
    costForTwo: number;
    cuisines: string[];
    image: string;
    veg: boolean;
    offer: string;
    menu?: any[];
  };
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const { id, name, rating, deliveryTime, distance, costForTwo, cuisines, image, veg, offer, menu } = restaurant;
  const { dietitianMode } = useCartStore();

  const avgHealthScore = menu && menu.length > 0
    ? Math.round(menu.reduce((sum: number, item: any) => sum + item.healthScore, 0) / menu.length)
    : 85;

  // Dietitian recommendation tags
  const healthyTags = menu
    ? Array.from(new Set(menu.flatMap((item: any) => item.badges || []))).slice(0, 3)
    : ["Healthy Food", "Nutritious"];

  return (
    <Link href={`/restaurant/${id}`}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`glass-card rounded-2xl overflow-hidden flex flex-col h-full border transition-all duration-300 relative group cursor-pointer ${
          dietitianMode 
            ? "border-slate-100 hover:border-[#FC8019]/60 hover:shadow-xl hover:shadow-[#FC8019]/10" 
            : "border-slate-100 hover:border-[#FC8019]/30 hover:shadow-xl hover:shadow-[#FC8019]/5"
        }`}
      >
        {/* Offer Tag Badge / Health Score Badge on Top of Image */}
        {dietitianMode ? (
          <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md border border-[#FC8019]/40 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-md shadow-[#FC8019]/5">
            <Sparkles className="w-3.5 h-3.5 text-[#FC8019]" />
            <span className="text-[10px] font-black text-[#282C3F] tracking-wide">{avgHealthScore}/100 Health Score</span>
          </div>
        ) : (
          <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-md">
            <Tag className="w-3.5 h-3.5 text-[#FC8019]" />
            <span className="text-[10px] font-black text-[#282C3F] tracking-wide">{offer.split("|")[0]}</span>
          </div>
        )}

        {/* Veg Badge */}
        {veg && (
          <div className="absolute top-3 right-3 z-10 bg-emerald-500/15 border border-emerald-500/35 rounded-xl px-2 py-0.5 flex items-center gap-1 shadow-md">
            <Leaf className="w-3 h-3 text-healthy-emerald fill-current" />
            <span className="text-[9px] font-extrabold text-healthy-emerald uppercase tracking-wider">Veg</span>
          </div>
        )}

        {/* Image Container with Gradient Overlay */}
        <div className="w-full h-44 overflow-hidden relative">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        </div>

        {/* Details Section */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#282C3F] line-clamp-1 group-hover:text-[#FC8019] transition-colors duration-200">
              {name}
            </h3>
            
            {/* Cuisines or Healthy Tags */}
            {dietitianMode ? (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {healthyTags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="text-[9px] font-extrabold tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#FC8019]/8 text-[#FC8019] border border-[#FC8019]/15"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {cuisines.join(", ")}
              </p>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-650 font-semibold gap-2">
            
            {/* Rating */}
            <RatingBadge rating={rating} />

            {/* Time */}
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{deliveryTime} mins</span>
            </div>

            {/* Price */}
            <div>
              <span>₹{costForTwo} for two</span>
            </div>

          </div>
        </div>
      </motion.div>
    </Link>
  );
};
export default RestaurantCard;
