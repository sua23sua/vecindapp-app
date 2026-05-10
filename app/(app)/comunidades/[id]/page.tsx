import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import OwnersTable from "./OwnersTable";

export const dynamic = "force-dynamic";

export default async function ComunidadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: community }, { data: owners }] = await Promise.all([
    supabase.from("communities").select("*").eq("id", id).single(),
    supabase.from("owners").select("*").eq("community_id", id).order("unit"),
  ]);

  if (!community) notFound();

  return (
    <div>
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
            href={`/enviar?community=${id}`}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A56DB] text-white text-sm font-semibold rounded-xl hover:bg-[#1A3C6E] transition-colors shadow-sm flex-shrink-0"
          >
            <Send className="w-4 h-4" /> Enviar aviso
          </Link>
        </div>
      </div>

      <OwnersTable communityId={id} initialOwners={owners ?? []} />
    </div>
  );
}
