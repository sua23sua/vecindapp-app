import { createClient } from "@/lib/supabase/server";
import { FileText, Users, CheckCheck, Eye, AlertCircle } from "lucide-react";
import { statusColor, statusLabel } from "@/lib/display";

export const dynamic = "force-dynamic";

export default async function SeguimientoPage() {
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*, campaign_rows(*)")
    .order("sent_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Seguimiento</h1>
        <p className="text-[#475569] mt-1">Historial de campañas enviadas</p>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <div className="text-center py-20 text-[#475569]">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Aún no has enviado ningún aviso.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map(c => {
            const rows = c.campaign_rows ?? [];
            const confirmed = rows.filter((r: { status: string }) => r.status === "confirmed").length;
            const read      = rows.filter((r: { status: string }) => r.status === "read").length;
            const failed    = rows.filter((r: { status: string }) => r.status === "failed").length;
            const date      = new Date(c.sent_at);

            return (
              <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
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

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-xs text-[#475569] uppercase">
                        <th className="px-5 py-3 text-left font-semibold">Propietario</th>
                        <th className="px-5 py-3 text-left font-semibold">Piso</th>
                        <th className="px-5 py-3 text-left font-semibold">Estado</th>
                        <th className="px-5 py-3 text-left font-semibold">Leído</th>
                        <th className="px-5 py-3 text-left font-semibold">Confirmado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {rows.map((row: { id: string; owner_name: string; unit: string; status: string; read_at: string | null; confirmed_at: string | null; reply: string | null }) => (
                        <tr key={row.id} className="hover:bg-[#F8FAFC]">
                          <td className="px-5 py-3 font-medium text-[#1E293B]">{row.owner_name}</td>
                          <td className="px-5 py-3 text-[#475569]">{row.unit}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                              {statusLabel[row.status] ?? row.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[#475569]">{row.read_at ?? "—"}</td>
                          <td className="px-5 py-3">
                            {row.confirmed_at
                              ? <span className="text-[#15803D]">{row.confirmed_at} {row.reply && <span className="text-[#475569]">"{row.reply}"</span>}</span>
                              : <span className="text-[#475569]">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                  <button className="text-sm font-semibold text-[#1A56DB] hover:text-[#1A3C6E] transition-colors flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Exportar informe PDF de evidencia
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
