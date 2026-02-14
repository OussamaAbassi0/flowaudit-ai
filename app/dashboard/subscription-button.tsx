"use client";

import { useState } from "react";
import { Zap, Settings } from "lucide-react";

interface Props {
  isPro: boolean;
}

export function SubscriptionButton({ isPro }: Props) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      // Pro users → Customer Portal (manage/cancel)
      // Free users → Checkout (upgrade)
      const endpoint = isPro ? "/api/stripe/portal" : "/api/stripe/checkout";
      const response = await fetch(endpoint, { method: "POST" });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("Stripe error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "10px 20px",
        background: isPro
          ? "rgba(255,255,255,0.06)"
          : "linear-gradient(135deg, #6366f1, #a855f7)",
        color: isPro ? "#a5a8b5" : "#fff",
        border: isPro ? "1px solid rgba(255,255,255,0.1)" : "none",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "all .2s",
        fontFamily: "inherit",
        boxShadow: isPro ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => {
        if (loading) return;
        e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={e => {
        if (loading) return;
        e.currentTarget.style.opacity = "1";
      }}
    >
      {isPro ? <Settings size={14} /> : <Zap size={14} />}
      {loading
        ? "Redirecting..."
        : isPro
        ? "Manage Subscription"
        : "Upgrade to Pro"}
    </button>
  );
}
