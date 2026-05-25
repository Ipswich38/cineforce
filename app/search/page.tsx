"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, EXPERIENCE_LEVELS, AVAILABILITY, PH_LOCATIONS } from "@/lib/constants";
import { Search, MapPin, X, ChevronDown, ArrowLeft, Clapperboard } from "lucide-react";
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

type Profile = {
  id: string; slug: string; display_name: string; avatar_url: string | null;
  role: string; specializations: string[]; experience_level: string;
  city: string; availability: string; rate_min: number | null; rate_max: number | null;
  rate_unit: string | null; bio: string | null;
};

const AVATAR_COLORS  = ["#0F1A2E", "#1A0F2E", "#2E0F0F", "#0F2E1A", "#1A2E0F", "#2E1A0F"];
const AVATAR_ACCENTS = ["#4A9EFF", "#AF52DE", "#FF453A", "#32D74B", "#A8D934", "#FF9F0A"];

function AvailDot({ status }: { status: string }) {
  const color = status === "available" ? "#32D74B" : status === "busy" ? "#FF9F0A" : "#78787F";
  return (
    <span style={{
      width: 7, height: 7, borderRadius: "50%", background: color,
      display: "inline-block", flexShrink: 0,
      boxShadow: status === "available" ? "0 0 0 2px rgba(50,215,75,0.2)" : "none",
    }} />
  );
}

