"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const VIDEO_PAGES = ["/"];

function isSlowConnection(): boolean {
  const conn = (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  return ["slow-2g", "2g"].includes(conn.effectiveType ?? "");
}

export default function CinematicFX() {
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOpacity, setVideoOpacity] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const onVideoPage = VIDEO_PAGES.includes(pathname);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!onVideoPage || isSlowConnection()) {
        setShowVideo(false);
        setVideoOpacity(0);
        return;
      }
      setShowVideo(true);
    }, 0);
    return () => clearTimeout(t);
  }, [onVideoPage]);

  return (
    <>
      <style>{`
        @keyframes cv-grain {
          0%   { transform: translate(0, 0) }
          10%  { transform: translate(-2%, -3%) }
          20%  { transform: translate(3%, -1%) }
          30%  { transform: translate(-1%,  4%) }
          40%  { transform: translate( 4%, -2%) }
          50%  { transform: translate(-3%,  3%) }
          60%  { transform: translate( 2%,  1%) }
          70%  { transform: translate(-4%, -1%) }
          80%  { transform: translate( 1%,  3%) }
          90%  { transform: translate(-2%, -4%) }
          100% { transform: translate(0, 0) }
        }
        .cv-grain { animation: cv-grain 0.35s steps(1) infinite; }
      `}</style>

      {/* Background video — only on fast connections, fades in after load */}
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onCanPlayThrough={() => setVideoOpacity(0.18)}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 9994,
            pointerEvents: "none",
            opacity: videoOpacity,
            transition: "opacity 1.8s ease",
          }}
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* Film grain — animated SVG noise texture */}
      <div
        aria-hidden="true"
        className="cv-grain"
        style={{
          position: "fixed",
          inset: "-10%",
          width: "120%",
          height: "120%",
          zIndex: 9998,
          pointerEvents: "none",
          opacity: 0.038,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='260' height='260' filter='url(%23g)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "220px 220px",
        }}
      />

      {/* Vignette — soft cinematic edge darkening */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9997,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(0,0,0,0.72) 100%)",
        }}
      />
    </>
  );
}
