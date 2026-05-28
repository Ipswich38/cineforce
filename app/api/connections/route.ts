import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendConnectionRequestEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { crew_id, project_title, message } = await req.json() as {
    crew_id?: string; project_title?: string; message?: string | null;
  };
  if (!crew_id || !project_title?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Block requests to paused profiles
  const { data: target } = await supabase.from("profiles").select("is_paused").eq("id", crew_id).single();
  if (target?.is_paused) {
    return NextResponse.json({ error: "This crew member is not accepting requests right now." }, { status: 400 });
  }

  const { error } = await supabase.from("connection_requests").insert({
    crew_id, project_title: project_title.trim(), message: message?.trim() || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Non-fatal: email notification to crew
  try {
    const admin = createAdminClient();
    const [{ data: crewProfile }, { data: crewUserData }] = await Promise.all([
      admin.from("profiles").select("display_name").eq("id", crew_id).single(),
      admin.auth.admin.getUserById(crew_id),
    ]);
    if (crewProfile && crewUserData.user?.email) {
      await sendConnectionRequestEmail({
        crewName: crewProfile.display_name,
        crewEmail: crewUserData.user.email,
        clientEmail: user.email ?? "Someone",
        projectTitle: project_title.trim(),
        message: message?.trim() || null,
      });
    }
  } catch { /* non-fatal */ }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !["accepted", "declined", "skipped"].includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await supabase
    .from("connection_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("crew_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
