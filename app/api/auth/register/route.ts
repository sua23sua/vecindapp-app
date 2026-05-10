import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const stripBom = (s: string) => s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;

export async function POST(req: NextRequest) {
  try {
    const { email, password, nombre } = await req.json() as { email: string; password: string; nombre: string };

    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const supabaseUrl = stripBom(process.env.NEXT_PUBLIC_SUPABASE_URL!).replace(/\/$/, "");
    const anonKey = stripBom(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

    const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        data: { full_name: nombre },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = (data?.msg ?? data?.message ?? data?.error_description ?? "Error al crear la cuenta.") as string;
      const userFacing = msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered")
        ? "Este email ya está registrado."
        : msg;
      return NextResponse.json({ error: userFacing }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Register error:", e?.message ?? e);
    return NextResponse.json({ error: e?.message ?? "Error interno del servidor" }, { status: 500 });
  }
}
