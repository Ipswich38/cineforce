"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";

const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';

const BG      = "#000000";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";

const CATEGORIES = [
  { id: "bug",      label: "Bug / Error",      desc: "Something is not working" },
  { id: "account",  label: "Account",          desc: "Login, profile, access issues" },
  { id: "access",   label: "Access",           desc: "Invite code or closed-test access" },
  { id: "feature",  label: "Feature Request",  desc: "Suggestions and ideas" },
  { id: "other",    label: "Other",            desc: "Anything else" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: 12,
  border: `1px solid ${BORDER}`, background: "#080808",
  color: TEXT, fontFamily: FT, fontSize: 15, outline: "none",
  boxSizing: "border-box",
};

export default function HelpPage() {
  const [category, setCategory] = useState("other");
  const [subject,  setSubject]  = useState("");
  const [message,  setMessage]  = useState("");
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState("");

  async function submit() {
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are both required.");
      return;
    }
    setSending(true);
    setError("");
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, subject: subject.trim(), message: message.trim() }),
    });
    if (res.ok) {
      setSent(true);
    } else {
      const body = await res.json() as { error?: string };
      setError(body.error ?? "Something went wrong. Try again.");
    }
    setSending(false);
  }

  return (
    <div style={{ background: BG, minHeight: "100dvh" }}>

      {/* Nav */}
      <div style={{
        background: "rgba(10,10,12,0.96)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${BORDER}`,
        position: "sticky", top: 0, zIndex: 40,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div className="app-container-narrow topbar-inner">
          <Link href="/dashboard"
            style={{ display: "flex", alignItems: "center", gap: 6, color: MUTED, textDecoration: "none" }}
            className="hover:opacity-70 transition-opacity">
            <ArrowLeft size={16} />
            <span style={{ fontFamily: FT, fontSize: 14 }}>Dashboard</span>
          </Link>
          <BrandLockup size={17} />
          <div style={{ width: 64 }} />
        </div>
      </div>

      <div className="app-container-narrow app-page-pad" style={{ maxWidth: 480 }}>

        {sent ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", minHeight: "50vh", textAlign: "center", gap: 16,
          }}>
            <CheckCircle2 size={48} style={{ color: "#32D74B" }} />
            <h1 style={{ fontFamily: FD, fontWeight: 700, fontSize: 24, color: TEXT, letterSpacing: "-0.025em" }}>
              Ticket submitted
            </h1>
            <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, lineHeight: 1.65, maxWidth: 300 }}>
              We will get back to you as soon as we can. Check your email for updates.
            </p>
            <Link href="/dashboard"
              style={{
                marginTop: 8, padding: "12px 28px", borderRadius: 14,
                background: AMBER, color: "#000",
                fontFamily: FT, fontSize: 15, fontWeight: 700,
                textDecoration: "none",
              }}
              className="transition-all hover:opacity-85">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontFamily: FD, fontWeight: 700,
                fontSize: "clamp(1.6rem, 5vw, 2rem)",
                color: TEXT, letterSpacing: "-0.03em", marginBottom: 8,
              }}>
                Help & Support
              </h1>
              <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, lineHeight: 1.65 }}>
                Submit a ticket and we will respond as soon as possible.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Category */}
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "clamp(18px,4%,24px)" }}>
                <p style={{ fontFamily: FT, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
                  Category
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {CATEGORIES.map((c) => {
                    const sel = category === c.id;
                    return (
                      <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "11px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                          border: `1px solid ${sel ? "rgba(255,179,0,0.35)" : BORDER}`,
                          background: sel ? "rgba(255,179,0,0.07)" : "#080808",
                          transition: "all 0.15s",
                        }}>
                        <div>
                          <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 600, color: sel ? AMBER : TEXT }}>{c.label}</p>
                          <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 1 }}>{c.desc}</p>
                        </div>
                        {sel && <div style={{ width: 8, height: 8, borderRadius: "50%", background: AMBER, flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject + message */}
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "clamp(18px,4%,24px)" }}>
                <p style={{ fontFamily: FT, fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
                  Details
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input
                    type="text"
                    placeholder="Subject *"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(255,179,0,0.4)")}
                    onBlur={(e)  => (e.target.style.borderColor = BORDER)}
                  />
                  <textarea
                    placeholder="Describe your issue or question in detail *"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    style={{ ...inputStyle, resize: "none", lineHeight: 1.65 }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(255,179,0,0.4)")}
                    onBlur={(e)  => (e.target.style.borderColor = BORDER)}
                  />
                </div>
              </div>

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.2)" }}>
                  <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A" }}>{error}</p>
                </div>
              )}

              <button onClick={submit} disabled={sending}
                style={{
                  width: "100%", height: 54, borderRadius: 16, border: "none",
                  background: sending ? "rgba(255,179,0,0.5)" : AMBER,
                  color: "#000", fontFamily: FT, fontSize: 16, fontWeight: 700,
                  cursor: sending ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 24px rgba(255,179,0,0.2)",
                }}
                className="transition-all hover:opacity-85 active:scale-[0.98]">
                <Send size={16} />
                {sending ? "Submitting…" : "Submit ticket"}
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
