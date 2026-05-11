import { createAdminClient, listAuthUsers } from "@/lib/supabase/admin";
import { Paperclip } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCampanasPage() {
  const db = createAdminClient();

  const [authUsers, { data: campaigns }] = await Promise.all([
    listAuthUsers(),
    db
      .from("campaigns")
      .select("id, title, user_id, community_name, total_recipients, has_pdf, sent_at")
      .order("sent_at", { ascending: false })
      .limit(200),
  ]);

  const emailMap = new Map(authUsers.map(u => [u.id, u.email]));

  const { data: rows } = await db
    .from("campaign_rows")
    .select("campaign_id, status");

  const statsMap = new Map<string, { sent: number; failed: number }>();
  for (const r of (rows ?? []) as { campaign_id: string; status: string }[]) {
    const cur = statsMap.get(r.campaign_id) ?? { sent: 0, failed: 0 };
    if (r.status === "delivered") cur.sent++;
    else if (r.status === "failed") cur.failed++;
    statsMap.set(r.campaign_id, cur);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Campañas</h1>
        <p className="text-[#475569] mt-1">Últimos {(campaigns ?? []).length} envíos</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Título</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Cuenta</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Comunidad</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Enviados</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Fallidos</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {(campaigns ?? []).map((c: any) => {
              const stats = statsMap.get(c.id) ?? { sent: 0, failed: 0 };
              return (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1E293B]">{c.title || "(sin título)"}</span>
                      {c.has_pdf && <Paperclip className="w-3.5 h-3.5 text-[#475569]" />}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#475569]">
                    {emailMap.get(c.user_id) ?? c.user_id.slice(0, 8) + "…"}
                  </td>
                  <td className="px-5 py-3 text-[#475569]">{c.community_name}</td>
                  <td className="px-5 py-3">
                    <span className="text-[#15803D] font-medium">{stats.sent}</span>
                    <span className="text-[#94A3B8] ml-1">/ {c.total_recipients}</span>
                  </td>
                  <td className="px-5 py-3">
                    {stats.failed > 0
                      ? <span className="text-red-500 font-medium">{stats.failed}</span>
                      : <span className="text-[#94A3B8]">0</span>}
                  </td>
                  <td className="px-5 py-3 text-[#475569]">
                    {new Date(c.sent_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
