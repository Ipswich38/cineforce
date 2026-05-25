"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ROLES, EXPERIENCE_LEVELS, AVAILABILITY, PH_LOCATIONS, PROJECT_TYPES, RATE_UNITS, EQUIPMENT_CATEGORIES } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, Film } from "lucide-react";

const FONT_DISPLAY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FONT_TEXT    = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const STEPS = ["Account", "About", "Equipment", "Credits", "Contact"];

const inputCls = `w-full rounded-xl px-4 py-3 text-[15px] outline-none transition-all focus:ring-2 focus:ring-blue-500/20`;
const inputStyle = { border: "1px solid rgba(0,0,0,0.12)", background: "#F5F5F7", color: "#1C1C1E", fontFamily: FONT_TEXT } as const;

const SPECIALIZATIONS_BY_ROLE: Record<string, string[]> = {
  director:         ["Narrative Film", "Commercial / TVC", "Music Video", "Documentary", "Short Film", "Online Content"],
  dp:               ["Narrative Film", "Commercial / TVC", "Music Video", "Documentary", "ENG/News", "Live Event"],
  camera_op:        ["Studio", "ENG/News", "Steadicam", "Drone", "Multi-camera"],
  gaffer:           ["Studio Lighting", "Location Lighting", "Practical Lighting", "LED / DMX"],
  sound_mixer:      ["Production Sound", "Post Production", "Live Sound", "ADR", "Foley"],
  editor:           ["Drama Series", "Film", "Commercial", "Documentary", "Music Video", "Online Content"],
  colorist:         ["Film", "TV Series", "Commercial", "Music Video", "DIT On-Set"],
  prod_designer:    ["Film", "TV Series", "Commercial", "Music Video"],
  art_director:     ["Film", "TV Series", "Commercial"],
  mua:              ["Film / TV", "Commercial", "Fashion", "Special Effects", "Wedding"],
  wardrobe:         ["Film / TV", "Commercial", "Fashion", "Period / Costume"],
  ad:               ["Film", "TV Series", "Commercial", "Live Event"],
  prod_manager:     ["Film", "TV Series", "Commercial", "Live Event"],
  script_supervisor:["Film", "TV Series", "Commercial"],
  vfx:              ["Motion Graphics", "3D VFX", "Compositing", "Title Design"],
  pa:               ["Film", "TV Series", "Commercial", "Live Event"],
};

