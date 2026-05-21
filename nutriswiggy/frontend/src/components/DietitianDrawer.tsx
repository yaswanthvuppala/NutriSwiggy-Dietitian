"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useCartStore } from "@/store/useCartStore";
import { X, Send, Sparkles, User, Trophy, ShieldCheck, Flame, Zap, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DietitianDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: {
    id: string;
    name: string;
    menu: any[];
  };
}

interface Message {
  sender: "user" | "assistant";
  text: string;
  meals?: any[];
}

export const DietitianDrawer: React.FC<DietitianDrawerProps> = ({ isOpen, onClose, restaurant }) => {
  const { cart, addItem, updateQuantity } = useCartStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendedMeals, setRecommendedMeals] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize dietitian greetings specific to this restaurant
  useEffect(() => {
    if (isOpen) {
      // Clear recommendations on open
      setRecommendedMeals([]);
      
      const healthyItems = restaurant.menu.filter(item => item.healthScore >= 80);
      
      setMessages([
        {
          sender: "assistant",
          text: `## 🥗 Dietitian Assistant at ${restaurant.name}!\n\nI have scanned ${restaurant.name}'s menu and discovered **${healthyItems.length} ultra-healthy options** matching smart-diet standards!\n\nAsk me anything about this menu—for example: **'Suggest a high-protein lunch here'** or **'Which low-carb items can I order?'**—and I will rank them instantly for you!`,
        }
      ]);
    }
  }, [isOpen, restaurant]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      // Connect to FastAPI if online, otherwise fallback to local high-fidelity mock
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: `At ${restaurant.name}, search menu items: ${text}. Restrict answer to the dishes: ${restaurant.menu.map(i => i.name).join(", ")}`, 
          model: "gemini-3.5-flash" 
        }),
      });

      if (!response.ok) throw new Error("Backend offline");

      const data = await response.json();
      
      // Filter dietitian RAG results to ONLY include items present in THIS restaurant's menu database
      const matchedMeals = data.meals ? data.meals.filter((m: any) => 
        restaurant.menu.some(ri => ri.name.toLowerCase() === m.item.toLowerCase() || ri.id === m.id)
      ) : [];

      setMessages((prev) => [...prev, {
        sender: "assistant",
        text: data.answer,
        meals: matchedMeals
      }]);

      if (matchedMeals.length > 0) {
        setRecommendedMeals(matchedMeals);
      }
      setLoading(false);

    } catch (e) {
      // Local high-fidelity mockup response custom tailored for the specific restaurant menu
      setTimeout(() => {
        const query = text.toLowerCase();
        let matches = restaurant.menu.filter(item => {
          if (query.includes("protein")) return item.macros.protein >= 15;
          if (query.includes("carb") || query.includes("keto")) return item.macros.carbohydrates <= 15;
          if (query.includes("calorie") || query.includes("light") || query.includes("fat loss")) return item.macros.calories <= 350;
          if (query.includes("veg")) return item.veg;
          return item.healthScore >= 80;
        });

        if (matches.length === 0) {
          matches = restaurant.menu.slice(0, 2);
        }

        const mealSummaries = matches.map((m, i) => 
          `${i + 1}. **${m.name}** (₹${m.price})\n   - **Macros**: ${m.macros.calories} kcal | **Protein**: ${m.macros.protein}g | **Carbs**: ${m.macros.carbohydrates}g\n   - **Health Score**: ${m.healthScore}/100\n   - **Dietitian Take**: ${m.matchRationale || "Highly recommended for active individuals."}`
        ).join("\n\n");

        const responseText = `### 🏆 Best Picks from ${restaurant.name} Menu:\n\nBased on your query **"${text}"**, here are the healthiest choices available at this outlet:\n\n${mealSummaries}\n\n*These have been loaded directly into the Discovery Board below for easy one-click ordering!*`;

        setMessages((prev) => [...prev, {
          sender: "assistant",
          text: responseText,
          meals: matches.map(m => ({
            id: m.id,
            item: m.name,
            restaurant: restaurant.name,
            price: m.price,
            veg: m.veg,
            description: m.description,
            macros: m.macros,
            health_score: m.healthScore,
            badges: m.badges,
            penalties_applied: [],
            bonuses_applied: m.healthScore >= 90 ? ["High Density Nutrient Boost"] : [],
            match_rationale: m.matchRationale || "Excellent nutrition profile."
          }))
        }]);

        setRecommendedMeals(matches);
        setLoading(false);
      }, 1000);
    }
  }, [restaurant]);

  // Safe markdown text formatter
  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        return (
          <h4 key={idx} className="text-sm font-black text-[#FC8019] mt-3 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FC8019]" /> {trimmed.replace("## ", "")}
          </h4>
        );
      }
      if (trimmed.startsWith("### ")) {
        return (
          <h5 key={idx} className="text-xs font-bold text-[#282C3F] mt-2 mb-1 flex items-center gap-1.5">
            <svg
              role="img"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3.5 h-3.5 text-[#FC8019]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.034 24c-.376-.411-2.075-2.584-3.95-5.513-.547-.916-.901-1.63-.833-1.814.178-.48 3.355-.743 4.333-.308.298.132.29.307.29.409 0 .44-.022 1.619-.022 1.619a.441.441 0 1 0 .883-.002l-.005-2.939c0-.255-.278-.319-.331-.329-.511-.002-1.548-.006-2.661-.006-2.457 0-3.006.101-3.423-.172-.904-.591-2.383-4.577-2.417-6.819C3.849 4.964 5.723 2.225 8.362.868A8.13 8.13 0 0 1 12.026 0c4.177 0 7.617 3.153 8.075 7.209l.001.011c.084.981-5.321 1.189-6.39.904-.164-.044-.206-.212-.206-.284L13.5 4.996a.442.442 0 0 0-.884.002l.009 3.866a.33.33 0 0 0 .268.32l3.354-.001c1.79 0 2.542.207 3.042.588.333.254.461.739.349 1.37C18.633 16.755 12.273 23.71 12.034 24z" />
            </svg>
            {trimmed.replace("### ", "")}
          </h5>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return <li key={idx} className="ml-4 list-disc text-xs text-slate-700 my-0.5 leading-relaxed">{formatBoldWords(trimmed.substring(2))}</li>;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return <li key={idx} className="ml-4 list-decimal text-xs text-slate-700 my-0.5 leading-relaxed">{formatBoldWords(trimmed.replace(/^\d+\.\s/, ""))}</li>;
      }
      return <p key={idx} className="text-xs text-slate-700 my-1 leading-relaxed">{formatBoldWords(line)}</p>;
    });
  };

  const formatBoldWords = (str: string) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-[#282C3F] font-extrabold bg-slate-100 px-1 py-0.2 rounded">{part}</strong>;
      }
      return part;
    });
  };

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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-lg h-full bg-white border-l border-slate-150 flex flex-col justify-between shadow-2xl z-10"
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FC8019]/10 border border-[#FC8019]/25 flex items-center justify-center text-[#FC8019] shadow">
                  {swiggyLogoIcon("w-5.5 h-5.5 text-[#FC8019]")}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#282C3F] flex items-center gap-1.5">
                    <span>AI Diet Coach</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FC8019] animate-ping" />
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate max-w-[200px]">Scanning: {restaurant.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#282C3F] transition-colors active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2.5 max-w-[88%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black ${
                    msg.sender === "user" ? "bg-[#FC8019]/10 text-[#FC8019]" : "bg-[#FC8019]/10 text-[#FC8019]"
                  }`}>
                    {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : swiggyLogoIcon("w-4.5 h-4.5 text-[#FC8019]")}
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#FC8019] text-white rounded-tr-none font-bold shadow-sm"
                      : "bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none"
                  }`}>
                    {msg.sender === "user" ? msg.text : renderFormattedText(msg.text)}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5 max-w-[80%]">
                  <div className="w-7 h-7 rounded-full bg-[#FC8019]/10 text-[#FC8019] flex items-center justify-center">
                    {swiggyLogoIcon("w-4.5 h-4.5 text-[#FC8019] animate-bounce")}
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 flex items-center justify-center w-20">
                    <div className="dot-flashing" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Discovery Board Results (embedded directly in Drawer so items can be carted easily) */}
            {recommendedMeals.length > 0 && (
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 max-h-48 overflow-y-auto">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-2">🍽️ Healthy Recommendations</span>
                <div className="space-y-2">
                  {recommendedMeals.map((meal) => {
                    const cartItem = cart.find(ci => ci.id === meal.id);
                    const qty = cartItem ? cartItem.quantity : 0;
                    return (
                      <div key={meal.id} className="bg-white border border-slate-200 rounded-xl p-2.5 flex justify-between items-center gap-3 hover:border-[#FC8019]/35 transition-colors shadow-sm">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2.5 h-2.5 border rounded flex items-center justify-center p-0.5 ${meal.veg ? "border-green-600" : "border-red-600"}`}>
                              <div className={`w-1 h-1 rounded-full ${meal.veg ? "bg-green-600" : "bg-red-600"}`} />
                            </div>
                            <h4 className="text-xs font-black text-[#282C3F]">{meal.name || meal.item}</h4>
                          </div>
                          <div className="flex gap-2 text-[10px] font-bold text-slate-500 mt-1">
                            <span className="text-[#FC8019]">{meal.macros?.calories || 0} kcal</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[#FC8019]">{meal.macros?.protein || 0}g P</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[#FC8019]">Score: {meal.healthScore || meal.health_score}/100</span>
                          </div>
                        </div>

                        {/* Direct add button, synced with global cart! */}
                        <div>
                          {qty === 0 ? (
                            <button
                              onClick={() => addItem({
                                id: meal.id,
                                name: meal.name || meal.item,
                                price: meal.price,
                                veg: meal.veg,
                                restaurantId: restaurant.id,
                                restaurantName: restaurant.name,
                                macros: meal.macros,
                              })}
                              className="px-3 py-1 bg-white hover:bg-slate-50 text-[10px] font-black text-[#FC8019] hover:text-[#E06D0F] hover:border-[#FC8019] border border-slate-200 rounded-lg active:scale-95 transition-all"
                            >
                              + Add
                            </button>
                          ) : (
                            <div className="flex items-center border border-[#FC8019] bg-white rounded-lg overflow-hidden text-xs">
                              <button onClick={() => updateQuantity(meal.id, qty - 1)} className="px-2 py-0.5 text-[#FC8019] hover:text-[#E06D0F]">-</button>
                              <span className="px-1.5 font-bold text-[#282C3F] text-[10px]">{qty}</span>
                              <button onClick={() => updateQuantity(meal.id, qty + 1)} className="px-2 py-0.5 text-[#FC8019] hover:text-[#E06D0F]">+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                placeholder="Ask Dietitian: 'High protein option'..."
                disabled={loading}
                className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#FC8019] rounded-xl px-4 py-2.5 text-xs focus:outline-none text-[#282C3F] placeholder-slate-400 transition-colors"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FC8019] to-amber-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-40 shadow-[#FC8019]/15"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default DietitianDrawer;
