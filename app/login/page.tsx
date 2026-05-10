"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0F2447] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <MessageSquare className="w-8 h-8 text-[#1A56DB]" />
          <span className="text-2xl font-bold text-white">VecindApp</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-[#1A3C6E] mb-1">Accede a tu panel</h1>
          <p className="text-sm text-[#475569] mb-6">Gestiona tus comunidades desde aquí</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1A56DB] text-white font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors disabled:opacity-60"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-[#475569]">
            ¿No tienes cuenta?{" "}
            <a href="https://vecindapp-blond.vercel.app#registro" className="text-[#1A56DB] hover:underline font-medium">
              Solicitar acceso
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          © 2026 VecindApp · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
