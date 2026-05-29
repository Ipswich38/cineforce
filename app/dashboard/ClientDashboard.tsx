"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, PROJECT_TYPES } from "@/lib/constants";
import { LogOut, Search, Heart, Inbox, ExternalLink, CheckCircle2, X, Clock, Zap, MessageSquare } from "lucide-react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#000000";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";

export type CrewSnap = {
  id: string;
  slug: string;
  display_name: string;
  role: string;
  city: string;
  premium_status: string;
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

const STATUS_COLORS: Record<string, string> = {
  pending:  "#FF9F0A",
  accepted: "#32D74B",
  declined: "#FF453A",
  skipped:  "#8E8E93",
};

const STATUS_LABELS: Record<string, string> = {
  pending:  "Pending",
  accepted: "Accepted",
  declined: "Declined",
  skipped:  "Unable to commit",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? MUTED;
  return (
    <span style={{
      flexShrink: 0, fontFamily: FT, fontSize: 11, fontWeight: 600,
      padding: "3px 10px", borderRadius: 20,
      background: `${color}18`, color,
    }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "accepted") return <CheckCircle2 size={14} style={{ color: "#32D74B", flexShrink: 0 }} />;
  if (status === "declined") return <X size={14} style={{ color: "#FF453A", flexShrink: 0 }} />;
  return <Clock size={14} style={{ color: "#FF9F0A", flexShrink: 0 }} />;
}

function TrialBanner({ subStatus, daysLeft }: { subStatus: string; daysLeft: number }) {
  // During beta (IS_BETA = true) subStatus is always "active" — show founding member badge
  if (subStatus === "active") {
    return (
      <Link href="/subscribe" style={{ textDecoration: "none" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 12, marginBottom: 20,
          background: "rgba(255,204,0,0.05)", border: "1px solid rgba(255,204,0,0.14)",
        }}>
          <Zap size={13} style={{ color: AMBER, flexShrink: 0 }} />
          <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(247,247,242,0.55)", flex: 1 }}>
            <strong style={{ color: AMBER, fontWeight: 600 }}>Founding Member</strong> — full access during beta
          </p>
          <span style={{ fontFamily: FT, fontSize: 11, color: "rgba(255,204,0,0.5)", flexShrink: 0 }}>Learn more</span>
        </div>
      </Link>
    );
  }

  const expired = subStatus === "expired" || daysLeft <= 0;
  const urgent  = !expired && daysLeft <= 3;

  return (
    <Link href="/subscribe" style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", borderRadius: 12, marginBottom: 20,
        background: expired
          ? "rgba(255,69,58,0.07)"
          : urgent
            ? "rgba(255,159,10,0.08)"
            : "rgba(255,204,0,0.07)",
        border: `1px solid ${expired ? "rgba(255,69,58,0.2)" : urgent ? "rgba(255,159,10,0.22)" : "rgba(255,204,0,0.18)"}`,
      }}>
        <Zap size={15} style={{ color: expired ? "#FF453A" : urgent ? "#FF9F0A" : AMBER, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: FT, fontSize: 13, fontWeight: 600, color: expired ? "#FF453A" : urgent ? "#FF9F0A" : AMBER }}>
            {expired ? "Trial ended" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left in trial`}
          </p>
          <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 1 }}>
            {expired ? "Subscribe to keep browsing and connecting." : "Subscribe for uninterrupted access at ₱150/month."}
          </p>
        </div>
        <span style={{ fontFamily: FT, fontSize: 12, fontWeight: 600, color: expired ? "#FF453A" : AMBER, flexShrink: 0 }}>
          Subscribe
        </span>
      </div>
    </Link>
  );
}

export default function ClientDashboard({
  profile,
  sentRequests,
  favorites,
  userEmail,
  subStatus,
  daysLeft,
}: {
  profile: Record<string, unknown>;
  sentRequests: SentRequest[];
  favorites: Favorite[];
  userEmail: string;
  subStatus: string;
  daysLeft: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab,  setActiveTab]  = useState<"requests" | "saved">("requests");
  const [signingOut, setSigningOut] = useState(false);
  const [savedList,  setSavedList]  = useState<Favorite[]>(favorites);

  const displayName    = (profile?.display_name  as string | undefined) ?? userEmail.split("@")[0];
  const company        = (profile?.company        as string | null) ?? null;
  const city           = (profile?.city           as string | null) ?? null;
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

      {/* Header */}
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

      <div className="app-container-narrow app-page-pad">

        {/* Profile summary */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: FD, fontWeight: 700,
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            color: TEXT, letterSpacing: "-0.025em", marginBottom: 4,
          }}>
            {displayName.split(" ")[0]}
          </h1>
          <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, marginBottom: company || city ? 6 : 0 }}>
            {[company, city, ptLabel].filter(Boolean).join(" · ")}
          </p>
        </div>

        {/* Trial banner */}
        <TrialBanner subStatus={subStatus} daysLeft={daysLeft} />

        {/* Browse CTA */}
        <Link href="/search"
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 18px", borderRadius: 14, marginBottom: 24,
            background: "rgba(255,204,0,0.07)", border: "1px solid rgba(255,204,0,0.18)",
            textDecoration: "none",
          }}
          className="transition-all hover:bg-amber-400/10 active:scale-[0.99]">
          <Search size={16} style={{ color: AMBER, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 600, color: AMBER }}>Browse Crew</p>
            <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 1 }}>Find and connect with film and media professionals.</p>
          </div>
        </Link>

        {/* Tabs */}
        <div style={{
          display: "flex",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 12, padding: 4, marginBottom: 24, gap: 3,
        }}>
          {([
            { id: "requests" as const, label: pending.length > 0 ? `Requests (${pending.length})` : "Requests" },
            { id: "saved"    as const, label: savedList.length > 0 ? `Saved (${savedList.length})` : "Saved" },
          ]).map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 9, border: "none", cursor: "pointer",
                background: activeTab === id ? SURFACE : "transparent",
                color: activeTab === id ? TEXT : MUTED,
                fontFamily: FT, fontSize: 14, fontWeight: activeTab === id ? 600 : 400,
                boxShadow: activeTab === id ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                transition: "all 0.15s", position: "relative",
              }}>
              {id === "requests" && pending.length > 0 && activeTab !== "requests" && (
                <span style={{
                  position: "absolute", top: 8, right: 14,
                  width: 6, height: 6, borderRadius: "50%", background: "#FF9F0A",
                }} />
              )}
              {label}
            </button>
          ))}
        </div>

        {/* ── Requests tab ── */}
        {activeTab === "requests" && (
          <div>
            {sentRequests.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "52px 24px",
                background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Inbox size={22} style={{ color: MUTED }} />
                </div>
                <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 16, color: TEXT, marginBottom: 6 }}>No requests yet</p>
                <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.6, maxWidth: 240, margin: "0 auto" }}>
                  Connect with crew from their profile page and your requests will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sentRequests.map((req) => {
                  const date = new Date(req.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
                  return (
                    <div key={req.id} style={{
                      background: SURFACE, border: `1px solid ${BORDER}`,
                      borderRadius: 14, padding: "14px 16px",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: req.crew ? 10 : 0 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT, lineHeight: 1.3, marginBottom: 3 }}>
                            {req.project_title}
                          </p>
                          <p style={{ fontFamily: FT, fontSize: 12, color: MUTED }}>{date}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <StatusIcon status={req.status} />
                          <StatusBadge status={req.status} />
                        </div>
                      </div>

                      {req.crew && (
                        <Link href={`/crew/${req.crew.slug}`}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "9px 12px", borderRadius: 10,
                            background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`,
                            textDecoration: "none",
                          }}
                          className="hover:bg-white/[0.05] transition-colors">
                          <div>
                            <p style={{ fontFamily: FT, fontSize: 13, fontWeight: 500, color: TEXT }}>
                              {req.crew.display_name}
                            </p>
                            <p style={{ fontFamily: FT, fontSize: 11, color: MUTED, marginTop: 1 }}>
                              {roleLabel(req.crew.role)} &middot; {req.crew.city}
                            </p>
                          </div>
                          <ExternalLink size={12} style={{ color: MUTED, flexShrink: 0 }} />
                        </Link>
                      )}

                      {req.message && (
                        <p style={{
                          fontFamily: FT, fontSize: 13, color: "rgba(247,247,242,0.5)",
                          lineHeight: 1.6, marginTop: 10,
                          padding: "8px 10px", borderRadius: 8,
                          background: "rgba(255,255,255,0.02)",
                          borderLeft: "2px solid rgba(255,255,255,0.08)",
                        }}>
                          {req.message}
                        </p>
                      )}

                      {req.status === "skipped" && (
                        <p style={{
                          fontFamily: FT, fontSize: 13, color: "rgba(247,247,242,0.58)",
                          lineHeight: 1.6, marginTop: 10,
                          padding: "9px 11px", borderRadius: 9,
                          background: "rgba(255,255,255,0.035)",
                          border: `1px solid ${BORDER}`,
                        }}>
                          This crew member was extended on an on-going project and can&apos;t commit to your schedule right now.
                        </p>
                      )}

                      {req.status === "accepted" && (
                        <Link href={`/chat/${req.id}`}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            padding: "10px", borderRadius: 10, marginTop: 10,
                            background: "rgba(255,204,0,0.07)", border: "1px solid rgba(255,204,0,0.18)",
                            fontFamily: FT, fontSize: 13, fontWeight: 600, color: AMBER,
                            textDecoration: "none",
                          }}
                          className="hover:bg-amber-400/10 transition-colors">
                          <MessageSquare size={14} />
                          Open Chat
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Saved tab ── */}
        {activeTab === "saved" && (
          <div>
            {savedList.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "52px 24px",
                background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Heart size={22} style={{ color: MUTED }} />
                </div>
                <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 16, color: TEXT, marginBottom: 6 }}>No saved crew yet</p>
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
                      background: SURFACE, border: `1px solid ${BORDER}`,
                      borderRadius: 14, padding: "12px 14px",
                    }}>
                      <Link href={`/crew/${fav.crew.slug}`}
                        style={{ flex: 1, minWidth: 0, textDecoration: "none" }}>
                        <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT, marginBottom: 2 }}>
                          {fav.crew.display_name}
                        </p>
                        <p style={{ fontFamily: FT, fontSize: 12, color: MUTED }}>
                          {roleLabel(fav.crew.role)} &middot; {fav.crew.city}
                          {fav.crew.premium_status === "active" && (
                            <span style={{ color: AMBER, marginLeft: 6 }}>Active</span>
                          )}
                        </p>
                      </Link>
                      <Link href={`/crew/${fav.crew.slug}`}
                        style={{ color: "#4A9EFF", flexShrink: 0 }}
                        className="hover:opacity-70 transition-opacity">
                        <ExternalLink size={14} />
                      </Link>
                      <button
                        onClick={() => removeFavorite(fav.id)}
                        style={{
                          background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.18)",
                          borderRadius: 8, padding: "6px 8px", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}
                        className="hover:bg-red-500/20 transition-colors">
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
