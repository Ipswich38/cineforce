"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Camera, Upload, FileText, Shield, Pause, Play,
  AlertTriangle, ChevronLeft, ChevronRight, Check, Pencil, X,
  Briefcase, DollarSign,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ROLES, AVAILABILITY, EXPERIENCE_LEVELS, PH_REGIONS, RATE_UNITS } from "@/lib/constants";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';
const BG = "#000"; const TEXT = "#F7F7F2"; const MUTED = "#8E8E93";
const AMBER = "#FFCC00"; const BORDER = "rgba(255,255,255,0.07)"; const SURFACE = "#101010";

const DEACTIVATE_REASONS = [
  "I found work through other means",
  "Too many irrelevant requests",
  "Privacy concerns",
  "Taking a long break from the industry",
  "I prefer another platform",
  "Other",
];

type ProfileData = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_paused: boolean;
  account_type: string;
  is_crew: boolean | null;
  is_hirer: boolean | null;
  role: string | null;
  city: string | null;
  bio: string | null;
  experience_level: string | null;
  rate_min: number | null;
  rate_max: number | null;
  rate_unit: string | null;
  availability: string | null;
  slug: string | null;
  specializations: string[] | null;
};

type Booking = { id: string; project_title: string; created_at: string };

// ─── Shared input styles ────────────────────────────────────────────────────
const inp = (focused = false): React.CSSProperties => ({
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: `1px solid ${focused ? "rgba(255,204,0,0.3)" : BORDER}`,
  background: "#080808", color: TEXT, fontFamily: FT, fontSize: 15,
  outline: "none", boxSizing: "border-box",
});

