export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clapperboard, Lock, MapPin, Search, Sparkles, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TIERS, getTierForCount } from "@/lib/foundingTiers";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#000000";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const TEAL    = AMBER;
const BORDER  = "rgba(255,255,255,0.08)";

const features = [
  { icon: Search,    title: "Find",    text: "Search by role, name, city, rate, experience, availability." },
  { icon: UserRound, title: "Cards",   text: "Crew profiles built for fast comparison: reel, credits, kit, location." },
  { icon: Lock,      title: "Contact", text: "Private details stay gated until both sides are ready." },
  { icon: MapPin,    title: "Local",   text: "Designed around real production markets, not generic freelancing." },
];

const buildReasons = [
  "Production hiring is urgent.",
  "Crew portfolios are scattered.",
  "Credits matter more than resumes.",
  "Contact should be controlled.",
  "Discovery should feel instant.",
];


export default async function AboutPage() {
  let activatedCount = 0;
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("premium_status", "active");
    activatedCount = count ?? 0;
  } catch { /* Supabase not configured */ }

  const currentTier = getTierForCount(activatedCount);

  return (
    <main className="mobile-nav-pad" style={{ background: BG, minHeight: "100dvh", color: TEXT }}>
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: `1px solid ${BORDER}`, paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="app-container topbar-inner">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, color: TEXT }}>
            <ArrowLeft size={16} style={{ color: MUTED }} />
            <Clapperboard size={16} style={{ color: AMBER }} />
            <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16 }}>CineVerse</span>
          </Link>
          <div className="nav-actions">
            <Link href="/search" style={{ fontFamily: FT, fontSize: 14, color: MUTED }}>Find</Link>
            <Link href="/auth?intent=join" style={{ fontFamily: FT, fontSize: 14, fontWeight: 700, color: "#000", background: AMBER, padding: "8px 16px", borderRadius: 999 }}>
              Join
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="app-container" style={{ paddingBlock: "clamp(72px,12vw,132px) clamp(44px,7vw,72px)" }}>
        <div className="about-hero-grid">
          <div>
            <p className="quiet-label" style={{ fontFamily: FT, color: AMBER, marginBottom: 18 }}>
              Why we built this
            </p>
            <h1 className="about-title" style={{ fontFamily: FD, lineHeight: 0.96, letterSpacing: "-0.055em", maxWidth: 760 }}>
              The Philippines&apos; first. Built for every side of production.
            </h1>
          </div>
          <p style={{ fontFamily: FT, color: MUTED, fontSize: 17, lineHeight: 1.65 }}>
            Whether you&apos;re hiring or available, CineVerse connects productions with the right crew, equipment, and locations. Fast, professional, and built around real experience.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="app-container" style={{ paddingBottom: "clamp(48px,8vw,88px)" }}>
        <div style={{ borderLeft: `3px solid ${AMBER}`, paddingLeft: "clamp(20px,4vw,36px)" }}>
          <p style={{ fontFamily: FT, fontSize: 11, color: AMBER, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Our Goal</p>
          <p style={{ fontFamily: FD, fontSize: "clamp(22px,3.5vw,36px)", lineHeight: 1.2, letterSpacing: "-0.03em", color: TEXT, maxWidth: 680 }}>
            Easy access to the filmmaking industry.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 20 }}>
            {[
              { label: "For productions", value: "Find excellent people for the right project." },
              { label: "For crew",        value: "Find the right job that matches your craft." },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "12px 0", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontFamily: FT, fontSize: 12, color: MUTED, minWidth: 110, flexShrink: 0 }}>{label}</span>
                <span style={{ fontFamily: FT, fontSize: 15, color: TEXT }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem + Core value ── */}
      <section className="app-container" style={{ paddingBottom: "clamp(56px,9vw,104px)" }}>
        <div className="about-split-grid">
          <div className="app-surface" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: "clamp(22px,4vw,34px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
              <span style={{ width: 5, height: 28, borderRadius: 99, background: AMBER }} />
              <h2 style={{ fontFamily: FD, fontSize: 26 }}>The problem</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {buildReasons.map((item, index) => (
                <div key={item} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 14, padding: "16px 0", borderTop: index === 0 ? "0" : `1px solid ${BORDER}` }}>
                  <span style={{ fontFamily: FD, color: "rgba(255,255,255,0.25)", fontWeight: 700 }}>{String(index + 1).padStart(2, "0")}</span>
                  <p style={{ fontFamily: FT, color: TEXT, fontSize: 16 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="app-surface" style={{ background: "linear-gradient(180deg, #151515, #0C0C0C)", border: `1px solid ${BORDER}`, padding: "clamp(22px,4vw,34px)", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 420 }}>
            <div>
              <div style={{ width: 54, height: 54, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,204,0,0.12)", border: "1px solid rgba(255,204,0,0.24)", marginBottom: 24 }}>
                <Sparkles size={24} style={{ color: AMBER }} />
              </div>
              <h2 style={{ fontFamily: FD, fontSize: "clamp(30px,5vw,54px)", lineHeight: 1, letterSpacing: "-0.04em", marginBottom: 18 }}>
                Less browsing. More booking.
              </h2>
              <p style={{ fontFamily: FT, color: MUTED, fontSize: 16, lineHeight: 1.65, maxWidth: 520 }}>
                Producers get a clean search surface. Crew get a public card. Both sides skip the long back-and-forth until a project is real.
              </p>
            </div>
            <Link href="/search" style={{ display: "inline-flex", alignItems: "center", gap: 8, width: "fit-content", marginTop: 32, fontFamily: FT, fontWeight: 700, color: "#000", background: AMBER, padding: "13px 20px", borderRadius: 999 }}>
              Find crew <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="app-container" style={{ paddingBottom: "clamp(56px,9vw,104px)" }}>
        <p style={{ fontFamily: FT, fontSize: 11, color: AMBER, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>How it works</p>
        <h2 style={{ fontFamily: FD, fontSize: "clamp(1.7rem,3vw,2.4rem)", lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: "clamp(32px,5vw,48px)" }}>
          From search to set. <span style={{ color: AMBER }}>Fast.</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "clamp(14px,2.5vw,24px)", marginBottom: "clamp(28px,4vw,40px)" }}>
          {[
            { num: "01", icon: "🔍", title: "Search by role and date", desc: "Pick a role, set your project dates, and choose a city. CineVerse shows crew who are actually available." },
            { num: "02", icon: "🃏", title: "Browse profile cards",    desc: "See rate, experience, specializations, and availability at a glance. No cold DMs into the void." },
            { num: "03", icon: "💬", title: "Connect and chat",        desc: "Send a connection request with your project details. Once accepted, chat directly inside the app." },
          ].map((s) => (
            <div key={s.num} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "clamp(20px,3.5vw,28px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontFamily: FD, fontSize: 10, fontWeight: 700, color: AMBER, letterSpacing: "0.1em" }}>{s.num}</span>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT, marginBottom: 8, lineHeight: 1.3 }}>{s.title}</p>
              <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: "clamp(20px,3.5vw,30px)", borderRadius: 16, background: "linear-gradient(135deg, rgba(255,204,0,0.06) 0%, transparent 100%)", border: "1px solid rgba(255,204,0,0.14)", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,204,0,0.1)", border: "1px solid rgba(255,204,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Search size={20} style={{ color: AMBER }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT, marginBottom: 4 }}>Crew set their own availability</p>
            <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>Search by date and only see crew who are free for your shoot window.</p>
          </div>
          <Link href="/search" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, padding: "10px 18px", borderRadius: 10, background: AMBER, color: "#000", fontFamily: FT, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Find crew <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* ── Founding Member ── */}
      <section className="app-container" style={{ paddingBottom: "clamp(56px,9vw,104px)" }}>
        <div style={{ borderRadius: 16, padding: "clamp(28px,5vw,48px)", background: "linear-gradient(160deg, #081a1b 0%, #0C0C0C 60%)", border: `1px solid rgba(44,192,200,0.15)` }}>

          {/* Header */}
          <p style={{ fontFamily: FT, fontSize: 11, color: TEAL, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Beta Program</p>
          <h2 style={{ fontFamily: FD, fontSize: "clamp(26px,4vw,40px)", lineHeight: 1, letterSpacing: "-0.035em", marginBottom: 10 }}>Help us build this.</h2>
          <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, marginBottom: 32, maxWidth: 480 }}>
            Join free. Pick your batch. Your spot and rate are locked in forever.
          </p>

          {/* Tier cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 32 }}>
            {TIERS.map((tier) => {
              const offset   = tier.id === "founding" ? 0 : tier.id === "pioneer" ? 100 : 200;
              const filled   = Math.max(0, Math.min(activatedCount - offset, tier.slots));
              const spotsLeft = tier.slots - filled;
              const pct      = Math.min((filled / tier.slots) * 100, 100);
              const isOpen   = currentTier === tier.id;
              const isFull   = filled >= tier.slots;
              const [mainBenefit, lockBenefit] = tier.benefits.split(" · ");
              return (
                <div key={tier.id} style={{
                  background: SURFACE,
                  border: `1px solid ${isOpen ? `${tier.color}35` : BORDER}`,
                  borderTop: `3px solid ${isFull ? "rgba(255,255,255,0.1)" : tier.color}`,
                  borderRadius: 12,
                  padding: "20px 18px",
                  display: "flex", flexDirection: "column", gap: 14,
                  opacity: isFull ? 0.5 : 1,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 14, color: isFull ? MUTED : tier.color }}>{tier.label}</span>
                    {isOpen && <span style={{ fontFamily: FT, fontSize: 9, fontWeight: 700, color: tier.color, background: `${tier.color}15`, border: `1px solid ${tier.color}30`, padding: "2px 7px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.08em" }}>Open</span>}
                    {isFull && <span style={{ fontFamily: FT, fontSize: 9, fontWeight: 600, color: MUTED, padding: "2px 7px", borderRadius: 20, border: `1px solid ${BORDER}`, textTransform: "uppercase", letterSpacing: "0.08em" }}>Closed</span>}
                  </div>

                  <div>
                    <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 30, color: isFull ? MUTED : TEXT, lineHeight: 1 }}>{spotsLeft}</p>
                    <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 2 }}>of {tier.slots} spots left</p>
                  </div>

                  <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: tier.color }} />
                  </div>

                  <div>
                    <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 13, color: TEXT }}>{mainBenefit}</p>
                    <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 3 }}>{lockBenefit}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Link href="/auth?intent=join" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FT, fontWeight: 700, fontSize: 15, color: "#000", background: AMBER, padding: "13px 22px", borderRadius: 999 }}>
              Join Free <ArrowRight size={15} />
            </Link>
            <p style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>No contracts · Rate locked for your batch</p>
          </div>
        </div>
      </section>

      {/* ── Platform layers ── */}
      <section className="app-container" style={{ paddingBottom: "clamp(64px,10vw,120px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <span style={{ width: 5, height: 28, borderRadius: 99, background: AMBER }} />
          <h2 style={{ fontFamily: FD, fontSize: 26 }}>Platform layers</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="app-surface" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: 22 }}>
              <Icon size={20} style={{ color: AMBER, marginBottom: 18 }} />
              <h3 style={{ fontFamily: FD, fontSize: 20, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontFamily: FT, color: MUTED, lineHeight: 1.55, fontSize: 14 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