function CrewCard({ p }: { p: Profile }) {
  const roleLabel  = ROLES.find((r) => r.id === p.role)?.label ?? p.role;
  const availLabel = AVAILABILITY.find((a) => a.id === p.availability)?.label ?? p.availability;
  const idx        = p.display_name.charCodeAt(0) % AVATAR_COLORS.length;
  const initials   = p.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Link href={`/crew/${p.slug}`}
      className="block rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,179,0,0.18)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = BORDER;
        e.currentTarget.style.transform = "translateY(0)";
      }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${AVATAR_ACCENTS[idx]}, transparent)` }} />
      <div style={{ padding: "clamp(16px,3vw,24px)", display: "flex", flexDirection: "column", gap: "clamp(12px,2vw,16px)" }}>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center rounded-xl text-[13px] font-bold select-none shrink-0"
            style={{ width: 44, height: 44, background: AVATAR_COLORS[idx], color: AVATAR_ACCENTS[idx], border: `1px solid ${AVATAR_ACCENTS[idx]}20` }}>
            {p.avatar_url
              ? <img src={p.avatar_url} alt={p.display_name} className="w-full h-full object-cover rounded-xl" />
              : initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT, letterSpacing: "-0.015em" }}>{p.display_name}</p>
              <div className="flex items-center gap-1.5 shrink-0">
                <AvailDot status={p.availability} />
                <span style={{ fontSize: 11, color: MUTED, fontFamily: FT }}>{availLabel}</span>
              </div>
            </div>
            <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 3 }}>{roleLabel}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1">
            <MapPin size={11} style={{ color: MUTED, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: MUTED, fontFamily: FT }}>{p.city}</span>
          </span>
          <span style={{ color: DIVIDER }}>·</span>
          <span style={{ fontSize: 12, color: MUTED, fontFamily: FT }}>
            {EXPERIENCE_LEVELS.find((e) => e.id === p.experience_level)?.label ?? p.experience_level}
          </span>
          {p.rate_min && (
            <>
              <span style={{ color: DIVIDER }}>·</span>
              <span style={{ fontSize: 12, color: MUTED, fontFamily: FT }}>
                ₱{p.rate_min.toLocaleString()}+/{p.rate_unit ?? "day"}
              </span>
            </>
          )}
        </div>

        {p.specializations?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {p.specializations.slice(0, 3).map((s) => (
              <span key={s} style={{
                fontSize: 11, fontFamily: FT, fontWeight: 500,
                background: `${AVATAR_ACCENTS[idx]}10`, color: AVATAR_ACCENTS[idx],
                padding: "2px 9px", borderRadius: 20,
                border: `1px solid ${AVATAR_ACCENTS[idx]}18`,
              }}>{s}</span>
            ))}
          </div>
        )}

        {p.bio && (
          <p className="line-clamp-2" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: FT, lineHeight: 1.5 }}>
            {p.bio}
          </p>
        )}
      </div>
    </Link>
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
  const [profiles,    setProfiles]    = useState<Profile[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [isDemo,      setIsDemo]      = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setIsDemo(false);
    try {
      const supabase = createClient();
      let q = supabase
        .from("profiles")
        .select(
          "id,slug,display_name,avatar_url,role,specializations,experience_level,city,availability,rate_min,rate_max,rate_unit,bio",
          { count: "exact" },
        )
        .order("created_at", { ascending: false });

      if (roleFilter)   q = q.eq("role", roleFilter);
      if (cityFilter)   q = q.eq("city", cityFilter);
      if (expFilter)    q = q.eq("experience_level", expFilter);
      if (availFilter)  q = q.eq("availability", availFilter);
      if (query.trim()) q = q.ilike("display_name", `%${query.trim()}%`);

      const { data, count } = await q;
      const list = data ?? [];
      if (list.length > 0) {
        setProfiles(list);
        setTotal(count ?? list.length);
      } else {
        // Fall back to sample profiles when no real data
        const filtered = SAMPLE_PROFILES.filter((p) => {
          if (roleFilter  && p.role             !== roleFilter)  return false;
          if (cityFilter  && p.city             !== cityFilter)  return false;
          if (expFilter   && p.experience_level !== expFilter)   return false;
          if (availFilter && p.availability     !== availFilter) return false;
          if (query.trim() && !p.display_name.toLowerCase().includes(query.trim().toLowerCase())) return false;
          return true;
        });
        setProfiles(filtered as unknown as Profile[]);
        setTotal(filtered.length);
        setIsDemo(true);
      }
    } catch {
      // Supabase not configured — show sample profiles
      const filtered = SAMPLE_PROFILES.filter((p) => {
        if (roleFilter  && p.role             !== roleFilter)  return false;
        if (cityFilter  && p.city             !== cityFilter)  return false;
        if (expFilter   && p.experience_level !== expFilter)   return false;
        if (availFilter && p.availability     !== availFilter) return false;
        if (query.trim() && !p.display_name.toLowerCase().includes(query.trim().toLowerCase())) return false;
        return true;
      });
      setProfiles(filtered as unknown as Profile[]);
      setTotal(filtered.length);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, [query, roleFilter, cityFilter, expFilter, availFilter]);

  useEffect(() => {
    const t = setTimeout(fetchProfiles, 300);
    return () => clearTimeout(t);
  }, [fetchProfiles]);

  const hasFilters = roleFilter || cityFilter || expFilter || availFilter;
  const clearAll   = () => { setRoleFilter(""); setCityFilter(""); setExpFilter(""); setAvailFilter(""); };

  const containerPad = "0 clamp(16px, 5vw, 64px)";

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      {/* Sticky header */}
      <div style={{
        background: "rgba(17,17,21,0.95)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${BORDER}`,
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: containerPad }}>
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
                  SetReady
                </span>
              </div>
            </div>

            {/* Search input */}
            <div className="relative mb-3">
              <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: MUTED, pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Search crew by name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full outline-none"
                style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 14,
                  paddingLeft: 42, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
                  fontSize: 15, color: TEXT, fontFamily: FT,
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(255,179,0,0.35)")}
                onBlur={(e)  => (e.target.style.borderColor = BORDER)}
              />
              {query && (
                <button onClick={() => setQuery("")}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, color: MUTED }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter row — horizontally scrollable on mobile */}
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 2 }}>
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
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: containerPad, paddingTop: "clamp(24px,5vw,40px)" as string, paddingBottom: "clamp(40px,8vw,80px)" as string }}>

        {/* Status line */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "clamp(14px,3vw,22px)", flexWrap: "wrap" }}>
          <p style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>
            {loading
              ? "Searching…"
              : `${total} crew member${total !== 1 ? "s" : ""} found`}
          </p>
          {!loading && isDemo && (
            <span style={{
              fontFamily: FT, fontSize: 11, fontWeight: 600,
              background: "rgba(255,179,0,0.08)", color: AMBER,
              border: "1px solid rgba(255,179,0,0.2)",
              padding: "3px 10px", borderRadius: 20,
              letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
              Sample profiles
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%,280px), 1fr))", gap: "clamp(12px,2vw,20px)" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ background: SURFACE, height: 200, border: `1px solid ${BORDER}` }} />
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

        {/* Results grid */}
        {!loading && profiles.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%,280px), 1fr))", gap: "clamp(12px,2vw,20px)" }}>
            {profiles.map((p) => <CrewCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0C0C0F", minHeight: "100vh" }} />}>
      <SearchContent />
    </Suspense>
  );
}
