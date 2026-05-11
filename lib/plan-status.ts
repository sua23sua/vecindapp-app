import { createAdminClient } from "./supabase/admin";
import { PLANS } from "./stripe";

export type PlanStatus = "ok" | "over_limit" | "blocked";

export interface PlanStatusResult {
  status: PlanStatus;
  ownerCount: number;
  planLimit: number;
  planName: string;
  overLimitSince: Date | null;
  daysRemaining: number | null;
  gracePeriodDays: number;
}

export async function getPlanStatus(userId: string): Promise<PlanStatusResult> {
  const db = createAdminClient();

  const [{ data: sub }, { data: communities }] = await Promise.all([
    db.from("subscriptions").select("plan, over_limit_since, grace_period_days").eq("user_id", userId).single(),
    db.from("communities").select("id").eq("user_id", userId),
  ]);

  const communityIds = (communities ?? []).map((c: { id: string }) => c.id);

  let ownerCount = 0;
  if (communityIds.length > 0) {
    const { count } = await db
      .from("owners")
      .select("id", { count: "exact", head: true })
      .in("community_id", communityIds);
    ownerCount = count ?? 0;
  }

  const planId = (sub as any)?.plan ?? "";
  const plan = PLANS.find(p => p.id === planId);
  const planLimit = plan?.owners ?? 0;
  const planName = plan?.name ?? "Sin plan";
  const gracePeriodDays: number = (sub as any)?.grace_period_days ?? 30;

  // Within limit or no plan
  if (!plan || ownerCount <= planLimit) {
    if ((sub as any)?.over_limit_since) {
      await db.from("subscriptions")
        .update({ over_limit_since: null } as any)
        .eq("user_id", userId);
    }
    return { status: "ok", ownerCount, planLimit, planName, overLimitSince: null, daysRemaining: null, gracePeriodDays };
  }

  // Over limit — record when it started
  let overLimitSince: Date;
  const rawSince = (sub as any)?.over_limit_since;

  if (!rawSince) {
    overLimitSince = new Date();
    await db.from("subscriptions")
      .update({ over_limit_since: overLimitSince.toISOString() } as any)
      .eq("user_id", userId);
  } else {
    overLimitSince = new Date(rawSince);
  }

  const daysOver = Math.floor((Date.now() - overLimitSince.getTime()) / 86_400_000);
  const daysRemaining = Math.max(0, gracePeriodDays - daysOver);
  const status: PlanStatus = daysOver >= gracePeriodDays ? "blocked" : "over_limit";

  return { status, ownerCount, planLimit, planName, overLimitSince, daysRemaining, gracePeriodDays };
}
