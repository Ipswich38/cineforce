import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPremiumRequestEmail } from "@/lib/email";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role, city, slug, premium_status")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "No profile found. Complete your profile first." }, { status: 404 });
  if (profile.premium_status !== "free") return NextResponse.json({ error: "Already requested or active." }, { status: 400 });

  const { error } = await supabase
    .from("profiles")
    .update({ premium_status: "requested", premium_requested_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sendPremiumRequestEmail({
    display_name: profile.display_name as string,
    role:         profile.role         as string,
    city:         profile.city         as string,
    slug:         profile.slug         as string,
  });

  return NextResponse.json({ ok: true });
}
