"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return <p className="p-6 text-center text-sm text-slate-400">Returning to the secure Swiggy checkout flow...</p>;
}
