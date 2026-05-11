"use client";

import { useState } from "react";
import { ExternalLink, CreditCard } from "lucide-react";

type Props =
  | { mode: "portal" }
  | { mode: "checkout"; priceId: string; label: string; variant?: "solid" | "outline"; disabled?: boolean };

export default function PlanActions(props: Props) {
  const [loading, setLoading] = useState(false);

  const handlePortal = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  };

  const handleCheckout = async (priceId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error ?? "Error al conectar con Stripe. Comprueba la configuración.");
        setLoading(false);
      }
    } catch {
      alert("Error inesperado. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  if (props.mode === "portal") {
    return (
      <button
        onClick={handlePortal}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] text-sm font-medium text-[#475569] rounded-xl hover:bg-[#F8FAFC] transition-colors disabled:opacity-60"
      >
        <ExternalLink className="w-4 h-4" />
        {loading ? "Abriendo…" : "Gestionar suscripción"}
      </button>
    );
  }

  const variant = props.variant ?? "solid";

  return (
    <button
      onClick={() => handleCheckout(props.priceId)}
      disabled={loading || props.disabled}
      className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        variant === "solid"
          ? "bg-[#1A56DB] text-white hover:bg-[#1A3C6E]"
          : "border border-[#E2E8F0] text-[#475569] hover:border-[#1A56DB] hover:text-[#1A56DB]"
      }`}
    >
      <CreditCard className="w-4 h-4" />
      {loading ? "Redirigiendo…" : props.label}
    </button>
  );
}
