export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, is_paused, account_type, is_crew, is_hirer, role, city, bio, experience_level, rate_min, rate_max, rate_unit, availability, slug, specializations")
    .eq("id", user.id)
    .single();

  const { data: bookings } = await supabase
    .from("connection_requests")
    .select("id, project_title, created_at")
    .or(`crew_id.eq.${user.id},client_id.eq.${user.id}`)
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <SettingsClient
      userId={user.id}
      profile={profile ?? null}
      bookings={bookings ?? []}
    />
  );
}
