"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ROLES } from "@/lib/constants";
import { Search, MapPin, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

const FONT_DISPLAY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FONT_TEXT    = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const SAMPLE_CREW = [
  {
    name: "Miguel Santos",
    role: "Director of Photography",
    city: "Quezon City",
    experience: "Senior",
    availability: "available",
    specializations: ["Narrative Film", "Commercials"],
    initials: "MS",
    color: "#5B8EF5",
  },
  {
    name: "Krissy Dela Cruz",
    role: "Video Editor",
    city: "Makati",
    experience: "Mid Level",
    availability: "available",
    specializations: ["Drama Series", "Documentary"],
    initials: "KD",
    color: "#F5775B",
  },
  {
    name: "Jerome Aquino",
    role: "Sound Mixer / Recordist",
    city: "Pasig",
    experience: "Senior",
    availability: "busy",
    specializations: ["TV Drama", "Live Events"],
    initials: "JA",
    color: "#34C759",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: <Search size={22} strokeWidth={1.8} />,
    title: "Search by role & location",
    desc: "Find the right crew member by discipline, city, experience level, and availability — in seconds.",
  },
  {
    step: "02",
    icon: <Shield size={22} strokeWidth={1.8} />,
    title: "Browse verified profiles",
    desc: "View their reel, equipment, and credits. Location shown, contact details protected until connected.",
  },
  {
    step: "03",
    icon: <CheckCircle2 size={22} strokeWidth={1.8} />,
    title: "Send a connect request",
    desc: "Message the crew member with project details. When they accept, their contact is unlocked.",
  },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(245,245,247,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.07)" : "1px solid transparent",
      }}
    >
      <div className="max-w-[1080px] mx-auto px-6 flex items-center justify-between" style={{ height: 56 }}>
        <Link href="/" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, color: "#1C1C1E", letterSpacing: "-0.02em" }}>
          SetReady
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {[
            { href: "/search",       label: "Find Crew" },
            { href: "#how-it-works", label: "How it Works" },
            { href: "#roles",        label: "Disciplines" },
          ].map(({ href, label }) => (
            <a key={label} href={href}
              style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#6D6D72", fontWeight: 450 }}
              className="transition-colors hover:text-[#1C1C1E]">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth"
            style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#6D6D72", fontWeight: 450, padding: "6px 14px" }}
            className="transition-colors hover:text-[#1C1C1E]">
            Sign in
          </Link>
          <Link href="/join"
            className="transition-all hover:opacity-80"
            style={{
              fontFamily: FONT_TEXT, fontSize: 14, fontWeight: 500,
              background: "#007AFF", color: "#fff",
              padding: "7px 16px", borderRadius: 20,
            }}>
            Join as Crew
          </Link>
        </div>
      </div>
    </header>
  );
}

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

function CrewCard({ crew }: { crew: typeof SAMPLE_CREW[0] }) {
  return (
    <div className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
      style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-center rounded-2xl text-white text-[15px] font-bold select-none"
          style={{ width: 48, height: 48, background: crew.color, letterSpacing: "-0.02em" }}>
          {crew.initials}
        </div>
        <div className="flex items-center gap-1.5">
          <AvailabilityDot status={crew.availability} />
          <span style={{ fontSize: 12, color: "#6D6D72", fontFamily: FONT_TEXT }}>
            {crew.availability === "available" ? "Available" : "Busy"}
          </span>
        </div>
      </div>
      <div>
        <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16, color: "#1C1C1E", letterSpacing: "-0.015em" }}>
          {crew.name}
        </p>
        <p style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "#6D6D72", marginTop: 2 }}>
          {crew.role}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <MapPin size={12} style={{ color: "#AEAEB2", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#AEAEB2", fontFamily: FONT_TEXT }}>{crew.city}</span>
        <span style={{ fontSize: 12, color: "rgba(0,0,0,0.15)", marginLeft: 4 }}>·</span>
        <span style={{ fontSize: 12, color: "#AEAEB2", fontFamily: FONT_TEXT }}>{crew.experience}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {crew.specializations.map((s) => (
          <span key={s} style={{
            fontSize: 11, fontFamily: FONT_TEXT, fontWeight: 500,
            background: "rgba(0,122,255,0.07)", color: "#007AFF",
            padding: "3px 9px", borderRadius: 20,
          }}>{s}</span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <span style={{ fontSize: 12, color: "rgba(0,0,0,0.25)", fontFamily: FONT_TEXT }}>Contact hidden</span>
        <button style={{
          fontSize: 13, fontWeight: 500, fontFamily: FONT_TEXT,
          color: "#007AFF", background: "transparent", border: "none",
          display: "flex", alignItems: "center", gap: 4,
        }} className="hover:opacity-70 transition-opacity">
          View profile <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh" }}>
      <Nav />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden" style={{ minHeight: "92vh" }}>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div style={{ width: 800, height: 600, background: "radial-gradient(ellipse 65% 55% at 50% 42%, rgba(0,122,255,0.065) 0%, transparent 70%)" }} />
        </div>

        <div className="animate-fade-up mb-7">
          <span className="inline-flex items-center gap-2" style={{
            fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 500,
            background: "rgba(0,122,255,0.08)", color: "#007AFF",
            padding: "5px 14px", borderRadius: 20, border: "1px solid rgba(0,122,255,0.15)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#007AFF", display: "inline-block" }} />
            Now live · Philippines
          </span>
        </div>

        <h1 className="animate-fade-up delay-100 max-w-[720px]" style={{
          fontFamily: FONT_DISPLAY, fontWeight: 700,
          fontSize: "clamp(2.8rem, 7.5vw, 5.4rem)",
          color: "#1C1C1E", letterSpacing: "-0.035em", lineHeight: 1.05, marginBottom: 28,
        }}>
          Your next crew<br />
          <span style={{ color: "#007AFF" }}>is already here.</span>
        </h1>

        <p className="animate-fade-up delay-200 max-w-[520px]" style={{
          fontFamily: FONT_TEXT, fontSize: "clamp(16px, 2.2vw, 19px)",
          color: "#6D6D72", lineHeight: 1.6, marginBottom: 40,
        }}>
          SetReady connects production teams with verified directors, cinematographers,
          editors, sound designers, and more — all across the Philippines.
        </p>

        <div className="animate-fade-up delay-300 flex flex-wrap items-center justify-center gap-3">
          <Link href="/search"
            className="inline-flex items-center gap-2 transition-all hover:opacity-85 active:scale-[0.98]"
            style={{
              fontFamily: FONT_TEXT, fontSize: 16, fontWeight: 500,
              background: "#007AFF", color: "#fff",
              padding: "13px 28px", borderRadius: 24,
              boxShadow: "0 4px 20px rgba(0,122,255,0.28)",
            }}>
            Find Crew <Search size={16} />
          </Link>
          <Link href="/join"
            className="inline-flex items-center gap-2 transition-all hover:bg-white/80 active:scale-[0.98]"
            style={{
              fontFamily: FONT_TEXT, fontSize: 16, fontWeight: 500,
              background: "#fff", color: "#1C1C1E",
              padding: "13px 28px", borderRadius: 24,
              border: "1px solid rgba(0,0,0,0.10)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
            Join as Crew
          </Link>
        </div>

        <div className="animate-fade-up delay-400 flex flex-wrap items-center justify-center gap-6 mt-16"
          style={{ color: "#AEAEB2", fontFamily: FONT_TEXT, fontSize: 13 }}>
          {["16 disciplines", "Nationwide coverage", "Direct booking"].map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              {i > 0 && <span style={{ color: "rgba(0,0,0,0.15)", marginRight: 6 }}>·</span>}
              <CheckCircle2 size={13} style={{ color: "#34C759" }} />
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-28 px-6" style={{ background: "#fff" }}>
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center mb-16">
            <p style={{ fontFamily: FONT_TEXT, fontSize: 12, fontWeight: 600, color: "#007AFF", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              How SetReady Works
            </p>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1C1C1E" }}>
              Simple. Fast. Professional.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="rounded-2xl p-8" style={{ background: "#F5F5F7", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="flex items-center justify-center rounded-xl mb-6"
                  style={{ width: 48, height: 48, background: "rgba(0,122,255,0.1)", color: "#007AFF" }}>
                  {step.icon}
                </div>
                <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "clamp(1.4rem, 2vw, 1.9rem)", color: "rgba(0,0,0,0.08)", letterSpacing: "-0.04em", marginBottom: 12 }}>
                  {step.step}
                </p>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 18, color: "#1C1C1E", marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p style={{ fontFamily: FONT_TEXT, fontSize: 15, color: "#6D6D72", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disciplines */}
      <section id="roles" className="py-28 px-6" style={{ background: "#F5F5F7" }}>
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center mb-16">
            <p style={{ fontFamily: FONT_TEXT, fontSize: 12, fontWeight: 600, color: "#007AFF", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              Every Role on Set
            </p>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1C1C1E" }}>
              16 disciplines.<br />One platform.
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ROLES.map((role) => (
              <Link key={role.id} href={`/search?role=${role.id}`}
                className="flex items-center gap-3 rounded-xl p-4 transition-all duration-200 group"
                style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{role.icon}</span>
                <span style={{ fontFamily: FONT_TEXT, fontSize: 14, fontWeight: 500, color: "#1C1C1E", lineHeight: 1.3 }}>
                  {role.label}
                </span>
                <ArrowRight size={13} style={{ color: "#AEAEB2", marginLeft: "auto", flexShrink: 0 }}
                  className="opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sample crew */}
      <section className="py-28 px-6" style={{ background: "#fff" }}>
        <div className="max-w-[1080px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p style={{ fontFamily: FONT_TEXT, fontSize: 12, fontWeight: 600, color: "#007AFF", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
                Featured Crew
              </p>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1C1C1E" }}>
                Meet the crew.
              </h2>
            </div>
            <Link href="/search"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-70 shrink-0"
              style={{ fontFamily: FONT_TEXT, fontSize: 15, fontWeight: 500, color: "#007AFF" }}>
              Browse all crew <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {SAMPLE_CREW.map((crew) => <CrewCard key={crew.name} crew={crew} />)}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-28 px-6" style={{ background: "#F5F5F7" }}>
        <div className="max-w-[1080px] mx-auto">
          <div className="rounded-3xl p-12 md:p-16 text-center relative overflow-hidden" style={{ background: "#1C1C1E" }}>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div style={{ width: 600, height: 400, background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,122,255,0.12) 0%, transparent 70%)" }} />
            </div>
            <div className="relative">
              <p style={{ fontFamily: FONT_TEXT, fontSize: 12, fontWeight: 600, color: "rgba(0,122,255,0.9)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
                For Crew Members
              </p>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 3.4rem)", color: "#fff", marginBottom: 16 }}>
                Build your profile.<br />Get discovered.
              </h2>
              <p style={{ fontFamily: FONT_TEXT, fontSize: 17, color: "rgba(255,255,255,0.5)", maxWidth: 460, margin: "0 auto 40px", lineHeight: 1.6 }}>
                Create your free crew profile, list your equipment and credits,
                and let production teams find you.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/join"
                  className="inline-flex items-center gap-2 transition-all hover:opacity-85 active:scale-[0.98]"
                  style={{
                    fontFamily: FONT_TEXT, fontSize: 16, fontWeight: 500,
                    background: "#007AFF", color: "#fff",
                    padding: "13px 28px", borderRadius: 24,
                    boxShadow: "0 4px 20px rgba(0,122,255,0.35)",
                  }}>
                  Create your profile <ArrowRight size={16} />
                </Link>
                <Link href="/search"
                  className="inline-flex items-center gap-2 transition-all hover:opacity-70"
                  style={{ fontFamily: FONT_TEXT, fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,0.55)", padding: "13px 28px" }}>
                  Find crew instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12" style={{ background: "#1C1C1E" }}>
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: "rgba(255,255,255,0.8)", letterSpacing: "-0.02em" }}>
              SetReady
            </span>
            <p style={{ fontFamily: FONT_TEXT, fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
              Film & TV crew marketplace · Philippines
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[{ href: "/search", label: "Find Crew" }, { href: "/join", label: "Join" }, { href: "/auth", label: "Sign In" }].map((l) => (
              <Link key={l.href} href={l.href}
                style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "rgba(255,255,255,0.35)" }}
                className="hover:text-white/60 transition-colors">
                {l.label}
              </Link>
            ))}
            <p style={{ fontFamily: FONT_TEXT, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
              © {new Date().getFullYear()} SetReady
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
