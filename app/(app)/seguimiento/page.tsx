import { createClient } from "@/lib/supabase/server";
import { FileText } from "lucide-react";
import { Suspense } from "react";
import CampaignCard from "./CampaignCard";
import CompletedSearch from "./CompletedSearch";

export const dynamic = "force-dynamic";

export default async function SeguimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  const { q, from, to } = await searchParams;
  const supabase = await createClient();

  const { data: active } = await supabase
    .from("campaigns")
    .select("id, title, community_name, sent_at, total_recipients, has_pdf, status, campaign_rows(status)")
    .eq("status", "active")
    .order("sent_at", { ascending: false });

  let completedQuery = supabase
    .from("campaigns")
    .select("id, title, community_name, sent_at, total_recipients, has_pdf, status, campaign_rows(status)")
    .eq("status", "completed")
    .order("sent_at", { ascending: false });

  if (q) completedQuery = completedQuery.ilike("community_name", `%${q}%`);
  if (from) completedQuery = completedQuery.gte("sent_at", from);
  if (to) completedQuery = completedQuery.lte("sent_at", `${to}T23:59:59`);

  const { data: completed } = await completedQuery;

  const hasFilters = !!(q || from || to);

  if (!active?.length && !completed?.length && !hasFilters) {
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Seguimiento</h1>
        <p className="text-[#475569] mt-1">Historial de campañas enviadas</p>
      </div>

      {(active?.length ?? 0) > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="font-semibold text-[#1A3C6E]">Activas</h2>
            <span className="text-xs text-[#94A3B8]">({active!.length})</span>
          </div>
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {active!.map(c => <CampaignCard key={c.id} campaign={c as any} />)}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#15803D]" />
          <h2 className="font-semibold text-[#1A3C6E]">Completadas</h2>
          <span className="text-xs text-[#94A3B8]">({completed?.length ?? 0})</span>
        </div>
        <Suspense fallback={null}>
          <CompletedSearch />
        </Suspense>
        {completed?.length ? (
          <div className="space-y-3 mt-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {completed.map(c => <CampaignCard key={c.id} campaign={c as any} />)}
          </div>
        ) : (
          <p className="text-sm text-[#94A3B8] mt-4">
            {q || from || to ? "No hay resultados para esa búsqueda." : "No hay campañas completadas aún."}
          </p>
        )}
      </section>
    </div>
  );
}
