"use client";

import { useState } from "react";
import { CheckCheck, UserCheck, Loader2 } from "lucide-react";
import { statusColor, statusLabel } from "@/lib/display";
import { useRouter } from "next/navigation";

type Row = {
  id: string;
  owner_name: string;
  unit: string;
  status: string;
  read_at: string | null;
  confirmed_at: string | null;
  reply: string | null;
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function ConfirmButton({ rowId }: { rowId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await fetch(`/api/campaigns/rows/${rowId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-[#475569] hover:text-[#1A56DB] transition-colors"
        title="Confirmar manualmente"
      >
        <UserCheck className="w-3.5 h-3.5" />
        Confirmar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        type="text"
        placeholder="Nota (opcional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleConfirm()}
        className="text-xs border border-[#E2E8F0] rounded-lg px-2 py-1 w-32 focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
      />
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="text-xs bg-[#1A56DB] text-white px-2 py-1 rounded-lg hover:bg-[#1748C0] disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-[#475569] hover:text-red-500"
      >✕</button>
    </div>
  );
}

export default function CampaignTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F8FAFC] text-xs text-[#475569] uppercase">
            <th className="px-5 py-3 text-left font-semibold">Propietario</th>
            <th className="px-5 py-3 text-left font-semibold">Piso</th>
            <th className="px-5 py-3 text-left font-semibold">Estado</th>
            <th className="px-5 py-3 text-left font-semibold">Leído</th>
            <th className="px-5 py-3 text-left font-semibold">Confirmado</th>
            <th className="px-5 py-3 text-left font-semibold"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-[#F8FAFC]">
              <td className="px-5 py-3 font-medium text-[#1E293B]">{row.owner_name}</td>
              <td className="px-5 py-3 text-[#475569]">{row.unit}</td>
              <td className="px-5 py-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {statusLabel[row.status] ?? row.status}
                </span>
              </td>
              <td className="px-5 py-3 text-[#475569]">{fmtDate(row.read_at)}</td>
              <td className="px-5 py-3">
                {row.confirmed_at
                  ? <span className="text-[#15803D]">
                      {fmtDate(row.confirmed_at)}
                      {row.reply && <span className="text-[#475569] ml-1 text-xs">"{row.reply}"</span>}
                    </span>
                  : <span className="text-[#475569]">—</span>}
              </td>
              <td className="px-5 py-3">
                {row.status !== "confirmed" && <ConfirmButton rowId={row.id} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
