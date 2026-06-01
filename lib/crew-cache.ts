import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cached PUBLIC crew profile data (read-heavy, changes rarely). Per-user data —
// auth, connection-request status, contact details — stays uncached in the page.
// Uses a cookie-less anon client so the result is shareable across requests and
// still respects the public-read RLS policies.
export const CREW_TAG = "crew";

export type CachedCrew = {
  profile: Record<string, unknown> & { id: string };
  specializations: string[];
  equipment: { id: string; name: string; description?: string; category?: string }[];
  credits: { id: string; project_title: string; role: string; year?: number; type?: string; network_studio?: string }[];
};

function anonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function fetchPublicCrew(slug: string): Promise<CachedCrew | null> {
  const sb = anonClient();
  const { data: profileData } = await sb
    .from("profiles")
    .select("*,profile_specializations(name)")
    .eq("slug", slug)
    .single();
  if (!profileData) return null;

  const pid = profileData.id as string;
  const [{ data: eq }, { data: cr }] = await Promise.all([
    sb.from("equipment").select("*").eq("profile_id", pid).order("created_at"),
    sb.from("credits").select("*").eq("profile_id", pid).order("year", { ascending: false }),
  ]);

  return {
    profile: profileData,
    specializations: ((profileData.profile_specializations as { name: string }[]) ?? []).map((s) => s.name),
    equipment: (eq ?? []) as CachedCrew["equipment"],
    credits: (cr ?? []) as CachedCrew["credits"],
  };
}

// Cache hits Supabase only on a miss, after the `crew` tag is purged (profile
// update), or after the 5-minute window — otherwise served from cache.
export function getPublicCrew(slug: string) {
  return unstable_cache(() => fetchPublicCrew(slug), ["crew-profile", slug], {
    tags: [CREW_TAG, `crew-${slug}`],
    revalidate: 300,
  })();
}
