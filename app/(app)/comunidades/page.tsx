import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ComunidadesSearch from "./ComunidadesSearch";

export const dynamic = "force-dynamic";

type Community = {
  id: string;
  name: string;
  address: string | null;
  ownerCount: number;
};

export default async function ComunidadesPage() {
  const supabase = await createClient();
  const { data: raw } = await supabase
    .from("communities")
    .select("id, name, address, owners(count)")
    .order("created_at", { ascending: false });

  const communities: Community[] = (raw ?? []).map((c: Record<string, unknown>) => ({
    id: c.id as string,
    name: c.name as string,
    address: c.address as string | null,
    ownerCount: (c.owners as { count: number }[])[0]?.count ?? 0,
  }));

  const totalOwners = communities.reduce((s, c) => s + c.ownerCount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C6E]">Comunidades</h1>
          <p className="text-[#475569] mt-1">
            {communities.length} comunidades · {totalOwners} propietarios
          </p>
        </div>
        <Link
          href="/comunidades/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-[#1A56DB] text-white text-sm font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nueva comunidad
        </Link>
      </div>

      <ComunidadesSearch communities={communities} />
    </div>
  );
}
