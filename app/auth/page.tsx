"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Mail, Clapperboard, CheckCircle2 } from "lucide-react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

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

  const [tab,     setTab]     = useState<"signin" | "join">(intent === "join" ? "join" : "signin");
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  function dest() {
    return nextParam ?? (tab === "join" ? "/join" : "/dashboard");
  }

  async function handleGoogleAuth() {
    const sb = createClient();
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${dest()}` },
    });
  }

  async function handleEmailContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const sb = createClient();
    const { error: otpError } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${dest()}` },
    });
    if (otpError) { setError(otpError.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  }

  return (
    <div style={{ background: BG, minHeight: "100dvh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

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
          <Clapperboard size={15} style={{ color: AMBER }} strokeWidth={2} />
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT, letterSpacing: "-0.02em" }}>YourNextCrew</span>
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

              {sent ? (
                /* ── Check inbox ── */
                <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
                  <div style={{
                    width: 68, height: 68, borderRadius: "50%", margin: "0 auto 24px",
                    background: "rgba(50,215,75,0.08)", border: "1px solid rgba(50,215,75,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <CheckCircle2 size={30} style={{ color: "#32D74B" }} />
                  </div>
                  <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: 26, color: TEXT, letterSpacing: "-0.028em", marginBottom: 10 }}>
                    Check your inbox
                  </h1>
                  <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, lineHeight: 1.6, marginBottom: 8 }}>
                    Magic link sent to
                  </p>
                  <p style={{ fontFamily: FT, fontSize: 16, color: TEXT, fontWeight: 600, marginBottom: 24 }}>
                    {email}
                  </p>
                  <p style={{ fontFamily: FT, fontSize: 13, color: "rgba(255,255,255,0.28)", lineHeight: 1.7, marginBottom: 32 }}>
                    Tap the link in your email to sign in.
                    <br />No password needed, ever.
                  </p>
                  <button
                    onClick={() => { setSent(false); setError(""); }}
                    style={{
                      background: "rgba(255,179,0,0.08)", border: "1px solid rgba(255,179,0,0.2)",
                      borderRadius: 999, padding: "10px 22px",
                      cursor: "pointer", fontFamily: FT, fontSize: 14, color: AMBER, fontWeight: 600,
                    }}
                    className="transition-all hover:opacity-80 active:scale-[0.97]">
                    Use a different email
                  </button>
                </div>

              ) : (
                <>
                  {/* Logo mark */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: "rgba(255,179,0,0.1)", border: "1px solid rgba(255,179,0,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
                  }}>
                    <Clapperboard size={21} style={{ color: AMBER }} strokeWidth={1.8} />
                  </div>

                  {/* Tab switcher — pill segmented control */}
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
                          color: tab === t
                            ? t === "join" ? "#000" : TEXT
                            : MUTED,
                          fontFamily: FT, fontSize: 14, fontWeight: tab === t ? 700 : 400,
                          transition: "all 0.18s",
                        }}>
                        {t === "signin" ? "Log in" : "Sign up"}
                      </button>
                    ))}
                  </div>

                  <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(22px,5vw,28px)", color: TEXT, letterSpacing: "-0.028em", marginBottom: 6 }}>
                    {tab === "signin" ? "Welcome back" : "Join the crew"}
                  </h1>
                  <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, lineHeight: 1.55, marginBottom: 28 }}>
                    {tab === "signin"
                      ? "Manage your card and incoming requests."
                      : "Build your crew card. Get found. Stay booked."}
                  </p>

                  {/* Google — pill button */}
                  <button onClick={handleGoogleAuth}
                    className="transition-all hover:opacity-92 active:scale-[0.98]"
                    style={{
                      width: "100%", height: 54, borderRadius: 999,
                      background: "#ffffff", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      fontFamily: FT, fontSize: 15, fontWeight: 600, color: "#1a1a1a",
                      cursor: "pointer", marginBottom: 18,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                    }}>
                    <GoogleLogo />
                    {tab === "signin" ? "Continue with Google" : "Sign up with Google"}
                  </button>

                  {/* Divider */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                    <span style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.28)" }}>or continue with email</span>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                  </div>

                  {/* Error */}
                  {error && (
                    <div style={{
                      padding: "10px 16px", borderRadius: 12,
                      background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)",
                      marginBottom: 14,
                    }}>
                      <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A" }}>{error}</p>
                    </div>
                  )}

                  {/* Email form */}
                  <form onSubmit={handleEmailContinue} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                    {/* Email pill input */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: "#080808", borderRadius: 999,
                      border: `1px solid ${BORDER}`,
                      padding: "0 18px",
                      transition: "border-color 0.18s",
                    }}
                      onFocusCapture={(e) => (e.currentTarget.style.borderColor = "rgba(255,179,0,0.4)")}
                      onBlurCapture={(e) => (e.currentTarget.style.borderColor = BORDER)}>
                      <Mail size={15} style={{ color: MUTED, flexShrink: 0 }} />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        autoCorrect="off"
                        autoCapitalize="none"
                        style={{
                          flex: 1, background: "none", border: "none", outline: "none",
                          color: TEXT, fontFamily: FT, fontSize: 16,
                          padding: "14px 0",
                        }}
                      />
                    </div>

                    {/* Submit pill button */}
                    <button type="submit" disabled={loading}
                      className="transition-all active:scale-[0.98]"
                      style={{
                        width: "100%", height: 54, borderRadius: 999, border: "none",
                        background: loading ? "rgba(255,179,0,0.5)" : AMBER,
                        color: "#000", fontFamily: FT, fontSize: 15, fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        letterSpacing: "-0.01em",
                        boxShadow: loading ? "none" : "0 1px 0 rgba(255,255,255,0.3) inset",
                      }}>
                      {loading ? "Sending link…" : tab === "signin" ? "Send magic link" : "Continue"}
                    </button>
                  </form>

                  {/* Switch tab */}
                  <p style={{ fontFamily: FT, fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: 24 }}>
                    {tab === "signin" ? "New to YourNextCrew?" : "Already a member?"}
                    {" "}
                    <button
                      onClick={() => { setTab(tab === "signin" ? "join" : "signin"); setError(""); }}
                      style={{ color: AMBER, background: "none", border: "none", cursor: "pointer", fontFamily: FT, fontSize: 14, fontWeight: 600 }}
                      className="hover:opacity-70 transition-opacity">
                      {tab === "signin" ? "Sign up free" : "Log in"}
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Footer note */}
          {!sent && tab === "join" && (
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
