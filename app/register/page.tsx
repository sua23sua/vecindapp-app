"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Lock, Mail, User, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nombre }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Error al crear la cuenta.");
      setLoading(false);
      return;
    }

    router.push("/verify-email");
  };

  return (
    <div className="min-h-screen bg-[#0F2447] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <MessageSquare className="w-8 h-8 text-[#1A56DB]" />
          <span className="text-2xl font-bold text-white">VecindApp</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-[#1A3C6E] mb-1">Crea tu cuenta</h1>
          <p className="text-sm text-[#475569] mb-6">Empieza a gestionar tus comunidades</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Tu nombre" className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com" className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">Contraseña</label>
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
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-[#475569]">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#1A56DB] hover:underline font-medium">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
