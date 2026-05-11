import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function instanceName(userId: string) {
  return `va_${userId.replace(/-/g, "").slice(0, 16)}`;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const evoUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
  const evoKey = process.env.EVOLUTION_API_KEY;

  if (!evoUrl || !evoKey || evoUrl === "https://tu-instancia.evolution-api.com") {
    return NextResponse.json({ configured: false });
  }

  const instance = instanceName(user.id);

  try {
    const res = await fetch(`${evoUrl}/instance/connectionState/${instance}`, {
      headers: { apikey: evoKey },
      cache: "no-store",
    });

    if (res.status === 404) {
      // Instance doesn't exist yet — create it and return QR
      await fetch(`${evoUrl}/instance/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: evoKey },
        body: JSON.stringify({ instanceName: instance, qrcode: true }),
      });
    }

    // Get QR
    const qrRes = await fetch(`${evoUrl}/instance/connect/${instance}`, {
      headers: { apikey: evoKey },
      cache: "no-store",
    });
    const qrData = await qrRes.json();

    const stateRes = await fetch(`${evoUrl}/instance/connectionState/${instance}`, {
      headers: { apikey: evoKey },
      cache: "no-store",
    });
    const stateData = await stateRes.json();
    const state = stateData?.instance?.state ?? stateData?.state ?? "close";

    return NextResponse.json({
      configured: true,
      connected: state === "open",
      state,
      instance,
      qr: qrData?.base64 ?? qrData?.qrcode?.base64 ?? null,
      number: stateData?.instance?.profileName ?? null,
    });
  } catch {
    return NextResponse.json({ configured: true, connected: false, state: "error", qr: null });
  }
}

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const evoUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
  const evoKey = process.env.EVOLUTION_API_KEY;
  if (!evoUrl || !evoKey) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  const instance = instanceName(user.id);
  await fetch(`${evoUrl}/instance/logout/${instance}`, {
    method: "DELETE",
    headers: { apikey: evoKey },
  });

  return NextResponse.json({ ok: true });
}
