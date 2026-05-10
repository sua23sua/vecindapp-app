"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { communities } from "@/lib/mock-data";
import {
  ArrowLeft, Users, Send, Upload, Plus,
  Pencil, Trash2, Phone, Home,
} from "lucide-react";

export default function ComunidadDetail() {
  const { id } = useParams<{ id: string }>();
  const community = communities.find(c => c.id === id);
  const [owners, setOwners] = useState(community?.owners ?? []);
  const [showAdd, setShowAdd] = useState(false);
  const [newOwner, setNewOwner] = useState({ name: "", unit: "", phone: "" });

  if (!community) {
    return (
      <div className="text-center py-20">
        <p className="text-[#475569]">Comunidad no encontrada.</p>
        <Link href="/comunidades" className="text-[#1A56DB] hover:underline text-sm mt-2 inline-block">← Volver</Link>
      </div>
    );
  }

  const handleAdd = () => {
    if (!newOwner.name || !newOwner.unit || !newOwner.phone) return;
    setOwners(prev => [...prev, { id: `new-${Date.now()}`, ...newOwner }]);
    setNewOwner({ name: "", unit: "", phone: "" });
    setShowAdd(false);
  };

  const handleDelete = (ownerId: string) => {
    setOwners(prev => prev.filter(o => o.id !== ownerId));
  };

  return (
    <div>
      {/* Back + Header */}
      <div className="mb-6">
        <Link href="/comunidades" className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#1A56DB] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Volver a comunidades
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1A3C6E]">{community.name}</h1>
            <p className="text-[#475569] mt-1">{community.address}</p>
          </div>
          <Link
            href="/enviar"
            className="flex items-center gap-2 px-4 py-2 bg-[#1A56DB] text-white text-sm font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors shadow-sm flex-shrink-0"
          >
            <Send className="w-4 h-4" /> Enviar aviso
          </Link>
        </div>
      </div>

      {/* Stats row */}
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
            <p className="text-xl font-bold text-[#1E293B]">
              {owners.filter(o => o.phone).length}
            </p>
            <p className="text-xs text-[#475569]">Con WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Import + Add */}
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
          <p className="font-medium text-[#1A3C6E] mb-3">Nuevo propietario</p>
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
              placeholder="Teléfono"
              value={newOwner.phone}
              onChange={e => setNewOwner(p => ({ ...p, phone: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} className="px-4 py-2 bg-[#1A56DB] text-white text-sm font-medium rounded-xl hover:bg-[#1A3C6E] transition-colors">
              Guardar
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-[#E2E8F0] bg-white text-sm font-medium text-[#475569] rounded-xl hover:bg-[#F8FAFC] transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Owners table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
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
      </div>
    </div>
  );
}
