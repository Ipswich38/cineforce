"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, PROJECT_TYPES } from "@/lib/constants";
import BrandLockup from "@/components/BrandLockup";
import { publicCrewName } from "@/lib/publicName";
import {
  LogOut, Search, Heart, ExternalLink, Settings,
  CheckCircle2, X, Clock, MessageSquare, ChevronDown,
  Inbox, Users,
} from "lucide-react";

const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';

const BG      = "#000000";
const SURFACE = "#0C0C0F";
const CARD    = "#111114";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.08)";

export type CrewSnap = {
  id: string;
  slug: string;
  display_name: string;
  role: string;
  city: string;
};

export type SentRequest = {
  id: string;
  status: string;
  project_title: string;
  message: string | null;
  created_at: string;
  crew: CrewSnap | null;
};

export type Favorite = {
  id: string;
  created_at: string;
  crew: CrewSnap | null;
};

const STATUS_META: Record<string, { color: string; label: string; bg: string; Icon: React.ElementType }> = {
  pending:  { color: "#FF9F0A", label: "Pending",          bg: "rgba(255,159,10,0.1)",  Icon: Clock         },
  accepted: { color: "#32D74B", label: "Accepted",         bg: "rgba(50,215,75,0.1)",   Icon: CheckCircle2  },
  declined: { color: "#FF453A", label: "Declined",         bg: "rgba(255,69,58,0.1)",   Icon: X             },
  skipped:  { color: "#8E8E93", label: "Unable to commit", bg: "rgba(142,142,147,0.1)", Icon: Clock         },
};

function CrewAvatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
  const colors = ["#4A9EFF", "#32D74B", "#AF52DE", "#FF6B35", "#FF9F0A"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `${color}18`, border: `1.5px solid ${color}35`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontFamily: FD, fontWeight: 700, fontSize: Math.floor(size * 0.36), color }}>
        {initials}
      </span>
    </div>
  );
}

function ProfileAvatar({ name, size = 64 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "rgba(255,204,0,0.1)", border: "2px solid rgba(255,204,0,0.28)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontFamily: FD, fontWeight: 800, fontSize: Math.floor(size * 0.34), color: AMBER }}>
        {initials}
      </span>
    </div>
  );
}

