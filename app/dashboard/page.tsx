export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { trialDaysLeft, computeStatus } from "@/lib/subscription";
import DashboardClient from "./DashboardClient";
import ClientDashboard, { type Favorite, type SentRequest } from "./ClientDashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/join");

  const subStatus = profile ? computeStatus(profile) : "expired";
  const daysLeft  = profile ? trialDaysLeft(profile.trial_started_at) : 0;

  // Client dashboard
  if (profile?.account_type === "client") {
    const [{ data: sentRequests }, { data: favorites }] = await Promise.all([
      supabase
        .from("connection_requests")
        .select("id, status, project_title, message, created_at, crew:crew_id(id, slug, display_name, role, city, premium_status)")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("favorites")
        .select("id, created_at, crew:crew_id(id, slug, display_name, role, city, premium_status)")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    return (
      <ClientDashboard
        profile={profile as Record<string, unknown>}
        sentRequests={(sentRequests ?? []) as unknown as SentRequest[]}
        favorites={(favorites ?? []) as unknown as Favorite[]}
        userEmail={user.email ?? ""}
        subStatus={subStatus}
        daysLeft={daysLeft}
      />
    );
  }

  // Crew dashboard (default)
  const [{ data: requests }, { count: activatedCount }, { data: specs }] = await Promise.all([
    supabase.from("connection_requests")
      .select("*, requester:client_id(email)")
      .eq("crew_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("premium_status", "active"),
    supabase.from("profile_specializations").select("name").eq("profile_id", user.id),
  ]);

  return (
    <DashboardClient
      profile={profile}
      requests={requests ?? []}
      userEmail={user.email ?? ""}
      activatedCount={activatedCount ?? 0}
      specializations={(specs ?? []).map((s) => s.name)}
      subStatus={subStatus}
      daysLeft={daysLeft}
    />
  );
}
