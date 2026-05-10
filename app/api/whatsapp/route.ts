import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EVO_URL = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
const EVO_KEY = process.env.EVOLUTION_API_KEY;
const EVO_INSTANCE = process.env.EVOLUTION_INSTANCE;

type Owner = { id: string; name: string; unit: string; phone: string };
type CommunityPayload = {
  id: string;
  name: string;
  owners: Owner[];
};

function normalizePhone(raw: string): string {
  let n = raw.replace(/[\s\-().+]/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  if (/^[67]/.test(n) && n.length === 9) n = "34" + n;
  return n;
}

function interpolate(tpl: string, owner: Owner, commName: string): string {
  return tpl
    .replace(/{{nombre}}/g, owner.name)
    .replace(/{{vivienda}}/g, owner.unit)
    .replace(/{{comunidad}}/g, commName)
    .replace(/{{fecha_junta}}/g, new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }));
}

async function sendWhatsApp(phone: string, text: string): Promise<{ ok: boolean; error?: string }> {
  if (!EVO_URL || !EVO_KEY || !EVO_INSTANCE) {
    return { ok: false, error: "Evolution API no configurada" };
  }
  try {
    const res = await fetch(`${EVO_URL}/message/sendText/${EVO_INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVO_KEY },
      body: JSON.stringify({ number: phone, textMessage: { text } }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const rawData = formData.get("data") as string;
  const pdfFile = formData.get("pdf") as File | null;
  const { communities, message, campaignTitle } = JSON.parse(rawData) as {
    communities: CommunityPayload[];
    message: string;
    campaignTitle: string;
  };
  const hasPdf = !!pdfFile;

  const results: { community: string; sent: number; failed: number }[] = [];

  for (const comm of communities) {
    const { data: campaign, error: campaignErr } = await supabase
      .from("campaigns")
      .insert({
        user_id: user.id,
        community_id: comm.id,
        community_name: comm.name,
        title: campaignTitle || "Aviso",
        message,
        has_pdf: hasPdf,
        sent_at: new Date().toISOString(),
        total_recipients: comm.owners.length,
      } as any)
      .select("id")
      .single();

    if (campaignErr || !campaign) continue;

    const campaignId = (campaign as any).id as string;

    const rowInserts = comm.owners.map(o => ({
      campaign_id: campaignId,
      owner_id: o.id,
      owner_name: o.name,
      unit: o.unit,
      phone: o.phone,
      status: "sent",
    }));

    const { data: rows } = await supabase
      .from("campaign_rows")
      .insert(rowInserts as any)
      .select("id, owner_id, phone");

    const rowMap = new Map<string, string>();
    for (const r of (rows ?? []) as { id: string; owner_id: string; phone: string }[]) {
      rowMap.set(r.owner_id, r.id);
    }

    let sent = 0;
    let failed = 0;

    for (const owner of comm.owners) {
      const rowId = rowMap.get(owner.id);
      const phone = normalizePhone(owner.phone);
      const text = interpolate(message, owner, comm.name);
      const result = await sendWhatsApp(phone, text);

      if (rowId) {
        await supabase
          .from("campaign_rows")
          .update({ status: result.ok ? "delivered" : "failed" } as any)
          .eq("id", rowId);
      }

      result.ok ? sent++ : failed++;
    }

    results.push({ community: comm.name, sent, failed });
  }

  return NextResponse.json({ ok: true, results });
}
