"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/");
    });
  }, [router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return setMessage("Supabase browser credentials are missing.");

    const result = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) return setMessage(result.error.message);
    if (isSignUp && !result.data.session) {
      return setMessage("Check your email to confirm your account, then sign in.");
    }
    router.replace("/");
  };

  const signInWithGoogle = async () => {
    if (!supabase) return setMessage("Supabase browser credentials are missing.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth` },
    });
    if (error) setMessage(error.message);
  };

  return (
    <main className="min-h-screen grid place-items-center bg-[#0b0f19] p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white">Nutri<span className="text-swiggy-orange">Swiggy</span></h1>
          <p className="mt-1 text-xs text-slate-400">{isSignUp ? "Create your account" : "Sign in to save and track orders"}</p>
        </div>

        <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" />
        <input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" />

        <button className="w-full rounded-xl bg-swiggy-orange py-2.5 text-sm font-bold text-white">
          {isSignUp ? "Create account" : "Sign in"}
        </button>
        <button type="button" onClick={signInWithGoogle} className="w-full rounded-xl border border-slate-700 py-2.5 text-sm font-bold text-slate-100">
          Continue with Google
        </button>
        <button type="button" onClick={() => { setIsSignUp(!isSignUp); setMessage(""); }} className="w-full text-xs text-swiggy-orange">
          {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>

        {message && <p role="alert" className="text-xs text-amber-300">{message}</p>}
      </form>
    </main>
  );
}
