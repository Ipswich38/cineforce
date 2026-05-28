"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, AVAILABILITY, EXPERIENCE_LEVELS, RATE_UNITS } from "@/lib/constants";
import {
  Bell, LogOut, ExternalLink, Zap, Clock, CheckCircle2, Star,
  X, Check, ChevronDown, MapPin, Briefcase, DollarSign, User, MessageSquare,
} from "lucide-react";
import { getTierInfo, getTierById } from "@/lib/foundingTiers";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#000000";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";

type Request = {
  id: string;
  status: string;
  project_title: string;
  message: string | null;
  created_at: string;
  requester: { email: string } | null;
};

const AVATAR_COLORS = ["#4A9EFF", "#32D74B", "#AF52DE", "#FF6B35", "#FF9F0A"];

function Avatar({ email, size = 36 }: { email: string; size?: number }) {
  const idx = email.charCodeAt(0) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[idx];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `${color}14`, border: `1.5px solid ${color}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontFamily: FD, fontWeight: 700, fontSize: size * 0.38, color }}>
        {email.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function RequestCard({
  req,
  onRespond,
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
      borderRadius: 14,
      background: SURFACE,
      border: "1px solid rgba(255,159,10,0.2)",
      borderLeft: "3px solid #FF9F0A",
    }}>
      <div style={{ padding: "14px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: req.message ? 10 : 14 }}>
          <Avatar email={req.requester?.email ?? "?"} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT, lineHeight: 1.3 }}>
              {req.project_title}
            </p>
            <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 3 }}>
              {req.requester?.email ?? "Anonymous"} &middot; {date}
            </p>
          </div>
        </div>

        {req.message && (
          <p style={{
            fontFamily: FT, fontSize: 13, color: "rgba(247,247,242,0.6)",
            lineHeight: 1.65, marginBottom: 14,
            padding: "9px 12px", borderRadius: 8,
            background: "rgba(255,255,255,0.03)",
            borderLeft: "2px solid rgba(255,255,255,0.1)",
          }}>
            {req.message}
          </p>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => handle("skipped")}
            disabled={acting !== null}
            style={{
              flex: 1, padding: "10px 8px", borderRadius: 10,
              background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
              color: MUTED, fontFamily: FT, fontSize: 13, fontWeight: 500,
              cursor: acting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              opacity: acting === "skipping" ? 0.5 : 1, transition: "opacity 0.15s",
            }}>
            Skip For Now
          </button>
          <button
            onClick={() => handle("accepted")}
            disabled={acting !== null}
            style={{
              flex: 2, padding: "10px 8px", borderRadius: 10,
              background: acting === "accepting" ? "rgba(255,179,0,0.5)" : AMBER,
              border: "none", color: "#000",
              fontFamily: FT, fontSize: 13, fontWeight: 700,
              cursor: acting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              opacity: acting === "skipping" ? 0.5 : 1, transition: "all 0.15s",
            }}>
            <Check size={13} />
            {acting === "accepting" ? "Accepting…" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({
  profile, requests, userEmail, activatedCount, specializations, subStatus, daysLeft,
}: {
  profile: Record<string, unknown> | null;
  requests: Request[];
  userEmail: string;
  activatedCount: number;
  specializations: string[];
  subStatus: string;
  daysLeft: number;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [reqs,            setReqs]            = useState(requests);
  const [activeTab,       setActiveTab]       = useState<"inbox" | "card">("inbox");
  const [signingOut,      setSigningOut]      = useState(false);
  const [premiumStatus,   setPremiumStatus]   = useState<string>((profile?.premium_status as string) ?? "free");
  const [requesting,      setRequesting]      = useState(false);
  const [reqError,        setReqError]        = useState("");
  const [availability,    setAvailability]    = useState<string>((profile?.availability as string) ?? "available");
  const [showAvailPicker, setShowAvailPicker] = useState(false);
  const [togglingAvail,   setTogglingAvail]   = useState(false);

  const pending   = reqs.filter((r) => r.status === "pending");
  const responded = reqs.filter((r) => r.status !== "pending");

  // Extract typed values from profile (Record<string, unknown>) to avoid unknown in JSX
  const profileId       = (profile?.id            as string  | undefined) ?? "";
  const profileSlug     = (profile?.slug          as string  | undefined) ?? "";
  const displayName     = (profile?.display_name  as string  | undefined) ?? "";
  const profileCity     = (profile?.city          as string  | undefined) ?? "";
  const profileBio      = (profile?.bio           as string  | null) ?? null;
  const rateMin         = (profile?.rate_min      as number  | null) ?? null;
  const rateMax         = (profile?.rate_max      as number  | null) ?? null;
  const foundingTier    = (profile?.founding_tier as string  | null) ?? null;

  const roleLabel     = profile ? (ROLES.find((r) => r.id === (profile.role as string))?.label ?? (profile.role as string)) : "";
  const roleIcon      = profile ? (ROLES.find((r) => r.id === (profile.role as string))?.icon ?? "") : "";
  const availItem     = AVAILABILITY.find((a) => a.id === availability);
  const expLabel      = EXPERIENCE_LEVELS.find((e) => e.id === (profile?.experience_level as string))?.label ?? "";
  const rateUnitLabel = RATE_UNITS.find((u) => u.id === (profile?.rate_unit as string))?.label ?? "Per Day";

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

  async function requestPremium() {
    setRequesting(true);
    setReqError("");
    const res = await fetch("/api/premium-request", { method: "POST" });
    if (res.ok) {
      setPremiumStatus("requested");
    } else {
      const body = await res.json() as { error?: string };
      setReqError(body.error ?? "Something went wrong. Try again.");
    }
    setRequesting(false);
  }

  return (
    <div className="mobile-nav-pad" style={{ background: BG, minHeight: "100dvh" }}>

      {/* ── Header ── */}
      <div style={{
        background: "rgba(10,10,12,0.96)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${BORDER}`,
        position: "sticky", top: 0, zIndex: 40,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div className="app-container-narrow topbar-inner">
          <Link href="/" style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, letterSpacing: "-0.02em" }}>
            CineVerse
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Notification bell */}
            <button
              onClick={() => setActiveTab("inbox")}
              style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: pending.length > 0 ? AMBER : MUTED, display: "flex", padding: 4 }}>
              <Bell size={20} strokeWidth={pending.length > 0 ? 2.2 : 1.7} />
              {pending.length > 0 && (
                <span style={{
                  position: "absolute", top: 0, right: 0,
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: "#FF3B30", border: "2px solid #000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: FT, fontSize: 9, fontWeight: 700, color: "#fff",
                  padding: "0 3px",
                }}>
                  {pending.length > 9 ? "9+" : pending.length}
                </span>
              )}
            </button>

            <Link href="/help"
              style={{ fontFamily: FT, fontSize: 13, color: MUTED, textDecoration: "none" }}
              className="hover:opacity-70 transition-opacity hidden sm:block">
              Help
            </Link>
            <Link href="/settings"
              style={{ fontFamily: FT, fontSize: 13, color: MUTED, textDecoration: "none" }}
              className="hover:opacity-70 transition-opacity hidden sm:block">
              Settings
            </Link>
            <button onClick={signOut} disabled={signingOut}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: signingOut ? MUTED : "#FF453A",
                display: "flex", alignItems: "center", gap: 5,
                fontFamily: FT, fontSize: 13,
              }}>
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="app-container-narrow app-page-pad">

        {/* ── Profile summary ── */}
        {profile && (
          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontFamily: FD, fontWeight: 700,
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              color: TEXT, letterSpacing: "-0.025em", marginBottom: 4,
            }}>
              {displayName.split(" ")[0]}
            </h1>
            <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, marginBottom: 14 }}>
              {roleLabel} &middot; {profileCity}
            </p>

            {/* Availability pill + picker */}
            <div style={{ position: "relative", display: "inline-block" }}>
              <button
                onClick={() => setShowAvailPicker((v) => !v)}
                disabled={togglingAvail}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 14px", borderRadius: 999,
                  background: `${availItem?.color ?? MUTED}12`,
                  border: `1px solid ${availItem?.color ?? MUTED}28`,
                  cursor: togglingAvail ? "not-allowed" : "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: availItem?.color ?? MUTED, flexShrink: 0 }} />
                <span style={{ fontFamily: FT, fontSize: 13, fontWeight: 500, color: availItem?.color ?? MUTED }}>
                  {availItem?.label}
                </span>
                <ChevronDown size={11} style={{ color: availItem?.color ?? MUTED, opacity: 0.6 }} />
              </button>

              {showAvailPicker && (
                <>
                  <div
                    onClick={() => setShowAvailPicker(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 60 }}
                  />
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", left: 0,
                    background: "#1c1c1e", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 14, overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
                    zIndex: 61, minWidth: 196,
                  }}>
                    {AVAILABILITY.map((a, i) => (
                      <button key={a.id} onClick={() => changeAvailability(a.id)}
                        style={{
                          width: "100%", padding: "12px 16px",
                          display: "flex", alignItems: "center", gap: 10,
                          background: availability === a.id ? `${a.color}10` : "none",
                          border: "none",
                          borderBottom: i < AVAILABILITY.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                          cursor: "pointer", textAlign: "left",
                        }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
                        <span style={{ fontFamily: FT, fontSize: 14, color: availability === a.id ? a.color : TEXT, flex: 1 }}>{a.label}</span>
                        {availability === a.id && <Check size={13} style={{ color: a.color }} />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Membership banner ── */}
        {subStatus === "active" ? (
          <a href="/subscribe" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 12,
              background: "rgba(255,204,0,0.05)", border: "1px solid rgba(255,204,0,0.14)",
            }}>
              <Zap size={13} style={{ color: AMBER, flexShrink: 0 }} />
              <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(247,247,242,0.55)", flex: 1 }}>
                <strong style={{ color: AMBER, fontWeight: 600 }}>Founding Member</strong> — full access during beta
              </p>
              <span style={{ fontFamily: FT, fontSize: 11, color: "rgba(255,204,0,0.5)", flexShrink: 0 }}>Learn more</span>
            </div>
          </a>
        ) : (
          <a href="/subscribe" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 12,
              background: (subStatus === "expired" || daysLeft <= 0)
                ? "rgba(255,69,58,0.07)"
                : daysLeft <= 3
                  ? "rgba(255,159,10,0.08)"
                  : "rgba(255,204,0,0.07)",
              border: `1px solid ${(subStatus === "expired" || daysLeft <= 0) ? "rgba(255,69,58,0.2)" : daysLeft <= 3 ? "rgba(255,159,10,0.22)" : "rgba(255,204,0,0.18)"}`,
            }}>
              <Zap size={15} style={{
                color: (subStatus === "expired" || daysLeft <= 0) ? "#FF453A" : daysLeft <= 3 ? "#FF9F0A" : AMBER,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: FT, fontSize: 13, fontWeight: 600,
                  color: (subStatus === "expired" || daysLeft <= 0) ? "#FF453A" : daysLeft <= 3 ? "#FF9F0A" : AMBER,
                }}>
                  {(subStatus === "expired" || daysLeft <= 0)
                    ? "Trial ended"
                    : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left in trial`}
                </p>
                <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 1 }}>
                  {(subStatus === "expired" || daysLeft <= 0)
                    ? "Subscribe to keep your profile active and visible."
                    : "Subscribe for uninterrupted access at ₱150/month."}
                </p>
              </div>
              <span style={{
                fontFamily: FT, fontSize: 12, fontWeight: 600,
                color: (subStatus === "expired" || daysLeft <= 0) ? "#FF453A" : AMBER,
                flexShrink: 0,
              }}>
                Subscribe
              </span>
            </div>
          </a>
        )}

        {/* ── Tabs ── */}
        <div style={{
          display: "flex",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 12, padding: 4, marginBottom: 24, gap: 3,
        }}>
          {([
            { id: "inbox" as const, label: pending.length > 0 ? `Inbox (${pending.length})` : "Inbox" },
            { id: "card"  as const, label: "My Card" },
          ]).map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 9, border: "none", cursor: "pointer",
                background: activeTab === id ? SURFACE : "transparent",
                color: activeTab === id ? TEXT : MUTED,
                fontFamily: FT, fontSize: 14, fontWeight: activeTab === id ? 600 : 400,
                boxShadow: activeTab === id ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                transition: "all 0.15s",
                position: "relative",
              }}>
              {id === "inbox" && pending.length > 0 && activeTab !== "inbox" && (
                <span style={{
                  position: "absolute", top: 8, right: 14,
                  width: 6, height: 6, borderRadius: "50%", background: "#FF3B30",
                }} />
              )}
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════ INBOX ══════════════ */}
        {activeTab === "inbox" && (
          <div>
            {pending.length === 0 && responded.length === 0 && (
              <div style={{
                textAlign: "center", padding: "52px 24px",
                background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bell size={22} style={{ color: MUTED }} />
                </div>
                <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 16, color: TEXT, marginBottom: 6 }}>Inbox is empty</p>
                <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.6, maxWidth: 240, margin: "0 auto" }}>
                  New project requests from productions will appear here.
                </p>
              </div>
            )}

            {/* New requests banner */}
            {pending.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 14px", borderRadius: 10, marginBottom: 14,
                  background: "rgba(255,179,0,0.07)", border: "1px solid rgba(255,179,0,0.16)",
                }}>
                  <Bell size={13} style={{ color: AMBER, flexShrink: 0 }} />
                  <p style={{ fontFamily: FT, fontSize: 13, color: AMBER, fontWeight: 500 }}>
                    {pending.length} new request{pending.length !== 1 ? "s" : ""} — tap Accept or Skip
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pending.map((req) => (
                    <RequestCard key={req.id} req={req} onRespond={respond} />
                  ))}
                </div>
              </div>
            )}

            {/* Previous responses */}
            {responded.length > 0 && (
              <div>
                <p style={{
                  fontFamily: FT, fontSize: 11, fontWeight: 600, color: MUTED,
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
                }}>
                  Earlier
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {responded.map((req) => {
                    const d = new Date(req.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
                    const statusColor = req.status === "accepted" ? "#32D74B" : req.status === "skipped" ? MUTED : "#FF453A";
                    const statusBg    = req.status === "accepted" ? "rgba(50,215,75,0.1)" : req.status === "skipped" ? "rgba(255,255,255,0.06)" : "rgba(255,69,58,0.08)";
                    const statusText  = req.status === "accepted" ? "Accepted" : req.status === "skipped" ? "Skipped" : "Declined";
                    return (
                      <div key={req.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                        padding: "11px 14px", borderRadius: 12,
                        background: SURFACE, border: `1px solid ${BORDER}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          <Avatar email={req.requester?.email ?? "?"} size={30} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: FT, fontSize: 13, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {req.project_title}
                            </p>
                            <p style={{ fontFamily: FT, fontSize: 11, color: MUTED }}>{d}</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {req.status === "accepted" && (
                            <Link href={`/chat/${req.id}`}
                              style={{
                                display: "flex", alignItems: "center", gap: 4,
                                padding: "4px 10px", borderRadius: 8,
                                background: "rgba(255,204,0,0.08)", border: "1px solid rgba(255,204,0,0.2)",
                                fontFamily: FT, fontSize: 12, fontWeight: 500, color: AMBER,
                                textDecoration: "none",
                              }}>
                              <MessageSquare size={11} /> Chat
                            </Link>
                          )}
                          <span style={{
                            fontFamily: FT, fontSize: 11, fontWeight: 500,
                            padding: "3px 10px", borderRadius: 20,
                            background: statusBg, color: statusColor,
                          }}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════ MY CARD ══════════════ */}
        {activeTab === "card" && profile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* View public profile row */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", borderRadius: 12,
              background: SURFACE, border: `1px solid ${BORDER}`,
            }}>
              <p style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>Your public card</p>
              <Link href={`/crew/${profileSlug}`} target="_blank"
                style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: FT, fontSize: 13, color: "#4A9EFF", textDecoration: "none" }}
                className="hover:opacity-70 transition-opacity">
                View <ExternalLink size={11} />
              </Link>
            </div>

            {/* Profile card */}
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>

              {/* Role header */}
              <div style={{ padding: "16px 18px", background: "rgba(255,255,255,0.015)", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24, lineHeight: 1 }}>{roleIcon}</span>
                  <div>
                    <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT }}>{roleLabel}</p>
                    <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 1 }}>{expLabel}</p>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: `1px solid ${BORDER}` }}>
                <User size={14} style={{ color: MUTED, flexShrink: 0 }} />
                <span style={{ fontFamily: FT, fontSize: 13, color: MUTED, minWidth: 76 }}>Name</span>
                <span style={{ fontFamily: FT, fontSize: 14, color: TEXT }}>{displayName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: `1px solid ${BORDER}` }}>
                <MapPin size={14} style={{ color: MUTED, flexShrink: 0 }} />
                <span style={{ fontFamily: FT, fontSize: 13, color: MUTED, minWidth: 76 }}>City</span>
                <span style={{ fontFamily: FT, fontSize: 14, color: TEXT }}>{profileCity}</span>
              </div>

              {/* Rate */}
              {(rateMin != null || rateMax != null) && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: `1px solid ${BORDER}` }}>
                  <DollarSign size={14} style={{ color: MUTED, flexShrink: 0 }} />
                  <span style={{ fontFamily: FT, fontSize: 13, color: MUTED, minWidth: 76 }}>Rate</span>
                  <span style={{ fontFamily: FT, fontSize: 14, color: TEXT }}>
                    ₱{rateMin != null ? rateMin.toLocaleString() : "?"} – ₱{rateMax != null ? rateMax.toLocaleString() : "?"}{" "}
                    <span style={{ color: MUTED }}>/ {rateUnitLabel.toLowerCase()}</span>
                  </span>
                </div>
              )}

              {/* Bio */}
              {profileBio && (
                <div style={{ display: "flex", gap: 12, padding: "12px 18px", borderBottom: `1px solid ${BORDER}` }}>
                  <Briefcase size={14} style={{ color: MUTED, flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 5 }}>Bio</p>
                    <p style={{ fontFamily: FT, fontSize: 13, color: TEXT, lineHeight: 1.65 }}>{profileBio}</p>
                  </div>
                </div>
              )}

              {/* Specializations */}
              {specializations.length > 0 && (
                <div style={{ padding: "12px 18px" }}>
                  <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Specializations
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {specializations.map((s) => (
                      <span key={s} style={{
                        fontFamily: FT, fontSize: 12, color: AMBER,
                        background: "rgba(255,179,0,0.08)", border: "1px solid rgba(255,179,0,0.18)",
                        padding: "4px 10px", borderRadius: 20,
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Premium / Activation card */}
            {premiumStatus === "active" && (() => {
              const tier = getTierById(foundingTier);
              return (
                <div style={{
                  padding: "16px 18px", borderRadius: 14,
                  background: "rgba(50,215,75,0.05)", border: "1px solid rgba(50,215,75,0.2)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <CheckCircle2 size={20} style={{ color: "#32D74B", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 14, color: TEXT }}>Active</p>
                      {tier && (
                        <span style={{
                          fontFamily: FT, fontSize: 11, fontWeight: 700, color: tier.color,
                          background: `${tier.color}15`, border: `1px solid ${tier.color}30`,
                          padding: "2px 9px", borderRadius: 20,
                        }}>
                          {tier.label}
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 2 }}>
                      Your card is live and accepting requests.
                    </p>
                  </div>
                  <Star size={15} style={{ color: tier?.color ?? "#32D74B", flexShrink: 0 }} />
                </div>
              );
            })()}

            {premiumStatus === "requested" && (
              <div style={{
                padding: "16px 18px", borderRadius: 14,
                background: "rgba(255,159,10,0.05)", border: "1px solid rgba(255,159,10,0.2)",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <Clock size={20} style={{ color: "#FF9F0A", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 14, color: TEXT }}>Activation Pending</p>
                  <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.55 }}>
                    We received your request and will reach out to{" "}
                    <strong style={{ color: TEXT }}>{userEmail}</strong> to complete activation.
                  </p>
                </div>
              </div>
            )}

            {premiumStatus === "free" && (() => {
              const tierInfo = getTierInfo(activatedCount);
              return (
                <div style={{ padding: "18px", borderRadius: 14, background: SURFACE, border: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                    <Zap size={18} style={{ color: AMBER, flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 14, color: TEXT }}>Request Activation</p>
                      {tierInfo ? (
                        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.55 }}>
                          You&apos;d join as a{" "}
                          <strong style={{ color: tierInfo.color }}>{tierInfo.label}</strong>
                          {" — "}
                          <strong style={{ color: TEXT }}>{tierInfo.spotsLeft} spot{tierInfo.spotsLeft !== 1 ? "s" : ""} left</strong>.
                        </p>
                      ) : (
                        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 4 }}>
                          Activate to appear in search and accept gig requests.
                        </p>
                      )}
                    </div>
                  </div>
                  {reqError && (
                    <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A", marginBottom: 10 }}>{reqError}</p>
                  )}
                  <button
                    onClick={requestPremium}
                    disabled={requesting}
                    style={{
                      width: "100%", padding: "12px", borderRadius: 12, border: "none",
                      background: requesting ? "rgba(255,179,0,0.5)" : AMBER,
                      color: "#000", fontFamily: FT, fontSize: 14, fontWeight: 700,
                      cursor: requesting ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                    className="transition-all hover:opacity-85 active:scale-[0.98]">
                    <Zap size={14} />
                    {requesting ? "Sending…" : "Request Activation"}
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
