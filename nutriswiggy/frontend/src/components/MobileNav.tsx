"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore, MobileTab } from "@/store/useCartStore";
import { ShoppingCart, Compass, Sparkles, Bot } from "lucide-react";
import { NativeBridge } from "@/services/nativeBridge";

export const MobileNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, activeMobileTab, setActiveMobileTab } = useCartStore();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const tabs: { id: MobileTab; label: string; icon: any; isHighlight?: boolean; count?: number }[] = [
    {
      id: "discovery",
      label: "Discovery",
      icon: Compass,
    },
    {
      id: "agent",
      label: "Agent",
      icon: Bot,
      isHighlight: true,
    },
    {
      id: "cart",
      label: "Cart",
      icon: ShoppingCart,
      count: cartItemsCount,
    },
  ];

  const handleTabClick = (tabId: MobileTab) => {
    NativeBridge.triggerHaptic("medium");
    setActiveMobileTab(tabId);

    // If on a sub-route (e.g. /restaurant/xxx), navigate back to Home to switch cleanly
    if (pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-800/90 px-4 py-2 flex justify-around items-center shadow-2xl safe-pb"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeMobileTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className="flex-1 flex flex-col items-center justify-center p-1.5 min-h-[48px] relative active:scale-95 transition-transform"
          >
            <div
              className={`p-1.5 rounded-2xl transition-all duration-200 flex items-center justify-center ${
                tab.isHighlight && isActive
                  ? "bg-gradient-to-tr from-[#FC8019] to-amber-500 text-white shadow-lg shadow-[#FC8019]/30"
                  : tab.isHighlight
                  ? "bg-[#FC8019]/15 text-[#FC8019] border border-[#FC8019]/30"
                  : isActive
                  ? "text-[#FC8019] bg-[#FC8019]/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.isHighlight ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>

            <span
              className={`text-[11px] font-bold mt-1 tracking-tight transition-colors ${
                isActive ? "text-[#FC8019]" : "text-slate-400"
              }`}
            >
              {tab.label}
            </span>

            {/* Cart Count Badge */}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="absolute top-0.5 right-[calc(50%-18px)] bg-[#FC8019] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