// ─── Tag pill input ─────────────────────────────────────────────────────────
function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [draft, setDraft] = useState("");
  function add() {
    const t = draft.trim();
    if (!t || tags.includes(t)) { setDraft(""); return; }
    onChange([...tags, t]);
    setDraft("");
  }
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {tags.map((tag) => (
          <span key={tag} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 20, fontFamily: FT, fontSize: 12, color: AMBER,
            background: "rgba(255,204,0,0.08)", border: "1px solid rgba(255,204,0,0.2)",
          }}>
            {tag}
            <button onClick={() => onChange(tags.filter((t) => t !== tag))}
              style={{ background: "none", border: "none", color: "rgba(255,204,0,0.6)", cursor: "pointer", padding: 0, display: "flex" }}>
              <X size={10} />
            </button>
          </span>
        ))}
        {tags.length === 0 && (
          <span style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>No specializations yet</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="e.g. Aerial DP, Color Science…"
          style={{ ...inp(), flex: 1 }}
        />
        <button onClick={add}
          style={{ padding: "0 16px", borderRadius: 10, border: "none", background: AMBER, color: "#000", fontFamily: FT, fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
          Add
        </button>
      </div>
    </div>
  );
}

// ─── Editable row ───────────────────────────────────────────────────────────
function EditRow({
  label, preview, onSave, children,
}: {
  label: string;
  preview: React.ReactNode;
  onSave: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [open,   setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
        <div>
          <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginBottom: 3 }}>{label}</p>
          {!open && <div style={{ fontFamily: FT, fontSize: 15, color: TEXT }}>{preview}</div>}
        </div>
        {!open && (
          <button onClick={() => setOpen(true)}
            style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", color: TEXT, fontFamily: FT, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <Pencil size={12} /> Edit
          </button>
        )}
      </div>
      {open && (
        <div style={{ padding: "0 18px 18px" }}>
          {children}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => setOpen(false)}
              style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, fontFamily: FT, fontSize: 14, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={async () => { setSaving(true); await onSave(); setSaving(false); setOpen(false); }}
              disabled={saving}
              style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: saving ? "rgba(255,204,0,0.5)" : AMBER, color: "#000", fontFamily: FT, fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Availability calendar ──────────────────────────────────────────────────
function AvailCalendar({ userId }: { userId: string }) {
  const [month,   setMonth]   = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [busy,    setBusy]    = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch(`/api/availability?crewId=${userId}`);
    const json = await res.json() as { busyDates: string[] };
    setBusy(new Set(json.busyDates));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const t = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function toggle(dateStr: string) {
    if (toggling) return;
    setToggling(dateStr);
    const wasBusy = busy.has(dateStr);
    const next = new Set(busy);
    wasBusy ? next.delete(dateStr) : next.add(dateStr);
    setBusy(next);
    await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr, action: wasBusy ? "mark_available" : "mark_busy" }),
    });
    setToggling(null);
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const y = month.getFullYear(), m = month.getMonth();
  const dow = new Date(y, m, 1).getDay();
  const offset = dow === 0 ? 6 : dow - 1;
  const dim = new Date(y, m + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + dim) / 7) * 7 }, (_, i) => {
    const d = i - offset + 1;
    return d >= 1 && d <= dim ? d : null;
  });
  const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const monthLabel = month.toLocaleDateString("en-PH", { month: "long", year: "numeric" });

  const navBtn: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`,
    background: "transparent", color: TEXT, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button style={navBtn} onClick={() => setMonth(new Date(y, m - 1, 1))}><ChevronLeft size={16} /></button>
        <span style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT }}>{monthLabel}</span>
        <button style={navBtn} onClick={() => setMonth(new Date(y, m + 1, 1))}><ChevronRight size={16} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 3 }}>
        {DAYS.map((d) => (
          <div key={d} style={{ textAlign: "center", fontFamily: FT, fontSize: 10, color: MUTED, paddingBottom: 4, fontWeight: 600, letterSpacing: "0.04em" }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isPast  = ds < todayStr;
          const isToday = ds === todayStr;
          const isBusy  = busy.has(ds);
          const isTgl   = toggling === ds;
          return (
            <button key={i}
              onClick={() => !isPast && !loading && toggle(ds)}
              style={{
                minHeight: 38, borderRadius: 8, fontFamily: FT, fontSize: 13,
                fontWeight: (isToday || isBusy) ? 600 : 400,
                border: isToday ? "1px solid rgba(255,204,0,0.4)" : "1px solid transparent",
                background: isBusy
                  ? "rgba(255,69,58,0.18)"
                  : isToday
                    ? "rgba(255,204,0,0.07)"
                    : "rgba(255,255,255,0.03)",
                color: isPast
                  ? "rgba(255,255,255,0.15)"
                  : isBusy ? "#FF6B6B"
                  : isToday ? AMBER
                  : TEXT,
                cursor: isPast || loading ? "default" : "pointer",
                opacity: isTgl ? 0.5 : 1,
                transition: "all 0.12s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              {day}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 14, padding: "0 2px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: FT, fontSize: 11, color: MUTED }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, flexShrink: 0 }} />
          Available
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: FT, fontSize: 11, color: MUTED }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(255,69,58,0.18)", flexShrink: 0 }} />
          Busy — tap to toggle
        </span>
      </div>
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────────────
function Card({ title, children, last }: { title?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 48 : 28 }}>
      {title && (
        <p style={{ fontFamily: FT, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 10 }}>
          {title}
        </p>
      )}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function SettingsClient({
  userId,
  profile: initialProfile,
  bookings,
}: {
  userId: string;
  profile: ProfileData | null;
  bookings: Booking[];
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef  = useRef<HTMLInputElement>(null);

  const [profile,      setProfile]      = useState<ProfileData | null>(initialProfile);
  const [avatarUrl,    setAvatarUrl]    = useState(initialProfile?.avatar_url ?? null);
  const [uploading,    setUploading]    = useState(false);
  const [uploadMsg,    setUploadMsg]    = useState("");
  const [paused,       setPaused]       = useState(initialProfile?.is_paused ?? false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [activeTab,    setActiveTab]    = useState<"profile" | "availability" | "account">("profile");
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [reason,       setReason]       = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateErr, setDeactivateErr] = useState("");

  // Draft states for editable fields
  const [draftName,    setDraftName]    = useState(initialProfile?.display_name ?? "");
  const [draftBio,     setDraftBio]     = useState(initialProfile?.bio ?? "");
  const [draftCity,    setDraftCity]    = useState(initialProfile?.city ?? "");
  const [draftRole,    setDraftRole]    = useState(initialProfile?.role ?? "");
  const [draftExp,     setDraftExp]     = useState(initialProfile?.experience_level ?? "");
  const [draftRateMin, setDraftRateMin] = useState(String(initialProfile?.rate_min ?? ""));
  const [draftRateMax, setDraftRateMax] = useState(String(initialProfile?.rate_max ?? ""));
  const [draftUnit,    setDraftUnit]    = useState(initialProfile?.rate_unit ?? "day");
  const [draftSpecs,   setDraftSpecs]   = useState<string[]>(initialProfile?.specializations ?? []);

  const isCrew  = (profile?.is_crew  ?? profile?.account_type === "crew");
  const isHirer = (profile?.is_hirer ?? profile?.account_type === "client");
  const tabs   = isCrew
    ? [{ id: "profile" as const, label: "Profile" }, { id: "availability" as const, label: "Availability" }, { id: "account" as const, label: "Account" }]
    : [{ id: "profile" as const, label: "Profile" }, { id: "account" as const, label: "Account" }];

  const roleData   = ROLES.find((r) => r.id === profile?.role);
  const availData  = AVAILABILITY.find((a) => a.id === profile?.availability);
  const expData    = EXPERIENCE_LEVELS.find((e) => e.id === profile?.experience_level);
  const unitData   = RATE_UNITS.find((u) => u.id === profile?.rate_unit);
  const displayName = profile?.display_name ?? "";
  const initials    = displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  async function patchField(updates: Record<string, unknown>) {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setProfile((p) => p ? { ...p, ...updates } : p);
  }

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true); setUploadMsg("");
    const supabase = createClient();
    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setUploadMsg("Upload failed."); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    setAvatarUrl(url);
    setUploadMsg("Photo updated.");
    setUploading(false);
  }

  async function togglePause() {
    setPauseLoading(true);
    const res = await fetch("/api/account/pause", { method: "POST" });
    if (res.ok) { const { is_paused } = await res.json() as { is_paused: boolean }; setPaused(is_paused); }
    setPauseLoading(false);
  }

  async function handleDeactivate() {
    if (confirm !== "DELETE") { setDeactivateErr("Type DELETE to confirm."); return; }
    if (!reason) { setDeactivateErr("Please select a reason."); return; }
    setDeactivating(true); setDeactivateErr("");
    const res = await fetch("/api/account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) });
    if (res.ok) { window.location.href = "/?deactivated=1"; }
    else {
      const body = await res.json() as { error?: string };
      setDeactivateErr(body.error ?? "Something went wrong.");
      setDeactivating(false);
    }
  }

  async function changeAvailabilityStatus(id: string) {
    await patchField({ availability: id });
  }

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "14px 18px", border: "none", background: "transparent",
    color: active ? TEXT : MUTED, fontFamily: FT, fontSize: 14,
    fontWeight: active ? 600 : 400, cursor: "pointer", flexShrink: 0,
    borderBottom: active ? `2px solid ${AMBER}` : "2px solid transparent",
    transition: "all 0.15s",
  });

  return (
    <div style={{ background: BG, minHeight: "100dvh" }}>
      {/* Sticky top nav */}
      <div style={{
        background: "rgba(10,10,13,0.96)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 50,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div className="app-container-narrow" style={{ height: 56, display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard" style={{ color: MUTED, display: "flex", alignItems: "center", flexShrink: 0 }}>
            <ArrowLeft size={18} />
          </Link>
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT }}>Account</span>
        </div>
      </div>

      {/* ── Profile Header (Airbnb-style) ── */}
      <div style={{
        background: "linear-gradient(180deg, rgba(255,204,0,0.05) 0%, transparent 100%)",
        borderBottom: `1px solid ${BORDER}`, padding: "28px 0 0",
      }}>
        <div className="app-container-narrow" style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 24 }}>
          {/* Avatar with camera overlay */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(255,204,0,0.12)", border: "2px solid rgba(255,204,0,0.22)",
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontFamily: FD, fontSize: 28, fontWeight: 700, color: AMBER }}>{initials}</span>
              }
            </div>
            <button onClick={() => galleryRef.current?.click()}
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: "50%",
                background: AMBER, border: "2px solid #000",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}>
              <Camera size={12} style={{ color: "#000" }} />
            </button>
          </div>

          {/* Name / Role / Availability */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 20, color: TEXT, letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName || "Your Name"}
            </p>
            {roleData && (
              <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 2 }}>
                {roleData.icon} {roleData.label}{profile?.city ? ` · ${profile.city}` : ""}
              </p>
            )}
            {availData && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: availData.color }} />
                <span style={{ fontFamily: FT, fontSize: 12, color: availData.color }}>{availData.label}</span>
              </div>
            )}
            {(uploading || uploadMsg) && (
              <p style={{ fontFamily: FT, fontSize: 12, color: uploading ? AMBER : "#32D74B", marginTop: 5 }}>
                {uploading ? "Uploading…" : uploadMsg}
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderTop: `1px solid ${BORDER}` }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)} style={tabBtnStyle(activeTab === t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="app-container-narrow app-page-pad">

        {/* ════════════ PROFILE TAB ════════════ */}
        {activeTab === "profile" && (
          <>
            {/* Photo */}
            <Card title="Photo">
              <div onClick={() => galleryRef.current?.click()}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", cursor: "pointer", borderBottom: `1px solid ${BORDER}` }}>
                <Upload size={17} style={{ color: MUTED }} />
                <p style={{ fontFamily: FT, fontSize: 14, color: TEXT }}>Choose from library</p>
              </div>
              <div onClick={() => cameraRef.current?.click()}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", cursor: "pointer" }}>
                <Camera size={17} style={{ color: MUTED }} />
                <p style={{ fontFamily: FT, fontSize: 14, color: TEXT }}>Take a photo</p>
              </div>
            </Card>

            {/* About You */}
            <Card title="About You">
              <EditRow
                label="Display Name"
                preview={<span>{profile?.display_name || <span style={{ color: MUTED }}>Not set</span>}</span>}
                onSave={async () => { await patchField({ display_name: draftName }); }}>
                <input style={inp()} value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="Your full name" />
              </EditRow>

              <EditRow
                label="Bio"
                preview={
                  <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                    {profile?.bio || <span style={{ color: MUTED }}>Tell clients about yourself</span>}
                  </span>
                }
                onSave={async () => { await patchField({ bio: draftBio }); }}>
                <textarea value={draftBio} onChange={(e) => setDraftBio(e.target.value)}
                  placeholder="Your background, style, and what makes you great…"
                  rows={4}
                  style={{ ...inp(), resize: "none", lineHeight: 1.6 }}
                />
              </EditRow>

              <EditRow
                label="City"
                preview={<span>{profile?.city || <span style={{ color: MUTED }}>Not set</span>}</span>}
                onSave={async () => { await patchField({ city: draftCity }); }}>
                <select value={draftCity} onChange={(e) => setDraftCity(e.target.value)} style={inp()}>
                  <option value="">Select city</option>
                  {PH_REGIONS.map((region) => (
                    <optgroup key={region.id} label={region.label}>
                      {region.cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </optgroup>
                  ))}
                </select>
              </EditRow>
            </Card>

            {/* Professional (crew only) */}
            {isCrew && (
              <>
                <Card title="Professional">
                  <EditRow
                    label="Role"
                    preview={
                      <span>
                        {roleData ? `${roleData.icon} ${roleData.label}` : <span style={{ color: MUTED }}>Not set</span>}
                      </span>
                    }
                    onSave={async () => { await patchField({ role: draftRole }); }}>
                    <div>
                      {Array.from(new Set(ROLES.map((r) => r.dept))).map((dept) => (
                        <div key={dept} style={{ marginBottom: 10 }}>
                          <p style={{ fontFamily: FT, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{dept}</p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                            {ROLES.filter((r) => r.dept === dept).map((r) => (
                              <button key={r.id}
                                onClick={() => setDraftRole(r.id)}
                                style={{
                                  padding: "9px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                                  border: `1px solid ${draftRole === r.id ? "rgba(255,204,0,0.4)" : BORDER}`,
                                  background: draftRole === r.id ? "rgba(255,204,0,0.08)" : "#080808",
                                  display: "flex", alignItems: "center", gap: 8,
                                }}>
                                <span style={{ fontSize: 14 }}>{r.icon}</span>
                                <span style={{ fontFamily: FT, fontSize: 12, color: draftRole === r.id ? AMBER : TEXT }}>{r.label}</span>
                                {draftRole === r.id && <Check size={11} style={{ color: AMBER, marginLeft: "auto", flexShrink: 0 }} />}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </EditRow>

                  <EditRow
                    label="Experience"
                    preview={<span>{expData ? `${expData.label} (${expData.desc})` : <span style={{ color: MUTED }}>Not set</span>}</span>}
                    onSave={async () => { await patchField({ experience_level: draftExp }); }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {EXPERIENCE_LEVELS.map((e) => (
                        <button key={e.id}
                          onClick={() => setDraftExp(e.id)}
                          style={{
                            padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                            border: `1px solid ${draftExp === e.id ? "rgba(255,204,0,0.4)" : BORDER}`,
                            background: draftExp === e.id ? "rgba(255,204,0,0.08)" : "#080808",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                          }}>
                          <div>
                            <p style={{ fontFamily: FT, fontSize: 14, color: draftExp === e.id ? AMBER : TEXT, fontWeight: 500 }}>{e.label}</p>
                            <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 1 }}>{e.desc}</p>
                          </div>
                          {draftExp === e.id && <Check size={14} style={{ color: AMBER }} />}
                        </button>
                      ))}
                    </div>
                  </EditRow>

                  <EditRow
                    label="Day Rate"
                    preview={
                      <span>
                        {(profile?.rate_min != null || profile?.rate_max != null)
                          ? `₱${(profile?.rate_min ?? 0).toLocaleString()} – ₱${(profile?.rate_max ?? 0).toLocaleString()} / ${unitData?.label.toLowerCase() ?? "day"}`
                          : <span style={{ color: MUTED }}>Not set</span>
                        }
                      </span>
                    }
                    onSave={async () => {
                      await patchField({
                        rate_min: draftRateMin ? Number(draftRateMin) : null,
                        rate_max: draftRateMax ? Number(draftRateMax) : null,
                        rate_unit: draftUnit,
                      });
                    }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginBottom: 6 }}>Min (₱)</p>
                        <input type="number" value={draftRateMin} onChange={(e) => setDraftRateMin(e.target.value)}
                          placeholder="e.g. 5000" style={inp()} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginBottom: 6 }}>Max (₱)</p>
                        <input type="number" value={draftRateMax} onChange={(e) => setDraftRateMax(e.target.value)}
                          placeholder="e.g. 10000" style={inp()} />
                      </div>
                    </div>
                    <select value={draftUnit} onChange={(e) => setDraftUnit(e.target.value)} style={inp()}>
                      {RATE_UNITS.map((u) => (
                        <option key={u.id} value={u.id}>{u.label}</option>
                      ))}
                    </select>
                  </EditRow>
                </Card>

                <Card title="Specializations">
                  <div style={{ padding: "18px" }}>
                    <TagInput tags={draftSpecs} onChange={setDraftSpecs} />
                    <button
                      onClick={async () => { await patchField({ specializations: draftSpecs }); }}
                      style={{
                        marginTop: 14, width: "100%", padding: "11px", borderRadius: 10,
                        border: "none", background: AMBER, color: "#000",
                        fontFamily: FT, fontSize: 14, fontWeight: 700, cursor: "pointer",
                      }}>
                      Save Specializations
                    </button>
                  </div>
                </Card>
              </>
            )}
          </>
        )}

        {/* ════════════ AVAILABILITY TAB ════════════ */}
        {activeTab === "availability" && isCrew && (
          <>
            {/* Status toggles */}
            <Card title="Status">
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {AVAILABILITY.map((a) => (
                    <button key={a.id}
                      onClick={() => changeAvailabilityStatus(a.id)}
                      style={{
                        flex: 1, padding: "12px 8px", borderRadius: 12, cursor: "pointer",
                        border: `1px solid ${profile?.availability === a.id ? `${a.color}55` : BORDER}`,
                        background: profile?.availability === a.id ? `${a.color}14` : "#080808",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        transition: "all 0.15s",
                      }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: a.color }} />
                      <span style={{ fontFamily: FT, fontSize: 11, color: profile?.availability === a.id ? a.color : MUTED, lineHeight: 1.3, textAlign: "center" }}>
                        {a.label}
                      </span>
                      {profile?.availability === a.id && <Check size={11} style={{ color: a.color }} />}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Calendar */}
            <Card title="Mark Busy Days">
              <div style={{ padding: "20px 18px" }}>
                <AvailCalendar userId={userId} />
              </div>
              <div style={{ padding: "0 18px 16px" }}>
                <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
                  Tap any upcoming date to mark it as busy. Clients browsing for available crew will see your open days.
                </p>
              </div>
            </Card>

            {/* Accepted bookings */}
            {bookings.length > 0 && (
              <Card title="Accepted Work">
                {bookings.map((b, i) => (
                  <div key={b.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px",
                    borderBottom: i < bookings.length - 1 ? `1px solid ${BORDER}` : "none",
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {b.project_title}
                      </p>
                      <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 2 }}>
                        {new Date(b.created_at).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <Link href={`/messages?thread=${b.id}`}
                      style={{
                        display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
                        padding: "6px 12px", borderRadius: 8, marginLeft: 12,
                        background: "rgba(255,204,0,0.07)", border: "1px solid rgba(255,204,0,0.18)",
                        fontFamily: FT, fontSize: 12, fontWeight: 500, color: AMBER, textDecoration: "none",
                      }}>
                      Chat
                    </Link>
                  </div>
                ))}
              </Card>
            )}
          </>
        )}

        {/* ════════════ ACCOUNT TAB ════════════ */}
        {activeTab === "account" && (
          <>
            {/* Legal */}
            <Card title="Legal & Privacy">
              {[
                { icon: <FileText size={17} />, label: "Terms of Service" },
                { icon: <Shield size={17} />, label: "Privacy Policy" },
                { icon: <Shield size={17} />, label: "Data Privacy Act (RA 10173)", sub: "Philippine Data Privacy Act" },
              ].map(({ icon, label, sub }, i, arr) => (
                <Link key={label} href="/legal" style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "15px 18px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none",
                  }}>
                    <div style={{ color: MUTED, flexShrink: 0 }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>{label}</p>
                      {sub && <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 1 }}>{sub}</p>}
                    </div>
                    <ChevronRight size={14} style={{ color: MUTED, flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </Card>

            {/* Activate other role */}
            {!isCrew && (
              <Card title="Also join as Crew">
                <div style={{ padding: "16px 18px" }}>
                  <p style={{ fontFamily: FT, fontSize: 14, color: TEXT, marginBottom: 6 }}>
                    You signed up as a hirer. Want to also list yourself as crew?
                  </p>
                  <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 14 }}>
                    Activating your crew profile lets you appear in search and receive project requests — without losing your hirer account. You get one login for both.
                  </p>
                  <Link href="/join?type=crew&mode=add"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "11px 18px", borderRadius: 12,
                      background: "rgba(255,204,0,0.08)", border: "1px solid rgba(255,204,0,0.25)",
                      fontFamily: FT, fontSize: 14, fontWeight: 700, color: AMBER, textDecoration: "none",
                    }}>
                    🎬 Activate Crew Profile
                  </Link>
                </div>
              </Card>
            )}
            {!isHirer && (
              <Card title="Also join as Hirer">
                <div style={{ padding: "16px 18px" }}>
                  <p style={{ fontFamily: FT, fontSize: 14, color: TEXT, marginBottom: 6 }}>
                    You signed up as crew. Want to also hire other crew?
                  </p>
                  <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 14 }}>
                    Activating your hirer profile lets you send connection requests to other crew members — without losing your crew card.
                  </p>
                  <Link href="/join?type=client&mode=add"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "11px 18px", borderRadius: 12,
                      background: "rgba(255,204,0,0.08)", border: "1px solid rgba(255,204,0,0.25)",
                      fontFamily: FT, fontSize: 14, fontWeight: 700, color: AMBER, textDecoration: "none",
                    }}>
                    🎥 Activate Hirer Profile
                  </Link>
                </div>
              </Card>
            )}

            {/* Account settings */}
            <Card title="Account" last>
              {/* Pause */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ color: MUTED, flexShrink: 0, marginTop: 2 }}>
                  {paused ? <Play size={17} /> : <Pause size={17} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>
                    {paused ? "Resume account" : "Pause account"}
                  </p>
                  <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 1.5 }}>
                    {paused
                      ? "Profile is hidden. Tap Resume to go live again."
                      : "Hide your profile and stop receiving requests temporarily."}
                  </p>
                </div>
                <button onClick={togglePause} disabled={pauseLoading}
                  style={{
                    padding: "7px 14px", borderRadius: 20, flexShrink: 0,
                    border: `1px solid ${paused ? "rgba(50,215,75,0.3)" : BORDER}`,
                    background: paused ? "rgba(50,215,75,0.08)" : "transparent",
                    color: paused ? "#32D74B" : MUTED,
                    fontFamily: FT, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>
                  {pauseLoading ? "…" : paused ? "Resume" : "Pause"}
                </button>
              </div>

              {/* Deactivate */}
              <div onClick={() => setShowDeactivate(true)}
                style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", cursor: "pointer" }}>
                <AlertTriangle size={17} style={{ color: "#FF453A", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: "#FF453A" }}>Deactivate account</p>
                  <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 2 }}>Permanently delete your profile and all data.</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Hidden file inputs */}
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />
      <input ref={cameraRef} type="file" accept="image/*" capture="user" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />

      {/* ── Deactivate modal ── */}
      {showDeactivate && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          padding: "0 0 env(safe-area-inset-bottom, 16px)",
        }}>
          <div style={{
            width: "100%", maxWidth: 480, background: "#111", border: `1px solid ${BORDER}`,
            borderRadius: "20px 20px 0 0", padding: "28px 24px 32px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <AlertTriangle size={20} style={{ color: "#FF453A" }} />
              <p style={{ fontFamily: FD, fontSize: 18, fontWeight: 700, color: "#FF453A" }}>Deactivate account</p>
            </div>
            <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.6 }}>
              This permanently deletes your profile and all data. It cannot be undone.
            </p>

            <p style={{ fontFamily: FT, fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Reason</p>
            <select value={reason} onChange={(e) => setReason(e.target.value)}
              style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#080808", color: reason ? TEXT : MUTED, fontFamily: FT, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }}>
              <option value="" disabled>Select a reason</option>
              {DEACTIVATE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <p style={{ fontFamily: FT, fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Type DELETE to confirm</p>
            <input type="text" value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setDeactivateErr(""); }}
              placeholder="DELETE"
              style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: `1px solid ${confirm === "DELETE" ? "rgba(255,69,58,0.4)" : BORDER}`, background: "#080808", color: TEXT, fontFamily: FT, fontSize: 14, letterSpacing: "0.08em", marginBottom: 8, outline: "none", boxSizing: "border-box" }} />

            {deactivateErr && <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A", marginBottom: 12 }}>{deactivateErr}</p>}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => { setShowDeactivate(false); setConfirm(""); setReason(""); setDeactivateErr(""); }}
                style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, fontFamily: FT, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleDeactivate}
                disabled={deactivating || confirm !== "DELETE" || !reason}
                style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: confirm === "DELETE" && reason ? "#FF453A" : "rgba(255,69,58,0.2)", color: confirm === "DELETE" && reason ? "#fff" : "rgba(255,69,58,0.4)", fontFamily: FT, fontSize: 14, fontWeight: 700, cursor: confirm === "DELETE" && reason && !deactivating ? "pointer" : "not-allowed" }}>
                {deactivating ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
