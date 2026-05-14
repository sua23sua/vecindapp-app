import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Users, CheckCheck, Eye, AlertCircle } from "lucide-react";
import CampaignTable from "../CampaignTable";
import ExportButton from "../ExportButton";
import DeleteCampaignButton from "./DeleteCampaignButton";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*, campaign_rows(*)")
    .eq("id", id)
    .single();

  if (!campaign) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = campaign.campaign_rows ?? [];
  const confirmed = rows.filter(r => r.status === "confirmed").length;
  const read = rows.filter(r => r.status === "read").length;
  const failed = rows.filter(r => r.status === "failed").length;
  const date = new Date(campaign.sent_at);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/seguimiento"
          className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#1A3C6E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a seguimiento
        </Link>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E2E8F0]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#1E293B]">{campaign.title || "(sin título)"}</h1>
                {campaign.has_pdf && (
                  <span className="flex items-center gap-1 text-xs text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-full">
                    <FileText className="w-3 h-3" /> PDF
                  </span>
                )}
              </div>
              <p className="text-sm text-[#475569] mt-1">
                {campaign.community_name} · {date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })} a las {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <div className="flex gap-4 text-sm mt-3 flex-wrap">
                <span className="flex items-center gap-1 text-[#15803D] font-medium">
                  <CheckCheck className="w-4 h-4" /> {confirmed} confirmados
                </span>
                <span className="flex items-center gap-1 text-[#1A56DB]">
                  <Eye className="w-4 h-4" /> {read} leídos
                </span>
                {failed > 0 && (
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="w-4 h-4" /> {failed} fallidos
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[#475569] flex-shrink-0">
              <Users className="w-4 h-4" /> {campaign.total_recipients}
            </div>
          </div>
        </div>

        <CampaignTable rows={rows} />

        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-4">
          <ExportButton campaign={campaign} />
          <DeleteCampaignButton campaignId={campaign.id} />
        </div>
      </div>
    </div>
  );
}
