"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Send, MessageSquare, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';
const BG      = "#000000";
const SURFACE = "#0C0C0F";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";

const NAV_H = "68px";

type ConversationItem = {
  id: string;
  client_id: string;
  crew_id: string;
  status: string;
  requestMessage: string | null;
  project_title: string | null;
  updated_at: string | null;
  other: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    role: string | null;
    slug: string | null;
  };
  lastMessage: { sender_id: string; body: string; created_at: string } | null;
};

type Message = { id: string; sender_id: string; content: string; created_at: string };

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function relativeTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)  return d.toLocaleDateString("en-PH", { weekday: "short" });
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yest  = new Date(today); yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString())  return "Yesterday";
  return d.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
}

export default function MessagesClient({
  userId,
  accountType,
  conversations,
}: {
  userId: string;
  accountType: string | null;
  conversations: ConversationItem[];
}) {
  const [activeId,     setActiveId]     = useState<string | null>(null);
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [items,        setItems]        = useState(conversations);
  const [input,        setInput]        = useState("");
  const [sending,      setSending]      = useState(false);
  const [accepting,    setAccepting]    = useState(false);
  const [loadingChat,  setLoadingChat]  = useState(false);
  const [isMobile,     setIsMobile]     = useState(false);

  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTsRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Responsive detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-select from ?thread= URL param
  useEffect(() => {
    const thread = new URLSearchParams(window.location.search).get("thread");
    if (thread && items.some((c) => c.id === thread)) setActiveId(thread);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load full message history for a conversation
  const loadMessages = useCallback(async (connId: string) => {
    setLoadingChat(true);
    setMessages([]);
    lastTsRef.current = null;
    try {
      const res = await fetch(`/api/messages?connectionId=${connId}`, { cache: "no-store" });
      if (res.ok) {
        const { messages: rows } = await res.json();
        setMessages(rows ?? []);
        if ((rows ?? []).length > 0) lastTsRef.current = rows[rows.length - 1].created_at;
      }
    } finally {
      setLoadingChat(false);
    }
  }, []);

  // Poll for missed messages (fallback — Broadcast handles real-time delivery)
  const pollMessages = useCallback(async (connId: string) => {
    const after = lastTsRef.current;
    const url = after
      ? `/api/messages?connectionId=${connId}&after=${encodeURIComponent(after)}`
      : `/api/messages?connectionId=${connId}`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const { messages: rows } = await res.json();
      if (!(rows ?? []).length) return;
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const fresh = (rows as Message[]).filter((m) => !ids.has(m.id));
        if (!fresh.length) return prev;
        lastTsRef.current = fresh[fresh.length - 1].created_at;
        return [...prev, ...fresh];
      });
    } catch { /* non-fatal */ }
  }, []);

  // Supabase Broadcast subscription — instant delivery, no RLS friction
  useEffect(() => {
    if (!activeId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${activeId}`)
      .on("broadcast", { event: "new_message" }, ({ payload }) => {
        const msg = payload as Message;
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
        lastTsRef.current = msg.created_at;
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeId]);

  // Initial load + 10 s polling fallback
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeId) { setMessages([]); return; }
    const active = items.find((c) => c.id === activeId);
    if (active?.status !== "accepted") { setMessages([]); return; }
    loadMessages(activeId);
    pollRef.current = setInterval(() => pollMessages(activeId), 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeId, items, loadMessages, pollMessages]);

  // Scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!activeId || !input.trim() || sending) return;
    const text = input.trim();
    setSending(true);
    setInput("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: activeId, content: text }),
    });
    if (!res.ok) {
      setInput(text);
    } else {
      const { message } = await res.json();
      if (message) {
        setMessages((prev) => prev.some((m) => m.id === message.id) ? prev : [...prev, message]);
        lastTsRef.current = message.created_at;
      }
    }
    setSending(false);
    inputRef.current?.focus();
  }

  async function acceptRequest() {
    if (!activeId || accepting) return;
    setAccepting(true);
    const res = await fetch("/api/connections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activeId, status: "accepted" }),
    });
    if (res.ok) {
      const now = new Date().toISOString();
      setItems((prev) => prev.map((c) => c.id === activeId ? { ...c, status: "accepted", updated_at: now } : c));
    }
    setAccepting(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const activeConv = items.find((c) => c.id === activeId) ?? null;
  const isPendingRequest = activeConv?.status === "pending";

  // Build rendered list with date separators
  type Sep = { type: "sep"; label: string; key: string };
  const rendered: (Message | Sep)[] = [];
  let lastDay = "";
  for (const msg of messages) {
    const lbl = dayLabel(msg.created_at);
    if (lbl !== lastDay) { rendered.push({ type: "sep", label: lbl, key: `sep-${msg.id}` }); lastDay = lbl; }
    rendered.push(msg);
  }

  const showList = !isMobile || !activeId;
  const showChat = !isMobile || !!activeId;

  return (
    <div style={{
      height: "100dvh",
      background: BG,
      display: "flex",
      flexDirection: "column",
      paddingTop: "env(safe-area-inset-top, 0px)",
    }}>

      {/* ── Top header (desktop always; mobile only when showing list) ── */}
      {(!isMobile || !activeId) && (
        <div style={{
          flexShrink: 0,
          background: "rgba(10,10,12,0.96)",
          borderBottom: `1px solid ${BORDER}`,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        }}>
          <div className="app-container-narrow topbar-inner">
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 7, color: MUTED, textDecoration: "none", fontFamily: FT, fontSize: 14 }}>
              <ArrowLeft size={16} /> Back
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={16} style={{ color: AMBER }} />
              <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT }}>Messages</span>
            </div>
            <div style={{ width: 54 }} />
          </div>
        </div>
      )}

      {/* ── Split body ── */}
      <div style={{
        flex: 1,
        display: "flex",
        overflow: "hidden",
        maxWidth: isMobile ? "100%" : 1060,
        margin: "0 auto",
        width: "100%",
      }}>

        {/* LEFT — Conversation list */}
        {showList && (
          <div style={{
            width: isMobile ? "100%" : 300,
            flexShrink: 0,
            borderRight: isMobile ? "none" : `1px solid ${BORDER}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            {!isMobile && (
              <div style={{ padding: "20px 16px 14px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
                <h2 style={{ fontFamily: FD, fontWeight: 800, fontSize: 20, color: TEXT, letterSpacing: "-0.02em", marginBottom: 3 }}>
                  Conversations
                </h2>
                <p style={{ fontFamily: FT, fontSize: 12, color: MUTED }}>
                  {items.length} inbox item{items.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", paddingBottom: isMobile ? `calc(${NAV_H} + env(safe-area-inset-bottom, 0px))` : 0 }}>
              {items.length === 0 ? (
                <div style={{ padding: "48px 20px", textAlign: "center" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%", margin: "0 auto 16px",
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <MessageSquare size={22} style={{ color: MUTED }} />
                  </div>
                  <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 15, color: TEXT, marginBottom: 6 }}>Inbox is empty</p>
                  <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, lineHeight: 1.6, maxWidth: 240, margin: "0 auto 16px" }}>
                    Project requests and accepted conversations will appear here.
                  </p>
                  {accountType === "client" && (
                    <Link href="/search" style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "10px 16px", borderRadius: 999,
                      background: AMBER, color: "#000",
                      fontFamily: FT, fontSize: 13, fontWeight: 700, textDecoration: "none",
                    }}>
                      <Search size={13} /> Find crew
                    </Link>
                  )}
                </div>
              ) : items.map((conv) => {
                const isActive = conv.id === activeId;
                const name     = conv.other.display_name;
                const last     = conv.lastMessage;
                const isMine   = last?.sender_id === userId;
                const isPending = conv.status === "pending";
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveId(conv.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px", width: "100%",
                      background: isActive ? "rgba(255,204,0,0.05)" : "transparent",
                      borderLeft: `3px solid ${isActive ? AMBER : "transparent"}`,
                      borderBottom: `1px solid ${BORDER}`,
                      borderTop: "none", borderRight: "none",
                      cursor: "pointer", textAlign: "left",
                      transition: "background 0.12s",
                    }}
                  >
                    {conv.other.avatar_url ? (
                      <img src={conv.other.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                        background: isActive ? "rgba(255,204,0,0.12)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isActive ? "rgba(255,204,0,0.25)" : BORDER}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontFamily: FD, fontWeight: 800, fontSize: 14, color: isActive ? AMBER : MUTED }}>{initials(name)}</span>
                      </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 14, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {name}
                        </p>
                        {isPending && (
                          <span style={{
                            fontFamily: FT, fontSize: 10, fontWeight: 700, color: AMBER,
                            background: "rgba(255,204,0,0.1)",
                            border: "1px solid rgba(255,204,0,0.18)",
                            borderRadius: 999,
                            padding: "2px 6px",
                            flexShrink: 0,
                          }}>
                            New
                          </span>
                        )}
                        <span style={{ fontFamily: FT, fontSize: 11, color: MUTED, flexShrink: 0 }}>
                          {relativeTime(last?.created_at ?? conv.updated_at)}
                        </span>
                      </div>
                      <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                        {conv.project_title ?? "Project"}
                      </p>
                      <p style={{ fontFamily: FT, fontSize: 12, color: "rgba(247,247,242,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {isPending
                          ? (conv.requestMessage ? `Request: ${conv.requestMessage}` : "New project request")
                          : last ? `${isMine ? "You: " : ""}${last.body}` : "Chat is open - say hello"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* RIGHT — Chat panel */}
        {showChat && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

            {!activeConv ? (
              /* Desktop empty state */
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <MessageSquare size={34} style={{ color: "rgba(255,255,255,0.08)" }} />
                <p style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, color: "rgba(247,247,242,0.2)" }}>
                  Select a conversation
                </p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "0 16px", height: 60, flexShrink: 0,
                  borderBottom: `1px solid ${BORDER}`,
                  background: "rgba(12,12,15,0.97)",
                  backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                }}>
                  {isMobile && (
                    <button
                      onClick={() => setActiveId(null)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: MUTED, display: "flex", alignItems: "center", flexShrink: 0 }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                  )}
                  {activeConv.other.avatar_url ? (
                    <img src={activeConv.other.avatar_url} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(255,204,0,0.12)", border: "1px solid rgba(255,204,0,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontFamily: FD, fontSize: 13, fontWeight: 700, color: AMBER }}>{initials(activeConv.other.display_name)}</span>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: FD, fontSize: 15, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {activeConv.other.display_name}
                    </p>
                    <p style={{ fontFamily: FT, fontSize: 11, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {activeConv.project_title ?? "Project"}
                    </p>
                  </div>
                  {activeConv.other.slug && (
                    <Link href={`/crew/${activeConv.other.slug}`} style={{
                      fontFamily: FT, fontSize: 12, color: MUTED, textDecoration: "none",
                      padding: "5px 10px", borderRadius: 20,
                      border: `1px solid ${BORDER}`,
                      flexShrink: 0, whiteSpace: "nowrap",
                    }}>
                      Profile
                    </Link>
                  )}
                </div>

                {/* Messages scroll area */}
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 8px" }}>

                  {/* System message — connection/request status */}
                  <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{
                      display: "inline-block", textAlign: "left",
                      background: "rgba(255,204,0,0.05)",
                      border: "1px solid rgba(255,204,0,0.14)",
                      borderRadius: 14, padding: "14px 18px",
                      maxWidth: 340,
                    }}>
                      <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 12, color: AMBER, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                        {isPendingRequest ? "Project Request" : "Connection Accepted"}
                      </p>
                      <p style={{ fontFamily: FT, fontSize: 13, color: "rgba(247,247,242,0.7)", lineHeight: 1.55 }}>
                        {isPendingRequest ? (
                          <>
                            <span style={{ color: TEXT, fontWeight: 600 }}>{activeConv.other.display_name}</span> sent a request for{" "}
                            <span style={{ color: TEXT }}>{activeConv.project_title ?? "this project"}</span>. Accept it to open chat.
                          </>
                        ) : (
                          <>
                            You and <span style={{ color: TEXT, fontWeight: 600 }}>{activeConv.other.display_name}</span> are now connected for{" "}
                            <span style={{ color: TEXT }}>{activeConv.project_title ?? "this project"}</span>.
                            Keep all communication here inside CineForce.
                          </>
                        )}
                      </p>
                      {isPendingRequest && activeConv.requestMessage && (
                        <p style={{
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: "1px solid rgba(255,204,0,0.12)",
                          fontFamily: FT,
                          fontSize: 13,
                          color: TEXT,
                          lineHeight: 1.55,
                        }}>
                          {activeConv.requestMessage}
                        </p>
                      )}
                      {isPendingRequest && (
                        <button
                          onClick={acceptRequest}
                          disabled={accepting}
                          style={{
                            marginTop: 14,
                            width: "100%",
                            border: "none",
                            borderRadius: 12,
                            padding: "11px 14px",
                            background: accepting ? "rgba(255,204,0,0.6)" : AMBER,
                            color: "#000",
                            fontFamily: FT,
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: accepting ? "not-allowed" : "pointer",
                          }}
                        >
                          {accepting ? "Accepting..." : "Accept and open chat"}
                        </button>
                      )}
                    </div>
                  </div>

                  {isPendingRequest ? null : loadingChat ? (
                    <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, textAlign: "center", paddingTop: 16 }}>Loading…</p>
                  ) : rendered.length === 0 ? (
                    <p style={{ fontFamily: FT, fontSize: 13, color: MUTED, textAlign: "center", paddingTop: 16 }}>
                      No messages yet. Say hello!
                    </p>
                  ) : rendered.map((item) => {
                    if ("type" in item) {
                      return (
                        <div key={item.key} style={{ textAlign: "center", margin: "16px 0 12px" }}>
                          <span style={{ fontFamily: FT, fontSize: 11, color: MUTED, background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 20 }}>
                            {item.label}
                          </span>
                        </div>
                      );
                    }
                    const mine = item.sender_id === userId;
                    return (
                      <div key={item.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 8 }}>
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
                          <p style={{ fontFamily: FT, fontSize: 10, marginTop: 4, textAlign: "right", color: mine ? "rgba(0,0,0,0.4)" : MUTED }}>
                            {timeLabel(item.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input bar */}
                {!isPendingRequest && (
                <div style={{
                  background: "rgba(12,12,15,0.97)",
                  borderTop: `1px solid ${BORDER}`,
                  padding: "10px 12px",
                  paddingBottom: isMobile
                    ? `calc(${NAV_H} + 10px + env(safe-area-inset-bottom, 0px))`
                    : "calc(10px + env(safe-area-inset-bottom, 0px))",
                  display: "flex", alignItems: "flex-end", gap: 10, flexShrink: 0,
                }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={`Message ${activeConv.other.display_name}…`}
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
                    onBlur={(e)  => (e.target.style.borderColor = BORDER)}
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
                      border: "none",
                      cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.15s",
                    }}
                  >
                    <Send size={18} style={{ color: input.trim() ? "#000" : MUTED }} />
                  </button>
                </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
