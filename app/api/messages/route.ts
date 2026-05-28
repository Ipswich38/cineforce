import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { connectionId, content } = await req.json() as { connectionId?: string; content?: string };
  if (!connectionId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  // Verify user is part of this accepted connection
  const { data: conn } = await supabase
    .from("connection_requests")
    .select("id, crew_id, client_id, status")
    .eq("id", connectionId)
    .single();

  if (!conn || conn.status !== "accepted") {
    return NextResponse.json({ error: "Connection not found or not accepted." }, { status: 403 });
  }
  if (conn.crew_id !== user.id && conn.client_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ connection_request_id: connectionId, sender_id: user.id, content: content.trim() })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
}
