"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, CheckCircle2, Shield, FileText, Zap } from "lucide-react";

const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';
const AMBER  = "#FFCC00";
const TEXT   = "#F7F7F2";
const MUTED  = "#8E8E93";
const BORDER = "rgba(255,255,255,0.09)";
const SURFACE = "rgba(16,16,20,0.98)";

type Jurisdiction = "PH" | "EU" | "US" | "OTHER";

const EU_COUNTRIES = new Set([
  "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GB","GR","HR",
  "HU","IE","IT","LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK",
  "NO","IS","LI", // EEA
]);

async function detectJurisdiction(): Promise<Jurisdiction> {
  try {
    const res = await fetch("https://api.country.is/", { signal: AbortSignal.timeout(3000) });
    const { country } = await res.json() as { country: string };
    if (country === "PH") return "PH";
    if (EU_COUNTRIES.has(country)) return "EU";
    if (country === "US") return "US";
    return "OTHER";
  } catch {
    // Timezone fallback
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz.startsWith("Asia/Manila")) return "PH";
    if (tz.startsWith("Europe/")) return "EU";
    if (tz.startsWith("America/")) return "US";
    return "PH";
  }
}

function Section({ icon: Icon, color, title, children }: {
  icon: React.ElementType; color: string; title: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: `${color}14`, border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={14} style={{ color }} />
        </div>
        <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 13, color: TEXT, letterSpacing: "-0.01em" }}>
          {title}
        </p>
      </div>
      <div style={{ fontFamily: FT, fontSize: 13, color: "rgba(247,247,242,0.72)", lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 5 }}>
      <span style={{ color: MUTED, flexShrink: 0, marginTop: 1 }}>·</span>
      <span>{children}</span>
    </div>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <span style={{ color: TEXT, fontWeight: 600 }}>{children}</span>;
}

