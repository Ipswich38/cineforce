"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, AVAILABILITY, EXPERIENCE_LEVELS, PH_LOCATIONS } from "@/lib/constants";
import {
  ArrowRight, Search,
  Clapperboard, X, Menu, ChevronLeft, ChevronRight, Calendar,
} from "lucide-react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#000000";
const BG_ALT  = "#080808";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";
const DIVIDER = "rgba(255,255,255,0.05)";



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
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}>
        <div className="app-container" style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Clapperboard size={17} style={{ color: AMBER }} strokeWidth={2} />
            <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, letterSpacing: "-0.02em" }}>CineVerse</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center" style={{ gap: 28, flex: 1, justifyContent: "center" }}>
            {[
              { href: "/search", label: "Find" },
              { href: "/about", label: "About" },
            ].map(({ href, label }) => (
              <Link key={label} href={href}
                style={{ fontFamily: FT, fontSize: 14, color: MUTED }}
                className="transition-colors hover:text-white">{label}</Link>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

            {/* Desktop: sign in */}
            <Link href="/auth"
              style={{ fontFamily: FT, fontSize: 14, color: MUTED, padding: "6px 10px" }}
              className="hidden md:block transition-colors hover:text-white">
              Log in
            </Link>

            {/* ALWAYS VISIBLE: Join as Crew */}
            <Link href="/auth?intent=join"
              className="nav-primary-cta transition-all hover:opacity-85 active:scale-[0.97]"
              style={{
                fontFamily: FT, fontWeight: 700, fontSize: 14,
                background: AMBER, color: "#000",
                padding: "9px clamp(14px,2.5vw,22px)", borderRadius: 22,
                letterSpacing: "-0.01em", whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 5,
              }}>
              {/* Shorter label on very small screens */}
              <span>Join</span>
            </Link>

            {/* Hamburger hidden — bottom nav handles mobile navigation */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="hidden flex items-center justify-center"
              style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                border: `1px solid ${menuOpen ? "rgba(255,255,255,0.14)" : BORDER}`,
                background: menuOpen ? "rgba(255,255,255,0.06)" : "transparent",
                color: TEXT, cursor: "pointer",
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
              position: "fixed",
              top: "calc(60px + env(safe-area-inset-top, 0px))",
              left: 0, right: 0, zIndex: 49,
              background: "rgba(12,12,15,0.98)",
              borderBottom: `1px solid ${BORDER}`,
              boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
              maxHeight: "calc(100dvh - 60px - env(safe-area-inset-top, 0px))",
              overflowY: "auto",
            }}>
            <div style={{ padding: "8px clamp(16px,5vw,32px) clamp(20px,4vh,32px)" }}>

              {/* Nav links */}
              {[
                { href: "/search", label: "Find crew", emoji: "🔍", action: () => setMenuOpen(false) },
                { href: "/about", label: "About", emoji: "▰", action: () => setMenuOpen(false) },
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
                <span style={{ fontFamily: FT, fontSize: 15, color: MUTED }}>Log in</span>
              </Link>

              {/* Join CTA card — encouragement */}
              <div className="app-surface" style={{
                marginTop: "clamp(18px,4vw,24px)",
                padding: "clamp(18px,4vw,24px)",
                background: "linear-gradient(135deg, rgba(255,179,0,0.07) 0%, rgba(255,179,0,0.03) 100%)",
                border: "1px solid rgba(255,179,0,0.2)",
              }}>
                <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 18, color: TEXT, marginBottom: 8 }}>
                  Work in production?
                </p>
                <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 18 }}>
                  Create a card. Get found. Stay booked.
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
                  Join free <ArrowRight size={15} />
                </Link>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ─── Booking Search (Airbnb-style horizontal pill bar) ─── */
