"use client";

import { useState } from "react";
import { communities } from "@/lib/mock-data";
import { Send, Paperclip, Eye, Users, CheckCheck, X } from "lucide-react";

const VARIABLES = ["{{nombre}}", "{{vivienda}}", "{{comunidad}}", "{{fecha_junta}}"];

type Step = "redactar" | "seleccionar" | "preview" | "enviado";

export default function EnviarPage() {
  const [step, setStep] = useState<Step>("redactar");
  const [message, setMessage] = useState(
    "Estimado/a {{nombre}}, propietario/a de {{vivienda}}:\n\nLe convocamos a la Junta General Ordinaria de la comunidad {{comunidad}} el {{fecha_junta}}.\n\nRogamos confirme asistencia respondiendo a este mensaje.\n\nAtentamente,\nLa Administración"
  );
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [hasPdf, setHasPdf] = useState(false);
  const [sending, setSending] = useState(false);

  const totalRecipients = communities
    .filter(c => selectedCommunities.includes(c.id))
    .reduce((s, c) => s + c.owners.length, 0);

  const preview = (owner: { name: string; unit: string }, comm: { name: string }) =>
    message
      .replace(/{{nombre}}/g, owner.name)
      .replace(/{{vivienda}}/g, owner.unit)
      .replace(/{{comunidad}}/g, comm.name)
      .replace(/{{fecha_junta}}/g, "28 de mayo a las 18:00h");

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStep("enviado");
    }, 2000);
  };

  const toggleCommunity = (id: string) =>
    setSelectedCommunities(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  if (step === "enviado") {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-full bg-[#F0FDF4] flex items-center justify-center mx-auto mb-6">
          <CheckCheck className="w-10 h-10 text-[#15803D]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A3C6E]">¡Aviso enviado!</h2>
        <p className="text-[#475569] mt-3">
          Se está enviando a <strong>{totalRecipients} propietarios</strong>. El sistema procesa los envíos uno a uno para evitar bloqueos. Puedes seguir el estado en tiempo real.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => { setStep("redactar"); setSelectedCommunities([]); setHasPdf(false); }}
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Enviar aviso</h1>
        <p className="text-[#475569] mt-1">Redacta el mensaje y selecciona los destinatarios</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(["redactar", "seleccionar", "preview"] as Step[]).map((s, i) => {
          const labels = ["Redactar", "Destinatarios", "Previsualizar"];
          const steps: Step[] = ["redactar", "seleccionar", "preview"];
          const idx = steps.indexOf(step);
          const done = i < idx;
          const active = s === step;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                active ? "bg-[#1A56DB] text-white" : done ? "bg-[#F0FDF4] text-[#15803D]" : "bg-white border border-[#E2E8F0] text-[#475569]"
              }`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-white/20">
                  {done ? "✓" : i + 1}
                </span>
                {labels[i]}
              </div>
              {i < 2 && <div className="w-6 h-0.5 bg-[#E2E8F0]" />}
            </div>
          );
        })}
      </div>

      {/* STEP 1: Redactar */}
      {step === "redactar" && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-[#1A3C6E] mb-2">Mensaje</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {VARIABLES.map(v => (
                <button
                  key={v}
                  onClick={() => setMessage(m => m + v)}
                  className="px-2.5 py-1 bg-[#EFF6FF] text-[#1A56DB] text-xs font-medium rounded-lg hover:bg-[#1A56DB] hover:text-white transition-colors"
                >
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

          {/* PDF adjunto */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-[#1A3C6E] mb-3">Adjunto PDF (opcional)</label>
            {hasPdf ? (
              <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3">
                <Paperclip className="w-4 h-4 text-[#1A56DB]" />
                <span className="text-sm text-[#1E293B] flex-1">Convocatoria_Junta_Mayo.pdf</span>
                <button onClick={() => setHasPdf(false)} className="text-[#475569] hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setHasPdf(true)}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-[#E2E8F0] rounded-xl text-sm text-[#475569] hover:border-[#1A56DB] hover:text-[#1A56DB] transition-colors w-full"
              >
                <Paperclip className="w-4 h-4" /> Adjuntar PDF (máx. 16 MB)
              </button>
            )}
          </div>

          <button
            onClick={() => setStep("seleccionar")}
            disabled={!message.trim()}
            className="w-full py-3 bg-[#1A56DB] text-white font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente: Seleccionar destinatarios →
          </button>
        </div>
      )}

      {/* STEP 2: Destinatarios */}
      {step === "seleccionar" && (
        <div className="space-y-5">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-[#1A3C6E] mb-4">Selecciona comunidades</label>
            <div className="space-y-3">
              {communities.map(c => {
                const selected = selectedCommunities.includes(c.id);
                return (
                  <label key={c.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selected ? "border-[#1A56DB] bg-[#EFF6FF]" : "border-[#E2E8F0] hover:border-[#1A56DB]/40"
                  }`}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleCommunity(c.id)}
                      className="w-4 h-4 accent-[#1A56DB]"
                    />
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
          </div>

          {selectedCommunities.length > 0 && (
            <div className="bg-[#F0FDF4] border border-[#15803D]/20 rounded-xl px-5 py-3 text-sm text-[#15803D] font-medium">
              Total: {totalRecipients} propietarios recibirán el aviso
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep("redactar")} className="flex-1 py-3 border border-[#E2E8F0] bg-white text-[#475569] font-semibold rounded-xl hover:bg-[#F8FAFC] transition-colors">
              ← Atrás
            </button>
            <button
              onClick={() => setStep("preview")}
              disabled={selectedCommunities.length === 0}
              className="flex-1 py-3 bg-[#1A56DB] text-white font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previsualizar →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preview */}
      {step === "preview" && (() => {
        const firstComm = communities.find(c => selectedCommunities.includes(c.id))!;
        const firstOwner = firstComm.owners[0];
        return (
          <div className="space-y-5">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-[#1A56DB]" />
                <h2 className="font-semibold text-[#1A3C6E]">Vista previa del mensaje</h2>
                <span className="text-xs text-[#475569]">(ejemplo: {firstOwner.name}, {firstOwner.unit})</span>
              </div>

              {/* WhatsApp bubble */}
              <div className="bg-[#ECE5DD] rounded-2xl p-4">
                <div className="bg-[#128C7E] rounded-t-2xl px-4 py-2.5 -mx-4 -mt-4 mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">A</div>
                  <span className="text-white text-sm font-medium">Administración · {firstComm.name}</span>
                </div>
                <div className="bg-[#DCF8C6] rounded-2xl rounded-tl-none p-4 shadow-sm max-w-sm">
                  <p className="text-[#1E293B] text-sm whitespace-pre-wrap leading-relaxed">
                    {preview(firstOwner, firstComm)}
                  </p>
                  {hasPdf && (
                    <div className="mt-3 flex items-center gap-2 bg-white/60 rounded-lg p-2">
                      <Paperclip className="w-4 h-4 text-[#475569]" />
                      <span className="text-xs font-medium text-[#1E293B]">Convocatoria_Junta_Mayo.pdf</span>
                    </div>
                  )}
                  <div className="flex justify-end items-center gap-1 mt-2">
                    <span className="text-xs text-[#475569]">10:34</span>
                    <span className="text-xs text-[#1A56DB] font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1A3C6E] mb-3">Resumen del envío</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-[#F8FAFC]">
                  <span className="text-[#475569]">Comunidades</span>
                  <span className="font-medium text-[#1E293B]">{selectedCommunities.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F8FAFC]">
                  <span className="text-[#475569]">Propietarios</span>
                  <span className="font-medium text-[#1E293B]">{totalRecipients}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F8FAFC]">
                  <span className="text-[#475569]">PDF adjunto</span>
                  <span className="font-medium text-[#1E293B]">{hasPdf ? "Sí" : "No"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#475569]">Tiempo estimado</span>
                  <span className="font-medium text-[#1E293B]">~{Math.ceil(totalRecipients * 0.2)} min</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("seleccionar")} className="flex-1 py-3 border border-[#E2E8F0] bg-white text-[#475569] font-semibold rounded-xl hover:bg-[#F8FAFC] transition-colors">
                ← Atrás
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 py-3 bg-[#15803D] text-white font-semibold rounded-xl hover:bg-[#166534] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <><span className="animate-spin">⏳</span> Enviando…</>
                ) : (
                  <><Send className="w-4 h-4" /> Enviar a {totalRecipients} propietarios</>
                )}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
