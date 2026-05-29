export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLES } from "@/lib/constants";
import { ArrowLeft, MessageSquare, Search } from "lucide-react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#000000";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";

type Connection = {
  id: string;
  client_id: string;
  crew_id: string;
  project_title: string | null;
  updated_at: string | null;
  created_at: string | null;
};

type Profile = {
  id: string;
  slug: string | null;
  display_name: string;
  avatar_url: string | null;
  role: string | null;
  account_type: string | null;
  city: string | null;
  company: string | null;
};

type Message = {
  connection_id: string;
  body: string;
  sender_id: string;
  created_at: string;
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: ownProfile } = await supabase
    .from("profiles")
    .select("id, account_type")
    .eq("id", user.id)
    .single();

  if (!ownProfile) redirect("/join");

  const { data: connections } = await supabase
    .from("connection_requests")
    .select("id, client_id, crew_id, project_title, updated_at, created_at")
    .eq("status", "accepted")
    .or(`client_id.eq.${user.id},crew_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  const list = (connections ?? []) as Connection[];
  const otherIds = Array.from(new Set(list.map((item) => item.client_id === user.id ? item.crew_id : item.client_id)));

  const [{ data: profiles }, { data: messageRows }] = await Promise.all([
    otherIds.length
      ? supabase
          .from("profiles")
          .select("id, slug, display_name, avatar_url, role, account_type, city, company")
          .in("id", otherIds)
      : Promise.resolve({ data: [] }),
    list.length
      ? supabase
          .from("messages")
          .select("connection_id, body, sender_id, created_at")
          .in("connection_id", list.map((item) => item.id))
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile as Profile]));
  const lastByConnection = new Map<string, Message>();
  for (const row of (messageRows ?? []) as Message[]) {
    if (!lastByConnection.has(row.connection_id)) lastByConnection.set(row.connection_id, row);
  }

  const conversations = list.map((conn) => {
    const otherId = conn.client_id === user.id ? conn.crew_id : conn.client_id;
    const profile = profileById.get(otherId);
    const role = profile?.role ? ROLES.find((item) => item.id === profile.role)?.label ?? profile.role : null;
    const subtitle = [role, profile?.company, profile?.city].filter(Boolean).join(" · ");
    const last = lastByConnection.get(conn.id);
    return { conn, profile, subtitle, last };
  });

  return (
    <main className="mobile-nav-pad" style={{ minHeight: "100dvh", background: BG, color: TEXT }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(10,10,12,0.96)",
        borderBottom: `1px solid ${BORDER}`,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div className="app-container-narrow topbar-inner">
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 7, color: MUTED, textDecoration: "none", fontFamily: FT, fontSize: 14 }}>
            <ArrowLeft size={16} /> Back
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MessageSquare size={16} style={{ color: AMBER }} />
            <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT }}>Messages</span>
          </div>
          <div style={{ width: 54 }} />
        </div>
      </div>

      <div className="app-container-narrow app-page-pad">
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: FD, fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.2rem)", color: TEXT, letterSpacing: "-0.03em", marginBottom: 6 }}>
            Conversations
          </h1>
          <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
            Accepted project requests appear here so clients and crew can finalize details inside CineVerse.
          </p>
        </div>

        {conversations.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "56px 24px",
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
          }}>
            <div style={{
              width: 58, height: 58, borderRadius: "50%", margin: "0 auto 16px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <MessageSquare size={23} style={{ color: MUTED }} />
            </div>
            <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, marginBottom: 7 }}>No messages yet</p>
            <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.6, maxWidth: 280, margin: "0 auto 18px" }}>
              Conversations open after a crew member accepts a project request.
            </p>
            {ownProfile.account_type === "client" && (
              <Link href="/search" style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "12px 18px", borderRadius: 999,
                background: AMBER, color: "#000",
                fontFamily: FT, fontSize: 14, fontWeight: 700,
                textDecoration: "none",
              }}>
                <Search size={14} /> Find crew
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {conversations.map(({ conn, profile, subtitle, last }) => {
              const name = profile?.display_name ?? "CineVerse user";
              return (
                <Link key={conn.id} href={`/chat/${conn.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "13px 14px",
                    borderRadius: 15,
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    textDecoration: "none",
                  }}
                  className="transition-all hover:bg-white/[0.04] active:scale-[0.99]">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(255,204,0,0.1)",
                      border: "1px solid rgba(255,204,0,0.22)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontFamily: FD, fontWeight: 800, fontSize: 15, color: AMBER }}>{initials(name)}</span>
                    </div>
                  )}

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                      </p>
                      <span style={{ marginLeft: "auto", flexShrink: 0, fontFamily: FT, fontSize: 11, color: MUTED }}>
                        {formatDate(last?.created_at ?? conn.updated_at ?? conn.created_at)}
                      </span>
                    </div>
                    <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                      {conn.project_title ?? "Project conversation"}{subtitle ? ` · ${subtitle}` : ""}
                    </p>
                    <p style={{ fontFamily: FT, fontSize: 13, color: "rgba(247,247,242,0.68)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {last ? `${last.sender_id === user.id ? "You: " : ""}${last.body}` : "Chat is open. Send the first message."}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
