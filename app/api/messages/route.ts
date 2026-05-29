import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const connectionId = searchParams.get("connectionId");
  const after        = searchParams.get("after");

  if (!connectionId) return NextResponse.json({ error: "Missing connectionId" }, { status: 400 });

  const { data: conn } = await supabase
    .from("connection_requests")
    .select("id, crew_id, client_id, status")
    .eq("id", connectionId)
    .single();

  if (!conn || conn.status !== "accepted") return NextResponse.json({ messages: [] });
  if (conn.crew_id !== user.id && conn.client_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let query = supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: true });

  if (after) query = query.gt("created_at", after);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    messages: (data ?? []).map((m) => ({
      id:         m.id,
      sender_id:  m.sender_id,
      content:    m.body,
      created_at: m.created_at,
    })),
  });
}

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
    .insert({ connection_id: connectionId, sender_id: user.id, body: content.trim() })
    .select("id, sender_id, body, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const message = data
    ? { id: data.id, sender_id: data.sender_id, content: data.body, created_at: data.created_at }
    : null;

  // Broadcast to the Realtime channel so the recipient gets it instantly.
  // Fire-and-forget — polling is the fallback if this fails.
  if (message) {
    fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/realtime/v1/api/broadcast`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
        body: JSON.stringify({
          messages: [{
            topic: `realtime:chat:${connectionId}`,
            event: "new_message",
            payload: message,
          }],
        }),
      }
    ).catch(() => {});
  }

  return NextResponse.json({ message });
}
