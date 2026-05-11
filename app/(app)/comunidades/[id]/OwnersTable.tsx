"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Phone, Plus, Upload, Pencil, Trash2, Home, X, AlertCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editOwner, setEditOwner] = useState({ name: "", unit: "", phone: "" });
  const [importRows, setImportRows] = useState<{ name: string; unit: string; phone: string }[] | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const downloadTemplate = async () => {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = "VecindApp";
    const ws = wb.addWorksheet("Propietarios");

    ws.columns = [
      { key: "nombre",   width: 32 },
      { key: "piso",     width: 12 },
      { key: "telefono", width: 18 },
    ];

    // Native Excel table — format extends automatically as rows are added
    ws.addTable({
      name: "Propietarios",
      ref: "A1",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium9", // dark navy, closest to #1A3C6E
        showRowStripes: true,
      },
      columns: [
        { name: "nombre",   filterButton: true },
        { name: "piso",     filterButton: true },
        { name: "telefono", filterButton: true },
      ],
      rows: [
        ["María García López", "1A", "612345678"],
        ["Juan Martínez Ruiz", "2B", "698765432"],
        ["Ana Torres Sánchez", "3C", "654321987"],
      ],
    });

    // Header row height
    ws.getRow(1).height = 22;

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_propietarios.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = new Uint8Array(ev.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
      const normalize = (row: Record<string, string>, ...keys: string[]) => {
        for (const k of keys) {
          const val = row[k] ?? row[k.toLowerCase()] ?? row[k.toUpperCase()] ?? "";
          if (val) return String(val).trim();
        }
        return "";
      };
      const parsed = json.map(row => ({
        name: normalize(row, "nombre", "name", "Nombre", "propietario", "Propietario"),
        unit: normalize(row, "piso", "vivienda", "unidad", "unit", "Piso", "Vivienda"),
        phone: normalize(row, "telefono", "teléfono", "phone", "movil", "móvil", "Teléfono"),
      })).filter(r => r.name && r.phone);
      setImportRows(parsed);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleImportConfirm = async () => {
    if (!importRows?.length) return;
    setImporting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setImporting(false); return; }
    const inserts = importRows.map(r => ({
      community_id: communityId,
      name: r.name,
      unit: r.unit,
      phone: r.phone,
      email: null,
    }));
    const { data } = await supabase.from("owners").insert(inserts as any).select();
    if (data) setOwners(prev => [...prev, ...(data as Owner[])]);
    setImportRows(null);
    setImporting(false);
  };

  const startEdit = (o: Owner) => {
    setEditingId(o.id);
    setEditOwner({ name: o.name, unit: o.unit, phone: o.phone });
  };

  const handleEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase
      .from("owners")
      .update({ name: editOwner.name, unit: editOwner.unit, phone: editOwner.phone } as any)
      .eq("id", editingId);
    if (!error) {
      setOwners(prev => prev.map(o => o.id === editingId ? { ...o, ...editOwner } : o));
      setEditingId(null);
    }
    setSaving(false);
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

      {/* Import preview modal */}
      {importRows && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div>
                <p className="font-semibold text-[#1A3C6E]">Previsualización de importación</p>
                <p className="text-sm text-[#475569]">{importRows.length} propietarios encontrados</p>
              </div>
              <button onClick={() => setImportRows(null)}><X className="w-5 h-5 text-[#475569]" /></button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] sticky top-0">
                  <tr className="text-xs text-[#475569] uppercase">
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Piso</th>
                    <th className="px-4 py-2 text-left">Teléfono</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {importRows.map((r, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 font-medium text-[#1E293B]">{r.name}</td>
                      <td className="px-4 py-2 text-[#475569]">{r.unit || "—"}</td>
                      <td className="px-4 py-2 text-[#475569]">{r.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {importRows.length === 0 && (
              <div className="px-6 py-8 text-center text-[#475569]">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No se detectaron filas válidas. Asegúrate de que el Excel tiene columnas: <strong>nombre</strong>, <strong>piso</strong>, <strong>teléfono</strong>.</p>
              </div>
            )}
            <div className="flex gap-3 px-6 py-4 border-t border-[#E2E8F0]">
              <button onClick={() => setImportRows(null)} className="flex-1 py-2 border border-[#E2E8F0] text-sm font-medium text-[#475569] rounded-xl hover:bg-[#F8FAFC]">Cancelar</button>
              <button
                onClick={handleImportConfirm}
                disabled={importing || importRows.length === 0}
                className="flex-1 py-2 bg-[#1A56DB] text-white text-sm font-medium rounded-xl hover:bg-[#1A3C6E] disabled:opacity-60"
              >
                {importing ? "Importando…" : `Importar ${importRows.length} propietarios`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#1A3C6E]">Propietarios</h2>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
          <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] bg-white text-sm font-medium text-[#475569] rounded-xl hover:border-[#1A56DB] hover:text-[#1A56DB] transition-colors">
            <Download className="w-4 h-4" /> Plantilla
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] bg-white text-sm font-medium text-[#475569] rounded-xl hover:border-[#1A56DB] hover:text-[#1A56DB] transition-colors">
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
                  {editingId === o.id ? (
                    <>
                      <td className="px-3 py-2"><input value={editOwner.name} onChange={e => setEditOwner(p => ({ ...p, name: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-[#1A56DB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" /></td>
                      <td className="px-3 py-2"><input value={editOwner.unit} onChange={e => setEditOwner(p => ({ ...p, unit: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-[#1A56DB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" /></td>
                      <td className="px-3 py-2"><input value={editOwner.phone} onChange={e => setEditOwner(p => ({ ...p, phone: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-[#1A56DB] text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" /></td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={handleEdit} disabled={saving} className="px-3 py-1.5 bg-[#1A56DB] text-white text-xs font-medium rounded-lg hover:bg-[#1A3C6E] disabled:opacity-60">
                            {saving ? "…" : "Guardar"}
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-[#F8FAFC] text-[#475569]"><X className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 font-medium text-[#1E293B]">{o.name}</td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1 text-[#475569]">
                          <Home className="w-3 h-3" /> {o.unit}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#475569]">{o.phone}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => startEdit(o)} className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#475569] hover:text-[#1A56DB] transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(o.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#475569] hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
