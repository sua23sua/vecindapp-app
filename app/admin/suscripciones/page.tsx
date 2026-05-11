import { createAdminClient, listAuthUsers } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  active:   "bg-[#F0FDF4] text-[#15803D]",
  past_due: "bg-red-50 text-red-600",
  canceled: "bg-[#F8FAFC] text-[#475569]",
};

export default async function AdminSuscripcionesPage() {
  const db = createAdminClient();

  const [authUsers, { data: subs }] = await Promise.all([
    listAuthUsers(),
    db.from("subscriptions").select("*").order("created_at", { ascending: false }),
  ]);

  const emailMap = new Map(authUsers.map(u => [u.id, u.email]));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Suscripciones</h1>
        <p className="text-[#475569] mt-1">{(subs ?? []).length} registros</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Usuario</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Plan</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Tier</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Estado</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Renovación</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Stripe ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {(subs ?? []).map((s: any) => (
              <tr key={s.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-5 py-3 font-medium text-[#1E293B]">
                  {emailMap.get(s.user_id) ?? s.user_id.slice(0, 8) + "…"}
                </td>
                <td className="px-5 py-3">
                  <span className="capitalize text-[#1E293B] font-medium">{s.plan ?? "—"}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="capitalize text-[#475569]">{s.tier ?? "base"}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-lg font-medium text-xs ${STATUS_STYLE[s.status] ?? "bg-[#F8FAFC] text-[#475569]"}`}>
                    {s.status ?? "—"}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#475569]">
                  {s.current_period_end
                    ? new Date(s.current_period_end).toLocaleDateString("es-ES")
                    : "—"}
                </td>
                <td className="px-5 py-3 text-[#94A3B8] font-mono text-xs">
                  {s.stripe_customer_id ? s.stripe_customer_id.slice(0, 18) + "…" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
