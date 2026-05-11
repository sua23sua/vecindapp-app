"use client";

import { FileText } from "lucide-react";

type Row = {
  owner_name: string;
  unit: string;
  status: string;
  phone: string;
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
  sent:      "Enviado",
  delivered: "Entregado",
  read:      "Leído",
  confirmed: "Confirmado",
  failed:    "No entregado",
};

const STATUS_COLOR: Record<string, string> = {
  sent:      "#64748B",
  delivered: "#1A56DB",
  read:      "#7C3AED",
  confirmed: "#15803D",
  failed:    "#DC2626",
};

const STATUS_BG: Record<string, string> = {
  sent:      "#F1F5F9",
  delivered: "#EFF6FF",
  read:      "#F5F3FF",
  confirmed: "#F0FDF4",
  failed:    "#FEF2F2",
};

export default function ExportButton({ campaign }: { campaign: Campaign }) {
  const handleExport = () => {
    const rows = campaign.campaign_rows ?? [];
    const confirmed = rows.filter(r => r.status === "confirmed").length;
    const read      = rows.filter(r => r.status === "read").length;
    const delivered = rows.filter(r => r.status === "delivered").length;
    const failed    = rows.filter(r => r.status === "failed").length;
    const sent      = rows.filter(r => r.status === "sent").length;
    const rate      = Math.round(confirmed / (campaign.total_recipients || 1) * 100);

    const sentDate = new Date(campaign.sent_at);
    const dateStr  = sentDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const timeStr  = sentDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    const docId    = campaign.id.split("-")[0].toUpperCase();
    const genDate  = new Date().toLocaleString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

    const rowsHtml = rows.map((r, i) => {
      const color = STATUS_COLOR[r.status] ?? "#64748B";
      const bg    = STATUS_BG[r.status]    ?? "#F1F5F9";
      const label = STATUS_LABEL[r.status] ?? r.status;
      const confirmedTime = r.confirmed_at
        ? new Date(r.confirmed_at).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
        : "—";
      return `
        <tr style="background:${i % 2 === 0 ? "#FFFFFF" : "#F8FAFC"}">
          <td style="padding:9px 12px;border-bottom:1px solid #F1F5F9;font-weight:600;color:#1E293B">${r.owner_name}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #F1F5F9;color:#475569">${r.unit || "—"}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #F1F5F9">
            <span style="background:${bg};color:${color};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600">${label}</span>
          </td>
          <td style="padding:9px 12px;border-bottom:1px solid #F1F5F9;color:#475569;font-size:12px">${confirmedTime}</td>
          <td style="padding:9px 12px;border-bottom:1px solid #F1F5F9;color:#475569;font-size:12px;font-style:italic">${r.reply ? `"${r.reply}"` : "—"}</td>
        </tr>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Certificado de Notificación · ${campaign.title}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; font-size:13px; color:#1E293B; background:#fff; }
  @media print {
    body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .no-print { display:none; }
  }
  .page { max-width:900px; margin:0 auto; padding:48px 48px 40px; }

  /* Top bar */
  .topbar { display:flex; align-items:center; justify-content:space-between; padding-bottom:20px; border-bottom:3px solid #1A3C6E; margin-bottom:32px; }
  .brand { display:flex; align-items:center; gap:12px; }
  .brand-icon { width:44px; height:44px; background:#1A3C6E; border-radius:10px; display:flex; align-items:center; justify-content:center; }
  .brand-name { font-size:22px; font-weight:800; color:#1A3C6E; letter-spacing:-0.5px; }
  .brand-sub  { font-size:11px; color:#64748B; margin-top:1px; }
  .doc-ref { text-align:right; }
  .doc-ref .ref-num { font-size:13px; font-weight:700; color:#1A3C6E; font-family:monospace; }
  .doc-ref .ref-lbl { font-size:10px; color:#94A3B8; margin-top:2px; }

  /* Title block */
  .title-block { text-align:center; margin-bottom:32px; }
  .cert-badge { display:inline-block; background:#EFF6FF; border:1.5px solid #1A56DB; color:#1A56DB; font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:5px 16px; border-radius:20px; margin-bottom:12px; }
  .cert-title { font-size:26px; font-weight:800; color:#1A3C6E; margin-bottom:6px; }
  .cert-sub   { color:#475569; font-size:14px; }

  /* Info grid */
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden; margin-bottom:28px; }
  .info-cell { padding:14px 20px; border-right:1px solid #E2E8F0; border-bottom:1px solid #E2E8F0; }
  .info-cell:nth-child(2n) { border-right:none; }
  .info-cell:nth-last-child(-n+2) { border-bottom:none; }
  .info-lbl { font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#94A3B8; font-weight:600; margin-bottom:4px; }
  .info-val  { font-size:14px; font-weight:600; color:#1E293B; }

  /* Stats */
  .stats { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:28px; }
  .stat { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:14px 12px; text-align:center; }
  .stat .n { font-size:28px; font-weight:800; line-height:1; margin-bottom:4px; }
  .stat .l { font-size:10px; color:#64748B; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
  .stat.green  { background:#F0FDF4; border-color:#BBF7D0; }
  .stat.blue   { background:#EFF6FF; border-color:#BFDBFE; }
  .stat.purple { background:#F5F3FF; border-color:#DDD6FE; }
  .stat.red    { background:#FEF2F2; border-color:#FECACA; }

  /* Message box */
  .msg-box { background:#F8FAFC; border:1px solid #E2E8F0; border-left:4px solid #1A56DB; border-radius:0 10px 10px 0; padding:16px 20px; margin-bottom:28px; }
  .msg-lbl { font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#94A3B8; font-weight:600; margin-bottom:8px; }
  .msg-text { white-space:pre-wrap; line-height:1.7; color:#1E293B; }

  /* Table */
  .table-wrap { border:1px solid #E2E8F0; border-radius:12px; overflow:hidden; margin-bottom:32px; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:#1A3C6E; }
  thead th { padding:11px 12px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#fff; font-weight:700; }

  /* Footer */
  .footer { display:flex; align-items:flex-start; justify-content:space-between; padding-top:20px; border-top:1px solid #E2E8F0; gap:24px; }
  .footer-note { font-size:10px; color:#94A3B8; line-height:1.6; max-width:420px; }
  .seal { width:90px; height:90px; border:2px dashed #CBD5E1; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:8px; flex-shrink:0; }
  .seal-inner { font-size:8px; text-transform:uppercase; letter-spacing:0.06em; color:#94A3B8; line-height:1.4; font-weight:600; }

  .print-btn { position:fixed; bottom:24px; right:24px; background:#1A3C6E; color:#fff; border:none; padding:12px 24px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.2); }
  .print-btn:hover { background:#1A56DB; }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="topbar">
    <div class="brand">
      <div class="brand-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9,22 9,12 15,12 15,22" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div>
        <div class="brand-name">VecindApp</div>
        <div class="brand-sub">Gestión de Comunidades</div>
      </div>
    </div>
    <div class="doc-ref">
      <div class="ref-num">REF-${docId}</div>
      <div class="ref-lbl">Generado el ${genDate}</div>
    </div>
  </div>

  <!-- Title -->
  <div class="title-block">
    <div class="cert-badge">Documento Oficial</div>
    <div class="cert-title">Certificado de Notificación</div>
    <div class="cert-sub">Acreditación de envío y recepción de comunicación a propietarios</div>
  </div>

  <!-- Info -->
  <div class="info-grid">
    <div class="info-cell"><div class="info-lbl">Comunidad</div><div class="info-val">${campaign.community_name}</div></div>
    <div class="info-cell"><div class="info-lbl">Asunto</div><div class="info-val">${campaign.title}</div></div>
    <div class="info-cell"><div class="info-lbl">Fecha de envío</div><div class="info-val">${dateStr}</div></div>
    <div class="info-cell"><div class="info-lbl">Hora de envío</div><div class="info-val">${timeStr}h</div></div>
  </div>

  <!-- Stats -->
  <div class="stats">
    <div class="stat"><div class="n" style="color:#1A3C6E">${campaign.total_recipients}</div><div class="l">Destinatarios</div></div>
    <div class="stat green"><div class="n" style="color:#15803D">${confirmed}</div><div class="l">Confirmados</div></div>
    <div class="stat purple"><div class="n" style="color:#7C3AED">${read}</div><div class="l">Leídos</div></div>
    <div class="stat blue"><div class="n" style="color:#1A56DB">${delivered + sent}</div><div class="l">Pendientes</div></div>
    <div class="stat red"><div class="n" style="color:#DC2626">${failed}</div><div class="l">No entregados</div></div>
  </div>

  <!-- Message -->
  <div class="msg-box">
    <div class="msg-lbl">Contenido del mensaje enviado</div>
    <div class="msg-text">${campaign.message}</div>
  </div>

  <!-- Table -->
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Propietario</th>
          <th>Vivienda</th>
          <th>Estado</th>
          <th>Confirmación</th>
          <th>Respuesta del vecino</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-note">
      <strong>Validez del documento:</strong> Este certificado acredita que la comunicación fue enviada mediante la plataforma VecindApp a través de WhatsApp a los propietarios listados en la fecha indicada. Los estados «Confirmado» y «Leído» se obtienen directamente de los acuses de recibo del sistema de mensajería.<br><br>
      ID de campaña: <span style="font-family:monospace">${campaign.id}</span>
    </div>
    <div class="seal">
      <div class="seal-inner">VecindApp<br>Notificación<br>Digital<br>Verificada</div>
    </div>
  </div>

</div>

<button class="print-btn no-print" onclick="window.print()">🖨 Imprimir / Guardar PDF</button>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 120000);
  };

  return (
    <button
      onClick={handleExport}
      className="text-sm font-semibold text-[#1A56DB] hover:text-[#1A3C6E] transition-colors flex items-center gap-1.5"
    >
      <FileText className="w-4 h-4" /> Exportar certificado de notificación
    </button>
  );
}
