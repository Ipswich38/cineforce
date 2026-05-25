"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Send, CheckCircle2, Clock, Phone, Mail, Lock, UserCircle } from "lucide-react";

const FONT_DISPLAY = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FONT_TEXT    = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

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
    border: "1px solid rgba(0,0,0,0.12)", background: "#F5F5F7",
    color: "#1C1C1E", fontFamily: FONT_TEXT, fontSize: 14, outline: "none",
  } as const;

  if (isOwn) {
    return (
      <div className="text-center">
        <UserCircle size={28} style={{ color: "#AEAEB2", margin: "0 auto 8px" }} />
        <p style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#6D6D72" }}>This is your profile.</p>
        <Link href="/dashboard"
          style={{
            display: "block", marginTop: 12, padding: "10px", borderRadius: 12,
            background: "rgba(0,122,255,0.08)", color: "#007AFF",
            fontFamily: FONT_TEXT, fontSize: 14, fontWeight: 500, textAlign: "center",
          }}>
          Edit Profile →
        </Link>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center">
        <Lock size={24} style={{ color: "#AEAEB2", margin: "0 auto 10px" }} />
        <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: "#1C1C1E", marginBottom: 6 }}>
          Contact hidden
        </p>
        <p style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "#6D6D72", marginBottom: 16, lineHeight: 1.5 }}>
          Sign in to send a connection request to {crewName}.
        </p>
        <Link href="/auth"
          style={{
            display: "block", padding: "11px", borderRadius: 12,
            background: "#007AFF", color: "#fff",
            fontFamily: FONT_TEXT, fontSize: 15, fontWeight: 500, textAlign: "center",
          }}>
          Sign In to Connect
        </Link>
      </div>
    );
  }

  if (reqStatus === "accepted" && contactDetails) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} style={{ color: "#34C759" }} />
          <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: "#1C1C1E" }}>Connected!</p>
        </div>
        <p style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "#6D6D72", marginBottom: 14 }}>
          {crewName} accepted your request. Contact details:
        </p>
        <div className="flex flex-col gap-2">
          {contactDetails.phone && (
            <a href={`tel:${contactDetails.phone}`}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:opacity-80"
              style={{ background: "rgba(52,199,89,0.08)", border: "1px solid rgba(52,199,89,0.2)" }}>
              <Phone size={15} style={{ color: "#34C759" }} />
              <span style={{ fontFamily: FONT_TEXT, fontSize: 14, fontWeight: 500, color: "#1C1C1E" }}>{contactDetails.phone}</span>
            </a>
          )}
          {contactDetails.email && (
            <a href={`mailto:${contactDetails.email}`}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:opacity-80"
              style={{ background: "rgba(0,122,255,0.07)", border: "1px solid rgba(0,122,255,0.15)" }}>
              <Mail size={15} style={{ color: "#007AFF" }} />
              <span style={{ fontFamily: FONT_TEXT, fontSize: 14, fontWeight: 500, color: "#1C1C1E" }}>{contactDetails.email}</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  if (step === "sent" || reqStatus === "pending") {
    return (
      <div className="text-center">
        <Clock size={28} style={{ color: "#FF9500", margin: "0 auto 10px" }} />
        <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: "#1C1C1E", marginBottom: 6 }}>
          Request sent
        </p>
        <p style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "#6D6D72", lineHeight: 1.5 }}>
          Waiting for {crewName} to accept. You&apos;ll get their contact details once they respond.
        </p>
      </div>
    );
  }

  if (reqStatus === "declined") {
    return (
      <div className="text-center">
        <p style={{ fontFamily: FONT_TEXT, fontSize: 14, color: "#FF3B30" }}>
          {crewName} is not available for this project.
        </p>
      </div>
    );
  }

  if (step === "form") {
    return (
      <div>
        <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: "#1C1C1E", marginBottom: 4 }}>
          Connect with {crewName}
        </p>
        <p style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "#6D6D72", marginBottom: 14 }}>
          Introduce your project. They&apos;ll share their contact once they accept.
        </p>

        {error && (
          <p style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "#FF3B30", marginBottom: 8 }}>{error}</p>
        )}

        <div className="flex flex-col gap-2 mb-3">
          <input
            type="text"
            placeholder="Project name *"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={inputStyle}
          />
          <textarea
            placeholder="Short message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
          />
        </div>

        <div className="flex gap-2">
          <button onClick={() => setStep("idle")}
            style={{
              flex: 1, padding: "10px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.10)",
              background: "#F5F5F7", color: "#6D6D72", fontFamily: FONT_TEXT, fontSize: 14,
            }}>
            Cancel
          </button>
          <button onClick={sendRequest} disabled={loading}
            style={{
              flex: 2, padding: "10px", borderRadius: 12, border: "none",
              background: loading ? "rgba(0,122,255,0.5)" : "#007AFF",
              color: "#fff", fontFamily: FONT_TEXT, fontSize: 14, fontWeight: 500,
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
        <Lock size={16} style={{ color: "#AEAEB2" }} />
        <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: "#1C1C1E" }}>
          Contact hidden
        </p>
      </div>
      <p style={{ fontFamily: FONT_TEXT, fontSize: 13, color: "#6D6D72", marginBottom: 16, lineHeight: 1.5 }}>
        Send a connect request with your project details. {crewName} will share their contact once they accept.
      </p>
      <button onClick={() => setStep("form")}
        style={{
          width: "100%", padding: "12px", borderRadius: 14, border: "none",
          background: "#007AFF", color: "#fff",
          fontFamily: FONT_TEXT, fontSize: 15, fontWeight: 500,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          boxShadow: "0 4px 16px rgba(0,122,255,0.25)",
        }}
        className="transition-all hover:opacity-85 active:scale-[0.98]">
        <Send size={15} /> Send Connect Request
      </button>
    </div>
  );
}
