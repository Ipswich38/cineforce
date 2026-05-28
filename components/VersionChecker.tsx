"use client";

import { useEffect } from "react";

const KEY = "eb_version";

export default function VersionChecker() {
  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const { version } = await res.json();
        const stored = localStorage.getItem(KEY);
        if (!stored) { localStorage.setItem(KEY, version); return; }
        if (stored !== version) {
          localStorage.setItem(KEY, version);
          window.location.reload();
        }
      } catch {}
    }

    check();
    const interval = setInterval(check, 5 * 60 * 1000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") check(); });
    return () => clearInterval(interval);
  }, []);

  return null;
}
