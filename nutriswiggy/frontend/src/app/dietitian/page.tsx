"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { MealCard, MealProps } from "@/components/MealCard";
import { useCartStore } from "@/store/useCartStore";
import { Leaf, Trophy, ShieldCheck, Compass, Check, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DietitianPage() {
  const { cart, addItem, removeItem } = useCartStore();
  const [recommendedMeals, setRecommendedMeals] = useState<MealProps[]>([]);
  const [filterQuery, setFilterQuery] = useState("");

  // Resizable columns state for a spacious 2-column desktop view
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [widths, setWidths] = useState({ col1: 45, col2: 55 });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      
      const relativeX = e.clientX - containerRect.left;
      const percentageX = (relativeX / containerWidth) * 100;

      setWidths(() => {
        const newCol1 = Math.max(30, Math.min(70, percentageX));
        return {
          col1: newCol1,
          col2: 100 - newCol1,
        };
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleRecommendations = (meals: MealProps[]) => {
    setRecommendedMeals(meals);
  };

  // Bind to global Zustand store!
  const handleToggleCart = (meal: MealProps) => {
    const existing = cart.find((x) => x.id === meal.id);
    if (existing) {
      removeItem(meal.id);
    } else {
      addItem({
        id: meal.id,
        name: meal.item,
        price: meal.price,
        veg: meal.veg,
        restaurantId: "diet-rest", // Simulated ID for dietitian recommendations
        restaurantName: meal.restaurant,
        macros: meal.macros,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150" // Fallback healthy bowl image
      });
    }
  };

  const dietFilters = [
    { name: "Vegetarian 🌱", query: "High protein vegetarian meal" },
    { name: "Under 400 kcal 🥦", query: "Low calorie healthy meal under 400 calories" },
    { name: "Keto / Low Carb 🥑", query: "Keto low carb healthy meal" },
    { name: "Protein Powerhouse 🍗", query: "High protein muscle gain meal" },
  ];

  const swiggyLogoIcon = (className: string) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.034 24c-.376-.411-2.075-2.584-3.95-5.513-.547-.916-.901-1.63-.833-1.814.178-.48 3.355-.743 4.333-.308.298.132.29.307.29.409 0 .44-.022 1.619-.022 1.619a.441.441 0 1 0 .883-.002l-.005-2.939c0-.255-.278-.319-.331-.329-.511-.002-1.548-.006-2.661-.006-2.457 0-3.006.101-3.423-.172-.904-.591-2.383-4.577-2.417-6.819C3.849 4.964 5.723 2.225 8.362.868A8.13 8.13 0 0 1 12.026 0c4.177 0 7.617 3.153 8.075 7.209l.001.011c.084.981-5.321 1.189-6.39.904-.164-.044-.206-.212-.206-.284L13.5 4.996a.442.442 0 0 0-.884.002l.009 3.866a.33.33 0 0 0 .268.32l3.354-.001c1.79 0 2.542.207 3.042.588.333.254.461.739.349 1.37C18.633 16.755 12.273 23.71 12.034 24z" />
    </svg>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-6 relative overflow-x-hidden">
      
      {/* Dietitian Header Card */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-white border border-slate-100 rounded-3xl p-5 gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FC8019] to-amber-500 flex items-center justify-center shadow-lg shadow-[#FC8019]/25">
            {swiggyLogoIcon("w-6.5 h-6.5 text-white")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-[#282C3F] flex items-center gap-1.5">
                Nutri<span className="text-[#FC8019]">Dietitian</span>
              </h1>
              <span className="bg-[#FC8019]/10 text-[#FC8019] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#FC8019]/25">
                AI Coach
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Unified health scoring assistant powered by Google Gemini</p>
          </div>
        </div>

        {/* Quick dietary goals */}
        <div className="flex flex-wrap gap-2 justify-center">
          {dietFilters.map((filter, idx) => (
            <button
              key={idx}
              onClick={() => setFilterQuery(filter.query)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 border border-slate-205 hover:border-[#FC8019] rounded-xl transition-all duration-200 flex items-center gap-1"
            >
              <span>{filter.name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Info notice about unified cart */}
      <div className="bg-slate-50 border border-slate-100 p-3 px-4 rounded-2xl flex items-center gap-2 text-slate-600 text-xs shadow-sm">
        <Info className="w-4 h-4 text-[#FC8019] flex-shrink-0" />
        <p>
          🛒 <strong>Unified Cart System Active:</strong> Adding healthy items from the Discovery Board directly synchronizes with your main cart. Check your navbar or cart tab to place orders instantly!
        </p>
      </div>

      {/* 2-Column Desktop Resizable Layout */}
      <div 
        ref={containerRef}
        className={`flex flex-col lg:flex-row gap-6 lg:gap-0 items-stretch ${isResizing ? "select-none" : ""}`}
      >
        
        {/* Column 1: Conversational Chat Interface */}
        <section 
          style={{ flex: isDesktop ? `${widths.col1} ${widths.col1} 0%` : undefined }}
          className="w-full lg:w-auto h-[650px] flex flex-col"
        >
          <ChatInterface 
            onRecommendationsFound={handleRecommendations} 
            activeFilter={filterQuery}
          />
        </section>

        {/* Drag Resizer divider */}
        <div 
          onMouseDown={startResize}
          className="hidden lg:flex w-6 cursor-col-resize items-center justify-center group flex-shrink-0 select-none relative z-10"
        >
          <div className="w-[2px] h-[90%] bg-slate-200 group-hover:bg-[#FC8019]/50 group-active:bg-[#FC8019] transition-colors duration-200 rounded-full" />
          <div className="absolute inset-0 w-full h-full cursor-col-resize" />
        </div>

        {/* Column 2: Discovery Board and Card Grid */}
        <section 
          style={{ flex: isDesktop ? `${widths.col2} ${widths.col2} 0%` : undefined }}
          className="w-full lg:w-auto space-y-4 h-[650px] flex flex-col"
        >
          {/* Header */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center gap-3 shadow-sm">
            <div>
              <h2 className="text-sm font-black text-[#282C3F] uppercase tracking-widest flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#FC8019]" />
                <span>Discovery Board</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">Smart calorie & protein scored options</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Scanned Matches:</span>
              <span className="text-xs font-black text-[#FC8019] bg-[#FC8019]/10 px-2 py-0.5 rounded-lg border border-[#FC8019]/25 shadow-sm">
                {recommendedMeals.length}
              </span>
            </div>
          </div>

          {/* Grid list container */}
          <div className="flex-1 overflow-y-auto pr-1">
            <AnimatePresence mode="wait">
              {recommendedMeals.length === 0 ? (
                // Empty state
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-sm"
                >
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-3 border border-slate-200 relative overflow-hidden group shadow-sm">
                    <Leaf className="w-5.5 h-5.5 text-[#FC8019] animate-bounce-slow" />
                  </div>
                  <h3 className="text-sm font-bold text-[#282C3F]">Awaiting Dietitian Query</h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed mt-1 mb-4">
                    Submit a dietary goal (e.g. <span className="text-[#FC8019] font-bold">"Keto Salad Bowl"</span>) in the chat on the left to see matches!
                  </p>

                  <div className="grid grid-cols-1 gap-2 w-full max-w-xs mt-2 text-left">
                    <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-start gap-2 shadow-sm">
                      <Trophy className="w-4 h-4 text-amber-500 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-[#282C3F] block">Macro Efficiency</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 leading-normal">Optimizes recipes based on pure protein density.</span>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-start gap-2 shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-[#FC8019] mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-[#282C3F] block">Frying Penalty Applied</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 leading-normal">Filters out deep-fried recipes to reduce inflammatory lipids.</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="meal-grid"
                  initial="hidden"
                  animate="show"
                  variants={{
                    show: { transition: { staggerChildren: 0.08 } }
                  }}
                  className="grid grid-cols-1 gap-4 pb-4"
                >
                  {recommendedMeals.map((meal) => (
                    <motion.div
                      key={meal.id}
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        show: { opacity: 1, y: 0 }
                      }}
                    >
                      <MealCard 
                        meal={meal} 
                        isInCart={cart.some((x) => x.id === meal.id)}
                        onToggleCart={() => handleToggleCart(meal)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

      </div>

    </div>
  );
}
