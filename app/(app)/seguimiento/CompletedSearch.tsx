"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

export default function CompletedSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  const apply = (newQ: string, newFrom: string, newTo: string) => {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newFrom) params.set("from", newFrom);
    if (newTo) params.set("to", newTo);
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFilters = q || from || to;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Buscar por comunidad…"
          value={q}
          onChange={e => { setQ(e.target.value); apply(e.target.value, from, to); }}
          className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
        />
      </div>
      <input
        type="date"
        value={from}
        onChange={e => { setFrom(e.target.value); apply(q, e.target.value, to); }}
        className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] text-[#475569]"
      />
      <span className="text-xs text-[#94A3B8]">—</span>
      <input
        type="date"
        value={to}
        onChange={e => { setTo(e.target.value); apply(q, from, e.target.value); }}
        className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] text-[#475569]"
      />
      {hasFilters && (
        <button
          onClick={() => { setQ(""); setFrom(""); setTo(""); apply("", "", ""); }}
          className="flex items-center gap-1 px-3 py-2 text-sm text-[#475569] hover:text-[#1E293B] border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC]"
        >
          <X className="w-3.5 h-3.5" /> Limpiar
        </button>
      )}
    </div>
  );
}
