"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteCampaignButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/campaigns/${campaignId}`, { method: "DELETE" });
    router.push("/seguimiento");
  };

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" /> Eliminar campaña
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-red-600 font-medium">¿Eliminar esta campaña?</span>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Confirmar"}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-xs text-[#475569] hover:bg-white"
      >
        Cancelar
      </button>
    </div>
  );
}
