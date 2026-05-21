"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, CartItem } from "@/store/useCartStore";
import { ShoppingCart, ArrowRight, Percent, Check, MapPin, Sparkles, Flame, Trophy, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const { 
    cart, 
    updateQuantity, 
    removeItem, 
    selectedAddress, 
    setSelectedAddress, 
    selectedCoupon, 
    applyCoupon 
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [showAddressOptions, setShowAddressOptions] = useState(false);

  const addressOptions = [
    "Home: 45, Green Glen Layout, Outer Ring Road, Bangalore",
    "Office: 102, Prestige Tech Park, Marathahalli Road, Bangalore",
    "Gym: 18, Cult.fit, HSR Layout Sector 2, Bangalore"
  ];

  // Price calculations
  const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Delivery fee: Free over ₹400, or if coupon applied (simulated)
  const deliveryFee = itemsTotal === 0 || itemsTotal >= 400 ? 0 : 30;
  const packagingCharges = itemsTotal === 0 ? 0 : 15;
  const gstCharges = Math.round(itemsTotal * 0.05); // 5% GST

  const discountAmount = selectedCoupon
    ? Math.round((itemsTotal * selectedCoupon.discountPercent) / 100)
    : 0;

  const grandTotal = itemsTotal + deliveryFee + packagingCharges + gstCharges - discountAmount;

  // Nutrient aggregates
  const totalCalories = cart.reduce((sum, item) => sum + (item.macros?.calories || 0) * item.quantity, 0);
  const totalProtein = cart.reduce((sum, item) => sum + (item.macros?.protein || 0) * item.quantity, 0);
  const totalCarbs = cart.reduce((sum, item) => sum + (item.macros?.carbohydrates || 0) * item.quantity, 0);
  const totalFiber = cart.reduce((sum, item) => sum + (item.macros?.fiber || 0) * item.quantity, 0);

  const handleApplyCoupon = (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    setCouponError("");
    setCouponSuccess(false);

    const codeToApply = customCode || couponInput;
    if (!codeToApply.trim()) return;

    const success = applyCoupon(codeToApply);
    if (success) {
      setCouponSuccess(true);
      setCouponInput(codeToApply.toUpperCase());
      setTimeout(() => setCouponSuccess(false), 3000);
    } else {
      setCouponError("Invalid coupon code. Try 'SWIGGY50' or 'NUTRI30'.");
    }
  };

  const handleRemoveCoupon = () => {
    applyCoupon(null);
    setCouponInput("");
  };

  // Group cart items by restaurant
  const groupedCart = cart.reduce((acc, item) => {
    const restName = item.restaurantName || "NutriSwiggy Partner Kitchen";
    if (!acc[restName]) {
      acc[restName] = [];
    }
    acc[restName].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  if (cart.length === 0) {
    return (
      <div className="min-h-[85vh] bg-[#F1F3F6] flex flex-col justify-center items-center px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_4px_16px_rgba(40,44,63,0.06)] space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#FC8019]/10 flex items-center justify-center mx-auto text-[#FC8019] shadow-inner">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#282C3F]">Your cart is empty</h2>
            <p className="text-sm text-[#686B78] max-w-xs mx-auto leading-relaxed">
              Good food is always cooking! Go ahead, explore top restaurants and customize your dietitian targets.
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-[#FC8019] hover:bg-[#E06D0F] active:scale-[0.98] text-sm font-black py-3.5 px-6 rounded-xl text-white transition-all shadow-md shadow-[#FC8019]/25 hover:shadow-lg"
          >
            Discover Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6] py-8 pb-16 font-sans text-[#282C3F]">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        
        {/* Header Title */}
        <div className="flex items-center gap-2.5 mb-6">
          <ShoppingCart className="w-6 h-6 text-[#FC8019]" />
          <h2 className="text-xl md:text-2xl font-black text-[#282C3F] tracking-tight">Your Cart</h2>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT SIDEBAR: Items & Delivery Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Grouped Cart Items Cards */}
            {Object.entries(groupedCart).map(([restaurantName, items]) => {
              const restaurantId = items[0]?.restaurantId || "1";
              return (
                <div 
                  key={restaurantName} 
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-5 md:p-6 shadow-[0_4px_16px_rgba(40,44,63,0.03)] space-y-5"
                >
                  {/* Restaurant Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <Link 
                        href={`/restaurant/${restaurantId}`} 
                        className="text-base font-black text-[#282C3F] hover:text-[#FC8019] transition-colors tracking-tight uppercase block"
                      >
                        {restaurantName}
                      </Link>
                      <p className="text-[11px] text-[#7E808C] font-semibold mt-0.5">NutriSwiggy Certified Healthy Kitchen</p>
                    </div>
                    <span className="text-[10px] bg-[#FC8019]/10 text-[#FC8019] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                      Verified
                    </span>
                  </div>
                  
                  {/* Items List inside Restaurant */}
                  <div className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <div key={item.id} className="py-4.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        
                        {/* Left: Veg Indicator & Info */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* Swiggy Style Veg/Non-veg Indicator */}
                          <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center p-0.5 flex-shrink-0 mt-0.5 ${item.veg ? "border-green-600" : "border-red-600"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`} />
                          </div>
                          
                          <div className="min-w-0">
                            <h4 className="text-xs md:text-sm font-bold text-[#282C3F] leading-tight truncate">{item.name}</h4>
                            {item.macros && (
                              <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold">
                                <span className="text-[#FC8019] bg-[#FC8019]/5 px-2 py-0.5 rounded-md">{item.macros.calories} kcal</span>
                                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{item.macros.protein}g Protein</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Quantity Controls & Price */}
                        <div className="flex items-center gap-6 flex-shrink-0">
                          
                          {/* Swiggy Style Pill Quantity Selector */}
                          <div className="flex items-center justify-between border border-[#FC8019] bg-white rounded-lg h-7.5 w-20 overflow-hidden text-xs shadow-sm shadow-[#FC8019]/5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-full text-[#FC8019] hover:bg-[#FC8019]/5 font-black text-center transition-colors flex items-center justify-center text-sm"
                            >
                              -
                            </button>
                            <span className="font-extrabold text-[#FC8019] text-xs select-none">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-full text-[#FC8019] hover:bg-[#FC8019]/5 font-black text-center transition-colors flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <span className="text-xs md:text-sm font-extrabold text-[#282C3F] min-w-[55px] text-right">
                            ₹{item.price * item.quantity}
                          </span>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Delivery Address Summary Panel */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 md:p-6 shadow-[0_4px_16px_rgba(40,44,63,0.03)] relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FC8019]/10 flex items-center justify-center flex-shrink-0 text-[#FC8019]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-[#282C3F]">
                        {selectedAddress.split(":")[0]} Destination
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-[#686B78] mt-1 leading-relaxed max-w-md">
                      {selectedAddress.split(":")[1] || selectedAddress}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddressOptions(!showAddressOptions)}
                  className="text-xs font-black text-[#FC8019] hover:text-[#E06D0F] tracking-wide transition-colors flex-shrink-0 mt-1"
                >
                  {showAddressOptions ? "CLOSE" : "CHANGE"}
                </button>
              </div>

              {/* Animate address options dropdown */}
              <AnimatePresence>
                {showAddressOptions && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-4 pt-4 border-t border-slate-100 space-y-2.5"
                  >
                    <p className="text-[10px] text-[#7E808C] font-extrabold uppercase tracking-wider mb-1">Select Delivery Destination:</p>
                    {addressOptions.map((addr) => {
                      const isSelected = selectedAddress === addr;
                      const label = addr.split(":")[0];
                      const detail = addr.split(":")[1];
                      return (
                        <button
                          key={addr}
                          onClick={() => {
                            setSelectedAddress(addr);
                            setShowAddressOptions(false);
                          }}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold transition-all flex items-start gap-3 ${
                            isSelected
                              ? "bg-[#FC8019]/5 border-[#FC8019] text-[#FC8019]"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className={`block font-extrabold ${isSelected ? "text-[#FC8019]" : "text-[#282C3F]"}`}>{label}</span>
                            <span className="text-[10px] text-[#7E808C] block font-medium mt-0.5">{detail}</span>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* RIGHT SIDEBAR: Bill Details & Coupons (Sticky) */}
          <div className="lg:sticky lg:top-24 space-y-6">
            
            {/* Coupon Entry Panel */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-[0_4px_16px_rgba(40,44,63,0.03)] space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#FC8019]/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Percent className="w-4.5 h-4.5 text-[#FC8019]" />
                <span className="text-xs font-black text-slate-450 uppercase tracking-widest">Apply Coupon</span>
              </div>

              {selectedCoupon ? (
                <div className="bg-emerald-500/5 border border-emerald-200 rounded-xl p-3.5 flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-xs font-black text-emerald-600 uppercase flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" /> Coupon Applied
                    </span>
                    <p className="text-[10px] text-[#686B78] mt-1 font-bold">Code: {selectedCoupon.code} (-{selectedCoupon.discountPercent}%)</p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[10px] font-black text-rose-500 hover:text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                  >
                    REMOVE
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <form onSubmit={(e) => handleApplyCoupon(e)} className="flex items-center border border-dashed border-slate-350 hover:border-slate-400 focus-within:border-[#FC8019] rounded-xl px-3 py-1 bg-white transition-colors">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 bg-transparent py-2 text-xs font-black text-[#282C3F] placeholder-slate-400 focus:outline-none uppercase tracking-wider"
                    />
                    <button
                      type="submit"
                      className="text-xs font-black text-[#FC8019] hover:text-[#E06D0F] px-2 transition-colors focus:outline-none"
                    >
                      APPLY
                    </button>
                  </form>
                  {couponError && (
                    <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {couponError}
                    </p>
                  )}
                  {couponSuccess && <p className="text-[10px] font-bold text-emerald-600">Coupon applied successfully!</p>}
                  
                  {/* Coupon Hint Pills */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[9px] text-[#7E808C] font-extrabold uppercase tracking-wide block">Smart Suggestions:</span>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleApplyCoupon(undefined, "SWIGGY50")}
                        className="bg-[#FC8019]/5 hover:bg-[#FC8019]/10 border border-[#FC8019]/10 rounded-full px-3 py-1.5 text-[10px] text-[#FC8019] font-extrabold tracking-wider uppercase transition-colors"
                      >
                        🏷️ SWIGGY50 (50% OFF)
                      </button>
                      <button 
                        onClick={() => handleApplyCoupon(undefined, "NUTRI30")}
                        className="bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-full px-3 py-1.5 text-[10px] text-emerald-600 font-extrabold tracking-wider uppercase transition-colors"
                      >
                        🥗 NUTRI30 (30% OFF)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nutri Statistics aggregates scorecard (Special Add-on) */}
            {totalCalories > 0 && (
              <div className="bg-[#F0FDF4] border border-emerald-150 rounded-2xl p-5 shadow-[0_4px_16px_rgba(16,185,129,0.02)] space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-1.5 border-b border-emerald-100/80 pb-2.5">
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                    🍀 Swiggy Health Scorecard
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-700">
                  <div className="bg-white border border-emerald-100/50 p-3 rounded-xl flex flex-col justify-center shadow-sm">
                    <span className="text-[10px] text-[#7E808C] uppercase tracking-wider font-extrabold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#FC8019] fill-[#FC8019]/10" /> Calories
                    </span>
                    <span className="text-[#282C3F] text-sm md:text-base font-black mt-1">{totalCalories} kcal</span>
                  </div>
                  <div className="bg-white border border-emerald-100/50 p-3 rounded-xl flex flex-col justify-center shadow-sm">
                    <span className="text-[10px] text-[#7E808C] uppercase tracking-wider font-extrabold flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" /> Protein
                    </span>
                    <span className="text-emerald-600 text-sm md:text-base font-black mt-1">{totalProtein}g</span>
                  </div>
                </div>
                
                <div className="border-t border-emerald-100/60 pt-3 flex justify-between items-center text-[10px] font-bold text-[#686B78]">
                  <div className="flex items-center gap-2">
                    <span>Carbs: <strong className="text-[#282C3F]">{totalCarbs}g</strong></span>
                    <span className="text-emerald-300">•</span>
                    <span>Fiber: <strong className="text-emerald-600">{totalFiber}g</strong></span>
                  </div>
                  <span className="text-[8px] bg-emerald-600/10 text-emerald-700 font-extrabold uppercase px-2 py-0.5 rounded-full">
                    Dietitian Approved
                  </span>
                </div>
              </div>
            )}

            {/* Pricing aggregates summary */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-[0_4px_16px_rgba(40,44,63,0.03)] space-y-4 relative overflow-hidden">
              <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest border-b border-slate-100 pb-3">Bill Details</h3>
              
              <div className="space-y-3 text-xs font-bold text-[#686B78]">
                <div className="flex justify-between border-b border-dashed border-[#E2E8F0] pb-2.5">
                  <span>Item Total</span>
                  <span className="text-[#282C3F]">₹{itemsTotal}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-[#E2E8F0] pb-2.5">
                  <span>Delivery Partner Fee</span>
                  <span className="text-[#282C3F]">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-[#E2E8F0] pb-2.5">
                  <span>Restaurant Packaging Charges</span>
                  <span className="text-[#282C3F]">₹{packagingCharges}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-[#E2E8F0] pb-2.5">
                  <span>Govt Taxes & GST (5%)</span>
                  <span className="text-[#282C3F]">₹{gstCharges}</span>
                </div>
                {selectedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-black bg-emerald-50 p-2.5 rounded-xl border border-dashed border-emerald-200">
                    <span>Coupon Discount ({selectedCoupon.discountPercent}%)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-sm font-black text-[#282C3F]">
                <span className="text-sm font-black text-[#282C3F] uppercase tracking-wider">To Pay</span>
                <span className="text-lg font-black text-[#282C3F]">₹{grandTotal}</span>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-[#FC8019] hover:bg-[#E06D0F] hover:brightness-105 active:scale-[0.98] text-white text-xs font-black py-4 px-4 rounded-xl shadow-md shadow-[#FC8019]/25 hover:shadow-lg flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
