import React from "react";
import { ShieldCheck, Flame, Award, AlertTriangle, Sparkles, Check } from "lucide-react";

export interface MacroData {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
}

export interface MealProps {
  id: string;
  restaurant: string;
  restaurant_id?: string;
  item: string;
  price: number;
  veg: boolean;
  description: string;
  category?: string;
  tags?: string[];
  macros: MacroData;
  raw_score: number;
  health_score: number;
  badges: string[];
  penalties_applied: string[];
  bonuses_applied: string[];
  match_rationale: string;
}

export const MealCard: React.FC<{ 
  meal: MealProps; 
  isInCart?: boolean; 
  onToggleCart?: () => void; 
}> = ({ meal, isInCart = false, onToggleCart }) => {
  const {
    restaurant,
    item,
    price,
    veg,
    description,
    macros,
    health_score,
    badges,
    penalties_applied,
    bonuses_applied,
    match_rationale,
  } = meal;

  // Maximum standard macros to calculate percentages for visual rendering
  const maxProtein = 40;
  const maxCarbs = 80;
  const maxFat = 40;
  const maxFiber = 12;

  const proteinPercentage = Math.min(100, (macros.protein / maxProtein) * 100);
  const carbsPercentage = Math.min(100, (macros.carbohydrates / maxCarbs) * 100);
  const fatPercentage = Math.min(100, (macros.fats / maxFat) * 100);
  const fiberPercentage = Math.min(100, (macros.fiber / maxFiber) * 100);

  // Set health score color schemes adapted for clean light mode
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 border-emerald-200 bg-emerald-50 shadow-sm shadow-emerald-50";
    if (score >= 60) return "text-amber-600 border-amber-200 bg-amber-50 shadow-sm shadow-amber-50";
    return "text-rose-600 border-rose-200 bg-rose-50 shadow-sm shadow-rose-50";
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-full relative overflow-hidden group">
      
      {/* Decorative gradient glowing orb inside card */}
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-[#FC8019]/5 rounded-full blur-2xl group-hover:bg-[#FC8019]/10 transition-all duration-500" />
      
      <div>
        {/* Header: Veg/Non-Veg & Restaurant & Price */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {/* Swiggy veg/non-veg icon replica */}
            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center p-0.5 ${veg ? "border-green-600" : "border-red-600"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${veg ? "bg-green-600" : "bg-red-600"}`} />
            </div>
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">{restaurant}</span>
          </div>
          <span className="text-sm font-bold text-[#282C3F]">₹{price}</span>
        </div>

        {/* Meal Name */}
        <h3 className="text-lg font-bold text-[#282C3F] mb-2 leading-tight group-hover:text-[#FC8019] transition-colors duration-300">
          {item}
        </h3>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {badges.map((badge, idx) => (
            <span
              key={idx}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                badge === "Top Pick"
                  ? "bg-gradient-to-r from-[#FC8019] to-amber-500 border-[#FC8019]/25 text-white"
                  : badge.includes("Protein")
                  ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                  : badge.includes("Fiber")
                  ? "bg-blue-50 border-blue-100 text-blue-600"
                  : badge.includes("Keto")
                  ? "bg-cyan-50 border-cyan-100 text-cyan-600"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Dynamic Macros Display */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
              <Flame className="w-3.5 h-3.5 text-[#FC8019] animate-pulse" />
              <span>{macros.calories} kcal</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Estimated Macros</span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-[11px]">
            {/* Protein bar */}
            <div>
              <div className="flex justify-between text-slate-500 mb-0.5">
                <span>Protein</span>
                <span className="font-bold text-emerald-600">{macros.protein}g</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${proteinPercentage}%` }} />
              </div>
            </div>

            {/* Fiber bar */}
            <div>
              <div className="flex justify-between text-slate-500 mb-0.5">
                <span>Fiber</span>
                <span className="font-bold text-blue-600">{macros.fiber}g</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${fiberPercentage}%` }} />
              </div>
            </div>

            {/* Carbs bar */}
            <div>
              <div className="flex justify-between text-slate-500 mb-0.5">
                <span>Carbs</span>
                <span className="font-bold text-amber-600">{macros.carbohydrates}g</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${carbsPercentage}%` }} />
              </div>
            </div>

            {/* Fat bar */}
            <div>
              <div className="flex justify-between text-slate-500 mb-0.5">
                <span>Fat</span>
                <span className="font-bold text-rose-600">{macros.fats}g</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${fatPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rationale and Rating Section */}
      <div className="mt-auto pt-3 border-t border-slate-100">
        
        {/* Scoring & Modifiers indicators */}
        <div className="flex flex-col gap-1 mb-3">
          {bonuses_applied.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">
              <Award className="w-3 h-3 flex-shrink-0" />
              <span>Bonus: {bonuses_applied.join(", ")} (+5)</span>
            </div>
          )}
          {penalties_applied.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-100/50">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              <span>Penalized: {penalties_applied.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Why it matches (Dietitian take) */}
        <div className="bg-slate-50 border border-slate-100 border-l-2 border-l-[#FC8019] rounded-r-lg p-2.5 mb-3">
          <div className="flex items-center gap-1 text-[10px] text-[#FC8019] font-bold uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3 h-3" />
            <span>AI Dietitian Take</span>
          </div>
          <p className="text-[11px] text-slate-600 italic leading-relaxed">
            "{match_rationale}"
          </p>
        </div>

        {/* Health Score Medallion & Add to Cart Toggle */}
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Smart Scored</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCart?.();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide transition-all duration-200 active:scale-95 flex items-center gap-1 border ${
                isInCart
                  ? "bg-gradient-to-r from-[#FC8019] to-amber-500 text-white border-[#FC8019]/25 hover:opacity-90 shadow-md shadow-[#FC8019]/10"
                  : "bg-white hover:bg-slate-50 text-[#FC8019] hover:text-[#E06D0F] border border-slate-200 hover:border-[#FC8019]"
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3px]" /> Added
                </>
              ) : (
                "+ Add"
              )}
            </button>
            <div className={`flex items-center gap-1 border px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${getScoreColor(health_score)}`}>
              <span>Score:</span>
              <span className="text-sm font-black">{health_score}</span>
              <span className="text-[10px] opacity-70">/100</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default MealCard;
