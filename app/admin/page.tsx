export const dynamic = "force-dynamic";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { trialDaysLeft } from "@/lib/subscription";
import AdminClient from "./AdminClient";

const PASSCODE = process.env.ADMIN_PASSCODE ?? "cineverse2026";

export type Kpis = {
  totalUsers:        number;
  totalCrew:         number;
  totalClients:      number;
  activeTrial:       number;
  paidActive:        number;
  expired:           number;
  totalRequests:     number;
  acceptedRequests:  number;
  pendingRequests:   number;
  openTickets:       number;
  inProgressTickets: number;
};

export type AdminUser = {
  id:              string;
  slug:            string | null;
  display_name:    string;
  account_type:    string | null;
  premium_status:  string;
  trial_started_at: string | null;
  trialDaysLeft:   number;
  role:            string | null;
  city:            string | null;
  created_at:      string;
  email:           string;
};

export type InviteCode = {
  id:          string;
  code:        string;
  max_uses:    number;
  used_count:  number;
  expires_at:  string | null;
  created_at:  string;
};

export type AdminTicket = {
  id:          string;
  user_id:     string | null;
  user_email:  string;
  category:    string;
  subject:     string;
  message:     string;
  status:      string;
  admin_notes: string | null;
  created_at:  string;
  updated_at:  string;
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== PASSCODE) redirect("/admin/login");

  const admin = createAdminClient();

  const [
    { data: profiles },
    { data: requests },
    { data: tickets },
    { data: inviteCodes },
    authResult,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id, slug, display_name, account_type, premium_status, trial_started_at, role, city, created_at")
      .order("created_at", { ascending: false }),
    admin.from("connection_requests").select("id, status"),
    admin.from("support_tickets").select("*").order("created_at", { ascending: false }),
    admin.from("invite_codes").select("*").order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  // Build email lookup from auth users
  const emailMap = new Map<string, string>();
  for (const u of authResult.data?.users ?? []) {
    if (u.email) emailMap.set(u.id, u.email);
  }

  // Compute KPIs
  const allProfiles = profiles ?? [];

  const totalUsers   = allProfiles.length;
  const totalCrew    = allProfiles.filter((p) => p.account_type === "crew" || !p.account_type).length;
  const totalClients = allProfiles.filter((p) => p.account_type === "client").length;

  const activeTrial = allProfiles.filter(
    (p) => p.premium_status === "trial" && trialDaysLeft(p.trial_started_at) > 0
  ).length;
  const paidActive = allProfiles.filter((p) => p.premium_status === "active").length;
  const expired    = allProfiles.filter(
    (p) =>
      (p.premium_status === "trial" && trialDaysLeft(p.trial_started_at) <= 0) ||
      p.premium_status === "expired"
  ).length;

  const allRequests      = requests ?? [];
  const totalRequests    = allRequests.length;
  const acceptedRequests = allRequests.filter((r) => r.status === "accepted").length;
  const pendingRequests  = allRequests.filter((r) => r.status === "pending").length;

  const allTickets       = (tickets ?? []) as AdminTicket[];
  const openTickets      = allTickets.filter((t) => t.status === "open").length;
  const inProgressTickets = allTickets.filter((t) => t.status === "in_progress").length;

  const kpis: Kpis = {
    totalUsers, totalCrew, totalClients,
    activeTrial, paidActive, expired,
    totalRequests, acceptedRequests, pendingRequests,
    openTickets, inProgressTickets,
  };

  const adminUsers: AdminUser[] = allProfiles.map((p) => ({
    id:              p.id,
    slug:            p.slug,
    display_name:    p.display_name,
    account_type:    p.account_type,
    premium_status:  p.premium_status,
    trial_started_at: p.trial_started_at,
    trialDaysLeft:   trialDaysLeft(p.trial_started_at),
    role:            p.role,
    city:            p.city,
    created_at:      p.created_at,
    email:           emailMap.get(p.id) ?? "—",
  }));

  return (
    <AdminClient
      kpis={kpis}
      users={adminUsers}
      tickets={allTickets}
      inviteCodes={(inviteCodes ?? []) as InviteCode[]}
    />
  );
}
