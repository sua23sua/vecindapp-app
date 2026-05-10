import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/stripe";
import { CheckCheck, Zap } from "lucide-react";
import PlanActions from "./PlanActions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active:   { label: "Activa",      color: "text-[#15803D] bg-[#F0FDF4]" },
  past_due: { label: "Pago fallido", color: "text-red-600 bg-red-50" },
  canceled: { label: "Cancelada",   color: "text-[#475569] bg-[#F8FAFC]" },
  inactive: { label: "Sin plan",    color: "text-[#475569] bg-[#F8FAFC]" },
};

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ success?: string; canceled?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subRaw } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const sub = subRaw as { plan: string; status: string; current_period_end: string | null } | null;
  const currentPlan = sub?.plan ?? "free";
  const status = sub?.status ?? "inactive";
  const statusInfo = STATUS_LABEL[status] ?? STATUS_LABEL.inactive;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">Mi plan</h1>
        <p className="text-[#475569] mt-1">Gestiona tu suscripción a VecindApp</p>
      </div>

      {params.success && (
        <div className="mb-6 flex items-center gap-3 bg-[#F0FDF4] border border-[#15803D]/20 text-[#15803D] rounded-2xl px-5 py-4">
          <CheckCheck className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">¡Suscripción activada correctamente! Bienvenido.</p>
        </div>
      )}
      {params.canceled && (
        <div className="mb-6 bg-[#FFF7ED] border border-orange-200 text-orange-700 rounded-2xl px-5 py-4">
          <p className="font-medium">Pago cancelado. Puedes suscribirte en cualquier momento.</p>
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-[#475569] mb-1">Plan actual</p>
            <p className="text-2xl font-bold text-[#1A3C6E] capitalize">{currentPlan === "free" ? "Sin plan" : currentPlan}</p>
            {sub?.current_period_end && (
              <p className="text-sm text-[#475569] mt-1">
                Renovación: {new Date(sub.current_period_end).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
            {status === "active" && <PlanActions mode="portal" />}
          </div>
        </div>
      </div>

      {/* Plans grid */}
      <h2 className="font-semibold text-[#1A3C6E] mb-4">
        {status === "active" ? "Cambiar de plan" : "Elige tu plan"}
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLANS.map(plan => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div key={plan.id} className={`bg-white rounded-2xl border-2 p-5 shadow-sm flex flex-col ${isCurrent ? "border-[#1A56DB]" : "border-[#E2E8F0]"}`}>
              {isCurrent && (
                <span className="text-xs font-semibold text-[#1A56DB] mb-2">Plan actual</span>
              )}
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-[#1A56DB]" />
                <p className="font-bold text-[#1A3C6E]">{plan.name}</p>
              </div>
              <p className="text-sm text-[#475569] mb-4">Hasta {plan.owners} propietarios</p>

              <div className="space-y-2 mb-5 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#475569]">Base</span>
                  <span className="font-bold text-[#1E293B]">{plan.priceBase} €/mes</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#475569]">Plus (con confirmación)</span>
                  <span className="font-bold text-[#1E293B]">{plan.pricePlus} €/mes</span>
                </div>
              </div>

              <div className="space-y-2">
                <PlanActions mode="checkout" priceId={plan.priceIdBase} label={`Base ${plan.priceBase}€/mes`} disabled={isCurrent} />
                <PlanActions mode="checkout" priceId={plan.priceIdPlus} label={`Plus ${plan.pricePlus}€/mes`} variant="outline" disabled={isCurrent} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
