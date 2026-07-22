"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { MealCard, MealProps } from "@/components/MealCard";
import { RESTAURANTS, CATEGORIES } from "@/utils/mockData";
import { useCartStore } from "@/store/useCartStore";
import { OfferBanner } from "@/components/OfferBanner";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { 
  Apple, 
  Leaf, 
  Trophy, 
  ShieldCheck, 
  Flame, 
  Compass, 
  ChevronDown, 
  Check, 
  ShoppingCart, 
  Trash2, 
  Pencil,
  SlidersHorizontal, 
  Star, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Percent, 
  Zap, 
  UtensilsCrossed 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const availableCoupons = [
  {
    code: "SWIGGY50",
    discount: "50% OFF",
    title: "Welcome Offer",
    description: "Get 50% discount on your first healthy order.",
    minOrder: "₹199",
    maxDiscount: "₹150",
    color: "from-orange-500 to-amber-500",
  },
  {
    code: "NUTRI30",
    discount: "30% OFF",
    title: "AI Dietitian Special",
    description: "Enjoy 30% off on all dietitian recommended meals.",
    minOrder: "₹149",
    maxDiscount: "₹100",
    color: "from-emerald-500 to-teal-500",
  },
  {
    code: "HEALTHY20",
    discount: "20% OFF",
    title: "Daily Nutrition Boost",
    description: "Get 20% off on high protein and low carb dishes.",
    minOrder: "₹99",
    maxDiscount: "₹60",
    color: "from-blue-500 to-indigo-500",
  },
  {
    code: "DIET50",
    discount: "50% OFF",
    title: "Super Weight Loss Deal",
    description: "Flat 50% off on selected salads and keto options.",
    minOrder: "₹249",
    maxDiscount: "₹200",
    color: "from-rose-500 to-pink-500",
  }
];

function CouponCard({ coupon }: { coupon: typeof availableCoupons[0] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      {/* Decorative colored bar */}
      <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${coupon.color}`} />
      
      <div className="space-y-3 pl-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              PROMO CODE
            </span>
            <h4 className="text-lg font-black text-[#282C3F] mt-1.5">{coupon.discount}</h4>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#FC8019] group-hover:scale-110 transition-transform duration-300">
            <Percent className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h5 className="text-xs font-extrabold text-slate-700">{coupon.title}</h5>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            {coupon.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-bold border-t border-slate-50 pt-2">
          <span>Min. Order: {coupon.minOrder}</span>
          <span>•</span>
          <span>Max Disc: {coupon.maxDiscount}</span>
        </div>
      </div>

      <div className="mt-4 pl-2 pt-2 border-t border-dashed border-slate-150 flex items-center justify-between gap-3">
        <div className="bg-slate-50 border border-slate-200 border-dashed px-3 py-1.5 rounded-lg text-xs font-black tracking-wider text-[#282C3F] select-all">
          {coupon.code}
        </div>
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all duration-200 active:scale-95 ${
            copied
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
              : "bg-[#FC8019] hover:bg-[#e06f14] text-white shadow-md shadow-[#FC8019]/15"
          }`}
        >
          {copied ? "COPIED! ✅" : "Copy Code"}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { 
    activeFilter, 
    setActiveFilter, 
    dietitianMode 
  } = useCartStore();

  const [recommendedMeals, setRecommendedMeals] = useState<MealProps[]>([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [cart, setCart] = useState<MealProps[]>([]);
  const [authStatus, setAuthStatus] = useState({ connected: false, mode: "Mock Demo" });
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<MealProps | null>(null);
  
  // Pending order logging confirmations
  const [pendingOrderToLog, setPendingOrderToLog] = useState<any>(null);
  const [showLogConfirmModal, setShowLogConfirmModal] = useState(false);

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
    fetch("http://localhost:8000/auth/status")
      .then(res => res.json())
      .then(data => setAuthStatus(data))
      .catch(err => console.error("Failed to check auth status", err));

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

  const handleConnectSwiggy = () => {
    fetch("http://localhost:8000/auth/login")
      .then(res => res.json())
      .then(data => {
        if (data.authorize_url) {
          window.location.href = data.authorize_url;
        }
      })
      .catch(err => console.error("Failed to initiate login", err));
  };

  const handleDisconnectSwiggy = () => {
    fetch("http://localhost:8000/auth/logout", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setAuthStatus({ connected: false, mode: "Mock Demo" });
          setCart([]);
          setRecommendedMeals([]);
          alert("🔌 Swiggy Session Disconnected. Swiggy listings and cart data have been purged successfully.");
        }
      })
      .catch(err => console.error("Failed to logout", err));
  };

  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const filterOptions = [
    { id: "veg", name: "Pure Veg", icon: <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> },
    { id: "top-rated", name: "Ratings 4.5+", icon: <Star className="w-3.5 h-3.5 text-[#FC8019] fill-current" /> },
    { id: "delivery", name: "Fast Delivery", icon: <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" /> },
    { id: "offers", name: "Offers", icon: <Percent className="w-3.5 h-3.5 text-[#FC8019]" /> },
    ...(dietitianMode ? [{ id: "healthy", name: "Dietitian Recommended", icon: <Sparkles className="w-3 h-3 text-[#FC8019]" /> }] : [])
  ];

  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "time" | "cost-asc" | "cost-desc">("relevance");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const topChainsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollChains = (direction: "left" | "right") => {
    if (topChainsContainerRef.current) {
      const { scrollLeft, clientWidth } = topChainsContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      topChainsContainerRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

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

    const syncPayload = {
      restaurantId: cart[0].restaurant_id || cart[0].restaurant,
      items: cart.map(item => ({
        itemId: item.id,
        quantity: 1
      }))
    };

    try {
      const response = await fetch("http://localhost:8000/api/cart/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(syncPayload)
      });

      if (!response.ok) {
        throw new Error("Failed to sync cart with backend.");
      }

      const data = await response.json();
      
      // Log order to nutrition tracker history
      const newOrder = {
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString(),
        restaurant: cart[0].restaurant,
        items: cart.map(item => ({
          name: item.item,
          calories: item.macros?.calories || 0,
          protein: item.macros?.protein || 0,
          carbohydrates: item.macros?.carbohydrates || 0,
          fats: item.macros?.fats || 0,
          fiber: item.macros?.fiber || 0
        })),
        totalCalories: cart.reduce((sum, item) => sum + (item.macros?.calories || 0), 0),
        totalProtein: cart.reduce((sum, item) => sum + (item.macros?.protein || 0), 0),
        totalCarbohydrates: cart.reduce((sum, item) => sum + (item.macros?.carbohydrates || 0), 0),
        totalFats: cart.reduce((sum, item) => sum + (item.macros?.fats || 0), 0),
        totalFiber: cart.reduce((sum, item) => sum + (item.macros?.fiber || 0), 0)
      };

      // Save order to pending state and ask user to confirm logging after checkout
      setPendingOrderToLog(newOrder);

      if (data.mode === "Live MCP") {
        setCart([]); // Clear local cart
        window.open(data.redirect_url, "_blank");
        setShowLogConfirmModal(true);
      } else {
        setCart([]); // Clear local cart
        window.open(data.redirect_url, "_blank");
        setShowLogConfirmModal(true);
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Checkout failed: Could not sync cart with Swiggy session.");
    }
  };

  const handleLogMacros = () => {
    if (!pendingOrderToLog) return;
    setOrderHistory((prev) => {
      const updated = [pendingOrderToLog, ...prev];
      localStorage.setItem("nutriswiggy_orders", JSON.stringify(updated));
      return updated;
    });
    setPendingOrderToLog(null);
    setShowLogConfirmModal(false);
    alert("🥗 Macros successfully logged to your daily tracker dashboard!");
  };

  const totalCalories = cart.reduce((sum, item) => sum + (item.macros?.calories || 0), 0);
  const totalProtein = cart.reduce((sum, item) => sum + (item.macros?.protein || 0), 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const getAvgHealthScore = (rest: any) => {
    if (!rest.menu || rest.menu.length === 0) return 0;
    const total = rest.menu.reduce((sum: number, item: any) => sum + item.healthScore, 0);
    return Math.round(total / rest.menu.length);
  };

  // 1. Filtering Logic
  const filteredRestaurants = RESTAURANTS.filter((rest) => {
    // Category Filter
    if (activeFilter !== "All") {
      const hasCategory = rest.menu.some(
        (item) => item.category.toLowerCase().includes(activeFilter.toLowerCase()) || 
                  item.name.toLowerCase().includes(activeFilter.toLowerCase())
      );
      if (!hasCategory) return false;
    }

    // Quick Filters
    if (selectedFilters.includes("veg") && !rest.veg) return false;
    if (selectedFilters.includes("top-rated") && rest.rating < 4.5) return false;
    if (selectedFilters.includes("delivery") && rest.deliveryTime > 25) return false;
    if (selectedFilters.includes("offers") && !rest.offer) return false;
    
    // Dietitian Recommended (Avg Health Score >= 80)
    if (selectedFilters.includes("healthy")) {
      const score = getAvgHealthScore(rest);
      if (score < 80) return false;
    }

    // Under dietitian mode, if 'healthy' isn't explicitly active, still filter out extremely low health score outlets if desired
    if (dietitianMode && selectedFilters.length === 0) {
      // Show all but we rank them by health score first
    }

    return true;
  });

  // 2. Sorting Logic
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (dietitianMode && sortBy === "relevance") {
      // In Dietitian Mode, default sorting is by Health Score
      return getAvgHealthScore(b) - getAvgHealthScore(a);
    }

    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "time":
        return a.deliveryTime - b.deliveryTime;
      case "cost-asc":
        return a.costForTwo - b.costForTwo;
      case "cost-desc":
        return b.costForTwo - a.costForTwo;
      default:
        return 0; // relevance / default id order
    }
  });

  const popularChains = RESTAURANTS.filter((r) => r.isPopular);

  const sortOptions = [
    { id: "relevance", name: dietitianMode ? "Health Score (High to Low)" : "Relevance (Default)" },
    { id: "rating", name: "Rating: High to Low" },
    { id: "time", name: "Delivery Time: Fastest First" },
    { id: "cost-asc", name: "Cost: Low to High" },
    { id: "cost-desc", name: "Cost: High to Low" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-10 relative overflow-x-hidden">
      
      {/* Promotional Offers Banner */}
      <section className="relative z-10">
        <OfferBanner />
      </section>

      {/* CAROUSEL 1: "What's on your mind?" (Swiggy Replica Circular Grid) */}
      <section className="space-y-4 relative z-10">
        <div className="flex justify-between items-end border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#282C3F] tracking-tight">
              What's on your mind?
            </h2>
            <p className="text-xs text-slate-500 mt-1">Discover popular cuisines and healthy favorites</p>
          </div>
        </div>
        
        {/* Horizontal scroll of circular categories */}
        <div className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none scroll-smooth">
          {/* 'All Foods' Circle */}
            onClick={() => setActiveFilter("All")}
            className="flex-shrink-0 flex flex-col items-center gap-2 group outline-none"
          >
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 border-2 ${
              activeFilter === "All"
                ? "border-[#FC8019] bg-[#FC8019]/10 shadow-lg shadow-[#FC8019]/25 scale-105"
                : "border-slate-200 bg-slate-50 group-hover:border-slate-300"
            }`}>
              <UtensilsCrossed className={`w-8 h-8 ${activeFilter === "All" ? "text-[#FC8019]" : "text-slate-500 group-hover:text-[#282C3F]"}`} />
            </div>
            <span className={`text-xs font-extrabold tracking-wide uppercase ${activeFilter === "All" ? "text-[#FC8019]" : "text-slate-500 group-hover:text-[#282C3F]"}`}>
              All Foods
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = activeFilter === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(isSelected ? "All" : cat.name)}
                className="flex-shrink-0 flex flex-col items-center gap-2 group outline-none"
              >
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden transition-all duration-300 border-2 ${
                  isSelected
                    ? "border-[#FC8019] shadow-lg shadow-[#FC8019]/25 scale-105"
                    : "border-slate-200 bg-slate-50 group-hover:border-slate-300"
                }`}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className={`text-xs font-extrabold tracking-wide uppercase transition-colors duration-200 ${
                  isSelected ? "text-[#FC8019]" : "text-slate-500 group-hover:text-[#282C3F]"
                }`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* CAROUSEL 2: "Top restaurant chains in Bangalore" (Swiggy Horizontal Slider) */}
      <section className="space-y-4 relative z-10">
        <div className="flex justify-between items-end border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#282C3F] tracking-tight">
              Top restaurant chains in Bangalore
            </h2>
            <p className="text-xs text-slate-500 mt-1">Popular outlets offering premium services nearby</p>
          </div>
          
          {/* Scroll buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleScrollChains("left")}
              className="p-2 rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-550 hover:text-[#282C3F] transition-all active:scale-90 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleScrollChains("right")}
              className="p-2 rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-550 hover:text-[#282C3F] transition-all active:scale-90 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll of restaurant chains */}
        <div 
          ref={topChainsContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none scroll-smooth"
        >
          {popularChains.map((rest) => (
            <div key={rest.id} className="w-72 flex-shrink-0">
              <RestaurantCard restaurant={rest} />
            </div>
          ))}
        </div>
      </section>

      {/* RESTAURANTS WITH ONLINE FOOD DELIVERY */}
      <section className="space-y-6 relative z-10 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#282C3F] tracking-tight flex items-center gap-2">
              <span>Restaurants with online food delivery in Bangalore</span>
              {authStatus.connected && (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3 h-3" /> Live Swiggy MCP
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Explore top rated dining spots with verified nutrition macros</p>
          </div>

          {/* Connect / Disconnect Swiggy Session button */}
          <div className="flex items-center gap-2">
            {!authStatus.connected ? (
              <button
                onClick={handleConnectSwiggy}
                className="text-xs font-bold px-4 py-2 bg-gradient-to-r from-[#FC8019] to-amber-500 hover:from-[#e06f14] hover:to-amber-600 text-white rounded-xl shadow-md active:scale-95 transition-all"
              >
                Connect Swiggy
              </button>
            ) : (
              <button
                onClick={handleDisconnectSwiggy}
                className="text-xs font-bold px-3 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-xl transition-all"
              >
                Disconnect Swiggy
              </button>
            )}
          </div>
        </div>

        {/* FILTER BAR & SORTING */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => toggleFilter("veg")}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
                selectedFilters.includes("veg")
                  ? "bg-[#FC8019]/10 border-[#FC8019] text-[#FC8019]"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-[#282C3F]"
              }`}
            >
              <span>Pure Veg</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>

            <button
              onClick={() => toggleFilter("top-rated")}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-1 ${
                selectedFilters.includes("top-rated")
                  ? "bg-[#FC8019]/10 border-[#FC8019] text-[#FC8019]"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-[#282C3F]"
              }`}
            >
              <span>Ratings 4.5+</span>
              <Star className="w-3 h-3 text-[#FC8019] fill-current" />
            </button>

            <button
              onClick={() => toggleFilter("delivery")}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-1 ${
                selectedFilters.includes("delivery")
                  ? "bg-[#FC8019]/10 border-[#FC8019] text-[#FC8019]"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-[#282C3F]"
              }`}
            >
              <span>Fast Delivery</span>
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
            </button>

            <button
              onClick={() => toggleFilter("offers")}
              className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-1 ${
                selectedFilters.includes("offers")
                  ? "bg-[#FC8019]/10 border-[#FC8019] text-[#FC8019]"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-[#282C3F]"
              }`}
            >
              <span>Offers</span>
              <Percent className="w-3.5 h-3.5 text-[#FC8019]" />
            </button>

            {dietitianMode && (
              <button
                onClick={() => toggleFilter("healthy")}
                className={`text-xs font-bold px-4 py-2 rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
                  selectedFilters.includes("healthy")
                    ? "bg-[#FC8019]/15 border-[#FC8019] text-[#FC8019] shadow-md shadow-[#FC8019]/5 animate-pulse"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-[#282C3F]"
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#FC8019]" />
                <span>Dietitian Recommended</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100 px-4 py-2 border border-slate-200 rounded-full cursor-pointer transition-all duration-200 text-xs font-bold"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-[#FC8019]" />
                <span>Sort By: {sortOptions.find(o => o.id === sortBy)?.name.split(":")[0]}</span>
              </button>

              <AnimatePresence>
                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowSortDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl p-2 shadow-2xl z-30 overflow-hidden"
                    >
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSortBy(opt.id as any);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                            sortBy === opt.id
                              ? "bg-[#FC8019]/10 text-[#FC8019]"
                              : "text-slate-700 hover:bg-slate-50 hover:text-[#282C3F]"
                          }`}
                        >
                          {opt.name}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* OFFERS / COUPON GRID CONTAINER */}
        <AnimatePresence>
          {selectedFilters.includes("offers") && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4 pb-6 border-b border-slate-150"
            >
              <div>
                <h3 className="text-base font-black text-[#282C3F] flex items-center gap-2">
                  <Percent className="w-5 h-5 text-[#FC8019]" />
                  <span>Active Promo Coupons & Deals</span>
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-250">
                    4 Coupons Available
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Copy any code below to apply flat discounts on your cart at checkout!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {availableCoupons.map((coupon) => (
                  <CouponCard key={coupon.code} coupon={coupon} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTIVE GRID */}
        {loading ? (
          <SkeletonLoader />
        ) : sortedRestaurants.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-3xl p-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#282C3F]">No restaurants match your filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try resetting your active category filters to explore more options.</p>
            <button
              onClick={() => {
                setActiveFilter("All");
                setSelectedFilters([]);
                setSortBy("relevance");
              }}
              className="mt-4 bg-white hover:bg-slate-50 active:scale-95 text-xs font-bold px-4 py-2 border border-slate-200 rounded-xl text-slate-700 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedRestaurants.map((rest) => (
              <RestaurantCard key={rest.id} restaurant={rest} />
            ))}
          </div>
        )}
      </section>

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
                <Trash2 className="w-5 h-5 text-[#FC8019]" />
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
                  className="px-4 py-2 bg-gradient-to-r from-[#FC8019] to-amber-500 hover:from-[#e06f14] hover:to-amber-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
                >
                  Clear & Add
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Macros Confirmation Modal */}
      <AnimatePresence>
        {showLogConfirmModal && pendingOrderToLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-left"
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Log Nutrition Macros?</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We've synced your cart and opened the Swiggy checkout page in a new tab. 
                Once you complete your payment on Swiggy, click below to log these macros to your daily nutrition dashboard:
              </p>
              <div className="bg-slate-950/50 rounded-2xl p-3 border border-slate-800/50 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Restaurant:</span>
                  <span className="font-bold text-slate-200">{pendingOrderToLog.restaurant}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Calories:</span>
                  <span className="font-bold text-emerald-400">{Math.round(pendingOrderToLog.totalCalories)} kcal</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Protein:</span>
                  <span className="font-bold text-indigo-400">{Math.round(pendingOrderToLog.totalProtein)}g</span>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowLogConfirmModal(false);
                    setPendingOrderToLog(null);
                  }}
                  className="px-4 py-2 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-slate-300 active:scale-95 transition-all"
                >
                  Cancel / Didn't Pay
                </button>
                <button
                  onClick={handleLogMacros}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-lg shadow-emerald-500/10"
                >
                  Yes, Log Macros
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
