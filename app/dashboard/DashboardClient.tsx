"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, AVAILABILITY } from "@/lib/constants";
import { Check, X, Clock, UserCircle, Bell, LogOut, ExternalLink, CheckCircle2 } from "lucide-react";

const FONT_DISPLAY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FONT_TEXT    = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

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
  const availColor = profile ? (AVAILABILITY.find((a) => a.id === (profile.availability as string))?.color ?? "#AEAEB2") : "#AEAEB2";

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
    <div style={{ background: "#F5F5F7", minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: "rgba(245,245,247,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.07)", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="max-w-[860px] mx-auto px-6 flex items-center justify-between" style={{ height: 52 }}>
          <Link href="/" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, color: "#1C1C1E", letterSpacing: "-0.02em" }}>
            SetReady
          </Link>
          <div className="flex items-center gap-3">
            {profile && (
              <Link href={`/crew/${profile.slug as string}`} target="_blank"
                className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "#6D6D72" }}>
                View profile <ExternalLink size={12} />
              </Link>
            )}
            <button onClick={signOut} disabled={signingOut}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
              style={{ background: "none", border: "none", fontFamily: FONT_TEXT, fontSize: 13, color: "#FF3B30" }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#1C1C1E", letterSpacing: "-0.025em" }}>
            {profile ? `Hey, ${(profile.display_name as string).split(" ")[0]} 👋` : "Dashboard"}
          </h1>
          <p style={{ fontFamily: FONT_TEXT, fontSize: 15, color: "#6D6D72", marginTop: 4 }}>
            {profile ? `${roleLabel} · ${profile.city as string}` : userEmail}
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pending requests", value: pending.length, color: "#FF9500" },
            { label: "Accepted", value: responded.filter((r) => r.status === "accepted").length, color: "#34C759" },
            { label: "Total requests", value: reqs.length, color: "#007AFF" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5 text-center" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
              <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</p>
              <p style={{ fontFamily: FONT_TEXT, fontSize: 12, color: "#AEAEB2", marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Availability quick-toggle */}
        {profile && (
          <div className="rounded-2xl p-5 mb-6 flex items-center justify-between" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
            <div className="flex items-center gap-3">
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: availColor, display: "inline-block" }} />
              <span style={{ fontFamily: FONT_TEXT, fontSize: 15, color: "#1C1C1E" }}>
                Status: <strong>{availLabel}</strong>
              </span>
            </div>
            <Link href="/dashboard/edit"
              style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#007AFF" }}
              className="hover:opacity-70 transition-opacity">
              Edit profile →
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: "#EBEBEB", display: "inline-flex" }}>
          {(["requests", "profile"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="rounded-xl px-5 py-2 text-[14px] font-medium transition-all"
              style={{
                fontFamily: FONT_TEXT,
                background: activeTab === tab ? "#fff" : "transparent",
                color: activeTab === tab ? "#1C1C1E" : "#6D6D72",
                boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}>
              {tab === "requests" ? `Connect Requests${pending.length > 0 ? ` (${pending.length})` : ""}` : "Profile"}
            </button>
          ))}
        </div>

        {/* Requests tab */}
        {activeTab === "requests" && (
          <div className="flex flex-col gap-4">
            {pending.length === 0 && responded.length === 0 && (
              <div className="rounded-2xl p-10 text-center" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
                <Bell size={28} style={{ color: "#AEAEB2", margin: "0 auto 10px" }} />
                <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: "#1C1C1E" }}>No requests yet</p>
                <p style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#AEAEB2", marginTop: 4 }}>
                  When clients find and connect with you, they&apos;ll appear here.
                </p>
              </div>
            )}

            {pending.length > 0 && (
              <div>
                <p style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 600, color: "#FF9500", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Pending ({pending.length})
                </p>
                <div className="flex flex-col gap-3">
                  {pending.map((req) => (
                    <div key={req.id} className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(255,149,0,0.15)" }}>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: "#1C1C1E" }}>{req.project_title}</p>
                          <p style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "#6D6D72", marginTop: 2 }}>{req.requester?.email ?? "Anonymous client"}</p>
                        </div>
                        <span style={{ fontFamily: FONT_TEXT, fontSize: 12, color: "#AEAEB2" }}>
                          {new Date(req.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      {req.message && (
                        <p style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#6D6D72", marginBottom: 14, lineHeight: 1.55 }}>
                          &ldquo;{req.message}&rdquo;
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => respond(req.id, "declined")}
                          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium transition-all hover:opacity-70"
                          style={{ border: "1px solid rgba(255,59,48,0.2)", background: "rgba(255,59,48,0.06)", color: "#FF3B30", fontFamily: FONT_TEXT }}>
                          <X size={14} /> Decline
                        </button>
                        <button onClick={() => respond(req.id, "accepted")}
                          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium transition-all hover:opacity-80"
                          style={{ border: "none", background: "#007AFF", color: "#fff", fontFamily: FONT_TEXT }}>
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
                <p style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 600, color: "#AEAEB2", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Previous
                </p>
                <div className="flex flex-col gap-2">
                  {responded.map((req) => (
                    <div key={req.id} className="rounded-xl p-4 flex items-center justify-between gap-4" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.06)" }}>
                      <div>
                        <p style={{ fontFamily: FONT_TEXT, fontSize: 14, fontWeight: 500, color: "#1C1C1E" }}>{req.project_title}</p>
                        <p style={{ fontFamily: FONT_TEXT, fontSize: 12, color: "#AEAEB2" }}>{req.requester?.email ?? "Client"}</p>
                      </div>
                      <span style={{
                        fontSize: 12, fontFamily: FONT_TEXT, fontWeight: 500, padding: "3px 10px", borderRadius: 20,
                        background: req.status === "accepted" ? "rgba(52,199,89,0.1)" : "rgba(255,59,48,0.08)",
                        color: req.status === "accepted" ? "#34C759" : "#FF3B30",
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
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18, color: "#1C1C1E" }}>Your Profile</h2>
              <Link href="/dashboard/edit"
                style={{ fontFamily: FONT_TEXT, fontSize: 14, fontWeight: 500, color: "#007AFF" }}
                className="hover:opacity-70 transition-opacity">
                Edit →
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: "Name",        value: profile.display_name as string },
                { label: "Role",        value: roleLabel },
                { label: "Location",    value: profile.city as string },
                { label: "Experience",  value: profile.experience_level as string },
                { label: "Availability",value: availLabel },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-4 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                  <span style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "#AEAEB2", minWidth: 90 }}>{label}</span>
                  <span style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#1C1C1E" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
