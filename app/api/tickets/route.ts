import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    category?: string;
    subject?: string;
    message?: string;
  };

  const { category, subject, message } = body;
  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  if (!message?.trim()) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const validCategories = ["billing", "bug", "account", "feature", "other"];
  const cat = validCategories.includes(category ?? "") ? category : "other";

  const { error } = await supabase.from("support_tickets").insert({
    user_id:    user.id,
    user_email: user.email ?? "",
    category:   cat,
    subject:    subject.trim(),
    message:    message.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
