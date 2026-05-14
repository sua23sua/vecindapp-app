import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ rowId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rowId } = await params;
  const { note } = await req.json().catch(() => ({ note: "" }));

  // Verify the row belongs to this user via campaign
  const { data: row } = await supabase
    .from("campaign_rows")
    .select("id, status, campaigns!inner(user_id)")
    .eq("id", rowId)
    .eq("campaigns.user_id", user.id)
    .single();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status === "confirmed") return NextResponse.json({ ok: true });

  const { error } = await supabase
    .from("campaign_rows")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      reply: note ? `[Manual] ${note}` : "[Manual]",
    } as any)
    .eq("id", rowId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
