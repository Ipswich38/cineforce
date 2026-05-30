export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { ROLES, PROJECT_TYPES } from "@/lib/constants";
import { isSubscriptionActive } from "@/lib/subscription";
import { notFound } from "next/navigation";
import Link from "next/link";
import ConnectButton from "./ConnectButton";
import { MapPin, ArrowLeft, Package, Clapperboard, ExternalLink, UserCircle } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";
import BrandMark from "@/components/BrandMark";
import { publicCrewInitials, publicCrewName } from "@/lib/publicName";

const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';

const BG      = "#000000";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const TEAL    = "#2CC0C8";
const BORDER  = "rgba(255,255,255,0.07)";
const DIVIDER = "rgba(255,255,255,0.05)";

const AVATAR_COLORS  = ["#0F1A2E", "#1A0F2E", "#2E0F0F", "#0F2E1A", "#1A2E0F", "#2E1A0F"];
const AVATAR_ACCENTS = ["#4A9EFF", "#AF52DE", "#FF453A", "#32D74B", "#A8D934", "#FF9F0A"];
const EXPERIENCE_YEARS: Record<string, number> = {
  entry: 1,
  mid: 4,
  senior: 9,
  expert: 13,
};

function experienceYears(level: string) {
  return EXPERIENCE_YEARS[level] ?? 1;
}

function bioQuote(bio: string | null) {
  const text = (bio ?? "").trim().replace(/\s+/g, " ");
  if (!text) return "Available for the right production.";
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] ?? text;
  return firstSentence.length > 112 ? `${firstSentence.slice(0, 109).trimEnd()}...` : firstSentence;
}

type Profile = {
  id: string; slug: string; display_name: string; avatar_url: string | null;
  role: string; specializations: string[]; experience_level: string;
  city: string; availability: string; rate_min: number | null; rate_max: number | null;
  rate_unit: string | null; bio: string | null; showreel_url?: string | null; portfolio_url?: string | null;
  premium_status: string;
};