export default function JoinPage() {
  const router = useRouter();
  const [step,   setStep]   = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Step 0: Account
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  // Step 1: About
  const [displayName,      setDisplayName]      = useState("");
  const [bio,              setBio]              = useState("");
  const [role,             setRole]             = useState("");
  const [specializations,  setSpecializations]  = useState<string[]>([]);
  const [experienceLevel,  setExperienceLevel]  = useState("mid");
  const [city,             setCity]             = useState("");
  const [availability,     setAvailability]     = useState("available");
  const [rateMin,          setRateMin]          = useState("");
  const [rateMax,          setRateMax]          = useState("");
  const [rateUnit,         setRateUnit]         = useState("day");
  const [showreelUrl,      setShowreelUrl]      = useState("");
  const [portfolioUrl,     setPortfolioUrl]     = useState("");

  // Step 2: Equipment
  const [equipment, setEquipment] = useState<{ name: string; description: string; category: string }[]>([]);

  // Step 3: Credits
  const [credits, setCredits] = useState<{ project_title: string; role: string; year: string; type: string; network_studio: string }[]>([]);

  // Step 4: Contact
  const [phone,     setPhone]     = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [facebook,  setFacebook]  = useState("");

  function toggleSpec(s: string) {
    setSpecializations((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  async function handleFinish() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user }, error: authErr } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });

    if (authErr || !user) {
      setErrors({ account: authErr?.message ?? "Sign up failed." });
      setStep(0); setSaving(false); return;
    }

    const slug = displayName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Math.random().toString(36).slice(2, 6);

    const { error: profileErr } = await supabase.from("profiles").insert({
      id: user.id, slug,
      display_name: displayName, bio: bio || null, role,
      specializations, experience_level: experienceLevel,
      city, availability,
      rate_min: rateMin ? Number(rateMin) : null,
      rate_max: rateMax ? Number(rateMax) : null,
      rate_unit: rateUnit,
      showreel_url: showreelUrl || null,
      portfolio_url: portfolioUrl || null,
    });

    if (profileErr) { setErrors({ submit: profileErr.message }); setSaving(false); return; }

    if (equipment.length > 0) {
      await supabase.from("equipment").insert(equipment.filter((e) => e.name).map((e) => ({ profile_id: user.id, ...e })));
    }

    if (credits.length > 0) {
      await supabase.from("credits").insert(credits.filter((c) => c.project_title).map((c) => ({
        profile_id: user.id, ...c, year: c.year ? Number(c.year) : null,
      })));
    }

    await supabase.from("contact_details").insert({
      id: user.id, phone: phone || null, email: contactEmail || null, facebook_url: facebook || null,
    });

    router.push("/dashboard?welcome=1");
  }

  function validateAndNext() {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!email) e.email = "Required";
      if (!password || password.length < 6) e.password = "Min 6 characters";
    }
    if (step === 1) {
      if (!displayName.trim()) e.displayName = "Required";
      if (!role) e.role = "Required";
      if (!city) e.city = "Required";
    }
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    if (step === STEPS.length - 1) handleFinish();
    else setStep((s) => s + 1);
  }

  const specialOptions = role ? (SPECIALIZATIONS_BY_ROLE[role] ?? []) : [];

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh" }}>
      {/* Nav */}
      <div className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, color: "#1C1C1E", letterSpacing: "-0.02em" }}>
          <ArrowLeft size={18} style={{ color: "#AEAEB2" }} />
          SetReady
        </Link>
      </div>

      <div className="max-w-[580px] mx-auto px-6 pb-16">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className="flex items-center justify-center rounded-full text-[11px] font-bold shrink-0"
                style={{
                  width: 24, height: 24,
                  background: i < step ? "#34C759" : i === step ? "#007AFF" : "#E5E5EA",
                  color: i <= step ? "#fff" : "#AEAEB2",
                }}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span style={{ fontFamily: FONT_TEXT, fontSize: 12, color: i === step ? "#1C1C1E" : "#AEAEB2", fontWeight: i === step ? 600 : 400 }}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)", margin: "0 4px" }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

          {/* Step 0: Account */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, color: "#1C1C1E", letterSpacing: "-0.02em", marginBottom: 6 }}>Create your account</h1>
                <p style={{ fontFamily: FONT_TEXT, fontSize: 15, color: "#6D6D72" }}>You'll use this to sign in and manage your profile.</p>
              </div>
              {errors.account && <p style={{ color: "#FF3B30", fontSize: 13, fontFamily: FONT_TEXT }}>{errors.account}</p>}
              <div>
                <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 6 }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputCls} style={inputStyle} />
                {errors.email && <p style={{ color: "#FF3B30", fontSize: 12, marginTop: 4, fontFamily: FONT_TEXT }}>{errors.email}</p>}
              </div>
              <div>
                <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 6 }}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className={inputCls} style={inputStyle} />
                {errors.password && <p style={{ color: "#FF3B30", fontSize: 12, marginTop: 4, fontFamily: FONT_TEXT }}>{errors.password}</p>}
              </div>
            </div>
          )}

          {/* Step 1: About */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, color: "#1C1C1E", letterSpacing: "-0.02em", marginBottom: 6 }}>About you</h2>
                <p style={{ fontFamily: FONT_TEXT, fontSize: 15, color: "#6D6D72" }}>This is what clients will see on your public profile.</p>
              </div>

              <div>
                <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 6 }}>Full name *</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className={inputCls} style={inputStyle} />
                {errors.displayName && <p style={{ color: "#FF3B30", fontSize: 12, marginTop: 4, fontFamily: FONT_TEXT }}>{errors.displayName}</p>}
              </div>

              <div>
                <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 8 }}>Your role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button key={r.id} type="button" onClick={() => { setRole(r.id); setSpecializations([]); }}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all"
                      style={{
                        border: `1px solid ${role === r.id ? "#007AFF" : "rgba(0,0,0,0.09)"}`,
                        background: role === r.id ? "rgba(0,122,255,0.07)" : "#F5F5F7",
                        color: role === r.id ? "#007AFF" : "#1C1C1E",
                      }}>
                      <span style={{ fontSize: 18 }}>{r.icon}</span>
                      <span style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500 }}>{r.label}</span>
                    </button>
                  ))}
                </div>
                {errors.role && <p style={{ color: "#FF3B30", fontSize: 12, marginTop: 4, fontFamily: FONT_TEXT }}>{errors.role}</p>}
              </div>

              {specialOptions.length > 0 && (
                <div>
                  <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 8 }}>Specializations</label>
                  <div className="flex flex-wrap gap-2">
                    {specialOptions.map((s) => (
                      <button key={s} type="button" onClick={() => toggleSpec(s)}
                        className="rounded-full px-3 py-1.5 text-[13px] transition-all"
                        style={{
                          border: `1px solid ${specializations.includes(s) ? "#007AFF" : "rgba(0,0,0,0.10)"}`,
                          background: specializations.includes(s) ? "rgba(0,122,255,0.08)" : "#F5F5F7",
                          color: specializations.includes(s) ? "#007AFF" : "#6D6D72",
                          fontFamily: FONT_TEXT, fontWeight: 500,
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 6 }}>Location *</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} style={inputStyle}>
                    <option value="">Select city</option>
                    {PH_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errors.city && <p style={{ color: "#FF3B30", fontSize: 12, marginTop: 4, fontFamily: FONT_TEXT }}>{errors.city}</p>}
                </div>
                <div>
                  <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 6 }}>Experience</label>
                  <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className={inputCls} style={inputStyle}>
                    {EXPERIENCE_LEVELS.map((e) => <option key={e.id} value={e.id}>{e.label} ({e.desc})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 8 }}>Availability</label>
                <div className="flex gap-2">
                  {AVAILABILITY.map((a) => (
                    <button key={a.id} type="button" onClick={() => setAvailability(a.id)}
                      className="flex-1 rounded-xl py-2.5 text-[13px] font-medium transition-all"
                      style={{
                        border: `1px solid ${availability === a.id ? a.color : "rgba(0,0,0,0.09)"}`,
                        background: availability === a.id ? `${a.color}12` : "#F5F5F7",
                        color: availability === a.id ? a.color : "#6D6D72",
                        fontFamily: FONT_TEXT,
                      }}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 6 }}>Day rate (₱) — optional</label>
                <div className="flex gap-2">
                  <input type="number" value={rateMin} onChange={(e) => setRateMin(e.target.value)} placeholder="Min" className={inputCls} style={inputStyle} />
                  <input type="number" value={rateMax} onChange={(e) => setRateMax(e.target.value)} placeholder="Max" className={inputCls} style={inputStyle} />
                  <select value={rateUnit} onChange={(e) => setRateUnit(e.target.value)} className={inputCls} style={{ ...inputStyle, minWidth: 100 }}>
                    {RATE_UNITS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 6 }}>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  placeholder="Tell clients about your style, experience, and what you bring to a production."
                  className={inputCls} style={{ ...inputStyle, resize: "none", lineHeight: 1.55 }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 6 }}>Showreel URL</label>
                  <input type="url" value={showreelUrl} onChange={(e) => setShowreelUrl(e.target.value)} placeholder="YouTube / Vimeo" className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 6 }}>Portfolio URL</label>
                  <input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://…" className={inputCls} style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Equipment */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, color: "#1C1C1E", letterSpacing: "-0.02em", marginBottom: 6 }}>Your equipment</h2>
                <p style={{ fontFamily: FONT_TEXT, fontSize: 15, color: "#6D6D72" }}>List gear you own and can bring to set. Skip if not applicable.</p>
              </div>
              {equipment.map((eq, i) => (
                <div key={i} className="rounded-2xl p-4 flex flex-col gap-3 relative" style={{ background: "#F5F5F7", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <button type="button" onClick={() => setEquipment((prev) => prev.filter((_, j) => j !== i))}
                    style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "#FF3B30" }}>
                    <Trash2 size={15} />
                  </button>
                  <input type="text" placeholder="Equipment name *" value={eq.name} onChange={(e) => setEquipment((prev) => prev.map((item, j) => j === i ? { ...item, name: e.target.value } : item))}
                    className={inputCls} style={inputStyle} />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={eq.category} onChange={(e) => setEquipment((prev) => prev.map((item, j) => j === i ? { ...item, category: e.target.value } : item))}
                      className={inputCls} style={inputStyle}>
                      <option value="">Category</option>
                      {EQUIPMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" placeholder="Notes (optional)" value={eq.description} onChange={(e) => setEquipment((prev) => prev.map((item, j) => j === i ? { ...item, description: e.target.value } : item))}
                      className={inputCls} style={inputStyle} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setEquipment((prev) => [...prev, { name: "", description: "", category: "" }])}
                className="flex items-center justify-center gap-2 rounded-xl py-3 transition-all hover:opacity-80"
                style={{ border: "1.5px dashed rgba(0,122,255,0.3)", background: "rgba(0,122,255,0.04)", color: "#007AFF", fontFamily: FONT_TEXT, fontSize: 14, fontWeight: 500 }}>
                <Plus size={16} /> Add equipment item
              </button>
            </div>
          )}

          {/* Step 3: Credits */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, color: "#1C1C1E", letterSpacing: "-0.02em", marginBottom: 6 }}>Past work</h2>
                <p style={{ fontFamily: FONT_TEXT, fontSize: 15, color: "#6D6D72" }}>Add productions you&apos;ve worked on. Skip if you&apos;re just starting out.</p>
              </div>
              {credits.map((cr, i) => (
                <div key={i} className="rounded-2xl p-4 flex flex-col gap-3 relative" style={{ background: "#F5F5F7", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <button type="button" onClick={() => setCredits((prev) => prev.filter((_, j) => j !== i))}
                    style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "#FF3B30" }}>
                    <Trash2 size={15} />
                  </button>
                  <input type="text" placeholder="Project title *" value={cr.project_title} onChange={(e) => setCredits((prev) => prev.map((item, j) => j === i ? { ...item, project_title: e.target.value } : item))}
                    className={inputCls} style={inputStyle} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Your role" value={cr.role} onChange={(e) => setCredits((prev) => prev.map((item, j) => j === i ? { ...item, role: e.target.value } : item))}
                      className={inputCls} style={inputStyle} />
                    <input type="text" placeholder="Network / Studio" value={cr.network_studio} onChange={(e) => setCredits((prev) => prev.map((item, j) => j === i ? { ...item, network_studio: e.target.value } : item))}
                      className={inputCls} style={inputStyle} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Year" value={cr.year} onChange={(e) => setCredits((prev) => prev.map((item, j) => j === i ? { ...item, year: e.target.value } : item))}
                      className={inputCls} style={inputStyle} />
                    <select value={cr.type} onChange={(e) => setCredits((prev) => prev.map((item, j) => j === i ? { ...item, type: e.target.value } : item))}
                      className={inputCls} style={inputStyle}>
                      <option value="">Type</option>
                      {PROJECT_TYPES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setCredits((prev) => [...prev, { project_title: "", role: "", year: "", type: "", network_studio: "" }])}
                className="flex items-center justify-center gap-2 rounded-xl py-3 transition-all hover:opacity-80"
                style={{ border: "1.5px dashed rgba(0,122,255,0.3)", background: "rgba(0,122,255,0.04)", color: "#007AFF", fontFamily: FONT_TEXT, fontSize: 14, fontWeight: 500 }}>
                <Plus size={16} /> Add production credit
              </button>
            </div>
          )}

          {/* Step 4: Contact */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, color: "#1C1C1E", letterSpacing: "-0.02em", marginBottom: 6 }}>Contact details</h2>
                <p style={{ fontFamily: FONT_TEXT, fontSize: 15, color: "#6D6D72" }}>
                  These are <strong>hidden from the public.</strong> Only revealed to clients you accept connection requests from.
                </p>
              </div>
              {errors.submit && <p style={{ color: "#FF3B30", fontSize: 13, fontFamily: FONT_TEXT }}>{errors.submit}</p>}
              <div>
                <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 6 }}>Phone number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 6 }}>Email (contact email)</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="your@email.com" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E", display: "block", marginBottom: 6 }}>Facebook profile (optional)</label>
                <input type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/…" className={inputCls} style={inputStyle} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 transition-all hover:opacity-70"
                style={{ padding: "12px 20px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)", background: "#F5F5F7", color: "#6D6D72", fontFamily: FONT_TEXT, fontSize: 15 }}>
                <ArrowLeft size={15} /> Back
              </button>
            )}
            <button type="button" onClick={validateAndNext} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 transition-all hover:opacity-85 active:scale-[0.98]"
              style={{
                padding: "13px", borderRadius: 14, border: "none",
                background: saving ? "rgba(0,122,255,0.5)" : "#007AFF",
                color: "#fff", fontFamily: FONT_TEXT, fontSize: 16, fontWeight: 500,
                boxShadow: "0 4px 16px rgba(0,122,255,0.2)",
              }}>
              {saving ? "Creating your profile…" : step === STEPS.length - 1 ? (
                <><Check size={16} /> Create Profile</>
              ) : (
                <>Next <ArrowRight size={15} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
