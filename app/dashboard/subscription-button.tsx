"use client";

import { useState } from "react";
import { Zap } from "lucide-react";

export function SubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      // كنعيطو للـ API لي صاوبنا قبيلة باش يجيب لينا الرابط ديال الدفع
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      const data = await response.json();
      
      // كنوجهو الكليان لصفحة Stripe
      window.location.href = data.url;
    } catch (error) {
      console.error("Payment error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      <Zap size={18} />
      {loading ? "Loading..." : "Upgrade to Pro"}
    </button>
  );
}