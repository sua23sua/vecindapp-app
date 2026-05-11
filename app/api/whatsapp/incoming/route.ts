import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const EVO_URL = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
const EVO_KEY = process.env.EVOLUTION_API_KEY;

// Words that count as a confirmation reply from a resident
const CONFIRMATION_RE = /\b(s[íi]|ok|confirmado?|recib[io]do?|enterado?|visto|gracias|vale|perfecto|leído|leido)\b/i;

async function sendText(instance: string, phone: string, text: string) {
  if (!EVO_URL || !EVO_KEY) return;
  await fetch(`${EVO_URL}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: EVO_KEY },
    body: JSON.stringify({ number: phone, textMessage: { text } }),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  // Verify request comes from our Evolution API instance
  const apikey = req.headers.get("apikey");
  if (EVO_KEY && apikey && apikey !== EVO_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Only handle incoming message events
  const event = body.event as string | undefined;
  if (event !== "MESSAGES_UPSERT" && event !== "messages.upsert") {
    return NextResponse.json({ ok: true });
  }

  const instanceName = body.instance as string | undefined;
  const msg = body.data as Record<string, unknown> | undefined;
  const key = msg?.key as Record<string, unknown> | undefined;
  const fromMe = key?.fromMe as boolean | undefined;
  const remoteJid = key?.remoteJid as string | undefined;

  if (!remoteJid || !instanceName) return NextResponse.json({ ok: true });

  // Ignore group messages
  if (remoteJid.endsWith("@g.us")) return NextResponse.json({ ok: true });

  const phone = remoteJid.replace("@s.whatsapp.net", "");
  const message = msg?.message as Record<string, unknown> | undefined;
  const text: string =
    (message?.conversation as string) ??
    ((message?.extendedTextMessage as Record<string, unknown>)?.text as string) ??
    "";

  const db = createAdminClient();

  // Look up which user owns this instance
  const { data: inst } = await db
    .from("whatsapp_instances")
    .select("user_id")
    .eq("instance_name", instanceName)
    .single();

  if (!inst) return NextResponse.json({ ok: true });
  const userId = inst.user_id as string;

  // ── Admin sent a message manually → activate 24h manual mode ──
  if (fromMe) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await db
      .from("whatsapp_manual_mode")
      .upsert({ user_id: userId, phone, expires_at: expiresAt }, { onConflict: "user_id,phone" });
    return NextResponse.json({ ok: true });
  }

  // ── Resident sent a message ──

  // Check if this contact is in manual mode (admin chatted in last 24h)
  const { data: manualRow } = await db
    .from("whatsapp_manual_mode")
    .select("expires_at")
    .eq("user_id", userId)
    .eq("phone", phone)
    .single();

  if (manualRow && new Date(manualRow.expires_at) > new Date()) {
    // Manual mode active — do not auto-respond, let admin handle it
    return NextResponse.json({ ok: true });
  }

  // Try to mark a pending campaign row as confirmed
  if (CONFIRMATION_RE.test(text)) {
    const { data: rows } = await db
      .from("campaign_rows")
      .select("id, campaign_id, campaigns!inner(user_id)")
      .eq("phone", phone)
      .eq("campaigns.user_id", userId)
      .in("status", ["sent", "delivered", "read"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (rows?.[0]) {
      await db
        .from("campaign_rows")
        .update({
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
          reply: text.slice(0, 500),
        })
        .eq("id", rows[0].id);
    }
  }

  // Auto-reply to acknowledge receipt
  await sendText(instanceName, phone, "Gracias por su mensaje. Ha sido registrado correctamente.");

  return NextResponse.json({ ok: true });
}
