"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, AVAILABILITY, EXPERIENCE_LEVELS, PH_REGIONS, PH_LOCATIONS } from "@/lib/constants";
import BrandLockup from "@/components/BrandLockup";
import BrandMark from "@/components/BrandMark";
import {
  ArrowRight, Search,
  X, Menu, ChevronLeft, ChevronRight, Calendar,
} from "lucide-react";

const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';

const BG      = "#000000";
const BG_ALT  = "#080808";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";
const DIVIDER = "rgba(255,255,255,0.05)";



/* ─── Nav ─── */
function Nav({ onHowClick }: { onHowClick: () => void }) {
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
            <BrandMark size={24} />
            <BrandLockup size={17} />
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
            <button
              type="button"
              onClick={onHowClick}
              style={{ fontFamily: FT, fontSize: 14, color: MUTED, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              className="transition-colors hover:text-white">
              How it works
            </button>
            {/* Cross-link to the CineVerse gear store (opens a new tab) */}
            <a
              href="https://www.cineverse.store"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: FT, fontSize: 14, fontWeight: 700, color: AMBER }}
              className="transition-opacity hover:opacity-80">
              Need Gear? ↗
            </a>
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
                { href: "#how", label: "How it works", emoji: "◌", action: () => { setMenuOpen(false); onHowClick(); } },
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
  const [openPanel,      setOpenPanel]      = useState<"location" | "dates" | "crew" | null>(null);
  const [calMonth,       setCalMonth]       = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [pickEnd,        setPickEnd]        = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [roleSearch,     setRoleSearch]     = useState("");

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
    if (openPanel !== panel) { setLocationSearch(""); setRoleSearch(""); }
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
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    zIndex: 10002,
    background: "#0E0E12",
    backgroundColor: "#0E0E12",
    backgroundClip: "padding-box",
    isolation: "isolate",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 24,
    boxShadow: "0 32px 80px rgba(0,0,0,0.98)",
  };

  const pill = (id: "location" | "dates" | "crew"): React.CSSProperties => ({
    flex: "1 1 0", minWidth: 0,
    display: "flex", flexDirection: "column", alignItems: "flex-start",
    padding: "clamp(8px,1.5vw,12px) clamp(12px,2vw,20px)",
    borderRadius: 999, border: "none", cursor: "pointer",
    background: openPanel === id ? "#1A1A1F" : "#0A0A10",
    boxShadow: openPanel === id ? "0 2px 12px rgba(0,0,0,0.45)" : "none",
    transition: "background 0.15s, box-shadow 0.15s",
    textAlign: "left",
  });

  const divider = (left: "location" | "dates", right: "dates" | "crew") =>
    openPanel === left || openPanel === right ? null : (
      <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
    );

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {openPanel && (
        <div onClick={() => setOpenPanel(null)} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.72)" }} />
      )}

      {/* ── Horizontal pill bar ── */}
      <div style={{
        position: "relative",
        zIndex: 10001,
        display: "flex", alignItems: "center",
        backgroundColor: "rgba(10,10,16,0.96)",
        border: "1px solid rgba(255,204,0,0.42)",
        borderRadius: 999, padding: "5px",
        boxShadow: "0 0 0 1px rgba(255,204,0,0.1), 0 20px 64px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.06)",
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
        <div style={{ ...dropStyle, maxHeight: 420, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Search input */}
          <div style={{ padding: "12px 16px", borderBottom: `1px solid rgba(255,255,255,0.07)`, flexShrink: 0 }}>
            <input
              autoFocus
              type="text"
              placeholder="Search city or region…"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                style={{
                width: "100%", background: "#17171B",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "8px 14px",
                color: TEXT, fontFamily: FT, fontSize: 14, outline: "none",
              }}
            />
          </div>
          {/* Scrollable list */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {locationSearch.trim() ? (
              // Flat filtered results
              (() => {
                const q = locationSearch.toLowerCase();
                const matches = PH_LOCATIONS.filter((c) => c.toLowerCase().includes(q));
                if (!matches.length) return <div style={{ padding: "16px 24px", fontFamily: FT, fontSize: 13, color: MUTED }}>No cities found</div>;
                return matches.map((loc) => (
                  <button key={loc} onClick={() => { setCity(loc); setOpenPanel(null); setLocationSearch(""); }}
                    style={{ width: "100%", padding: "11px 24px", backgroundColor: city === loc ? "#221D0A" : "#111116", border: "none", borderBottom: `1px solid rgba(255,255,255,0.03)`, cursor: "pointer", textAlign: "left" }}>
                    <span style={{ fontFamily: FT, fontSize: 14, color: city === loc ? AMBER : TEXT }}>{loc}</span>
                  </button>
                ));
              })()
            ) : (
              // Full grouped list
              <>
                <button onClick={() => { setCity(""); setOpenPanel(null); }}
                  style={{ width: "100%", padding: "13px 24px", backgroundColor: !city ? "#221D0A" : "#111116", border: "none", borderBottom: `1px solid ${BORDER}`, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontFamily: FT, fontSize: 14, color: !city ? AMBER : TEXT }}>Anywhere</span>
                </button>
                {PH_REGIONS.map((region) => (
                  <div key={region.id}>
                    <div style={{ padding: "8px 24px 4px", fontFamily: FT, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: "#111116" }}>
                      {region.label}
                    </div>
                    {region.cities.map((loc) => (
                      <button key={loc} onClick={() => { setCity(loc); setOpenPanel(null); }}
                        style={{ width: "100%", padding: "10px 24px 10px 32px", backgroundColor: city === loc ? "#221D0A" : "#111116", border: "none", borderBottom: `1px solid rgba(255,255,255,0.03)`, cursor: "pointer", textAlign: "left" }}>
                        <span style={{ fontFamily: FT, fontSize: 14, color: city === loc ? AMBER : TEXT }}>{loc}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Availability (dates) dropdown ── */}
      {openPanel === "dates" && (
        <div style={{ ...dropStyle, padding: "24px", maxHeight: "80dvh", overflowY: "auto" }}>
          {/* Manual date entry */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontFamily: FT, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>From</label>
              <input
                type="date"
                value={dateFrom ?? ""}
                min={todayStr}
                onChange={(e) => {
                  const v = e.target.value;
                  setDateFrom(v || null);
                  if (dateTo && v > dateTo) setDateTo(null);
                  setPickEnd(true);
                }}
                style={{ width: "100%", background: "#17171B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", color: TEXT, fontFamily: FT, fontSize: 13, outline: "none", colorScheme: "dark" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontFamily: FT, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>To</label>
              <input
                type="date"
                value={dateTo ?? ""}
                min={dateFrom ?? todayStr}
                onChange={(e) => { setDateTo(e.target.value || null); setPickEnd(false); }}
                style={{ width: "100%", background: "#17171B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", color: TEXT, fontFamily: FT, fontSize: 13, outline: "none", colorScheme: "dark" }}
              />
            </div>
          </div>
          <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 16, textAlign: "center" }}>
            {!dateFrom ? "Or pick from calendar" : !dateTo ? "Select end date" : dateLabel}
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
                    background: isStart || isEnd ? AMBER : inRange ? "#332A0A" : "#17171B",
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
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${BORDER}`, backgroundColor: "#111116", color: MUTED, fontFamily: FT, fontSize: 13, cursor: "pointer" }}>
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
      {openPanel === "crew" && (() => {
        const q = roleSearch.toLowerCase();
        const filtered = q ? ROLES.filter((r) => r.label.toLowerCase().includes(q) || r.dept.toLowerCase().includes(q)) : null;
        const depts = Array.from(new Set(ROLES.map((r) => r.dept)));
        return (
          <div style={{ ...dropStyle, maxHeight: 460, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Search input */}
            <div style={{ padding: "12px 16px", borderBottom: `1px solid rgba(255,255,255,0.07)`, flexShrink: 0 }}>
              <input
                autoFocus
                type="text"
                placeholder="Search role or department…"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                style={{
                  width: "100%", background: "#17171B",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, padding: "8px 14px",
                  color: TEXT, fontFamily: FT, fontSize: 14, outline: "none",
                }}
              />
            </div>
            {/* Scrollable list */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filtered ? (
                // Flat filtered results
                filtered.length === 0 ? (
                  <div style={{ padding: "16px 24px", fontFamily: FT, fontSize: 13, color: MUTED }}>No roles found</div>
                ) : (
                  filtered.map((r) => (
                    <button key={r.id} onClick={() => { setRole(r.id); setOpenPanel(null); setRoleSearch(""); }}
                      style={{ width: "100%", padding: "11px 20px", backgroundColor: role === r.id ? "#221D0A" : "#111116", border: "none", borderBottom: `1px solid ${DIVIDER}`, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{r.icon}</span>
                      <span style={{ fontFamily: FT, fontSize: 13, color: role === r.id ? AMBER : TEXT }}>{r.label}</span>
                      <span style={{ fontFamily: FT, fontSize: 11, color: MUTED, marginLeft: "auto" }}>{r.dept}</span>
                    </button>
                  ))
                )
              ) : (
                // Full grouped list
                <>
                  <button onClick={() => { setRole(""); setOpenPanel(null); }}
                    style={{ width: "100%", padding: "13px 24px", backgroundColor: !role ? "#221D0A" : "#111116", border: "none", borderBottom: `1px solid ${BORDER}`, cursor: "pointer", textAlign: "left" }}>
                    <span style={{ fontFamily: FT, fontSize: 14, color: !role ? AMBER : TEXT }}>Any role</span>
                  </button>
                  {depts.map((dept) => (
                    <div key={dept}>
                      <div style={{ padding: "8px 24px 4px", fontFamily: FT, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: "#111116" }}>
                        {dept}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                        {ROLES.filter((r) => r.dept === dept).map((r, i) => (
                          <button key={r.id}
                            onClick={() => { setRole(r.id); setOpenPanel(null); }}
                            style={{
                              padding: "10px 14px", backgroundColor: role === r.id ? "#221D0A" : "#111116",
                              border: "none",
                              borderBottom: `1px solid ${DIVIDER}`,
                              borderRight: i % 2 === 0 ? `1px solid ${DIVIDER}` : "none",
                              cursor: "pointer", textAlign: "left",
                              display: "flex", alignItems: "center", gap: 8,
                            }}>
                            <span style={{ fontSize: 14 }}>{r.icon}</span>
                            <span style={{ fontFamily: FT, fontSize: 12, color: role === r.id ? AMBER : TEXT }}>{r.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}


const HOW_STEPS = [
  { num: "01", icon: "🔍", title: "Search by role and date", desc: "Pick a role, set your project dates, and choose a city. CineForce shows crew who are actually available." },
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
          How CineForce works
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


const HERO_MSGS: Array<Array<{ t: string; a?: true }>> = [
  [{ t: "Find the right " }, { t: "crew", a: true }, { t: " for your next " }, { t: "project", a: true }, { t: "." }],
  [{ t: "Verified talent", a: true }, { t: ". Real availability. No cold DMs." }],
  [{ t: "The marketplace built for " }, { t: "film & media professionals", a: true }, { t: "." }],
];

/* ─── Page ─── */
export default function HomePage() {
  const [howOpen, setHowOpen] = useState(false);
  const [msgIdx,  setMsgIdx]  = useState(0);
  const [msgIn,   setMsgIn]   = useState(true);

  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setMsgIn(false);
      fadeTimer = setTimeout(() => { setMsgIdx(i => (i + 1) % HERO_MSGS.length); setMsgIn(true); }, 450);
    }, 3800);
    return () => { clearInterval(id); clearTimeout(fadeTimer); };
  }, []);

  return (
    <div className="mobile-nav-pad" style={{ background: BG, minHeight: "100dvh", overflowX: "hidden" }}>
      <Nav onHowClick={() => setHowOpen(true)} />
      <HowItWorksModal open={howOpen} onClose={() => setHowOpen(false)} />

      {/* ── HERO ── */}
      <section style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "#000",
      }}>
        {/* Video background */}
        <video autoPlay loop muted playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}>
          <source src="/bg.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.88)" }} />

        {/* Content — flex column, fills full hero height */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", flex: 1 }}>

          {/* ── Search bar: just below nav, edge-aligned with logo/Join ── */}
          <div style={{ paddingTop: "calc(60px + env(safe-area-inset-top, 0px) + 20px)" }}>
            <div className="app-container">
              <BookingSearch />
            </div>
          </div>

          {/* ── Rotating tagline + CTAs: centered in remaining space ── */}
          <div style={{
            flex: 1,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "clamp(40px,6vw,80px) clamp(16px,5vw,48px) clamp(56px,8vw,96px)",
            textAlign: "center",
          }}>

            {/* Cycling headline */}
            <p style={{
              fontFamily: FD,
              fontSize: "clamp(28px,5.5vw,56px)",
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.035em",
              color: TEXT,
              marginBottom: 36,
              maxWidth: 680,
              opacity: msgIn ? 1 : 0,
              transition: "opacity 0.45s ease",
            }}>
              {HERO_MSGS[msgIdx].map((seg, i) => (
                <span key={i} style={seg.a ? { color: AMBER } : undefined}>{seg.t}</span>
              ))}
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
              <Link href="/auth?intent=join&next=/join%3Ftype%3Dclient"
                style={{
                  fontFamily: FT, fontSize: 14, fontWeight: 700,
                  color: "#000", background: AMBER,
                  minHeight: 42, padding: "0 22px", borderRadius: 999,
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 1px 0 rgba(255,255,255,0.35) inset",
                }}
                className="transition-all hover:opacity-90 active:scale-[0.98]">
                Hire crew <ArrowRight size={13} />
              </Link>

              <Link href="/auth?intent=join&next=/join%3Ftype%3Dcrew"
                style={{
                  fontFamily: FT, fontSize: 14, fontWeight: 700,
                  color: TEXT, background: "rgba(255,255,255,0.06)",
                  minHeight: 42, padding: "0 22px", borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "center", gap: 6,
                }}
                className="transition-all hover:bg-white/10 active:scale-[0.98]">
                Join as crew <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
