"use client";

import { useState } from "react";
import { Zap } from "lucide-react";

interface Props {
  isPro: boolean;
}

export function SubscriptionButton({ isPro }: Props) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("Payment error", error);
    } finally {
      setLoading(false);
    }
  };

  if (isPro) return null; // already handled by parent

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
        background: "linear-gradient(135deg, #6366f1, #a855f7)",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        fontSize: "13.5px",
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "opacity .2s, transform .15s",
        fontFamily: "inherit",
        boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
      }}
      onMouseEnter={e => !loading && (e.currentTarget.style.opacity = "0.88")}
      onMouseLeave={e => !loading && (e.currentTarget.style.opacity = "1")}
    >
      <Zap size={15} />
      {loading ? "Redirecting..." : "Upgrade to Pro"}
    </button>
  );
}