export default function ClientDashboard({
  profile, sentRequests, favorites, userEmail,
}: {
  profile: Record<string, unknown>;
  sentRequests: SentRequest[];
  favorites: Favorite[];
  userEmail: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab,  setActiveTab]  = useState<"requests" | "saved">("requests");
  const [signingOut, setSigningOut] = useState(false);
  const [savedList,  setSavedList]  = useState<Favorite[]>(favorites);

  const displayName    = (profile?.display_name   as string | undefined) ?? userEmail.split("@")[0];
  const company        = (profile?.company         as string | null) ?? null;
  const city           = (profile?.city            as string | null) ?? null;
  const productionType = (profile?.production_type as string | null) ?? null;
  const ptLabel        = PROJECT_TYPES.find((p) => p.id === productionType)?.label ?? null;

  const pending = sentRequests.filter((r) => r.status === "pending");

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function removeFavorite(favId: string) {
    setSavedList((prev) => prev.filter((f) => f.id !== favId));
    await supabase.from("favorites").delete().eq("id", favId);
  }

  function roleLabel(roleId: string) {
    return ROLES.find((r) => r.id === roleId)?.label ?? roleId;
  }

  return (
    <div className="mobile-nav-pad" style={{ background: BG, minHeight: "100dvh" }}>

      {/* ── Top bar ── */}
      <div style={{
        background: "rgba(8,8,10,0.96)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${BORDER}`,
        position: "sticky", top: 0, zIndex: 40,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div className="app-container-narrow topbar-inner">
          <Link href="/" style={{ textDecoration: "none" }}>
            <BrandLockup size={17} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link href="/settings"
              style={{
                background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
                borderRadius: 10, padding: "7px 10px",
                display: "flex", alignItems: "center", color: MUTED, textDecoration: "none",
              }}>
              <Settings size={16} />
            </Link>
            <button onClick={signOut} disabled={signingOut}
              style={{
                background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)",
                borderRadius: 10, padding: "7px 10px",
                cursor: "pointer", color: "#FF453A",
                display: "flex", alignItems: "center", gap: 5,
                fontFamily: FT, fontSize: 13, fontWeight: 500,
              }}>
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="app-container-narrow" style={{ padding: "20px 16px 32px" }}>

        {/* ── Profile card ── */}
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`,
          borderRadius: 20, padding: "20px", marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            <ProfileAvatar name={displayName} size={64} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: FD, fontWeight: 800, fontSize: 20, color: TEXT, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 4 }}>
                {displayName}
              </h1>
              <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {[company, city, ptLabel].filter(Boolean).join(" · ") || "Hirer"}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/search"
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "12px 14px", borderRadius: 12,
                background: AMBER, color: "#000",
                fontFamily: FT, fontSize: 14, fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 2px 16px rgba(255,204,0,0.2)",
              }}>
              <Search size={15} /> Find Crew
            </Link>
            <Link href="/messages"
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "12px 14px", borderRadius: 12,
                background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
                color: TEXT, fontFamily: FT, fontSize: 14, fontWeight: 600,
                textDecoration: "none",
              }}>
              <MessageSquare size={15} /> Messages
            </Link>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{
          display: "flex", gap: 4,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 14, padding: 4, marginBottom: 20,
        }}>
          {([
            { id: "requests" as const, label: pending.length > 0 ? `Requests (${pending.length})` : "Requests", dot: pending.length > 0 },
            { id: "saved"    as const, label: savedList.length > 0 ? `Saved (${savedList.length})` : "Saved", dot: false },
          ]).map(({ id, label, dot }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                background: activeTab === id ? SURFACE : "transparent",
                color: activeTab === id ? TEXT : MUTED,
                fontFamily: FT, fontSize: 14, fontWeight: activeTab === id ? 600 : 400,
                boxShadow: activeTab === id ? "0 1px 6px rgba(0,0,0,0.5)" : "none",
                transition: "all 0.15s", position: "relative",
              }}>
              {dot && activeTab !== id && (
                <span style={{
                  position: "absolute", top: 9, right: 16,
                  width: 6, height: 6, borderRadius: "50%", background: "#FF9F0A",
                }} />
              )}
              {label}
            </button>
          ))}
        </div>

        {/* ══ REQUESTS tab ══ */}
        {activeTab === "requests" && (
          <div>
            {sentRequests.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "56px 24px",
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20,
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%", margin: "0 auto 18px",
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Inbox size={24} style={{ color: MUTED }} />
                </div>
                <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, marginBottom: 7 }}>No requests yet</p>
                <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.6, maxWidth: 260, margin: "0 auto 20px" }}>
                  Browse crew and send a project request to get started.
                </p>
                <Link href="/search"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "12px 20px", borderRadius: 999,
                    background: AMBER, color: "#000",
                    fontFamily: FT, fontSize: 14, fontWeight: 700, textDecoration: "none",
                  }}>
                  <Users size={14} /> Browse Crew
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sentRequests.map((req) => {
                  const date = new Date(req.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
                  const meta = STATUS_META[req.status] ?? STATUS_META.pending;
                  const StatusIcon = meta.Icon;
                  return (
                    <div key={req.id} style={{
                      background: CARD, border: `1px solid ${BORDER}`,
                      borderRadius: 16, overflow: "hidden",
                    }}>
                      {/* Thread header */}
                      <div style={{ padding: "14px 16px 0" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                          {req.crew ? (
                            <CrewAvatar name={publicCrewName(req.crew.display_name)} size={46} />
                          ) : (
                            <div style={{
                              width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
                              background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <Users size={18} style={{ color: MUTED }} />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                              <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: TEXT, lineHeight: 1.25, flex: 1 }}>
                                {req.project_title}
                              </p>
                              <span style={{ fontFamily: FT, fontSize: 11, color: MUTED, flexShrink: 0, marginTop: 1 }}>{date}</span>
                            </div>
                            {req.crew && (
                              <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 3 }}>
                                {publicCrewName(req.crew.display_name)} · {roleLabel(req.crew.role)} · {req.crew.city}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Message preview */}
                        {req.message && (
                          <div style={{
                            background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`,
                            borderRadius: 10, padding: "9px 12px", marginBottom: 12,
                          }}>
                            <p style={{ fontFamily: FT, fontSize: 13, color: "rgba(247,247,242,0.55)", lineHeight: 1.6, fontStyle: "italic" }}>
                              "{req.message}"
                            </p>
                          </div>
                        )}

                        {req.status === "skipped" && (
                          <div style={{
                            background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`,
                            borderRadius: 10, padding: "9px 12px", marginBottom: 12,
                          }}>
                            <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                              This crew member was extended on an ongoing project and can't commit right now.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer: status + action */}
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 16px 14px", gap: 10,
                      }}>
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "5px 12px", borderRadius: 999,
                          background: meta.bg,
                        }}>
                          <StatusIcon size={12} style={{ color: meta.color, flexShrink: 0 }} />
                          <span style={{ fontFamily: FT, fontSize: 12, fontWeight: 600, color: meta.color }}>
                            {meta.label}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: 7 }}>
                          {req.crew && (
                            <Link href={`/crew/${req.crew.slug}`}
                              style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "6px 12px", borderRadius: 20,
                                background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
                                fontFamily: FT, fontSize: 12, fontWeight: 500, color: MUTED,
                                textDecoration: "none",
                              }}>
                              <ExternalLink size={11} /> Profile
                            </Link>
                          )}
                          {req.status === "accepted" && (
                            <Link href={`/messages?thread=${req.id}`}
                              style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "6px 14px", borderRadius: 20,
                                background: "rgba(255,204,0,0.1)", border: "1px solid rgba(255,204,0,0.25)",
                                fontFamily: FT, fontSize: 12, fontWeight: 700, color: AMBER,
                                textDecoration: "none",
                              }}>
                              <MessageSquare size={11} /> Open Chat
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ SAVED tab ══ */}
        {activeTab === "saved" && (
          <div>
            {savedList.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "56px 24px",
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20,
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%", margin: "0 auto 18px",
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Heart size={24} style={{ color: MUTED }} />
                </div>
                <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, marginBottom: 7 }}>No saved crew</p>
                <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.6, maxWidth: 240, margin: "0 auto" }}>
                  Tap the heart on any crew profile to save them for later.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {savedList.map((fav) => {
                  if (!fav.crew) return null;
                  return (
                    <div key={fav.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: CARD, border: `1px solid ${BORDER}`,
                      borderRadius: 14, padding: "12px 14px",
                    }}>
                      <CrewAvatar name={publicCrewName(fav.crew.display_name)} size={46} />
                      <Link href={`/crew/${fav.crew.slug}`} style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
                        <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>
                          {publicCrewName(fav.crew.display_name)}
                        </p>
                        <p style={{ fontFamily: FT, fontSize: 12, color: MUTED }}>
                          {roleLabel(fav.crew.role)} · {fav.crew.city}
                        </p>
                      </Link>
                      <Link href={`/crew/${fav.crew.slug}`}
                        style={{
                          padding: "7px 10px", borderRadius: 10,
                          background: "rgba(74,158,255,0.07)", border: "1px solid rgba(74,158,255,0.2)",
                          color: "#4A9EFF", flexShrink: 0, display: "flex",
                        }}>
                        <ExternalLink size={13} />
                      </Link>
                      <button
                        onClick={() => removeFavorite(fav.id)}
                        style={{
                          padding: "7px 10px", borderRadius: 10,
                          background: "rgba(255,69,58,0.07)", border: "1px solid rgba(255,69,58,0.18)",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                        <Heart size={13} style={{ color: "#FF453A", fill: "#FF453A" }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
