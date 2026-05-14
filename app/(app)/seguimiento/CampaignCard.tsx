"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Users, CheckCheck, Eye, AlertCircle, ChevronRight, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

type CampaignRow = { status: string };

type Campaign = {
  id: string;
  title: string;
  community_name: string;
  sent_at: string;
  total_recipients: number;
  has_pdf: boolean;
  status: string;
  campaign_rows: CampaignRow[];
};

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const rows = campaign.campaign_rows ?? [];
  const confirmed = rows.filter(r => r.status === "confirmed").length;
  const read = rows.filter(r => r.status === "read").length;
  const failed = rows.filter(r => r.status === "failed").length;
  const date = new Date(campaign.sent_at);

  const handleComplete = async () => {
    setLoadingComplete(true);
    await fetch(`/api/campaigns/${campaign.id}/complete`, { method: "POST" });
    setLoadingComplete(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    await fetch(`/api/campaigns/${campaign.id}`, { method: "DELETE" });
    setLoadingDelete(false);
    setConfirmDelete(false);
    router.refresh();
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-[#1E293B]">{campaign.title || "(sin título)"}</h2>
            {campaign.has_pdf && (
              <span className="flex items-center gap-1 text-xs text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-full">
                <FileText className="w-3 h-3" /> PDF
              </span>
            )}
          </div>
          <p className="text-sm text-[#475569] mt-0.5">
            {campaign.community_name} · {date.toLocaleDateString("es-ES", { day: "numeric", month: "long" })} a las {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <div className="flex gap-3 text-xs mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-[#15803D]"><CheckCheck className="w-3 h-3" />{confirmed} confirmados</span>
            <span className="flex items-center gap-1 text-[#1A56DB]"><Eye className="w-3 h-3" />{read} leídos</span>
            {failed > 0 && <span className="flex items-center gap-1 text-red-500"><AlertCircle className="w-3 h-3" />{failed} fallidos</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="flex items-center gap-1 text-sm text-[#475569]">
            <Users className="w-4 h-4" /> {campaign.total_recipients}
          </span>
          <Link
            href={`/seguimiento/${campaign.id}`}
            className="flex items-center gap-1 text-sm text-[#1A56DB] hover:text-[#1A3C6E] font-medium"
          >
            Ver detalle <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-3">
        {campaign.status === "active" && (
          <button
            onClick={handleComplete}
            disabled={loadingComplete}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#15803D] hover:text-[#166534] disabled:opacity-50"
          >
            {loadingComplete
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <CheckCircle2 className="w-4 h-4" />}
            Marcar como completada
          </button>
        )}

        {campaign.status === "completed" && (
          <span className="text-xs text-[#15803D] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completada
          </span>
        )}

        {confirmDelete ? (
          <div className="flex items-center gap-2 text-sm ml-auto">
            <span className="text-red-600 font-medium text-xs">¿Eliminar campaña?</span>
            <button
              onClick={handleDelete}
              disabled={loadingDelete}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 disabled:opacity-50"
            >
              {loadingDelete ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "Eliminar"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1 border border-[#E2E8F0] rounded-lg text-xs text-[#475569] hover:bg-white"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1 text-sm text-[#94A3B8] hover:text-red-500 transition-colors ml-auto"
          >
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
