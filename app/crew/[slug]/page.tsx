export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { ROLES, EXPERIENCE_LEVELS, AVAILABILITY, PROJECT_TYPES } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import ConnectButton from "./ConnectButton";
import {
  MapPin, ArrowLeft, Briefcase, Camera, Mic2, Star,
  ExternalLink, Package, Clapperboard,
} from "lucide-react";

const FONT_DISPLAY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FONT_TEXT    = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

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

  // Check if current user already has a pending/accepted connection
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

  // Reveal contact only if accepted
  let contactDetails = null;
  if (user && existingRequest?.status === "accepted") {
    const { data } = await supabase.from("contact_details").select("*").eq("id", profile.id).single();
    contactDetails = data;
  }

  const roleLabel     = ROLES.find((r) => r.id === profile.role)?.label ?? profile.role;
  const roleIcon      = ROLES.find((r) => r.id === profile.role)?.icon ?? "🎬";
  const expLabel      = EXPERIENCE_LEVELS.find((e) => e.id === profile.experience_level)?.label ?? profile.experience_level;
  const availConfig   = AVAILABILITY.find((a) => a.id === profile.availability);
  const initials      = profile.display_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const AVATAR_COLORS = ["#5B8EF5", "#F5775B", "#34C759", "#AF52DE", "#FF9500", "#5AC8FA"];
  const avatarColor   = AVATAR_COLORS[profile.display_name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: "rgba(245,245,247,0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.07)", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="max-w-[800px] mx-auto px-6 flex items-center justify-between" style={{ height: 52 }}>
          <Link href="/search" className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
            style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#6D6D72" }}>
            <ArrowLeft size={16} />
            Search
          </Link>
          <Link href="/" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: "#1C1C1E", letterSpacing: "-0.02em" }}>
            SetReady
          </Link>
          <div style={{ width: 64 }} />
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-10">
        {/* Profile header */}
        <div className="rounded-3xl p-8 mb-5" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Avatar */}
            <div className="flex items-center justify-center rounded-2xl text-white text-[22px] font-bold select-none shrink-0"
              style={{ width: 80, height: 80, background: avatarColor }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover rounded-2xl" />
                : initials}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "#1C1C1E", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
                    {profile.display_name}
                  </h1>
                  <p style={{ fontFamily: FONT_TEXT, fontSize: 16, color: "#6D6D72", marginTop: 4 }}>
                    <span style={{ marginRight: 6 }}>{roleIcon}</span>{roleLabel}
                  </p>
                </div>

                {availConfig && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{
                    background: `${availConfig.color}14`,
                    border: `1px solid ${availConfig.color}30`,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: availConfig.color, display: "inline-block" }} />
                    <span style={{ fontSize: 13, fontFamily: FONT_TEXT, fontWeight: 500, color: availConfig.color }}>
                      {availConfig.label}
                    </span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} style={{ color: "#AEAEB2" }} />
                  <span style={{ fontSize: 14, color: "#6D6D72", fontFamily: FONT_TEXT }}>{profile.city}</span>
                </span>
                <span style={{ color: "rgba(0,0,0,0.15)" }}>·</span>
                <span style={{ fontSize: 14, color: "#6D6D72", fontFamily: FONT_TEXT }}>{expLabel}</span>
                {profile.rate_min && (
                  <>
                    <span style={{ color: "rgba(0,0,0,0.15)" }}>·</span>
                    <span style={{ fontSize: 14, color: "#6D6D72", fontFamily: FONT_TEXT }}>
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
                      fontSize: 12, fontFamily: FONT_TEXT, fontWeight: 500,
                      background: "rgba(0,122,255,0.07)", color: "#007AFF",
                      padding: "3px 10px", borderRadius: 20,
                    }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", fontFamily: FONT_TEXT, fontSize: 15, color: "#6D6D72", lineHeight: 1.65 }}>
              {profile.bio}
            </p>
          )}

          {/* Showreel / portfolio links */}
          {(profile.showreel_url || profile.portfolio_url) && (
            <div className="flex flex-wrap gap-2 mt-5">
              {profile.showreel_url && (
                <a href={profile.showreel_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-80"
                  style={{ background: "#F5F5F7", border: "1px solid rgba(0,0,0,0.08)", fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E" }}>
                  <Clapperboard size={14} style={{ color: "#007AFF" }} /> View Showreel <ExternalLink size={11} style={{ color: "#AEAEB2" }} />
                </a>
              )}
              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-80"
                  style={{ background: "#F5F5F7", border: "1px solid rgba(0,0,0,0.08)", fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500, color: "#1C1C1E" }}>
                  <ExternalLink size={14} style={{ color: "#007AFF" }} /> Portfolio
                </a>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {/* Equipment */}
            {equipment && equipment.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
                <h2 className="flex items-center gap-2 mb-4" style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: "#1C1C1E" }}>
                  <Package size={17} style={{ color: "#007AFF" }} /> Equipment
                </h2>
                <div className="flex flex-col gap-2">
                  {equipment.map((eq: { id: string; name: string; description?: string; category?: string }) => (
                    <div key={eq.id} className="flex items-start justify-between gap-4 py-2"
                      style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                      <div>
                        <p style={{ fontFamily: FONT_TEXT, fontSize: 14, fontWeight: 500, color: "#1C1C1E" }}>{eq.name}</p>
                        {eq.description && (
                          <p style={{ fontFamily: FONT_TEXT, fontSize: 12, color: "#AEAEB2", marginTop: 2 }}>{eq.description}</p>
                        )}
                      </div>
                      {eq.category && (
                        <span style={{ fontSize: 11, fontFamily: FONT_TEXT, color: "#AEAEB2", flexShrink: 0 }}>{eq.category}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Credits */}
            {credits && credits.length > 0 && (
              <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
                <h2 className="flex items-center gap-2 mb-4" style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 17, color: "#1C1C1E" }}>
                  <Clapperboard size={17} style={{ color: "#007AFF" }} /> Past Work
                </h2>
                <div className="flex flex-col gap-2">
                  {credits.map((credit: { id: string; project_title: string; role: string; year?: number; type?: string; network_studio?: string }) => (
                    <div key={credit.id} className="py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p style={{ fontFamily: FONT_TEXT, fontSize: 14, fontWeight: 500, color: "#1C1C1E" }}>{credit.project_title}</p>
                          <p style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "#6D6D72", marginTop: 2 }}>{credit.role}</p>
                          {credit.network_studio && (
                            <p style={{ fontFamily: FONT_TEXT, fontSize: 12, color: "#AEAEB2", marginTop: 1 }}>{credit.network_studio}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {credit.year && (
                            <span style={{ fontSize: 13, fontFamily: FONT_TEXT, color: "#AEAEB2" }}>{credit.year}</span>
                          )}
                          {credit.type && (
                            <span style={{
                              fontSize: 11, fontFamily: FONT_TEXT, fontWeight: 500,
                              background: "#F5F5F7", color: "#6D6D72",
                              padding: "2px 8px", borderRadius: 20,
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
            <div className="rounded-2xl p-5 sticky top-[68px]" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
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
