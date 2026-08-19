// Public read-only client (anon key, RLS-limited). Safe for storefront pages.
import { createClient } from "@supabase/supabase-js";

export function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
