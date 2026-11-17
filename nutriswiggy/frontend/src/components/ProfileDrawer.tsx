"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Shield, ShieldCheck, Flame, Trophy, Target, History, Pencil, Check, X, ArrowRight, ExternalLink } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { NativeBridge } from "@/services/nativeBridge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nutriswiggy-backend.onrender.com";

export const ProfileDrawer: React.FC = () => {
  const router = useRouter();
  const {
    isProfileDrawerOpen,
    setIsProfileDrawerOpen,
    nutritionTargets,
    setNutritionTargets,
    consumedMacros,
    swiggyUser,
    setSwiggyUser,
  } = useCartStore();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<"tracker" | "history">("tracker");
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [tempTargets, setTempTargets] = useState(nutritionTargets);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? "swiggy.builder@nutrio.app");
    });

    const savedOrders = localStorage.getItem("nutriswiggy_orders");
    if (savedOrders) {
      try {
        setOrderHistory(JSON.parse(savedOrders));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveTargets = () => {
    NativeBridge.triggerHaptic("success");
    setNutritionTargets({
      maxCalories: tempTargets.maxCalories,
      targetProtein: tempTargets.targetProtein,
      targetFiber: tempTargets.targetFiber,
    });
    setIsEditingTargets(false);
  };

  const handleConnectSwiggy = async () => {
    NativeBridge.triggerHaptic("medium");
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

  const handleSignOut = async () => {
    NativeBridge.triggerHaptic("light");
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUserEmail(null);
      setIsProfileDrawerOpen(false);
      router.push("/auth");
    } catch {
      setIsProfileDrawerOpen(false);
    }
  };

  if (!isProfileDrawerOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsProfileDrawerOpen(false)}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="relative w-full max-w-md bg-[#0F172A] border-l border-slate-800 h-full shadow-2xl flex flex-col z-10 safe-pt safe-pb"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0F172A]/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-swiggy-orange to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-swiggy-orange/20 border border-swiggy-orange/30">
                {userEmail ? userEmail[0].toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">
                  {userEmail ? userEmail.split("@")[0] : "NutriSwiggy User"}
                </h3>
                <p className="text-[11px] text-slate-400 truncate">{userEmail || "Signed in"}</p>
              </div>
            </div>
            <button
              onClick={() => {
                NativeBridge.triggerHaptic("light");
                setIsProfileDrawerOpen(false);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-800 px-6 pt-2">
            <button
              onClick={() => {
                NativeBridge.triggerHaptic("light");
                setProfileTab("tracker");
              }}
              className={`pb-3 text-xs font-bold transition-all relative ${
                profileTab === "tracker" ? "text-swiggy-orange" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Macro Tracker
              {profileTab === "tracker" && (
                <motion.div layoutId="profileTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-swiggy-orange rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                NativeBridge.triggerHaptic("light");
                setProfileTab("history");
              }}
              className={`pb-3 ml-6 text-xs font-bold transition-all relative ${
                profileTab === "history" ? "text-swiggy-orange" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Order History ({orderHistory.length})
              {profileTab === "history" && (
                <motion.div layoutId="profileTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-swiggy-orange rounded-full" />
              )}
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 touch-scroll">
            {/* Swiggy Integration Status Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-swiggy-orange/15 border border-swiggy-orange/30 flex items-center justify-center text-swiggy-orange">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Swiggy MCP Connection</h4>
                    <p className="text-[10px] text-slate-400">OAuth 2.1 Whitelisted</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold">
                  Active
                </span>
              </div>

              <div className="text-[11px] text-slate-300">
                Connected account: <strong>{swiggyUser.name}</strong> ({swiggyUser.phone})
              </div>

              <button
                onClick={handleConnectSwiggy}
                className="w-full bg-slate-700/70 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span>Re-authenticate Swiggy</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {profileTab === "tracker" ? (
              <div className="space-y-4">
                {/* Daily Progress Bars */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span>Today's Nutrition Goals</span>
                    </span>
                    <button
                      onClick={() => setIsEditingTargets(!isEditingTargets)}
                      className="text-[11px] text-swiggy-orange hover:underline font-bold flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>{isEditingTargets ? "Cancel" : "Edit Goals"}</span>
                    </button>
                  </div>

                  {isEditingTargets ? (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Target Calories (kcal)</label>
                        <input
                          type="number"
                          value={tempTargets.maxCalories}
                          onChange={(e) => setTempTargets({ ...tempTargets, maxCalories: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Target Protein (g)</label>
                        <input
                          type="number"
                          value={tempTargets.targetProtein}
                          onChange={(e) => setTempTargets({ ...tempTargets, targetProtein: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Target Fiber (g)</label>
                        <input
                          type="number"
                          value={tempTargets.targetFiber}
                          onChange={(e) => setTempTargets({ ...tempTargets, targetFiber: Number(e.target.value) })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <button
                        onClick={handleSaveTargets}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Targets</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      {/* Calories Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-swiggy-orange" /> Calories
                          </span>
                          <span className="text-white">
                            {consumedMacros.calories} / {nutritionTargets.maxCalories} kcal
                          </span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-swiggy-orange to-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (consumedMacros.calories / nutritionTargets.maxCalories) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Protein Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Protein
                          </span>
                          <span className="text-white">
                            {consumedMacros.protein} / {nutritionTargets.targetProtein}g
                          </span>
                        </div>
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (consumedMacros.protein / nutritionTargets.targetProtein) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Order History Tab */
              <div className="space-y-3">
                {orderHistory.length === 0 ? (
                  <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
                    No previous healthy orders yet.
                  </div>
                ) : (
                  orderHistory.map((order, idx) => (
                    <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-xs font-bold text-white">{order.restaurant || "Swiggy Kitchen"}</h5>
                          <span className="text-[10px] text-slate-400">{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                          {order.status || "Completed"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {order.items?.length || 1} items • {order.totalCalories || 450} kcal • {order.totalProtein || 35}g Protein
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Drawer Footer / Sign Out */}
          <div className="p-6 border-t border-slate-800 bg-[#0F172A]/90">
            <button
              onClick={handleSignOut}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 border border-rose-500/30 text-rose-400 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
