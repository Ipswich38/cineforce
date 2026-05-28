import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const PASSCODE = process.env.ADMIN_PASSCODE ?? "cineverse2026";

export async function PATCH(req: NextRequest) {
  if (req.cookies.get("admin_auth")?.value !== PASSCODE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    id?: string;
    status?: string;
    admin_notes?: string;
  };

  const { id, status, admin_notes } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const validStatuses = ["open", "in_progress", "resolved"];
  const update: Record<string, string> = {};
  if (status && validStatuses.includes(status)) update.status = status;
  if (typeof admin_notes === "string") update.admin_notes = admin_notes;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("support_tickets").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
