import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Config ──────────────────────────────────────────────────────────────────
// Set these in Vercel Dashboard → Project Settings → Environment Variables
//
//  GEOLOCK_BYPASS_KEY   optional string — requests with header X-Bypass-Geo: <value>
//                        skip the geolock (for your own testing from outside PH)
//
//  VPN_DETECT_API_KEY   optional — ipqualityscore.com API key
//                        when set, every sign-up / join request is also checked for VPN
//
//  UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
//                        optional — enables the global visitor cap
//                        Set up: Vercel Dashboard → Storage → Create KV → upstash
//
//  MAX_CONCURRENT_VISITORS  default 10000
// ─────────────────────────────────────────────────────────────────────────────

const MAX_VISITORS   = Number(process.env.MAX_CONCURRENT_VISITORS ?? 10_000);
const BYPASS_KEY     = process.env.GEOLOCK_BYPASS_KEY ?? "";
// In local dev Vercel doesn't inject geo → skip geolock; always on in production
const ENFORCE_GEO    = !!process.env.VERCEL;

// Paths that must always be accessible regardless of geo / capacity
const ALWAYS_ALLOW = [
  "/not-available",
  "/capacity",
  "/auth/callback",
  "/favicon.ico",
  "/_next",
  "/api/version",
];

// Per-IP request counter (per edge instance — good enough for single-IP floods)
const ipBucket = new Map<string, { n: number; resetAt: number }>();
const IP_LIMIT        = 120; // requests per minute per IP
const IP_WINDOW_MS    = 60_000;
const BUCKET_MAX_SIZE = 20_000; // prevent unbounded memory growth

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf)).*)"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow critical paths
  if (ALWAYS_ALLOW.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // ── Bypass header (for internal testing from outside PH) ─────────────────
  if (BYPASS_KEY && request.headers.get("x-bypass-geo") === BYPASS_KEY) {
    return NextResponse.next();
  }

  // ── 1. Geolock — Philippines only ─────────────────────────────────────────
  if (ENFORCE_GEO) {
    // Vercel sets x-vercel-ip-country on Edge Network requests; undefined in local dev
    const country = request.headers.get("x-vercel-ip-country");
    if (country && country !== "PH") {
      return NextResponse.redirect(new URL("/not-available", request.url));
    }
  }

  // ── 2. Global visitor cap (optional — requires Upstash Redis env vars) ────
  const redisUrl   = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken && !pathname.startsWith("/api/")) {
    try {
      // Sliding 5-minute window keyed by time slot
      const slot = Math.floor(Date.now() / 300_000);
      const key  = `cv:visitors:${slot}`;

      // Increment via Upstash REST API (no SDK import needed — works in Edge)
      const incrRes = await fetch(`${redisUrl}/incr/${key}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
        cache: "no-store",
      });
      const { result: count } = (await incrRes.json()) as { result: number };

      // Set expiry on first hit
      if (count === 1) {
        await fetch(`${redisUrl}/expire/${key}/600`, {
          headers: { Authorization: `Bearer ${redisToken}` },
          cache: "no-store",
        });
      }

      if (count > MAX_VISITORS) {
        return NextResponse.redirect(new URL("/capacity", request.url));
      }
    } catch {
      // Redis unavailable — fail open (let visitor through)
    }
  }

  // ── 3. Per-IP rate limit ──────────────────────────────────────────────────
  const ip  = (
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anon"
  );
  const now = Date.now();

  if (ipBucket.size >= BUCKET_MAX_SIZE) {
    // Prune expired entries when bucket is large
    for (const [k, v] of ipBucket) if (now > v.resetAt) ipBucket.delete(k);
  }

  const bucket = ipBucket.get(ip);
  if (bucket) {
    if (now < bucket.resetAt) {
      if (bucket.n >= IP_LIMIT) {
        return new NextResponse("Too many requests — please slow down.", {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)) },
        });
      }
      bucket.n++;
    } else {
      ipBucket.set(ip, { n: 1, resetAt: now + IP_WINDOW_MS });
    }
  } else {
    ipBucket.set(ip, { n: 1, resetAt: now + IP_WINDOW_MS });
  }

  return NextResponse.next();
}
