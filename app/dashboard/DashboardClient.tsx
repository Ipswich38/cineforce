"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, AVAILABILITY } from "@/lib/constants";
import { Check, X, Bell, LogOut, ExternalLink, Zap, Clock, CheckCircle2, Star } from "lucide-react";
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

export default function DashboardClient({
  profile, requests, userEmail, activatedCount,
}: {
  profile: Record<string, unknown> | null;
  requests: Request[];
  userEmail: string;
  activatedCount: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [reqs,          setReqs]          = useState(requests);
  const [activeTab,     setActiveTab]     = useState<"requests" | "profile">("requests");
  const [signingOut,    setSigningOut]    = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<string>((profile?.premium_status as string) ?? "free");
  const [requesting,    setRequesting]    = useState(false);
  const [reqError,      setReqError]      = useState("");

  const pending   = reqs.filter((r) => r.status === "pending");
  const responded = reqs.filter((r) => r.status !== "pending");

  const roleLabel  = profile ? (ROLES.find((r) => r.id === (profile.role as string))?.label ?? (profile.role as string)) : "";
  const availLabel = profile ? (AVAILABILITY.find((a) => a.id === (profile.availability as string))?.label ?? "") : "";
  const availColor = profile ? (AVAILABILITY.find((a) => a.id === (profile.availability as string))?.color ?? MUTED) : MUTED;

  async function respond(id: string, status: "accepted" | "declined") {
    await supabase.from("connection_requests").update({ status }).eq("id", id);
    setReqs((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  }

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
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
      {/* Nav */}
      <div style={{ background: "rgba(12,12,15,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 40, paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="app-container-narrow topbar-inner">
          <Link href="/" style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, letterSpacing: "-0.02em" }}>
            YourNextCrew
          </Link>
          <div className="nav-actions">
            {profile && (
              <Link href={`/crew/${profile.slug as string}`} target="_blank"
                className="hidden sm:flex items-center gap-1.5 transition-opacity hover:opacity-70"
                style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>
                View profile <ExternalLink size={12} />
              </Link>
            )}
            <button onClick={signOut} disabled={signingOut}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
              style={{ background: "none", border: "none", fontFamily: FT, fontSize: 13, color: "#FF453A" }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="app-container-narrow app-page-pad">
        {/* Welcome header */}
        <div className="mb-10">
          <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: TEXT, letterSpacing: "-0.025em" }}>
            {profile ? (profile.display_name as string).split(" ")[0] : "Dashboard"}
          </h1>
          <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, marginTop: 6 }}>
            {profile ? `${roleLabel} · ${profile.city as string}` : userEmail}
          </p>
        </div>

        {/* Stats strip */}
        <div className="responsive-stats mb-8">
          {[
            { label: "Pending", value: pending.length,                                    color: "#FF9F0A" },
            { label: "Accepted",         value: responded.filter((r) => r.status === "accepted").length, color: "#32D74B" },
            { label: "Total",   value: reqs.length,                                       color: "#4A9EFF" },
          ].map((s) => (
            <div key={s.label} className="app-surface p-5 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 28, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</p>
              <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Availability quick-toggle */}
        {profile && (
          <div className="app-surface mobile-stack p-5 mb-6 flex items-center justify-between" style={{ background: SURFACE, border: `1px solid ${BORDER}`, gap: 14 }}>
            <div className="flex items-center gap-3">
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: availColor, display: "inline-block" }} />
              <span style={{ fontFamily: FT, fontSize: 15, color: TEXT }}>
                <strong style={{ color: TEXT }}>{availLabel}</strong>
              </span>
            </div>
            <Link href="/dashboard/edit"
              style={{ fontFamily: FT, fontSize: 13, fontWeight: 500, color: AMBER }}
              className="hover:opacity-70 transition-opacity">
              Edit
            </Link>
          </div>
        )}

        {/* Premium status card */}
        {profile && (
          <div className="app-surface mb-6 overflow-hidden" style={{
            background: SURFACE,
            border: premiumStatus === "active"
              ? "1px solid rgba(50,215,75,0.2)"
              : premiumStatus === "requested"
                ? "1px solid rgba(255,159,10,0.2)"
                : `1px solid ${BORDER}`,
          }}>
            {premiumStatus === "active" && (() => {
              const tier = getTierById(profile?.founding_tier as string | null);
              return (
                <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                  <CheckCircle2 size={22} style={{ color: "#32D74B", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: TEXT }}>Active</p>
                      {tier && (
                        <span style={{ fontFamily: FT, fontSize: 11, fontWeight: 700, color: tier.color, background: `${tier.color}15`, border: `1px solid ${tier.color}30`, padding: "2px 9px", borderRadius: 20 }}>
                          {tier.label}
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 2, lineHeight: 1.5 }}>
                      Your profile is live. You&apos;re accepting gig requests.
                    </p>
                  </div>
                  <Star size={16} style={{ color: tier?.color ?? "#32D74B", flexShrink: 0 }} />
                </div>
              );
            })()}

            {premiumStatus === "requested" && (
              <div style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <Clock size={22} style={{ color: "#FF9F0A", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: TEXT }}>Activation Pending</p>
                  <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.6 }}>
                    We&apos;ve received your request and will reach out to <strong style={{ color: TEXT }}>{userEmail}</strong> to complete your activation.
                  </p>
                </div>
              </div>
            )}

            {premiumStatus === "free" && (() => {
              const tierInfo = getTierInfo(activatedCount);
              return (
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                    <Zap size={20} style={{ color: AMBER, flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: TEXT }}>Request Activation</p>
                      {tierInfo ? (
                        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.6 }}>
                          You&apos;d join as a{" "}
                          <strong style={{ color: tierInfo.color }}>{tierInfo.label}</strong>
                          {" "}—{" "}
                          <strong style={{ color: TEXT }}>{tierInfo.spotsLeft} spot{tierInfo.spotsLeft !== 1 ? "s" : ""} left</strong>{" "}
                          in this batch.
                        </p>
                      ) : (
                        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.6 }}>
                          Activate to appear in search and receive gig requests.
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
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}
                    className="transition-all hover:opacity-85 active:scale-[0.98]">
                    <Zap size={15} />
                    {requesting ? "Sending request…" : "Request Activation"}
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 mb-8 mobile-full" style={{ background: "#080808", display: "inline-flex", borderRadius: 8 }}>
          {(["requests", "profile"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="rounded-xl px-5 py-2 text-[14px] font-medium transition-all"
              style={{
                fontFamily: FT,
                background: activeTab === tab ? SURFACE : "transparent",
                color: activeTab === tab ? TEXT : MUTED,
                boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                border: activeTab === tab ? `1px solid ${BORDER}` : "1px solid transparent",
              }}>
              {tab === "requests" ? `Requests${pending.length > 0 ? ` (${pending.length})` : ""}` : "Card"}
            </button>
          ))}
        </div>

        {/* Requests tab */}
        {activeTab === "requests" && (
          <div className="flex flex-col gap-4">
            {pending.length === 0 && responded.length === 0 && (
              <div className="app-surface p-10 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                <Bell size={28} style={{ color: MUTED, margin: "0 auto 12px" }} />
                <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 17, color: TEXT }}>No requests</p>
                <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, marginTop: 6 }}>
                  New project leads appear here.
                </p>
              </div>
            )}

            {pending.length > 0 && (
              <div>
                <p style={{ fontFamily: FT, fontSize: 12, fontWeight: 600, color: "#FF9F0A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Pending ({pending.length})
                </p>
                <div className="flex flex-col gap-3">
                  {pending.map((req) => (
                    <div key={req.id} className="app-surface p-5" style={{ background: SURFACE, border: "1px solid rgba(255,159,10,0.15)" }}>
                      <div className="mobile-stack flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT }}>{req.project_title}</p>
                          <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 2 }}>{req.requester?.email ?? "Anonymous client"}</p>
                        </div>
                        <span style={{ fontFamily: FT, fontSize: 12, color: MUTED, flexShrink: 0 }}>
                          {new Date(req.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      {req.message && (
                        <p style={{ fontFamily: FT, fontSize: 14, color: "rgba(240,237,229,0.55)", marginBottom: 14, lineHeight: 1.55 }}>
                          &ldquo;{req.message}&rdquo;
                        </p>
                      )}
                      <div className="mobile-stack flex gap-2">
                        <button onClick={() => respond(req.id, "declined")}
                          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium transition-all hover:opacity-70"
                          style={{ border: "1px solid rgba(255,69,58,0.25)", background: "rgba(255,69,58,0.08)", color: "#FF453A", fontFamily: FT }}>
                          <X size={14} /> Decline
                        </button>
                        <button onClick={() => respond(req.id, "accepted")}
                          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium transition-all hover:opacity-80"
                          style={{ border: "none", background: AMBER, color: "#000", fontFamily: FT, fontWeight: 600 }}>
                          <Check size={14} /> Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {responded.length > 0 && (
              <div>
                <p style={{ fontFamily: FT, fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  Previous
                </p>
                <div className="flex flex-col gap-2">
                  {responded.map((req) => (
                    <div key={req.id} className="app-surface p-4 mobile-stack flex items-center justify-between gap-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                      <div>
                        <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>{req.project_title}</p>
                        <p style={{ fontFamily: FT, fontSize: 12, color: MUTED }}>{req.requester?.email ?? "Client"}</p>
                      </div>
                      <span style={{
                        fontSize: 12, fontFamily: FT, fontWeight: 500, padding: "3px 10px", borderRadius: 20, flexShrink: 0,
                        background: req.status === "accepted" ? "rgba(50,215,75,0.1)" : "rgba(255,69,58,0.08)",
                        color: req.status === "accepted" ? "#32D74B" : "#FF453A",
                      }}>
                        {req.status === "accepted" ? "Accepted" : "Declined"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {activeTab === "profile" && profile && (
          <div className="app-surface p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: FD, fontWeight: 600, fontSize: 18, color: TEXT }}>Your card</h2>
              <Link href="/dashboard/edit"
                style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: AMBER }}
                className="hover:opacity-70 transition-opacity">
                Edit →
              </Link>
            </div>
            <div className="flex flex-col gap-1">
              {[
                { label: "Name",         value: profile.display_name as string },
                { label: "Role",         value: roleLabel },
                { label: "Location",     value: profile.city as string },
                { label: "Experience",   value: profile.experience_level as string },
                { label: "Availability", value: availLabel },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ fontFamily: FT, fontSize: 13, color: MUTED, minWidth: 100 }}>{label}</span>
                  <span style={{ fontFamily: FT, fontSize: 14, color: TEXT }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
