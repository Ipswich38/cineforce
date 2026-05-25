"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, AVAILABILITY, EXPERIENCE_LEVELS } from "@/lib/constants";
import {
  Search, MapPin, ArrowRight, ArrowDown,
  Clapperboard, X, RotateCcw, Users, Menu,
} from "lucide-react";
import { SAMPLE_PROFILES } from "@/lib/sampleProfiles";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#0C0C0F";
const BG_ALT  = "#111115";
const SURFACE = "#18181D";
const TEXT    = "#F0EDE5";
const MUTED   = "#78787F";
const AMBER   = "#FFB300";
const BORDER  = "rgba(255,255,255,0.07)";
const DIVIDER = "rgba(255,255,255,0.05)";

const AVATAR_COLORS  = ["#0F1A2E", "#1A0F2E", "#2E0F0F", "#0F2E1A", "#1A2E0F", "#2E1A0F"];
const AVATAR_ACCENTS = ["#4A9EFF", "#AF52DE", "#FF453A", "#32D74B", "#A8D934", "#FF9F0A"];

type Profile = {
  id: string; slug: string; display_name: string; avatar_url: string | null;
  role: string; specializations: string[] | null; experience_level: string;
  city: string; availability: string; rate_min: number | null; rate_max: number | null;
  rate_unit: string | null; bio: string | null;
};

type SuggestProfile = { id: string; slug: string; display_name: string; role: string; city: string };

/* ─── Nav ─── */
function Nav() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    if (!menuOpen) return;
    const h = () => setMenuOpen(false);
    window.addEventListener("scroll", h, { passive: true, once: true });
  }, [menuOpen]);

  const hdrBg = scrolled || menuOpen
    ? "rgba(12,12,15,0.96)"
    : "transparent";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: hdrBg,
          backdropFilter: (scrolled || menuOpen) ? "blur(24px) saturate(160%)" : "none",
          WebkitBackdropFilter: (scrolled || menuOpen) ? "blur(24px) saturate(160%)" : "none",
          borderBottom: (scrolled || menuOpen) ? `1px solid ${BORDER}` : "1px solid transparent",
        }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px,5vw,64px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Clapperboard size={17} style={{ color: AMBER }} strokeWidth={2} />
            <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, letterSpacing: "-0.02em" }}>SetReady</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center" style={{ gap: 28, flex: 1, justifyContent: "center" }}>
            {[
              { href: "#browse", label: "Browse Crew" },
              { href: "/search", label: "Search" },
            ].map(({ href, label }) => (
              <a key={label} href={href}
                style={{ fontFamily: FT, fontSize: 14, color: MUTED }}
                className="transition-colors hover:text-white">{label}</a>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

            {/* Desktop: sign in */}
            <Link href="/auth"
              style={{ fontFamily: FT, fontSize: 14, color: MUTED, padding: "6px 10px" }}
              className="hidden md:block transition-colors hover:text-white">
              Sign in
            </Link>

            {/* ALWAYS VISIBLE: Join as Crew */}
            <Link href="/auth?intent=join"
              style={{
                fontFamily: FT, fontWeight: 700, fontSize: 14,
                background: AMBER, color: "#000",
                padding: "9px clamp(14px,2.5vw,22px)", borderRadius: 22,
                letterSpacing: "-0.01em", whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 5,
              }}
              className="transition-all hover:opacity-85 active:scale-[0.97]">
              {/* Shorter label on very small screens */}
              <span className="inline sm:hidden">Join</span>
              <span className="hidden sm:inline">Join as Crew</span>
            </Link>

            {/* Mobile: hamburger — md+ hidden */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden"
              style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                border: `1px solid ${menuOpen ? "rgba(255,255,255,0.14)" : BORDER}`,
                background: menuOpen ? "rgba(255,255,255,0.06)" : "transparent",
                color: TEXT, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.18s",
              }}>
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden"
            onClick={() => setMenuOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 48, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }} />

          {/* Sheet */}
          <div
            className="md:hidden menu-slide"
            style={{
              position: "fixed", top: 60, left: 0, right: 0, zIndex: 49,
              background: "rgba(12,12,15,0.98)",
              borderBottom: `1px solid ${BORDER}`,
              boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
              maxHeight: "calc(100vh - 60px)",
              overflowY: "auto",
            }}>
            <div style={{ padding: "8px clamp(16px,5vw,32px) clamp(20px,4vh,32px)" }}>

              {/* Nav links */}
              {[
                { href: "#browse", label: "Browse Crew",    emoji: "🎬", action: () => { setMenuOpen(false); document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" }); } },
                { href: "/search", label: "Search All Crew", emoji: "🔍", action: () => setMenuOpen(false) },
              ].map(({ href, label, emoji, action }) => (
                <a key={label} href={href}
                  onClick={(e) => { e.preventDefault(); action(); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 0",
                    borderBottom: `1px solid ${BORDER}`,
                    textDecoration: "none",
                  }}>
                  <span style={{ fontSize: 22, width: 32, textAlign: "center", flexShrink: 0 }}>{emoji}</span>
                  <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 17, color: TEXT, flex: 1 }}>{label}</span>
                  <ArrowRight size={15} style={{ color: MUTED }} />
                </a>
              ))}

              {/* Sign in */}
              <Link href="/auth"
                onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: `1px solid ${BORDER}`, textDecoration: "none" }}>
                <span style={{ fontSize: 22, width: 32, textAlign: "center", flexShrink: 0 }}>👤</span>
                <span style={{ fontFamily: FT, fontSize: 15, color: MUTED }}>Sign In</span>
              </Link>

              {/* Join CTA card — encouragement */}
              <div style={{
                marginTop: "clamp(18px,4vw,24px)",
                padding: "clamp(18px,4vw,24px)",
                borderRadius: 20,
                background: "linear-gradient(135deg, rgba(255,179,0,0.07) 0%, rgba(255,179,0,0.03) 100%)",
                border: "1px solid rgba(255,179,0,0.2)",
              }}>
                <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 18, color: TEXT, marginBottom: 8 }}>
                  Are you a crew member?
                </p>
                <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 18 }}>
                  Build your profile once. Get discovered by directors, producers, and production companies across the Philippines — for free.
                </p>
                <Link href="/auth?intent=join"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "14px", borderRadius: 14,
                    background: AMBER, color: "#000",
                    fontFamily: FT, fontSize: 15, fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 24px rgba(255,179,0,0.28)",
                  }}
                  className="transition-all hover:opacity-85 active:scale-[0.98]">
                  Join SetReady — it&apos;s free <ArrowRight size={15} />
                </Link>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ─── Hero Search ─── */
