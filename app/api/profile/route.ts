import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CREW_TAG } from "@/lib/crew-cache";

const ALLOWED = [
  "display_name", "bio", "city", "availability",
  "role", "experience_level", "rate_min", "rate_max", "rate_unit", "specializations",
];

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Refresh the cached public crew profiles. Guarded: the Next 16 revalidateTag
  // signature depends on Cache Components; the 5-min window covers it otherwise.
  try {
    revalidateTag(CREW_TAG, "max");
  } catch {
    /* falls back to time-based revalidation */
  }

  return NextResponse.json({ ok: true });
}
