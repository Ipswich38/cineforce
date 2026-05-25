"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Mail, Eye, EyeOff, Film } from "lucide-react";

const FONT_DISPLAY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FONT_TEXT    = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

export default function AuthPage() {
  const [mode,     setMode]     = useState<"login" | "signup">("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState("");
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else window.location.href = "/dashboard";
    }
    setLoading(false);
  }

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)", background: "#F5F5F7",
    color: "#1C1C1E", fontFamily: FONT_TEXT, fontSize: 15,
    outline: "none", transition: "border-color 0.2s",
  } as const;

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ background: "transparent" }}>
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, color: "#1C1C1E", letterSpacing: "-0.02em" }}>
          <ArrowLeft size={18} style={{ color: "#AEAEB2" }} />
          SetReady
        </Link>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="rounded-3xl p-8" style={{ background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.06)" }}>
            {/* Icon */}
            <div className="flex items-center justify-center rounded-2xl mx-auto mb-6"
              style={{ width: 52, height: 52, background: "rgba(0,122,255,0.1)" }}>
              <Film size={24} style={{ color: "#007AFF" }} strokeWidth={1.8} />
            </div>

            <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, color: "#1C1C1E", textAlign: "center", marginBottom: 6, letterSpacing: "-0.02em" }}>
              {mode === "login" ? "Welcome back" : "Join SetReady"}
            </h1>
            <p style={{ fontFamily: FONT_TEXT, fontSize: 15, color: "#6D6D72", textAlign: "center", marginBottom: 28 }}>
              {mode === "login" ? "Sign in to your account" : "Create your crew account"}
            </p>

            {message && (
              <div className="rounded-xl px-4 py-3 mb-4" style={{ background: "rgba(52,199,89,0.1)", border: "1px solid rgba(52,199,89,0.2)" }}>
                <p style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#1A8B3A" }}>{message}</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl px-4 py-3 mb-4" style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.15)" }}>
                <p style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#CC2C22" }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <Mail size={16} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#AEAEB2" }} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  onFocus={(e) => (e.target.style.borderColor = "#007AFF")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.12)")}
                />
              </div>

              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => (e.target.style.borderColor = "#007AFF")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.12)")}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#AEAEB2" }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="transition-all active:scale-[0.98]"
                style={{
                  width: "100%", padding: "13px", borderRadius: 14, border: "none",
                  background: loading ? "rgba(0,122,255,0.5)" : "#007AFF",
                  color: "#fff", fontFamily: FONT_TEXT, fontSize: 16, fontWeight: 500,
                  marginTop: 4, cursor: loading ? "not-allowed" : "pointer",
                }}>
                {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#6D6D72" }}>
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                {" "}
                <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage(""); }}
                  style={{ color: "#007AFF", background: "none", border: "none", fontWeight: 500, fontFamily: FONT_TEXT, fontSize: 14 }}
                  className="hover:opacity-70 transition-opacity">
                  {mode === "login" ? "Join as Crew" : "Sign In"}
                </button>
              </p>
            </div>
          </div>

          {mode === "signup" && (
            <p style={{ fontFamily: FONT_TEXT, fontSize: 12, color: "#AEAEB2", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
              By creating an account, you agree to SetReady&apos;s terms of use.
              <br />Your profile is visible to production teams searching for crew.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
