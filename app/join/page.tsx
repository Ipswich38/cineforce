"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, EXPERIENCE_LEVELS, AVAILABILITY, PH_LOCATIONS, RATE_UNITS } from "@/lib/constants";
import { ArrowLeft, Check, Clapperboard, Lock } from "lucide-react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#000000";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";

const SPEC_BY_ROLE: Record<string, string[]> = {
  director:          ["Narrative Film", "Commercial / TVC", "Music Video", "Documentary", "Short Film", "Online Content"],
  dp:                ["Narrative Film", "Commercial / TVC", "Music Video", "Documentary", "ENG/News", "Live Event"],
  camera_op:         ["Studio", "ENG/News", "Steadicam", "Drone", "Multi-camera"],
  gaffer:            ["Studio Lighting", "Location Lighting", "Practical Lighting", "LED / DMX"],
  sound_mixer:       ["Production Sound", "Post Production", "Live Sound", "ADR", "Foley"],
  editor:            ["Drama Series", "Film", "Commercial", "Documentary", "Music Video", "Online Content"],
  colorist:          ["Film", "TV Series", "Commercial", "Music Video", "DIT On-Set"],
  prod_designer:     ["Film", "TV Series", "Commercial", "Music Video"],
  art_director:      ["Film", "TV Series", "Commercial"],
  mua:               ["Film / TV", "Commercial", "Fashion", "Special Effects", "Wedding"],
  wardrobe:          ["Film / TV", "Commercial", "Fashion", "Period / Costume"],
  ad:                ["Film", "TV Series", "Commercial", "Live Event"],
  prod_manager:      ["Film", "TV Series", "Commercial", "Live Event"],
  script_supervisor: ["Film", "TV Series", "Commercial"],
  vfx:               ["Motion Graphics", "3D VFX", "Compositing", "Title Design"],
  pa:                ["Film", "TV Series", "Commercial", "Live Event"],
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

  const [checking, setChecking] = useState(true);
  const [userId,   setUserId]   = useState<string | null>(null);

  // Profile fields
  const [displayName,     setDisplayName]     = useState("");
  const [role,            setRole]            = useState("");
  const [city,            setCity]            = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [expLevel,        setExpLevel]        = useState("mid");
  const [availability,    setAvailability]    = useState("available");
  const [rateMin,         setRateMin]         = useState("");
  const [rateMax,         setRateMax]         = useState("");
  const [rateUnit,        setRateUnit]        = useState("day");
  const [bio,             setBio]             = useState("");
  const [showreelUrl,     setShowreelUrl]     = useState("");
  const [portfolioUrl,    setPortfolioUrl]    = useState("");
  const [phone,           setPhone]           = useState("");
  const [contactEmail,    setContactEmail]    = useState("");
  const [facebook,        setFacebook]        = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const sb = createClient();
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/auth?intent=join&next=/join");
        return;
      }
      setUserId(session.user.id);
      const name = (session.user.user_metadata?.name ?? session.user.user_metadata?.full_name ?? "") as string;
      if (name) setDisplayName(name);
      setChecking(false);
    });
  }, [router]);

  async function handleSubmit() {
    const e: Record<string, string> = {};
    if (!displayName.trim()) e.displayName = "Required";
    if (!role) e.role = "Pick your primary role";
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

    const { error: profileErr } = await sb.from("profiles").insert({
      id: userId, slug,
      display_name: displayName.trim(), bio: bio || null, role,
      specializations, experience_level: expLevel,
      city, availability,
      rate_min:  rateMin  ? Number(rateMin)  : null,
      rate_max:  rateMax  ? Number(rateMax)  : null,
      rate_unit: rateUnit,
      showreel_url:  showreelUrl  || null,
      portfolio_url: portfolioUrl || null,
    });

    if (profileErr) { setErrors({ submit: profileErr.message }); setSaving(false); return; }

    if (phone || contactEmail || facebook) {
      await sb.from("contact_details").insert({
        id: userId,
        phone:        phone        || null,
        email:        contactEmail || null,
        facebook_url: facebook     || null,
      });
    }

    router.push("/dashboard?welcome=1");
  }

  const specOptions = role ? (SPEC_BY_ROLE[role] ?? []) : [];
  const selectBase: React.CSSProperties = { ...inputStyle, appearance: "none" as const };

  if (checking) {
    return (
      <div style={{ background: BG, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${AMBER}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: "100dvh", display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <div className="app-container topbar-inner" style={{ justifyContent: "flex-start" }}>
        <Link href="/"
          style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED }}
          className="hover:opacity-70 transition-opacity">
          <ArrowLeft size={15} />
          <Clapperboard size={15} style={{ color: AMBER }} strokeWidth={2} />
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT, letterSpacing: "-0.02em" }}>YourNextCrew</span>
        </Link>
      </div>

      {/* Content */}
      <div className="app-container-form" style={{ flex: 1, paddingBlock: "clamp(12px,3vh,28px) clamp(56px,8vh,88px)" }}>

        {/* Header */}
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

              <Field label="Primary role *" error={errors.role}>
                <div className="responsive-two" style={{ gap: 8 }}>
                  {ROLES.map((r) => (
                    <button key={r.id} type="button"
                      onClick={() => { setRole(r.id); setSpecializations([]); if (errors.role) setErrors((p) => ({ ...p, role: "" })); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                        border: `1px solid ${role === r.id ? "rgba(255,179,0,0.4)" : BORDER}`,
                        background: role === r.id ? "rgba(255,179,0,0.08)" : "#080808",
                        color: role === r.id ? AMBER : MUTED,
                        fontFamily: FT, fontSize: 13, fontWeight: 500,
                        transition: "all 0.15s", textAlign: "left",
                      }}>
                      <span style={{ fontSize: 17, flexShrink: 0 }}>{r.icon}</span>
                      <span style={{ lineHeight: 1.3 }}>{r.label}</span>
                    </button>
                  ))}
                </div>
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

              <Field label="Rate (₱)" hint="Optional">
                <div className="mobile-stack" style={{ display: "flex", gap: 8 }}>
                  <FocusInput type="number" value={rateMin} onChange={(e) => setRateMin(e.target.value)} placeholder="Min" />
                  <FocusInput type="number" value={rateMax} onChange={(e) => setRateMax(e.target.value)} placeholder="Max" />
                  <select value={rateUnit} onChange={(e) => setRateUnit(e.target.value)} style={{ ...selectBase, minWidth: 90, flexShrink: 0 }}>
                    {RATE_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
              </Field>

              <div className="responsive-two">
                <Field label="Showreel URL">
                  <FocusInput type="url" value={showreelUrl} onChange={(e) => setShowreelUrl(e.target.value)} placeholder="YouTube / Vimeo" />
                </Field>
                <Field label="Portfolio URL">
                  <FocusInput type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://…" />
                </Field>
              </div>
            </div>
          </div>

          {/* ── BIO ── */}
          <div className="app-surface" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: "clamp(20px,5%,28px)" }}>
            <SectionLabel optional>Pitch</SectionLabel>
            <Field>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                placeholder="Short, sharp, specific."
                style={{ ...inputStyle, resize: "none", lineHeight: 1.65 }}
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
                Shared only after you accept.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Phone number">
                <FocusInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" />
              </Field>
              <Field label="Contact email">
                <FocusInput type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="your@email.com" />
              </Field>
              <Field label="Facebook profile URL">
                <FocusInput type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/…" />
              </Field>
            </div>
          </div>

          {/* ── Submit ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
            {errors.submit && (
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)" }}>
                <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A" }}>{errors.submit}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={saving}
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

          {/* Divider + Terms */}
          <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.7, paddingBottom: 8 }}>
            Public card. Private contact.
          </p>

        </div>
      </div>
    </div>
  );
}
