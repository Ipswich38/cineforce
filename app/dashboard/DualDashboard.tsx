"use client";

import { useState, useEffect } from "react";
import DashboardClient from "./DashboardClient";
import ClientDashboard, { type SentRequest, type Favorite } from "./ClientDashboard";

const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';
const BG     = "#000000";
const TEXT   = "#F7F7F2";
const MUTED  = "#8E8E93";
const AMBER  = "#FFCC00";
const BORDER = "rgba(255,255,255,0.08)";

const STORAGE_KEY = "cv_dashboard_mode";

type Mode = "crew" | "hirer";

export default function DualDashboard({
  profile,
  userEmail,
  crewRequests,
  specializations,
  sentRequests,
  favorites,
}: {
  profile: Record<string, unknown>;
  userEmail: string;
  crewRequests: Record<string, unknown>[];
  specializations: string[];
  sentRequests: SentRequest[];
  favorites: Favorite[];
}) {
  const [mode, setMode] = useState<Mode>("crew");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Mode | null;
    if (saved === "hirer" || saved === "crew") setMode(saved);
    setMounted(true);
  }, []);

  function switchMode(m: Mode) {
    setMode(m);
    localStorage.setItem(STORAGE_KEY, m);
  }

  if (!mounted) return null;

  return (
    <div style={{ background: BG, minHeight: "100dvh" }}>
      {/* Mode switcher banner */}
      <div style={{
        background: "rgba(255,204,0,0.05)",
        borderBottom: "1px solid rgba(255,204,0,0.15)",
        padding: "10px 16px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 0,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{
          display: "flex", borderRadius: 999, overflow: "hidden",
          border: "1px solid rgba(255,204,0,0.2)",
        }}>
          <button
            onClick={() => switchMode("crew")}
            style={{
              padding: "8px 20px",
              background: mode === "crew" ? AMBER : "rgba(255,255,255,0.04)",
              color: mode === "crew" ? "#000" : MUTED,
              fontFamily: FT, fontSize: 13, fontWeight: mode === "crew" ? 700 : 500,
              border: "none", cursor: "pointer", transition: "all 0.15s",
            }}>
            🎬 Crew Mode
          </button>
          <button
            onClick={() => switchMode("hirer")}
            style={{
              padding: "8px 20px",
              background: mode === "hirer" ? AMBER : "rgba(255,255,255,0.04)",
              color: mode === "hirer" ? "#000" : MUTED,
              fontFamily: FT, fontSize: 13, fontWeight: mode === "hirer" ? 700 : 500,
              border: "none", cursor: "pointer", transition: "all 0.15s",
            }}>
            🎥 Hirer Mode
          </button>
        </div>
      </div>

      {mode === "crew" ? (
        <DashboardClient
          profile={profile}
          requests={crewRequests as Parameters<typeof DashboardClient>[0]["requests"]}
          specializations={specializations}
        />
      ) : (
        <ClientDashboard
          profile={profile}
          sentRequests={sentRequests}
          favorites={favorites}
          userEmail={userEmail}
        />
      )}
    </div>
  );
}
