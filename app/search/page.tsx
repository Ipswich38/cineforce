"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, EXPERIENCE_LEVELS, AVAILABILITY, PH_LOCATIONS } from "@/lib/constants";
import { Search, MapPin, X, ChevronDown, ArrowLeft, Clapperboard } from "lucide-react";
import { searchIndustryRoles, type IndustryRole } from "@/lib/industryRoles";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#000000";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const TEAL    = "#2CC0C8";
const BORDER  = "rgba(255,255,255,0.07)";
const DIVIDER = "rgba(255,255,255,0.05)";

type Profile = {
  id: string; slug: string; display_name: string; avatar_url: string | null;
  role: string; specializations: string[]; experience_level: string;
  city: string; availability: string; rate_min: number | null; rate_max: number | null;
  rate_unit: string | null; bio: string | null;
};

const AVATAR_COLORS  = ["#0F1A2E", "#1A0F2E", "#2E0F0F", "#0F2E1A", "#1A2E0F", "#2E1A0F"];
const AVATAR_ACCENTS = ["#4A9EFF", "#AF52DE", "#FF453A", "#32D74B", "#A8D934", "#FF9F0A"];

function AvailDot({ status }: { status: string }) {
  const color = status === "available" ? "#32D74B" : status === "busy" ? "#FF9F0A" : "#8E8E93";
  return (
    <span style={{
      width: 7, height: 7, borderRadius: "50%", background: color,
      display: "inline-block", flexShrink: 0,
      boxShadow: status === "available" ? "0 0 0 2px rgba(50,215,75,0.2)" : "none",
    }} />
  );
}