export default function LegalModal({ onAgree, onDecline }: {
  onAgree: () => void;
  onDecline: () => void;
}) {
  const [jurisdiction,      setJurisdiction]      = useState<Jurisdiction>("PH");
  const [scrolledToBottom,  setScrolledToBottom]  = useState(false);
  const [checks, setChecks] = useState({ terms: false, privacy: false, beta: false });
  const scrollRef = useRef<HTMLDivElement>(null);

  const allChecked = checks.terms && checks.privacy && checks.beta;

  useEffect(() => {
    detectJurisdiction().then(setJurisdiction);
  }, []);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || scrolledToBottom) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      setScrolledToBottom(true);
    }
  }

  function toggle(key: keyof typeof checks) {
    if (!scrolledToBottom) return;
    setChecks((c) => ({ ...c, [key]: !c[key] }));
  }

  const privacyLabel = jurisdiction === "EU" ? "Privacy Policy (GDPR)" :
                       jurisdiction === "US" ? "Privacy Policy (CCPA)" :
                       "Privacy Policy (RA 10173)";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "flex-end",
      background: "rgba(0,0,0,0.72)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      padding: "0 0 env(safe-area-inset-bottom, 0px)",
    }}>
      {/* Modal sheet */}
      <div style={{
        width: "100%",
        maxHeight: "92dvh",
        background: SURFACE,
        border: "1px solid rgba(255,255,255,0.1)",
        borderTop: "1px solid rgba(255,255,255,0.14)",
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -8px 60px rgba(0,0,0,0.6), 0 2px 0 rgba(255,255,255,0.04) inset",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "14px 22px 12px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Shield size={16} style={{ color: AMBER, flexShrink: 0 }} />
            <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, letterSpacing: "-0.02em" }}>
              Before you continue
            </h2>
          </div>
          <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
            Please read and accept the following — scroll to the bottom to unlock agreement.
          </p>
        </div>

        {/* Scrollable legal content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1, overflowY: "auto", padding: "20px 22px 8px",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
          }}>

          {/* Beta notice */}
          <Section icon={Zap} color="#FF9F0A" title="Beta Platform Notice">
            <Bullet>CineForce is in <Strong>public beta</Strong> — actively under development</Bullet>
            <Bullet>The Platform is <Strong>the first of its kind in the Philippines</Strong> for film and media crew</Bullet>
            <Bullet>Features, pricing, and availability may change before full launch</Bullet>
            <Bullet>The platform is protected under applicable intellectual property laws. Copying, cloning, or reproducing this platform is prohibited</Bullet>
            <Bullet>Service interruptions may occur; data may be migrated as the platform evolves</Bullet>
            <Bullet>By continuing, you accept the beta nature of this service and agree not to hold KreativLoops or CineForce liable for beta-related limitations</Bullet>
          </Section>

          {/* Terms of Use */}
          <Section icon={FileText} color="#4A9EFF" title="Terms of Use">
            <Bullet><Strong>Eligibility.</Strong> You must be at least 18 years old and a professional in the film, TV, or media production industry.</Bullet>
            <Bullet><Strong>Truthful information.</Strong> You agree to provide accurate profile details. Fake identities, false credentials, or misleading information will result in removal.</Bullet>
            <Bullet><Strong>Acceptable use.</Strong> No spam, harassment, scraping, or unlawful activity. No impersonation of other individuals or production companies.</Bullet>
            <Bullet><Strong>Your content.</Strong> Your profile is publicly visible. Contact details are gated — only shared after you accept a connection request. You retain ownership of your content and grant CineForce a non-exclusive license to display it on the Platform.</Bullet>
            <Bullet><Strong>No warranties.</Strong> The Platform is provided &quot;as-is&quot; during beta. CineForce and KreativLoops are not liable for missed opportunities, failed connections, or data loss.</Bullet>
            <Bullet><Strong>Account suspension.</Strong> Accounts that violate these terms may be suspended or permanently removed without prior notice.</Bullet>
            <Bullet><Strong>Governing law.</Strong> These Terms are governed by the laws of the Republic of the Philippines. Any disputes are subject to Philippine courts and jurisdiction.</Bullet>
            <Bullet><Strong>Updates.</Strong> We may update these Terms. Continued use after updates constitutes acceptance. Material changes will be communicated via email.</Bullet>
          </Section>

          {/* Privacy Policy */}
          <Section icon={Shield} color="#32D74B" title={privacyLabel}>
            <Bullet><Strong>What we collect.</Strong> Name, email, professional profile details you provide; and technical data (device type, IP address, usage patterns) generated by your use.</Bullet>
            <Bullet><Strong>How we use it.</Strong> To display your profile to productions, process connection requests, send platform notifications, and improve the service. We do not use your data for advertising.</Bullet>
            <Bullet><Strong>Who we share with.</Strong> Supabase (database & authentication), Vercel (hosting), Resend (email delivery). We <Strong>do not sell your data</Strong> to any third party.</Bullet>
            <Bullet><Strong>Your rights.</Strong> You may access, correct, or delete your data at any time from your profile settings or by emailing <Strong>kreativloops@gmail.com</Strong>.</Bullet>
            <Bullet><Strong>Retention.</Strong> Your data is kept for as long as your account is active. Deleted accounts are purged within 30 days.</Bullet>

            {jurisdiction === "PH" && (
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(50,215,75,0.06)", border: "1px solid rgba(50,215,75,0.15)" }}>
                <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Philippines — RA 10173</p>
                <p>We comply with the <Strong>Data Privacy Act of 2012</Strong>. You have rights to access, correct, block, and erasure of your personal data. To file a complaint, contact the National Privacy Commission at <Strong>www.privacy.gov.ph</Strong>.</p>
              </div>
            )}

            {jurisdiction === "EU" && (
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(74,158,255,0.06)", border: "1px solid rgba(74,158,255,0.15)" }}>
                <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>EU / UK — GDPR</p>
                <p>We process your data under the legal bases of <Strong>consent and legitimate interest</Strong>. You have rights to data portability and to lodge a complaint with your local Data Protection Authority. Data is not transferred outside the EEA without adequate safeguards.</p>
              </div>
            )}

            {jurisdiction === "US" && (
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(175,82,222,0.06)", border: "1px solid rgba(175,82,222,0.15)" }}>
                <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>California — CCPA</p>
                <p>California residents have the right to <Strong>know, delete, and opt out</Strong> of the sale of personal information. We do not sell personal data. To exercise your rights, contact kreativloops@gmail.com.</p>
              </div>
            )}

            {jurisdiction === "OTHER" && (
              <Bullet><Strong>International users.</Strong> We apply global data protection principles. You have the right to access and delete your data by contacting kreativloops@gmail.com.</Bullet>
            )}
          </Section>

          {/* Spacer so last section isn't flush against bottom */}
          <div style={{ height: 16 }} />
        </div>

        {/* Scroll hint */}
        {!scrolledToBottom && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            padding: "8px", background: "rgba(255,179,0,0.06)", borderTop: "1px solid rgba(255,179,0,0.12)",
            flexShrink: 0,
          }}>
            <ChevronDown size={13} style={{ color: AMBER }} />
            <p style={{ fontFamily: FT, fontSize: 12, color: AMBER, fontWeight: 500 }}>Scroll to the bottom to continue</p>
            <ChevronDown size={13} style={{ color: AMBER }} />
          </div>
        )}

        {/* Footer: checkboxes + buttons */}
        <div style={{ padding: "16px 22px 20px", borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>

          {/* Checkboxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18, opacity: scrolledToBottom ? 1 : 0.35, transition: "opacity 0.3s" }}>
            {[
              { key: "terms"   as const, label: "I have read and agree to the Terms of Use" },
              { key: "privacy" as const, label: `I have read and agree to the ${privacyLabel}` },
              { key: "beta"    as const, label: "I understand this is a beta platform and accept its limitations" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                disabled={!scrolledToBottom}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: "none", border: "none", cursor: scrolledToBottom ? "pointer" : "not-allowed",
                  textAlign: "left", padding: 0,
                }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  border: checks[key] ? "none" : `1.5px solid ${BORDER}`,
                  background: checks[key] ? AMBER : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  {checks[key] && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontFamily: FT, fontSize: 13, color: checks[key] ? TEXT : MUTED, lineHeight: 1.5, transition: "color 0.15s" }}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Agree button */}
          <button
            type="button"
            disabled={!allChecked}
            onClick={onAgree}
            style={{
              width: "100%", height: 52, borderRadius: 999, border: "none",
              background: allChecked ? AMBER : "rgba(255,179,0,0.2)",
              color: allChecked ? "#000" : "rgba(0,0,0,0.4)",
              fontFamily: FT, fontSize: 15, fontWeight: 700,
              cursor: allChecked ? "pointer" : "not-allowed",
              marginBottom: 10,
              transition: "all 0.2s",
              boxShadow: allChecked ? "0 4px 20px rgba(255,179,0,0.3), 0 1px 0 rgba(255,255,255,0.3) inset" : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}
            className={allChecked ? "transition-all active:scale-[0.98]" : ""}>
            {allChecked && <CheckCircle2 size={16} />}
            I Agree &amp; Continue
          </button>

          {/* Decline */}
          <button
            type="button"
            onClick={onDecline}
            style={{
              width: "100%", padding: "12px", borderRadius: 999,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: MUTED, fontFamily: FT, fontSize: 14,
              cursor: "pointer",
            }}
            className="transition-all hover:border-white/20 active:scale-[0.98]">
            Decline
          </button>

          <p style={{ fontFamily: FT, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
            Declining means you will not be able to use CineForce. You can return anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers for parent components ── */
export const LEGAL_VERSION = "v1";
export const LEGAL_KEY = `cv_legal_${LEGAL_VERSION}`;

export function hasAgreedToTerms(): boolean {
  try { return localStorage.getItem(LEGAL_KEY) === "agreed"; } catch { return false; }
}

export function recordAgreement(): void {
  try { localStorage.setItem(LEGAL_KEY, "agreed"); } catch { /* ignore */ }
}
