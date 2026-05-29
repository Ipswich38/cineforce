"use client";

import { useEffect, useState } from "react";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

export default function CapacityPage() {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { window.location.href = "/"; return 60; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main style={{
      minHeight: "100dvh",
      background: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(255,159,10,0.08)",
          border: "1px solid rgba(255,159,10,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px",
          fontSize: 30,
        }}>
          ⏳
        </div>

        <h1 style={{
          fontFamily: FD, fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.2rem)",
          color: "#F7F7F2", letterSpacing: "-0.03em", marginBottom: 14,
        }}>
          We&apos;re at full capacity
        </h1>

        <p style={{
          fontFamily: FT, fontSize: 16, color: "#8E8E93",
          lineHeight: 1.7, marginBottom: 32,
        }}>
          CineVerse is experiencing high traffic right now. We&apos;ll automatically try again in a moment.
        </p>

        {/* Countdown ring */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          border: "3px solid rgba(255,204,0,0.15)",
          borderTop: "3px solid #FFCC00",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px",
          animation: "spin 1s linear infinite",
        }}>
          <span style={{ fontFamily: FD, fontWeight: 800, fontSize: 22, color: "#FFCC00" }}>
            {seconds}
          </span>
        </div>

        <p style={{ fontFamily: FT, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
          Retrying automatically in {seconds}s
        </p>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}
