import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { email, password, nombre } = await req.json() as { email: string; password: string; nombre: string };

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: nombre },
    email_confirm: false,
  });

  if (error) {
    const msg = error.message.includes("already registered") || error.message.includes("already been registered")
      ? "Este email ya está registrado."
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Send confirmation email via Supabase
  await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  return NextResponse.json({ ok: true, userId: data.user?.id });
}