function BookingSearch() {
  const router = useRouter();

  const [role,      setRole]      = useState("");
  const [city,      setCity]      = useState("");
  const [dateFrom,  setDateFrom]  = useState<string | null>(null);
  const [dateTo,    setDateTo]    = useState<string | null>(null);
  const [openPanel, setOpenPanel] = useState<"location" | "dates" | "crew" | null>(null);
  const [calMonth,  setCalMonth]  = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [pickEnd,   setPickEnd]   = useState(false);
  const [dropRect,  setDropRect]  = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const barRef = useRef<HTMLDivElement>(null);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const calY = calMonth.getFullYear(), calM = calMonth.getMonth();
  const calDow    = new Date(calY, calM, 1).getDay();
  const calOffset = calDow === 0 ? 6 : calDow - 1;
  const calDim    = new Date(calY, calM + 1, 0).getDate();
  const calCells  = Array.from({ length: Math.ceil((calOffset + calDim) / 7) * 7 }, (_, i) => {
    const d = i - calOffset + 1;
    return d >= 1 && d <= calDim ? d : null;
  });

  function handleDateClick(ds: string) {
    if (!dateFrom || !pickEnd) {
      setDateFrom(ds); setDateTo(null); setPickEnd(true);
    } else {
      if (ds < dateFrom) { setDateFrom(ds); setDateTo(null); }
      else { setDateTo(ds); setPickEnd(false); setTimeout(() => setOpenPanel(null), 180); }
    }
  }

  function handleOpenPanel(panel: "location" | "dates" | "crew") {
    if (barRef.current) {
      const r = barRef.current.getBoundingClientRect();
      setDropRect({ top: r.bottom + 8, left: r.left, width: r.width });
    }
    setOpenPanel((prev) => prev === panel ? null : panel);
  }

  function doSearch() {
    const p = new URLSearchParams();
    if (role)     p.set("role", role);
    if (city)     p.set("city", city);
    if (dateFrom) p.set("from", dateFrom);
    if (dateTo)   p.set("to", dateTo);
    router.push(`/search${p.toString() ? `?${p}` : ""}`);
  }

  const roleData = ROLES.find((r) => r.id === role);

  let dateLabel = "Add dates";
  if (dateFrom && dateTo) {
    const a = new Date(dateFrom + "T00:00:00"), b = new Date(dateTo + "T00:00:00");
    dateLabel = `${a.toLocaleDateString("en-PH", { month: "short", day: "numeric" })} – ${b.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}`;
  } else if (dateFrom) {
    dateLabel = `From ${new Date(dateFrom + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric" })}`;
  }

  const DAYS_CAL = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const navBtn: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`,
    background: "transparent", color: TEXT, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  };
  const dropStyle: React.CSSProperties = {
    position: "fixed",
    top: dropRect.top,
    left: dropRect.left,
    width: dropRect.width,
    zIndex: 9999,
    background: "#111",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.85)",
  };

  const pill = (id: "location" | "dates" | "crew"): React.CSSProperties => ({
    flex: "1 1 0", minWidth: 0,
    display: "flex", flexDirection: "column", alignItems: "flex-start",
    padding: "clamp(8px,1.5vw,12px) clamp(12px,2vw,20px)",
    borderRadius: 999, border: "none", cursor: "pointer",
    background: openPanel === id ? "rgba(255,255,255,0.09)" : "transparent",
    boxShadow: openPanel === id ? "0 2px 12px rgba(0,0,0,0.45)" : "none",
    transition: "background 0.15s, box-shadow 0.15s",
    textAlign: "left",
  });

  const divider = (left: "location" | "dates", right: "dates" | "crew") =>
    openPanel === left || openPanel === right ? null : (
      <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
    );

  return (
    <div style={{ width: "100%", position: "relative" }} ref={barRef}>
      {openPanel && (
        <div onClick={() => setOpenPanel(null)} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} />
      )}

      {/* ── Horizontal pill bar ── */}
      <div style={{
        display: "flex", alignItems: "center",
        background: "rgba(20,20,24,0.96)",
        border: "1px solid rgba(255,255,255,0.13)",
        borderRadius: 999, padding: "5px",
        boxShadow: "0 18px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}>

        {/* Location */}
        <button onClick={() => handleOpenPanel("location")} style={pill("location")}>
          <span style={{ fontFamily: FT, fontSize: 10, fontWeight: 700, color: TEXT, letterSpacing: "0.08em", textTransform: "uppercase" }}>Location</span>
          <span style={{ fontFamily: FT, fontSize: "clamp(12px,1.8vw,14px)", color: city ? TEXT : MUTED, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
            {city || "Anywhere"}
          </span>
        </button>

        {divider("location", "dates")}

        {/* Availability */}
        <button onClick={() => handleOpenPanel("dates")} style={pill("dates")}>
          <span style={{ fontFamily: FT, fontSize: 10, fontWeight: 700, color: TEXT, letterSpacing: "0.08em", textTransform: "uppercase" }}>Availability</span>
          <span style={{ fontFamily: FT, fontSize: "clamp(12px,1.8vw,14px)", color: (dateFrom || dateTo) ? TEXT : MUTED, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
            {dateLabel}
          </span>
        </button>

        {divider("dates", "crew")}

        {/* Crew */}
        <button onClick={() => handleOpenPanel("crew")} style={pill("crew")}>
          <span style={{ fontFamily: FT, fontSize: 10, fontWeight: 700, color: TEXT, letterSpacing: "0.08em", textTransform: "uppercase" }}>Crew</span>
          <span style={{ fontFamily: FT, fontSize: "clamp(12px,1.8vw,14px)", color: role ? TEXT : MUTED, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
            {roleData ? `${roleData.icon} ${roleData.label}` : "Any role"}
          </span>
        </button>

        {/* Search button */}
        <div style={{ flexShrink: 0, paddingLeft: 4 }}>
          <button onClick={doSearch}
            className="transition-all hover:opacity-90 active:scale-[0.97]"
            style={{
              height: 46, padding: "0 clamp(14px,2.5vw,22px)", borderRadius: 999,
              background: AMBER, color: "#000", border: "none",
              fontFamily: FT, fontWeight: 700, fontSize: "clamp(12px,1.6vw,14px)",
              cursor: "pointer", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: "0 1px 0 rgba(255,255,255,0.3) inset",
            }}>
            <Search size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Find crew</span>
          </button>
        </div>
      </div>

      {/* ── Location dropdown ── */}
      {openPanel === "location" && (
        <div style={{ ...dropStyle, maxHeight: 320, overflowY: "auto" }}>
          <button onClick={() => { setCity(""); setOpenPanel(null); }}
            style={{ width: "100%", padding: "14px 24px", background: !city ? "rgba(255,204,0,0.07)" : "transparent", border: "none", borderBottom: `1px solid ${BORDER}`, cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontFamily: FT, fontSize: 14, color: !city ? AMBER : TEXT }}>Anywhere in the Philippines</span>
          </button>
          {PH_LOCATIONS.map((loc, i) => (
            <button key={loc} onClick={() => { setCity(loc); setOpenPanel(null); }}
              style={{ width: "100%", padding: "12px 24px", background: city === loc ? "rgba(255,204,0,0.07)" : "transparent", border: "none", borderBottom: i < PH_LOCATIONS.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontFamily: FT, fontSize: 14, color: city === loc ? AMBER : TEXT }}>{loc}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Availability (dates) dropdown ── */}
      {openPanel === "dates" && (
        <div style={{ ...dropStyle, padding: "24px", maxHeight: "80dvh", overflowY: "auto" }}>
          <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 16, textAlign: "center" }}>
            {!dateFrom ? "Select start date" : !dateTo ? "Select end date" : dateLabel}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <button style={navBtn} onClick={() => setCalMonth(new Date(calY, calM - 1, 1))}><ChevronLeft size={16} /></button>
            <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT }}>
              {calMonth.toLocaleDateString("en-PH", { month: "long", year: "numeric" })}
            </span>
            <button style={navBtn} onClick={() => setCalMonth(new Date(calY, calM + 1, 1))}><ChevronRight size={16} /></button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 2 }}>
            {DAYS_CAL.map((d) => (
              <div key={d} style={{ textAlign: "center", fontFamily: FT, fontSize: 10, color: MUTED, paddingBottom: 6, fontWeight: 600 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {calCells.map((day, i) => {
              if (!day) return <div key={i} />;
              const ds      = `${calY}-${String(calM + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isPast  = ds < todayStr;
              const isStart = ds === dateFrom;
              const isEnd   = ds === dateTo;
              const inRange = !!(dateFrom && dateTo && ds > dateFrom && ds < dateTo);
              return (
                <button key={i}
                  onClick={() => !isPast && handleDateClick(ds)}
                  style={{
                    minHeight: 36, borderRadius: 8, fontFamily: FT, fontSize: 13,
                    fontWeight: isStart || isEnd ? 700 : 400,
                    border: "1px solid transparent",
                    background: isStart || isEnd ? AMBER : inRange ? "rgba(255,204,0,0.12)" : "rgba(255,255,255,0.03)",
                    color: isPast ? "rgba(255,255,255,0.15)" : isStart || isEnd ? "#000" : TEXT,
                    cursor: isPast ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.1s",
                  }}>
                  {day}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(null); setDateTo(null); setPickEnd(false); }}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, fontFamily: FT, fontSize: 13, cursor: "pointer" }}>
                Clear
              </button>
            )}
            <button onClick={() => setOpenPanel(null)}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: AMBER, color: "#000", fontFamily: FT, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Crew (role) dropdown ── */}
      {openPanel === "crew" && (
        <div style={{ ...dropStyle, maxHeight: 360, overflowY: "auto" }}>
          <button onClick={() => { setRole(""); setOpenPanel(null); }}
            style={{ width: "100%", padding: "13px 24px", background: !role ? "rgba(255,204,0,0.07)" : "transparent", border: "none", borderBottom: `1px solid ${BORDER}`, cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontFamily: FT, fontSize: 14, color: !role ? AMBER : TEXT }}>All roles</span>
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {ROLES.map((r, i) => (
              <button key={r.id}
                onClick={() => { setRole(r.id); setOpenPanel(null); }}
                style={{
                  padding: "12px 16px", background: role === r.id ? "rgba(255,204,0,0.07)" : "transparent",
                  border: "none",
                  borderBottom: i < ROLES.length - 2 ? `1px solid ${DIVIDER}` : "none",
                  borderRight: i % 2 === 0 ? `1px solid ${DIVIDER}` : "none",
                  cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                <span style={{ fontSize: 15 }}>{r.icon}</span>
                <span style={{ fontFamily: FT, fontSize: 13, color: role === r.id ? AMBER : TEXT }}>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


const HOW_STEPS = [
  { num: "01", icon: "🔍", title: "Search by role and date", desc: "Pick a role, set your project dates, and choose a city. CineVerse shows crew who are actually available." },
  { num: "02", icon: "🃏", title: "Browse profile cards",    desc: "See rate, experience, specializations, and availability at a glance. No cold DMs into the void." },
  { num: "03", icon: "💬", title: "Connect and chat",        desc: "Send a connection request with your project details. Once the crew accepts, you chat directly inside the app." },
];

/* ─── How It Works modal ─── */
function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }} />
      <div style={{
        position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
        zIndex: 501, width: "min(620px, calc(100vw - 32px))", maxHeight: "88dvh",
        overflowY: "auto", background: "#0c0c10",
        border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24,
        padding: "clamp(24px,4vw,40px)",
        boxShadow: "0 40px 120px rgba(0,0,0,0.9)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, width: 32, height: 32,
          borderRadius: 8, border: `1px solid ${BORDER}`,
          background: "rgba(255,255,255,0.05)", color: MUTED,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}><X size={15} /></button>

        <p style={{ fontFamily: FT, fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
          How CineVerse works
        </p>
        <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(1.3rem,3vw,1.7rem)", color: TEXT, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: 28 }}>
          From search to set. <span style={{ color: AMBER }}>Fast.</span>
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {HOW_STEPS.map((s) => (
            <div key={s.num} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "clamp(16px,3vw,22px)", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, paddingTop: 2 }}>
                <span style={{ fontFamily: FD, fontSize: 10, fontWeight: 700, color: AMBER, letterSpacing: "0.1em" }}>{s.num}</span>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
              </div>
              <div>
                <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 5 }}>{s.title}</p>
                <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, padding: "clamp(14px,3vw,20px)", borderRadius: 16, background: "linear-gradient(135deg, rgba(255,204,0,0.07) 0%, rgba(255,204,0,0.02) 100%)", border: "1px solid rgba(255,204,0,0.15)", display: "flex", gap: 14, alignItems: "center" }}>
          <Calendar size={20} style={{ color: AMBER, flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 14, color: TEXT, marginBottom: 3 }}>Crew set their own availability</p>
            <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, lineHeight: 1.6 }}>Search by date and only see crew who are free for your shoot window.</p>
          </div>
        </div>

        <Link href="/search" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, padding: "13px", borderRadius: 12, background: AMBER, color: "#000", fontFamily: FT, fontWeight: 700, fontSize: 14, textDecoration: "none" }}
          className="transition-all hover:opacity-90 active:scale-[0.98]">
          Find available crew <ArrowRight size={14} />
        </Link>
      </div>
    </>
  );
}


