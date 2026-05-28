"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const FD     = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT     = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';
const BG     = "#000000";
const TEXT   = "#F7F7F2";
const MUTED  = "#8E8E93";
const AMBER  = "#FFCC00";
const BORDER = "rgba(255,255,255,0.07)";
const SURFACE = "#101010";

export default function AdminLoginPage() {
  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [passcode, setPasscode] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passcode.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const { error: msg } = await res.json();
      setError(msg ?? "Incorrect passcode.");
      setPasscode("");
      inputRef.current?.focus();
    }
    setLoading(false);
  }

  return (
    <div style={{
      background: BG, minHeight: "100dvh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 340 }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(255,204,0,0.08)", border: "1px solid rgba(255,204,0,0.2)",
            marginBottom: 14,
          }}>
            <span style={{ fontFamily: FD, fontSize: 20, fontWeight: 800, color: AMBER }}>C</span>
          </div>
          <p style={{ fontFamily: FD, fontSize: 13, fontWeight: 600, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Admin Access
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 18, padding: "28px 24px",
        }}>
          <p style={{ fontFamily: FD, fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Enter passcode
          </p>
          <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 24 }}>
            Authorized personnel only.
          </p>

          <input
            ref={inputRef}
            type="password"
            value={passcode}
            onChange={(e) => { setPasscode(e.target.value); setError(""); }}
            placeholder="Passcode"
            autoFocus
            autoComplete="current-password"
            style={{
              display: "block", width: "100%", marginBottom: 12,
              padding: "13px 16px", borderRadius: 12,
              border: `1px solid ${error ? "rgba(255,69,58,0.4)" : BORDER}`,
              background: "#080808", color: TEXT,
              fontFamily: FT, fontSize: 16, outline: "none",
              boxSizing: "border-box", letterSpacing: "0.1em",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,204,0,0.35)")}
            onBlur={(e)  => (e.target.style.borderColor = error ? "rgba(255,69,58,0.4)" : BORDER)}
          />

          {error && (
            <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A", marginBottom: 12 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !passcode.trim()}
            style={{
              width: "100%", padding: "13px", borderRadius: 12, border: "none",
              background: AMBER, color: "#000",
              fontFamily: FT, fontSize: 15, fontWeight: 700,
              cursor: loading || !passcode.trim() ? "not-allowed" : "pointer",
              opacity: loading || !passcode.trim() ? 0.5 : 1,
            }}
          >
            {loading ? "Verifying…" : "Enter"}
          </button>
        </form>

      </div>
    </div>
  );
}
