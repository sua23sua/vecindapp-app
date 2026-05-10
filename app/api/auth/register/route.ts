import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password, nombre } = await req.json() as { email: string; password: string; nombre: string };

    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Call Supabase Auth REST API directly
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata: { full_name: nombre },
        email_confirm: false,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = (data?.msg ?? data?.message ?? "Error al crear la cuenta.") as string;
      const userFacing = msg.toLowerCase().includes("already") ? "Este email ya está registrado." : msg;
      return NextResponse.json({ error: userFacing }, { status: 400 });
    }

    // Trigger confirmation email
    await fetch(`${supabaseUrl}/auth/v1/resend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ type: "signup", email }),
    }).catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Register error:", e?.message ?? e);
    return NextResponse.json({ error: e?.message ?? "Error interno del servidor" }, { status: 500 });
  }
}
