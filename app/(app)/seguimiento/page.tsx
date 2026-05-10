import Link from "next/link";
import { campaigns, statusColor, statusLabel } from "@/lib/mock-data";
import { FileText, Users, CheckCheck, Eye, AlertCircle } from "lucide-react";

function CampaignStats({ campaign }: { campaign: typeof campaigns[0] }) {
  const counts = {
    confirmed: campaign.rows.filter(r => r.status === "confirmed").length,
    read:      campaign.rows.filter(r => r.status === "read").length,
    delivered: campaign.rows.filter(r => r.status === "delivered").length,
    failed:    campaign.rows.filter(r => r.status === "failed").length,
  };
  return (
    <div className="flex gap-3 text-xs">
      <span className="flex items-center gap-1 text-[#15803D]"><CheckCheck className="w-3 h-3" />{counts.confirmed} confirmados</span>
      <span className="flex items-center gap-1 text-[#1A56DB]"><Eye className="w-3 h-3" />{counts.read} leídos</span>
      <span className="flex items-center gap-1 text-red-500"><AlertCircle className="w-3 h-3" />{counts.failed} fallidos</span>
    </div>
  );
}

export default function SeguimientoPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Seguimiento</h1>
        <p className="text-[#475569] mt-1">Historial de campañas enviadas</p>
      </div>

      <div className="space-y-4">
        {campaigns.map(c => {
          const date = new Date(c.sentAt);
          return (
            <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="p-5 border-b border-[#E2E8F0]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-[#1E293B]">{c.title}</h2>
                      {c.hasPdf && (
                        <span className="flex items-center gap-1 text-xs text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-full">
                          <FileText className="w-3 h-3" /> PDF
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#475569] mt-0.5">
                      {c.communityName} · {date.toLocaleDateString("es-ES", { day: "numeric", month: "long" })} a las {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className="mt-2">
                      <CampaignStats campaign={c} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#475569] flex-shrink-0">
                    <Users className="w-4 h-4" />
                    <span>{c.totalRecipients}</span>
                  </div>
                </div>
              </div>

              {/* Rows */}
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
                    {c.rows.map(row => (
                      <tr key={row.ownerId} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 py-3 font-medium text-[#1E293B]">{row.ownerName}</td>
                        <td className="px-5 py-3 text-[#475569]">{row.unit}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[row.status]}`}>
                            {statusLabel[row.status]}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[#475569]">{row.readAt ?? "—"}</td>
                        <td className="px-5 py-3">
                          {row.confirmedAt
                            ? <span className="text-[#15803D]">{row.confirmedAt} {row.reply && <span className="text-[#475569]">"{row.reply}"</span>}</span>
                            : <span className="text-[#475569]">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                <button className="text-sm font-semibold text-[#1A56DB] hover:text-[#1A3C6E] transition-colors flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Exportar informe PDF de evidencia
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
