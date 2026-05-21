"use client";

import React from "react";
import { useCartStore } from "@/store/useCartStore";
import { User, ShieldCheck, Clock, MapPin, Flame, Trophy, Award, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { selectedAddress } = useCartStore();

  const userMock = {
    name: "Aarav Sharma",
    email: "aarav.sharma@geminibuilders.club",
    phone: "+91 98765 43210",
    rank: "Elite Health Challenger",
    streak: "14 Days Diet Streak 🔥"
  };

  const pastOrders = [
    {
      id: "ORD-9281A",
      restaurant: "The Green Salad Hub",
      date: "May 18, 2026",
      price: 528,
      items: "2x Paneer Tikka Salad Bowl, 1x Fruity Green Cleanser",
      healthScored: true,
      healthScore: 89,
    },
    {
      id: "ORD-8719B",
      restaurant: "The Protein Club",
      date: "May 14, 2026",
      price: 344,
      items: "1x Grilled Herb Chicken Breast",
      healthScored: true,
      healthScore: 96,
    },
    {
      id: "ORD-7201C",
      restaurant: "Royal Biryani Darbar",
      date: "May 09, 2026",
      price: 314,
      items: "1x Hyderabadi Chicken Dum Biryani",
      healthScored: false,
      healthScore: 62,
    }
  ];

  // Visual percentages for nutrition tracker using elegant Swiggy Orange and warm amber tokens
  const nutritionMetrics = [
    { name: "Daily Calorie Average", value: "1,840 kcal", percent: 84, color: "bg-[#FC8019]", max: "2200 max" },
    { name: "Daily Protein Average", value: "78g Intake", percent: 92, color: "bg-amber-500", max: "85g target" },
    { name: "Daily Fiber Average", value: "28g Intake", percent: 70, color: "bg-[#FC8019]/80", max: "40g target" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6 min-h-[70vh]">
      
      {/* SECTION 1: User metadata banner */}
      <section className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FC8019]/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* User avatar mockup */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-[#FC8019] to-amber-500 flex items-center justify-center text-white text-xl md:text-2xl font-black shadow-lg shadow-[#FC8019]/15">
          AS
        </div>

        <div className="text-center sm:text-left space-y-1 z-10">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-lg md:text-xl font-black text-[#282C3F] tracking-tight">{userMock.name}</h2>
            <span className="bg-[#FC8019]/10 border border-[#FC8019]/25 text-[#FC8019] text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              {userMock.rank}
            </span>
          </div>
          <p className="text-xs text-slate-500">{userMock.email} | {userMock.phone}</p>
          <div className="flex items-center justify-center sm:justify-start gap-1 text-[10px] font-bold text-[#FC8019] pt-1">
            <Award className="w-4 h-4 text-[#FC8019] fill-current animate-bounce-slow" />
            <span>{userMock.streak}</span>
          </div>
        </div>
      </section>

      {/* Grid: Nutrition Analytics vs Address details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Nutrition analytics tracker (2 cols on md) */}
        <div className="md:col-span-2 bg-white border border-slate-150 rounded-3xl p-5 md:p-6 space-y-4 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FC8019]/5 rounded-full blur-xl pointer-events-none" />
          
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-[#FC8019] animate-pulse" />
            <span className="text-slate-500">Smart Nutrition Dashboard</span>
          </h3>

          <div className="space-y-4 pt-1">
            {nutritionMetrics.map((met) => (
              <div key={met.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>{met.name}</span>
                  <span className="text-[#282C3F] font-extrabold">{met.value} <span className="text-[10px] text-slate-400 font-medium">({met.max})</span></span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-200">
                  <div className={`h-full ${met.color} rounded-full`} style={{ width: `${met.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery address details (1 col) */}
        <div className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 space-y-4 shadow-md">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Addresses</h3>
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#FC8019] mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[11px] font-black text-[#282C3F] block uppercase">Default Destination</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{selectedAddress}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Past Orders History List */}
      <section className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 space-y-4 shadow-md">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Order History</h3>
        
        <div className="divide-y divide-slate-100">
          {pastOrders.map((ord) => (
            <div key={ord.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs md:text-sm font-bold text-[#282C3F]">{ord.restaurant}</h4>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{ord.id}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{ord.items}</p>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {ord.date}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {ord.healthScored && (
                  <div className="flex items-center gap-1 border border-[#FC8019]/25 bg-[#FC8019]/10 px-2 py-0.5 rounded-lg text-[10px] font-bold text-[#FC8019] shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Score: {ord.healthScore}</span>
                  </div>
                )}
                <span className="text-xs md:text-sm font-black text-[#282C3F]">₹{ord.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
