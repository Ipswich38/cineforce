"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Mail, Clapperboard, CheckCircle2 } from "lucide-react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#0C0C0F";
const SURFACE = "#18181D";
const TEXT    = "#F0EDE5";
const MUTED   = "#78787F";
const AMBER   = "#FFB300";
const BORDER  = "rgba(255,255,255,0.09)";

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

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: 12,
    border: `1px solid ${BORDER}`, background: "#111115",
    color: TEXT, fontFamily: FT, fontSize: 15, outline: "none",
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <div style={{ padding: "clamp(14px,2.5vh,22px) clamp(20px,5vw,40px)", display: "flex", alignItems: "center" }}>
        <Link href="/"
          style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED }}
          className="hover:opacity-70 transition-opacity">
          <ArrowLeft size={15} />
          <Clapperboard size={15} style={{ color: AMBER }} strokeWidth={2} />
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT, letterSpacing: "-0.02em" }}>SetReady</span>
        </Link>
      </div>

      {/* Card area */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(20px,4vh,52px) clamp(16px,5vw,32px)" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* Card */}
          <div style={{ background: SURFACE, borderRadius: 28, border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>
            <div style={{ height: 2, background: `linear-gradient(90deg, ${AMBER}, rgba(255,179,0,0.28), transparent)` }} />

            <div style={{ padding: "clamp(28px,7%,44px)" }}>

              {/* Logo icon */}
              <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(255,179,0,0.1)", border: "1px solid rgba(255,179,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <Clapperboard size={22} style={{ color: AMBER }} strokeWidth={1.8} />
              </div>

              {sent ? (
                /* ── Check inbox state ── */
                <div style={{ textAlign: "center", paddingBottom: 8 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(50,215,75,0.08)", border: "1px solid rgba(50,215,75,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                    <CheckCircle2 size={28} style={{ color: "#32D74B" }} />
                  </div>
                  <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: 24, color: TEXT, letterSpacing: "-0.024em", marginBottom: 12 }}>
                    Check your inbox
                  </h1>
                  <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, lineHeight: 1.65, marginBottom: 10 }}>
                    We sent a magic link to
                  </p>
                  <p style={{ fontFamily: FT, fontSize: 15, color: TEXT, fontWeight: 600, marginBottom: 28 }}>
                    {email}
                  </p>
                  <p style={{ fontFamily: FT, fontSize: 13, color: "rgba(255,255,255,0.28)", lineHeight: 1.65, marginBottom: 32 }}>
                    Click the link in your email to sign in.
                    <br />No password needed — ever.
                  </p>
                  <button
                    onClick={() => { setSent(false); setError(""); }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontFamily: FT, fontSize: 14, color: AMBER, fontWeight: 500 }}
                    className="hover:opacity-70 transition-opacity">
                    Use a different email
                  </button>
                </div>
              ) : (
                <>
                  {/* Tab switcher */}
                  <div style={{ display: "flex", background: "#111115", borderRadius: 12, padding: 4, marginBottom: 28, gap: 4 }}>
                    {(["signin", "join"] as const).map((t) => (
                      <button key={t} type="button"
                        onClick={() => { setTab(t); setError(""); }}
                        style={{
                          flex: 1, height: 38, borderRadius: 9, cursor: "pointer",
                          background: tab === t ? SURFACE : "transparent",
                          border: tab === t ? `1px solid ${BORDER}` : "1px solid transparent",
                          color: tab === t ? TEXT : MUTED,
                          fontFamily: FT, fontSize: 14, fontWeight: tab === t ? 600 : 400,
                          transition: "all 0.18s",
                        }}>
                        {t === "signin" ? "Sign In" : "Join as Crew"}
                      </button>
                    ))}
                  </div>

                  <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: "clamp(22px,4vw,26px)", color: TEXT, letterSpacing: "-0.024em", marginBottom: 8 }}>
                    {tab === "signin" ? "Welcome back" : "Join SetReady"}
                  </h1>
                  <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, lineHeight: 1.55, marginBottom: 28 }}>
                    {tab === "signin"
                      ? "Sign in to manage your crew profile."
                      : "Get discovered by production teams across the Philippines."}
                  </p>

                  {/* Google — primary CTA */}
                  <button onClick={handleGoogleAuth}
                    style={{
                      width: "100%", height: 52, borderRadius: 14,
                      background: "#fff", border: "1.5px solid rgba(0,0,0,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      fontFamily: FT, fontSize: 15, fontWeight: 600, color: "#1a1a1a",
                      cursor: "pointer", marginBottom: 20,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
                      transition: "box-shadow 0.18s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.32)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.22)")}>
                    <GoogleLogo />
                    {tab === "signin" ? "Continue with Google" : "Sign up with Google"}
                  </button>

                  {/* Divider */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                    <span style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.28)" }}>or continue with email</span>
                    <div style={{ flex: 1, height: 1, background: BORDER }} />
                  </div>

                  {/* Email OTP */}
                  {error && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)", marginBottom: 14 }}>
                      <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A" }}>{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleEmailContinue} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ position: "relative" }}>
                      <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: MUTED, pointerEvents: "none" }} />
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ ...inputStyle, paddingLeft: 42 }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,179,0,0.4)")}
                        onBlur={(e)  => (e.currentTarget.style.borderColor = BORDER)}
                      />
                    </div>
                    <button type="submit" disabled={loading}
                      className="transition-all active:scale-[0.98]"
                      style={{
                        width: "100%", height: 52, borderRadius: 14, border: "none",
                        background: loading ? "rgba(255,179,0,0.5)" : AMBER,
                        color: "#000", fontFamily: FT, fontSize: 15, fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                      }}>
                      {loading ? "Sending link…" : tab === "signin" ? "Send sign-in link" : "Continue with email"}
                    </button>
                  </form>

                  {/* Switch tab hint */}
                  <p style={{ fontFamily: FT, fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: 24 }}>
                    {tab === "signin" ? "New here?" : "Already a member?"}
                    {" "}
                    <button
                      onClick={() => { setTab(tab === "signin" ? "join" : "signin"); setError(""); }}
                      style={{ color: AMBER, background: "none", border: "none", cursor: "pointer", fontFamily: FT, fontSize: 14, fontWeight: 500 }}
                      className="hover:opacity-70 transition-opacity">
                      {tab === "signin" ? "Join as Crew" : "Sign In"}
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Footer note */}
          {!sent && tab === "join" && (
            <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 20, lineHeight: 1.7 }}>
              By joining you agree to SetReady&apos;s terms of service.
              <br />Your profile will be visible to verified production teams.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ background: BG, minHeight: "100vh" }} />}>
      <AuthPageInner />
    </Suspense>
  );
}
