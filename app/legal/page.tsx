"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';
const BG = "#000"; const TEXT = "#F7F7F2"; const MUTED = "#8E8E93"; const AMBER = "#FFCC00";
const BORDER = "rgba(255,255,255,0.07)"; const SURFACE = "#101010";

const SECTIONS = ["Terms of Service", "Privacy Policy", "Data Privacy Act"] as const;
type Section = typeof SECTIONS[number];

const prose: React.CSSProperties = {
  fontFamily: FT, fontSize: 14, color: "rgba(247,247,242,0.72)",
  lineHeight: 1.75,
};
const h2Style: React.CSSProperties = {
  fontFamily: FD, fontSize: 16, fontWeight: 700, color: TEXT,
  letterSpacing: "-0.02em", marginTop: 28, marginBottom: 8,
};

export default function LegalPage() {
  const [active, setActive] = useState<Section>("Terms of Service");

  return (
    <div style={{ background: BG, minHeight: "100dvh" }}>
      <div style={{
        background: "rgba(12,12,15,0.95)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 40,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div className="app-container-narrow" style={{ height: 60, display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/settings" style={{ color: MUTED, display: "flex", alignItems: "center" }}>
            <ArrowLeft size={18} />
          </Link>
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT }}>Legal</span>
        </div>
      </div>

      <div className="app-container-narrow app-page-pad">
        {/* Tab bar */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.04)",
          borderRadius: 12, padding: 4, marginBottom: 28, gap: 3,
        }}>
          {SECTIONS.map((s) => (
            <button key={s} onClick={() => setActive(s)} style={{
              flex: 1, padding: "9px 4px", borderRadius: 9, border: "none", cursor: "pointer",
              background: active === s ? SURFACE : "transparent",
              color: active === s ? TEXT : MUTED,
              fontFamily: FT, fontSize: 11, fontWeight: active === s ? 600 : 400,
              boxShadow: active === s ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
            }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 20px" }}>

          {active === "Terms of Service" && (
            <div>
              <p style={{ ...h2Style, marginTop: 0 }}>1. Acceptance</p>
              <p style={prose}>By creating an account on CineForce, you agree to these Terms of Service. If you do not agree, do not use the platform.</p>

              <p style={h2Style}>2. Who Can Use CineForce</p>
              <p style={prose}>CineForce is open to film and media professionals (crew) and production companies or independent producers (clients). Service is currently available in selected regions only. You must be at least 18 years old to register.</p>

              <p style={h2Style}>3. Your Account</p>
              <p style={prose}>You are responsible for maintaining the confidentiality of your account. You agree to provide accurate information and keep your profile up to date. CineForce reserves the right to suspend accounts that contain false or misleading information.</p>

              <p style={h2Style}>4. Crew Profiles and Connections</p>
              <p style={prose}>Crew profiles are publicly visible. Contact details are only shared with clients after a connection request is accepted. CineForce does not guarantee employment or gig placement and is not a party to any agreement between crew and clients.</p>

              <p style={h2Style}>5. Prohibited Conduct</p>
              <p style={prose}>You may not use CineForce to harass other users, post false information, circumvent the platform to avoid fees, or violate any applicable law. Violations may result in immediate account termination.</p>

              <p style={h2Style}>6. Intellectual Property</p>
              <p style={prose}>You retain ownership of content you post. By posting, you grant CineForce a non-exclusive license to display your content on the platform for the purpose of operating the service.</p>

              <p style={h2Style}>7. Limitation of Liability</p>
              <p style={prose}>CineForce is provided &quot;as is.&quot; We are not liable for any loss of income, missed opportunities, or disputes arising from connections made through the platform.</p>

              <p style={h2Style}>8. Changes</p>
              <p style={prose}>We may update these terms at any time. Continued use of CineForce after changes constitutes acceptance of the updated terms.</p>

              <p style={{ ...prose, marginTop: 20, color: MUTED, fontSize: 12 }}>Last updated: May 2026</p>
            </div>
          )}

          {active === "Privacy Policy" && (
            <div>
              <p style={{ ...h2Style, marginTop: 0 }}>What We Collect</p>
              <p style={prose}>We collect information you provide when registering (name, email, role, city, skills) and information generated by using the platform (connection requests, messages, profile views).</p>

              <p style={h2Style}>How We Use It</p>
              <p style={prose}>Your data is used to operate the platform, match crew with clients, send relevant notifications, and improve our service. We do not sell your personal data to third parties.</p>

              <p style={h2Style}>Profile Visibility</p>
              <p style={prose}>Your public profile (name, role, city, skills, reel links) is visible to anyone on the platform. Your contact details (email, phone) are only shared with clients whose connection requests you have accepted.</p>

              <p style={h2Style}>Data Storage</p>
              <p style={prose}>Your data is stored securely using Supabase (hosted on AWS) with row-level security enforced. We use Vercel for application hosting, which may process data in transit.</p>

              <p style={h2Style}>Cookies</p>
              <p style={prose}>We use essential cookies to maintain your login session. We do not use tracking or advertising cookies.</p>

              <p style={h2Style}>Your Rights</p>
              <p style={prose}>You have the right to access, correct, and delete your personal data at any time. You can deactivate your account from Settings, which permanently removes your profile and associated data.</p>

              <p style={h2Style}>Third-Party Services</p>
              <p style={prose}>We use Google OAuth for authentication. Google&apos;s privacy policy applies to that authentication process. We do not receive your Google password.</p>

              <p style={h2Style}>Contact</p>
              <p style={prose}>For privacy concerns, email us at kreativloops@gmail.com.</p>

              <p style={{ ...prose, marginTop: 20, color: MUTED, fontSize: 12 }}>Last updated: May 2026</p>
            </div>
          )}

          {active === "Data Privacy Act" && (
            <div>
              <p style={{ ...h2Style, marginTop: 0 }}>Republic Act No. 10173</p>
              <p style={prose}>CineForce complies with the Philippine Data Privacy Act of 2012 (RA 10173) and its Implementing Rules and Regulations. This notice explains how we protect your personal information in accordance with Philippine law.</p>

              <p style={h2Style}>Personal Information Controller</p>
              <p style={prose}>KreativLoops / CineForce acts as the Personal Information Controller (PIC) for all personal data collected through this platform.</p>

              <p style={h2Style}>Data We Collect and Legal Basis</p>
              <p style={prose}>We collect your name, email address, professional role, city, and portfolio information. The legal basis for processing is your consent given at registration and the performance of a contract (providing the platform service).</p>

              <p style={h2Style}>Your Rights Under RA 10173</p>
              <p style={prose}>As a data subject, you have the right to:</p>
              <ul style={{ ...prose, paddingLeft: 20, marginTop: 8 }}>
                <li style={{ marginBottom: 6 }}><strong style={{ color: TEXT }}>Be informed</strong> — know what data we collect and why</li>
                <li style={{ marginBottom: 6 }}><strong style={{ color: TEXT }}>Access</strong> — request a copy of your personal data</li>
                <li style={{ marginBottom: 6 }}><strong style={{ color: TEXT }}>Correct</strong> — update inaccurate or incomplete data</li>
                <li style={{ marginBottom: 6 }}><strong style={{ color: TEXT }}>Erasure</strong> — request deletion of your data (available via Settings {">"} Deactivate Account)</li>
                <li style={{ marginBottom: 6 }}><strong style={{ color: TEXT }}>Data portability</strong> — receive your data in a structured format</li>
                <li style={{ marginBottom: 6 }}><strong style={{ color: TEXT }}>Object</strong> — object to processing for direct marketing or other purposes</li>
              </ul>

              <p style={h2Style}>Data Retention</p>
              <p style={prose}>We retain your personal data for as long as your account is active. Upon deactivation, all personal data is permanently deleted within 30 days. Aggregate, anonymized analytics data may be retained longer.</p>

              <p style={h2Style}>Data Security</p>
              <p style={prose}>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction, consistent with the requirements of RA 10173.</p>

              <p style={h2Style}>Complaints</p>
              <p style={prose}>If you believe your data privacy rights have been violated, you may file a complaint with the National Privacy Commission (NPC) at www.privacy.gov.ph or contact us at kreativloops@gmail.com.</p>

              <p style={{ ...prose, marginTop: 20, color: MUTED, fontSize: 12 }}>Last updated: May 2026 — Pursuant to RA 10173 and NPC Advisory Opinions</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
