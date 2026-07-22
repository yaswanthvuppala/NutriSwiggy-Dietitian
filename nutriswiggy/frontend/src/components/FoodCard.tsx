"use client";

import React from "react";
import { useCartStore } from "@/store/useCartStore";
import { Flame, Trophy, ShieldCheck, Heart, Leaf } from "lucide-react";
import { motion } from "framer-motion";

interface FoodCardProps {
  item: {
    id: string;
    name: string;
    price: number;
    description: string;
    veg: boolean;
    macros: { calories: number; protein: number; carbohydrates: number; fats: number; fiber: number };
    healthScore: number;
    badges: string[];
    image: string;
    matchRationale?: string;
  };
  restaurantId: string;
  restaurantName: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, restaurantId, restaurantName }) => {
  const { id, name, price, description, veg, macros, healthScore, badges, image } = item;
  
  const { cart, addItem, updateQuantity } = useCartStore();

  const cartItem = cart.find((i) => i.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addItem({
      id,
      name,
      price,
      veg,
      restaurantId,
      restaurantName,
      macros,
      image
    });
  };

  const handleDecrement = () => {
    updateQuantity(id, quantity - 1);
  };

  const handleIncrement = () => {
    updateQuantity(id, quantity + 1);
  };

  // Score colors
  const getScoreBadge = (score: number) => {
    if (score >= 90) return "bg-emerald-500/10 text-healthy-emerald border-emerald-500/20";
    if (score >= 80) return "bg-teal-500/10 text-teal-650 border-teal-500/20";
    return "bg-amber-500/10 text-amber-655 border-amber-500/20";
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-stretch gap-4 md:gap-6 hover:border-slate-200 hover:shadow-md transition-all duration-300 relative group">
      
      {/* Visual health indicator background border */}
      {healthScore >= 90 && (
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-healthy-emerald rounded-l-2xl" />
      )}

      {/* Info Column */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Veg/Non-Veg & Health Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center p-0.5 ${veg ? "border-green-600" : "border-red-600"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${veg ? "bg-green-600" : "bg-red-600"}`} />
            </div>
            
            {healthScore >= 80 && (
              <span className={`text-[9px] font-black border px-2 py-0.5 rounded-full uppercase tracking-wider ${getScoreBadge(healthScore)}`}>
                Health Score: {healthScore}
              </span>
            )}

            {badges.slice(0, 2).map((badge, idx) => (
              <span key={idx} className="bg-[#FC8019]/8 text-[#FC8019] border border-[#FC8019]/15 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {badge}
              </span>
            ))}
          </div>

          {/* Dish Name */}
          <h4 className="text-base font-bold text-[#282C3F] group-hover:text-[#FC8019] transition-colors duration-200">
            {name}
          </h4>

          {/* Price */}
          <div className="text-sm font-black text-[#282C3F] mt-1">
            ₹{price}
          </div>

          {/* Description */}
          <p className="text-xs text-slate-550 mt-2 line-clamp-2 md:line-clamp-3 leading-relaxed pr-2">
            {description}
          </p>
        </div>

        {/* Macros Subpanel */}
        {macros && (
          <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-2.5 max-w-sm flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-655">
              <Flame className="w-3.5 h-3.5 text-[#FC8019]" />
              <span>{macros.calories} kcal</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#2E9A55]">
              <Trophy className="w-3.5 h-3.5" />
              <span>{macros.protein}g Protein</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="text-[10px] font-bold text-amber-600">
              <span>{macros.carbohydrates}g Carbs</span>
            </div>
          </div>
        )}
      </div>

      {/* Image & Add-to-Cart Action Area */}
      <div className="flex flex-row md:flex-col items-center justify-between md:justify-center md:items-end gap-3 min-w-[120px]">
        {/* Food Image */}
        <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden relative shadow border border-slate-150">
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
        </div>

        {/* Dynamic Quantity Selector */}
        <div className="w-24 md:w-28 flex items-center justify-center">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 text-xs font-black text-[#282C3F] hover:text-[#FC8019] hover:border-[#FC8019] rounded-xl transition-all shadow-md flex items-center justify-center gap-1"
            >
              + Add
            </button>
          ) : (
            <div className="w-full flex items-center justify-between border border-[#FC8019]/60 bg-white rounded-xl overflow-hidden shadow-md">
              <button
                onClick={handleDecrement}
                className="w-8 py-2 text-slate-500 hover:text-[#282C3F] font-black hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center"
              >
                -
              </button>
              <span className="text-xs font-black text-[#282C3F] px-2">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                className="w-8 py-2 text-slate-500 hover:text-[#FC8019] font-black hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
export default FoodCard;