/* ─── Page ─── */
export default function HomePage() {
  const [howOpen, setHowOpen] = useState(false);

  return (
    <div className="mobile-nav-pad" style={{ background: BG, minHeight: "100dvh", overflowX: "hidden" }}>
      <Nav />
      <HowItWorksModal open={howOpen} onClose={() => setHowOpen(false)} />

      {/* ── HERO ── */}
      <section style={{
        position: "relative", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center",
        minHeight: "100dvh",
        padding: "clamp(80px,12vw,140px) clamp(16px,5vw,48px) clamp(56px,8vw,80px)",
        background: "linear-gradient(160deg, #08080d 0%, #0c0c14 45%, #060609 100%)",
      }}>
        {/* Subtle amber ambient glow */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: "min(800px,100vw)", height: 600, background: "radial-gradient(ellipse 60% 50% at 50% 42%, rgba(255,204,0,0.055) 0%, rgba(255,120,0,0.025) 50%, transparent 72%)" }} />
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

          {/* Search bar */}
          <div className="anim-up" style={{ width: "100%", maxWidth: "min(600px,calc(100vw - 32px))", marginBottom: 28 }}>
            <p style={{
              fontFamily: FD, fontSize: "clamp(13px,1.5vw,15px)", fontWeight: 600,
              color: "rgba(255,255,255,0.55)", letterSpacing: "-0.01em",
              marginBottom: 12, textAlign: "left",
            }}>
              Find the right crew for your next project.
            </p>
            <BookingSearch />
          </div>

          {/* CTAs */}
          <div className="anim-up d3" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/auth?intent=join"
              style={{
                fontFamily: FT, fontSize: 14, fontWeight: 700,
                color: "#000", background: AMBER,
                minHeight: 42, padding: "0 22px", borderRadius: 999,
                display: "flex", alignItems: "center", gap: 6,
                boxShadow: "0 1px 0 rgba(255,255,255,0.35) inset",
              }}
              className="transition-all hover:opacity-90 active:scale-[0.98]">
              Join as crew <ArrowRight size={13} />
            </Link>

            {/* How it works — pulsing indicator */}
            <button
              onClick={() => setHowOpen(true)}
              style={{
                fontFamily: FT, fontSize: 14, color: TEXT,
                minHeight: 42, padding: "0 18px", borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", gap: 8,
                cursor: "pointer",
              }}
              className="transition-all hover:bg-white/10 active:scale-[0.98]">
              {/* Ping indicator */}
              <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8, flexShrink: 0 }}>
                <span className="animate-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: AMBER, opacity: 0.6 }} />
                <span style={{ position: "relative", width: 8, height: 8, borderRadius: "50%", background: AMBER, display: "inline-block" }} />
              </span>
              How it works
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
