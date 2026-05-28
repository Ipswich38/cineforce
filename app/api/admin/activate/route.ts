import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getTierForCount } from "@/lib/foundingTiers";

const PASSCODE = process.env.ADMIN_PASSCODE ?? "cineverse2026";

export async function POST(req: NextRequest) {
  if (req.cookies.get("admin_auth")?.value !== PASSCODE) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { profileId } = await req.json() as { profileId: string };
  if (!profileId) return NextResponse.json({ error: "Missing profileId" }, { status: 400 });

  const admin = createAdminClient();

  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("premium_status", "active");

  const foundingTier = getTierForCount(count ?? 0);

  const { error } = await admin
    .from("profiles")
    .update({
      premium_status:       "active",
      premium_activated_at: new Date().toISOString(),
      founding_tier:        foundingTier,
    })
    .eq("id", profileId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, tier: foundingTier });
}
