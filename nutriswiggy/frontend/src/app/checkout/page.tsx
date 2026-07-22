"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Check, ShieldCheck, MapPin, CreditCard, ChevronRight, Clock, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, selectedAddress, clearCart } = useCartStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setProcessingStatus("Securing connection with bank server...");
    
    setTimeout(() => {
      setProcessingStatus("Registering order with partner kitchen...");
      
      setTimeout(() => {
        setProcessingStatus("Assigning dietitian delivery pilot...");
        
        setTimeout(() => {
          setIsProcessing(false);
          setOrderSuccess(true);
          clearCart(); // Clear Zustand store
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const stepsList = [
    { id: 1, name: "Delivery" },
    { id: 2, name: "Payment" },
    { id: 3, name: "Confirmed" }
  ];

  // If no items in cart and didn't just place a successful order, redirect to home
  if (cart.length === 0 && !orderSuccess && !isProcessing) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-lg font-black text-[#282C3F]">No active checkout session</h2>
        <button
          onClick={() => router.push("/")}
          className="mt-6 bg-[#FC8019] hover:bg-[#E06D0F] transition-all text-white text-xs font-bold px-4 py-2.5 rounded-xl"
        >
          Return to Discovery
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 min-h-[70vh]">
      
      {/* Dynamic 3-stage progress bar */}
      <section className="flex justify-between items-center max-w-md mx-auto mb-10 relative">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-200 -translate-y-1/2 z-0" />
        
        {stepsList.map((s, idx) => {
          const isDone = orderSuccess ? true : s.id < step;
          const isActive = orderSuccess ? s.id === 3 : s.id === step;
          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-2">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black transition-all ${
                isDone
                  ? "bg-[#FC8019] border-[#FC8019] text-white"
                  : isActive
                  ? "bg-[#FC8019] border-[#FC8019] text-white"
                  : "bg-white border-slate-200 text-slate-400"
              }`}>
                {isDone ? <Check className="w-4 h-4 stroke-[3px]" /> : s.id}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                isActive ? "text-[#FC8019]" : "text-slate-400"
              }`}>{s.name}</span>
            </div>
          );
        })}
      </section>

      {/* Stage Content */}
      <AnimatePresence mode="wait">
        
        {/* Processing State */}
        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-xl py-16"
          >
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
              <div className="absolute inset-0 rounded-full border-4 border-[#FC8019] border-t-transparent animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#282C3F]">Processing Your Payment</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium animate-pulse">{processingStatus}</p>
            </div>
          </motion.div>
        )}

        {/* Order Confirmed / Success State */}
        {orderSuccess && !isProcessing && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-150 rounded-3xl p-6 md:p-10 text-center space-y-6 shadow-xl relative overflow-hidden"
          >
            {/* Ambient glows */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FC8019]/5 rounded-full blur-2xl" />
            
            {/* Animated Success checkmark */}
            <div className="w-16 h-16 rounded-full bg-[#FC8019]/10 border border-[#FC8019]/30 text-[#FC8019] flex items-center justify-center mx-auto shadow-sm shadow-[#FC8019]/10">
              <ShieldCheck className="w-10 h-10 stroke-[2px]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg md:text-2xl font-black text-[#282C3F]">Order Placed Successfully!</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your macro-balanced nutritious feast has been authorized. Partner kitchen is preparing your dishes.
              </p>
            </div>

            {/* Delivery Stats Card */}
            <div className="max-w-sm mx-auto bg-slate-50 border border-slate-100 rounded-2xl p-4 grid grid-cols-2 divide-x divide-slate-200 text-left">
              <div className="px-2 flex items-center gap-2">
                <Clock className="w-8 h-8 text-[#FC8019] flex-shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Arrives In</span>
                  <span className="text-xs font-black text-[#282C3F]">22-26 Mins</span>
                </div>
              </div>
              <div className="px-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FC8019]/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    role="img"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-[#FC8019]"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.034 24c-.376-.411-2.075-2.584-3.95-5.513-.547-.916-.901-1.63-.833-1.814.178-.48 3.355-.743 4.333-.308.298.132.29.307.29.409 0 .44-.022 1.619-.022 1.619a.441.441 0 1 0 .883-.002l-.005-2.939c0-.255-.278-.319-.331-.329-.511-.002-1.548-.006-2.661-.006-2.457 0-3.006.101-3.423-.172-.904-.591-2.383-4.577-2.417-6.819C3.849 4.964 5.723 2.225 8.362.868A8.13 8.13 0 0 1 12.026 0c4.177 0 7.617 3.153 8.075 7.209l.001.011c.084.981-5.321 1.189-6.39.904-.164-.044-.206-.212-.206-.284L13.5 4.996a.442.442 0 0 0-.884.002l.009 3.866a.33.33 0 0 0 .268.32l3.354-.001c1.79 0 2.542.207 3.042.588.333.254.461.739.349 1.37C18.633 16.755 12.273 23.71 12.034 24z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Macro Checked</span>
                  <span className="text-xs font-black text-[#282C3F]">High Protein</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3 max-w-sm mx-auto">
              <button
                onClick={() => router.push("/profile")}
                className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-650 transition-colors"
              >
                Track Order
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-3 bg-[#FC8019] hover:bg-[#E06D0F] active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#FC8019]/10"
              >
                Discover More
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 1: Address & Details Review */}
        {step === 1 && !isProcessing && !orderSuccess && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 space-y-4 shadow-md">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Confirm Delivery Destination</h3>
              
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-[#FC8019] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-black text-[#282C3F] block">Deliver To</span>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedAddress}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-[#FC8019] hover:bg-[#E06D0F] active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-[#FC8019]/10 flex items-center justify-center gap-1"
            >
              <span>Proceed to Payment</span>
              <ChevronRight className="w-4 h-4 stroke-[3px]" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Payment Selection */}
        {step === 2 && !isProcessing && !orderSuccess && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border border-slate-150 rounded-3xl p-5 md:p-6 space-y-4 shadow-md">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Choose Payment Method</h3>
              
              <div className="space-y-2">
                {[
                  { id: "upi", name: "UPI Instant Transfer (Google Pay, PhonePe)", detail: "Instant preparation authorization" },
                  { id: "card", name: "Credit or Debit Cards", detail: "Secured by Razorpay" },
                  { id: "cod", name: "Cash on Delivery", detail: "Additional handling fee applies" }
                ].map((pay) => {
                  const isSelected = paymentMethod === pay.id;
                  return (
                    <button
                      key={pay.id}
                      onClick={() => setPaymentMethod(pay.id)}
                      className={`w-full flex items-start gap-3.5 p-4 border rounded-2xl text-left text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-[#FC8019]/5 border-[#FC8019] text-[#FC8019]"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <CreditCard className={`w-4.5 h-4.5 mt-0.5 ${isSelected ? "text-[#FC8019]" : "text-slate-400"}`} />
                      <div>
                        <span className={`block font-bold ${isSelected ? "text-[#FC8019]" : "text-[#282C3F]"}`}>{pay.name}</span>
                        <span className="text-[10px] text-slate-400 mt-1 font-medium block">{pay.detail}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-650 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handlePlaceOrder}
                className="flex-1 py-3 bg-[#FC8019] hover:bg-[#E06D0F] active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-[#FC8019]/10"
              >
                Place Order (₹{cartTotal + 45})
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
