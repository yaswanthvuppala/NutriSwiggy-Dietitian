"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingCart, Search, Percent, User, MapPin, ChevronDown, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const pathname = usePathname();
  const { cart, selectedAddress, setSelectedAddress } = useCartStore();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const popularLocations = [
    "HSR Layout, Sector 3, Bangalore",
    "Koramangala 4th Block, Bangalore",
    "Indiranagar, 100 Feet Road, Bangalore",
    "Jayanagar 4th T Block, Bangalore",
    "Whitefield, ITPL Main Road, Bangalore"
  ];

  const handleSelectAddress = (addr: string) => {
    setSelectedAddress(addr);
    setShowLocationModal(false);
  };

  const navLinks = [
    { name: "Search", path: "/search", icon: Search },
    { name: "Offers", path: "/offers", icon: Percent },
    { name: "AI Dietitian 🥦", path: "/dietitian", icon: () => null, highlight: true },
    { name: "Cart", path: "/cart", icon: ShoppingCart, count: cartItemsCount },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center gap-4">
          
          {/* Logo and Delivery Location */}
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr from-[#FC8019] to-amber-500 flex items-center justify-center shadow-lg shadow-[#FC8019]/20 transition-transform duration-300 group-hover:scale-105">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5.5 h-5.5 md:w-6.5 md:h-6.5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.034 24c-.376-.411-2.075-2.584-3.95-5.513-.547-.916-.901-1.63-.833-1.814.178-.48 3.355-.743 4.333-.308.298.132.29.307.29.409 0 .44-.022 1.619-.022 1.619a.441.441 0 1 0 .883-.002l-.005-2.939c0-.255-.278-.319-.331-.329-.511-.002-1.548-.006-2.661-.006-2.457 0-3.006.101-3.423-.172-.904-.591-2.383-4.577-2.417-6.819C3.849 4.964 5.723 2.225 8.362.868A8.13 8.13 0 0 1 12.026 0c4.177 0 7.617 3.153 8.075 7.209l.001.011c.084.981-5.321 1.189-6.39.904-.164-.044-.206-.212-.206-.284L13.5 4.996a.442.442 0 0 0-.884.002l.009 3.866a.33.33 0 0 0 .268.32l3.354-.001c1.79 0 2.542.207 3.042.588.333.254.461.739.349 1.37C18.633 16.755 12.273 23.71 12.034 24z" />
                </svg>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#282C3F] flex items-center">
                Nutri<span className="text-[#FC8019] group-hover:text-amber-600 transition-colors duration-200">Swiggy</span>
              </h1>
            </Link>

            {/* Location Selector */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1.5 py-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl hover:border-[#FC8019]/40 transition-all duration-200 text-left max-w-[160px] sm:max-w-[220px]"
            >
              <MapPin className="w-3.5 h-3.5 text-[#FC8019] flex-shrink-0" />
              <span className="text-xs font-bold text-[#282C3F] truncate pr-1">
                {selectedAddress.split(",")[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-xl transition-all duration-200 hover:scale-102 ${
                    link.highlight
                      ? "bg-[#FC8019]/10 text-[#FC8019] border border-[#FC8019]/20 hover:bg-[#FC8019]/15"
                      : isActive
                      ? "text-[#FC8019]"
                      : "text-[#282C3F] hover:text-[#FC8019]"
                  }`}
                >
                  {link.highlight ? (
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 text-[#FC8019]"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12.034 24c-.376-.411-2.075-2.584-3.95-5.513-.547-.916-.901-1.63-.833-1.814.178-.48 3.355-.743 4.333-.308.298.132.29.307.29.409 0 .44-.022 1.619-.022 1.619a.441.441 0 1 0 .883-.002l-.005-2.939c0-.255-.278-.319-.331-.329-.511-.002-1.548-.006-2.661-.006-2.457 0-3.006.101-3.423-.172-.904-.591-2.383-4.577-2.417-6.819C3.849 4.964 5.723 2.225 8.362.868A8.13 8.13 0 0 1 12.026 0c4.177 0 7.617 3.153 8.075 7.209l.001.011c.084.981-5.321 1.189-6.39.904-.164-.044-.206-.212-.206-.284L13.5 4.996a.442.442 0 0 0-.884.002l.009 3.866a.33.33 0 0 0 .268.32l3.354-.001c1.79 0 2.542.207 3.042.588.333.254.461.739.349 1.37C18.633 16.755 12.273 23.71 12.034 24z" />
                    </svg>
                  ) : (
                    <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#FC8019]" : ""}`} />
                  )}
                  <span>{link.name}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <motion.span
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 bg-[#FC8019] text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow"
                    >
                      {link.count}
                    </motion.span>
                  )}
                  {isActive && !link.highlight && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#FC8019] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Cart / Drawer Button */}
          <div className="flex lg:hidden items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-650 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FC8019] text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>

        </div>
      </header>

      {/* Delivery Location Drawer Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLocationModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden z-10"
            >
              {/* Background gradient lights */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FC8019]/5 rounded-full blur-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-healthy-emerald/5 rounded-full blur-xl pointer-events-none" />

              <h3 className="text-lg font-bold text-[#282C3F] mb-1">Select Delivery Address</h3>
              <p className="text-xs text-slate-500 mb-4">Choose your locality to search nearby nutritious partner restaurants.</p>
              
              <div className="space-y-2">
                {popularLocations.map((loc) => {
                  const isCurrent = loc === selectedAddress;
                  return (
                    <button
                      key={loc}
                      onClick={() => handleSelectAddress(loc)}
                      className={`w-full flex items-start gap-3 p-3 rounded-2xl border text-left text-sm font-semibold transition-all duration-200 ${
                        isCurrent
                          ? "bg-[#FC8019]/10 border-[#FC8019] text-[#FC8019]"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-350"
                      }`}
                    >
                      <MapPin className={`w-4 h-4 mt-0.5 ${isCurrent ? "text-[#FC8019]" : "text-slate-500"}`} />
                      <span>{loc}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-250 text-xs font-bold text-slate-550 hover:bg-slate-50 hover:text-[#282C3F] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
