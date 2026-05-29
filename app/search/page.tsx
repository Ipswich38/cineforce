"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, AVAILABILITY, PH_REGIONS, PH_LOCATIONS } from "@/lib/constants";
import { Search, X, Clapperboard, Users, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";

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

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

type Profile = {
  id: string; slug: string; display_name: string; avatar_url: string | null;
  role: string; specializations: string[]; experience_level: string;
  city: string; availability: string; rate_min: number | null; rate_max: number | null;
  rate_unit: string | null; bio: string | null;
};

const AVATAR_COLORS  = ["#0F1A2E", "#1A0F2E", "#2E0F0F", "#0F2E1A", "#1A2E0F", "#2E1A0F"];
const AVATAR_ACCENTS = ["#4A9EFF", "#AF52DE", "#FF453A", "#32D74B", "#A8D934", "#FF9F0A"];


/* ─── Crew Card ─── */
function CrewCard({ p }: { p: Profile }) {
  const roleData  = ROLES.find((r) => r.id === p.role);
  const availData = AVAILABILITY.find((a) => a.id === p.availability);
  const idx       = p.display_name.charCodeAt(0) % AVATAR_COLORS.length;
  const accent    = AVATAR_ACCENTS[idx];
  const bg        = AVATAR_COLORS[idx];
  const initials  = p.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const availColor = availData?.color ?? MUTED;
  const bio = p.bio?.trim() || `${roleData?.label ?? "Film crew"} based in ${p.city}.`;

  return (
    <div
      className="group transition-all active:scale-[0.99]"
      style={{
        background: "#202020",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 26,
        overflow: "hidden",
        padding: 10,
        boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
      }}>
      <Link href={`/crew/${p.slug}`} style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          position: "relative",
          aspectRatio: "1 / 1",
          borderRadius: 22,
          overflow: "hidden",
          background: bg,
        }}>
          {p.avatar_url
            ? <img src={p.avatar_url} alt={p.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FD, fontSize: 44, fontWeight: 800, color: accent }}>{initials}</div>
          }
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.72) 100%)" }} />
        </div>

        <div style={{ padding: "18px 12px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <p style={{ fontFamily: FD, fontWeight: 760, fontSize: 22, color: TEXT, letterSpacing: "-0.03em", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.display_name}
            </p>
            <span style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "#F4F4F4", color: "#111",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontFamily: FT, fontSize: 15, fontWeight: 900, flexShrink: 0,
            }}>✓</span>
          </div>

          <p style={{ fontFamily: FT, fontSize: 14, color: "rgba(247,247,242,0.62)", lineHeight: 1.55, marginTop: 10, minHeight: 44 }}>
            {bio.length > 96 ? `${bio.slice(0, 93)}...` : bio}
          </p>
        </div>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 12px 14px" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: availColor, flexShrink: 0 }} />
          <span style={{ fontFamily: FT, fontSize: 13, fontWeight: 700, color: availColor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {availData?.label ?? "Available"}
          </span>
        </div>
        <span style={{ fontFamily: FT, fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 96 }}>
          {roleData?.label ?? p.role}
        </span>
        <Link href={`/crew/${p.slug}`}
          style={{
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            minHeight: 42, padding: "0 16px", borderRadius: 999,
            background: "#F4F4F4", color: "#000", textDecoration: "none",
            fontFamily: FT, fontSize: 14, fontWeight: 800,
          }}
          className="transition-all hover:opacity-90 active:scale-[0.98]">
          <MessageSquare size={15} /> Message
        </Link>
      </div>
    </div>
  );
}

