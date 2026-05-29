"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const FD = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
const FT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';
const BG = "#000"; const TEXT = "#F7F7F2"; const MUTED = "#8E8E93";
const AMBER = "#FFCC00"; const BORDER = "rgba(255,255,255,0.07)"; const SURFACE = "#101010";

type Message = { id: string; sender_id: string; content: string; created_at: string };

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

function dateSeparator(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-PH", { month: "long", day: "numeric" });
}

export default function ChatClient({
  connectionId, projectTitle, currentUserId,
  otherName, otherAvatar, otherRole, initialMessages,
}: {
  connectionId: string;
  projectTitle: string;
  currentUserId: string;
  otherName: string;
  otherAvatar: string | null;
  otherRole: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input,    setInput]    = useState("");
  const [sending,  setSending]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT", schema: "public", table: "messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          const row = payload.new as { id: string; sender_id: string; body: string; created_at: string };
          const msg = { id: row.id, sender_id: row.sender_id, content: row.body, created_at: row.created_at };
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [connectionId]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId, content: text }),
    });

    if (!res.ok) setInput(text); // restore on failure
    setSending(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const otherInitials = otherName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  // Group messages with date separators
  const renderedMessages: (Message | { type: "separator"; label: string; key: string })[] = [];
  let lastDate = "";
  for (const msg of messages) {
    const dayLabel = dateSeparator(msg.created_at);
    if (dayLabel !== lastDate) {
      renderedMessages.push({ type: "separator", label: dayLabel, key: `sep-${msg.id}` });
      lastDate = dayLabel;
    }
    renderedMessages.push(msg);
  }

  return (
    <div style={{
      background: BG, height: "100dvh", display: "flex", flexDirection: "column",
      paddingTop: "env(safe-area-inset-top, 0px)",
    }}>

      {/* Header */}
      <div style={{
        background: "rgba(12,12,15,0.97)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", gap: 12, padding: "0 16px",
        height: 60, flexShrink: 0,
      }}>
        <Link href="/dashboard" style={{ color: MUTED, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <ArrowLeft size={20} />
        </Link>

        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: "rgba(255,204,0,0.12)", border: "1px solid rgba(255,204,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        }}>
          {otherAvatar
            ? <img src={otherAvatar} alt={otherName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontFamily: FD, fontSize: 13, fontWeight: 700, color: AMBER }}>{otherInitials}</span>
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: FD, fontSize: 15, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {otherName}
          </p>
          <p style={{ fontFamily: FT, fontSize: 11, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {projectTitle}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <p style={{ fontFamily: FD, fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 8 }}>
              Connection accepted
            </p>
            <p style={{ fontFamily: FT, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
              You can now message {otherName} about this project.
            </p>
          </div>
        )}

        {renderedMessages.map((item) => {
          if ("type" in item) {
            return (
              <div key={item.key} style={{ textAlign: "center", margin: "16px 0 12px" }}>
                <span style={{
                  fontFamily: FT, fontSize: 11, color: MUTED,
                  background: "rgba(255,255,255,0.05)",
                  padding: "3px 10px", borderRadius: 20,
                }}>
                  {item.label}
                </span>
              </div>
            );
          }

          const mine = item.sender_id === currentUserId;
          return (
            <div key={item.id} style={{
              display: "flex", justifyContent: mine ? "flex-end" : "flex-start",
              marginBottom: 8,
            }}>
              <div style={{
                maxWidth: "78%",
                background: mine ? AMBER : SURFACE,
                color: mine ? "#000" : TEXT,
                borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "10px 14px",
                border: mine ? "none" : `1px solid ${BORDER}`,
              }}>
                <p style={{ fontFamily: FT, fontSize: 15, lineHeight: 1.5, wordBreak: "break-word" }}>
                  {item.content}
                </p>
                <p style={{
                  fontFamily: FT, fontSize: 10, marginTop: 4, textAlign: "right",
                  color: mine ? "rgba(0,0,0,0.45)" : MUTED,
                }}>
                  {fmt(item.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        background: "rgba(12,12,15,0.97)", borderTop: `1px solid ${BORDER}`,
        padding: "10px 12px",
        paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        display: "flex", alignItems: "flex-end", gap: 10, flexShrink: 0,
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          rows={1}
          style={{
            flex: 1, background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 22, padding: "11px 16px",
            color: TEXT, fontFamily: FT, fontSize: 15,
            outline: "none", resize: "none", lineHeight: 1.45,
            maxHeight: 120, overflowY: "auto",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(255,204,0,0.3)")}
          onBlur={(e) => (e.target.style.borderColor = BORDER)}
          onInput={(e) => {
            const t = e.target as HTMLTextAreaElement;
            t.style.height = "auto";
            t.style.height = Math.min(t.scrollHeight, 120) + "px";
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: input.trim() ? AMBER : "rgba(255,255,255,0.06)",
            border: "none", cursor: input.trim() && !sending ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
        >
          <Send size={18} style={{ color: input.trim() ? "#000" : MUTED }} />
        </button>
      </div>
    </div>
  );
}
