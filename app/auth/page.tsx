"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, BriefcaseBusiness, Users } from "lucide-react";
import LegalModal, { hasAgreedToTerms, recordAgreement } from "@/components/LegalModal";
import BrandLockup from "@/components/BrandLockup";
import BrandMark from "@/components/BrandMark";

const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';

const BG     = "#000000";
const TEXT   = "#F7F7F2";
const MUTED  = "#8E8E93";
const AMBER  = "#FFCC00";
const BORDER = "rgba(255,255,255,0.09)";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path d="M17.64 9.205c0-.639-.057-1.252-.163-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function AuthPageInner() {
  const searchParams = useSearchParams();
  const intent    = searchParams.get("intent");
  const nextParam = searchParams.get("next");
  const initialAccountType = (() => {
    if (!nextParam?.startsWith("/join")) return "";
    const qs = nextParam.split("?")[1];
    const type = qs ? new URLSearchParams(qs).get("type") : null;
    return type === "client" || type === "crew" ? type : "";
  })();

  const [tab,     setTab]     = useState<"signin" | "join">(intent === "join" ? "join" : "signin");
  const [accountType, setAccountType] = useState<"client" | "crew" | "">(initialAccountType);
  const [error,   setError]   = useState("");
  const [showLegal,     setShowLegal]     = useState(false);
  const [pendingAction, setPendingAction] = useState<"google" | null>(null);

  function dest() {
    if (nextParam) {
      if (tab === "join" && accountType && nextParam.startsWith("/join") && !nextParam.includes("type=")) {
        return `${nextParam}${nextParam.includes("?") ? "&" : "?"}type=${accountType}`;
      }
      return nextParam;
    }
    if (tab === "join") return accountType ? `/join?type=${accountType}` : "/join";
    return "/dashboard";
  }

  async function doGoogleAuth() {
    const sb = createClient();
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${dest()}` },
    });
  }

  async function handleGoogleAuth() {
    if (tab === "join" && !accountType) {
      setError("Choose whether you are hiring or joining as crew.");
      return;
    }
    if (hasAgreedToTerms()) {
      await doGoogleAuth();
    } else {
      setPendingAction("google");
      setShowLegal(true);
    }
  }

  async function handleAgree() {
    recordAgreement();
    setShowLegal(false);
    if (pendingAction === "google") {
      setPendingAction(null);
      await doGoogleAuth();
    }
  }

  function handleDecline() {
    setShowLegal(false);
    setPendingAction(null);
  }

  return (
    <div style={{ background: BG, minHeight: "100dvh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

      {showLegal && <LegalModal onAgree={handleAgree} onDecline={handleDecline} />}

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: -60, left: "50%", transform: "translateX(-50%)",
        width: 700, height: 500, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 55% 40% at 50% 0%, rgba(255,179,0,0.10) 0%, transparent 68%)",
      }} />

      {/* Nav */}
      <div className="app-container topbar-inner" style={{ position: "relative", zIndex: 2 }}>
        <Link href="/"
          style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED }}
          className="hover:opacity-70 transition-opacity">
          <ArrowLeft size={15} />
          <BrandMark size={22} />
          <BrandLockup size={16} />
        </Link>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(16px,4vh,48px) clamp(16px,5vw,24px)", position: "relative", zIndex: 2 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Card */}
          <div style={{
            background: "rgba(16,16,18,0.92)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 24,
            boxShadow: "0 2px 0 rgba(255,255,255,0.04) inset, 0 24px 80px rgba(0,0,0,0.6)",
            overflow: "hidden",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}>
            {/* Top amber accent stripe */}
            <div style={{ height: 2, background: `linear-gradient(90deg, ${AMBER}, rgba(255,179,0,0.3) 60%, transparent)` }} />

            <div style={{ padding: "clamp(28px,7%,40px)" }}>

              <>
                {/* Logo mark */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "rgba(255,179,0,0.1)", border: "1px solid rgba(255,179,0,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
                }}>
                  <BrandMark size={28} />
                </div>

                {/* Tab switcher */}
                <div style={{
                  display: "flex", background: "rgba(255,255,255,0.05)",
                  borderRadius: 999, padding: 3, marginBottom: 28, gap: 3,
                }}>
                  {(["signin", "join"] as const).map((t) => (
                    <button key={t} type="button"
                      onClick={() => { setTab(t); setError(""); }}
                      style={{
                        flex: 1, height: 40, borderRadius: 999, cursor: "pointer", border: "none",
                        background: tab === t
                          ? t === "join" ? AMBER : "rgba(255,255,255,0.1)"
                          : "transparent",
                        color: tab === t ? (t === "join" ? "#000" : TEXT) : MUTED,
                        fontFamily: FT, fontSize: 14, fontWeight: tab === t ? 700 : 400,
                        transition: "all 0.18s",
                      }}>
                      {t === "signin" ? "Log in" : "Sign up"}
                    </button>
                  ))}
                </div>

                <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(22px,5vw,28px)", color: TEXT, letterSpacing: "-0.028em", marginBottom: 6 }}>
                  {tab === "signin" ? "Welcome back" : "Create your account"}
                </h1>
                <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, lineHeight: 1.55, marginBottom: 28 }}>
                  {tab === "signin"
                    ? "Manage your card and incoming requests."
                    : "Choose how you plan to use CineForce before signing up."}
                </p>

                {error && (
                  <div style={{
                    padding: "10px 16px", borderRadius: 12,
                    background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)",
                    marginBottom: 16,
                  }}>
                    <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A" }}>{error}</p>
                  </div>
                )}

                {tab === "join" && (
                  <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                    {([
                      {
                        id: "client" as const,
                        icon: BriefcaseBusiness,
                        title: "I'm hiring",
                        desc: "Find crew, send project requests, and manage replies.",
                      },
                      {
                        id: "crew" as const,
                        icon: Users,
                        title: "I'm crew",
                        desc: "Build your public card and receive gig requests.",
                      },
                    ]).map((item) => {
                      const Icon = item.icon;
                      const active = accountType === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => { setAccountType(item.id); setError(""); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 12,
                            width: "100%", padding: "13px 14px", borderRadius: 14,
                            border: `1px solid ${active ? "rgba(255,204,0,0.5)" : BORDER}`,
                            background: active ? "rgba(255,204,0,0.09)" : "rgba(255,255,255,0.035)",
                            color: TEXT, textAlign: "left", cursor: "pointer",
                          }}
                          className="transition-all hover:bg-white/[0.06] active:scale-[0.99]">
                          <span style={{
                            width: 34, height: 34, borderRadius: 10,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: active ? AMBER : "rgba(255,255,255,0.06)",
                            color: active ? "#000" : MUTED,
                            flexShrink: 0,
                          }}>
                            <Icon size={17} />
                          </span>
                          <span style={{ flex: 1 }}>
                            <span style={{ display: "block", fontFamily: FD, fontWeight: 700, fontSize: 14, color: active ? AMBER : TEXT }}>
                              {item.title}
                            </span>
                            <span style={{ display: "block", fontFamily: FT, fontSize: 12, color: MUTED, lineHeight: 1.45, marginTop: 2 }}>
                              {item.desc}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <button onClick={handleGoogleAuth}
                  className="transition-all hover:opacity-92 active:scale-[0.98]"
                  style={{
                    width: "100%", height: 54, borderRadius: 999,
                    background: "#ffffff", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    fontFamily: FT, fontSize: 15, fontWeight: 600, color: "#1a1a1a",
                    cursor: "pointer",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                  }}>
                  <GoogleLogo />
                  {tab === "signin" ? "Continue with Google" : "Sign up with Google"}
                </button>

                <p style={{ fontFamily: FT, fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: 24 }}>
                  {tab === "signin" ? "New to CineForce?" : "Already a member?"}
                  {" "}
                  <button
                    onClick={() => { setTab(tab === "signin" ? "join" : "signin"); setError(""); }}
                    style={{ color: AMBER, background: "none", border: "none", cursor: "pointer", fontFamily: FT, fontSize: 14, fontWeight: 600 }}
                    className="hover:opacity-70 transition-opacity">
                    {tab === "signin" ? "Sign up" : "Log in"}
                  </button>
                </p>
              </>

            </div>
          </div>

          {tab === "join" && (
            <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 18, lineHeight: 1.7 }}>
              Your card is public. Contact info stays gated behind a request.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ background: BG, minHeight: "100dvh" }} />}>
      <AuthPageInner />
    </Suspense>
  );
}
