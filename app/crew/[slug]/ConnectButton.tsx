"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2, Clock, Lock, UserCircle, Zap, MessageSquare } from "lucide-react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";

type ContactDetails = { phone?: string; email?: string; facebook_url?: string } | null;
type ExistingRequest = { id: string; status: string } | null;

export default function ConnectButton({
  crewId,
  crewName,
  isOwn,
  existingRequest,
  isLoggedIn,
  isPremium,
}: {
  crewId: string;
  crewName: string;
  isOwn: boolean;
  existingRequest: ExistingRequest;
  contactDetails: ContactDetails;
  isLoggedIn: boolean;
  isPremium: boolean;
}) {
  const [step,        setStep]        = useState<"idle" | "form" | "sent">(existingRequest ? "sent" : "idle");
  const [projectName, setProjectName] = useState("");
  const [message,     setMessage]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [reqStatus,   setReqStatus]   = useState(existingRequest?.status ?? "");

  async function sendRequest() {
    if (!projectName.trim()) { setError("Please enter a project name."); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        crew_id: crewId,
        project_title: projectName.trim(),
        message: message.trim() || null,
      }),
    });
    if (!res.ok) {
      const body = await res.json() as { error?: string };
      setError(body.error ?? "Something went wrong. Try again.");
    } else {
      setStep("sent");
      setReqStatus("pending");
    }
    setLoading(false);
  }

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: `1px solid ${BORDER}`, background: "#080808",
    color: TEXT, fontFamily: FT, fontSize: 14, outline: "none",
  } as const;

  if (isOwn) {
    return (
      <div className="text-center">
        <UserCircle size={28} style={{ color: MUTED, margin: "0 auto 10px" }} />
        <p style={{ fontFamily: FT, fontSize: 14, color: MUTED }}>This is your profile.</p>
        <Link href="/dashboard"
          style={{
            display: "block", marginTop: 12, padding: "10px", borderRadius: 12,
            background: "rgba(255,179,0,0.1)", color: AMBER, border: `1px solid rgba(255,179,0,0.2)`,
            fontFamily: FT, fontSize: 14, fontWeight: 500, textAlign: "center",
          }}>
          Go to Dashboard →
        </Link>
      </div>
    );
  }

  if (!isOwn && !isPremium) {
    return (
      <div className="text-center">
        <Zap size={24} style={{ color: MUTED, margin: "0 auto 12px" }} />
        <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT, marginBottom: 6 }}>
          Not accepting requests yet
        </p>
        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
          {crewName} hasn&apos;t activated their gig profile.
        </p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center">
        <Lock size={24} style={{ color: MUTED, margin: "0 auto 12px" }} />
        <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT, marginBottom: 6 }}>
          Locked
        </p>
        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 18, lineHeight: 1.55 }}>
          Log in to request contact.
        </p>
        <Link href="/auth"
          style={{
            display: "block", padding: "12px", borderRadius: 12,
            background: AMBER, color: "#000",
            fontFamily: FT, fontSize: 15, fontWeight: 600, textAlign: "center",
          }}
          className="transition-all hover:opacity-85">
          Log in
        </Link>
      </div>
    );
  }

  if (reqStatus === "accepted") {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} style={{ color: "#32D74B" }} />
          <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT }}>Request accepted</p>
        </div>
        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 14 }}>
          Continue in chat to confirm the project details. Contact details stay private until everything is final.
        </p>
        <Link href={`/chat/${existingRequest?.id}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "13px", borderRadius: 14,
            background: AMBER, color: "#000",
            fontFamily: FT, fontSize: 15, fontWeight: 700,
            textDecoration: "none",
          }}
          className="transition-all hover:opacity-90 active:scale-[0.98]">
          <MessageSquare size={15} /> Open Messages
        </Link>
      </div>
    );
  }

  if (step === "sent" || reqStatus === "pending") {
    return (
      <div className="text-center">
        <Clock size={28} style={{ color: "#FF9F0A", margin: "0 auto 12px" }} />
        <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT, marginBottom: 6 }}>
          Request sent
        </p>
        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
          Waiting for approval.
        </p>
      </div>
    );
  }

  if (reqStatus === "declined") {
    return (
      <div className="text-center">
        <p style={{ fontFamily: FT, fontSize: 14, color: "#FF453A" }}>
          {crewName} is not available for this project.
        </p>
      </div>
    );
  }

  if (reqStatus === "skipped") {
    return (
      <div className="text-center">
        <Clock size={28} style={{ color: MUTED, margin: "0 auto 12px" }} />
        <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT, marginBottom: 6 }}>
          Not available for this one
        </p>
        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
          {crewName} was extended on an on-going project and can&apos;t commit to this schedule right now.
        </p>
      </div>
    );
  }

  if (step === "form") {
    return (
      <div>
        <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT, marginBottom: 4 }}>
          Message {crewName.split(" ")[0]}
        </p>
        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 14 }}>
          Share the project and dates. The crew can accept or skip for now.
        </p>

        {error && (
          <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A", marginBottom: 10 }}>{error}</p>
        )}

        <div className="flex flex-col gap-2 mb-3">
          <input
            type="text"
            placeholder="Project *"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,179,0,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = BORDER)}
          />
          <textarea
            placeholder="Message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,179,0,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = BORDER)}
          />
        </div>

        <div className="flex gap-2">
          <button onClick={() => setStep("idle")}
            style={{
              flex: 1, padding: "10px", borderRadius: 12, border: `1px solid ${BORDER}`,
              background: SURFACE, color: MUTED, fontFamily: FT, fontSize: 14,
            }}>
            Cancel
          </button>
          <button onClick={sendRequest} disabled={loading}
            style={{
              flex: 2, padding: "10px", borderRadius: 12, border: "none",
              background: loading ? "rgba(255,179,0,0.5)" : AMBER,
              color: "#000", fontFamily: FT, fontSize: 14, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
            <Send size={14} />
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Lock size={16} style={{ color: MUTED }} />
        <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT }}>
          Contact locked
        </p>
      </div>
      <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 18, lineHeight: 1.55 }}>
        Message this crew about your project. Contact details stay private until the booking is confirmed.
      </p>
      <button onClick={() => setStep("form")}
        style={{
          width: "100%", padding: "13px", borderRadius: 14, border: "none",
          background: AMBER, color: "#000",
          fontFamily: FT, fontSize: 15, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          boxShadow: "0 4px 20px rgba(255,179,0,0.25)",
        }}
        className="transition-all hover:opacity-85 active:scale-[0.98]">
        <MessageSquare size={15} /> Message
      </button>
    </div>
  );
}
