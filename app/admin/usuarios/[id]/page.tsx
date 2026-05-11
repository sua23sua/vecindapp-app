import { createAdminClient } from "@/lib/supabase/admin";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PLANS } from "@/lib/stripe";
import PlanEditor from "./PlanEditor";

export const dynamic = "force-dynamic";

export default async function AdminUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createAdminClient();

  // Fetch auth user via REST API
  const origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const userRes = await fetch(`${origin}/auth/v1/admin/users/${id}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!userRes.ok) notFound();
  const authUser = await userRes.json();

  const [{ data: sub }, { data: communities }, { data: campaigns }] = await Promise.all([
    db.from("subscriptions").select("*").eq("user_id", id).single(),
    db.from("communities").select("id, name, address, owners(count)").eq("user_id", id),
    db.from("campaigns").select("id, title, community_name, total_recipients, sent_at").eq("user_id", id).order("sent_at", { ascending: false }).limit(10),
  ]);

  const s = sub as any;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/usuarios" className="flex items-center gap-2 text-sm text-[#475569] hover:text-[#1A56DB] mb-6">
        <ArrowLeft className="w-4 h-4" /> Volver a usuarios
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A3C6E]">{authUser.user_metadata?.full_name ?? "Sin nombre"}</h1>
        <p className="text-[#475569] mt-1">{authUser.email}</p>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-[#1A3C6E] mb-4">Cuenta</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#475569] mb-1">ID</p>
            <p className="font-mono text-xs text-[#1E293B] break-all">{authUser.id}</p>
          </div>
          <div>
            <p className="text-[#475569] mb-1">Registro</p>
            <p className="font-medium text-[#1E293B]">{new Date(authUser.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div>
            <p className="text-[#475569] mb-1">Email confirmado</p>
            <div className="flex items-center gap-1.5">
              {authUser.email_confirmed_at
                ? <><CheckCircle className="w-4 h-4 text-[#15803D]" /><span className="text-[#15803D] font-medium">Sí</span></>
                : <><XCircle className="w-4 h-4 text-red-400" /><span className="text-red-500 font-medium">No</span></>}
            </div>
          </div>
          <div>
            <p className="text-[#475569] mb-1">Último acceso</p>
            <p className="font-medium text-[#1E293B]">
              {authUser.last_sign_in_at
                ? new Date(authUser.last_sign_in_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Billing info */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-[#1A3C6E] mb-4">Facturación actual</h2>
        {s ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#475569] mb-1">Plan</p>
              <p className="font-medium text-[#1E293B] capitalize">{s.plan} {s.tier}</p>
            </div>
            <div>
              <p className="text-[#475569] mb-1">Estado</p>
              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${s.status === "active" ? "bg-[#F0FDF4] text-[#15803D]" : "bg-red-50 text-red-600"}`}>
                {s.status}
              </span>
            </div>
            <div>
              <p className="text-[#475569] mb-1">Renovación</p>
              <p className="font-medium text-[#1E293B]">
                {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("es-ES") : "—"}
              </p>
            </div>
            <div>
              <p className="text-[#475569] mb-1">Stripe Customer</p>
              <p className="font-mono text-xs text-[#475569]">{s.stripe_customer_id ?? "—"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#475569]">Sin suscripción activa</p>
        )}
      </div>

      {/* Manual plan editor */}
      <PlanEditor
        userId={id}
        currentPlan={s?.plan ?? ""}
        currentTier={s?.tier ?? "base"}
        currentStatus={s?.status ?? "inactive"}
        plans={PLANS.map(p => ({ id: p.id, name: p.name }))}
      />

      {/* Communities */}
      {(communities ?? []).length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-[#1A3C6E] mb-4">Comunidades ({(communities ?? []).length})</h2>
          <div className="space-y-2">
            {(communities ?? []).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b border-[#F8FAFC] last:border-0">
                <div>
                  <p className="font-medium text-[#1E293B]">{c.name}</p>
                  <p className="text-[#475569] text-xs">{c.address ?? "Sin dirección"}</p>
                </div>
                <span className="text-xs text-[#1A56DB] font-medium">{c.owners?.[0]?.count ?? 0} propietarios</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent campaigns */}
      {(campaigns ?? []).length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <h2 className="font-semibold text-[#1A3C6E] mb-4">Últimas campañas</h2>
          <div className="space-y-2">
            {(campaigns ?? []).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between text-sm py-2 border-b border-[#F8FAFC] last:border-0">
                <div>
                  <p className="font-medium text-[#1E293B]">{c.title || "(sin título)"}</p>
                  <p className="text-[#475569] text-xs">{c.community_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#475569]">{new Date(c.sent_at).toLocaleDateString("es-ES")}</p>
                  <p className="text-xs text-[#1A56DB] font-medium">{c.total_recipients} destinatarios</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
