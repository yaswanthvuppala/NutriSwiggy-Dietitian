"use client";

import React, { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { MealCard, MealProps } from "@/components/MealCard";
import { Apple, Leaf, Trophy, ShieldCheck, Flame, Compass, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [recommendedMeals, setRecommendedMeals] = useState<MealProps[]>([]);
  const [filterQuery, setFilterQuery] = useState("");

  const handleRecommendations = (meals: MealProps[]) => {
    setRecommendedMeals(meals);
  };

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

        {/* Dynamic Split Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Side: Conversational Chat Interface (5 cols) */}
          <section className="lg:col-span-5">
            <ChatInterface 
              onRecommendationsFound={handleRecommendations} 
              activeFilter={filterQuery}
            />
          </section>

          {/* Right Side: Recommendation Board and Card Grid (7 cols) */}
          <section className="lg:col-span-7 space-y-4 h-[650px] flex flex-col">
            
            {/* Board Header / Statistics */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-md font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-swiggy-orange" />
                  <span>Healthy Menu Discovery Board</span>
                </h2>
                <p className="text-[11px] text-slate-400">Heuristically macro-estimated and scored according to health indices</p>
              </div>

              {/* Match Counter Badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Discovered:</span>
                <span className="text-xs font-black bg-gradient-to-r from-swiggy-orange to-amber-500 text-white px-3 py-1 rounded-full border border-swiggy-orange/20 shadow">
                  {recommendedMeals.length} Healthy Options
                </span>
              </div>
            </div>

            {/* Scrollable Grid Container */}
            <div className="flex-1 overflow-y-auto pr-1">
              <AnimatePresence mode="wait">
                {recommendedMeals.length === 0 ? (
                  // Empty State Panel (WOW Factor Glassmorphism design)
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-slate-900/20 rounded-3xl border border-slate-800/60 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-800/80 to-slate-950 flex items-center justify-center mb-4 border border-slate-800 shadow-xl relative overflow-hidden group">
                      {/* Internal light glow */}
                      <div className="absolute inset-0 bg-swiggy-orange/5 animate-pulse-slow" />
                      <Leaf className="w-8 h-8 text-healthy-emerald animate-bounce-slow" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 mb-1">Awaiting Dietitian Analysis</h3>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
                      Submit a dietary goal in the chat on the left (e.g. <span className="text-swiggy-orange font-semibold">"Keto wrap"</span> or <span className="text-swiggy-orange font-semibold">"low calorie under 500 kcal"</span>) and discover your curated, healthy Swiggy dish recommendations here!
                    </p>
                    
                    {/* Live Diet Principles Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg mt-2 text-left">
                      <div className="bg-[#121826] border border-slate-800/80 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Macro-Balanced</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">Optimizes high protein density and keeps carbohydrates regulated.</p>
                      </div>

                      <div className="bg-[#121826] border border-slate-800/80 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-healthy-emerald" />
                          <span>Penalty Enforced</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">Automatically filters and penalizes deep-fried items and heavy sugars.</p>
                      </div>

                      <div className="bg-[#121826] border border-slate-800/80 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-1">
                          <Flame className="w-3.5 h-3.5 text-swiggy-orange" />
                          <span>Calorie-Smart</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">Tailors suggestions precisely to fit weight loss deficit thresholds.</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Active Grid Layout (Smooth micro-animations on load)
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                      show: {
                        transition: {
                          staggerChildren: 0.08
                        }
                      }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4"
                  >
                    {recommendedMeals.map((meal) => (
                      <motion.div
                        key={meal.id}
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                        }}
                      >
                        <MealCard meal={meal} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
