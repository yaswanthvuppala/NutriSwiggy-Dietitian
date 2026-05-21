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

  // Set health score color schemes
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-healthy-emerald border-healthy-emerald/30 bg-healthy-emerald/10 shadow-healthy-emerald/10";
    if (score >= 60) return "text-amber-400 border-amber-400/30 bg-amber-400/10 shadow-amber-400/10";
    return "text-rose-400 border-rose-400/30 bg-rose-400/10 shadow-rose-400/10";
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-full relative overflow-hidden group">
      
      {/* Decorative gradient glowing orb inside card */}
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-swiggy-orange/5 rounded-full blur-2xl group-hover:bg-swiggy-orange/10 transition-all duration-500" />
      
      <div>
        {/* Header: Veg/Non-Veg & Restaurant & Price */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {/* Swiggy veg/non-veg icon replica */}
            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center p-0.5 ${veg ? "border-green-600" : "border-red-600"}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${veg ? "bg-green-600" : "bg-red-600"}`} />
            </div>
            <span className="text-xs font-semibold text-swiggy-gray tracking-wider uppercase">{restaurant}</span>
          </div>
          <span className="text-sm font-bold text-white">₹{price}</span>
        </div>

        {/* Meal Name */}
        <h3 className="text-lg font-bold text-slate-100 mb-2 leading-tight group-hover:text-swiggy-orange transition-colors duration-300">
          {item}
        </h3>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {badges.map((badge, idx) => (
            <span
              key={idx}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                badge === "Top Pick"
                  ? "bg-gradient-to-r from-swiggy-orange to-amber-500 text-white"
                  : badge.includes("Protein")
                  ? "bg-healthy-emerald/20 text-healthy-emerald"
                  : badge.includes("Fiber")
                  ? "bg-blue-500/20 text-blue-400"
                  : badge.includes("Keto")
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Dynamic Macros Display */}
        <div className="bg-[#131d31] rounded-xl p-3 mb-4 shadow-inner">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
              <Flame className="w-3.5 h-3.5 text-swiggy-orange animate-pulse" />
              <span>{macros.calories} kcal</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Estimated Macros</span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-[11px]">
            {/* Protein bar */}
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Protein</span>
                <span className="font-bold text-healthy-emerald">{macros.protein}g</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-healthy-emerald rounded-full" style={{ width: `${proteinPercentage}%` }} />
              </div>
            </div>

            {/* Fiber bar */}
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Fiber</span>
                <span className="font-bold text-blue-400">{macros.fiber}g</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${fiberPercentage}%` }} />
              </div>
            </div>

            {/* Carbs bar */}
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Carbs</span>
                <span className="font-bold text-amber-400">{macros.carbohydrates}g</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${carbsPercentage}%` }} />
              </div>
            </div>

            {/* Fat bar */}
            <div>
              <div className="flex justify-between text-slate-400 mb-0.5">
                <span>Fat</span>
                <span className="font-bold text-rose-400">{macros.fats}g</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full" style={{ width: `${fatPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rationale and Rating Section */}
      <div className="mt-auto pt-3 border-t border-slate-800/80">
        
        {/* Scoring & Modifiers indicators */}
        <div className="flex flex-col gap-1 mb-3">
          {bonuses_applied.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-healthy-emerald font-semibold bg-healthy-emerald/5 px-2 py-0.5 rounded">
              <Award className="w-3 h-3 flex-shrink-0" />
              <span>Bonus: {bonuses_applied.join(", ")} (+5)</span>
            </div>
          )}
          {penalties_applied.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold bg-rose-400/5 px-2 py-0.5 rounded">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              <span>Penalized: {penalties_applied.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Why it matches (Dietitian take) */}
        <div className="bg-slate-900/60 border-l-2 border-swiggy-orange rounded-r-lg p-2.5 mb-3">
          <div className="flex items-center gap-1 text-[10px] text-swiggy-orange font-bold uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3 h-3" />
            <span>AI Dietitian Take</span>
          </div>
          <p className="text-[11px] text-slate-300 italic leading-relaxed">
            "{match_rationale}"
          </p>
        </div>

        {/* Health Score Medallion & Add to Cart Toggle */}
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-healthy-emerald" />
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
                  ? "bg-healthy-emerald text-white border-healthy-emerald/30 hover:bg-healthy-emerald/90 shadow-lg shadow-healthy-emerald/10"
                  : "bg-slate-800 text-slate-200 border-slate-700/80 hover:border-swiggy-orange hover:text-swiggy-orange"
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
              <span className="text-[10px] opacity-70">/99</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
