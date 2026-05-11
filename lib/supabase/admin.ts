import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const stripBom = (s: string) => s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s;

function getOrigin() {
  return new URL(stripBom(process.env.NEXT_PUBLIC_SUPABASE_URL!)).origin;
}
function getKey() {
  return stripBom(process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export function createAdminClient() {
  return createSupabaseClient(getOrigin(), getKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type AuthUser = {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  user_metadata: Record<string, any>;
};

export async function listAuthUsers(): Promise<AuthUser[]> {
  const res = await fetch(`${getOrigin()}/auth/v1/admin/users?per_page=1000`, {
    headers: { apikey: getKey(), Authorization: `Bearer ${getKey()}` },
    cache: "no-store",
  });
  const data = await res.json();
  return data.users ?? [];
}
