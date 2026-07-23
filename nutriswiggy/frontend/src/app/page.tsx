"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { MealCard, MealProps } from "@/components/MealCard";
import { Apple, Leaf, Trophy, ShieldCheck, Flame, Compass, ChevronDown, Check, ShoppingCart, Trash2, Pencil, MapPin, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [recommendedMeals, setRecommendedMeals] = useState<MealProps[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [cart, setCart] = useState<MealProps[]>([]);
  const [authStatus, setAuthStatus] = useState({ connected: false, mode: "Mock Demo" });
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<MealProps | null>(null);
  

  // Nutrition Tracking States
  const [activeTab, setActiveTab] = useState<"cart" | "tracker">("cart");
  const [nutritionTargets, setNutritionTargets] = useState({
    calories: 2000,
    protein: 120,
    carbohydrates: 200,
    fats: 70,
    fiber: 30
  });
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [tempTargets, setTempTargets] = useState({
    calories: 2000,
    protein: 120,
    carbohydrates: 200,
    fats: 70,
    fiber: 30
  });

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      setUserEmail(data.session?.user.email ?? null);
      if (token) {
        fetch(`${API_URL}/auth/status`, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json();
          })
          .then(data => setAuthStatus(data))
          .catch(err => console.error(`Could not reach NutriSwiggy backend at ${API_URL}:`, err));
      }
    });

    // Load persisted targets and orders
    const savedTargets = localStorage.getItem("nutriswiggy_targets");
    if (savedTargets) {
      try {
        const parsed = JSON.parse(savedTargets);
        setNutritionTargets(parsed);
        setTempTargets(parsed);
      } catch (e) {
        console.error("Failed to parse targets", e);
      }
    }
    const savedOrders = localStorage.getItem("nutriswiggy_orders");
    if (savedOrders) {
      try {
        setOrderHistory(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Failed to parse orders", e);
      }
    }
  }, []);

  const getAccessToken = async () => {
    if (!supabase) throw new Error("Supabase browser credentials are missing.");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/auth");
      throw new Error("Sign in to NutriSwiggy first.");
    }
    return data.session.access_token;
  };

  const handleConnectSwiggy = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_URL}/auth/login`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {
        throw new Error(`Failed to reach NutriSwiggy backend at ${API_URL}. Please ensure your backend server is running (e.g. run 'uvicorn backend.main:app --port 8000').`);
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not start Swiggy connection.");
      window.location.href = data.authorize_url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not start Swiggy connection.");
    }
  };

  const handleDisconnectSwiggy = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_URL}/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not disconnect Swiggy.");
      setAuthStatus({ connected: false, mode: "Not connected" });
      alert("Swiggy account disconnected. Connect another account whenever you are ready.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not disconnect Swiggy.");
    }
  };
  // Desktop screen check and resizable columns state
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [widths, setWidths] = useState({ col1: 33.33, col2: 41.67, col3: 25 });
  const [isResizing, setIsResizing] = useState<"col1" | "col2" | null>(null);

  useEffect(() => {
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
          // Column 1 is being resized. Its width is percentageX.
          const newCol1 = Math.max(18, Math.min(55, percentageX));
          const total12 = prev.col1 + prev.col2;
          const newCol2 = total12 - newCol1;
          if (newCol2 < 18) {
            return prev;
          }
          return {
            ...prev,
            col1: newCol1,
            col2: newCol2,
          };
        } else {
          // Column 2/3 border is being resized. 
          // percentageX is width from left to handle 2.
          // Column 3 is 100 - percentageX.
          const newCol3 = Math.max(18, Math.min(55, 100 - percentageX));
          const total23 = prev.col2 + prev.col3;
          const newCol2 = total23 - newCol3;
          if (newCol2 < 18) {
            return prev;
          }
          return {
            ...prev,
            col2: newCol2,
            col3: newCol3,
          };
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
  }, []);

  const handleFilterTriggered = useCallback(() => {
    setFilterQuery("");
  }, []);

  const handleToggleCart = (meal: MealProps) => {
    setCart((prev) => {
      const exists = prev.some((x) => x.id === meal.id);
      if (exists) {
        return prev.filter((x) => x.id !== meal.id);
      } else {
        // Enforce Swiggy's single-restaurant constraint
        const cartRestaurant = prev.length > 0 ? prev[0].restaurant_id || prev[0].restaurant : null;
        const mealRestaurant = meal.restaurant_id || meal.restaurant;
        if (cartRestaurant && cartRestaurant !== mealRestaurant) {
          setPendingMeal(meal);
          setShowRestaurantModal(true);
          return prev; // Cart remains unchanged for now
        }
        return [...prev, meal];
      }
    });
  };

  const handleConfirmRestaurantSwitch = () => {
    if (pendingMeal) {
      setCart([pendingMeal]);
    }
    setShowRestaurantModal(false);
    setPendingMeal(null);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const token = await getAccessToken();
      const payload = {
        restaurantId: cart[0].restaurant_id || cart[0].restaurant,
        restaurant: cart[0].restaurant,
        restaurant_id: cart[0].restaurant_id || null,
        items: cart.map(item => ({
          itemId: item.id,
          quantity: 1,
          name: item.item,
          calories: item.macros?.calories || 0,
          protein: item.macros?.protein || 0,
          carbohydrates: item.macros?.carbohydrates || 0,
          fats: item.macros?.fats || 0,
          fiber: item.macros?.fiber || 0,
        })),
        totalCalories: cart.reduce((sum, item) => sum + (item.macros?.calories || 0), 0),
        totalProtein: cart.reduce((sum, item) => sum + (item.macros?.protein || 0), 0),
        totalCarbohydrates: cart.reduce((sum, item) => sum + (item.macros?.carbohydrates || 0), 0),
        totalFats: cart.reduce((sum, item) => sum + (item.macros?.fats || 0), 0),
        totalFiber: cart.reduce((sum, item) => sum + (item.macros?.fiber || 0), 0),
      };
      const response = await fetch(`${API_URL}/api/cart/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not sync the cart with Swiggy.");

      const order = { id: data.order_id, date: new Date().toISOString(), restaurant: payload.restaurant, items: payload.items, totalCalories: payload.totalCalories, totalProtein: payload.totalProtein, totalCarbohydrates: payload.totalCarbohydrates, totalFats: payload.totalFats, totalFiber: payload.totalFiber, status: data.order_status };
      setOrderHistory(prev => {
        const updated = [order, ...prev];
        localStorage.setItem("nutriswiggy_orders", JSON.stringify(updated));
        return updated;
      });
      setCart([]);
      window.open(data.redirect_url, "_blank");
      alert("Cart synced with Swiggy. The tracker saved this as redirected to Swiggy checkout.");
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(error instanceof Error ? error.message : "Could not sync the cart with Swiggy.");
    }
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
    <main className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#0b0f19] py-8 px-2 sm:px-3 md:px-4 relative overflow-x-hidden">
      
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-swiggy-orange/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-healthy-emerald/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-1 sm:px-2 md:px-3 space-y-6">
        
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
                <span className="text-[10px] font-black text-white bg-swiggy-orange px-2 py-0.5 rounded-md uppercase tracking-wider shadow shadow-swiggy-orange/30">
                  powered by Swiggy
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Swiggy Builders Club • AI-Powered Dietitian and Healthy Menu Assistant</p>
            </div>
          </div>

          {/* Quick Dietary Action Filters & Auth */}
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {!userEmail ? (
              <button onClick={() => router.push("/auth")} className="text-xs font-bold px-4 py-2 bg-gradient-to-r from-swiggy-orange to-amber-500 text-white rounded-xl">
                Sign in
              </button>
            ) : !authStatus.connected ? (
              <button onClick={handleConnectSwiggy} className="text-xs font-bold px-4 py-2 bg-gradient-to-r from-swiggy-orange to-amber-500 text-white rounded-xl">
                Connect Swiggy
              </button>
            ) : (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-xs font-bold text-healthy-emerald px-3 py-2 bg-healthy-emerald/10 border border-healthy-emerald/20 rounded-xl flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Connected</span>
                <button onClick={handleDisconnectSwiggy} className="text-xs font-bold px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">Change account</button>
              </div>
            )}
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

        {/* Swiggy Delivery Location Notice Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex items-start gap-3 text-amber-200/90 text-xs shadow-sm">
          <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-bold text-amber-300">📍 Swiggy Delivery Address Notice: </span>
            Swiggy privacy policies & DPDP Act guidelines do not permit changing delivery addresses within third-party apps. Please set or select your present delivery location directly inside your official <strong>Swiggy app</strong> before completing order checkout.
          </div>
        </div>

        {/* Dynamic 3-Column Dashboard Layout */}
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
              onFilterTriggered={handleFilterTriggered}
              mode={authStatus.mode}
            />
          </section>

          {/* Drag Handle 1 */}
          <div 
            onMouseDown={startResize("col1")}
            className="hidden lg:flex w-6 cursor-col-resize items-center justify-center group flex-shrink-0 select-none relative z-10"
          >
            {/* Visual handle line */}
            <div className="w-[2px] h-[90%] bg-slate-800/60 group-hover:bg-swiggy-orange/50 group-active:bg-swiggy-orange transition-colors duration-200 rounded-full" />
            {/* Interactive wider hover area */}
            <div className="absolute inset-0 w-full h-full cursor-col-resize" />
          </div>

          {/* Column 2: Recommendation Board and Card Grid */}
          <section 
            style={{ flex: isDesktop ? `${widths.col2} ${widths.col2} 0%` : undefined }}
            className="w-full lg:w-auto space-y-4 h-[650px] flex flex-col"
          >
            
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

          {/* Drag Handle 2 */}
          <div 
            onMouseDown={startResize("col2")}
            className="hidden lg:flex w-6 cursor-col-resize items-center justify-center group flex-shrink-0 select-none relative z-10"
          >
            {/* Visual handle line */}
            <div className="w-[2px] h-[90%] bg-slate-800/60 group-hover:bg-swiggy-orange/50 group-active:bg-swiggy-orange transition-colors duration-200 rounded-full" />
            {/* Interactive wider hover area */}
            <div className="absolute inset-0 w-full h-full cursor-col-resize" />
          </div>

          {/* Column 3: Swiggy Health Cart & Nutrition Dashboard */}
          <section 
            style={{ flex: isDesktop ? `${widths.col3} ${widths.col3} 0%` : undefined }}
            className="w-full lg:w-auto space-y-4 h-[650px] flex flex-col bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-4 overflow-hidden"
          >
            
            {/* Segmented Control Tabs */}
            <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-slate-800/60 flex-shrink-0">
              <button
                onClick={() => setActiveTab("cart")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === "cart"
                    ? "bg-gradient-to-r from-swiggy-orange to-amber-500 text-white shadow-lg shadow-swiggy-orange/15"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Health Cart ({cart.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("tracker")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === "tracker"
                    ? "bg-gradient-to-r from-swiggy-orange to-amber-500 text-white shadow-lg shadow-swiggy-orange/15"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>Tracker (Today)</span>
              </button>
            </div>

            {activeTab === "cart" ? (
              <>
                {/* Cart Header */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-800 flex-shrink-0">
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

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-swiggy-orange to-amber-500 hover:from-swiggy-orange hover:to-swiggy-orange-dark active:scale-[0.98] text-white text-[11px] font-extrabold py-2.5 px-3 rounded-xl shadow-lg shadow-swiggy-orange/20 flex items-center justify-center gap-1.5 transition-all duration-200"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Proceed to Checkout</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Tracker Panel
              <div className="flex-1 flex flex-col min-h-0 space-y-4">
                
                {/* Header with Edit Icon */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 flex-shrink-0">
                  <div>
                    <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Apple className="w-4 h-4 text-swiggy-orange" />
                      <span>Smart Nutrition Dashboard</span>
                    </h2>
                    <p className="text-[9px] text-slate-400">Daily intake progress tracking</p>
                  </div>
                  {!isEditingTargets && (
                    <button
                      onClick={() => {
                        setTempTargets(nutritionTargets);
                        setIsEditingTargets(true);
                      }}
                      className="p-1.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg text-slate-400 hover:text-swiggy-orange transition-colors active:scale-95"
                      title="Edit Targets"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Edit Form or Visual Progress Dashboard */}
                {isEditingTargets ? (
                  // Targets Edit Panel
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3 flex-shrink-0">
                    <h3 className="text-xs font-bold text-white mb-1">Set Daily Targets</h3>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <label className="text-slate-400 block mb-1">Calories (kcal)</label>
                        <input
                          type="number"
                          value={tempTargets.calories}
                          onChange={(e) => setTempTargets({...tempTargets, calories: Number(e.target.value)})}
                          className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-swiggy-orange focus:outline-none text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Protein (g)</label>
                        <input
                          type="number"
                          value={tempTargets.protein}
                          onChange={(e) => setTempTargets({...tempTargets, protein: Number(e.target.value)})}
                          className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-swiggy-orange focus:outline-none text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Carbs (g)</label>
                        <input
                          type="number"
                          value={tempTargets.carbohydrates}
                          onChange={(e) => setTempTargets({...tempTargets, carbohydrates: Number(e.target.value)})}
                          className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-swiggy-orange focus:outline-none text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Fats (g)</label>
                        <input
                          type="number"
                          value={tempTargets.fats}
                          onChange={(e) => setTempTargets({...tempTargets, fats: Number(e.target.value)})}
                          className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-swiggy-orange focus:outline-none text-slate-200"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-slate-400 block mb-1">Fiber (g)</label>
                        <input
                          type="number"
                          value={tempTargets.fiber}
                          onChange={(e) => setTempTargets({...tempTargets, fiber: Number(e.target.value)})}
                          className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-swiggy-orange focus:outline-none text-slate-200"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => setIsEditingTargets(false)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-bold transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setNutritionTargets(tempTargets);
                          localStorage.setItem("nutriswiggy_targets", JSON.stringify(tempTargets));
                          setIsEditingTargets(false);
                        }}
                        className="px-3 py-1.5 bg-swiggy-orange hover:bg-swiggy-orange-dark text-white rounded-lg text-xs font-bold transition-all active:scale-95"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // Visual Intake Progress Metrics
                  <div className="space-y-3 flex-shrink-0 bg-slate-900/30 p-2.5 rounded-xl border border-slate-800/40">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Daily Intake Met Today</div>
                    
                    {/* Render Calories bar */}
                    {(() => {
                      const todayOrders = orderHistory.filter(order => {
                        const orderDate = new Date(order.date);
                        const today = new Date();
                        return orderDate.getDate() === today.getDate() &&
                               orderDate.getMonth() === today.getMonth() &&
                               orderDate.getFullYear() === today.getFullYear();
                      });
                      const consumedCalories = todayOrders.reduce((sum, o) => sum + o.totalCalories, 0);
                      const consumedProtein = todayOrders.reduce((sum, o) => sum + o.totalProtein, 0);
                      const consumedCarbs = todayOrders.reduce((sum, o) => sum + o.totalCarbohydrates, 0);
                      const consumedFats = todayOrders.reduce((sum, o) => sum + o.totalFats, 0);
                      const consumedFiber = todayOrders.reduce((sum, o) => sum + o.totalFiber, 0);

                      const calPct = Math.min(100, Math.round((consumedCalories / nutritionTargets.calories) * 100));
                      const protPct = Math.min(100, Math.round((consumedProtein / nutritionTargets.protein) * 100));
                      const carbPct = Math.min(100, Math.round((consumedCarbs / nutritionTargets.carbohydrates) * 100));
                      const fatPct = Math.min(100, Math.round((consumedFats / nutritionTargets.fats) * 100));
                      const fibPct = Math.min(100, Math.round((consumedFiber / nutritionTargets.fiber) * 100));

                      return (
                        <div className="space-y-2.5 text-[11px]">
                          {/* Calories progress */}
                          <div>
                            <div className="flex justify-between text-slate-300 font-medium mb-1">
                              <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-swiggy-orange" /> Calories</span>
                              <span className="font-extrabold text-white">{consumedCalories} <span className="text-slate-500 font-normal">/ {nutritionTargets.calories} kcal</span> ({calPct}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-swiggy-orange to-amber-500 rounded-full" style={{ width: `${calPct}%` }} />
                            </div>
                          </div>

                          {/* Protein progress */}
                          <div>
                            <div className="flex justify-between text-slate-300 font-medium mb-1">
                              <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-healthy-emerald" /> Protein</span>
                              <span className="font-extrabold text-white">{consumedProtein} <span className="text-slate-500 font-normal">/ {nutritionTargets.protein}g</span> ({protPct}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                              <div className="h-full bg-healthy-emerald rounded-full" style={{ width: `${protPct}%` }} />
                            </div>
                          </div>

                          {/* Other macros in small grid */}
                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/40 text-[10px]">
                            <div>
                              <div className="text-slate-400 mb-0.5">Carbs ({carbPct}%)</div>
                              <div className="font-bold text-slate-200">{consumedCarbs}g <span className="text-slate-500 text-[9px]">/ {nutritionTargets.carbohydrates}g</span></div>
                            </div>
                            <div>
                              <div className="text-slate-400 mb-0.5">Fats ({fatPct}%)</div>
                              <div className="font-bold text-slate-200">{consumedFats}g <span className="text-slate-500 text-[9px]">/ {nutritionTargets.fats}g</span></div>
                            </div>
                            <div>
                              <div className="text-slate-400 mb-0.5">Fiber ({fibPct}%)</div>
                              <div className="font-bold text-slate-200">{consumedFiber}g <span className="text-slate-500 text-[9px]">/ {nutritionTargets.fiber}g</span></div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* History Section */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-800 flex-shrink-0">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Recent Placed Orders</span>
                    {orderHistory.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to clear your entire order history?")) {
                            setOrderHistory([]);
                            localStorage.removeItem("nutriswiggy_orders");
                          }
                        }}
                        className="text-[9px] font-bold text-rose-400 hover:text-rose-350 cursor-pointer transition-colors"
                      >
                        Clear History
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto pr-0.5 space-y-2 mt-2 min-h-0">
                    {orderHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <p className="text-[11px] font-medium text-slate-500 leading-normal">
                          No order history found. Place orders in your Cart to track consumption.
                        </p>
                      </div>
                    ) : (
                      orderHistory.map((order, idx) => (
                        <div
                          key={order.id}
                          className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 text-[10px] space-y-1 relative group hover:border-slate-700/80 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-slate-300">{order.restaurant}</span>
                              <span className="text-[8px] text-slate-500 block">{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-white bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[9px]">{order.totalCalories} kcal</span>
                              <button
                                onClick={() => {
                                  setOrderHistory(prev => {
                                    const updated = prev.filter(o => o.id !== order.id);
                                    localStorage.setItem("nutriswiggy_orders", JSON.stringify(updated));
                                    return updated;
                                  });
                                }}
                                className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 rounded text-slate-500 hover:text-rose-400 transition-all duration-200"
                                title="Delete Order"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="text-slate-400 italic font-medium border-t border-slate-800/30 pt-1">
                            {order.items.map((it: any) => it.name).join(", ")}
                          </div>
                          <div className="flex gap-2 text-[9px] text-slate-500 font-semibold mt-0.5">
                            <span>Protein: {order.totalProtein}g</span>
                            <span>Fiber: {order.totalFiber}g</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}
          </section>
        </div>

        {/* Dynamic Hackathon Footer */}
        <footer className="text-center py-8 text-[10px] text-slate-500 border-t border-slate-900/80 flex flex-col gap-4 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>© 2026 Swiggy Builders Club • NutriSwiggy AI dietitian assistant • <span className="text-slate-400 font-semibold">powered by Swiggy</span></p>
            <div className="flex gap-4">
              <span className="hover:text-swiggy-orange cursor-pointer">FastAPI Backend</span>
              <span className="hover:text-swiggy-orange cursor-pointer">Next.js Frontend</span>
              <span className="hover:text-swiggy-orange cursor-pointer">Gemini AI Agentic RAG</span>
            </div>
          </div>
          <div className="bg-slate-900/25 border border-slate-800/50 rounded-2xl p-3 max-w-4xl mx-auto text-slate-400 leading-normal text-left">
            <p className="font-semibold text-slate-300 mb-0.5">🔒 Data Privacy & Consent Notice (DPDP Compliance):</p>
            In compliance with the <strong>Digital Personal Data Protection Act, 2023</strong> and the <strong>Digital Personal Data Protection Rules, 2025</strong>, NutriSwiggy operates with full privacy enforcement. All Swiggy session details, customer cart payloads, and addresses are processed temporarily in memory to validate menu listings. No user transactions, personal data, or failed/abandoned orders are stored, serialized, or used for marketing. Disconnecting your Swiggy account purges all session content immediately from our active system memory.
          </div>
        </footer>

      </div>

      {/* Restaurant Switch Modal (Premium Glassmorphic overlay) */}
      <AnimatePresence>
        {showRestaurantModal && pendingMeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-swiggy-orange" />
                <span>Switch Restaurant?</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your cart currently contains items from <strong className="text-white">{cart[0]?.restaurant}</strong>. 
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
                  className="px-4 py-2 bg-gradient-to-r from-swiggy-orange to-amber-500 hover:from-swiggy-orange-dark hover:to-amber-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
                >
                  Clear & Add
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </main>
  );
}
