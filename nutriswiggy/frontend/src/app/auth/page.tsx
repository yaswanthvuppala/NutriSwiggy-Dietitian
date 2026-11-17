"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { NativeBridge } from "@/services/nativeBridge";
import { Apple, ArrowLeft, ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/");
    });
  }, [router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return setMessage("Supabase credentials not configured.");
    setIsLoading(true);
    setMessage("");

    try {
      const result = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setMessage(result.error.message);
        NativeBridge.triggerHaptic("error");
      } else {
        NativeBridge.triggerHaptic("success");
        if (isSignUp && !result.data.session) {
          setMessage("Check your email to confirm your account, then sign in.");
        } else {
          router.replace("/");
        }
      }
    } catch (e: any) {
      setMessage(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) return setMessage("Supabase credentials not configured.");
    NativeBridge.triggerHaptic("medium");
    setIsLoading(true);

    try {
      // Determine the redirect target URL (uses window origin or live production domain)
      const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const isLocalhost = currentOrigin.includes("localhost") || currentOrigin.startsWith("capacitor://");
      
      // In native Android APK or local development, specify appropriate redirect URL
      const redirectUrl = isLocalhost
        ? `${currentOrigin}/auth`
        : `${currentOrigin}/auth`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setMessage(error.message);
        NativeBridge.triggerHaptic("error");
      }
    } catch (e: any) {
      setMessage(e.message || "Failed to initiate Google sign-in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center bg-[#0B0F19] p-4 safe-pb">
      <div className="w-full max-w-sm space-y-5 rounded-3xl border border-slate-800 bg-[#0F172A] p-6 sm:p-8 shadow-2xl">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FC8019] to-amber-500 flex items-center justify-center shadow-lg shadow-[#FC8019]/25 text-white mx-auto mb-3">
            <Apple className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Nutri<span className="text-[#FC8019]">Swiggy</span>
          </h1>
          <p className="text-xs text-slate-400">
            {isSignUp ? "Create your health profile" : "Sign in to track macros & sync Swiggy cart"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:border-[#FC8019] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Password</label>
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-3 text-sm text-white placeholder-slate-500 focus:border-[#FC8019] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#FC8019] hover:bg-[#E06D0F] active:scale-[0.98] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FC8019]/25 transition-all disabled:opacity-50 mt-1"
          >
            {isLoading ? "Signing in..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0F172A] px-2 text-[10px] text-slate-500 uppercase font-bold">or</span>
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={isLoading}
          className="w-full rounded-xl border border-slate-700 hover:bg-slate-800/80 active:scale-[0.98] py-3 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage("");
          }}
          className="w-full text-center text-xs text-[#FC8019] hover:underline font-semibold"
        >
          {isSignUp ? "Already have an account? Sign in" : "New to NutriSwiggy? Create an account"}
        </button>

        {message && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 text-center">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
