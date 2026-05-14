import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, Users, CheckCheck, Eye, ChevronRight } from "lucide-react";
import CommunityHeader from "./CommunityHeader";
import OwnersTable from "./OwnersTable";

export const dynamic = "force-dynamic";

type Community = { id: string; name: string; address: string | null };
type Owner = { id: string; community_id: string; name: string; unit: string; phone: string; email: string | null; created_at: string };

export default async function ComunidadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: communityRaw }, { data: ownersRaw }, { data: campaignsRaw }] = await Promise.all([
    supabase.from("communities").select("id, name, address").eq("id", id).single(),
    supabase.from("owners").select("*").eq("community_id", id).order("unit"),
    supabase
      .from("campaigns")
      .select("id, title, sent_at, total_recipients, status, has_pdf, campaign_rows(status)")
      .eq("community_id", id)
      .order("sent_at", { ascending: false }),
  ]);

  const community = communityRaw as Community | null;
  const owners = (ownersRaw ?? []) as Owner[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campaigns = (campaignsRaw ?? []) as any[];

  if (!community) notFound();

  return (
    <div>
      <CommunityHeader id={community.id} name={community.name} address={community.address} />
      <OwnersTable communityId={id} initialOwners={owners} />

      {campaigns.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-[#1A3C6E] mb-3">Campañas</h2>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm divide-y divide-[#E2E8F0]">
            {campaigns.map(c => {
              const rows = c.campaign_rows ?? [];
              const confirmed = rows.filter((r: { status: string }) => r.status === "confirmed").length;
              const read = rows.filter((r: { status: string }) => r.status === "read" || r.status === "confirmed").length;
              const date = new Date(c.sent_at);
              return (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1E293B] truncate">{c.title || "(sin título)"}</span>
                      {c.has_pdf && <FileText className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${c.status === "completed" ? "bg-green-50 text-[#15803D]" : "bg-amber-50 text-amber-600"}`}>
                        {c.status === "completed" ? "Completada" : "Activa"}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#475569] flex-shrink-0">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{c.total_recipients}</span>
                    <span className="flex items-center gap-1 text-[#15803D]"><CheckCheck className="w-3.5 h-3.5" />{confirmed}</span>
                    <span className="flex items-center gap-1 text-[#1A56DB]"><Eye className="w-3.5 h-3.5" />{read}</span>
                  </div>
                  <Link href={`/seguimiento/${c.id}`} className="text-[#1A56DB] hover:text-[#1A3C6E] flex-shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
