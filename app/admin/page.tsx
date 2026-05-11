import { createAdminClient, listAuthUsers } from "@/lib/supabase/admin";
import { PLANS } from "@/lib/stripe";
import { Users, Building2, Send, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

const PRICE_MAP: Record<string, Record<string, number>> = Object.fromEntries(
  PLANS.map(p => [p.id, { base: p.priceBase, plus: p.pricePlus }])
);

export default async function AdminPage() {
  const db = createAdminClient();

  const [authUsers, { data: subs }, { data: communities }, { data: campaigns }] = await Promise.all([
    listAuthUsers(),
    db.from("subscriptions").select("plan, tier, status"),
    db.from("communities").select("id"),
    db.from("campaigns").select("id, total_recipients, sent_at"),
  ]);

  const activeSubs = (subs ?? []).filter((s: any) => s.status === "active");
  const mrr = activeSubs.reduce((sum: number, s: any) => {
    const prices = PRICE_MAP[s.plan];
    if (!prices) return sum;
    return sum + (s.tier === "plus" ? prices.plus : prices.base);
  }, 0);

  const now = new Date();
  const thisMonth = (campaigns ?? []).filter((c: any) => {
    const d = new Date(c.sent_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const messagesThisMonth = thisMonth.reduce((s: number, c: any) => s + (c.total_recipients ?? 0), 0);

  const cards = [
    { label: "Usuarios registrados", value: authUsers.length, icon: Users, color: "text-[#1A56DB] bg-[#EFF6FF]" },
    { label: "Suscripciones activas", value: activeSubs.length, icon: TrendingUp, color: "text-[#15803D] bg-[#F0FDF4]" },
    { label: "MRR estimado", value: `${mrr} €`, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
    { label: "Comunidades totales", value: (communities ?? []).length, icon: Building2, color: "text-[#7C3AED] bg-[#F5F3FF]" },
    { label: "Campañas este mes", value: thisMonth.length, icon: Send, color: "text-[#0891B2] bg-[#ECFEFF]" },
    { label: "Mensajes este mes", value: messagesThisMonth, icon: Send, color: "text-[#DB2777] bg-[#FDF2F8]" },
  ];

  const planDist = activeSubs.reduce((acc: Record<string, number>, s: any) => {
    const k = `${s.plan} ${s.tier ?? "base"}`;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Estadísticas</h1>
        <p className="text-[#475569] mt-1">Visión global de la plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#1A3C6E]">{value}</p>
            <p className="text-sm text-[#475569] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {Object.keys(planDist).length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <h2 className="font-semibold text-[#1A3C6E] mb-4">Distribución de planes activos</h2>
          <div className="space-y-3">
            {Object.entries(planDist).sort((a, b) => b[1] - a[1]).map(([plan, count]) => (
              <div key={plan} className="flex items-center gap-3">
                <span className="w-36 text-sm text-[#475569] capitalize">{plan}</span>
                <div className="flex-1 bg-[#F8FAFC] rounded-full h-2">
                  <div
                    className="bg-[#1A56DB] h-2 rounded-full"
                    style={{ width: `${(count / activeSubs.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[#1E293B] w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
