import { createClient } from "@/lib/supabase/server";
import AjustesClient from "./AjustesClient";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profileRaw }, { data: subRaw }, { data: invitesRaw }] = await Promise.all([
    supabase.from("admin_profiles").select("*").eq("user_id", user!.id).single(),
    supabase.from("subscriptions").select("plan, tier, status").eq("user_id", user!.id).single(),
    supabase.from("team_invites").select("id, email, status, created_at").eq("invited_by", user!.id).order("created_at", { ascending: false }),
  ]);

  const profile = profileRaw as {
    nombre_legal: string | null; cif: string | null; direccion: string | null;
    codigo_postal: string | null; ciudad: string | null; pais: string | null; logo_url: string | null;
  } | null;

  const sub = subRaw as { plan: string; tier: string; status: string } | null;
  const invites = (invitesRaw ?? []) as { id: string; email: string; status: string; created_at: string }[];
  const isPlus = sub?.tier === "plus" && sub?.status === "active";

  return (
    <AjustesClient
      userId={user!.id}
      userEmail={user!.email ?? ""}
      profile={profile}
      isPlus={isPlus}
      invites={invites}
      planName={sub ? `${sub.plan} ${sub.tier}` : "Sin plan"}
    />
  );
}
