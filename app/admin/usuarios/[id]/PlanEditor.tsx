"use client";

import { useState } from "react";
import { CheckCheck, Loader2 } from "lucide-react";

type Plan = { id: string; name: string };

type Props = {
  userId: string;
  currentPlan: string;
  currentTier: string;
  currentStatus: string;
  currentGraceDays: number;
  plans: Plan[];
};

const STATUSES = [
  { value: "active",   label: "Activa" },
  { value: "past_due", label: "Pago fallido" },
  { value: "canceled", label: "Cancelada" },
  { value: "inactive", label: "Sin plan" },
];

export default function PlanEditor({ userId, currentPlan, currentTier, currentStatus, currentGraceDays, plans }: Props) {
  const [plan, setPlan] = useState(currentPlan);
  const [tier, setTier] = useState(currentTier);
  const [status, setStatus] = useState(currentStatus);
  const [graceDays, setGraceDays] = useState(currentGraceDays);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);

    const res = await fetch(`/api/admin/users/${userId}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, tier, status, gracePeriodDays: graceDays }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Error al guardar");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  };

  const changed = plan !== currentPlan || tier !== currentTier || status !== currentStatus || graceDays !== currentGraceDays;

  return (
    <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Admin</span>
      </div>
      <h2 className="font-semibold text-[#1A3C6E] mb-5">Cambiar plan manualmente</h2>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1.5">Plan</label>
          <select
            value={plan}
            onChange={e => setPlan(e.target.value)}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Sin plan</option>
            {plans.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1.5">Tier</label>
          <select
            value={tier}
            onChange={e => setTier(e.target.value)}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="base">Base</option>
            <option value="plus">Plus</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1.5">Estado</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium text-[#475569] mb-1.5">
          Días de gracia por exceso de propietarios <span className="text-[#94A3B8]">(por defecto 30)</span>
        </label>
        <input
          type="number"
          min={1}
          max={365}
          value={graceDays}
          onChange={e => setGraceDays(Number(e.target.value))}
          className="w-32 px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={loading || !changed}
        className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-[#0F1E3C] font-semibold rounded-xl hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
        ) : saved ? (
          <><CheckCheck className="w-4 h-4" /> Guardado</>
        ) : (
          "Aplicar cambio"
        )}
      </button>
      <p className="text-xs text-[#94A3B8] mt-2">El cambio es inmediato y no pasa por Stripe.</p>
    </div>
  );
}
