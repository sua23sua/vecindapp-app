import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const EVO_URL = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
const EVO_KEY = process.env.EVOLUTION_API_KEY;

const CONFIRMATION_RE = /\b(s[íi]|ok|confirmado?|recib[io]do?|enterado?|visto|gracias|vale|perfecto|leído|leido)\b/i;

async function sendText(instance: string, phone: string, text: string) {
  if (!EVO_URL || !EVO_KEY) return;
  await fetch(`${EVO_URL}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: EVO_KEY },
    body: JSON.stringify({ number: phone, textMessage: { text } }),
  }).catch(() => {});
}

async function resolvePhone(db: ReturnType<typeof createAdminClient>, userId: string, remoteJid: string): Promise<string | null> {
  if (remoteJid.endsWith("@s.whatsapp.net")) {
    return remoteJid.replace("@s.whatsapp.net", "");
  }
  if (remoteJid.endsWith("@lid")) {
    const { data } = await db
      .from("whatsapp_jid_map")
      .select("phone")
      .eq("user_id", userId)
      .eq("lid", remoteJid)
      .single();
    return data?.phone ?? null;
  }
  return null;
}

export async function POST(req: NextRequest) {
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

  const event = body.event as string | undefined;
  const instanceName = body.instance as string | undefined;
  if (!instanceName) return NextResponse.json({ ok: true });

  const db = createAdminClient();

  const { data: inst } = await db
    .from("whatsapp_instances")
    .select("user_id")
    .eq("instance_name", instanceName)
    .single();

  if (!inst) return NextResponse.json({ ok: true });
  const userId = inst.user_id as string;

  // ── MESSAGES_UPDATE: build lid→phone map and track read status ──
  if (event === "MESSAGES_UPDATE" || event === "messages.update") {
    const updates = Array.isArray(body.data) ? body.data : [body.data];
    for (const update of updates as Record<string, unknown>[]) {
      if (!update) continue;
      const remoteJid = update.remoteJid as string | undefined;
      const messageId = update.id as string | undefined;
      const fromMe = update.fromMe as boolean | undefined;
      const status = update.status as string | undefined;

      if (!remoteJid || !messageId || !fromMe) continue;

      if (remoteJid.endsWith("@lid")) {
        // Find the phone from campaign_rows using messageId → build lid map
        const { data: row } = await db
          .from("campaign_rows")
          .select("id, phone")
          .eq("message_id", messageId)
          .single();

        if (row?.phone) {
          await db
            .from("whatsapp_jid_map")
            .upsert({ user_id: userId, lid: remoteJid, phone: row.phone, updated_at: new Date().toISOString() }, { onConflict: "user_id,lid" });

          if (status === "READ") {
            await db
              .from("campaign_rows")
              .update({ status: "read", read_at: new Date().toISOString() } as any)
              .eq("id", row.id);
          }
        }
      }
    }
    return NextResponse.json({ ok: true });
  }

  // ── MESSAGES_UPSERT: handle incoming replies ──
  if (event !== "MESSAGES_UPSERT" && event !== "messages.upsert") {
    return NextResponse.json({ ok: true });
  }

  const msg = body.data as Record<string, unknown> | undefined;
  const key = msg?.key as Record<string, unknown> | undefined;
  const fromMe = key?.fromMe as boolean | undefined;
  const remoteJid = key?.remoteJid as string | undefined;

  if (!remoteJid) return NextResponse.json({ ok: true });
  if (remoteJid.endsWith("@g.us")) return NextResponse.json({ ok: true });

  const message = msg?.message as Record<string, unknown> | undefined;
  const text: string =
    (message?.conversation as string) ??
    ((message?.extendedTextMessage as Record<string, unknown>)?.text as string) ??
    "";

  // ── Admin sent a message manually → activate 24h manual mode ──
  if (fromMe) {
    const phone = remoteJid.endsWith("@s.whatsapp.net")
      ? remoteJid.replace("@s.whatsapp.net", "")
      : remoteJid;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await db
      .from("whatsapp_manual_mode")
      .upsert({ user_id: userId, phone, expires_at: expiresAt }, { onConflict: "user_id,phone" });
    return NextResponse.json({ ok: true });
  }

  // ── Resident replied ──
  const phone = await resolvePhone(db, userId, remoteJid);
  if (!phone) return NextResponse.json({ ok: true });

  // Check manual mode
  const { data: manualRow } = await db
    .from("whatsapp_manual_mode")
    .select("expires_at")
    .eq("user_id", userId)
    .eq("phone", phone)
    .single();

  if (manualRow && new Date(manualRow.expires_at) > new Date()) {
    return NextResponse.json({ ok: true });
  }

  // Mark confirmation
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

  await sendText(instanceName, phone, "Gracias por su mensaje. Ha sido registrado correctamente.");

  return NextResponse.json({ ok: true });
}
