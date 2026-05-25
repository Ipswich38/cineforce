export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { ROLES, EXPERIENCE_LEVELS, AVAILABILITY, PROJECT_TYPES } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import ConnectButton from "./ConnectButton";
import { MapPin, ArrowLeft, Package, Clapperboard, ExternalLink } from "lucide-react";

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

const AVATAR_COLORS  = ["#0F1A2E", "#1A0F2E", "#2E0F0F", "#0F2E1A", "#1A2E0F", "#2E1A0F"];
const AVATAR_ACCENTS = ["#4A9EFF", "#AF52DE", "#FF453A", "#32D74B", "#A8D934", "#FF9F0A"];

export default async function CrewProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!profile) notFound();

  const [{ data: equipment }, { data: credits }] = await Promise.all([
    supabase.from("equipment").select("*").eq("profile_id", profile.id).order("created_at"),
    supabase.from("credits").select("*").eq("profile_id", profile.id).order("year", { ascending: false }),
  ]);

  let existingRequest = null;
  if (user) {
    const { data } = await supabase
      .from("connection_requests")
      .select("id, status")
      .eq("client_id", user.id)
      .eq("crew_id", profile.id)
      .single();
    existingRequest = data;
  }

  let contactDetails = null;
  if (user && existingRequest?.status === "accepted") {
    const { data } = await supabase.from("contact_details").select("*").eq("id", profile.id).single();
    contactDetails = data;
  }

  const roleLabel   = ROLES.find((r) => r.id === profile.role)?.label ?? profile.role;
  const roleIcon    = ROLES.find((r) => r.id === profile.role)?.icon ?? "🎬";
  const expLabel    = EXPERIENCE_LEVELS.find((e) => e.id === profile.experience_level)?.label ?? profile.experience_level;
  const availConfig = AVAILABILITY.find((a) => a.id === profile.availability);
  const initials    = profile.display_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const idx         = profile.display_name.charCodeAt(0) % AVATAR_COLORS.length;
  const avatarBg    = AVATAR_COLORS[idx];
  const avatarAccent = AVATAR_ACCENTS[idx];

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: "rgba(12,12,15,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 40 }}>
        <div className="max-w-[860px] mx-auto px-6 flex items-center justify-between" style={{ height: 52 }}>
          <Link href="/search" className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ fontFamily: FT, fontSize: 14, color: MUTED }}>
            <ArrowLeft size={16} />
            Search
          </Link>
          <div className="flex items-center gap-2">
            <Clapperboard size={15} style={{ color: AMBER }} strokeWidth={2} />
            <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT, letterSpacing: "-0.02em" }}>SetReady</span>
          </div>
          <div style={{ width: 64 }} />
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 py-10">
        {/* Profile header card */}
        <div className="rounded-3xl overflow-hidden mb-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          {/* Accent bar */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${avatarAccent}, rgba(255,179,0,0.3), transparent)` }} />

          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Avatar */}
              <div className="flex items-center justify-center rounded-2xl text-[22px] font-bold select-none shrink-0"
                style={{ width: 80, height: 80, background: avatarBg, color: avatarAccent, border: `1px solid ${avatarAccent}30` }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover rounded-2xl" />
                  : initials}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2rem)", color: TEXT, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
                      {profile.display_name}
                    </h1>
                    <p style={{ fontFamily: FT, fontSize: 16, color: MUTED, marginTop: 5 }}>
                      <span style={{ marginRight: 6 }}>{roleIcon}</span>{roleLabel}
                    </p>
                  </div>

                  {availConfig && (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{
                      background: `${availConfig.color}14`,
                      border: `1px solid ${availConfig.color}35`,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: availConfig.color, display: "inline-block" }} />
                      <span style={{ fontSize: 13, fontFamily: FT, fontWeight: 500, color: availConfig.color }}>
                        {availConfig.label}
                      </span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} style={{ color: MUTED, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: MUTED, fontFamily: FT }}>{profile.city}</span>
                  </span>
                  <span style={{ color: DIVIDER }}>·</span>
                  <span style={{ fontSize: 14, color: MUTED, fontFamily: FT }}>{expLabel}</span>
                  {profile.rate_min && (
                    <>
                      <span style={{ color: DIVIDER }}>·</span>
                      <span style={{ fontSize: 14, color: MUTED, fontFamily: FT }}>
                        ₱{profile.rate_min.toLocaleString()}
                        {profile.rate_max ? `–${profile.rate_max.toLocaleString()}` : "+"}/{profile.rate_unit ?? "day"}
                      </span>
                    </>
                  )}
                </div>

                {profile.specializations?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {profile.specializations.map((s: string) => (
                      <span key={s} style={{
                        fontSize: 12, fontFamily: FT, fontWeight: 500,
                        background: `${avatarAccent}12`, color: avatarAccent,
                        padding: "3px 10px", borderRadius: 20,
                        border: `1px solid ${avatarAccent}20`,
                      }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="mt-6 pt-6" style={{ borderTop: `1px solid ${DIVIDER}`, fontFamily: FT, fontSize: 15, color: "rgba(240,237,229,0.65)", lineHeight: 1.65 }}>
                {profile.bio}
              </p>
            )}

            {(profile.showreel_url || profile.portfolio_url) && (
              <div className="flex flex-wrap gap-2 mt-5">
                {profile.showreel_url && (
                  <a href={profile.showreel_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-80"
                    style={{ background: `${avatarAccent}10`, border: `1px solid ${avatarAccent}20`, fontFamily: FT, fontSize: 13, fontWeight: 500, color: avatarAccent }}>
                    <Clapperboard size={14} /> View Showreel <ExternalLink size={11} style={{ opacity: 0.6 }} />
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
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {equipment && equipment.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                <h2 className="flex items-center gap-2 mb-5" style={{ fontFamily: FD, fontWeight: 600, fontSize: 17, color: TEXT }}>
                  <Package size={17} style={{ color: avatarAccent }} /> Equipment
                </h2>
                <div className="flex flex-col">
                  {equipment.map((eq: { id: string; name: string; description?: string; category?: string }) => (
                    <div key={eq.id} className="flex items-start justify-between gap-4 py-3"
                      style={{ borderBottom: `1px solid ${DIVIDER}` }}>
                      <div>
                        <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>{eq.name}</p>
                        {eq.description && (
                          <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 2 }}>{eq.description}</p>
                        )}
                      </div>
                      {eq.category && (
                        <span style={{ fontSize: 11, fontFamily: FT, color: MUTED, flexShrink: 0, paddingTop: 2 }}>{eq.category}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {credits && credits.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                <h2 className="flex items-center gap-2 mb-5" style={{ fontFamily: FD, fontWeight: 600, fontSize: 17, color: TEXT }}>
                  <Clapperboard size={17} style={{ color: avatarAccent }} /> Past Work
                </h2>
                <div className="flex flex-col">
                  {credits.map((credit: { id: string; project_title: string; role: string; year?: number; type?: string; network_studio?: string }) => (
                    <div key={credit.id} className="py-3" style={{ borderBottom: `1px solid ${DIVIDER}` }}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>{credit.project_title}</p>
                          <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginTop: 2 }}>{credit.role}</p>
                          {credit.network_studio && (
                            <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{credit.network_studio}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {credit.year && (
                            <span style={{ fontSize: 13, fontFamily: FT, color: MUTED }}>{credit.year}</span>
                          )}
                          {credit.type && (
                            <span style={{
                              fontSize: 11, fontFamily: FT, fontWeight: 500,
                              background: `${avatarAccent}12`, color: avatarAccent,
                              padding: "2px 8px", borderRadius: 20,
                              border: `1px solid ${avatarAccent}20`,
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

          {/* Sidebar: Connect */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-5 sticky top-[68px]" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <ConnectButton
                crewId={profile.id}
                crewName={profile.display_name}
                isOwn={user?.id === profile.id}
                existingRequest={existingRequest}
                contactDetails={contactDetails}
                isLoggedIn={!!user}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
