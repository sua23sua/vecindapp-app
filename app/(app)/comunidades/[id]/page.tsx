import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CommunityHeader from "./CommunityHeader";
import OwnersTable from "./OwnersTable";

export const dynamic = "force-dynamic";

type Community = { id: string; name: string; address: string | null };
type Owner = { id: string; community_id: string; name: string; unit: string; phone: string; email: string | null; created_at: string };

export default async function ComunidadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: communityRaw }, { data: ownersRaw }] = await Promise.all([
    supabase.from("communities").select("id, name, address").eq("id", id).single(),
    supabase.from("owners").select("*").eq("community_id", id).order("unit"),
  ]);

  const community = communityRaw as Community | null;
  const owners = (ownersRaw ?? []) as Owner[];

  if (!community) notFound();

  return (
    <div>
      <CommunityHeader id={community.id} name={community.name} address={community.address} />
      <OwnersTable communityId={id} initialOwners={owners} />
    </div>
  );
}
