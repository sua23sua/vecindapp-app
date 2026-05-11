import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verify caller is admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: userId } = await params;
  const { plan, tier, status, note } = await req.json() as {
    plan: string;
    tier: string;
    status: string;
    note?: string;
  };

  const db = createAdminClient();

  // Upsert subscription manually
  const { error } = await db
    .from("subscriptions")
    .upsert({
      user_id: userId,
      plan,
      tier,
      status,
      // Clear Stripe IDs when set manually so webhook doesn't overwrite
      stripe_subscription_id: null,
      current_period_end: status === "active"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    } as any, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
