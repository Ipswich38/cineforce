"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, AVAILABILITY, EXPERIENCE_LEVELS, RATE_UNITS } from "@/lib/constants";
import {
  Bell, LogOut, ExternalLink, Settings,
  Check, ChevronDown, MapPin, Briefcase, DollarSign, User,
  MessageSquare, CheckCircle2, Clock, X, Star,
} from "lucide-react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#000000";
const SURFACE = "#0C0C0F";
const CARD    = "#111114";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.08)";
const BORDER2 = "rgba(255,255,255,0.05)";

type Request = {
  id: string;
  status: string;
  project_title: string;
  message: string | null;
  created_at: string;
  requester: { email: string } | null;
};

const AVATAR_COLORS = ["#4A9EFF", "#32D74B", "#AF52DE", "#FF6B35", "#FF9F0A"];

function RequesterAvatar({ email, size = 42 }: { email: string; size?: number }) {
  const color = AVATAR_COLORS[email.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `${color}18`, border: `1.5px solid ${color}35`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontFamily: FD, fontWeight: 700, fontSize: Math.floor(size * 0.38), color }}>
        {email.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function ProfileAvatar({ name, size = 64 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "rgba(255,204,0,0.1)",
      border: "2px solid rgba(255,204,0,0.28)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontFamily: FD, fontWeight: 800, fontSize: Math.floor(size * 0.34), color: AMBER }}>
        {initials}
      </span>
    </div>
  );
}

function RequestCard({
  req, onRespond,
}: {
  req: Request;
  onRespond: (id: string, status: "accepted" | "skipped") => Promise<void>;
}) {
  const [acting, setActing] = useState<"accepting" | "skipping" | null>(null);
  const date = new Date(req.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" });

  async function handle(status: "accepted" | "skipped") {
    setActing(status === "accepted" ? "accepting" : "skipping");
    await onRespond(req.id, status);
    setActing(null);
  }

  return (
    <div style={{
      background: CARD, borderRadius: 16,
      border: "1px solid rgba(255,159,10,0.2)",
      borderLeft: "3px solid #FF9F0A",
      overflow: "hidden",
    }}>
      <div style={{ padding: "14px 16px 16px" }}>
        {/* Thread header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <RequesterAvatar email={req.requester?.email ?? "?"} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: TEXT, lineHeight: 1.25, flex: 1 }}>
                {req.project_title}
              </p>
              <span style={{ fontFamily: FT, fontSize: 11, color: MUTED, flexShrink: 0, marginTop: 1 }}>{date}</span>
            </div>
            <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 3 }}>
              {req.requester?.email ?? "Anonymous"}
            </p>
          </div>
        </div>

        {/* Message bubble */}
        {req.message && (
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${BORDER2}`,
            borderRadius: 10, padding: "10px 13px",
            marginBottom: 12,
          }}>
            <p style={{ fontFamily: FT, fontSize: 13, color: "rgba(247,247,242,0.65)", lineHeight: 1.6, fontStyle: "italic" }}>
              "{req.message}"
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => handle("skipped")}
            disabled={acting !== null}
            style={{
              flex: 1, padding: "11px 8px", borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${BORDER}`,
              color: MUTED, fontFamily: FT, fontSize: 14, fontWeight: 500,
              cursor: acting ? "not-allowed" : "pointer",
              opacity: acting === "skipping" ? 0.5 : 1,
              transition: "all 0.15s",
            }}>
            {acting === "skipping" ? "Skipping…" : "Skip for now"}
          </button>
          <button
            onClick={() => handle("accepted")}
            disabled={acting !== null}
            style={{
              flex: 2, padding: "11px 8px", borderRadius: 12,
              background: acting === "accepting" ? "rgba(255,204,0,0.6)" : AMBER,
              border: "none", color: "#000",
              fontFamily: FT, fontSize: 14, fontWeight: 700,
              cursor: acting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              opacity: acting === "skipping" ? 0.5 : 1,
              transition: "all 0.15s",
              boxShadow: "0 2px 12px rgba(255,204,0,0.25)",
            }}>
            <Check size={14} strokeWidth={2.5} />
            {acting === "accepting" ? "Accepting…" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({
  profile, requests, specializations,
}: {
  profile: Record<string, unknown> | null;
  requests: Request[];
  specializations: string[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [reqs,            setReqs]            = useState(requests);
  const [activeTab,       setActiveTab]       = useState<"inbox" | "card">("inbox");
  const [signingOut,      setSigningOut]      = useState(false);
  const [availability,    setAvailability]    = useState<string>((profile?.availability as string) ?? "available");
  const [showAvailPicker, setShowAvailPicker] = useState(false);
  const [togglingAvail,   setTogglingAvail]   = useState(false);

  const pending   = reqs.filter((r) => r.status === "pending");
  const responded = reqs.filter((r) => r.status !== "pending");

  const profileId       = (profile?.id           as string | undefined) ?? "";
  const profileSlug     = (profile?.slug         as string | undefined) ?? "";
  const displayName     = (profile?.display_name as string | undefined) ?? "";
  const profileCity     = (profile?.city         as string | undefined) ?? "";
  const profileBio      = (profile?.bio          as string | null) ?? null;
  const rateMin         = (profile?.rate_min     as number | null) ?? null;
  const rateMax         = (profile?.rate_max     as number | null) ?? null;
  const roleLabel       = profile ? (ROLES.find((r) => r.id === (profile.role as string))?.label ?? (profile.role as string)) : "";
  const roleIcon        = profile ? (ROLES.find((r) => r.id === (profile.role as string))?.icon  ?? "") : "";
  const availItem       = AVAILABILITY.find((a) => a.id === availability);
  const expLabel        = EXPERIENCE_LEVELS.find((e) => e.id === (profile?.experience_level as string))?.label ?? "";
  const rateUnitLabel   = RATE_UNITS.find((u) => u.id === (profile?.rate_unit as string))?.label ?? "Per Day";

  async function respond(id: string, status: "accepted" | "skipped") {
    await supabase.from("connection_requests").update({ status }).eq("id", id);
    setReqs((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  }

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
  }

  async function changeAvailability(id: string) {
    if (!profileId) return;
    setTogglingAvail(true);
    await supabase.from("profiles").update({ availability: id }).eq("id", profileId);
    setAvailability(id);
    setTogglingAvail(false);
    setShowAvailPicker(false);
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
          <Link href="/" style={{ fontFamily: FD, fontWeight: 800, fontSize: 17, color: TEXT, letterSpacing: "-0.03em", textDecoration: "none" }}>
            CineVerse
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Bell */}
            <button
              onClick={() => setActiveTab("inbox")}
              style={{
                position: "relative", background: pending.length > 0 ? "rgba(255,59,48,0.1)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${pending.length > 0 ? "rgba(255,59,48,0.25)" : BORDER}`,
                borderRadius: 10, padding: "7px 10px",
                cursor: "pointer", color: pending.length > 0 ? "#FF3B30" : MUTED,
                display: "flex", alignItems: "center", gap: 5,
              }}>
              <Bell size={16} strokeWidth={pending.length > 0 ? 2.2 : 1.7} />
              {pending.length > 0 && (
                <span style={{ fontFamily: FT, fontSize: 11, fontWeight: 700, color: "#FF3B30" }}>
                  {pending.length}
                </span>
              )}
            </button>
            <Link href="/settings"
              style={{
                background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
                borderRadius: 10, padding: "7px 10px",
                display: "flex", alignItems: "center",
                color: MUTED, textDecoration: "none",
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
        {profile && (
          <div style={{
            background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 20, padding: "20px",
            marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <ProfileAvatar name={displayName} size={64} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontFamily: FD, fontWeight: 800, fontSize: 20, color: TEXT, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 4 }}>
                  {displayName}
                </h1>
                <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {roleIcon && <span style={{ marginRight: 5 }}>{roleIcon}</span>}{roleLabel}{profileCity ? ` · ${profileCity}` : ""}
                </p>
              </div>
            </div>

            {/* Availability + View Card */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {/* Availability picker */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowAvailPicker((v) => !v)}
                  disabled={togglingAvail}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "8px 14px", borderRadius: 999,
                    background: `${availItem?.color ?? MUTED}12`,
                    border: `1px solid ${availItem?.color ?? MUTED}30`,
                    cursor: togglingAvail ? "not-allowed" : "pointer",
                  }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: availItem?.color ?? MUTED, flexShrink: 0 }} />
                  <span style={{ fontFamily: FT, fontSize: 13, fontWeight: 600, color: availItem?.color ?? MUTED }}>
                    {availItem?.label}
                  </span>
                  <ChevronDown size={12} style={{ color: availItem?.color ?? MUTED, opacity: 0.7 }} />
                </button>

                {showAvailPicker && (
                  <>
                    <div onClick={() => setShowAvailPicker(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", left: 0,
                      background: "#1a1a1e", border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 16, overflow: "hidden",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
                      zIndex: 61, minWidth: 210,
                    }}>
                      {AVAILABILITY.map((a, i) => (
                        <button key={a.id} onClick={() => changeAvailability(a.id)}
                          style={{
                            width: "100%", padding: "13px 16px",
                            display: "flex", alignItems: "center", gap: 10,
                            background: availability === a.id ? `${a.color}10` : "none",
                            border: "none",
                            borderBottom: i < AVAILABILITY.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                            cursor: "pointer", textAlign: "left",
                          }}>
                          <span style={{ width: 9, height: 9, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
                          <span style={{ fontFamily: FT, fontSize: 14, color: availability === a.id ? a.color : TEXT, flex: 1 }}>{a.label}</span>
                          {availability === a.id && <Check size={13} style={{ color: a.color }} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <Link href={`/crew/${profileSlug}`} target="_blank"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 999,
                  background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
                  fontFamily: FT, fontSize: 13, fontWeight: 500, color: MUTED, textDecoration: "none",
                }}>
                <ExternalLink size={12} /> View Card
              </Link>

              <Link href="/messages"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 999,
                  background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
                  fontFamily: FT, fontSize: 13, fontWeight: 500, color: MUTED, textDecoration: "none",
                }}>
                <MessageSquare size={12} /> Messages
              </Link>
            </div>
          </div>
        )}

        {/* ── Tab bar ── */}
        <div style={{
          display: "flex", gap: 4,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 14, padding: 4, marginBottom: 20,
        }}>
          {([
            { id: "inbox" as const, label: pending.length > 0 ? `Inbox (${pending.length})` : "Inbox", dot: pending.length > 0 },
            { id: "card"  as const, label: "My Card", dot: false },
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
              {dot && activeTab !== "inbox" && (
                <span style={{
                  position: "absolute", top: 9, right: 16,
                  width: 6, height: 6, borderRadius: "50%", background: "#FF3B30",
                }} />
              )}
              {label}
            </button>
          ))}
        </div>

        {/* ══ INBOX ══ */}
        {activeTab === "inbox" && (
          <div>
            {pending.length === 0 && responded.length === 0 && (
              <div style={{
                textAlign: "center", padding: "56px 24px",
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20,
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%", margin: "0 auto 18px",
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bell size={24} style={{ color: MUTED }} />
                </div>
                <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, marginBottom: 7 }}>Inbox is empty</p>
                <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.6, maxWidth: 260, margin: "0 auto" }}>
                  Project requests from productions and hirers will appear here.
                </p>
              </div>
            )}

            {/* Pending requests */}
            {pending.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 14px", borderRadius: 12, marginBottom: 14,
                  background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.15)",
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF3B30", flexShrink: 0 }} />
                  <p style={{ fontFamily: FT, fontSize: 13, fontWeight: 600, color: "#FF453A" }}>
                    {pending.length} new request{pending.length !== 1 ? "s" : ""} waiting for your response
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pending.map((req) => (
                    <RequestCard key={req.id} req={req} onRespond={respond} />
                  ))}
                </div>
              </div>
            )}

            {/* Responded */}
            {responded.length > 0 && (
              <div>
                <p style={{ fontFamily: FT, fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>
                  Earlier
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {responded.map((req) => {
                    const d = new Date(req.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
                    const isAccepted = req.status === "accepted";
                    const isSkipped  = req.status === "skipped";
                    const statusColor = isAccepted ? "#32D74B" : isSkipped ? MUTED : "#FF453A";
                    const statusLabel = isAccepted ? "Accepted" : isSkipped ? "Skipped" : "Declined";
                    return (
                      <div key={req.id} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px", borderRadius: 14,
                        background: CARD, border: `1px solid ${BORDER}`,
                      }}>
                        <RequesterAvatar email={req.requester?.email ?? "?"} size={38} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {req.project_title}
                          </p>
                          <p style={{ fontFamily: FT, fontSize: 11, color: MUTED, marginTop: 2 }}>{d}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                          {isAccepted && (
                            <Link href={`/messages?thread=${req.id}`}
                              style={{
                                display: "flex", alignItems: "center", gap: 4,
                                padding: "5px 11px", borderRadius: 20,
                                background: "rgba(255,204,0,0.08)", border: "1px solid rgba(255,204,0,0.2)",
                                fontFamily: FT, fontSize: 12, fontWeight: 600, color: AMBER,
                                textDecoration: "none",
                              }}>
                              <MessageSquare size={11} /> Chat
                            </Link>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            {isAccepted ? <CheckCircle2 size={13} style={{ color: statusColor }} /> :
                             isSkipped  ? <Clock size={13} style={{ color: statusColor }} /> :
                             <X size={13} style={{ color: statusColor }} />}
                            <span style={{ fontFamily: FT, fontSize: 12, fontWeight: 500, color: statusColor }}>
                              {statusLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ MY CARD ══ */}
        {activeTab === "card" && profile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* View public profile */}
            <Link href={`/crew/${profileSlug}`} target="_blank"
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", borderRadius: 14,
                background: "rgba(74,158,255,0.06)", border: "1px solid rgba(74,158,255,0.18)",
                textDecoration: "none",
              }}>
              <div>
                <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 600, color: "#4A9EFF" }}>View public profile</p>
                <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 2 }}>
                  cineverseph.vercel.app/crew/{profileSlug}
                </p>
              </div>
              <ExternalLink size={15} style={{ color: "#4A9EFF", flexShrink: 0 }} />
            </Link>

            {/* Card */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: "hidden" }}>
              {/* Role header */}
              <div style={{
                padding: "16px 18px", background: "rgba(255,204,0,0.04)",
                borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                {roleIcon && <span style={{ fontSize: 28, lineHeight: 1 }}>{roleIcon}</span>}
                <div>
                  <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT }}>{roleLabel}</p>
                  {expLabel && <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 2 }}>{expLabel}</p>}
                </div>
              </div>

              {/* Fields */}
              {[
                { icon: <User size={14} style={{ color: MUTED }} />, label: "Name", value: displayName },
                { icon: <MapPin size={14} style={{ color: MUTED }} />, label: "City", value: profileCity },
              ].filter(f => f.value).map((field, i, arr) => (
                <div key={field.label} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "13px 18px",
                  borderBottom: `1px solid ${BORDER}`,
                }}>
                  {field.icon}
                  <span style={{ fontFamily: FT, fontSize: 13, color: MUTED, minWidth: 60 }}>{field.label}</span>
                  <span style={{ fontFamily: FT, fontSize: 14, color: TEXT }}>{field.value}</span>
                </div>
              ))}

              {(rateMin != null || rateMax != null) && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: `1px solid ${BORDER}` }}>
                  <DollarSign size={14} style={{ color: MUTED }} />
                  <span style={{ fontFamily: FT, fontSize: 13, color: MUTED, minWidth: 60 }}>Rate</span>
                  <span style={{ fontFamily: FT, fontSize: 14, color: TEXT }}>
                    ₱{rateMin?.toLocaleString() ?? "?"} – ₱{rateMax?.toLocaleString() ?? "?"}{" "}
                    <span style={{ color: MUTED, fontSize: 12 }}>/ {rateUnitLabel.toLowerCase()}</span>
                  </span>
                </div>
              )}

              {profileBio && (
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <Briefcase size={14} style={{ color: MUTED, flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Bio</p>
                      <p style={{ fontFamily: FT, fontSize: 13, color: TEXT, lineHeight: 1.65 }}>{profileBio}</p>
                    </div>
                  </div>
                </div>
              )}

              {specializations.length > 0 && (
                <div style={{ padding: "14px 18px" }}>
                  <p style={{ fontFamily: FT, fontSize: 11, color: MUTED, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Specializations
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {specializations.map((s) => (
                      <span key={s} style={{
                        fontFamily: FT, fontSize: 12, color: AMBER,
                        background: "rgba(255,204,0,0.08)", border: "1px solid rgba(255,204,0,0.2)",
                        padding: "5px 12px", borderRadius: 20,
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Edit settings */}
            <Link href="/settings"
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", borderRadius: 14,
                background: CARD, border: `1px solid ${BORDER}`,
                textDecoration: "none",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Settings size={15} style={{ color: MUTED }} />
                <p style={{ fontFamily: FT, fontSize: 14, color: TEXT }}>Edit profile & settings</p>
              </div>
              <ChevronDown size={14} style={{ color: MUTED, transform: "rotate(-90deg)" }} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