function HeroSearch() {
  const router = useRouter();
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState<SuggestProfile[]>([]);
  const [open,      setOpen]      = useState(false);
  const [canSearch, setCanSearch] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim() || !canSearch) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const sb = createClient();
        const { data } = await sb.from("profiles")
          .select("id,slug,display_name,role,city")
          .ilike("display_name", `%${query}%`)
          .limit(6);
        setResults(data ?? []);
      } catch {
        setCanSearch(false);
        setResults([]);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query, canSearch]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    const p = new URLSearchParams();
    if (query.trim()) p.set("q", query.trim());
    router.push(`/search${p.toString() ? `?${p}` : ""}`);
  }

  const roleLabel = (r: string) => ROLES.find((x) => x.id === r)?.label ?? r;

  return (
    <form onSubmit={submit} style={{ width: "100%", position: "relative" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(24,24,29,0.96)", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 50, padding: "6px 6px 6px 22px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
      }}>
        <Search size={17} style={{ color: MUTED, flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by name, role, or discipline…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            color: TEXT, fontFamily: FT, fontSize: "clamp(14px,2vw,16px)",
            padding: "10px 4px", minWidth: 0,
          }}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
            style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: "0 6px", flexShrink: 0 }}>
            <X size={14} />
          </button>
        )}
        <button type="submit"
          style={{
            background: AMBER, color: "#000", border: "none", borderRadius: 50,
            padding: "clamp(10px,2vw,13px) clamp(18px,3vw,28px)",
            fontFamily: FT, fontWeight: 700, fontSize: "clamp(13px,1.5vw,15px)",
            flexShrink: 0, cursor: "pointer", whiteSpace: "nowrap",
          }}
          className="transition-all hover:opacity-85 active:scale-[0.97]">
          Find Crew
        </button>
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", left: 0, right: 0,
          background: "#18181D", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20, overflow: "hidden", zIndex: 100,
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        }}>
          {results.map((p, i) => (
            <Link key={p.id} href={`/crew/${p.slug}`}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
                borderBottom: i < results.length - 1 ? `1px solid ${DIVIDER}` : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#222229")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "#0C0C0F", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FD, fontWeight: 700, fontSize: 13, color: AMBER }}>
                {p.display_name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 14, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.display_name}</p>
                <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 2 }}>{roleLabel(p.role)} · {p.city}</p>
              </div>
            </Link>
          ))}
          <Link href={`/search?q=${encodeURIComponent(query)}`}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: `1px solid ${DIVIDER}`, background: "rgba(255,179,0,0.04)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,179,0,0.09)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,179,0,0.04)")}>
            <span style={{ fontFamily: FT, fontSize: 14, color: AMBER }}>See all results for &ldquo;{query}&rdquo;</span>
            <ArrowRight size={14} style={{ color: AMBER }} />
          </Link>
        </div>
      )}
    </form>
  );
}

