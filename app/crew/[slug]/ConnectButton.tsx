"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Send, CheckCircle2, Clock, Phone, Mail, Lock, UserCircle } from "lucide-react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const SURFACE = "#18181D";
const TEXT    = "#F0EDE5";
const MUTED   = "#78787F";
const AMBER   = "#FFB300";
const BORDER  = "rgba(255,255,255,0.07)";

type ContactDetails = { phone?: string; email?: string; facebook_url?: string } | null;
type ExistingRequest = { id: string; status: string } | null;

export default function ConnectButton({
  crewId,
  crewName,
  isOwn,
  existingRequest,
  contactDetails,
  isLoggedIn,
}: {
  crewId: string;
  crewName: string;
  isOwn: boolean;
  existingRequest: ExistingRequest;
  contactDetails: ContactDetails;
  isLoggedIn: boolean;
}) {
  const [step,        setStep]        = useState<"idle" | "form" | "sent">(existingRequest ? "sent" : "idle");
  const [projectName, setProjectName] = useState("");
  const [message,     setMessage]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [reqStatus,   setReqStatus]   = useState(existingRequest?.status ?? "");

  const supabase = createClient();

  async function sendRequest() {
    if (!projectName.trim()) { setError("Please enter a project name."); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.from("connection_requests").insert({
      crew_id: crewId,
      project_title: projectName.trim(),
      message: message.trim() || null,
    });
    if (err) { setError(err.message); }
    else { setStep("sent"); setReqStatus("pending"); }
    setLoading(false);
  }

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: `1px solid ${BORDER}`, background: "#111115",
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

  if (!isLoggedIn) {
    return (
      <div className="text-center">
        <Lock size={24} style={{ color: MUTED, margin: "0 auto 12px" }} />
        <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT, marginBottom: 6 }}>
          Contact hidden
        </p>
        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 18, lineHeight: 1.55 }}>
          Sign in to send a connection request to {crewName}.
        </p>
        <Link href="/auth"
          style={{
            display: "block", padding: "12px", borderRadius: 12,
            background: AMBER, color: "#000",
            fontFamily: FT, fontSize: 15, fontWeight: 600, textAlign: "center",
          }}
          className="transition-all hover:opacity-85">
          Sign In to Connect
        </Link>
      </div>
    );
  }

  if (reqStatus === "accepted" && contactDetails) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} style={{ color: "#32D74B" }} />
          <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT }}>Connected!</p>
        </div>
        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 14 }}>
          {crewName} accepted your request. Contact details:
        </p>
        <div className="flex flex-col gap-2">
          {contactDetails.phone && (
            <a href={`tel:${contactDetails.phone}`}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:opacity-80"
              style={{ background: "rgba(50,215,75,0.08)", border: "1px solid rgba(50,215,75,0.2)" }}>
              <Phone size={15} style={{ color: "#32D74B" }} />
              <span style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>{contactDetails.phone}</span>
            </a>
          )}
          {contactDetails.email && (
            <a href={`mailto:${contactDetails.email}`}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:opacity-80"
              style={{ background: "rgba(74,158,255,0.08)", border: "1px solid rgba(74,158,255,0.2)" }}>
              <Mail size={15} style={{ color: "#4A9EFF" }} />
              <span style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>{contactDetails.email}</span>
            </a>
          )}
        </div>
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
          Waiting for {crewName} to accept. You&apos;ll get their contact details once they respond.
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

  if (step === "form") {
    return (
      <div>
        <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT, marginBottom: 4 }}>
          Connect with {crewName}
        </p>
        <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 14 }}>
          Introduce your project. They&apos;ll share their contact once they accept.
        </p>

        {error && (
          <p style={{ fontFamily: FT, fontSize: 13, color: "#FF453A", marginBottom: 10 }}>{error}</p>
        )}

        <div className="flex flex-col gap-2 mb-3">
          <input
            type="text"
            placeholder="Project name *"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,179,0,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = BORDER)}
          />
          <textarea
            placeholder="Short message (optional)"
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
            {loading ? "Sending…" : "Send Request"}
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
          Contact hidden
        </p>
      </div>
      <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, marginBottom: 18, lineHeight: 1.55 }}>
        Send a connect request with your project details. {crewName} will share their contact once they accept.
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
        <Send size={15} /> Send Connect Request
      </button>
    </div>
  );
}
