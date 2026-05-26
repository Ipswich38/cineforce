"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ExternalLink, Zap } from "lucide-react";
import { TIERS, getTierForCount, type TierId } from "@/lib/foundingTiers";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';
const BG      = "#000000";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";

type PendingProfile = {
  id: string; slug: string; display_name: string;
  role: string; city: string; premium_requested_at: string;
};
type ActiveProfile = {
  id: string; slug: string; display_name: string;
  role: string; city: string; premium_activated_at: string;
  founding_tier: string | null;
};

export default function AdminClient({
  pending: initialPending,
  active:  initialActive,
}: {
  pending: PendingProfile[];
  active:  ActiveProfile[];
}) {
  const [pending,    setPending]    = useState(initialPending);
  const [active,     setActive]     = useState(initialActive);
  const [activating, setActivating] = useState<string | null>(null);

  const tierCounts: Record<TierId, number> = {
    founding: active.filter((a) => a.founding_tier === "founding").length,
    pioneer:  active.filter((a) => a.founding_tier === "pioneer").length,
    early:    active.filter((a) => a.founding_tier === "early").length,
  };
  const nextTier = getTierForCount(active.length);

  async function activate(profile: PendingProfile) {
    setActivating(profile.id);
    const res = await fetch("/api/admin/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: profile.id }),
    });
    if (res.ok) {
      const { tier } = await res.json() as { tier: TierId | null };
      setPending((p) => p.filter((x) => x.id !== profile.id));
      setActive((a) => [{
        ...profile,
        premium_activated_at: new Date().toISOString(),
        founding_tier: tier,
      }, ...a]);
    }
    setActivating(null);
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ background: BG, minHeight: "100dvh" }}>
      <div style={{ background: "rgba(12,12,15,0.95)", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(20px)", paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="app-container-narrow" style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT }}>Admin</span>
          <Link href="/dashboard" style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>← Dashboard</Link>
        </div>
      </div>

      <div className="app-container-narrow app-page-pad">

        {/* ── Batch progress ── */}
        <div className="app-surface mb-10 overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT }}>Batch Progress</p>
            {nextTier && (
              <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 2 }}>
                Next activation → <strong style={{ color: TIERS.find(t => t.id === nextTier)?.color }}>{TIERS.find(t => t.id === nextTier)?.label}</strong>
              </p>
            )}
            {!nextTier && (
              <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 2 }}>All founding batches are full.</p>
            )}
          </div>
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {TIERS.map((tier) => {
              const filled = tierCounts[tier.id];
              const pct    = Math.min((filled / tier.slots) * 100, 100);
              return (
                <div key={tier.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontFamily: FT, fontSize: 13, fontWeight: 600, color: tier.color }}>{tier.label}</span>
                    <span style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>{filled} / {tier.slots}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: tier.color, transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Pending requests ── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Clock size={16} style={{ color: "#FF9F0A" }} />
            <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: 20, color: TEXT, letterSpacing: "-0.02em" }}>
              Pending Activation
            </h2>
            {pending.length > 0 && (
              <span style={{ fontFamily: FT, fontSize: 12, fontWeight: 700, background: "rgba(255,159,10,0.12)", color: "#FF9F0A", border: "1px solid rgba(255,159,10,0.25)", padding: "2px 10px", borderRadius: 20 }}>
                {pending.length}
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="app-surface p-8 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <p style={{ fontFamily: FT, fontSize: 14, color: MUTED }}>No pending requests.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pending.map((p, i) => {
                const wouldBeTier = getTierForCount(active.length + i);
                const tierMeta    = TIERS.find((t) => t.id === wouldBeTier);
                return (
                  <div key={p.id} className="app-surface" style={{ background: SURFACE, border: "1px solid rgba(255,159,10,0.15)" }}>
                    <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                          <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT }}>{p.display_name}</p>
                          {tierMeta && (
                            <span style={{ fontFamily: FT, fontSize: 11, fontWeight: 700, color: tierMeta.color, background: `${tierMeta.color}15`, border: `1px solid ${tierMeta.color}30`, padding: "1px 8px", borderRadius: 20 }}>
                              {tierMeta.label}
                            </span>
                          )}
                        </div>
                        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>{p.role} · {p.city}</p>
                        <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                          Requested {fmt(p.premium_requested_at)}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <Link href={`/crew/${p.slug}`} target="_blank"
                          style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "transparent", fontFamily: FT, fontSize: 13, color: MUTED, display: "flex", alignItems: "center", gap: 6 }}
                          className="transition-opacity hover:opacity-70">
                          <ExternalLink size={13} /> View
                        </Link>
                        <button
                          onClick={() => activate(p)}
                          disabled={activating === p.id}
                          style={{
                            padding: "8px 18px", borderRadius: 10, border: "none",
                            background: activating === p.id ? "rgba(255,179,0,0.5)" : AMBER,
                            color: "#000", fontFamily: FT, fontSize: 13, fontWeight: 700,
                            cursor: activating === p.id ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", gap: 6,
                          }}
                          className="transition-all hover:opacity-85">
                          <Zap size={13} />
                          {activating === p.id ? "Activating…" : "Activate"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Active members ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <CheckCircle2 size={16} style={{ color: "#32D74B" }} />
            <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: 20, color: TEXT, letterSpacing: "-0.02em" }}>
              Active Members
            </h2>
            <span style={{ fontFamily: FT, fontSize: 12, fontWeight: 600, color: "#32D74B" }}>
              {active.length}
            </span>
          </div>

          {active.length === 0 ? (
            <div className="app-surface p-8 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <p style={{ fontFamily: FT, fontSize: 14, color: MUTED }}>No active members yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {active.map((p) => {
                const tier = TIERS.find((t) => t.id === p.founding_tier);
                return (
                  <div key={p.id} className="app-surface" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                    <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>{p.display_name}</p>
                          {tier && (
                            <span style={{ fontFamily: FT, fontSize: 11, fontWeight: 700, color: tier.color, background: `${tier.color}12`, border: `1px solid ${tier.color}25`, padding: "1px 8px", borderRadius: 20 }}>
                              {tier.label}
                            </span>
                          )}
                        </div>
                        <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 2 }}>{p.role} · {p.city}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: FT, fontSize: 11, color: MUTED }}>
                          {fmt(p.premium_activated_at)}
                        </span>
                        <Link href={`/crew/${p.slug}`} target="_blank"
                          style={{ color: MUTED }}
                          className="transition-opacity hover:opacity-70">
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
