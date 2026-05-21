"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingCart, Trash2, ArrowRight, Percent, Check, HelpCircle, MapPin, Sparkles, Flame, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeItem, selectedAddress, selectedCoupon, applyCoupon, clearCart } = useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);

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

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess(false);

    if (!couponInput.trim()) return;

    const success = applyCoupon(couponInput);
    if (success) {
      setCouponSuccess(true);
      setTimeout(() => setCouponSuccess(false), 3000);
    } else {
      setCouponError("Invalid coupon code. Try 'SWIGGY50' or 'NUTRI30'.");
    }
  };

  const handleRemoveCoupon = () => {
    applyCoupon(null);
    setCouponInput("");
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-100">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
          Looks like you haven't added anything to your cart yet. Explore nutritious options around you!
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 bg-[#FC8019] hover:bg-[#E06D0F] active:scale-95 text-xs font-black px-5 py-2.5 rounded-xl text-white transition-all shadow-lg shadow-[#FC8019]/25"
        >
          Discover Healthy Options
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
      <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2 mb-6">
        <ShoppingCart className="w-5.5 h-5.5 text-[#FC8019]" />
        <span>Your Unified Cart</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns: Items Review & Delivery Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cart Items List */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-3">Review Items</h3>
            
            <div className="divide-y divide-slate-900">
              {cart.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 border-2 rounded flex items-center justify-center p-0.5 flex-shrink-0 ${item.veg ? "border-green-600" : "border-red-600"}`}>
                        <div className={`w-1 h-1 rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate max-w-[150px]">{item.restaurantName}</span>
                    </div>
                    <h4 className="text-xs md:text-sm font-bold text-slate-100 mt-1 truncate">{item.name}</h4>
                    
                    {item.macros && (
                      <div className="flex gap-2 text-[10px] font-bold text-slate-400 mt-1">
                        <span className="text-[#FC8019]">{item.macros.calories} kcal</span>
                        <span className="text-healthy-emerald">{item.macros.protein}g Protein</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Item Total Price */}
                    <span className="text-xs md:text-sm font-black text-white">₹{item.price * item.quantity}</span>

                    {/* Quantity selectors */}
                    <div className="flex items-center border border-slate-850 bg-slate-900 rounded-xl overflow-hidden text-xs shadow-inner">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1.5 text-slate-400 hover:text-white font-bold"
                      >
                        -
                      </button>
                      <span className="px-1 font-bold text-white text-[11px]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-slate-400 hover:text-[#FC8019] font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Trash remove button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address Summary Panel */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-3">Delivery Address</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-4.5 h-4.5 text-[#FC8019] mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-black text-slate-200 block">Current Location</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedAddress}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Columns: Cart Aggregates & Coupons */}
        <div className="space-y-6">
          
          {/* Coupon Entry Panel */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#FC8019]/5 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-3 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-[#FC8019]" />
              <span>Apply Coupon</span>
            </h3>

            {selectedCoupon ? (
              <div className="bg-emerald-950/15 border border-emerald-500/30 rounded-2xl p-4 flex justify-between items-center shadow-inner">
                <div>
                  <span className="text-xs font-black text-healthy-emerald uppercase flex items-center gap-1">
                    <Check className="w-4 h-4 stroke-[3px]" /> Coupon Applied
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Code: **{selectedCoupon.code}** saved you **{selectedCoupon.discountPercent}%**!</p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-rose-400 hover:text-rose-350 bg-rose-500/10 px-2.5 py-1.5 border border-rose-500/25 rounded-lg active:scale-95 transition-all"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setQuery(e.target.value)} // Keep in sync
                    onInput={(e: any) => setCouponInput(e.target.value)}
                    placeholder="e.g. SWIGGY50, NUTRI30"
                    className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-[#FC8019] rounded-xl px-4 py-2.5 text-xs focus:outline-none text-slate-200 placeholder-slate-500 transition-colors uppercase font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-[#FC8019] hover:bg-[#E06D0F] active:scale-95 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] font-semibold text-rose-400">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] font-semibold text-healthy-emerald">Coupon applied successfully!</p>}
                <div className="text-[10px] text-slate-500 pt-1 leading-normal font-medium">
                  💡 Hint: Use **NUTRI30** for 30% off, or **SWIGGY50** for a massive 50% discount!
                </div>
              </form>
            )}
          </div>

          {/* Pricing aggregates summary */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl relative overflow-hidden">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-3">Bill Details</h3>
            
            <div className="space-y-2 text-xs font-semibold text-slate-350">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span className="font-extrabold text-slate-200">₹{itemsTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span className="font-extrabold text-slate-200">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Restaurant Packaging Charges</span>
                <span className="font-extrabold text-slate-200">₹{packagingCharges}</span>
              </div>
              <div className="flex justify-between">
                <span>Govt Taxes & GST (5%)</span>
                <span className="font-extrabold text-slate-200">₹{gstCharges}</span>
              </div>
              {selectedCoupon && (
                <div className="flex justify-between text-healthy-emerald font-extrabold bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
                  <span>Coupon Discount ({selectedCoupon.discountPercent}%)</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-900 pt-4 flex justify-between items-center text-sm font-black text-slate-200">
              <span>Grand Total</span>
              <span className="text-lg text-white font-black">₹{grandTotal}</span>
            </div>

            {/* Nutri Statistics aggregates inside bill (WOW Factor) */}
            {totalCalories > 0 && (
              <div className="bg-[#121927] border border-slate-800 p-3 rounded-2xl space-y-1.5 shadow-inner">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Health Insights</span>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-[#FC8019]" /> Total Calories</span>
                  <span className="text-[#FC8019]">{totalCalories} kcal</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400 flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-400" /> Total Protein</span>
                  <span className="text-healthy-emerald">{totalProtein}g</span>
                </div>
              </div>
            )}

            {/* Checkout Action Button */}
            <button
              onClick={() => router.push("/checkout")}
              className="w-full bg-gradient-to-r from-[#FC8019] to-amber-500 hover:from-[#E06D0F] hover:to-[#FC8019] active:scale-[0.98] text-white text-xs font-black py-3.5 px-4 rounded-xl shadow-lg shadow-[#FC8019]/25 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 stroke-[3px]" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
