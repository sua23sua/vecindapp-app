import { createClient } from "@/lib/supabase/server";
import { FileText, Users, CheckCheck, Eye, AlertCircle } from "lucide-react";
import ExportButton from "./ExportButton";
import CampaignTable from "./CampaignTable";

export const dynamic = "force-dynamic";

export default async function SeguimientoPage() {
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*, campaign_rows(*)")
    .order("sent_at", { ascending: false });

  if (!campaigns || campaigns.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1A3C6E]">Seguimiento</h1>
          <p className="text-[#475569] mt-1">Historial de campañas enviadas</p>
        </div>
        <div className="text-center py-20 text-[#475569]">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Aún no has enviado ningún aviso.</p>
        </div>
      </div>
    );
  }

  const active = campaigns.filter(c => {
    const rows = c.campaign_rows ?? [];
    return rows.length === 0 || rows.some((r: { status: string }) => r.status !== "confirmed");
  });
  const finished = campaigns.filter(c => {
    const rows = c.campaign_rows ?? [];
    return rows.length > 0 && rows.every((r: { status: string }) => r.status === "confirmed");
  });

  function CampaignCard({ c }: { c: (typeof campaigns)[number] }) {
    const rows = c.campaign_rows ?? [];
    const confirmed = rows.filter((r: { status: string }) => r.status === "confirmed").length;
    const read      = rows.filter((r: { status: string }) => r.status === "read").length;
    const failed    = rows.filter((r: { status: string }) => r.status === "failed").length;
    const date      = new Date(c.sent_at);

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#E2E8F0]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-[#1E293B]">{c.title}</h2>
                {c.has_pdf && (
                  <span className="flex items-center gap-1 text-xs text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-full">
                    <FileText className="w-3 h-3" /> PDF
                  </span>
                )}
              </div>
              <p className="text-sm text-[#475569] mt-0.5">
                {c.community_name} · {date.toLocaleDateString("es-ES", { day: "numeric", month: "long" })} a las {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <div className="flex gap-3 text-xs mt-2">
                <span className="flex items-center gap-1 text-[#15803D]"><CheckCheck className="w-3 h-3" />{confirmed} confirmados</span>
                <span className="flex items-center gap-1 text-[#1A56DB]"><Eye className="w-3 h-3" />{read} leídos</span>
                <span className="flex items-center gap-1 text-red-500"><AlertCircle className="w-3 h-3" />{failed} fallidos</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#475569] flex-shrink-0">
              <Users className="w-4 h-4" />
              <span>{c.total_recipients}</span>
            </div>
          </div>
        </div>

        <CampaignTable rows={rows} />

        <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <ExportButton campaign={c} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Seguimiento</h1>
        <p className="text-[#475569] mt-1">Historial de campañas enviadas</p>
      </div>

      {active.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <h2 className="font-semibold text-[#1A3C6E]">Activas</h2>
            <span className="text-xs text-[#94A3B8]">({active.length})</span>
          </div>
          <div className="space-y-4">
            {active.map(c => <CampaignCard key={c.id} c={c} />)}
          </div>
        </div>
      )}

      {finished.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
            <h2 className="font-semibold text-[#1A3C6E]">Finalizadas</h2>
            <span className="text-xs text-[#94A3B8]">({finished.length})</span>
          </div>
          <div className="space-y-4">
            {finished.map(c => <CampaignCard key={c.id} c={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}
