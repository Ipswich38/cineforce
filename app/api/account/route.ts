import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reason } = await req.json() as { reason?: string };
  if (!reason?.trim()) return NextResponse.json({ error: "Reason required." }, { status: 400 });

  const admin = createAdminClient();

  // Delete avatar from storage
  await admin.storage.from("avatars").remove([`${user.id}/avatar`]);

  // Delete profile (cascades to connection_requests, favorites, etc.)
  await admin.from("profiles").delete().eq("id", user.id);

  // Delete auth user
  await admin.auth.admin.deleteUser(user.id);

  return NextResponse.json({ ok: true });
}
