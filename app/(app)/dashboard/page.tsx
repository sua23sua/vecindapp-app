import { Building2, Users, Send, CheckCheck, TrendingUp } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { statusColor, statusLabel } from "@/lib/display";

export const dynamic = "force-dynamic";

type CampaignRow = { status: string; owner_name: string; unit: string };
type Campaign = {
  id: string; title: string; community_name: string;
  campaign_rows: CampaignRow[];
};

export default async function Dashboard() {
  const supabase = await createClient();

  const [{ data: rawComms }, { data: rawCampaigns }] = await Promise.all([
    supabase.from("communities").select("id, name, address, owners(count)"),
    supabase.from("campaigns").select("id, title, community_name, campaign_rows(status, owner_name, unit)")
      .order("sent_at", { ascending: false }).limit(5),
  ]);

  const communities = (rawComms ?? []) as Record<string, unknown>[];
  const campaigns = (rawCampaigns ?? []) as Campaign[];

  const totalOwners = communities.reduce(
    (s, c) => s + ((c.owners as { count: number }[])[0]?.count ?? 0), 0
  );

  const lastCampaign = campaigns[0];
  const lastRows: CampaignRow[] = lastCampaign?.campaign_rows ?? [];
  const confirmed = lastRows.filter(r => r.status === "confirmed").length;
  const read      = lastRows.filter(r => r.status === "read").length;
  const failed    = lastRows.filter(r => r.status === "failed").length;

  const stats = [
    { label: "Comunidades",            value: communities.length, icon: Building2,  color: "text-[#1A56DB]", bg: "bg-[#EFF6FF]" },
    { label: "Propietarios totales",   value: totalOwners,        icon: Users,      color: "text-[#1A3C6E]", bg: "bg-[#EFF6FF]" },
    { label: "Campañas enviadas",       value: campaigns.length,   icon: Send,       color: "text-[#25D366]", bg: "bg-green-50" },
    { label: "Confirmados (último)",   value: confirmed,           icon: CheckCheck, color: "text-[#15803D]", bg: "bg-[#F0FDF4]" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Dashboard</h1>
        <p className="text-[#475569] mt-1">Bienvenido de nuevo.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-[#1E293B]">{s.value}</p>
              <p className="text-sm text-[#475569] mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {lastCampaign && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1A3C6E]">Último envío</h2>
              <Link href="/seguimiento" className="text-xs text-[#1A56DB] hover:underline">Ver todos →</Link>
            </div>
            <p className="font-medium text-[#1E293B]">{lastCampaign.title}</p>
            <p className="text-sm text-[#475569] mt-0.5">{lastCampaign.community_name}</p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="bg-green-50 rounded-xl p-3"><p className="text-xl font-bold text-[#15803D]">{confirmed}</p><p className="text-xs text-[#475569]">Confirmados</p></div>
              <div className="bg-blue-50 rounded-xl p-3"><p className="text-xl font-bold text-[#1A56DB]">{read}</p><p className="text-xs text-[#475569]">Leídos</p></div>
              <div className="bg-red-50 rounded-xl p-3"><p className="text-xl font-bold text-red-500">{failed}</p><p className="text-xs text-[#475569]">Fallidos</p></div>
            </div>
            <div className="mt-4 space-y-2">
              {lastRows.slice(0, 3).map((row, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-[#1E293B]">{row.owner_name} <span className="text-[#475569]">· {row.unit}</span></span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {statusLabel[row.status] ?? row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
          <h2 className="font-semibold text-[#1A3C6E] mb-4">Acciones rápidas</h2>
          <div className="space-y-3">
            <Link href="/enviar" className="flex items-center gap-4 p-4 rounded-xl bg-[#1A56DB] text-white hover:bg-[#1A3C6E] transition-colors">
              <Send className="w-5 h-5" />
              <div><p className="font-semibold text-sm">Enviar aviso</p><p className="text-xs text-white/70">Redacta y envía a tus comunidades</p></div>
            </Link>
            <Link href="/comunidades" className="flex items-center gap-4 p-4 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
              <Building2 className="w-5 h-5 text-[#1A56DB]" />
              <div><p className="font-semibold text-sm text-[#1E293B]">Gestionar comunidades</p><p className="text-xs text-[#475569]">Añade o edita propietarios</p></div>
            </Link>
            <Link href="/seguimiento" className="flex items-center gap-4 p-4 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
              <TrendingUp className="w-5 h-5 text-[#1A56DB]" />
              <div><p className="font-semibold text-sm text-[#1E293B]">Ver seguimiento</p><p className="text-xs text-[#475569]">Revisa quién leyó y confirmó</p></div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1A3C6E]">Mis comunidades</h2>
            <Link href="/comunidades" className="text-xs text-[#1A56DB] hover:underline">Ver todas →</Link>
          </div>
          {communities.length > 0 ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {communities.map(c => (
                <Link key={c.id as string} href={`/comunidades/${c.id}`} className="border border-[#E2E8F0] rounded-xl p-4 hover:border-[#1A56DB] hover:shadow-sm transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center mb-2">
                    <Building2 className="w-4 h-4 text-[#1A56DB]" />
                  </div>
                  <p className="font-medium text-sm text-[#1E293B]">{c.name as string}</p>
                  <p className="text-xs text-[#475569] mt-1">
                    {(c.owners as { count: number }[])[0]?.count ?? 0} propietarios
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-[#475569]">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aún no tienes comunidades. <Link href="/comunidades" className="text-[#1A56DB] hover:underline">Añade una →</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
