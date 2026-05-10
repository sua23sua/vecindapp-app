"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NuevaComunidad() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sesión expirada"); setLoading(false); return; }

    const { data, error: err } = await supabase
      .from("communities")
      .insert({ name: name.trim(), address: address.trim() || null, user_id: user.id } as any)
      .select("id")
      .single();

    if (err) { setError(err.message); setLoading(false); return; }
    router.push(`/comunidades/${(data as any).id}`);
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/comunidades" className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#1A56DB] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Volver a comunidades
        </Link>
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Nueva comunidad</h1>
        <p className="text-[#475569] mt-1">Añade una nueva finca o comunidad de propietarios.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center mb-6">
          <Building2 className="w-6 h-6 text-[#1A56DB]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
              Nombre de la comunidad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Comunidad Calle Mayor 12"
              required
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
              Dirección <span className="text-[#94A3B8]">(opcional)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Ej: Calle Mayor 12, Oviedo"
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href="/comunidades"
              className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-[#1A56DB] text-white rounded-xl text-sm font-semibold hover:bg-[#1A3C6E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Crear comunidad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
