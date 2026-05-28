import { NextRequest, NextResponse } from "next/server";

const PASSCODE = process.env.ADMIN_PASSCODE ?? "cineverse2026";

export async function POST(req: NextRequest) {
  const { passcode } = await req.json() as { passcode?: string };
  if (!passcode || passcode !== PASSCODE) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", PASSCODE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
