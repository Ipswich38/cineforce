import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const crewId = searchParams.get("crewId");
  if (!crewId) return NextResponse.json({ busyDates: [] });

  const supabase = await createClient();
  const { data } = await supabase
    .from("crew_availability")
    .select("date")
    .eq("crew_id", crewId);

  return NextResponse.json({ busyDates: (data ?? []).map((d: { date: string }) => d.date) });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, action } = await req.json() as { date?: string; action?: string };
  if (!date || !["mark_busy", "mark_available"].includes(action ?? "")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (action === "mark_available") {
    await supabase.from("crew_availability").delete().eq("crew_id", user.id).eq("date", date);
  } else {
    await supabase.from("crew_availability")
      .upsert({ crew_id: user.id, date, status: "busy" }, { onConflict: "crew_id,date" });
  }

  return NextResponse.json({ ok: true });
}
