"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { MealCard, MealProps } from "@/components/MealCard";
import { Apple, Leaf, Trophy, ShieldCheck, Flame, Compass, ChevronDown, Check, ShoppingCart, Trash2, Pencil, MapPin, AlertCircle, Info, X, User, LogOut, Power, History, Target, Shield, Sparkles, Bot, ExternalLink, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { useCartStore } from "@/store/useCartStore";
import { NativeBridge } from "@/services/nativeBridge";
import { SwiggyAccountVerificationModal } from "@/components/SwiggyAccountVerificationModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nutriswiggy-backend.onrender.com";

export default function Home() {
  const router = useRouter();
  const {
    cart,
    addItem,
    removeItem,
    clearCart,
    activeMobileTab,
    setActiveMobileTab,
    swiggyUser,
    setIsProfileDrawerOpen,
    nutritionTargets,
  } = useCartStore();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [recommendedMeals, setRecommendedMeals] = useState<MealProps[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [authStatus, setAuthStatus] = useState({ connected: true, mode: "Live Swiggy MCP" });
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<MealProps | null>(null);

  // Verification & Checkout Modal State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Desktop screen check and resizable columns state
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [widths, setWidths] = useState({ col1: 33.33, col2: 41.67, col3: 25 });
  const [isResizing, setIsResizing] = useState<"col1" | "col2" | null>(null);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startResize = (handle: "col1" | "col2") => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(handle);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const relativeX = e.clientX - containerRect.left;
      const percentageX = (relativeX / containerWidth) * 100;

      setWidths((prev) => {
        if (isResizing === "col1") {
          const newCol1 = Math.max(18, Math.min(55, percentageX));
          const total12 = prev.col1 + prev.col2;
          const newCol2 = total12 - newCol1;
          if (newCol2 < 18) return prev;
          return { ...prev, col1: newCol1, col2: newCol2 };
        } else {
          const newCol3 = Math.max(18, Math.min(55, 100 - percentageX));
          const total23 = prev.col2 + prev.col3;
          const newCol2 = total23 - newCol3;
          if (newCol2 < 18) return prev;
          return { ...prev, col2: newCol2, col3: newCol3 };
        }
      });
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleRecommendations = useCallback((meals: MealProps[]) => {
    setRecommendedMeals(meals);
    // On mobile, auto-switch to discovery tab to show the recommendations
    if (window.innerWidth < 1024 && meals.length > 0) {
      setActiveMobileTab("discovery");
    }
  }, [setActiveMobileTab]);

  const handleFilterTriggered = useCallback(() => {
    setFilterQuery("");
  }, []);

  const handleToggleCart = (meal: MealProps) => {
    NativeBridge.triggerHaptic("light");
    const exists = cart.some((x) => x.id === meal.id);
    if (exists) {
      removeItem(meal.id);
    } else {
      // Enforce Swiggy single-restaurant constraint
      const cartRestaurant = cart.length > 0 ? cart[0].restaurantId || cart[0].restaurantName : null;
      const mealRestaurant = meal.restaurant_id || meal.restaurant;
      if (cartRestaurant && cartRestaurant !== mealRestaurant) {
        setPendingMeal(meal);
        setShowRestaurantModal(true);
        return;
      }
      addItem({
        id: meal.id,
        name: meal.item,
        price: meal.price,
        veg: meal.veg,
        restaurantId: meal.restaurant_id || meal.restaurant || "res_nutri",
        restaurantName: meal.restaurant || "Swiggy Kitchen",
        macros: meal.macros ? {
          calories: meal.macros.calories || 0,
          protein: meal.macros.protein || 0,
          carbohydrates: meal.macros.carbohydrates || 0,
          fats: meal.macros.fats || 0,
          fiber: meal.macros.fiber || 0,
        } : undefined,
        image: meal.image,
      });
    }
  };

  const handleConfirmRestaurantSwitch = () => {
    if (pendingMeal) {
      clearCart();
      addItem({
        id: pendingMeal.id,
        name: pendingMeal.item,
        price: pendingMeal.price,
        veg: pendingMeal.veg,
        restaurantId: pendingMeal.restaurant_id || pendingMeal.restaurant || "res_nutri",
        restaurantName: pendingMeal.restaurant || "Swiggy Kitchen",
        macros: pendingMeal.macros ? {
          calories: pendingMeal.macros.calories || 0,
          protein: pendingMeal.macros.protein || 0,
          carbohydrates: pendingMeal.macros.carbohydrates || 0,
          fats: pendingMeal.macros.fats || 0,
          fiber: pendingMeal.macros.fiber || 0,
        } : undefined,
        image: pendingMeal.image,
      });
    }
    setShowRestaurantModal(false);
    setPendingMeal(null);
  };

  const handleInitiateCheckout = async () => {
    if (cart.length === 0) return;
    NativeBridge.triggerHaptic("medium");
    setSyncError(null);
    setIsSyncing(true);
    setIsVerificationModalOpen(true);

    try {
      const restaurantId = cart[0].restaurantId || "res_nutri";
      const payload = {
        restaurantId,
        restaurant: cart[0].restaurantName,
        items: cart.map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
          name: item.name,
          calories: item.macros?.calories || 0,
          protein: item.macros?.protein || 0,
        })),
        addressId: "addr_home_123",
      };

      await fetch(`${API_URL}/api/cart/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);
    } catch (e: any) {
      console.warn("Cart sync warning:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmSwiggyCheckout = () => {
    NativeBridge.triggerHaptic("heavy");
    setIsVerificationModalOpen(false);
    NativeBridge.openSwiggyCheckout("https://www.swiggy.com/checkout");
  };

  const handleSwitchSwiggyAccount = () => {
    NativeBridge.triggerHaptic("light");
    setIsVerificationModalOpen(false);
    // Fetch the OAuth authorize URL from backend, then redirect
    try {
      const sessionData = await supabase?.auth.getSession();
      const token = sessionData?.data.session?.access_token;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/auth/login`, { headers });
      const data = await res.json();
      if (data.authorize_url) {
        NativeBridge.openOAuthLogin(data.authorize_url);
      } else {
        console.error("No authorize_url in response", data);
      }
    } catch (e) {
      console.error("Failed to start Swiggy OAuth:", e);
    }
  };

  const totalCalories = cart.reduce((sum, item) => sum + (item.macros?.calories || 0) * item.quantity, 0);
  const totalProtein = cart.reduce((sum, item) => sum + (item.macros?.protein || 0) * item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const dietFilters = [
    { name: "Vegetarian 🌱", query: "High protein vegetarian meal" },
    { name: "Under 400 kcal 🥦", query: "Low calorie healthy meal under 400 calories" },
    { name: "Keto / Low Carb 🥑", query: "Keto low carb healthy meal" },
    { name: "Protein Powerhouse 🍗", query: "High protein muscle gain meal" },
  ];

  // ---------------------------------------------------------------------------
  // Component Render Sections
  // ---------------------------------------------------------------------------

  // Section 1: AI Dietitian Agent
  const renderAgentSection = () => (
    <div className="w-full h-[calc(100vh-140px)] lg:h-[650px] flex flex-col">
      <ChatInterface
        onRecommendationsFound={handleRecommendations}
        activeFilter={filterQuery}
        onFilterTriggered={handleFilterTriggered}
        mode={authStatus.mode}
      />
    </div>
  );

  // Section 2: Discovery Board
  const renderDiscoverySection = () => (
    <div className="w-full h-[calc(100vh-140px)] lg:h-[650px] flex flex-col space-y-3">
      {/* Quick Dietary Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none touch-scroll shrink-0">
        {dietFilters.map((filter, idx) => (
          <button
            key={idx}
            onClick={() => {
              NativeBridge.triggerHaptic("light");
              setFilterQuery(filter.query);
              if (!isDesktop) setActiveMobileTab("agent");
            }}
            className="text-xs font-semibold px-3 py-2 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700/80 rounded-xl transition-all hover:border-[#FC8019] flex items-center gap-1 shrink-0"
          >
            <span>{filter.name}</span>
          </button>
        ))}
      </div>

      {/* Board Header / Statistics */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3.5 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#FC8019]" />
            <span>Discovery Board</span>
          </h2>
          <p className="text-[10px] text-slate-400">Dietitian-vetted healthy options</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Found:</span>
          <span className="text-xs font-black bg-gradient-to-r from-[#FC8019] to-amber-500 text-white px-2.5 py-0.5 rounded-full border border-[#FC8019]/20 shadow">
            {recommendedMeals.length}
          </span>
        </div>
      </div>

      {/* Scrollable Meal Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-3 touch-scroll min-h-0">
        <AnimatePresence mode="wait">
          {recommendedMeals.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full bg-slate-900/20 rounded-3xl border border-slate-800/60 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-800/80 to-slate-950 flex items-center justify-center mb-3 border border-slate-800 shadow-xl text-emerald-400">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">Awaiting Dietitian Analysis</h3>
              <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed mb-4">
                Ask our AI Dietitian in the <strong>Agent</strong> tab (e.g. <span className="text-[#FC8019] font-semibold">"High protein dinner"</span>) to scan menus!
              </p>
              <button
                onClick={() => {
                  NativeBridge.triggerHaptic("medium");
                  setActiveMobileTab("agent");
                }}
                className="bg-gradient-to-r from-[#FC8019] to-amber-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Open AI Dietitian</span>
              </button>
            </motion.div>
          ) : (
            recommendedMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                isInCart={cart.some((x) => x.id === meal.id)}
                onToggleCart={handleToggleCart}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // Section 3: Health Cart
  const renderCartSection = () => (
    <div className="w-full h-[calc(100vh-140px)] lg:h-[650px] flex flex-col bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-4 overflow-hidden">
      {/* Cart Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FC8019]/15 flex items-center justify-center border border-[#FC8019]/20 text-[#FC8019]">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white">Health Cart</h2>
            <p className="text-[9px] text-slate-400">Total nutrients calculator</p>
          </div>
        </div>
        <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 shadow">
          {cart.length} Items
        </span>
      </div>

      {/* Cart List */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-2.5 min-h-0 touch-scroll">
        <AnimatePresence mode="wait">
          {cart.length === 0 ? (
            <motion.div
              key="empty-cart"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col items-center justify-center text-center p-4"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800/40 flex items-center justify-center mb-2.5 border border-slate-800/60 text-slate-500">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-300">Your cart is empty</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[180px] leading-relaxed">
                Add meals from the Discovery board or AI Agent to checkout!
              </p>
              <button
                onClick={() => {
                  NativeBridge.triggerHaptic("light");
                  setActiveMobileTab("discovery");
                }}
                className="mt-3 text-xs font-bold text-[#FC8019] hover:underline"
              >
                Explore Meals →
              </button>
            </motion.div>
          ) : (
            <div className="space-y-2 pt-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-2.5 flex justify-between items-start gap-2 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <div className={`w-2.5 h-2.5 border rounded flex items-center justify-center p-0.5 flex-shrink-0 ${item.veg ? "border-green-600" : "border-red-600"}`}>
                        <div className={`w-1 h-1 rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`} />
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold truncate max-w-[100px]">{item.restaurantName}</span>
                    </div>
                    <h4 className="text-[11px] font-bold text-slate-100 truncate">{item.name}</h4>
                    <div className="flex gap-2 mt-0.5 text-[9px] font-semibold text-slate-400">
                      <span className="text-[#FC8019]">{(item.macros?.calories || 0) * item.quantity} kcal</span>
                      <span className="text-emerald-400">{(item.macros?.protein || 0) * item.quantity}g Protein</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full gap-2">
                    <span className="text-[11px] font-extrabold text-white">₹{item.price * item.quantity}</span>
                    <button
                      onClick={() => {
                        NativeBridge.triggerHaptic("light");
                        removeItem(item.id);
                      }}
                      className="p-1 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-all active:scale-95"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Cart Footer / Bill & Macro Summary */}
      {cart.length > 0 && (
        <div className="pt-3 border-t border-slate-800 space-y-2.5 bg-slate-950/20 rounded-b-2xl shrink-0">
          <div className="bg-[#121826] border border-slate-800/80 p-2.5 rounded-xl space-y-1.5">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Nutrients</div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#FC8019]" /> Calories
              </span>
              <span className="font-extrabold text-[#FC8019]">{totalCalories} kcal</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" /> Protein
              </span>
              <span className="font-extrabold text-emerald-400">{totalProtein}g</span>
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] text-slate-400 font-semibold">Order Total</span>
            <span className="text-sm font-black text-white">₹{totalPrice}</span>
          </div>

          <button
            onClick={handleInitiateCheckout}
            className="w-full bg-gradient-to-r from-[#FC8019] to-amber-500 hover:from-[#FC8019] hover:to-[#E06D0F] active:scale-[0.98] text-white text-xs font-extrabold py-3 px-3 rounded-xl shadow-lg shadow-[#FC8019]/25 flex items-center justify-center gap-1.5 transition-all"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Proceed to Swiggy Checkout</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#0b0f19] py-4 px-2 sm:px-4 relative overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto space-y-4">
        
        {/* MOBILE VIEW (lg:hidden) — Exactly 1 Active Tab at a time */}
        <div className="block lg:hidden">
          {activeMobileTab === "discovery" && renderDiscoverySection()}
          {activeMobileTab === "agent" && renderAgentSection()}
          {activeMobileTab === "cart" && renderCartSection()}
        </div>

        {/* DESKTOP VIEW (hidden lg:flex) — 3 Resizable Columns */}
        <div
          ref={containerRef}
          className={`hidden lg:flex flex-row items-stretch ${isResizing ? "select-none" : ""}`}
        >
          {/* Column 1: Agent */}
          <section style={{ flex: `${widths.col1} ${widths.col1} 0%` }} className="h-[650px] flex flex-col">
            {renderAgentSection()}
          </section>

          {/* Drag Handle 1 */}
          <div
            onMouseDown={startResize("col1")}
            className="flex w-5 cursor-col-resize items-center justify-center group flex-shrink-0 select-none relative z-10"
          >
            <div className="w-[2px] h-[90%] bg-slate-800 group-hover:bg-[#FC8019]/50 group-active:bg-[#FC8019] transition-colors rounded-full" />
            <div className="absolute inset-0 w-full h-full cursor-col-resize" />
          </div>

          {/* Column 2: Discovery Board */}
          <section style={{ flex: `${widths.col2} ${widths.col2} 0%` }} className="h-[650px] flex flex-col space-y-4">
            {renderDiscoverySection()}
          </section>

          {/* Drag Handle 2 */}
          <div
            onMouseDown={startResize("col2")}
            className="flex w-5 cursor-col-resize items-center justify-center group flex-shrink-0 select-none relative z-10"
          >
            <div className="w-[2px] h-[90%] bg-slate-800 group-hover:bg-[#FC8019]/50 group-active:bg-[#FC8019] transition-colors rounded-full" />
            <div className="absolute inset-0 w-full h-full cursor-col-resize" />
          </div>

          {/* Column 3: Health Cart */}
          <section style={{ flex: `${widths.col3} ${widths.col3} 0%` }} className="h-[650px] flex flex-col">
            {renderCartSection()}
          </section>
        </div>

      </div>

      {/* Restaurant Switch Modal */}
      <AnimatePresence>
        {showRestaurantModal && pendingMeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0F172A] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-[#FC8019]" />
                <span>Switch Restaurant?</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your cart currently contains items from <strong className="text-white">{cart[0]?.restaurantName}</strong>.
                Adding <strong className="text-white">{pendingMeal.item}</strong> from <strong className="text-white">{pendingMeal.restaurant}</strong> will clear your current cart. Do you want to proceed?
              </p>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowRestaurantModal(false);
                    setPendingMeal(null);
                  }}
                  className="px-4 py-2 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-300 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRestaurantSwitch}
                  className="px-4 py-2 bg-gradient-to-r from-[#FC8019] to-amber-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
                >
                  Clear & Add
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Swiggy Account Alignment & Mismatch Modal */}
      <SwiggyAccountVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        swiggyUser={swiggyUser}
        isSyncing={isSyncing}
        syncError={syncError}
        onProceedCheckout={handleConfirmSwiggyCheckout}
        onSwitchAccount={handleSwitchSwiggyAccount}
      />
    </main>
  );
}
