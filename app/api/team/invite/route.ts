import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendTeamInvite } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier, status")
    .eq("user_id", user.id)
    .single();

  const isPlus = (sub as any)?.tier === "plus" && (sub as any)?.status === "active";
  if (!isPlus) return NextResponse.json({ error: "Requiere plan Plus" }, { status: 403 });

  const { email } = await req.json() as { email: string };
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  const { data: invite, error } = await supabase
    .from("team_invites")
    .insert({ invited_by: user.id, email } as any)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Este email ya fue invitado" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const registerUrl = `${process.env.NEXT_PUBLIC_APP_URL}/register`;
  const inviterName = user.user_metadata?.full_name ?? user.email ?? "Un administrador";

  await sendTeamInvite(email, inviterName, registerUrl).catch(() => null);

  return NextResponse.json({ invite });
}
