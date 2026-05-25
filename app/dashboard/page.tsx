export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [{ data: profile }, { data: requests }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("connection_requests")
      .select("*, requester:client_id(email)")
      .eq("crew_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return <DashboardClient profile={profile} requests={requests ?? []} userEmail={user.email ?? ""} />;
}
