import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ isAdmin: false });

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin = adminEmails.includes(user.email?.toLowerCase() ?? "");
  return NextResponse.json({ isAdmin });
}
