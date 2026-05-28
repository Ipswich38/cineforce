export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { MONTHLY_PRICE_PHP } from "@/lib/subscription";
import Link from "next/link";
import { ArrowLeft, Check, Heart, Star, Shield, Users } from "lucide-react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const BG      = "#000000";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";

const FEATURES = [
  "Full profile visible in crew search",
  "Send and receive connection requests",
  "Save crew to your shortlist",
  "Contact unlocked after booking accepted",
  "Availability badge on your profile",
];

export default async function SubscribePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isFoundingMember = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("premium_status")
      .eq("id", user.id)
      .single();
    isFoundingMember = !!profile;
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
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, letterSpacing: "-0.02em" }}>
            CineVerse
          </span>
          <div style={{ width: 64 }} />
        </div>
      </div>

      <div className="app-container-narrow app-page-pad" style={{ maxWidth: 480 }}>

        {/* Founding member badge */}
        {isFoundingMember && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", borderRadius: 12, marginBottom: 28,
            background: "rgba(255,204,0,0.07)", border: "1px solid rgba(255,204,0,0.2)",
          }}>
            <Star size={14} style={{ color: AMBER, flexShrink: 0 }} />
            <p style={{ fontFamily: FT, fontSize: 13, color: AMBER, fontWeight: 600 }}>
              You are a Founding Member. Full access during beta.
            </p>
          </div>
        )}

        {/* Heading */}
        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontFamily: FT, fontSize: 12, fontWeight: 700, color: AMBER,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10,
          }}>
            Beta phase
          </p>
          <h1 style={{
            fontFamily: FD, fontWeight: 700,
            fontSize: "clamp(1.75rem, 5vw, 2.25rem)",
            color: TEXT, letterSpacing: "-0.03em", marginBottom: 8,
          }}>
            Founding Members
          </h1>
          <p style={{ fontFamily: FT, fontSize: 15, color: MUTED, lineHeight: 1.65 }}>
            CineVerse is in beta. Early members get full access at no charge while we build and improve the platform together.
          </p>
        </div>

        {/* What you get */}
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 20, padding: "clamp(20px,5%,28px)", marginBottom: 16,
        }}>
          <p style={{ fontFamily: FT, fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            What you get
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FEATURES.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Check size={14} style={{ color: "#32D74B", flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontFamily: FT, fontSize: 14, color: TEXT, lineHeight: 1.4 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donate card */}
        <div style={{
          background: SURFACE,
          border: "1px solid rgba(255,204,0,0.22)",
          borderRadius: 20, padding: "clamp(20px,5%,28px)", marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Heart size={16} style={{ color: "#FF453A" }} />
            <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 16, color: TEXT }}>
              Support the build
            </p>
          </div>
          <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.65, marginBottom: 18 }}>
            No payment required. But if CineVerse is useful to you and your work, you are welcome to contribute any amount you decide. Every peso goes directly to development.
          </p>
          <div style={{
            padding: "16px", borderRadius: 14,
            background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`,
            textAlign: "center",
          }}>
            <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: TEXT, marginBottom: 4 }}>
              GCash donations coming soon
            </p>
            <p style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>
              We will share details when it is ready.
            </p>
          </div>
        </div>

        {/* What happens at launch */}
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: "clamp(16px,4%,22px)", marginBottom: 28,
        }}>
          <p style={{ fontFamily: FT, fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            At official launch
          </p>
          <p style={{ fontFamily: FT, fontSize: 14, color: TEXT, lineHeight: 1.65, marginBottom: 10 }}>
            When CineVerse launches publicly, the plan will be{" "}
            <strong style={{ color: AMBER }}>₱{MONTHLY_PRICE_PHP}/month</strong> with a 14-day free trial for new members.
          </p>
          <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
            Founding Members will be notified ahead of the transition.
          </p>
        </div>

        {/* Trust signals */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={14} style={{ color: MUTED, flexShrink: 0 }} />
            <span style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>No charge until official launch.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={14} style={{ color: MUTED, flexShrink: 0 }} />
            <span style={{ fontFamily: FT, fontSize: 13, color: MUTED }}>Same price for crew and hirers when billing goes live.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
