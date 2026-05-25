"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, EXPERIENCE_LEVELS, AVAILABILITY, PH_LOCATIONS } from "@/lib/constants";
import { Search, MapPin, SlidersHorizontal, X, ChevronDown, ArrowLeft } from "lucide-react";

const FONT_DISPLAY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FONT_TEXT    = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

type Profile = {
  id: string;
  slug: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  specializations: string[];
  experience_level: string;
  city: string;
  availability: string;
  rate_min: number | null;
  rate_max: number | null;
  rate_unit: string | null;
  bio: string | null;
};

function AvailabilityDot({ status }: { status: string }) {
  const color = status === "available" ? "#34C759" : status === "busy" ? "#FF9500" : "#AEAEB2";
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: color, flexShrink: 0,
      boxShadow: status === "available" ? "0 0 0 2px rgba(52,199,89,0.2)" : "none",
    }} />
  );
}

function CrewCard({ profile }: { profile: Profile }) {
  const roleLabel = ROLES.find((r) => r.id === profile.role)?.label ?? profile.role;
  const availLabel = AVAILABILITY.find((a) => a.id === profile.availability)?.label ?? profile.availability;
  const initials = profile.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const AVATAR_COLORS = ["#5B8EF5", "#F5775B", "#34C759", "#AF52DE", "#FF9500", "#5AC8FA"];
  const avatarColor = AVATAR_COLORS[profile.display_name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <Link href={`/crew/${profile.slug}`}
      className="block rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center rounded-xl text-white text-[13px] font-bold select-none shrink-0"
          style={{ width: 44, height: 44, background: avatarColor, letterSpacing: "-0.01em" }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover rounded-xl" />
            : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: "#1C1C1E", letterSpacing: "-0.015em" }}>
              {profile.display_name}
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <AvailabilityDot status={profile.availability} />
              <span style={{ fontSize: 11, color: "#6D6D72", fontFamily: FONT_TEXT }}>{availLabel}</span>
            </div>
          </div>
          <p style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "#6D6D72", marginTop: 2 }}>{roleLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-3">
        <MapPin size={11} style={{ color: "#AEAEB2", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#AEAEB2", fontFamily: FONT_TEXT }}>{profile.city}</span>
        <span style={{ color: "rgba(0,0,0,0.15)", margin: "0 5px", fontSize: 12 }}>·</span>
        <span style={{ fontSize: 12, color: "#AEAEB2", fontFamily: FONT_TEXT }}>
          {EXPERIENCE_LEVELS.find((e) => e.id === profile.experience_level)?.label ?? profile.experience_level}
        </span>
        {profile.rate_min && (
          <>
            <span style={{ color: "rgba(0,0,0,0.15)", margin: "0 5px", fontSize: 12 }}>·</span>
            <span style={{ fontSize: 12, color: "#AEAEB2", fontFamily: FONT_TEXT }}>
              ₱{profile.rate_min.toLocaleString()}+/{profile.rate_unit === "day" ? "day" : profile.rate_unit}
            </span>
          </>
        )}
      </div>

      {profile.specializations?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile.specializations.slice(0, 3).map((s) => (
            <span key={s} style={{
              fontSize: 11, fontFamily: FONT_TEXT, fontWeight: 500,
              background: "rgba(0,122,255,0.07)", color: "#007AFF",
              padding: "2px 8px", borderRadius: 20,
            }}>{s}</span>
          ))}
        </div>
      )}

      {profile.bio && (
        <p className="mt-3 line-clamp-2" style={{ fontSize: 13, color: "#AEAEB2", fontFamily: FONT_TEXT, lineHeight: 1.5 }}>
          {profile.bio}
        </p>
      )}
    </Link>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full rounded-xl px-4 py-2.5 pr-9 text-[14px] transition-all"
        style={{
          background: "#fff", border: "1px solid rgba(0,0,0,0.10)",
          color: value ? "#1C1C1E" : "#AEAEB2", fontFamily: FONT_TEXT,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#AEAEB2", pointerEvents: "none" }} />
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [query,       setQuery]       = useState("");
  const [roleFilter,  setRoleFilter]  = useState(searchParams.get("role") ?? "");
  const [cityFilter,  setCityFilter]  = useState("");
  const [expFilter,   setExpFilter]   = useState("");
  const [availFilter, setAvailFilter] = useState("");
  const [profiles,    setProfiles]    = useState<Profile[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let q = supabase
      .from("profiles")
      .select("id, slug, display_name, avatar_url, role, specializations, experience_level, city, availability, rate_min, rate_max, rate_unit, bio")
      .order("created_at", { ascending: false });

    if (roleFilter)  q = q.eq("role", roleFilter);
    if (cityFilter)  q = q.eq("city", cityFilter);
    if (expFilter)   q = q.eq("experience_level", expFilter);
    if (availFilter) q = q.eq("availability", availFilter);
    if (query)       q = q.ilike("display_name", `%${query}%`);

    const { data, error, count } = await q;
    if (!error && data) { setProfiles(data); setTotal(count ?? data.length); }
    setLoading(false);
  }, [query, roleFilter, cityFilter, expFilter, availFilter]);

  useEffect(() => {
    const t = setTimeout(fetchProfiles, 300);
    return () => clearTimeout(t);
  }, [fetchProfiles]);

  const hasFilters = roleFilter || cityFilter || expFilter || availFilter;

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        <div className="max-w-[1080px] mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#6D6D72" }}>
            <ArrowLeft size={15} />
          </Link>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, color: "#1C1C1E", letterSpacing: "-0.02em" }}>
            SetReady
          </span>
        </div>

        {/* Search + filters */}
        <div className="max-w-[1080px] mx-auto px-6 pb-5">
          <div className="relative mb-3">
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#AEAEB2" }} />
            <input
              type="text"
              placeholder="Search crew by name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl pl-10 pr-4 py-3 text-[15px] outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
              style={{
                background: "#F5F5F7", border: "1px solid rgba(0,0,0,0.08)",
                color: "#1C1C1E", fontFamily: FONT_TEXT,
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterSelect label="All roles" value={roleFilter} onChange={setRoleFilter}
              options={ROLES.map((r) => ({ id: r.id, label: r.label }))} />
            <FilterSelect label="All locations" value={cityFilter} onChange={setCityFilter}
              options={PH_LOCATIONS.map((l) => ({ id: l, label: l }))} />
            <FilterSelect label="Experience" value={expFilter} onChange={setExpFilter}
              options={EXPERIENCE_LEVELS.map((e) => ({ id: e.id, label: e.label }))} />
            <FilterSelect label="Availability" value={availFilter} onChange={setAvailFilter}
              options={AVAILABILITY.map((a) => ({ id: a.id, label: a.label }))} />
            {hasFilters && (
              <button
                onClick={() => { setRoleFilter(""); setCityFilter(""); setExpFilter(""); setAvailFilter(""); }}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] transition-colors hover:bg-red-50"
                style={{ background: "#fff", border: "1px solid rgba(255,59,48,0.2)", color: "#FF3B30", fontFamily: FONT_TEXT }}>
                <X size={13} /> Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-[1080px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <p style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#6D6D72" }}>
            {loading ? "Searching…" : `${total} crew member${total !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse"
                style={{ background: "#fff", height: 160, border: "1px solid rgba(0,0,0,0.06)" }} />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-24">
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, color: "#1C1C1E", marginBottom: 8 }}>
              No crew found
            </p>
            <p style={{ fontFamily: FONT_TEXT, fontSize: 15, color: "#AEAEB2" }}>
              Try adjusting your filters or search term.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => <CrewCard key={p.id} profile={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ background: "#F5F5F7", minHeight: "100vh" }} />}>
      <SearchContent />
    </Suspense>
  );
}
