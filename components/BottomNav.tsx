"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Search, Info, User, X, ArrowRight,
  LayoutDashboard, Settings, CreditCard,
  Inbox, Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';
const AMBER  = "#FFCC00";
const MUTED  = "#636366";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT   = "#F7F7F2";

const HIDDEN_ON = ["/join", "/admin", "/auth"];

type Profile = { slug: string | null; account_type: string | null } | null;

function TabItem({
  href, icon: Icon, label, active,
}: { href: string; icon: React.ElementType; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 4, padding: "10px 4px 12px",
        color: active ? AMBER : MUTED,
        textDecoration: "none", transition: "color 0.15s",
        WebkitTapHighlightColor: "transparent",
      }}>
      <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
      <span style={{ fontFamily: FT, fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: "0.01em", lineHeight: 1 }}>
        {label}
      </span>
    </Link>
  );
}

export default function BottomNav() {
  const path = usePathname();

  const [isLoggedIn, setIsLoggedIn]  = useState<boolean | null>(null);
  const [profile,    setProfile]     = useState<Profile>(null);
  const [showSheet,  setShowSheet]   = useState(false);

  useEffect(() => {
    const sb = createClient();

    async function load() {
      const { data: { user } } = await sb.auth.getUser();
      setIsLoggedIn(!!user);
      if (user) {
        const { data } = await sb.from("profiles")
          .select("slug, account_type")
          .eq("id", user.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    }

    load();

    const { data: { subscription } } = sb.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
      if (!session?.user) setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (HIDDEN_ON.some((p) => path.startsWith(p))) return null;

  const isClient = profile?.account_type === "client";

  // ── Logged-in nav ────────────────────────────────────────────────────────────
  if (isLoggedIn) {
    const crewCardHref = profile?.slug ? `/crew/${profile.slug}` : "/dashboard";

    const loggedInTabs = isClient
      ? [
          { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
          { href: "/search",    icon: Users,            label: "Find Crew" },
          { href: "/messages",  icon: Inbox,            label: "Messages" },
          { href: "/settings",  icon: Settings,         label: "Account" },
        ]
      : [
          { href: "/dashboard",  icon: LayoutDashboard, label: "Home" },
          { href: "/search",     icon: Search,          label: "Find" },
          { href: "/messages",   icon: Inbox,           label: "Messages" },
          { href: crewCardHref,  icon: CreditCard,      label: "My Card" },
          { href: "/settings",   icon: Settings,        label: "Account" },
        ];

    return (
      <nav
        className="md:hidden"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: "rgba(10,10,12,0.96)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          borderTop: `1px solid ${BORDER}`,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          display: "flex",
        }}>
        {loggedInTabs.map(({ href, icon, label }) => {
          const active = href === "/dashboard"
            ? path === "/dashboard"
            : href === "/settings"
              ? path.startsWith("/settings") || path.startsWith("/legal")
              : path.startsWith(href);
          return <TabItem key={href} href={href} icon={icon} label={label} active={active} />;
        })}
      </nav>
    );
  }

  // ── Public nav ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Auth sheet */}
      {showSheet && (
        <>
          <div
            onClick={() => setShowSheet(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 48,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />
          <div
            className="menu-slide"
            style={{
              position: "fixed",
              bottom: "calc(68px + env(safe-area-inset-bottom, 0px))",
              left: 12, right: 12, zIndex: 49,
              background: "rgba(16,16,20,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: "22px 20px 20px",
              boxShadow: "0 -4px 40px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.04) inset",
            }}>
            <div style={{
              position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
              width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)",
            }} />
            <button
              onClick={() => setShowSheet(false)}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "50%", width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: MUTED,
              }}>
              <X size={13} />
            </button>
            <div style={{ marginBottom: 18, paddingRight: 36 }}>
              <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, color: TEXT, marginBottom: 4 }}>
                Your next set is a tap away.
              </p>
              <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                Join or log in to manage your CineForce card.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/auth?intent=join"
                onClick={() => setShowSheet(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "14px", borderRadius: 999,
                  background: AMBER, color: "#000",
                  fontFamily: FT, fontSize: 15, fontWeight: 700,
                  textDecoration: "none",
                }}
                className="transition-all hover:opacity-90 active:scale-[0.98]">
                Sign up free <ArrowRight size={14} />
              </Link>
              <Link href="/auth"
                onClick={() => setShowSheet(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "13px", borderRadius: 999,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: TEXT,
                  fontFamily: FT, fontSize: 15, fontWeight: 500,
                  textDecoration: "none",
                }}
                className="transition-all hover:bg-white/5 active:scale-[0.98]">
                Log in
              </Link>
            </div>
          </div>
        </>
      )}

      <nav
        className="md:hidden"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: "rgba(10,10,12,0.96)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          borderTop: `1px solid ${BORDER}`,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          display: "flex",
        }}>
        {[
          { href: "/",       icon: Home,   label: "Home" },
          { href: "/search", icon: Search, label: "Find" },
          { href: "/about",  icon: Info,   label: "About" },
        ].map(({ href, icon, label }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return <TabItem key={href} href={href} icon={icon} label={label} active={active} />;
        })}

        <button
          onClick={() => setShowSheet((v) => !v)}
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 4, padding: "10px 4px 12px",
            color: showSheet ? AMBER : MUTED,
            background: "none", border: "none", cursor: "pointer",
            transition: "color 0.15s",
            WebkitTapHighlightColor: "transparent",
          }}>
          <User size={22} strokeWidth={showSheet ? 2.2 : 1.7} />
          <span style={{ fontFamily: FT, fontSize: 10, fontWeight: showSheet ? 600 : 400, letterSpacing: "0.01em", lineHeight: 1 }}>
            Account
          </span>
        </button>
      </nav>
    </>
  );
}
