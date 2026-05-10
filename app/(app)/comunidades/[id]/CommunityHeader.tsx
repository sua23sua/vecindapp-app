"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Pencil, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  id: string;
  name: string;
  address: string | null;
};

export default function CommunityHeader({ id, name, address }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editAddress, setEditAddress] = useState(address ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("communities")
      .update({ name: editName.trim(), address: editAddress.trim() || null } as any)
      .eq("id", id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  return (
    <div className="mb-6">
      <Link href="/comunidades" className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#1A56DB] transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Volver a comunidades
      </Link>

      {editing ? (
        <div className="bg-white border border-[#1A56DB]/30 rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#1A3C6E] mb-3">Editar comunidad</p>
          <div className="space-y-3">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Nombre de la comunidad"
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
            <input
              value={editAddress}
              onChange={e => setEditAddress(e.target.value)}
              placeholder="Dirección (opcional)"
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving || !editName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1A56DB] text-white text-sm font-medium rounded-xl hover:bg-[#1A3C6E] transition-colors disabled:opacity-60"
            >
              <Check className="w-4 h-4" /> {saving ? "Guardando…" : "Guardar"}
            </button>
            <button
              onClick={() => { setEditing(false); setEditName(name); setEditAddress(address ?? ""); }}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#E2E8F0] text-sm font-medium text-[#475569] rounded-xl hover:bg-[#F8FAFC] transition-colors"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1A3C6E]">{name}</h1>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#475569] hover:text-[#1A56DB] transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[#475569] mt-1">{address}</p>
          </div>
          <Link
            href={`/enviar?community=${id}`}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A56DB] text-white text-sm font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors shadow-sm flex-shrink-0"
          >
            <Send className="w-4 h-4" /> Enviar aviso
          </Link>
        </div>
      )}
    </div>
  );
}
