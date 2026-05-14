"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRef } from "react";
import { Send, Paperclip, Eye, Users, CheckCheck, X, Search } from "lucide-react";

const VARIABLES = ["{{nombre}}", "{{vivienda}}", "{{comunidad}}", "{{fecha_junta}}"];

type Step = "redactar" | "seleccionar" | "preview" | "enviado";

type Owner = { id: string; name: string; unit: string; phone: string };
type Community = { id: string; name: string; address: string | null; owners: Owner[] };

export default function EnviarPage() {
  const [step, setStep] = useState<Step>("redactar");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [message, setMessage] = useState(
    "Estimado/a {{nombre}}, propietario/a de {{vivienda}}:\n\nLe convocamos a la Junta General de la comunidad {{comunidad}} el {{fecha_junta}}.\n\nRogamos confirme asistencia respondiendo a este mensaje.\n\nAtentamente,\nLa Administración"
  );
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [sendResults, setSendResults] = useState<{ community: string; sent: number; failed: number }[]>([]);
  const [blockedError, setBlockedError] = useState<string | null>(null);
  const [communitySearch, setCommunitySearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("communities")
      .select("id, name, address, owners(id, name, unit, phone)")
      .then(({ data }) => setCommunities((data as Community[]) ?? []));
  }, []);

  const selectedComms = communities.filter(c => selectedCommunities.includes(c.id));
  const totalRecipients = selectedComms.reduce((s, c) => s + c.owners.length, 0);

  const preview = (owner: Owner, comm: Community) =>
    message
      .replace(/{{nombre}}/g, owner.name)
      .replace(/{{vivienda}}/g, owner.unit)
      .replace(/{{comunidad}}/g, comm.name)
      .replace(/{{fecha_junta}}/g, "28 de mayo a las 18:00h");

  const handleSend = async () => {
    setSending(true);
    setBlockedError(null);
    const formData = new FormData();
    formData.append("data", JSON.stringify({ communities: selectedComms, message, campaignTitle }));
    if (pdfFile) formData.append("pdf", pdfFile);

    const res = await fetch("/api/whatsapp", { method: "POST", body: formData });
    const json = await res.json();

    if (!res.ok && json.error === "plan_blocked") {
      setBlockedError(json.message);
      setSending(false);
      return;
    }

    setSendResults(json.results ?? []);
    setSending(false);
    setStep("enviado");
  };

  const toggleCommunity = (id: string) =>
    setSelectedCommunities(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  if (step === "enviado") {
    const totalSent = sendResults.reduce((s, r) => s + r.sent, 0);
    const totalFailed = sendResults.reduce((s, r) => s + r.failed, 0);
    return (
      <div className="max-w-lg mx-auto py-16">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#F0FDF4] flex items-center justify-center mx-auto mb-6">
            <CheckCheck className="w-10 h-10 text-[#15803D]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A3C6E]">¡Aviso enviado!</h2>
          <p className="text-[#475569] mt-2">
            <strong className="text-[#15803D]">{totalSent} mensajes enviados</strong>
            {totalFailed > 0 && <> · <strong className="text-red-500">{totalFailed} fallidos</strong></>}
          </p>
        </div>

        {sendResults.length > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm divide-y divide-[#F8FAFC] mb-8">
            {sendResults.map(r => (
              <div key={r.community} className="flex items-center justify-between px-5 py-4 text-sm">
                <span className="font-medium text-[#1E293B]">{r.community}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#15803D] font-medium">✓ {r.sent}</span>
                  {r.failed > 0 && <span className="text-red-500 font-medium">✗ {r.failed}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => { setStep("redactar"); setSelectedCommunities([]); setPdfFile(null); setCampaignTitle(""); setSendResults([]); }}
            className="px-5 py-2.5 bg-[#1A56DB] text-white font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors"
          >
            Nuevo aviso
          </button>
          <a href="/seguimiento" className="px-5 py-2.5 border border-[#E2E8F0] bg-white text-[#1E293B] font-semibold rounded-xl hover:bg-[#F8FAFC] transition-colors">
            Ver seguimiento →
          </a>
        </div>
      </div>
    );
  }

  const stepLabels = ["Redactar", "Destinatarios", "Previsualizar"];
  const stepKeys: Step[] = ["redactar", "seleccionar", "preview"];
  const currentIdx = stepKeys.indexOf(step);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Enviar aviso</h1>
        <p className="text-[#475569] mt-1">Redacta el mensaje y selecciona los destinatarios</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {stepKeys.map((s, i) => {
          const done = i < currentIdx;
          const active = s === step;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${active ? "bg-[#1A56DB] text-white" : done ? "bg-[#F0FDF4] text-[#15803D]" : "bg-white border border-[#E2E8F0] text-[#475569]"}`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white/20">
                  {done ? "✓" : i + 1}
                </span>
                {stepLabels[i]}
              </div>
              {i < 2 && <div className="w-6 h-0.5 bg-[#E2E8F0]" />}
            </div>
          );
        })}
      </div>

      {/* STEP 1 */}
      {step === "redactar" && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-[#1A3C6E] mb-2">Título del aviso</label>
            <input
              value={campaignTitle}
              onChange={e => setCampaignTitle(e.target.value)}
              placeholder="Ej: Convocatoria Junta Mayo 2026"
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A56DB] mb-4"
            />
            <label className="block text-sm font-semibold text-[#1A3C6E] mb-2">Mensaje</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {VARIABLES.map(v => (
                <button key={v} onClick={() => setMessage(m => m + v)}
                  className="px-2.5 py-1 bg-[#EFF6FF] text-[#1A56DB] text-xs font-medium rounded-lg hover:bg-[#1A56DB] hover:text-white transition-colors">
                  {v}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={9}
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none leading-relaxed"
            />
            <p className="text-xs text-[#475569] mt-2">{message.length} caracteres</p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-[#1A3C6E] mb-3">Adjunto PDF (opcional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => setPdfFile(e.target.files?.[0] ?? null)}
            />
            {pdfFile ? (
              <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3">
                <Paperclip className="w-4 h-4 text-[#1A56DB]" />
                <span className="text-sm text-[#1E293B] flex-1 truncate">{pdfFile.name}</span>
                <span className="text-xs text-[#475569]">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</span>
                <button onClick={() => { setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                  <X className="w-4 h-4 text-[#475569]" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-[#E2E8F0] rounded-xl text-sm text-[#475569] hover:border-[#1A56DB] hover:text-[#1A56DB] transition-colors w-full">
                <Paperclip className="w-4 h-4" /> Adjuntar PDF (máx. 16 MB)
              </button>
            )}
          </div>

          <button onClick={() => setStep("seleccionar")} disabled={!message.trim()}
            className="w-full py-3 bg-[#1A56DB] text-white font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors disabled:opacity-40">
            Siguiente: Seleccionar destinatarios →
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === "seleccionar" && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-[#1A3C6E] mb-4">Selecciona comunidades</label>
            {communities.length === 0 ? (
              <p className="text-sm text-[#475569]">Cargando comunidades…</p>
            ) : (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Buscar comunidad…"
                    value={communitySearch}
                    onChange={e => setCommunitySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
              <div className="space-y-3">
                {communities.filter(c => c.name.toLowerCase().includes(communitySearch.toLowerCase())).map(c => {
                  const selected = selectedCommunities.includes(c.id);
                  return (
                    <label key={c.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected ? "border-[#1A56DB] bg-[#EFF6FF]" : "border-[#E2E8F0] hover:border-[#1A56DB]/40"}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggleCommunity(c.id)} className="w-4 h-4 accent-[#1A56DB]" />
                      <div className="flex-1">
                        <p className="font-medium text-[#1E293B]">{c.name}</p>
                        <p className="text-sm text-[#475569]">{c.address}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${selected ? "text-[#1A56DB]" : "text-[#475569]"}`}>
                        <Users className="w-4 h-4" /> {c.owners.length}
                      </span>
                    </label>
                  );
                })}
              </div>
              {communitySearch && communities.filter(c => c.name.toLowerCase().includes(communitySearch.toLowerCase())).length === 0 && (
                <p className="text-sm text-[#94A3B8] text-center py-4">No hay comunidades con ese nombre.</p>
              )}
              </>
            )}
          </div>

          {selectedCommunities.length > 0 && (
            <div className="bg-[#F0FDF4] border border-[#15803D]/20 rounded-xl px-5 py-3 text-sm text-[#15803D] font-medium">
              Total: {totalRecipients} propietarios recibirán el aviso
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep("redactar")} className="flex-1 py-3 border border-[#E2E8F0] bg-white text-[#475569] font-semibold rounded-xl hover:bg-[#F8FAFC]">← Atrás</button>
            <button onClick={() => setStep("preview")} disabled={selectedCommunities.length === 0}
              className="flex-1 py-3 bg-[#1A56DB] text-white font-semibold rounded-xl hover:bg-[#1A3C6E] disabled:opacity-40">
              Previsualizar →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === "preview" && (() => {
        const firstComm = selectedComms[0];
        const firstOwner = firstComm?.owners[0];
        if (!firstComm || !firstOwner) return null;
        return (
          <div className="space-y-5">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-[#1A56DB]" />
                <h2 className="font-semibold text-[#1A3C6E]">Vista previa</h2>
                <span className="text-xs text-[#475569]">(ejemplo: {firstOwner.name}, {firstOwner.unit})</span>
              </div>
              <div className="bg-[#ECE5DD] rounded-2xl p-4">
                <div className="bg-[#128C7E] rounded-t-2xl px-4 py-2.5 -mx-4 -mt-4 mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">A</div>
                  <span className="text-white text-sm font-medium">Administración · {firstComm.name}</span>
                </div>
                <div className="bg-[#DCF8C6] rounded-2xl rounded-tl-none p-4 shadow-sm max-w-sm">
                  <p className="text-[#1E293B] text-sm whitespace-pre-wrap leading-relaxed">{preview(firstOwner, firstComm)}</p>
                  {!!pdfFile && (
                    <div className="mt-3 flex items-center gap-2 bg-white/60 rounded-lg p-2">
                      <Paperclip className="w-4 h-4 text-[#475569]" />
                      <span className="text-xs font-medium text-[#1E293B]">documento.pdf</span>
                    </div>
                  )}
                  <div className="flex justify-end items-center gap-1 mt-2">
                    <span className="text-xs text-[#475569]">ahora</span>
                    <span className="text-xs text-[#1A56DB] font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1A3C6E] mb-3">Resumen</h3>
              <div className="space-y-2 text-sm divide-y divide-[#F8FAFC]">
                {[
                  ["Título", campaignTitle || "(sin título)"],
                  ["Comunidades", selectedCommunities.length],
                  ["Propietarios", totalRecipients],
                  ["PDF adjunto", pdfFile ? pdfFile.name : "No"],
                  ["Tiempo estimado", `~${Math.ceil(totalRecipients * 0.2)} min`],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between py-2">
                    <span className="text-[#475569]">{k}</span>
                    <span className="font-medium text-[#1E293B]">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {blockedError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                <p className="text-red-700 text-sm font-medium">{blockedError}</p>
                <a href="/plan" className="mt-2 inline-block text-sm font-semibold text-red-700 underline">Actualizar plan →</a>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep("seleccionar")} className="flex-1 py-3 border border-[#E2E8F0] bg-white text-[#475569] font-semibold rounded-xl hover:bg-[#F8FAFC]">← Atrás</button>
              <button onClick={handleSend} disabled={sending}
                className="flex-1 py-3 bg-[#15803D] text-white font-semibold rounded-xl hover:bg-[#166534] disabled:opacity-60 flex items-center justify-center gap-2">
                {sending ? <><span className="animate-spin inline-block">⏳</span> Enviando por WhatsApp…</> : <><Send className="w-4 h-4" /> Enviar a {totalRecipients} propietarios</>}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
