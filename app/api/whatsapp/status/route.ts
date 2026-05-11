import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function instanceName(userId: string) {
  return `va_${userId.replace(/-/g, "").slice(0, 16)}`;
}

function appUrl() {
  // NEXT_PUBLIC_APP_URL should be set in production; fall back to VERCEL_URL
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL;
  if (!raw) return null;
  return raw.startsWith("http") ? raw.replace(/\/$/, "") : `https://${raw}`;
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
      // Create instance
      await fetch(`${evoUrl}/instance/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: evoKey },
        body: JSON.stringify({ instanceName: instance, qrcode: true }),
      });

      // Register instance → user_id mapping
      const db = createAdminClient();
      await db.from("whatsapp_instances").upsert(
        { instance_name: instance, user_id: user.id },
        { onConflict: "instance_name" }
      );

      // Configure webhook for incoming messages
      const webhookBase = appUrl();
      if (webhookBase) {
        await fetch(`${evoUrl}/webhook/set/${instance}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: evoKey },
          body: JSON.stringify({
            url: `${webhookBase}/api/whatsapp/incoming`,
            webhook_by_events: false,
            webhook_base64: false,
            events: ["MESSAGES_UPSERT"],
          }),
        });
      }
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
