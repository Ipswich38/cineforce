export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/constants";
import { publicCrewName } from "@/lib/publicName";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const admin = createAdminClient();

  const { data: ownProfile } = await admin
    .from("profiles")
    .select("id, account_type")
    .eq("id", user.id)
    .single();
  if (!ownProfile) redirect("/join");

  const { data: connections } = await admin
    .from("connection_requests")
    .select("id, client_id, crew_id, status, message, project_title, updated_at, created_at")
    .in("status", ["accepted", "pending"])
    .or(`client_id.eq.${user.id},crew_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  const list = (connections ?? []).filter((conn) =>
    conn.status === "accepted" || (conn.status === "pending" && conn.crew_id === user.id)
  );
  const otherIds = Array.from(new Set(
    list.map((c) => c.client_id === user.id ? c.crew_id : c.client_id)
  ));

  const [{ data: profiles }, { data: msgRows }] = await Promise.all([
    otherIds.length
      ? admin.from("profiles").select("id, slug, display_name, avatar_url, role").in("id", otherIds)
      : Promise.resolve({ data: [] }),
    // Use admin client so RLS never silently hides existing messages
    list.length
      ? admin.from("messages")
          .select("connection_id, body, sender_id, created_at")
          .in("connection_id", list.map((c) => c.id))
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const lastByConn  = new Map<string, { sender_id: string; body: string; created_at: string }>();
  for (const row of (msgRows ?? [])) {
    if (!lastByConn.has(row.connection_id)) lastByConn.set(row.connection_id, row);
  }

  const conversations = list.map((conn) => {
    const otherId  = conn.client_id === user.id ? conn.crew_id : conn.client_id;
    const profile  = profileById.get(otherId);
    const isOtherCrew = conn.crew_id === otherId;
    const roleLabel = profile?.role ? ROLES.find((r) => r.id === profile.role)?.label ?? profile.role : null;
    return {
      id:            conn.id,
      client_id:     conn.client_id,
      crew_id:       conn.crew_id,
      status:        conn.status,
      requestMessage: conn.message,
      project_title: conn.project_title,
      updated_at:    conn.updated_at,
      other: {
        id:           otherId,
        display_name: isOtherCrew ? publicCrewName(profile?.display_name) : profile?.display_name ?? "CineForce user",
        avatar_url:   profile?.avatar_url   ?? null,
        role:         roleLabel,
        slug:         profile?.slug         ?? null,
      },
      lastMessage: lastByConn.get(conn.id) ?? null,
    };
  });

  return (
    <MessagesClient
      userId={user.id}
      accountType={ownProfile.account_type}
      conversations={conversations}
    />
  );
}
