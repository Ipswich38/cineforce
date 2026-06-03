import { createBrowserClient } from "@supabase/ssr";
import { sessionCookieDomain } from "./cookie";

export function createClient() {
  const domain = sessionCookieDomain(typeof window !== "undefined" ? window.location.hostname : undefined);
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: { domain } }
  );
}
