"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function CompleteCampaignButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    await fetch(`/api/campaigns/${campaignId}/complete`, { method: "POST" });
    router.push("/seguimiento");
  };

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-1.5 text-sm font-semibold text-[#15803D] hover:text-[#166534] disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
      Marcar como completada
    </button>
  );
}