/* ─── Search content ─── */
function SearchContent() {
  const searchParams    = useSearchParams();
  const [roleFilter,    setRoleFilter]    = useState(searchParams.get("role") ?? "");
  const [cityFilter,    setCityFilter]    = useState(searchParams.get("city") ?? "");
  const [expFilter,     setExpFilter]     = useState("");
  const [availFilter,   setAvailFilter]   = useState("");
  const [dateFrom,      setDateFrom]      = useState(searchParams.get("from") ?? "");
  const [dateTo,        setDateTo]        = useState(searchParams.get("to")   ?? "");
  const [profiles,      setProfiles]      = useState<Profile[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [total,         setTotal]         = useState(0);
  const [openPanel,     setOpenPanel]     = useState<"location" | "dates" | "crew" | null>(null);
  const [calMonth,      setCalMonth]      = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [pickEnd,       setPickEnd]       = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [roleSearch,     setRoleSearch]     = useState("");

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let q = supabase
        .from("profiles")
        .select(
          "id,slug,display_name,avatar_url,role,experience_level,city,availability,rate_min,rate_max,rate_unit,bio,profile_specializations(name)",
          { count: "exact" },
        )
        .order("created_at", { ascending: false });

      q = q.eq("is_paused", false).eq("is_crew", true);
      if (roleFilter)   q = q.eq("role", roleFilter);
      if (cityFilter)   q = q.eq("city", cityFilter);
      if (expFilter)    q = q.eq("experience_level", expFilter);
      if (availFilter)  q = q.eq("availability", availFilter);

      if (dateFrom) {
        const end = dateTo || dateFrom;
        const { data: busyData } = await supabase
          .from("crew_availability")
          .select("crew_id")
          .gte("date", dateFrom)
          .lte("date", end);
        const busyIds = [...new Set((busyData ?? []).map((d: { crew_id: string }) => d.crew_id))];
        if (busyIds.length > 0) q = q.not("id", "in", `(${busyIds.join(",")})`);
      }

      const { data, count } = await q;
      const list = (data ?? []).map((p: Record<string, unknown>) => ({
        ...p,
        specializations: (p.profile_specializations as { name: string }[] ?? []).map((s) => s.name),
      }));
      setProfiles(list as Profile[]);
      setTotal(count ?? list.length);
    } catch {
      setProfiles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, cityFilter, expFilter, availFilter, dateFrom, dateTo]);

  useEffect(() => {
    const t = setTimeout(fetchProfiles, 300);
    return () => clearTimeout(t);
  }, [fetchProfiles]);

  const hasFilters = roleFilter || cityFilter || expFilter || availFilter || dateFrom;
  const clearAll   = () => { setRoleFilter(""); setCityFilter(""); setExpFilter(""); setAvailFilter(""); setDateFrom(""); setDateTo(""); };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const calY = calMonth.getFullYear(), calM = calMonth.getMonth();
  const calDow = new Date(calY, calM, 1).getDay();
  const calOffset = calDow === 0 ? 6 : calDow - 1;
  const calDim = new Date(calY, calM + 1, 0).getDate();
  const calCells = Array.from({ length: Math.ceil((calOffset + calDim) / 7) * 7 }, (_, i) => {
    const d = i - calOffset + 1;
    return d >= 1 && d <= calDim ? d : null;
  });

  function handleDateClick(ds: string) {
    if (!dateFrom || !pickEnd) {
      setDateFrom(ds);
      setDateTo("");
      setPickEnd(true);
    } else if (ds < dateFrom) {
      setDateFrom(ds);
      setDateTo("");
    } else {
      setDateTo(ds);
      setPickEnd(false);
      setTimeout(() => setOpenPanel(null), 160);
    }
  }

  function handleOpenPanel(panel: "location" | "dates" | "crew") {
    if (openPanel !== panel) {
      setLocationSearch("");
      setRoleSearch("");
    }
    setOpenPanel((prev) => prev === panel ? null : panel);
  }

  const roleData = ROLES.find((r) => r.id === roleFilter);
  const dateLabel = dateFrom && dateTo
    ? `${fmtDate(dateFrom)} - ${fmtDate(dateTo)}`
    : dateFrom
      ? `From ${fmtDate(dateFrom)}`
      : "Add dates";
  const compactDropStyle: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    zIndex: 102,
    background: "#0E0E12",
    backgroundColor: "#0E0E12",
    backgroundClip: "padding-box",
    isolation: "isolate",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20,
    boxShadow: "0 28px 70px rgba(0,0,0,0.95)",
  };
  const compactPill = (id: "location" | "dates" | "crew"): React.CSSProperties => ({
    flex: "1 1 0",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "8px 14px",
    borderRadius: 999,
    border: "none",
    background: openPanel === id ? "#1A1A1F" : "#0A0A10",
    cursor: "pointer",
    textAlign: "left",
  });
  const compactDivider = (left: "location" | "dates", right: "dates" | "crew") =>
    openPanel === left || openPanel === right ? null : (
      <div style={{ width: 1, height: 26, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
    );

  return (
    <div className="mobile-nav-pad" style={{ background: BG, minHeight: "100dvh" }}>

      {/* ── Sticky Header ── */}
      <div style={{
        background: "rgba(10,10,12,0.96)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        borderBottom: `1px solid ${BORDER}`,
        position: "sticky", top: 0, zIndex: 40,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div className="app-container" style={{ padding: "12px 0 14px" }}>

          {/* Top bar: logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingInline: "calc((100% - min(100% - 32px, 1040px)) / 2)" }}>
            <Clapperboard size={15} style={{ color: AMBER }} strokeWidth={2} />
            <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT, letterSpacing: "-0.02em" }}>
              Find Crew
            </span>
          </div>

          {/* Compact booking search pill */}
          <div style={{ position: "relative" }}>
            {openPanel && (
              <div onClick={() => setOpenPanel(null)} style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(0,0,0,0.72)" }} />
            )}
            <div style={{
              position: "relative",
              zIndex: 101,
              display: "flex",
              alignItems: "center",
              backgroundColor: "#0A0A10",
              border: "1px solid rgba(255,204,0,0.38)",
              borderRadius: 999,
              padding: 4,
              boxShadow: "0 12px 34px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}>
              <button onClick={() => handleOpenPanel("location")} style={compactPill("location")}>
                <span style={{ fontFamily: FT, fontSize: 9, fontWeight: 700, color: TEXT, letterSpacing: "0.08em", textTransform: "uppercase" }}>Location</span>
                <span style={{ fontFamily: FT, fontSize: 12, color: cityFilter ? TEXT : MUTED, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                  {cityFilter || "Anywhere"}
                </span>
              </button>

              {compactDivider("location", "dates")}

              <button onClick={() => handleOpenPanel("dates")} style={compactPill("dates")}>
                <span style={{ fontFamily: FT, fontSize: 9, fontWeight: 700, color: TEXT, letterSpacing: "0.08em", textTransform: "uppercase" }}>Availability</span>
                <span style={{ fontFamily: FT, fontSize: 12, color: dateFrom ? TEXT : MUTED, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                  {dateLabel}
                </span>
              </button>

              {compactDivider("dates", "crew")}

              <button onClick={() => handleOpenPanel("crew")} style={compactPill("crew")}>
                <span style={{ fontFamily: FT, fontSize: 9, fontWeight: 700, color: TEXT, letterSpacing: "0.08em", textTransform: "uppercase" }}>Crew</span>
                <span style={{ fontFamily: FT, fontSize: 12, color: roleFilter ? TEXT : MUTED, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                  {roleData ? `${roleData.icon} ${roleData.label}` : "Any role"}
                </span>
              </button>

              <button onClick={() => setOpenPanel(null)}
                className="transition-all hover:opacity-90 active:scale-[0.97]"
                style={{
                  flexShrink: 0,
                  height: 40,
                  padding: "0 16px",
                  borderRadius: 999,
                  border: "none",
                  background: AMBER,
                  color: "#000",
                  fontFamily: FT,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}>
                <Search size={13} strokeWidth={2.5} />
                <span className="hidden sm:inline">Find</span>
              </button>
            </div>

            {openPanel === "location" && (
              <div style={{ ...compactDropStyle, maxHeight: 360, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search city or region..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    style={{ width: "100%", background: "#17171B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", color: TEXT, fontFamily: FT, fontSize: 13, outline: "none" }}
                  />
                </div>
                <div style={{ overflowY: "auto", flex: 1, background: "#0E0E12" }}>
                  {locationSearch.trim() ? (
                    (() => {
                      const q = locationSearch.toLowerCase();
                      const matches = PH_LOCATIONS.filter((c) => c.toLowerCase().includes(q));
                      if (!matches.length) return <div style={{ padding: "16px 20px", fontFamily: FT, fontSize: 13, color: MUTED }}>No cities found</div>;
                      return matches.map((loc) => (
                        <button key={loc} onClick={() => { setCityFilter(loc); setOpenPanel(null); setLocationSearch(""); }}
                          style={{ width: "100%", padding: "10px 20px", backgroundColor: cityFilter === loc ? "#221D0A" : "#0E0E12", border: "none", borderBottom: `1px solid ${DIVIDER}`, cursor: "pointer", textAlign: "left" }}>
                          <span style={{ fontFamily: FT, fontSize: 13, color: cityFilter === loc ? AMBER : TEXT }}>{loc}</span>
                        </button>
                      ));
                    })()
                  ) : (
                    <>
                      <button onClick={() => { setCityFilter(""); setOpenPanel(null); }}
                        style={{ width: "100%", padding: "12px 20px", backgroundColor: !cityFilter ? "#221D0A" : "#0E0E12", border: "none", borderBottom: `1px solid ${BORDER}`, cursor: "pointer", textAlign: "left" }}>
                        <span style={{ fontFamily: FT, fontSize: 13, color: !cityFilter ? AMBER : TEXT }}>Anywhere in the Philippines</span>
                      </button>
                      {PH_REGIONS.map((region) => (
                        <div key={region.id}>
                          <div style={{ padding: "8px 20px 4px", fontFamily: FT, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: "#0E0E12" }}>
                            {region.label}
                          </div>
                          {region.cities.map((loc) => (
                            <button key={loc} onClick={() => { setCityFilter(loc); setOpenPanel(null); }}
                              style={{ width: "100%", padding: "9px 20px 9px 28px", backgroundColor: cityFilter === loc ? "#221D0A" : "#0E0E12", border: "none", borderBottom: `1px solid ${DIVIDER}`, cursor: "pointer", textAlign: "left" }}>
                              <span style={{ fontFamily: FT, fontSize: 13, color: cityFilter === loc ? AMBER : TEXT }}>{loc}</span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {openPanel === "dates" && (
              <div style={{ ...compactDropStyle, padding: 18, maxHeight: "72dvh", overflowY: "auto" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontFamily: FT, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>From</label>
                    <input type="date" value={dateFrom} min={todayStr}
                      onChange={(e) => { const v = e.target.value; setDateFrom(v); if (dateTo && v > dateTo) setDateTo(""); setPickEnd(true); }}
                      style={{ width: "100%", background: "#17171B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", color: TEXT, fontFamily: FT, fontSize: 13, outline: "none", colorScheme: "dark" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontFamily: FT, fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>To</label>
                    <input type="date" value={dateTo} min={dateFrom || todayStr}
                      onChange={(e) => { setDateTo(e.target.value); setPickEnd(false); }}
                      style={{ width: "100%", background: "#17171B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", color: TEXT, fontFamily: FT, fontSize: 13, outline: "none", colorScheme: "dark" }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <button style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${BORDER}`, background: "#17171B", color: TEXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setCalMonth(new Date(calY, calM - 1, 1))}><ChevronLeft size={15} /></button>
                  <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 14, color: TEXT }}>{calMonth.toLocaleDateString("en-PH", { month: "long", year: "numeric" })}</span>
                  <button style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${BORDER}`, background: "#17171B", color: TEXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setCalMonth(new Date(calY, calM + 1, 1))}><ChevronRight size={15} /></button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 2 }}>
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => <div key={d} style={{ textAlign: "center", fontFamily: FT, fontSize: 10, color: MUTED, paddingBottom: 6, fontWeight: 600 }}>{d}</div>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                  {calCells.map((day, i) => {
                    if (!day) return <div key={i} />;
                    const ds = `${calY}-${String(calM + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isPast = ds < todayStr;
                    const isStart = ds === dateFrom;
                    const isEnd = ds === dateTo;
                    const inRange = !!(dateFrom && dateTo && ds > dateFrom && ds < dateTo);
                    return (
                      <button key={i} onClick={() => !isPast && handleDateClick(ds)}
                        style={{ minHeight: 34, borderRadius: 8, fontFamily: FT, fontSize: 12, fontWeight: isStart || isEnd ? 700 : 400, border: "1px solid transparent", background: isStart || isEnd ? AMBER : inRange ? "#332A0A" : "#17171B", color: isPast ? "rgba(255,255,255,0.15)" : isStart || isEnd ? "#000" : TEXT, cursor: isPast ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {day}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(""); setDateTo(""); setPickEnd(false); }}
                      style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${BORDER}`, backgroundColor: "#17171B", color: MUTED, fontFamily: FT, fontSize: 13, cursor: "pointer" }}>
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

            {openPanel === "crew" && (() => {
              const q = roleSearch.toLowerCase();
              const filtered = q ? ROLES.filter((r) => r.label.toLowerCase().includes(q) || r.dept.toLowerCase().includes(q)) : null;
              const depts = Array.from(new Set(ROLES.map((r) => r.dept)));
              return (
                <div style={{ ...compactDropStyle, maxHeight: 390, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
                    <input autoFocus type="text" placeholder="Search role or department..." value={roleSearch} onChange={(e) => setRoleSearch(e.target.value)}
                      style={{ width: "100%", background: "#17171B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", color: TEXT, fontFamily: FT, fontSize: 13, outline: "none" }}
                    />
                  </div>
                  <div style={{ overflowY: "auto", flex: 1, background: "#0E0E12" }}>
                    {filtered ? (
                      filtered.length === 0 ? (
                        <div style={{ padding: "16px 20px", fontFamily: FT, fontSize: 13, color: MUTED }}>No roles found</div>
                      ) : (
                        filtered.map((r) => (
                          <button key={r.id} onClick={() => { setRoleFilter(r.id); setOpenPanel(null); setRoleSearch(""); }}
                            style={{ width: "100%", padding: "10px 18px", backgroundColor: roleFilter === r.id ? "#221D0A" : "#0E0E12", border: "none", borderBottom: `1px solid ${DIVIDER}`, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 9 }}>
                            <span style={{ fontSize: 15 }}>{r.icon}</span>
                            <span style={{ fontFamily: FT, fontSize: 13, color: roleFilter === r.id ? AMBER : TEXT }}>{r.label}</span>
                            <span style={{ fontFamily: FT, fontSize: 11, color: MUTED, marginLeft: "auto" }}>{r.dept}</span>
                          </button>
                        ))
                      )
                    ) : (
                      <>
                        <button onClick={() => { setRoleFilter(""); setOpenPanel(null); }}
                          style={{ width: "100%", padding: "12px 20px", backgroundColor: !roleFilter ? "#221D0A" : "#0E0E12", border: "none", borderBottom: `1px solid ${BORDER}`, cursor: "pointer", textAlign: "left" }}>
                          <span style={{ fontFamily: FT, fontSize: 13, color: !roleFilter ? AMBER : TEXT }}>Any role</span>
                        </button>
                        {depts.map((dept) => (
                          <div key={dept}>
                            <div style={{ padding: "8px 20px 4px", fontFamily: FT, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: "#0E0E12" }}>{dept}</div>
                            {ROLES.filter((r) => r.dept === dept).map((r) => (
                              <button key={r.id} onClick={() => { setRoleFilter(r.id); setOpenPanel(null); }}
                                style={{ width: "100%", padding: "9px 20px 9px 24px", backgroundColor: roleFilter === r.id ? "#221D0A" : "#0E0E12", border: "none", borderBottom: `1px solid ${DIVIDER}`, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 14 }}>{r.icon}</span>
                                <span style={{ fontFamily: FT, fontSize: 12, color: roleFilter === r.id ? AMBER : TEXT }}>{r.label}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </div>

      {/* ── Results area ── */}
      <div className="app-container" style={{ paddingTop: 24, paddingBottom: "clamp(40px,6vw,72px)" }}>

        {/* ── Search context banner (from hero) ── */}
        {(roleFilter || cityFilter || dateFrom) && (
          <div style={{
            marginBottom: 20,
            padding: "14px 18px",
            borderRadius: 14,
            background: "linear-gradient(135deg, rgba(255,204,0,0.08) 0%, rgba(255,204,0,0.03) 100%)",
            border: "1px solid rgba(255,204,0,0.22)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", minWidth: 0 }}>
              <Search size={14} style={{ color: AMBER, flexShrink: 0 }} />
              <span style={{ fontFamily: FT, fontSize: 13, fontWeight: 600, color: TEXT }}>
                {[
                  roleFilter && (ROLES.find((r) => r.id === roleFilter)?.label ?? roleFilter),
                  cityFilter,
                  dateFrom && (dateTo && dateTo !== dateFrom ? `${fmtDate(dateFrom)} – ${fmtDate(dateTo)}` : fmtDate(dateFrom)),
                ].filter(Boolean).join(" · ")}
              </span>
            </div>
            <button onClick={clearAll}
              style={{ fontFamily: FT, fontSize: 12, color: MUTED, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              Clear <X size={11} />
            </button>
          </div>
        )}

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
          <p style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>
            {loading ? "Searching…" : `${total} crew member${total !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 12 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse" style={{
                background: SURFACE, borderRadius: 14, height: 120,
                border: `1px solid ${BORDER}`, borderLeft: "3px solid rgba(255,255,255,0.08)",
              }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && profiles.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: "clamp(60px,12vw,100px) 0",
            gap: 16,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 22, marginBottom: 4,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Users size={30} style={{ color: MUTED }} />
            </div>
            <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 20, color: TEXT }}>No crew found</p>
            <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, maxWidth: 280, lineHeight: 1.6 }}>
              Try adjusting your filters or search a different term.
            </p>
            {hasFilters && (
              <button onClick={clearAll}
                style={{
                  marginTop: 4, padding: "10px 22px", borderRadius: 999,
                  background: AMBER, color: "#000",
                  fontFamily: FT, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none",
                }}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Results grid */}
        {!loading && profiles.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: 16,
          }}>
            {profiles.map((p) => <CrewCard key={p.id} p={p} />)}
          </div>
        )}
      </div>

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ background: "#000000", minHeight: "100dvh" }} />}>
      <SearchContent />
    </Suspense>
  );
}
