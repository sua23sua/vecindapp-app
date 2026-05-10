"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Phone, Plus, Upload, Pencil, Trash2, Home, X } from "lucide-react";

type Owner = {
  id: string;
  community_id: string;
  name: string;
  unit: string;
  phone: string;
  email: string | null;
  created_at: string;
};

export default function OwnersTable({
  communityId,
  initialOwners,
}: {
  communityId: string;
  initialOwners: Owner[];
}) {
  const [owners, setOwners] = useState<Owner[]>(initialOwners);
  const [showAdd, setShowAdd] = useState(false);
  const [newOwner, setNewOwner] = useState({ name: "", unit: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleAdd = async () => {
    if (!newOwner.name || !newOwner.unit || !newOwner.phone) return;
    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from("owners")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert({ community_id: communityId, name: newOwner.name, unit: newOwner.unit, phone: newOwner.phone, email: null } as any)
      .select()
      .single();

    if (error) {
      setError("Error al guardar. Inténtalo de nuevo.");
    } else {
      setOwners(prev => [...prev, data]);
      setNewOwner({ name: "", unit: "", phone: "" });
      setShowAdd(false);
    }
    setSaving(false);
  };

  const handleDelete = async (ownerId: string) => {
    const { error } = await supabase.from("owners").delete().eq("id", ownerId);
    if (!error) setOwners(prev => prev.filter(o => o.id !== ownerId));
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-[#1A56DB]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#1E293B]">{owners.length}</p>
            <p className="text-xs text-[#475569]">Propietarios</p>
          </div>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-[#F0FDF4] rounded-xl flex items-center justify-center">
            <Phone className="w-4 h-4 text-[#15803D]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#1E293B]">{owners.filter(o => o.phone).length}</p>
            <p className="text-xs text-[#475569]">Con teléfono</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#1A3C6E]">Propietarios</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] bg-white text-sm font-medium text-[#475569] rounded-xl hover:border-[#1A56DB] hover:text-[#1A56DB] transition-colors">
            <Upload className="w-4 h-4" /> Importar Excel
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1A56DB] text-white text-sm font-medium rounded-xl hover:bg-[#1A3C6E] transition-colors"
          >
            <Plus className="w-4 h-4" /> Añadir
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-[#EFF6FF] border border-[#1A56DB]/20 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-[#1A3C6E]">Nuevo propietario</p>
            <button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-[#475569]" /></button>
          </div>
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              placeholder="Nombre completo"
              value={newOwner.name}
              onChange={e => setNewOwner(p => ({ ...p, name: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
            <input
              placeholder="Piso / Unidad"
              value={newOwner.unit}
              onChange={e => setNewOwner(p => ({ ...p, unit: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
            <input
              placeholder="+34 612 345 678"
              value={newOwner.phone}
              onChange={e => setNewOwner(p => ({ ...p, phone: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="px-4 py-2 bg-[#1A56DB] text-white text-sm font-medium rounded-xl hover:bg-[#1A3C6E] transition-colors disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[#E2E8F0] bg-white text-sm font-medium text-[#475569] rounded-xl">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        {owners.length === 0 ? (
          <div className="text-center py-16 text-[#475569]">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aún no hay propietarios. Añade uno o importa desde Excel.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] text-xs text-[#475569] uppercase border-b border-[#E2E8F0]">
                <th className="px-5 py-3 text-left font-semibold">Propietario</th>
                <th className="px-5 py-3 text-left font-semibold">Piso</th>
                <th className="px-5 py-3 text-left font-semibold">Teléfono</th>
                <th className="px-5 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {owners.map(o => (
                <tr key={o.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-3 font-medium text-[#1E293B]">{o.name}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-[#475569]">
                      <Home className="w-3 h-3" /> {o.unit}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#475569]">{o.phone}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#475569] hover:text-[#1A56DB] transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#475569] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
