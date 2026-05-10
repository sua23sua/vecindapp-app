"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Mail, AlertCircle, CheckCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      setError("No se pudo enviar el correo. Comprueba el email e inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F2447] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <MessageSquare className="w-8 h-8 text-[#1A56DB]" />
          <span className="text-2xl font-bold text-white">VecindApp</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-[#F0FDF4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCheck className="w-7 h-7 text-[#15803D]" />
              </div>
              <h1 className="text-xl font-bold text-[#1A3C6E] mb-2">Correo enviado</h1>
              <p className="text-sm text-[#475569] mb-6">
                Revisa tu bandeja de entrada y sigue el enlace para restablecer tu contraseña.
              </p>
              <Link href="/login" className="text-sm text-[#1A56DB] hover:underline font-medium">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#1A3C6E] mb-1">Restablecer contraseña</h1>
              <p className="text-sm text-[#475569] mb-6">Introduce tu email y te enviamos un enlace para crear una nueva contraseña.</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com" className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-[#1A56DB] text-white font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors disabled:opacity-60">
                  {loading ? "Enviando…" : "Enviar enlace"}
                </button>
              </form>

              <p className="mt-6 text-xs text-center text-[#475569]">
                <Link href="/login" className="text-[#1A56DB] hover:underline font-medium">← Volver al inicio de sesión</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
