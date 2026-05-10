"use client";

import { FileText } from "lucide-react";

type Row = {
  owner_name: string;
  unit: string;
  status: string;
  read_at: string | null;
  confirmed_at: string | null;
  reply: string | null;
};

type Campaign = {
  id: string;
  title: string;
  community_name: string;
  sent_at: string;
  total_recipients: number;
  message: string;
  campaign_rows: Row[];
};

const STATUS_LABEL: Record<string, string> = {
  sent: "Enviado",
  delivered: "Entregado",
  read: "Leído",
  confirmed: "Confirmado",
  failed: "Fallido",
};

export default function ExportButton({ campaign }: { campaign: Campaign }) {
  const handleExport = () => {
    const rows = campaign.campaign_rows ?? [];
    const confirmed = rows.filter(r => r.status === "confirmed").length;
    const read = rows.filter(r => r.status === "read").length;
    const delivered = rows.filter(r => r.status === "delivered").length;
    const failed = rows.filter(r => r.status === "failed").length;
    const date = new Date(campaign.sent_at).toLocaleString("es-ES", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

    const rowsHtml = rows.map(r => `
      <tr>
        <td>${r.owner_name}</td>
        <td>${r.unit}</td>
        <td>${STATUS_LABEL[r.status] ?? r.status}</td>
        <td>${r.read_at ?? "—"}</td>
        <td>${r.confirmed_at ?? "—"}</td>
        <td>${r.reply ?? "—"}</td>
      </tr>
    `).join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Evidencia: ${campaign.title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1E293B; padding: 32px; }
  .header { border-bottom: 2px solid #1A56DB; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 20px; color: #1A3C6E; }
  .header p { color: #475569; margin-top: 4px; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .meta-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; }
  .meta-box .val { font-size: 22px; font-weight: bold; color: #1A3C6E; }
  .meta-box .lbl { color: #475569; font-size: 11px; margin-top: 2px; }
  .message-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
  .message-box h3 { font-size: 11px; text-transform: uppercase; color: #475569; margin-bottom: 8px; letter-spacing: 0.05em; }
  .message-box p { white-space: pre-wrap; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #F8FAFC; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; border-bottom: 1px solid #E2E8F0; }
  td { padding: 8px 10px; border-bottom: 1px solid #F1F5F9; }
  tr:last-child td { border-bottom: none; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #E2E8F0; color: #94A3B8; font-size: 10px; display: flex; justify-content: space-between; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<div class="header">
  <h1>Informe de evidencia de notificación</h1>
  <p>${campaign.title} · ${campaign.community_name} · ${date}</p>
</div>

<div class="meta">
  <div class="meta-box"><div class="val">${campaign.total_recipients}</div><div class="lbl">Total destinatarios</div></div>
  <div class="meta-box"><div class="val" style="color:#15803D">${confirmed}</div><div class="lbl">Confirmados</div></div>
  <div class="meta-box"><div class="val" style="color:#1A56DB">${read}</div><div class="lbl">Leídos</div></div>
  <div class="meta-box"><div class="val">${delivered}</div><div class="lbl">Entregados</div></div>
  <div class="meta-box"><div class="val" style="color:#DC2626">${failed}</div><div class="lbl">Fallidos</div></div>
  <div class="meta-box"><div class="val">${Math.round(confirmed / (campaign.total_recipients || 1) * 100)}%</div><div class="lbl">Tasa confirmación</div></div>
</div>

<div class="message-box">
  <h3>Mensaje enviado</h3>
  <p>${campaign.message}</p>
</div>

<table>
  <thead>
    <tr>
      <th>Propietario</th><th>Piso</th><th>Estado</th><th>Leído</th><th>Confirmado</th><th>Respuesta</th>
    </tr>
  </thead>
  <tbody>${rowsHtml}</tbody>
</table>

<div class="footer">
  <span>VecindApp · Informe generado el ${new Date().toLocaleString("es-ES")}</span>
  <span>Campaña ID: ${campaign.id}</span>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  return (
    <button
      onClick={handleExport}
      className="text-sm font-semibold text-[#1A56DB] hover:text-[#1A3C6E] transition-colors flex items-center gap-1.5"
    >
      <FileText className="w-4 h-4" /> Exportar informe PDF de evidencia
    </button>
  );
}
