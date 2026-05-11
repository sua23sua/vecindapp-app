import { createAdminClient, listAuthUsers } from "@/lib/supabase/admin";
import { Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminComunidadesPage() {
  const db = createAdminClient();

  const [authUsers, { data: communities }] = await Promise.all([
    listAuthUsers(),
    db
      .from("communities")
      .select("id, name, address, user_id, created_at, owners(count)")
      .order("created_at", { ascending: false }),
  ]);

  const emailMap = new Map(authUsers.map(u => [u.id, u.email]));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Comunidades</h1>
        <p className="text-[#475569] mt-1">{(communities ?? []).length} comunidades en la plataforma</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Comunidad</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Dirección</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Propietarios</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Cuenta</th>
              <th className="text-left px-5 py-3 font-semibold text-[#475569]">Creada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {(communities ?? []).map((c: any) => (
              <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1A56DB] flex-shrink-0" />
                    <span className="font-medium text-[#1E293B]">{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-[#475569]">{c.address ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded-lg bg-[#EFF6FF] text-[#1A56DB] font-medium">
                    {c.owners?.[0]?.count ?? 0}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#475569]">
                  {emailMap.get(c.user_id) ?? c.user_id.slice(0, 8) + "…"}
                </td>
                <td className="px-5 py-3 text-[#475569]">
                  {new Date(c.created_at).toLocaleDateString("es-ES")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