/* ─── Profile Card (Tinder-style) ─── */
function ProfileCard({ p, exiting, cardIdx }: { p: Profile; exiting: "left" | "right" | null; cardIdx: number }) {
  const ci      = p.display_name.charCodeAt(0) % AVATAR_COLORS.length;
  const accent  = AVATAR_ACCENTS[ci];
  const bg      = AVATAR_COLORS[ci];
  const initials = p.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const roleData  = ROLES.find((r) => r.id === p.role);
  const availData = AVAILABILITY.find((a) => a.id === p.availability);
  const expLabel  = EXPERIENCE_LEVELS.find((e) => e.id === p.experience_level)?.label ?? p.experience_level;

  return (
    <div
      key={cardIdx}
      className="card-enter"
      style={{
        position: "absolute", inset: 0,
        background: SURFACE,
        borderRadius: 28,
        border: `1px solid rgba(255,255,255,0.09)`,
        boxShadow: "0 32px 100px rgba(0,0,0,0.65)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        transition: "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s",
        transform: exiting === "right"
          ? "translateX(150%) rotate(24deg)"
          : exiting === "left"
            ? "translateX(-150%) rotate(-24deg)"
            : "translateX(0) rotate(0)",
        opacity: exiting ? 0 : 1,
        willChange: "transform, opacity",
      }}>

      {/* Top band — cinematic accent */}
      <div style={{ height: "clamp(100px,22%,140px)", background: bg, position: "relative", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 90% 90% at 20% 50%, ${accent}22, transparent 65%)` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(24,24,29,0.85) 100%)" }} />

        {/* Availability badge */}
        {availData && (
          <div style={{ position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 5, background: `${availData.color}18`, border: `1px solid ${availData.color}35`, borderRadius: 20, padding: "5px 11px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: availData.color, display: "inline-block", boxShadow: p.availability === "available" ? `0 0 0 2px ${availData.color}30` : "none" }} />
            <span style={{ fontFamily: FT, fontSize: 11, fontWeight: 600, color: availData.color }}>{availData.label}</span>
          </div>
        )}

        {/* Avatar — overlaps band */}
        <div style={{
          position: "absolute", bottom: -30, left: "clamp(20px,5%,28px)",
          width: 60, height: 60, borderRadius: 17,
          background: bg, color: accent,
          border: `2.5px solid ${SURFACE}`,
          boxShadow: `0 6px 24px rgba(0,0,0,0.55), 0 0 0 1px ${accent}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: FD, fontWeight: 800, fontSize: 17, flexShrink: 0,
          overflow: "hidden",
        }}>
          {p.avatar_url
            ? <img src={p.avatar_url} alt={p.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : initials}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "clamp(42px,7%,52px) clamp(20px,5%,28px) 0", overflow: "hidden" }}>
        <h3 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(19px,3.5vw,25px)", color: TEXT, letterSpacing: "-0.022em", lineHeight: 1.15 }}>
          {p.display_name}
        </h3>
        <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 15 }}>{roleData?.icon ?? "🎬"}</span>
          <span>{roleData?.label ?? p.role}</span>
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 10px", marginTop: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: MUTED, fontFamily: FT }}>
            <MapPin size={11} style={{ color: MUTED, flexShrink: 0 }} />{p.city}
          </span>
          <span style={{ color: DIVIDER }}>·</span>
          <span style={{ fontSize: 12, color: MUTED, fontFamily: FT }}>{expLabel}</span>
          {p.rate_min && (
            <>
              <span style={{ color: DIVIDER }}>·</span>
              <span style={{ fontSize: 12, color: MUTED, fontFamily: FT }}>
                ₱{p.rate_min.toLocaleString()}+/{p.rate_unit ?? "day"}
              </span>
            </>
          )}
        </div>

        {p.specializations && p.specializations.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {p.specializations.slice(0, 4).map((s) => (
              <span key={s} style={{
                fontSize: 11, fontFamily: FT, fontWeight: 500,
                background: `${accent}10`, color: accent,
                padding: "3px 10px", borderRadius: 20,
                border: `1px solid ${accent}22`,
              }}>{s}</span>
            ))}
          </div>
        )}

        {p.bio && (
          <p style={{
            fontSize: 13, color: "rgba(240,237,229,0.38)", fontFamily: FT,
            lineHeight: 1.6, marginTop: 14,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}>
            {p.bio}
          </p>
        )}
      </div>

      {/* Action footer */}
      <div style={{ padding: "clamp(14px,3%,20px) clamp(20px,5%,28px) clamp(20px,4%,28px)", display: "flex", gap: 10, marginTop: "auto" }}>
        <button
          style={{
            flex: "0 0 52px", height: 52, borderRadius: "50%",
            border: `1.5px solid ${BORDER}`, background: "transparent", color: MUTED,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            transition: "all 0.2s", flexShrink: 0,
          }}
          data-skip="true"
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,69,58,0.45)"; e.currentTarget.style.color = "#FF453A"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED; }}>
          <X size={18} />
        </button>
        <Link href={`/crew/${p.slug}`}
          style={{
            flex: 1, height: 52, borderRadius: 16, border: "none",
            background: AMBER, color: "#000",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            fontFamily: FT, fontWeight: 700, fontSize: 14,
            boxShadow: "0 4px 24px rgba(255,179,0,0.22)",
            textDecoration: "none",
          }}
          className="transition-all hover:opacity-85 active:scale-[0.97]">
          View Profile <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

