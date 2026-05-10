"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Users, Plus, Search, ChevronRight } from "lucide-react";
import { communities } from "@/lib/mock-data";

export default function ComunidadesPage() {
  const [search, setSearch] = useState("");

  const filtered = communities.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C6E]">Comunidades</h1>
          <p className="text-[#475569] mt-1">{communities.length} comunidades · {communities.reduce((s, c) => s + c.owners.length, 0)} propietarios</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1A56DB] text-white text-sm font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nueva comunidad
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
        <input
          type="text"
          placeholder="Buscar comunidad..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(c => (
          <Link
            key={c.id}
            href={`/comunidades/${c.id}`}
            className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#1A56DB] hover:shadow-sm transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-[#1A56DB]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1E293B] group-hover:text-[#1A56DB] transition-colors">{c.name}</p>
              <p className="text-sm text-[#475569] mt-0.5 truncate">{c.address}</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#475569] flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{c.owners.length} propietarios</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#475569] group-hover:text-[#1A56DB] transition-colors" />
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#475569]">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No se encontraron comunidades</p>
          </div>
        )}
      </div>
    </div>
  );
}
