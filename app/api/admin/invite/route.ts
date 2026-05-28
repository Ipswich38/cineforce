import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const PASSCODE = process.env.ADMIN_PASSCODE ?? "cineverse2026";

function authorized(req: NextRequest) {
  return req.cookies.get("admin_auth")?.value === PASSCODE;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { count = 1, maxUses = 1, expiresInDays } = await req.json() as {
    count?: number;
    maxUses?: number;
    expiresInDays?: number;
  };

  const n = Math.min(Math.max(1, count), 50);
  const expires = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
    : null;

  const admin = createAdminClient();
  const codes = Array.from({ length: n }, () => ({
    code:       generateCode(),
    max_uses:   Math.max(1, maxUses),
    used_count: 0,
    expires_at: expires,
  }));

  const { data, error } = await admin.from("invite_codes").insert(codes).select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data });
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("invite_codes")
    .select("id, code, max_uses, used_count, expires_at, created_at")
    .order("created_at", { ascending: false });

  return NextResponse.json({ codes: data ?? [] });
}
