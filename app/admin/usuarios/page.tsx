import { createAdminClient, listAuthUsers } from "@/lib/supabase/admin";
import { CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const db = createAdminClient();

  const [authUsers, { data: subs }] = await Promise.all([
    listAuthUsers(),
    db.from("subscriptions").select("user_id, plan, tier, status"),
  ]);

  const subMap = new Map(
    (subs ?? []).map((s: any) => [s.user_id, s])
  );

  const users = authUsers.map(u => ({
    ...u,
    sub: subMap.get(u.id) as { plan: string; tier: string; status: string } | undefined,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Usuarios</h1>
        <p className="text-[#475569] mt-1">{users.length} cuentas registradas</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Email</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Nombre</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Plan</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Estado</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Email confirmado</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-5 py-3 font-medium text-[#1E293B]">{u.email}</td>
                <td className="px-5 py-3 text-[#475569]">
                  {u.user_metadata?.full_name ?? "—"}
                </td>
                <td className="px-5 py-3">
                  {u.sub ? (
                    <span className="px-2 py-0.5 rounded-lg bg-[#EFF6FF] text-[#1A56DB] font-medium capitalize">
                      {u.sub.plan} {u.sub.tier}
                    </span>
                  ) : (
                    <span className="text-[#94A3B8]">Sin plan</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {u.sub?.status === "active" ? (
                    <span className="px-2 py-0.5 rounded-lg bg-[#F0FDF4] text-[#15803D] font-medium">Activa</span>
                  ) : u.sub?.status ? (
                    <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 font-medium capitalize">{u.sub.status}</span>
                  ) : (
                    <span className="text-[#94A3B8]">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {u.email_confirmed_at
                    ? <CheckCircle className="w-4 h-4 text-[#15803D]" />
                    : <XCircle className="w-4 h-4 text-red-400" />}
                </td>
                <td className="px-5 py-3 text-[#475569]">
                  {new Date(u.created_at).toLocaleDateString("es-ES")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
