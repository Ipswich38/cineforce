import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json() as { code?: string };
  if (!code?.trim()) return NextResponse.json({ error: "Enter an invite code." }, { status: 400 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("invite_codes")
    .select("id, max_uses, used_count, expires_at")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (!data) return NextResponse.json({ error: "Invalid invite code." }, { status: 400 });
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "This invite code has expired." }, { status: 400 });
  }
  if (data.used_count >= data.max_uses) {
    return NextResponse.json({ error: "This invite code has already been used." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
