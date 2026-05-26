"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, EXPERIENCE_LEVELS, AVAILABILITY, PH_LOCATIONS } from "@/lib/constants";
import { Search, X, ChevronDown, ArrowRight, Clapperboard, Users, SlidersHorizontal } from "lucide-react";
import { searchIndustryRoles, type IndustryRole } from "@/lib/industryRoles";

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

const FILTER_COLORS = {
  role:         "#FFCC00",
  location:     "#4A9EFF",
  experience:   "#AF52DE",
  availability: "#32D74B",
} as const;

type FilterKey = keyof typeof FILTER_COLORS;

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
  const expData   = EXPERIENCE_LEVELS.find((e) => e.id === p.experience_level);
  const idx       = p.display_name.charCodeAt(0) % AVATAR_COLORS.length;
  const accent    = AVATAR_ACCENTS[idx];
  const bg        = AVATAR_COLORS[idx];
  const initials  = p.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const availColor = availData?.color ?? MUTED;

  return (
    <Link href={`/crew/${p.slug}`} style={{ textDecoration: "none", display: "block" }}
      className="group transition-all active:scale-[0.99]">
      <div style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${availColor}`,
        borderRadius: 14,
        overflow: "hidden",
        transition: "border-color 0.18s",
      }}
        className="group-hover:border-white/[0.14]">

        <div style={{ padding: "16px 18px 14px" }}>
          {/* Avatar + name + availability */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 13, flexShrink: 0,
              background: bg, color: accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: FD, fontWeight: 700, fontSize: 15,
              border: `1.5px solid ${accent}35`,
              overflow: "hidden",
            }}>
              {p.avatar_url
                ? <img src={p.avatar_url} alt={p.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: TEXT, lineHeight: 1.25, marginBottom: 2 }}>
                {p.display_name}
              </p>
              <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 13 }}>{roleData?.icon ?? "🎬"}</span>
                <span>{roleData?.label ?? p.role}</span>
                <span style={{ color: BORDER }}>·</span>
                <span>{p.city}</span>
              </p>
            </div>

            {/* Availability badge */}
            {availData && (
              <div style={{
                flexShrink: 0,
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 9px", borderRadius: 20,
                background: `${availColor}12`,
                border: `1px solid ${availColor}30`,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: availColor, display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontFamily: FT, fontSize: 11, fontWeight: 600, color: availColor }}>{availData.label}</span>
              </div>
            )}
          </div>

          {/* Specialization tags */}
          {p.specializations?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {p.specializations.slice(0, 3).map((s) => (
                <span key={s} style={{
                  fontSize: 11, fontFamily: FT,
                  background: `${accent}0D`, color: accent,
                  padding: "3px 9px", borderRadius: 20,
                  border: `1px solid ${accent}22`,
                }}>{s}</span>
              ))}
            </div>
          )}

          {/* Rate + exp + arrow */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {expData && (
                <span style={{ fontFamily: FT, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  {expData.label}
                </span>
              )}
              {p.rate_min && (
                <span style={{ fontFamily: FT, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  ₱{p.rate_min.toLocaleString()}/{p.rate_unit ?? "day"}
                </span>
              )}
            </div>
            <span style={{ fontFamily: FT, fontSize: 12, color: AMBER, display: "flex", alignItems: "center", gap: 3, fontWeight: 500 }}>
              View card <ArrowRight size={11} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Pill-shaped filter select ─── */
function FilterPill({
  label, value, onChange, options, color,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { id: string; label: string }[]; color: string;
}) {
  const active = !!value;
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none outline-none cursor-pointer"
        style={{
          background: active ? `${color}14` : `${color}07`,
          border: `1px solid ${active ? color + "55" : color + "30"}`,
          borderRadius: 999,
          padding: "8px 32px 8px 14px",
          color: active ? TEXT : MUTED,
          fontFamily: FT, fontSize: 13,
          fontWeight: active ? 600 : 400,
          transition: "all 0.18s",
          minWidth: 0,
        }}>
        <option value="">{label}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronDown size={12} style={{
        position: "absolute", right: 11, top: "50%",
        transform: "translateY(-50%)",
        color: active ? color : MUTED, pointerEvents: "none",
      }} />
    </div>
  );
}

/* ─── Active filter badge (removable) ─── */
function ActiveBadge({ label, color, onRemove }: { label: string; color: string; onRemove: () => void }) {
  return (
    <button onClick={onRemove}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 10px 4px 12px", borderRadius: 999,
        background: `${color}14`, border: `1px solid ${color}40`,
        color, fontFamily: FT, fontSize: 12, fontWeight: 600,
        cursor: "pointer",
      }}>
      {label}
      <X size={11} />
    </button>
  );
}

/* ─── Search content ─── */
function SearchContent() {
  const searchParams    = useSearchParams();
  const [query,         setQuery]         = useState(searchParams.get("q") ?? "");
  const [roleFilter,    setRoleFilter]    = useState(searchParams.get("role") ?? "");
  const [cityFilter,    setCityFilter]    = useState("");
  const [expFilter,     setExpFilter]     = useState("");
  const [availFilter,   setAvailFilter]   = useState("");
  const [profiles,      setProfiles]      = useState<Profile[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [total,         setTotal]         = useState(0);
  const [suggestions,   setSuggestions]   = useState<IndustryRole[]>([]);
  const [showSuggest,   setShowSuggest]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

      if (roleFilter)   q = q.eq("role", roleFilter);
      if (cityFilter)   q = q.eq("city", cityFilter);
      if (expFilter)    q = q.eq("experience_level", expFilter);
      if (availFilter)  q = q.eq("availability", availFilter);
      if (query.trim()) q = q.ilike("display_name", `%${query.trim()}%`);

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
  }, [query, roleFilter, cityFilter, expFilter, availFilter]);

  useEffect(() => {
    const t = setTimeout(fetchProfiles, 300);
    return () => clearTimeout(t);
  }, [fetchProfiles]);

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    setSuggestions(searchIndustryRoles(query, 6));
  }, [query]);

  const hasFilters = roleFilter || cityFilter || expFilter || availFilter;
  const clearAll   = () => { setRoleFilter(""); setCityFilter(""); setExpFilter(""); setAvailFilter(""); };

  const activeFilters = [
    roleFilter   && { key: "role"         as FilterKey, label: ROLES.find((r) => r.id === roleFilter)?.label ?? roleFilter,                         remove: () => setRoleFilter("") },
    cityFilter   && { key: "location"     as FilterKey, label: cityFilter,                                                                          remove: () => setCityFilter("") },
    expFilter    && { key: "experience"   as FilterKey, label: EXPERIENCE_LEVELS.find((e) => e.id === expFilter)?.label ?? expFilter,               remove: () => setExpFilter("") },
    availFilter  && { key: "availability" as FilterKey, label: AVAILABILITY.find((a) => a.id === availFilter)?.label ?? availFilter,                remove: () => setAvailFilter("") },
  ].filter(Boolean) as { key: FilterKey; label: string; remove: () => void }[];

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

          {/* Search pill — matches homepage style */}
          <div style={{ position: "relative" }}>
            <form onSubmit={(e) => { e.preventDefault(); setShowSuggest(false); }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(70,74,79,0.7)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 999,
                padding: "6px 7px 6px 20px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}>
                <Search size={16} style={{ color: MUTED, flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Role, name, city…"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
                  onFocus={() => setShowSuggest(true)}
                  onBlur={() => setTimeout(() => setShowSuggest(false), 160)}
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    color: TEXT, fontFamily: FT,
                    fontSize: "clamp(16px, 2vw, 16px)",
                    padding: "8px 4px", minWidth: 0,
                  }}
                />
                {query && (
                  <button type="button"
                    onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
                    style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: "0 6px", flexShrink: 0 }}>
                    <X size={14} />
                  </button>
                )}
                <button type="submit"
                  className="transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{
                    background: AMBER, color: "#000", border: "none", borderRadius: 999,
                    height: 38, padding: "0 clamp(18px, 3vw, 26px)",
                    fontFamily: FT, fontWeight: 700, fontSize: 14,
                    flexShrink: 0, cursor: "pointer",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.3) inset",
                  }}>
                  Find
                </button>
              </div>
            </form>

            {/* Role suggestion dropdown — matches homepage style */}
            {showSuggest && suggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                background: "#101010", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 18, overflow: "hidden", zIndex: 100,
                boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
              }}>
                <div style={{ padding: "10px 18px 5px" }}>
                  <span style={{ fontFamily: FT, fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase" }}>Roles</span>
                </div>
                {suggestions.map((r, i) => (
                  <button key={r.id} type="button"
                    onMouseDown={() => { setRoleFilter(r.id); setQuery(""); setSuggestions([]); setShowSuggest(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 18px",
                      background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                      borderBottom: i < suggestions.length - 1 ? `1px solid ${DIVIDER}` : "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#181818")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: "rgba(255,179,0,0.08)", border: "1px solid rgba(255,179,0,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 15 }}>🎬</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 14, color: TEXT }}>{r.label}</p>
                      <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 1 }}>{r.department}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter pills row */}
          <div className="no-scrollbar" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginTop: 10, paddingBottom: 2 }}>
            <div style={{ display: "flex", gap: 7, width: "max-content", alignItems: "center" }}>
              <SlidersHorizontal size={13} style={{ color: MUTED, flexShrink: 0 }} />
              <FilterPill label="Role"         value={roleFilter}  onChange={setRoleFilter}  options={ROLES.map((r) => ({ id: r.id, label: r.label }))}             color={FILTER_COLORS.role} />
              <FilterPill label="Location"     value={cityFilter}  onChange={setCityFilter}  options={PH_LOCATIONS.map((l) => ({ id: l, label: l }))}               color={FILTER_COLORS.location} />
              <FilterPill label="Experience"   value={expFilter}   onChange={setExpFilter}   options={EXPERIENCE_LEVELS.map((e) => ({ id: e.id, label: e.label }))} color={FILTER_COLORS.experience} />
              <FilterPill label="Availability" value={availFilter} onChange={setAvailFilter} options={AVAILABILITY.map((a) => ({ id: a.id, label: a.label }))}     color={FILTER_COLORS.availability} />
              {hasFilters && (
                <button onClick={clearAll}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "8px 14px", borderRadius: 999,
                    background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.25)",
                    color: "#FF453A", fontFamily: FT, fontSize: 13, cursor: "pointer", flexShrink: 0,
                  }}>
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Results area ── */}
      <div className="app-container" style={{ paddingTop: 24, paddingBottom: "clamp(40px,6vw,72px)" }}>

        {/* Status + active filter badges */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
          <p style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>
            {loading ? "Searching…" : `${total} crew member${total !== 1 ? "s" : ""}`}
          </p>

          {activeFilters.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {activeFilters.map((f) => (
                <ActiveBadge key={f.key} label={f.label} color={FILTER_COLORS[f.key]} onRemove={f.remove} />
              ))}
            </div>
          )}
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
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
            gap: 12,
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
