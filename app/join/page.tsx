"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, EXPERIENCE_LEVELS, AVAILABILITY, PH_REGIONS, PH_LOCATIONS, RATE_UNITS, PROJECT_TYPES } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Check, Clapperboard, Lock, Ticket } from "lucide-react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#000000";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";

const SPEC_BY_ROLE: Record<string, string[]> = {
  // Directing
  director:          ["Narrative Film", "Commercial / TVC", "Music Video", "Documentary", "Short Film", "Online Content"],
  ad:                ["Film", "TV Series", "Commercial", "Live Event"],
  first_ad:          ["Film", "TV Series", "Commercial", "Live Event"],
  second_ad:         ["Film", "TV Series", "Commercial", "Live Event"],
  script_supervisor: ["Film", "TV Series", "Commercial"],
  // Camera
  dp:                ["Narrative Film", "Commercial / TVC", "Music Video", "Documentary", "ENG/News", "Live Event"],
  camera_op:         ["Studio", "ENG/News", "Steadicam", "Drone", "Multi-camera", "Live Event"],
  focus_puller:      ["Narrative Film", "Commercial", "Live Event", "Documentary"],
  clapper_loader:    ["Narrative Film", "Commercial", "Live Event"],
  dit:               ["On-Set Dailies", "Color Management", "Data Wrangling"],
  steadicam:         ["Narrative Film", "Live Event", "Documentary", "Commercial"],
  drone_op:          ["Aerial Survey", "Cinematic", "News / ENG", "Real Estate"],
  // Lighting & Grip
  gaffer:            ["Studio Lighting", "Location Lighting", "Practical Lighting", "LED / DMX"],
  best_boy_e:        ["Film", "TV Series", "Commercial", "Live Event"],
  key_grip:          ["Film", "TV Series", "Commercial", "Live Event"],
  grip:              ["Film", "TV Series", "Commercial", "Live Event"],
  // Sound
  sound_mixer:       ["Production Sound", "Post Production", "Live Sound", "ADR", "Foley"],
  boom_op:           ["Film", "TV Series", "Commercial", "Documentary"],
  sound_design:      ["Film", "TV Series", "Game / Interactive", "Advertising"],
  // Art Department
  prod_designer:     ["Film", "TV Series", "Commercial", "Music Video"],
  art_director:      ["Film", "TV Series", "Commercial"],
  set_decorator:     ["Film", "TV Series", "Commercial"],
  prop_master:       ["Film", "TV Series", "Commercial", "Period / Historical"],
  // Costume & Makeup
  costume_designer:  ["Film / TV", "Commercial", "Period / Historical", "Fantasy"],
  wardrobe:          ["Film / TV", "Commercial", "Fashion", "Period / Costume"],
  mua:               ["Film / TV", "Commercial", "Fashion", "Special Effects", "Wedding"],
  hair:              ["Film / TV", "Commercial", "Fashion", "Wedding"],
  sfx_makeup:        ["Prosthetics", "Ageing / Character", "Wounds / Gore", "Fantasy"],
  // Post Production
  editor:            ["Drama Series", "Film", "Commercial", "Documentary", "Music Video", "Online Content"],
  colorist:          ["Film", "TV Series", "Commercial", "Music Video"],
  dit_post:          ["Dailies / DCP", "Online Finishing"],
  vfx:               ["Motion Graphics", "3D VFX", "Compositing", "Title Design"],
  motion_design:     ["Broadcast", "Title Sequence", "Advertising", "Social Media"],
  sound_editor:      ["Film", "TV Series", "Commercial", "Documentary"],
  // Production
  producer:          ["Narrative Film", "Documentary", "Commercial / TVC", "Music Video", "Online Content"],
  line_producer:     ["Film", "TV Series", "Commercial", "Live Event"],
  prod_manager:      ["Film", "TV Series", "Commercial", "Live Event"],
  prod_coordinator:  ["Film", "TV Series", "Commercial", "Live Event"],
  location_manager:  ["Film", "TV Series", "Commercial", "Documentary"],
  casting_director:  ["Film", "TV Series", "Commercial", "Theater"],
  pa:                ["Film", "TV Series", "Commercial", "Live Event"],
  // Photography
  still_photo:       ["BTS / EPK", "Editorial", "Commercial", "Events"],
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: 12,
  border: `1px solid ${BORDER}`, background: "#080808",
  color: TEXT, fontFamily: FT, fontSize: 16, outline: "none",
};

function SectionLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <p style={{ fontFamily: FT, fontSize: 11, fontWeight: 700, color: AMBER, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {children}
      </p>
      {optional && (
        <span style={{ fontFamily: FT, fontSize: 11, color: "rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "2px 7px" }}>
          Optional
        </span>
      )}
    </div>
  );
}

function Field({ label, error, children, hint }: { label?: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontFamily: FT, fontSize: 13, fontWeight: 500, color: MUTED }}>
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.22)" }}>{hint}</p>}
      {error && <p style={{ fontFamily: FT, fontSize: 12, color: "#FF453A" }}>{error}</p>}
    </div>
  );
}

function FocusInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} style={{ ...inputStyle, ...props.style }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,179,0,0.4)"; props.onFocus?.(e); }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = BORDER; props.onBlur?.(e); }} />
  );
}

export default function JoinPage() {
  const router = useRouter();
  const initialType = (() => {
    if (typeof window === "undefined") return null;
    const type = new URLSearchParams(window.location.search).get("type");
    return type === "crew" || type === "client" ? type : null;
  })();
  // mode=add means user already has a profile, just activating second role
  const isAddMode = (() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("mode") === "add";
  })();

  const [checking,   setChecking]   = useState(true);
  const [userId,     setUserId]     = useState<string | null>(null);
  const [step,       setStep]       = useState<"code" | "pick" | "crew" | "client">(
    isAddMode && initialType ? initialType : "code"
  );
  const [requestedType] = useState<"crew" | "client" | null>(initialType);
  const [inviteCode, setInviteCode] = useState("");
  const [codeError,  setCodeError]  = useState("");
  const [validating, setValidating] = useState(false);

  // Shared fields
  const [displayName, setDisplayName] = useState("");
  const [city,        setCity]        = useState("");

  // Crew-only fields
  const [roles,           setRoles]           = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [expLevel,        setExpLevel]        = useState("mid");
  const [availability,    setAvailability]    = useState("available");
  const [rateMin,         setRateMin]         = useState("");
  const [rateMax,         setRateMax]         = useState("");
  const [rateUnit,        setRateUnit]        = useState("day");
  const [bio,             setBio]             = useState("");
  const [showreelUrl,     setShowreelUrl]     = useState("");
  const [portfolioUrl,    setPortfolioUrl]    = useState("");
  const [tiktokUrl,       setTiktokUrl]       = useState("");
  const [instagramUrl,    setInstagramUrl]    = useState("");
  const [linkedinUrl,     setLinkedinUrl]     = useState("");
  const [facebookUrl,     setFacebookUrl]     = useState("");
  const [phone,           setPhone]           = useState("");
  const [contactEmail,    setContactEmail]    = useState("");
  const [viber,           setViber]           = useState("");
  const [whatsapp,        setWhatsapp]        = useState("");

  // Client-only fields
  const [company,        setCompany]        = useState("");
  const [productionType, setProductionType] = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get("type");

    const sb = createClient();
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        const suffix = type === "crew" || type === "client" ? `?type=${type}` : "";
        router.replace(`/auth?intent=join&next=${encodeURIComponent(`/join${suffix}`)}`);
        return;
      }
      setUserId(session.user.id);
      const name = (session.user.user_metadata?.name ?? session.user.user_metadata?.full_name ?? "") as string;
      if (name) setDisplayName(name);
      setChecking(false);
    });
  }, [router]);

  async function handleCrewSubmit() {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "Required";
    if (roles.length === 0) e.role = "Pick at least one role";
    if (!city) e.city = "Required";
    if (Object.keys(e).length) {
      setErrors(e);
      document.querySelector("[data-section='role']")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!userId) return;
    setSaving(true);
    setErrors({});

    const sb = createClient();
    const slug = displayName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Math.random().toString(36).slice(2, 6);

    // In add-mode: upsert to add crew fields to existing hirer profile
    const crewData = {
      id: userId, slug,
      display_name: displayName.trim(), bio: bio || null,
      role:            roles[0]       || "",
      secondary_roles: roles.slice(1),
      account_type: "crew",
      is_crew: true,
      experience_level: expLevel,
      city, availability,
      rate_min:  rateMin  ? Number(rateMin)  : null,
      rate_max:  rateMax  ? Number(rateMax)  : null,
      rate_unit: rateUnit,
      showreel_url:   showreelUrl   || null,
      portfolio_url:  portfolioUrl  || null,
      tiktok_url:     tiktokUrl     || null,
      instagram_url:  instagramUrl  || null,
      linkedin_url:   linkedinUrl   || null,
      facebook_url:   facebookUrl   || null,
      ...(isAddMode ? {} : { is_hirer: false, premium_status: "trial", trial_started_at: new Date().toISOString() }),
    };

    const { error: profileErr } = isAddMode
      ? await sb.from("profiles").update({ ...crewData, is_crew: true }).eq("id", userId)
      : await sb.from("profiles").insert({ ...crewData, is_hirer: false, premium_status: "trial", trial_started_at: new Date().toISOString() });

    if (profileErr) { setErrors({ submit: profileErr.message }); setSaving(false); return; }

    await fetch("/api/invite/use", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: inviteCode.trim() }),
    });

    if (specializations.length > 0) {
      await sb.from("profile_specializations").insert(
        specializations.map((name) => ({ profile_id: userId, name }))
      );
    }

    if (phone || contactEmail || viber || whatsapp) {
      await sb.from("contact_details").insert({
        id: userId,
        phone:    phone        || null,
        email:    contactEmail || null,
        viber:    viber        || null,
        whatsapp: whatsapp     || null,
      });
    }

    router.push("/dashboard?welcome=1");
  }

  async function handleClientSubmit() {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "Required";
    if (!city) e.city = "Required";
    if (Object.keys(e).length) { setErrors(e); return; }
    if (!userId) return;
    setSaving(true);
    setErrors({});

    const sb = createClient();
    const slug = displayName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Math.random().toString(36).slice(2, 6);

    const hirerData = {
      display_name: displayName.trim(),
      account_type: "client",
      is_hirer: true,
      city,
      company:         company        || null,
      production_type: productionType || null,
    };

    const { error: profileErr } = isAddMode
      ? await sb.from("profiles").update(hirerData).eq("id", userId)
      : await sb.from("profiles").insert({
          id: userId, slug,
          ...hirerData,
          is_crew: false,
          premium_status:  "trial",
          trial_started_at: new Date().toISOString(),
        });

    if (profileErr) { setErrors({ submit: profileErr.message }); setSaving(false); return; }

    await fetch("/api/invite/use", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: inviteCode.trim() }),
    });

    router.push("/dashboard?welcome=1");
  }

  async function validateCode() {
    if (!inviteCode.trim()) { setCodeError("Enter your invite code."); return; }
    setValidating(true);
    setCodeError("");
    const res = await fetch("/api/invite/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: inviteCode.trim() }),
    });
    if (res.ok) {
      setStep(requestedType ?? "pick");
    } else {
      const body = await res.json() as { error?: string };
      setCodeError(body.error ?? "Invalid invite code.");
    }
    setValidating(false);
  }

  const specOptions  = roles.length > 0 ? (SPEC_BY_ROLE[roles[0]] ?? []) : [];
  const selectBase: React.CSSProperties = { ...inputStyle, appearance: "none" as const };

  if (checking) {
    return (
      <div style={{ background: BG, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${AMBER}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Nav bar (shared) ──────────────────────────────────────────────────────
  const nav = (
    <div className="app-container topbar-inner" style={{ justifyContent: "flex-start" }}>
      {step === "code" ? (
        <Link href="/"
          style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED }}
          className="hover:opacity-70 transition-opacity">
          <ArrowLeft size={15} />
          <Clapperboard size={15} style={{ color: AMBER }} strokeWidth={2} />
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT, letterSpacing: "-0.02em" }}>CineVerse</span>
        </Link>
      ) : step === "pick" ? (
        <button
          onClick={() => { setStep("code"); setErrors({}); }}
          style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED, background: "none", border: "none", cursor: "pointer" }}
          className="hover:opacity-70 transition-opacity">
          <ArrowLeft size={15} />
          <span style={{ fontFamily: FT, fontSize: 15, color: MUTED }}>Back</span>
        </button>
      ) : (
        <button
          onClick={() => { setStep("pick"); setErrors({}); }}
          style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED, background: "none", border: "none", cursor: "pointer" }}
          className="hover:opacity-70 transition-opacity">
          <ArrowLeft size={15} />
          <span style={{ fontFamily: FT, fontSize: 15, color: MUTED }}>Back</span>
        </button>
      )}
    </div>
  );

  // ── Invite code gate ─────────────────────────────────────────────────────
  if (step === "code") {
    return (
      <div style={{ background: BG, minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        {nav}
        <div className="app-container-form" style={{ flex: 1, paddingBlock: "clamp(12px,3vh,28px) clamp(56px,8vh,88px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,204,0,0.1)", border: "1px solid rgba(255,204,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Ticket size={22} style={{ color: AMBER }} />
            </div>
            <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(24px,5vw,32px)", color: TEXT, letterSpacing: "-0.028em", marginBottom: 10 }}>
              Enter your invite code
            </h1>
            <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
              CineVerse is currently invite-only. Enter the code you received to continue.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FocusInput
              type="text"
              placeholder="e.g. A3K7P2XB"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                if (codeError) setCodeError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && validateCode()}
              style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 18, textAlign: "center" }}
            />

            {codeError && (
              <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A", textAlign: "center" }}>{codeError}</p>
            )}

            <button
              onClick={validateCode}
              disabled={validating}
              className="transition-all hover:opacity-85 active:scale-[0.98]"
              style={{
                width: "100%", height: 56, borderRadius: 16, border: "none",
                background: validating ? "rgba(255,179,0,0.5)" : AMBER,
                color: "#000", fontFamily: FT, fontSize: 16, fontWeight: 700,
                cursor: validating ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 24px rgba(255,179,0,0.22)",
              }}>
              {validating ? "Checking…" : <><ArrowRight size={17} /> Continue</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Account type picker ───────────────────────────────────────────────────
  if (step === "pick") {
    return (
      <div style={{ background: BG, minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        {nav}
        <div className="app-container-form" style={{ flex: 1, paddingBlock: "clamp(12px,3vh,28px) clamp(56px,8vh,88px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(24px,5vw,32px)", color: TEXT, letterSpacing: "-0.028em", marginBottom: 10 }}>
              How are you using CineVerse?
            </h1>
            <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
              We&apos;ll set up your account based on your role.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => setStep("crew")}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "20px 22px", borderRadius: 16, cursor: "pointer",
                border: `1px solid ${BORDER}`, background: SURFACE,
                textAlign: "left", transition: "all 0.15s",
              }}
              className="hover:border-amber-400/30 hover:bg-white/[0.03] active:scale-[0.99]">
              <span style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>🎬</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, marginBottom: 3 }}>
                  I&apos;m Crew
                </p>
                <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                  Build your card and get discovered by productions.
                </p>
              </div>
              <ArrowRight size={16} style={{ color: MUTED, flexShrink: 0 }} />
            </button>

            <button
              onClick={() => setStep("client")}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "20px 22px", borderRadius: 16, cursor: "pointer",
                border: `1px solid ${BORDER}`, background: SURFACE,
                textAlign: "left", transition: "all 0.15s",
              }}
              className="hover:border-amber-400/30 hover:bg-white/[0.03] active:scale-[0.99]">
              <span style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>🎥</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, marginBottom: 3 }}>
                  I&apos;m Hiring
                </p>
                <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                  Find and connect with film and media crew.
                </p>
              </div>
              <ArrowRight size={16} style={{ color: MUTED, flexShrink: 0 }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Client form ───────────────────────────────────────────────────────────
  if (step === "client") {
    return (
      <div style={{ background: BG, minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        {nav}
        <div className="app-container-form" style={{ flex: 1, paddingBlock: "clamp(12px,3vh,28px) clamp(56px,8vh,88px)" }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(24px,5vw,32px)", color: TEXT, letterSpacing: "-0.028em", marginBottom: 10 }}>
              Set up your account
            </h1>
            <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
              Quick setup. You can always update these later.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Basics */}
            <div className="app-surface" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: "clamp(20px,5%,28px)" }}>
              <SectionLabel>About you</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Field label="Full name *" error={errors.displayName}>
                  <FocusInput type="text" placeholder="Your name" value={displayName}
                    onChange={(e) => { setDisplayName(e.target.value); if (errors.displayName) setErrors((p) => ({ ...p, displayName: "" })); }} />
                </Field>
                <Field label="Company / Studio" hint="Optional">
                  <FocusInput type="text" placeholder="e.g. StarCinema Productions" value={company}
                    onChange={(e) => setCompany(e.target.value)} />
                </Field>
                <Field label="City *" error={errors.city}>
                  <select value={city} onChange={(e) => { setCity(e.target.value); if (errors.city) setErrors((p) => ({ ...p, city: "" })); }} style={selectBase}>
                    <option value="">Select city</option>
                    {PH_REGIONS.map((region) => (
                      <optgroup key={region.id} label={region.label}>
                        {region.cities.map((c) => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            {/* Production type */}
            <div className="app-surface" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: "clamp(20px,5%,28px)" }}>
              <SectionLabel optional>What you produce</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PROJECT_TYPES.map((pt) => {
                  const sel = productionType === pt.id;
                  return (
                    <button key={pt.id} type="button"
                      onClick={() => setProductionType(sel ? "" : pt.id)}
                      style={{
                        padding: "8px 16px", borderRadius: 20, cursor: "pointer",
                        border: `1px solid ${sel ? "rgba(255,179,0,0.4)" : BORDER}`,
                        background: sel ? "rgba(255,179,0,0.09)" : "#080808",
                        color: sel ? AMBER : MUTED,
                        fontFamily: FT, fontSize: 13, fontWeight: 500,
                        transition: "all 0.15s",
                      }}>
                      {pt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
              {errors.submit && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)" }}>
                  <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A" }}>{errors.submit}</p>
                </div>
              )}
              <button onClick={handleClientSubmit} disabled={saving}
                className="transition-all hover:opacity-85 active:scale-[0.98]"
                style={{
                  width: "100%", height: 56, borderRadius: 16, border: "none",
                  background: saving ? "rgba(255,179,0,0.5)" : AMBER,
                  color: "#000", fontFamily: FT, fontSize: 16, fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 24px rgba(255,179,0,0.22)",
                }}>
                {saving ? "Creating…" : <><Check size={17} /> Create account</>}
              </button>
              <button onClick={() => router.push("/dashboard")} disabled={saving}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: FT, fontSize: 13, color: "rgba(255,255,255,0.28)", padding: "6px 0" }}
                className="hover:text-white/50 transition-colors">
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Crew form ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {nav}
      <div className="app-container-form" style={{ flex: 1, paddingBlock: "clamp(12px,3vh,28px) clamp(56px,8vh,88px)" }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(24px,5vw,32px)", color: TEXT, letterSpacing: "-0.028em", marginBottom: 10 }}>
            Build your card
          </h1>
          <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
            Role, reel, credits, kit, availability.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── YOUR ROLE ── */}
          <div className="app-surface" data-section="role" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: "clamp(20px,5%,28px)" }}>
            <SectionLabel>Role</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              <Field
                label={`Roles * — select all that apply${roles.length > 0 ? ` (${roles.length} selected)` : ""}`}
                error={errors.role}
                hint="First selected becomes your primary role shown on your card."
              >
                {Array.from(new Set(ROLES.map((r) => r.dept))).map((dept) => (
                  <div key={dept} style={{ marginBottom: 10 }}>
                    <p style={{ fontFamily: FT, fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{dept}</p>
                    <div className="responsive-two" style={{ gap: 6 }}>
                      {ROLES.filter((r) => r.dept === dept).map((r) => {
                        const selected = roles.includes(r.id);
                        const isPrimary = roles[0] === r.id;
                        return (
                          <button key={r.id} type="button"
                            onClick={() => {
                              setRoles((prev) => {
                                const next = prev.includes(r.id)
                                  ? prev.filter((x) => x !== r.id)
                                  : [...prev, r.id];
                                if (prev[0] !== next[0]) setSpecializations([]);
                                return next;
                              });
                              if (errors.role) setErrors((p) => ({ ...p, role: "" }));
                            }}
                            style={{
                              display: "flex", alignItems: "center", gap: 8, position: "relative",
                              padding: "9px 12px", borderRadius: 10, cursor: "pointer",
                              border: `1px solid ${selected ? "rgba(255,179,0,0.45)" : BORDER}`,
                              background: selected ? "rgba(255,179,0,0.09)" : "#080808",
                              color: selected ? AMBER : MUTED,
                              fontFamily: FT, fontSize: 12, fontWeight: 500,
                              transition: "all 0.15s", textAlign: "left",
                            }}>
                            <span style={{ fontSize: 15, flexShrink: 0 }}>{r.icon}</span>
                            <span style={{ lineHeight: 1.3, flex: 1 }}>{r.label}</span>
                            {isPrimary && (
                              <span style={{
                                fontFamily: FT, fontSize: 9, fontWeight: 700, color: "#000",
                                background: AMBER, padding: "2px 5px", borderRadius: 4, flexShrink: 0,
                              }}>PRIMARY</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </Field>

              {specOptions.length > 0 && (
                <Field label="Specializations">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {specOptions.map((s) => {
                      const sel = specializations.includes(s);
                      return (
                        <button key={s} type="button"
                          onClick={() => setSpecializations((p) => sel ? p.filter((x) => x !== s) : [...p, s])}
                          style={{
                            padding: "7px 14px", borderRadius: 20, cursor: "pointer",
                            border: `1px solid ${sel ? "rgba(255,179,0,0.4)" : BORDER}`,
                            background: sel ? "rgba(255,179,0,0.09)" : "#080808",
                            color: sel ? AMBER : MUTED,
                            fontFamily: FT, fontSize: 13, fontWeight: 500,
                            transition: "all 0.15s",
                          }}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              )}
            </div>
          </div>

          {/* ── ABOUT YOU ── */}
          <div className="app-surface" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: "clamp(20px,5%,28px)" }}>
            <SectionLabel>Basics</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              <Field label="Full name *" error={errors.displayName}>
                <FocusInput type="text" placeholder="Your name" value={displayName} onChange={(e) => { setDisplayName(e.target.value); if (errors.displayName) setErrors((p) => ({ ...p, displayName: "" })); }} />
              </Field>

              <Field label="City *" error={errors.city}>
                <select value={city} onChange={(e) => { setCity(e.target.value); if (errors.city) setErrors((p) => ({ ...p, city: "" })); }} style={selectBase}>
                  <option value="">Select city</option>
                  {PH_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>

              <Field label="Experience level">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {EXPERIENCE_LEVELS.map((e) => (
                    <button key={e.id} type="button" onClick={() => setExpLevel(e.id)}
                      style={{
                        padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                        border: `1px solid ${expLevel === e.id ? "rgba(255,179,0,0.35)" : BORDER}`,
                        background: expLevel === e.id ? "rgba(255,179,0,0.07)" : "#080808",
                        color: expLevel === e.id ? AMBER : MUTED,
                        fontFamily: FT, fontSize: 13, fontWeight: 500,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        transition: "all 0.15s",
                      }}>
                      <span>{e.label}</span>
                      <span style={{ fontSize: 12, opacity: 0.55 }}>{e.desc}</span>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Availability">
                <div className="mobile-stack" style={{ display: "flex", gap: 8 }}>
                  {AVAILABILITY.map((a) => (
                    <button key={a.id} type="button" onClick={() => setAvailability(a.id)}
                      style={{
                        flex: 1, padding: "10px 8px", borderRadius: 12, cursor: "pointer",
                        border: `1px solid ${availability === a.id ? `${a.color}45` : BORDER}`,
                        background: availability === a.id ? `${a.color}10` : "#080808",
                        color: availability === a.id ? a.color : MUTED,
                        fontFamily: FT, fontSize: 13, fontWeight: 500,
                        transition: "all 0.15s",
                      }}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          {/* ── RATES & LINKS ── */}
          <div className="app-surface" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: "clamp(20px,5%,28px)" }}>
            <SectionLabel optional>Work</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Rate */}
              <div>
                <label style={{ fontFamily: FT, fontSize: 13, fontWeight: 500, color: MUTED, display: "block", marginBottom: 8 }}>
                  Rate (₱)
                </label>
                {/* Min / Max on one row, unit selector below */}
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  {/* Min */}
                  <div style={{
                    flex: 1, display: "flex", alignItems: "center",
                    border: `1px solid ${BORDER}`, borderRadius: 12, background: "#080808",
                    overflow: "hidden", minWidth: 0,
                  }}>
                    <span style={{ padding: "13px 4px 13px 14px", fontFamily: FT, fontSize: 15, color: MUTED, flexShrink: 0, userSelect: "none" }}>₱</span>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]*"
                      value={rateMin} onChange={(e) => setRateMin(e.target.value.replace(/\D/g, ""))}
                      placeholder="Min"
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TEXT, fontFamily: FT, fontSize: 15, padding: "13px 12px 13px 2px", minWidth: 0 }}
                    />
                  </div>
                  <span style={{ fontFamily: FT, fontSize: 14, color: MUTED, flexShrink: 0 }}>to</span>
                  {/* Max */}
                  <div style={{
                    flex: 1, display: "flex", alignItems: "center",
                    border: `1px solid ${BORDER}`, borderRadius: 12, background: "#080808",
                    overflow: "hidden", minWidth: 0,
                  }}>
                    <span style={{ padding: "13px 4px 13px 14px", fontFamily: FT, fontSize: 15, color: MUTED, flexShrink: 0, userSelect: "none" }}>₱</span>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]*"
                      value={rateMax} onChange={(e) => setRateMax(e.target.value.replace(/\D/g, ""))}
                      placeholder="Max"
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TEXT, fontFamily: FT, fontSize: 15, padding: "13px 12px 13px 2px", minWidth: 0 }}
                    />
                  </div>
                </div>
                <select value={rateUnit} onChange={(e) => setRateUnit(e.target.value)} style={{ ...selectBase, width: "100%" }}>
                  {RATE_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
                {rateMin && rateMax && (
                  <p style={{ fontFamily: FT, fontSize: 12, color: AMBER, marginTop: 8 }}>
                    ₱{Number(rateMin).toLocaleString()} – ₱{Number(rateMax).toLocaleString()} / {RATE_UNITS.find(u => u.id === rateUnit)?.label ?? rateUnit}
                  </p>
                )}
              </div>

              {/* Showreel + Portfolio */}
              <div className="responsive-two">
                <Field label="Showreel URL">
                  <FocusInput type="url" value={showreelUrl} onChange={(e) => setShowreelUrl(e.target.value)} placeholder="YouTube / Vimeo" />
                </Field>
                <Field label="Portfolio URL">
                  <FocusInput type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://…" />
                </Field>
              </div>

              {/* Social links */}
              <div>
                <label style={{ fontFamily: FT, fontSize: 13, fontWeight: 500, color: MUTED, display: "block", marginBottom: 8 }}>
                  Social profiles
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "TikTok",    icon: "🎵", val: tiktokUrl,    set: setTiktokUrl,    ph: "https://tiktok.com/@yourhandle" },
                    { label: "Instagram", icon: "📸", val: instagramUrl, set: setInstagramUrl, ph: "https://instagram.com/yourhandle" },
                    { label: "Facebook",  icon: "👤", val: facebookUrl,  set: setFacebookUrl,  ph: "https://facebook.com/yourpage" },
                    { label: "LinkedIn",  icon: "💼", val: linkedinUrl,  set: setLinkedinUrl,  ph: "https://linkedin.com/in/yourname" },
                  ].map(({ label, icon, val, set, ph }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: "center" }}>{icon}</span>
                      <input
                        type="url" value={val} onChange={(e) => set(e.target.value)}
                        placeholder={ph}
                        style={{ ...inputStyle, flex: 1, fontSize: 13, padding: "10px 12px" }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(255,179,0,0.4)")}
                        onBlur={(e)  => (e.target.style.borderColor = BORDER)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── BIO / PITCH ── */}
          <div className="app-surface" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: "clamp(20px,5%,28px)" }}>
            <SectionLabel optional>Pitch</SectionLabel>

            {/* Quick templates */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginBottom: 8 }}>Quick templates — click to use, then edit:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  {
                    tag: "Professional",
                    text: "Experienced in commercial and narrative production across formats. Known for strong communication on set and consistent results under tight deadlines. Available for local and out-of-town productions.",
                  },
                  {
                    tag: "Specialist",
                    text: "Specialist with a strong reel across branded content, feature films, and online productions. I bring both technical precision and a strong creative eye to every project. My work speaks for itself — links above.",
                  },
                  {
                    tag: "Fresh talent",
                    text: "Emerging talent passionate about visual storytelling. Trained and actively building a professional reel. Fast learner, strong work ethic, and ready for the right first credit. Let's talk.",
                  },
                ].map(({ tag, text }) => (
                  <button key={tag} type="button"
                    onClick={() => setBio(text)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10,
                      background: "#080808", border: `1px solid ${BORDER}`,
                      cursor: "pointer", textAlign: "left", transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,179,0,0.3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}>
                    <span style={{ fontFamily: FT, fontSize: 11, fontWeight: 700, color: AMBER, background: "rgba(255,204,0,0.08)", padding: "2px 7px", borderRadius: 6, flexShrink: 0 }}>
                      {tag}
                    </span>
                    <span style={{ fontFamily: FT, fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {text.slice(0, 72)}…
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Field>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5}
                placeholder="Short, sharp, specific. What makes you the right person for the job?"
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65, minHeight: 110 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,179,0,0.4)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = BORDER)} />
            </Field>
          </div>

          {/* ── CONTACT DETAILS ── */}
          <div className="app-surface" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: "clamp(20px,5%,28px)" }}>
            <SectionLabel optional>Contact</SectionLabel>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, padding: "12px 14px", borderRadius: 12, background: "rgba(50,215,75,0.05)", border: "1px solid rgba(50,215,75,0.14)" }}>
              <Lock size={14} style={{ color: "#32D74B", marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontFamily: FT, fontSize: 13, color: "rgba(240,237,229,0.6)", lineHeight: 1.55 }}>
                <strong style={{ color: TEXT, fontWeight: 600 }}>Private.</strong>{" "}
                Shared only after you accept a project request.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Phone number">
                <FocusInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" />
              </Field>
              <Field label="Contact email">
                <FocusInput type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="your@email.com" />
              </Field>
              <div className="responsive-two">
                <Field label="Viber">
                  <FocusInput type="tel" value={viber} onChange={(e) => setViber(e.target.value)} placeholder="+63 9XX XXX XXXX" />
                </Field>
                <Field label="WhatsApp">
                  <FocusInput type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+63 9XX XXX XXXX" />
                </Field>
              </div>
            </div>
          </div>

          {/* ── Submit ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
            {errors.submit && (
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)" }}>
                <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A" }}>{errors.submit}</p>
              </div>
            )}

            <button onClick={handleCrewSubmit} disabled={saving}
              className="transition-all hover:opacity-85 active:scale-[0.98]"
              style={{
                width: "100%", height: 56, borderRadius: 16, border: "none",
                background: saving ? "rgba(255,179,0,0.5)" : AMBER,
                color: "#000", fontFamily: FT, fontSize: 16, fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 24px rgba(255,179,0,0.22)",
              }}>
              {saving ? "Creating…" : <><Check size={17} /> Publish card</>}
            </button>

            <button onClick={() => router.push("/dashboard")} disabled={saving}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: FT, fontSize: 13, color: "rgba(255,255,255,0.28)", padding: "6px 0" }}
              className="hover:text-white/50 transition-colors">
              Skip
            </button>
          </div>

          <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.7, paddingBottom: 8 }}>
            Public card. Private contact.
          </p>

        </div>
      </div>
    </div>
  );
}
