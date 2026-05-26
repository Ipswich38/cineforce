"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Info, User } from "lucide-react";

const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';
const AMBER = "#FFCC00";
const MUTED = "#636366";
const BORDER = "rgba(255,255,255,0.07)";

const TABS = [
  { href: "/",         icon: Home,   label: "Home" },
  { href: "/search",   icon: Search, label: "Find" },
  { href: "/about",    icon: Info,   label: "About" },
  { href: "/dashboard", icon: User,  label: "Account" },
] as const;

const HIDDEN_ON = ["/join", "/admin", "/auth"];

export default function BottomNav() {
  const path = usePathname();

  if (HIDDEN_ON.some((p) => path.startsWith(p))) return null;

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
      {TABS.map(({ href, icon: Icon, label }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 4, padding: "10px 4px 12px",
              color: active ? AMBER : MUTED,
              textDecoration: "none",
              transition: "color 0.15s",
              WebkitTapHighlightColor: "transparent",
            }}>
            <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
            <span style={{
              fontFamily: FT,
              fontSize: 10, fontWeight: active ? 600 : 400,
              letterSpacing: "0.01em",
              lineHeight: 1,
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