export default async function CrewProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let profile: Profile | null = null;
  let equipment: { id: string; name: string; description?: string; category?: string }[] = [];
  let credits: { id: string; project_title: string; role: string; year?: number; type?: string; network_studio?: string }[] = [];
  let existingRequest: { id: string; status: string } | null = null;
  let contactDetails: { phone?: string; email?: string; facebook_url?: string } | null = null;
  let user: { id: string } | null = null;

  try {
    const supabase = await createClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*,profile_specializations(name)")
      .eq("slug", slug)
      .single();

    if (profileData) {
      profile = {
        ...profileData,
        specializations: (profileData.profile_specializations as { name: string }[] ?? []).map((s) => s.name),
      } as unknown as Profile;

      const pid = profileData.id as string;
      const [{ data: eq }, { data: cr }] = await Promise.all([
        supabase.from("equipment").select("*").eq("profile_id", pid).order("created_at"),
        supabase.from("credits").select("*").eq("profile_id", pid).order("year", { ascending: false }),
      ]);
      equipment = (eq ?? []) as typeof equipment;
      credits = (cr ?? []) as typeof credits;

      if (user) {
        const [{ data: reqData }] = await Promise.all([
          supabase
            .from("connection_requests")
            .select("id, status")
            .eq("client_id", user.id)
            .eq("crew_id", pid)
            .single(),
        ]);
        existingRequest = reqData;
      }

      if (user && existingRequest?.status === "accepted") {
        const { data } = await supabase.from("contact_details").select("*").eq("id", pid).single();
        contactDetails = data;
      }
    }
  } catch {
    // Supabase not configured — fall back to sample profiles
  }

  if (!profile) notFound();

  const roleLabel   = ROLES.find((r) => r.id === profile.role)?.label ?? profile.role;
  const publicName  = publicCrewName(profile.display_name);
  const initials    = publicCrewInitials(profile.display_name);
  const projectsMade = credits.length;
  const yearsExp = experienceYears(profile.experience_level);
  const quote = bioQuote(profile.bio);
  const handle = `@${profile.slug}`;

  const idx         = profile.display_name.charCodeAt(0) % AVATAR_COLORS.length;
  const avatarBg    = AVATAR_COLORS[idx];
  const avatarAccent = AVATAR_ACCENTS[idx];

  return (
    <div className="mobile-nav-pad" style={{ background: BG, minHeight: "100dvh" }}>
      {/* Nav */}
      <div style={{ background: "rgba(12,12,15,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 40, paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="app-container-narrow topbar-inner">
          <Link href="/search" className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ fontFamily: FT, fontSize: 14, color: MUTED }}>
            <ArrowLeft size={16} />
            Find
          </Link>
          <div className="flex items-center gap-2">
            <BrandMark size={22} />
            <BrandLockup size={16} />
          </div>
          <div style={{ width: 64 }} />
        </div>
      </div>

      <div className="app-container-narrow" style={{ paddingBottom: "clamp(56px,8vw,88px)" }}>

        {/* ── Profile showcase card ── */}
        <div className="app-surface overflow-hidden mb-4" style={{ background: "#050505", border: `1px solid ${BORDER}`, boxShadow: "0 18px 60px rgba(0,0,0,0.35)" }}>
          <div style={{ position: "relative", width: "100%", minHeight: 620, display: "flex", flexDirection: "column" }}>
            <div style={{ position: "relative", flex: "1 1 60%", minHeight: 360, background: avatarBg, overflow: "hidden" }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={publicName} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, fontWeight: 700, color: avatarAccent, fontFamily: FD }}>{initials}</div>
              }
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.2) 52%, rgba(0,0,0,0.5) 100%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "46%", background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.64) 45%, rgba(0,0,0,0.9) 100%)" }} />
            </div>

            <div style={{ flex: "0 0 auto", background: "#050505", padding: "18px 18px 22px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(2rem, 6vw, 2.65rem)", lineHeight: 0.95, letterSpacing: "-0.04em", color: TEXT }}>
                    {publicName}
                  </h1>
                  <p style={{ fontFamily: FT, fontSize: 14, color: "rgba(255,255,255,0.72)", marginTop: 10 }}>
                    {handle}
                  </p>
                </div>
                <span style={{ fontFamily: FT, fontSize: 14, color: "rgba(255,255,255,0.78)", whiteSpace: "nowrap", marginTop: 3 }}>
                  See profile
                </span>
              </div>

              {quote && (
                <p style={{ fontFamily: FT, fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.55, marginTop: 16, maxWidth: 500 }}>
                  &ldquo;{quote}&rdquo;
                </p>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, marginTop: 18 }}>
                <div>
                  <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 28, lineHeight: 1, color: TEXT }}>{projectsMade}</p>
                  <p style={{ fontFamily: FT, fontSize: 13, color: "rgba(255,255,255,0.66)", marginTop: 5 }}>Projects Made</p>
                </div>
                <div>
                  <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 28, lineHeight: 1, color: TEXT }}>{yearsExp}</p>
                  <p style={{ fontFamily: FT, fontSize: 13, color: "rgba(255,255,255,0.66)", marginTop: 5 }}>Years Experience</p>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <ConnectButton
                  crewId={profile.id}
                  crewName={publicName}
                  crewSlug={profile.slug}
                  isOwn={user?.id === profile.id}
                  existingRequest={existingRequest}
                  contactDetails={contactDetails}
                  isLoggedIn={!!user}
                  isPremium={isSubscriptionActive(profile)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Info rows card ── */}
        <div className="app-surface overflow-hidden mb-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3" style={{ padding: "15px 18px", borderBottom: `1px solid ${BORDER}` }}>
            <UserCircle size={18} style={{ color: MUTED, flexShrink: 0 }} />
            <span style={{ fontFamily: FT, fontSize: 14, color: TEXT }}>{roleLabel}</span>
          </div>
          {profile.specializations?.length > 0 && (
            <div className="flex items-start gap-3" style={{ padding: "15px 18px", borderBottom: `1px solid ${BORDER}` }}>
              <Clapperboard size={18} style={{ color: MUTED, flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontFamily: FT, fontSize: 14, color: TEXT, lineHeight: 1.5 }}>
                {profile.specializations.join(", ")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3" style={{ padding: "15px 18px" }}>
            <MapPin size={18} style={{ color: MUTED, flexShrink: 0 }} />
            <span style={{ fontFamily: FT, fontSize: 14, color: TEXT }}>{profile.city}</span>
            {profile.rate_min && (
              <span style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginLeft: "auto" }}>
                ₱{profile.rate_min.toLocaleString()}{profile.rate_max ? `–${profile.rate_max.toLocaleString()}` : "+"}/{profile.rate_unit ?? "day"}
              </span>
            )}
          </div>
        </div>

        {/* ── Bio card ── */}
        {profile.bio && (
          <div className="app-surface mb-4" style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: "20px 20px" }}>
            <h2 style={{ fontFamily: FD, fontWeight: 600, fontSize: 16, color: TEXT, marginBottom: 12 }}>Biography / Status</h2>
            <p style={{ fontFamily: FT, fontSize: 14, color: "rgba(240,237,229,0.65)", lineHeight: 1.7 }}>
              {profile.bio}
            </p>
          </div>
        )}

        {/* ── Links ── */}
        {(profile.showreel_url || profile.portfolio_url) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.showreel_url && (
              <a href={profile.showreel_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-80"
                style={{ background: `${avatarAccent}10`, border: `1px solid ${avatarAccent}20`, fontFamily: FT, fontSize: 13, fontWeight: 500, color: avatarAccent }}>
                <Clapperboard size={14} /> Reel <ExternalLink size={11} style={{ opacity: 0.6 }} />
              </a>
            )}
            {profile.portfolio_url && (
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, fontFamily: FT, fontSize: 13, fontWeight: 500, color: TEXT }}>
                <ExternalLink size={14} style={{ color: MUTED }} /> Portfolio
              </a>
            )}
          </div>
        )}

        {/* ── Equipment ── */}
        {equipment && equipment.length > 0 && (
          <div className="app-surface p-6 mb-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <h2 className="flex items-center gap-2 mb-5" style={{ fontFamily: FD, fontWeight: 600, fontSize: 16, color: TEXT }}>
              <Package size={16} style={{ color: avatarAccent }} /> Kit
            </h2>
            <div className="flex flex-col">
              {equipment.map((eq: { id: string; name: string; description?: string; category?: string }) => (
                <div key={eq.id} className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: `1px solid ${DIVIDER}` }}>
                  <div>
                    <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>{eq.name}</p>
                    {eq.description && <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 2 }}>{eq.description}</p>}
                  </div>
                  {eq.category && <span style={{ fontSize: 11, fontFamily: FT, color: MUTED, flexShrink: 0, paddingTop: 2 }}>{eq.category}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Full credits list ── */}
        {credits && credits.length > 0 && (
          <div className="app-surface p-6 mb-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <h2 className="flex items-center gap-2 mb-5" style={{ fontFamily: FD, fontWeight: 600, fontSize: 16, color: TEXT }}>
              <Clapperboard size={16} style={{ color: avatarAccent }} /> Credits
            </h2>
            <div className="flex flex-col">
              {credits.map((credit: { id: string; project_title: string; role: string; year?: number; type?: string; network_studio?: string }) => (
                <div key={credit.id} className="py-3" style={{ borderBottom: `1px solid ${DIVIDER}` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>{credit.project_title}</p>
                      <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 2 }}>{credit.role}</p>
                      {credit.network_studio && <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{credit.network_studio}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {credit.year && <span style={{ fontSize: 13, fontFamily: FT, color: MUTED }}>{credit.year}</span>}
                      {credit.type && (
                        <span style={{
                          fontSize: 11, fontFamily: FT, fontWeight: 500,
                          background: `${avatarAccent}12`, color: avatarAccent,
                          padding: "2px 8px", borderRadius: 20, border: `1px solid ${avatarAccent}20`,
                        }}>{PROJECT_TYPES.find((p) => p.id === credit.type)?.label ?? credit.type}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
