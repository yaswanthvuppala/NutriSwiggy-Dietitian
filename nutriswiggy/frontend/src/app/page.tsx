"use client";

import React, { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { MealCard, MealProps } from "@/components/MealCard";
import { Apple, Leaf, Trophy, ShieldCheck, Flame, Compass, ChevronDown, Check, ShoppingCart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [recommendedMeals, setRecommendedMeals] = useState<MealProps[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [cart, setCart] = useState<MealProps[]>([]);

  const handleRecommendations = (meals: MealProps[]) => {
    setRecommendedMeals(meals);
  };

  const handleToggleCart = (meal: MealProps) => {
    setCart((prev) => {
      const exists = prev.some((x) => x.id === meal.id);
      if (exists) {
        return prev.filter((x) => x.id !== meal.id);
      } else {
        return [...prev, meal];
      }
    });
  };

  const totalCalories = cart.reduce((sum, item) => sum + (item.macros?.calories || 0), 0);
  const totalProtein = cart.reduce((sum, item) => sum + (item.macros?.protein || 0), 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  // Set filter categories to feed directly into the chat prompt
  const dietFilters = [
    { name: "Vegetarian 🌱", query: "High protein vegetarian meal" },
    { name: "Under 400 kcal 🥦", query: "Low calorie healthy meal under 400 calories" },
    { name: "Keto / Low Carb 🥑", query: "Keto low carb healthy meal" },
    { name: "Protein Powerhouse 🍗", query: "High protein muscle gain meal" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#0b0f19] py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-swiggy-orange/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-healthy-emerald/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Hackathon Premium Header */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-swiggy-orange to-amber-500 flex items-center justify-center shadow-lg shadow-swiggy-orange/30">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  Nutri<span className="text-swiggy-orange">Swiggy</span>
                </h1>
                <span className="text-[10px] font-extrabold bg-healthy-emerald/20 text-healthy-emerald px-2 py-0.5 rounded-full uppercase tracking-wider border border-healthy-emerald/30">
                  Hackathon MVP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Swiggy Builders Club • AI-Powered Dietitian and Healthy Menu Assistant</p>
            </div>
          </div>

          {/* Quick Dietary Action Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {dietFilters.map((filter, idx) => (
              <button
                key={idx}
                onClick={() => setFilterQuery(filter.query)}
                className="text-xs font-semibold px-3 py-2 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700/80 rounded-xl transition-all duration-200 hover:border-swiggy-orange flex items-center gap-1"
              >
                <span>{filter.name}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Dynamic 3-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: Conversational Chat Interface (4 cols) */}
          <section className="lg:col-span-4 h-[650px] flex flex-col">
            <ChatInterface 
              onRecommendationsFound={handleRecommendations} 
              activeFilter={filterQuery}
            />
          </section>

          {/* Column 2: Recommendation Board and Card Grid (5 cols) */}
          <section className="lg:col-span-5 space-y-4 h-[650px] flex flex-col">
            
            {/* Board Header / Statistics */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-md font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-swiggy-orange" />
                  <span>Discovery Board</span>
                </h2>
                <p className="text-[11px] text-slate-400">Estimated macro-scores</p>
              </div>

              {/* Match Counter Badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Found:</span>
                <span className="text-xs font-black bg-gradient-to-r from-swiggy-orange to-amber-500 text-white px-2.5 py-0.5 rounded-full border border-swiggy-orange/20 shadow">
                  {recommendedMeals.length}
                </span>
              </div>
            </div>

            {/* Scrollable Grid Container */}
            <div className="flex-1 overflow-y-auto pr-1">
              <AnimatePresence mode="wait">
                {recommendedMeals.length === 0 ? (
                  // Empty State Panel (WOW Factor Glassmorphism design)
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-slate-900/20 rounded-3xl border border-slate-800/60 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800/80 to-slate-950 flex items-center justify-center mb-3 border border-slate-800 shadow-xl relative overflow-hidden group">
                      {/* Internal light glow */}
                      <div className="absolute inset-0 bg-swiggy-orange/5 animate-pulse-slow" />
                      <Leaf className="w-6 h-6 text-healthy-emerald animate-bounce-slow" />
                    </div>
                    <h3 className="text-md font-bold text-slate-200 mb-1">Awaiting Dietitian Analysis</h3>
                    <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed mb-4">
                      Submit a dietary goal in the chat on the left (e.g. <span className="text-swiggy-orange font-semibold">"Keto wrap"</span>) to see options!
                    </p>
                    
                    {/* Live Diet Principles Display */}
                    <div className="grid grid-cols-1 gap-2 w-full max-w-xs mt-2 text-left">
                      <div className="bg-[#121826]/60 border border-slate-800/80 p-2.5 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-0.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Macro-Balanced</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">Optimizes high protein density.</p>
                      </div>

                      <div className="bg-[#121826]/60 border border-slate-800/80 p-2.5 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-0.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-healthy-emerald" />
                          <span>Penalty Enforced</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">Filters deep-fried items.</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Active Grid Layout (Smooth micro-animations on load)
                  <motion.div
                    key="meal-grid"
                    initial="hidden"
                    animate="show"
                    variants={{
                      show: {
                        transition: {
                          staggerChildren: 0.08
                        }
                      }
                    }}
                    className="grid grid-cols-1 gap-4 pb-4"
                  >
                    {recommendedMeals.map((meal) => (
                      <motion.div
                        key={meal.id}
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
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

          {/* Column 3: Swiggy Health Cart & Nutrition Dashboard (3 cols) */}
          <section className="lg:col-span-3 space-y-4 h-[650px] flex flex-col bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-4 overflow-hidden">
            
            {/* Cart Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-swiggy-orange/15 flex items-center justify-center border border-swiggy-orange/20">
                  <ShoppingCart className="w-4 h-4 text-swiggy-orange" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">Health Cart</h2>
                  <p className="text-[9px] text-slate-400">Total nutrients calculator</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-healthy-emerald/20 text-healthy-emerald px-2 py-0.5 rounded-full border border-healthy-emerald/30 shadow">
                {cart.length} Items
              </span>
            </div>

            {/* Cart Body */}
            <div className="flex-1 overflow-y-auto pr-0.5 space-y-2.5 min-h-0">
              <AnimatePresence mode="wait">
                {cart.length === 0 ? (
                  // Empty State inside Cart
                  <motion.div
                    key="empty-cart"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full flex flex-col items-center justify-center text-center p-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800/30 flex items-center justify-center mb-2.5 border border-slate-800/60">
                      <ShoppingCart className="w-4.5 h-4.5 text-slate-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-300">Your cart is empty</p>
                    <p className="text-[9px] text-slate-500 mt-1 max-w-[150px] leading-relaxed">
                      Add meals from the discovery board to calculate live totals!
                    </p>
                  </motion.div>
                ) : (
                  // Cart list items
                  <motion.div
                    key="cart-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-2.5 flex justify-between items-start gap-2 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-0.5">
                            <div className={`w-2.5 h-2.5 border rounded flex items-center justify-center p-0.5 flex-shrink-0 ${item.veg ? "border-green-600" : "border-red-600"}`}>
                              <div className={`w-1 h-1 rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`} />
                            </div>
                            <span className="text-[9px] text-slate-400 font-semibold truncate max-w-[100px]">{item.restaurant}</span>
                          </div>
                          <h4 className="text-[11px] font-bold text-slate-100 group-hover:text-swiggy-orange transition-colors duration-200 truncate">{item.item}</h4>
                          <div className="flex gap-1.5 mt-0.5 text-[9px] font-semibold text-slate-400">
                            <span className="text-swiggy-orange">{item.macros?.calories || 0} kcal</span>
                            <span className="text-healthy-emerald">{item.macros?.protein || 0}g P</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between h-full gap-2">
                          <span className="text-[11px] font-extrabold text-white">₹{item.price}</span>
                          <button
                            onClick={() => handleToggleCart(item)}
                            className="p-1 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-all duration-200 active:scale-95"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Footer / Nutrient Aggregates */}
            {cart.length > 0 && (
              <div className="pt-2.5 border-t border-slate-800 space-y-2 bg-slate-950/20 rounded-b-2xl flex-shrink-0">
                
                {/* Aggregate Macros */}
                <div className="bg-[#121826] border border-slate-800/80 p-2.5 rounded-xl space-y-1.5">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Nutrients</div>
                  
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-swiggy-orange" /> Calories
                    </span>
                    <span className="font-extrabold text-swiggy-orange">{totalCalories} kcal</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" /> Protein
                    </span>
                    <span className="font-extrabold text-healthy-emerald">{totalProtein}g</span>
                  </div>
                </div>

                {/* Pricing Details */}
                <div className="flex justify-between items-center px-1">
                  <span className="text-[11px] text-slate-400 font-semibold">Order Total</span>
                  <span className="text-xs font-black text-white">₹{totalPrice}</span>
                </div>

                {/* Swiggy Checkout Button */}
                <a
                  href="https://www.swiggy.com/checkout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-swiggy-orange to-amber-500 hover:from-swiggy-orange hover:to-swiggy-orange-dark active:scale-[0.98] text-white text-[11px] font-extrabold py-2.5 px-3 rounded-xl shadow-lg shadow-swiggy-orange/20 flex items-center justify-center gap-1.5 transition-all duration-200"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Proceed to Swiggy Cart</span>
                </a>
              </div>
            )}
          </section>

        </div>

        {/* Dynamic Hackathon Footer */}
        <footer className="text-center py-6 text-[10px] text-slate-500 border-t border-slate-900/80 flex flex-col sm:flex-row justify-between items-center px-4 gap-2">
          <p>© 2026 Swiggy Builders Club Hackathon MVP • NutriSwiggy AI dietitian assistant</p>
          <div className="flex gap-4">
            <span className="hover:text-swiggy-orange cursor-pointer">FastAPI Backend</span>
            <span className="hover:text-swiggy-orange cursor-pointer">Next.js Frontend</span>
            <span className="hover:text-swiggy-orange cursor-pointer">Gemini AI Agentic RAG</span>
          </div>
        </footer>

      </div>
    </main>
  );
}
