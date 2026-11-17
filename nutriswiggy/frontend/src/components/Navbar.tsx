"use client";

import React, { useState, useEffect } from "react";
import { Apple, ShieldCheck, User, Sparkles, ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { supabase } from "@/utils/supabaseClient";
import { NativeBridge } from "@/services/nativeBridge";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const router = useRouter();
  const { cart, swiggyUser, setIsProfileDrawerOpen, activeMobileTab, setActiveMobileTab } = useCartStore();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });
  }, []);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 safe-pt">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Logo (Tap switches to discovery on mobile or home on web) */}
        <div
          onClick={() => {
            NativeBridge.triggerHaptic("light");
            setActiveMobileTab("discovery");
            router.push("/");
          }}
          className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FC8019] to-amber-500 flex items-center justify-center shadow-md shadow-[#FC8019]/25 text-white">
            <Apple className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-white tracking-tight leading-none">
                Nutri<span className="text-[#FC8019]">Swiggy</span>
              </span>
              <span className="text-[9px] font-black text-white bg-[#FC8019] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                Swiggy
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">AI Dietitian & Healthy Food</p>
          </div>
        </div>

        {/* Right Area: Profile Button & Desktop Cart */}
        <div className="flex items-center gap-2.5">
          {/* Swiggy Connected Badge (Tablet/Desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Swiggy MCP Live</span>
          </div>

          {/* Desktop Cart Button */}
          <button
            onClick={() => {
              NativeBridge.triggerHaptic("light");
              setActiveMobileTab("cart");
              router.push("/cart");
            }}
            className="hidden lg:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all relative"
          >
            <ShoppingCart className="w-4 h-4 text-[#FC8019]" />
            <span>Cart</span>
            {cartItemsCount > 0 && (
              <span className="bg-[#FC8019] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow">
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* Profile Button at Top of Page (Always visible on mobile & desktop) */}
          <button
            onClick={() => {
              NativeBridge.triggerHaptic("medium");
              setIsProfileDrawerOpen(true);
            }}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FC8019] to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-[#FC8019]/25 hover:brightness-110 active:scale-90 transition-all border border-[#FC8019]/40 relative focus:outline-none"
            aria-label="Open User Profile & Macro Tracker"
            title="Profile & Nutrition Tracker"
          >
            {userEmail ? userEmail[0].toUpperCase() : <User className="w-4 h-4 text-white" />}
            {/* Green Connected Indicator Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0B0F19] rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
