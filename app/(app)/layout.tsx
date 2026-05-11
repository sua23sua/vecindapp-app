import Sidebar from "@/components/Sidebar";
import PlanLimitBanner from "@/components/PlanLimitBanner";
import { createClient } from "@/lib/supabase/server";
import { getPlanStatus } from "@/lib/plan-status";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const planStatus = user
    ? await getPlanStatus(user.id).catch(() => null)
    : null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        {planStatus && planStatus.status !== "ok" && (
          <PlanLimitBanner initial={planStatus} />
        )}
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