function CrewCard({ p }: { p: Profile }) {
  const roleLabel = ROLES.find((r) => r.id === p.role)?.label ?? p.role;
  const idx       = p.display_name.charCodeAt(0) % AVATAR_COLORS.length;
  const initials  = p.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const firstName = p.display_name.split(" ")[0];

  return (
    <div className="app-surface overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
      {/* Top: avatar + info + selector */}
      <div className="flex items-center gap-3" style={{ padding: "16px 16px 14px" }}>
        <div className="shrink-0 flex items-center justify-center text-[15px] font-bold select-none"
          style={{ width: 52, height: 52, borderRadius: "50%", background: AVATAR_COLORS[idx], color: AVATAR_ACCENTS[idx] }}>
          {p.avatar_url
            ? <img src={p.avatar_url} alt={p.display_name} className="w-full h-full object-cover" style={{ borderRadius: "50%" }} />
            : initials}
        </div>

        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT, lineHeight: 1.3 }}>{p.display_name}</p>
          <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 2 }}>{roleLabel}</p>
          {p.specializations?.length > 0 && (
            <p className="truncate" style={{ fontFamily: FT, fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
              {p.specializations.slice(0, 3).join(", ")}
            </p>
          )}
        </div>

        <div className="shrink-0" style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${BORDER}` }} />
      </div>

      {/* Action buttons */}
      <div className="flex" style={{ borderTop: `1px solid ${BORDER}` }}>
        <Link href={`/crew/${p.slug}`}
          className="flex-1 text-center transition-colors hover:bg-white/5"
          style={{ padding: "11px 8px", fontFamily: FT, fontSize: 13, fontWeight: 500, color: TEAL, borderRight: `1px solid ${BORDER}` }}>
          View Full Profile
        </Link>
        <button
          className="flex-1 transition-colors hover:bg-white/5"
          style={{ padding: "11px 8px", fontFamily: FT, fontSize: 13, fontWeight: 500, color: TEAL, background: "transparent", border: "none" }}>
          Message {firstName}
        </button>
      </div>
    </div>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: { id: string; label: string }[];
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl px-4 py-2.5 pr-9 text-[13px] transition-all outline-none"
        style={{
          background: SURFACE,
          border: `1px solid ${value ? "rgba(255,179,0,0.3)" : BORDER}`,
          color: value ? TEXT : MUTED,
          fontFamily: FT,
          minWidth: 120,
        }}>
        <option value="">{label}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: MUTED, pointerEvents: "none" }} />
    </div>
  );
}

function SearchContent() {
  const searchParams  = useSearchParams();
  const [query,       setQuery]       = useState(searchParams.get("q") ?? "");
  const [roleFilter,  setRoleFilter]  = useState(searchParams.get("role") ?? "");
  const [cityFilter,  setCityFilter]  = useState("");
  const [expFilter,   setExpFilter]   = useState("");
  const [availFilter, setAvailFilter] = useState("");
  const [profiles,        setProfiles]        = useState<Profile[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [total,           setTotal]           = useState(0);
  const [suggestions,     setSuggestions]     = useState<IndustryRole[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  return (
    <div className="mobile-nav-pad" style={{ background: BG, minHeight: "100dvh" }}>
      {/* Sticky header */}
      <div style={{
        background: "rgba(17,17,21,0.95)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${BORDER}`,
        position: "sticky", top: 0, zIndex: 40,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div className="app-container">
          <div style={{ paddingTop: 14, paddingBottom: 14 }}>
            {/* Top nav row */}
            <div className="flex items-center gap-3 mb-4">
              <Link href="/"
                className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                style={{ fontFamily: FT, fontSize: 14, color: MUTED, minWidth: 32 }}>
                <ArrowLeft size={16} />
              </Link>
              <div className="flex items-center gap-2">
                <Clapperboard size={15} style={{ color: AMBER }} strokeWidth={2} />
                <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT, letterSpacing: "-0.02em" }}>
                  YourNextCrew
                </span>
              </div>
            </div>

            {/* Search input */}
            <div className="relative mb-3">
              <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: MUTED, pointerEvents: "none", zIndex: 1 }} />
              <input
                type="text"
                placeholder="Role, name, city"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                className="w-full outline-none"
                style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  paddingLeft: 42, paddingRight: 40, paddingTop: 12, paddingBottom: 12,
                  fontSize: 16, color: TEXT, fontFamily: FT,
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(255,179,0,0.35)"; setShowSuggestions(true); }}
                onBlur={(e)  => { e.target.style.borderColor = BORDER; setTimeout(() => setShowSuggestions(false), 160); }}
              />
              {query && (
                <button onClick={() => { setQuery(""); setSuggestions([]); }}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, color: MUTED }}>
                  <X size={14} />
                </button>
              )}
              {/* Role suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                  background: "#101010", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 14, overflow: "hidden", zIndex: 50,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                }}>
                  <div style={{ padding: "8px 16px 4px" }}>
                    <span style={{ fontFamily: FT, fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase" }}>Roles</span>
                  </div>
                  {suggestions.map((r, i) => (
                    <button key={r.id} type="button"
                      onMouseDown={() => { setRoleFilter(r.id); setQuery(""); setSuggestions([]); setShowSuggestions(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                        background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                        borderBottom: i < suggestions.length - 1 ? `1px solid ${DIVIDER}` : "none",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#181818")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "rgba(255,179,0,0.08)", border: "1px solid rgba(255,179,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 14 }}>🎬</span>
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

            {/* Filter row — horizontally scrollable on mobile */}
            <div className="no-scrollbar" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 2 }}>
              <div style={{ display: "flex", gap: 8, width: "max-content" }}>
                <FilterSelect label="All roles"     value={roleFilter}  onChange={setRoleFilter}  options={ROLES.map((r) => ({ id: r.id, label: r.label }))} />
                <FilterSelect label="All locations" value={cityFilter}  onChange={setCityFilter}  options={PH_LOCATIONS.map((l) => ({ id: l, label: l }))} />
                <FilterSelect label="Experience"    value={expFilter}   onChange={setExpFilter}   options={EXPERIENCE_LEVELS.map((e) => ({ id: e.id, label: e.label }))} />
                <FilterSelect label="Availability"  value={availFilter} onChange={setAvailFilter} options={AVAILABILITY.map((a) => ({ id: a.id, label: a.label }))} />
                {hasFilters && (
                  <button onClick={clearAll}
                    className="flex items-center gap-1.5 shrink-0 rounded-xl px-4 py-2.5 text-[13px] transition-colors"
                    style={{ background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)", color: "#FF453A", fontFamily: FT }}>
                    <X size={13} /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results area */}
      <div className="app-container app-page-pad">

        {/* Status line */}
        <div style={{ marginBottom: "clamp(14px,3vw,22px)" }}>
          <p style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>
            {loading ? "Searching…" : `${total} crew`}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="app-surface animate-pulse" style={{ background: SURFACE, height: 110, border: `1px solid ${BORDER}` }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && profiles.length === 0 && (
          <div className="text-center" style={{ paddingTop: "clamp(60px,12vw,120px)", paddingBottom: "clamp(60px,12vw,120px)" }}>
            <p style={{ fontFamily: FD, fontSize: "clamp(18px,3vw,22px)", fontWeight: 600, color: TEXT, marginBottom: 8 }}>
              No crew found
            </p>
            <p style={{ fontFamily: FT, fontSize: 15, color: MUTED }}>
              Try adjusting your filters or search term.
            </p>
          </div>
        )}

        {/* Results list */}
        {!loading && profiles.length > 0 && (
          <div className="flex flex-col gap-3">
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
