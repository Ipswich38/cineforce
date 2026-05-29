export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatClient from "./ChatClient";

export default async function ChatPage({ params }: { params: Promise<{ connectionId: string }> }) {
  const { connectionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Verify access
  const { data: conn } = await supabase
    .from("connection_requests")
    .select("id, crew_id, client_id, project_title, status")
    .eq("id", connectionId)
    .single();

  if (!conn || conn.status !== "accepted") redirect("/dashboard");
  if (conn.crew_id !== user.id && conn.client_id !== user.id) redirect("/dashboard");

  const otherId = conn.crew_id === user.id ? conn.client_id : conn.crew_id;

  // Fetch other person's profile
  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, role, account_type")
    .eq("id", otherId)
    .single();

  // Fetch initial messages
  const { data: initialMessages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: true });

  const messages = (initialMessages ?? []).map((message) => ({
    id: message.id,
    sender_id: message.sender_id,
    content: message.body,
    created_at: message.created_at,
  }));

  return (
    <ChatClient
      connectionId={connectionId}
      projectTitle={conn.project_title}
      currentUserId={user.id}
      otherName={otherProfile?.display_name ?? "User"}
      otherAvatar={otherProfile?.avatar_url ?? null}
      otherRole={otherProfile?.role ?? otherProfile?.account_type ?? ""}
      initialMessages={messages as { id: string; sender_id: string; content: string; created_at: string }[]}
    />
  );
}
