import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json() as { code?: string };
  if (!code?.trim()) return NextResponse.json({ error: "Missing code." }, { status: 400 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("invite_codes")
    .select("id, max_uses, used_count, expires_at")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (!data) return NextResponse.json({ error: "Invalid code." }, { status: 400 });
  if (data.used_count >= data.max_uses) return NextResponse.json({ error: "Code already used." }, { status: 400 });

  await admin
    .from("invite_codes")
    .update({ used_count: data.used_count + 1 })
    .eq("id", data.id);

  return NextResponse.json({ ok: true });
}
