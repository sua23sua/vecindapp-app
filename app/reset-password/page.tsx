"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Lock, AlertCircle, CheckCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("No se pudo actualizar la contraseña. El enlace puede haber expirado.");
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0F2447] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <MessageSquare className="w-8 h-8 text-[#1A56DB]" />
          <span className="text-2xl font-bold text-white">VecindApp</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-[#F0FDF4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCheck className="w-7 h-7 text-[#15803D]" />
              </div>
              <h1 className="text-xl font-bold text-[#1A3C6E] mb-2">Contraseña actualizada</h1>
              <p className="text-sm text-[#475569]">Redirigiendo al panel…</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#1A3C6E] mb-1">Nueva contraseña</h1>
              <p className="text-sm text-[#475569] mb-6">Elige una contraseña segura de al menos 8 caracteres.</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres" className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                    <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="Repite la contraseña" className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-[#1A56DB] text-white font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors disabled:opacity-60">
                  {loading ? "Guardando…" : "Guardar contraseña"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
