"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Lock, Users, Save, Send, Trash2, AlertCircle, CheckCheck, Zap } from "lucide-react";
import Link from "next/link";

type Profile = {
  nombre_legal: string | null; cif: string | null; direccion: string | null;
  codigo_postal: string | null; ciudad: string | null; pais: string | null; logo_url: string | null;
} | null;

type Invite = { id: string; email: string; status: string; created_at: string };

type Props = {
  userId: string;
  userEmail: string;
  profile: Profile;
  isPlus: boolean;
  invites: Invite[];
  planName: string;
};

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1E293B] mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
    </div>
  );
}

function Toast({ msg, type }: { msg: string; type: "ok" | "err" }) {
  return (
    <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 mb-4 ${type === "ok" ? "bg-[#F0FDF4] border border-[#15803D]/20 text-[#15803D]" : "bg-red-50 border border-red-200 text-red-600"}`}>
      {type === "ok" ? <CheckCheck className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {msg}
    </div>
  );
}

export default function AjustesClient({ userId, userEmail, profile, isPlus, invites: initialInvites, planName }: Props) {
  const [tab, setTab] = useState<"perfil" | "seguridad" | "equipo">("perfil");
  const supabase = createClient();

  // --- Perfil ---
  const [p, setP] = useState({
    nombre_legal: profile?.nombre_legal ?? "",
    cif: profile?.cif ?? "",
    direccion: profile?.direccion ?? "",
    codigo_postal: profile?.codigo_postal ?? "",
    ciudad: profile?.ciudad ?? "",
    pais: profile?.pais ?? "España",
  });
  const [profileMsg, setProfileMsg] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase.from("admin_profiles").upsert(
      { user_id: userId, ...p, updated_at: new Date().toISOString() } as any,
      { onConflict: "user_id" }
    );
    setProfileMsg(error ? { msg: "Error al guardar.", type: "err" } : { msg: "Perfil guardado correctamente.", type: "ok" });
    setSavingProfile(false);
    setTimeout(() => setProfileMsg(null), 3000);
  };

  // --- Seguridad ---
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [savingPwd, setSavingPwd] = useState(false);

  const savePwd = async () => {
    if (newPwd !== confirmPwd) { setPwdMsg({ msg: "Las contraseñas no coinciden.", type: "err" }); return; }
    if (newPwd.length < 8) { setPwdMsg({ msg: "Mínimo 8 caracteres.", type: "err" }); return; }
    setSavingPwd(true);

    // Re-auth first
    const { error: authErr } = await supabase.auth.signInWithPassword({ email: userEmail, password: currentPwd });
    if (authErr) { setPwdMsg({ msg: "Contraseña actual incorrecta.", type: "err" }); setSavingPwd(false); return; }

    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setPwdMsg(error ? { msg: "Error al cambiar la contraseña.", type: "err" } : { msg: "Contraseña actualizada.", type: "ok" });
    if (!error) { setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); }
    setSavingPwd(false);
    setTimeout(() => setPwdMsg(null), 3000);
  };

  // --- Equipo ---
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [sendingInvite, setSendingInvite] = useState(false);

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail.trim() }),
    });
    const json = await res.json();
    if (json.error) {
      setInviteMsg({ msg: json.error, type: "err" });
    } else {
      setInvites(prev => [json.invite, ...prev]);
      setInviteEmail("");
      setInviteMsg({ msg: "Invitación enviada correctamente.", type: "ok" });
    }
    setSendingInvite(false);
    setTimeout(() => setInviteMsg(null), 3000);
  };

  const deleteInvite = async (id: string) => {
    await supabase.from("team_invites").delete().eq("id", id);
    setInvites(prev => prev.filter(i => i.id !== id));
  };

  const tabs = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "seguridad", label: "Seguridad", icon: Lock },
    { id: "equipo", label: "Equipo", icon: Users },
  ] as const;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Ajustes</h1>
        <p className="text-[#475569] mt-1">Gestiona tu cuenta y equipo</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 flex-1 justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? "bg-white text-[#1A3C6E] shadow-sm" : "text-[#475569] hover:text-[#1E293B]"}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* PERFIL */}
      {tab === "perfil" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#1A3C6E] mb-2">Datos de facturación</h2>
          {profileMsg && <Toast {...profileMsg} />}
          <Field label="Nombre legal / Razón social" value={p.nombre_legal} onChange={v => setP(x => ({ ...x, nombre_legal: v }))} placeholder="Gestiones García S.L." />
          <Field label="CIF / NIF" value={p.cif} onChange={v => setP(x => ({ ...x, cif: v }))} placeholder="B12345678" />
          <Field label="Dirección" value={p.direccion} onChange={v => setP(x => ({ ...x, direccion: v }))} placeholder="Calle Mayor 1, 2ºA" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Código postal" value={p.codigo_postal} onChange={v => setP(x => ({ ...x, codigo_postal: v }))} placeholder="33001" />
            <Field label="Ciudad" value={p.ciudad} onChange={v => setP(x => ({ ...x, ciudad: v }))} placeholder="Oviedo" />
          </div>
          <Field label="País" value={p.pais} onChange={v => setP(x => ({ ...x, pais: v }))} placeholder="España" />
          <button onClick={saveProfile} disabled={savingProfile}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A56DB] text-white text-sm font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" />{savingProfile ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      )}

      {/* SEGURIDAD */}
      {tab === "seguridad" && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#1A3C6E] mb-2">Cambiar contraseña</h2>
          {pwdMsg && <Toast {...pwdMsg} />}
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Contraseña actual</label>
            <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Nueva contraseña</label>
            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Mínimo 8 caracteres"
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Confirmar nueva contraseña</label>
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Repite la contraseña"
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
          </div>
          <button onClick={savePwd} disabled={savingPwd || !currentPwd || !newPwd || !confirmPwd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A56DB] text-white text-sm font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors disabled:opacity-60">
            <Lock className="w-4 h-4" />{savingPwd ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </div>
      )}

      {/* EQUIPO */}
      {tab === "equipo" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-[#1A3C6E]">Añadir miembro al equipo</h2>
                <p className="text-sm text-[#475569] mt-0.5">Plan actual: <span className="font-medium capitalize">{planName}</span></p>
              </div>
            </div>

            {!isPlus ? (
              <div className="bg-[#FFF7ED] border border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800 text-sm">Función exclusiva del plan Plus</p>
                    <p className="text-orange-700 text-sm mt-1">Añadir miembros al equipo requiere un plan Plus. Actualiza tu plan para desbloquear esta funcionalidad.</p>
                    <Link href="/plan" className="inline-block mt-3 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                      Ver planes →
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {inviteMsg && <Toast {...inviteMsg} />}
                <div className="flex gap-2">
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder="email@empresa.com" onKeyDown={e => e.key === "Enter" && sendInvite()}
                    className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
                  <button onClick={sendInvite} disabled={sendingInvite || !inviteEmail.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1A56DB] text-white text-sm font-semibold rounded-xl hover:bg-[#1A3C6E] disabled:opacity-60 transition-colors">
                    <Send className="w-4 h-4" />{sendingInvite ? "…" : "Invitar"}
                  </button>
                </div>
              </>
            )}
          </div>

          {invites.length > 0 && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E2E8F0]">
                <h3 className="font-semibold text-[#1A3C6E]">Invitaciones enviadas</h3>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {invites.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between px-6 py-3 text-sm">
                    <div>
                      <p className="font-medium text-[#1E293B]">{inv.email}</p>
                      <p className="text-xs text-[#475569] mt-0.5">{new Date(inv.created_at).toLocaleDateString("es-ES")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${inv.status === "accepted" ? "bg-[#F0FDF4] text-[#15803D]" : "bg-[#F8FAFC] text-[#475569]"}`}>
                        {inv.status === "accepted" ? "Aceptada" : "Pendiente"}
                      </span>
                      <button onClick={() => deleteInvite(inv.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#475569] hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
