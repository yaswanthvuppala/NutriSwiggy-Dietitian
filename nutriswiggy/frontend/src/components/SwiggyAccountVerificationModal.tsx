"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, ExternalLink, RefreshCw, X, UserCheck, ArrowRight } from "lucide-react";
import { NativeBridge } from "@/services/nativeBridge";

interface SwiggyAccountVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  swiggyUser?: {
    name?: string;
    phone?: string;
    email?: string;
    isAuthenticated: boolean;
  };
  onProceedCheckout: () => void;
  onSwitchAccount: () => void;
  isSyncing?: boolean;
  syncError?: string | null;
}

export const SwiggyAccountVerificationModal: React.FC<SwiggyAccountVerificationModalProps> = ({
  isOpen,
  onClose,
  swiggyUser = { name: "Swiggy User", phone: "+91 ••••• •••••", isAuthenticated: true },
  onProceedCheckout,
  onSwitchAccount,
  isSyncing = false,
  syncError = null,
}) => {
  const [hasAcknowledged, setHasAcknowledged] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Container (Touch-optimized bottom sheet on mobile, centered card on desktop) */}
        <motion.div
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="relative w-full max-w-lg bg-[#0F172A] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 safe-pb"
        >
          {/* Mobile Swipe / Drag Handle Indicator */}
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FC8019]/15 border border-[#FC8019]/30 flex items-center justify-center text-[#FC8019]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Swiggy Checkout Sync</h3>
                <p className="text-[11px] text-slate-400">Verifying account alignment</p>
              </div>
            </div>
            <button
              onClick={() => {
                NativeBridge.triggerHaptic("light");
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Active Connected Swiggy Account Box */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Connected Swiggy Account</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-sm font-bold text-white truncate mt-0.5">
                  {swiggyUser.name || "Swiggy Registered User"}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {swiggyUser.phone || swiggyUser.email || "OAuth 2.1 Authenticated"}
                </div>
              </div>
            </div>

            {/* Error banner if mismatch or sync failure */}
            {syncError ? (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-200 leading-relaxed">
                  <strong className="block font-bold text-rose-300 mb-0.5">Swiggy Session Mismatch</strong>
                  {syncError}
                </div>
              </div>
            ) : (
              /* Verification & Account Alignment Warning Alert */
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed space-y-1">
                  <span className="block font-bold text-amber-300">
                    Important: Match Your Swiggy Account
                  </span>
                  <p>
                    Your healthy meals are synced directly to <strong>{swiggyUser.name || "this account"}</strong>.
                  </p>
                  <p className="text-[11px] text-amber-200/70">
                    If your official Swiggy app is logged into a <em>different phone number or account</em>, your cart will appear empty on Swiggy. Please ensure you are logged into the same account!
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  NativeBridge.triggerHaptic("heavy");
                  onProceedCheckout();
                }}
                disabled={isSyncing}
                className="w-full bg-[#FC8019] hover:bg-[#E06D0F] active:scale-[0.98] text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-[#FC8019]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm tracking-wide"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Syncing Cart with Swiggy...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Swiggy Checkout</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  NativeBridge.triggerHaptic("light");
                  onSwitchAccount();
                }}
                className="w-full bg-slate-800/70 hover:bg-slate-800 active:scale-[0.98] border border-slate-700 text-slate-300 hover:text-white font-semibold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Switch / Re-login Swiggy Account</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
