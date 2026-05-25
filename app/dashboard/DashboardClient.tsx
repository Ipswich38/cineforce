"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, AVAILABILITY } from "@/lib/constants";
import { Check, X, Clock, Bell, LogOut, ExternalLink } from "lucide-react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#0C0C0F";
const SURFACE = "#18181D";
const TEXT    = "#F0EDE5";
const MUTED   = "#78787F";
const AMBER   = "#FFB300";
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
  profile, requests, userEmail,
}: {
  profile: Record<string, unknown> | null;
  requests: Request[];
  userEmail: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [reqs, setReqs] = useState(requests);
  const [activeTab, setActiveTab] = useState<"requests" | "profile">("requests");
  const [signingOut, setSigningOut] = useState(false);

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

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: "rgba(12,12,15,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 40 }}>
        <div className="max-w-[860px] mx-auto px-6 flex items-center justify-between" style={{ height: 52 }}>
          <Link href="/" style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, letterSpacing: "-0.02em" }}>
            SetReady
          </Link>
          <div className="flex items-center gap-4">
            {profile && (
              <Link href={`/crew/${profile.slug as string}`} target="_blank"
                className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
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

      <div className="max-w-[860px] mx-auto px-6 py-10">
        {/* Welcome header */}
        <div className="mb-10">
          <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: TEXT, letterSpacing: "-0.025em" }}>
            {profile ? `Hey, ${(profile.display_name as string).split(" ")[0]} 👋` : "Dashboard"}
          </h1>
          <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, marginTop: 6 }}>
            {profile ? `${roleLabel} · ${profile.city as string}` : userEmail}
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pending requests", value: pending.length,                                    color: "#FF9F0A" },
            { label: "Accepted",         value: responded.filter((r) => r.status === "accepted").length, color: "#32D74B" },
            { label: "Total requests",   value: reqs.length,                                       color: "#4A9EFF" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 28, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</p>
              <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Availability quick-toggle */}
        {profile && (
          <div className="rounded-2xl p-5 mb-6 flex items-center justify-between" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-3">
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: availColor, display: "inline-block" }} />
              <span style={{ fontFamily: FT, fontSize: 15, color: TEXT }}>
                Status: <strong style={{ color: TEXT }}>{availLabel}</strong>
              </span>
            </div>
            <Link href="/dashboard/edit"
              style={{ fontFamily: FT, fontSize: 13, fontWeight: 500, color: AMBER }}
              className="hover:opacity-70 transition-opacity">
              Edit profile →
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-8" style={{ background: "#111115", display: "inline-flex" }}>
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
              {tab === "requests" ? `Connect Requests${pending.length > 0 ? ` (${pending.length})` : ""}` : "Profile"}
            </button>
          ))}
        </div>

        {/* Requests tab */}
        {activeTab === "requests" && (
          <div className="flex flex-col gap-4">
            {pending.length === 0 && responded.length === 0 && (
              <div className="rounded-2xl p-10 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                <Bell size={28} style={{ color: MUTED, margin: "0 auto 12px" }} />
                <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 17, color: TEXT }}>No requests yet</p>
                <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, marginTop: 6 }}>
                  When clients find and connect with you, they&apos;ll appear here.
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
                    <div key={req.id} className="rounded-2xl p-5" style={{ background: SURFACE, border: "1px solid rgba(255,159,10,0.15)" }}>
                      <div className="flex items-start justify-between gap-4 mb-3">
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
                      <div className="flex gap-2">
                        <button onClick={() => respond(req.id, "declined")}
                          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium transition-all hover:opacity-70"
                          style={{ border: "1px solid rgba(255,69,58,0.25)", background: "rgba(255,69,58,0.08)", color: "#FF453A", fontFamily: FT }}>
                          <X size={14} /> Decline
                        </button>
                        <button onClick={() => respond(req.id, "accepted")}
                          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium transition-all hover:opacity-80"
                          style={{ border: "none", background: AMBER, color: "#000", fontFamily: FT, fontWeight: 600 }}>
                          <Check size={14} /> Accept & Share Contact
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
                    <div key={req.id} className="rounded-xl p-4 flex items-center justify-between gap-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
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
          <div className="rounded-2xl p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: FD, fontWeight: 600, fontSize: 18, color: TEXT }}>Your Profile</h2>
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