/* ─── Crew Browser (card stack section) ─── */
function CrewBrowser() {
  const [profiles,    setProfiles]    = useState<Profile[]>([]);
  const [idx,         setIdx]         = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [exiting,     setExiting]     = useState<null | "left" | "right">(null);
  const [roleFilter,  setRoleFilter]  = useState("");
  const [availOnly,   setAvailOnly]   = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const sb = createClient();
      let q = sb.from("profiles")
        .select("id,slug,display_name,avatar_url,role,specializations,experience_level,city,availability,rate_min,rate_max,rate_unit,bio")
        .order("created_at", { ascending: false });
      if (roleFilter) q = q.eq("role", roleFilter);
      if (availOnly)  q = q.eq("availability", "available");
      const { data } = await q;
      const list = data ?? [];
      setProfiles(list.length > 0 ? list : (SAMPLE_PROFILES as unknown as Profile[]));
      setIdx(0);
    } catch {
      setProfiles(SAMPLE_PROFILES as unknown as Profile[]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, availOnly]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const navigateRef = useRef<(dir: "skip") => void>(() => {});

  function skip() {
    if (exiting || idx >= profiles.length) return;
    setExiting("right");
    setTimeout(() => {
      setIdx((i) => i + 1);
      setExiting(null);
    }, 400);
  }

  navigateRef.current = skip;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Escape") navigateRef.current("skip");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const current = profiles[idx];
  const next1   = profiles[idx + 1];
  const next2   = profiles[idx + 2];
  const done    = !loading && idx >= profiles.length;

  const filterPillStyle = (active: boolean, activeColor = AMBER) => ({
    padding: "8px 16px", borderRadius: 20,
    border: `1px solid ${active ? `${activeColor}45` : BORDER}`,
    background: active ? `${activeColor}0D` : SURFACE,
    color: active ? activeColor : MUTED,
    fontFamily: FT, fontSize: 13, fontWeight: 500 as const,
    cursor: "pointer" as const, flexShrink: 0 as const,
    display: "flex" as const, alignItems: "center" as const, gap: 6,
    transition: "all 0.18s",
    whiteSpace: "nowrap" as const,
  });

  return (
    <section id="browse" style={{ background: BG_ALT, padding: "clamp(60px,10vw,100px) 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px,5vw,64px)" }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
          <div>
            <p style={{ fontFamily: FT, fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
              Browse Crew
            </p>
            <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(1.7rem,3.5vw,2.6rem)", color: TEXT, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
              Find your next{" "}
              <span style={{ color: AMBER }}>collaborator.</span>
            </h2>
          </div>
          <Link href="/search"
            style={{ fontFamily: FT, fontSize: 13, fontWeight: 500, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}
            className="transition-colors hover:text-white">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {/* Filter pills — horizontal scroll on mobile */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: 44, paddingBottom: 4, scrollbarWidth: "none" }}>
          <div style={{ display: "flex", gap: 8, width: "max-content" }}>
            <button onClick={() => setRoleFilter("")} style={filterPillStyle(!roleFilter)}>
              All roles
            </button>
            {ROLES.map((r) => (
              <button key={r.id} onClick={() => setRoleFilter(r.id === roleFilter ? "" : r.id)}
                style={filterPillStyle(roleFilter === r.id)}>
                <span style={{ fontSize: 14 }}>{r.icon}</span>{r.label}
              </button>
            ))}
            <button onClick={() => setAvailOnly(!availOnly)}
              style={filterPillStyle(availOnly, "#32D74B")}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#32D74B", display: "inline-block" }} />
              Available now
            </button>
          </div>
        </div>

        {/* Card stack + controls */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(20px,4vw,32px)" }}>

          {/* Stack container */}
          <div
            style={{
              position: "relative",
              width: "min(420px, 92vw)",
              height: "clamp(480px, 68vh, 580px)",
            }}
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX === null) return;
              const delta = e.changedTouches[0].clientX - touchStartX;
              if (delta > 70) skip();
              setTouchStartX(null);
            }}>

            {loading ? (
              /* Loading skeleton */
              <div style={{ position: "absolute", inset: 0, background: SURFACE, borderRadius: 28, border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(255,255,255,0.04)" }} className="animate-pulse" />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 140, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.05)" }} className="animate-pulse" />
                  <div style={{ width: 90, height: 12, borderRadius: 8, background: "rgba(255,255,255,0.03)" }} className="animate-pulse" />
                </div>
                <p style={{ fontFamily: FT, fontSize: 13, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>Loading crew…</p>
              </div>
            ) : done ? (
              /* End of deck */
              <div style={{ position: "absolute", inset: 0, background: SURFACE, borderRadius: 28, border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "clamp(24px,5%,40px)", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={28} style={{ color: MUTED }} />
                </div>
                <div>
                  <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 20, color: TEXT, marginBottom: 8 }}>You've seen them all</p>
                  <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.55 }}>
                    {profiles.length > 0
                      ? "Browse all profiles in the full search view."
                      : "No crew profiles yet. Be the first to join."}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  <button onClick={() => setIdx(0)}
                    style={{ padding: "11px 20px", borderRadius: 14, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, fontFamily: FT, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <RotateCcw size={13} /> Start over
                  </button>
                  <Link href="/search"
                    style={{ padding: "11px 20px", borderRadius: 14, background: AMBER, color: "#000", fontFamily: FT, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
                    View all <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Ghost card 2 (back) */}
                {next2 && (
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 28,
                    background: `linear-gradient(180deg, ${AVATAR_COLORS[next2.display_name.charCodeAt(0) % AVATAR_COLORS.length]} 0%, ${SURFACE} 40%)`,
                    border: `1px solid ${BORDER}`,
                    transform: "rotate(-4deg) translateY(14px) scale(0.88)",
                    transformOrigin: "center 90%",
                    zIndex: 1,
                  }} />
                )}
                {/* Ghost card 1 (middle) */}
                {next1 && (
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 28,
                    background: `linear-gradient(180deg, ${AVATAR_COLORS[next1.display_name.charCodeAt(0) % AVATAR_COLORS.length]} 0%, ${SURFACE} 40%)`,
                    border: `1px solid ${BORDER}`,
                    transform: "rotate(-2deg) translateY(7px) scale(0.94)",
                    transformOrigin: "center 90%",
                    zIndex: 2,
                  }} />
                )}
                {/* Front card */}
                {current && (
                  <div key={idx} style={{ position: "absolute", inset: 0, zIndex: 3 }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest("[data-skip='true']")) skip();
                    }}>
                    <ProfileCard p={current} exiting={exiting} cardIdx={idx} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls row */}
          {!loading && !done && current && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {/* Skip */}
                <button onClick={skip}
                  style={{
                    width: 52, height: 52, borderRadius: "50%",
                    border: `1.5px solid ${BORDER}`, background: "transparent", color: MUTED,
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,69,58,0.45)"; e.currentTarget.style.color = "#FF453A"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED; }}>
                  <X size={18} />
                </button>

                {/* View Profile */}
                <Link href={`/crew/${current.slug}`}
                  style={{
                    height: 52, padding: "0 clamp(24px,4vw,36px)", borderRadius: 26,
                    background: AMBER, color: "#000",
                    display: "flex", alignItems: "center", gap: 7,
                    fontFamily: FT, fontWeight: 700, fontSize: 15,
                    boxShadow: "0 4px 24px rgba(255,179,0,0.25)",
                    textDecoration: "none",
                  }}
                  className="transition-all hover:opacity-85 active:scale-[0.97]">
                  View Profile <ArrowRight size={15} />
                </Link>
              </div>

              {/* Counter + hint */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
                  {idx + 1} of {profiles.length} crew members
                </p>
                <p style={{ fontFamily: FT, fontSize: 11, color: "rgba(255,255,255,0.12)", marginTop: 3 }}>
                  Swipe or → key to skip
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function HomePage() {
  return (
    <div style={{ background: BG, minHeight: "100vh", overflowX: "hidden" }}>
      <Nav />

      {/* ── HERO ── */}
      <section style={{
        position: "relative", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        minHeight: "100vh", overflow: "hidden",
        padding: "clamp(100px,16vw,180px) clamp(20px,5vw,60px) clamp(60px,10vw,100px)",
      }}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "8%", pointerEvents: "none" }}>
          <div style={{ width: "min(900px,100vw)", height: 700, background: "radial-gradient(ellipse 55% 45% at 50% 40%, rgba(255,179,0,0.07) 0%, rgba(74,158,255,0.03) 45%, transparent 70%)" }} />
        </div>

        {/* Badge */}
        <div className="anim-up" style={{ marginBottom: 32 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: FT, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            background: "rgba(255,179,0,0.09)", color: AMBER, padding: "6px 18px", borderRadius: 20, border: "1px solid rgba(255,179,0,0.18)",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: AMBER, display: "inline-block" }} />
            Now Live · Philippines
          </span>
        </div>

        {/* Headline */}
        <h1 className="anim-up d1" style={{
          fontFamily: FD, fontWeight: 700, color: TEXT,
          fontSize: "clamp(2.6rem,8vw,5.8rem)",
          letterSpacing: "-0.038em", lineHeight: 1.04,
          marginBottom: 24, maxWidth: 800,
        }}>
          The crew behind<br />every great{" "}
          <span style={{ color: AMBER, textShadow: "0 0 80px rgba(255,179,0,0.22)" }}>production.</span>
        </h1>

        {/* Subtitle */}
        <p className="anim-up d2" style={{
          fontFamily: FT, fontSize: "clamp(15px,2vw,18px)",
          color: MUTED, lineHeight: 1.7, marginBottom: 48,
          maxWidth: "min(500px,90vw)",
        }}>
          SetReady connects directors, producers, and production houses
          with verified film and TV professionals across the Philippines.
        </p>

        {/* Search */}
        <div className="anim-up d3" style={{ width: "100%", maxWidth: "min(640px,92vw)", marginBottom: 28, position: "relative", zIndex: 10 }}>
          <HeroSearch />
        </div>

        {/* Scroll CTA */}
        <div className="anim-up d4" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <a href="#browse"
            onClick={(e) => { e.preventDefault(); document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" }); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: FT, fontSize: 15, fontWeight: 500, color: MUTED,
              cursor: "pointer", border: "none", background: "none",
              padding: "10px 20px",
            }}
            className="transition-colors hover:text-white">
            Browse crew <ArrowDown size={16} />
          </a>
          <Link href="/auth?intent=join"
            style={{ fontFamily: FT, fontSize: 13, color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", gap: 5 }}
            className="transition-colors hover:text-white/50">
            Join as a crew member <ArrowRight size={12} />
          </Link>
        </div>

        {/* Trust strip */}
        <div className="anim-up d5" style={{ position: "absolute", bottom: "clamp(32px,5vw,60px)", left: 0, right: 0, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 32, pointerEvents: "none" }}>
          {[{ icon: "🎬", text: "16 disciplines" }, { icon: "📍", text: "Nationwide" }, { icon: "🔒", text: "Contact gating" }].map((s) => (
            <span key={s.text} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FT, fontSize: 13, color: "rgba(255,255,255,0.2)" }}>
              <span style={{ fontSize: 15 }}>{s.icon}</span>{s.text}
            </span>
          ))}
        </div>
      </section>

      {/* ── CARD BROWSER ── */}
      <CrewBrowser />

      {/* ── JOIN CTA ── */}
      <section style={{ background: BG, padding: "clamp(64px,10vw,120px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px,5vw,64px)" }}>
          <div style={{ borderRadius: 28, overflow: "hidden", position: "relative", background: "#0E0E12", border: "1px solid rgba(255,179,0,0.12)" }}>
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent 5%, rgba(255,179,0,0.35) 50%, transparent 95%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 110%, rgba(255,179,0,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", padding: "clamp(48px,8vw,96px) clamp(28px,6vw,80px)", textAlign: "center" }}>
              <p style={{ fontFamily: FT, fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>
                For Crew Members
              </p>
              <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(1.9rem,5vw,3.8rem)", color: TEXT, marginBottom: 20, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Get discovered.<br /><span style={{ color: AMBER }}>Build your reel.</span>
              </h2>
              <p style={{ fontFamily: FT, fontSize: "clamp(15px,2vw,17px)", color: MUTED, maxWidth: 460, margin: "0 auto 48px", lineHeight: 1.7 }}>
                Create your free crew profile — list your equipment, past productions,
                and specializations. Let production teams find you.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <Link href="/auth?intent=join"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FT, fontSize: "clamp(14px,1.8vw,16px)", fontWeight: 600, background: AMBER, color: "#000", padding: "16px 36px", borderRadius: 28, boxShadow: "0 4px 28px rgba(255,179,0,0.28)", letterSpacing: "-0.01em" }}
                  className="transition-all hover:opacity-85 active:scale-[0.97]">
                  Create Profile <ArrowRight size={16} />
                </Link>
                <Link href="/search"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FT, fontSize: "clamp(14px,1.8vw,16px)", fontWeight: 500, color: MUTED, padding: "16px 20px" }}
                  className="transition-all hover:opacity-70">
                  Browse crew instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#080809", borderTop: `1px solid ${DIVIDER}`, padding: "clamp(40px,6vw,64px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px,5vw,64px)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Clapperboard size={16} style={{ color: AMBER }} strokeWidth={2} />
              <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT, letterSpacing: "-0.02em" }}>SetReady</span>
            </div>
            <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
              Film & TV crew marketplace · Philippines
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 32px" }}>
            {[{ href: "/search", label: "Find Crew" }, { href: "/auth?intent=join", label: "Join" }, { href: "/auth", label: "Sign In" }].map((l) => (
              <Link key={l.href} href={l.href} style={{ fontFamily: FT, fontSize: 13, color: "rgba(255,255,255,0.32)" }} className="hover:text-white/60 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
          <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
            © {new Date().getFullYear()} SetReady
          </p>
        </div>
      </footer>
    </div>
  );
}
