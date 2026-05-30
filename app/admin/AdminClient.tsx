"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users, CheckCircle2, Clock, AlertCircle, Zap, MessageSquare,
  ExternalLink, ChevronDown, ChevronUp, Search, Filter,
} from "lucide-react";
import type { Kpis, AdminUser, AdminTicket, InviteCode } from "./page";

const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';

const BG      = "#000000";
const SURFACE = "#101010";
const TEXT    = "#F7F7F2";
const MUTED   = "#8E8E93";
const AMBER   = "#FFCC00";
const BORDER  = "rgba(255,255,255,0.07)";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "2-digit" });
}

function StatusBadge({ user }: { user: AdminUser }) {
  const { premium_status: s, trialDaysLeft: d } = user;
  if (s === "active") return <Pill color="#32D74B">Paid</Pill>;
  if (s === "trial" && d > 0) return <Pill color="#FF9F0A">Trial {d}d</Pill>;
  if (s === "trial" && d <= 0) return <Pill color="#FF453A">Expired</Pill>;
  if (s === "expired")  return <Pill color="#FF453A">Expired</Pill>;
  return <Pill color={MUTED}>{s}</Pill>;
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: FT, fontSize: 11, fontWeight: 600,
      padding: "2px 9px", borderRadius: 20,
      background: `${color}18`, color, border: `1px solid ${color}30`,
      flexShrink: 0,
    }}>
      {children}
    </span>
  );
}

function TicketStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { open: "#FF9F0A", in_progress: "#4A9EFF", resolved: "#32D74B" };
  const label: Record<string, string> = { open: "Open", in_progress: "In Progress", resolved: "Resolved" };
  return <Pill color={map[status] ?? MUTED}>{label[status] ?? status}</Pill>;
}

function CategoryBadge({ cat }: { cat: string }) {
  const label: Record<string, string> = { billing: "Billing", bug: "Bug", account: "Account", feature: "Feature", other: "Other" };
  return <Pill color={MUTED}>{label[cat] ?? cat}</Pill>;
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, color = TEXT, icon,
}: {
  label: string; value: number | string; sub?: string; color?: string;
  icon: React.ReactNode;
}) {
  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`,
      borderRadius: 16, padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        <span style={{ fontFamily: FT, fontSize: 12, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {label}
        </span>
      </div>
      <div>
        <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 32, color, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {value}
        </p>
        {sub && <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginTop: 4 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Ticket row (expandable) ──────────────────────────────────────────────────

function TicketRow({
  ticket: t,
  onUpdate,
}: {
  ticket: AdminTicket;
  onUpdate: (id: string, update: { status?: string; admin_notes?: string }) => Promise<void>;
}) {
  const [open,    setOpen]    = useState(false);
  const [notes,   setNotes]   = useState(t.admin_notes ?? "");
  const [saving,  setSaving]  = useState(false);
  const [status,  setStatus]  = useState(t.status);

  async function save(newStatus?: string) {
    setSaving(true);
    const update: { status?: string; admin_notes?: string } = { admin_notes: notes };
    if (newStatus) update.status = newStatus;
    await onUpdate(t.id, update);
    if (newStatus) setStatus(newStatus);
    setSaving(false);
  }

  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14 }}>
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 12,
          background: "none", border: "none", cursor: "pointer",
          textAlign: "left",
        }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <TicketStatusBadge status={status} />
            <CategoryBadge cat={t.category} />
          </div>
          <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>
            {t.subject}
          </p>
          <p style={{ fontFamily: FT, fontSize: 12, color: MUTED }}>
            {t.user_email} · {fmt(t.created_at)}
          </p>
        </div>
        {open
          ? <ChevronUp size={16} style={{ color: MUTED, flexShrink: 0 }} />
          : <ChevronDown size={16} style={{ color: MUTED, flexShrink: 0 }} />
        }
      </button>

      {/* Expanded */}
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
          <p style={{
            fontFamily: FT, fontSize: 14, color: "rgba(247,247,242,0.65)",
            lineHeight: 1.65, marginBottom: 14, whiteSpace: "pre-wrap",
          }}>
            {t.message}
          </p>

          <textarea
            placeholder="Admin notes (internal, not visible to user)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 10,
              border: `1px solid ${BORDER}`, background: "#080808",
              color: TEXT, fontFamily: FT, fontSize: 13, outline: "none",
              resize: "none", lineHeight: 1.6, boxSizing: "border-box",
              marginBottom: 10,
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,179,0,0.4)")}
            onBlur={(e)  => (e.target.style.borderColor = BORDER)}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {status !== "in_progress" && (
              <button onClick={() => save("in_progress")} disabled={saving}
                style={{
                  padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(74,158,255,0.3)",
                  background: "rgba(74,158,255,0.08)", color: "#4A9EFF",
                  fontFamily: FT, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                Mark In Progress
              </button>
            )}
            {status !== "resolved" && (
              <button onClick={() => save("resolved")} disabled={saving}
                style={{
                  padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(50,215,75,0.3)",
                  background: "rgba(50,215,75,0.08)", color: "#32D74B",
                  fontFamily: FT, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                Resolve
              </button>
            )}
            {status !== "open" && (
              <button onClick={() => save("open")} disabled={saving}
                style={{
                  padding: "8px 14px", borderRadius: 10, border: `1px solid ${BORDER}`,
                  background: "transparent", color: MUTED,
                  fontFamily: FT, fontSize: 13, cursor: "pointer",
                }}>
                Reopen
              </button>
            )}
            <button onClick={() => save()} disabled={saving}
              style={{
                padding: "8px 14px", borderRadius: 10, border: "none",
                background: AMBER, color: "#000",
                fontFamily: FT, fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
              {saving ? "Saving…" : "Save notes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

type Tab = "overview" | "users" | "tickets" | "invites";

export default function AdminClient({
  kpis,
  users:        initialUsers,
  tickets:      initialTickets,
  inviteCodes:  initialCodes,
}: {
  kpis:         Kpis;
  users:        AdminUser[];
  tickets:      AdminTicket[];
  inviteCodes:  InviteCode[];
}) {
  const [tab,         setTab]         = useState<Tab>("overview");
  const [tickets,     setTickets]     = useState<AdminTicket[]>(initialTickets);
  const [codes,       setCodes]       = useState<InviteCode[]>(initialCodes);
  const [generating,  setGenerating]  = useState(false);
  const [genCount,    setGenCount]    = useState(20);
  const [copied,      setCopied]      = useState<string | null>(null);

  // User filters
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "crew" | "client">("all");
  const [statFilter, setStatFilter] = useState<"all" | "trial" | "paid" | "expired">("all");

  const filteredUsers = initialUsers.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      if (!u.display_name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
    }
    if (typeFilter === "crew"   && u.account_type !== "crew")   return false;
    if (typeFilter === "client" && u.account_type !== "client") return false;
    if (statFilter === "trial"   && !(u.premium_status === "trial" && u.trialDaysLeft > 0)) return false;
    if (statFilter === "paid"    && u.premium_status !== "active") return false;
    if (statFilter === "expired" && !(u.premium_status === "expired" || (u.premium_status === "trial" && u.trialDaysLeft <= 0))) return false;
    return true;
  });

  // Ticket filter
  const [ticketFilter, setTicketFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");

  const filteredTickets = tickets.filter((t) =>
    ticketFilter === "all" ? true : t.status === ticketFilter
  );

  async function updateTicket(id: string, update: { status?: string; admin_notes?: string }) {
    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...update }),
    });
    setTickets((prev) => prev.map((t) =>
      t.id === id ? { ...t, ...update, updated_at: new Date().toISOString() } : t
    ));
  }

  async function generateCodes() {
    setGenerating(true);
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: genCount, maxUses: 1 }),
    });
    if (res.ok) {
      const { codes: newCodes } = await res.json() as { codes: InviteCode[] };
      setCodes((prev) => [...newCodes, ...prev]);
    }
    setGenerating(false);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyAllUnused() {
    const unused = codes.filter((c) => c.used_count < c.max_uses).map((c) => c.code).join("\n");
    navigator.clipboard.writeText(unused);
    setCopied("__all__");
    setTimeout(() => setCopied(null), 2000);
  }

  const tabStyle = (t: Tab): React.CSSProperties => ({
    flex: 1, padding: "10px 8px", borderRadius: 9, border: "none", cursor: "pointer",
    background: tab === t ? SURFACE : "transparent",
    color: tab === t ? TEXT : MUTED,
    fontFamily: FT, fontSize: 14, fontWeight: tab === t ? 600 : 400,
    boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
    transition: "all 0.15s",
  });

  const filterBtn = (
    active: boolean,
    onClick: () => void,
    label: string,
    color = MUTED,
  ): React.CSSProperties => ({
    padding: "6px 14px", borderRadius: 20, border: `1px solid ${active ? `${color}40` : BORDER}`,
    background: active ? `${color}12` : "transparent",
    color: active ? color : MUTED,
    fontFamily: FT, fontSize: 12, fontWeight: active ? 600 : 400,
    cursor: "pointer",
  });

  return (
    <div style={{ background: BG, minHeight: "100dvh" }}>

      {/* Nav */}
      <div style={{
        background: "rgba(12,12,15,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, zIndex: 40,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div className="app-container-narrow" style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT }}>Admin</span>
          <Link href="/dashboard" style={{ fontFamily: FT, fontSize: 13, color: MUTED, textDecoration: "none" }}>
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="app-container-narrow app-page-pad">

        {/* Tabs */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.04)",
          borderRadius: 12, padding: 4, marginBottom: 28, gap: 3,
        }}>
          <button style={tabStyle("overview")} onClick={() => setTab("overview")}>Overview</button>
          <button style={tabStyle("users")}    onClick={() => setTab("users")}>
            Users ({kpis.totalUsers})
          </button>
          <button style={tabStyle("tickets")}  onClick={() => setTab("tickets")}>
            Tickets {kpis.openTickets > 0 && `(${kpis.openTickets})`}
          </button>
          <button style={tabStyle("invites")}  onClick={() => setTab("invites")}>
            Invites
          </button>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            {/* KPI grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
              <KpiCard
                label="Total Users" value={kpis.totalUsers}
                sub={`${kpis.totalCrew} crew · ${kpis.totalClients} clients`}
                icon={<Users size={14} style={{ color: MUTED }} />}
              />
              <KpiCard
                label="Active Trial" value={kpis.activeTrial}
                sub="within 14-day window"
                color={AMBER}
                icon={<Clock size={14} style={{ color: AMBER }} />}
              />
              <KpiCard
                label="Paid" value={kpis.paidActive}
                sub="active subscription"
                color="#32D74B"
                icon={<CheckCircle2 size={14} style={{ color: "#32D74B" }} />}
              />
              <KpiCard
                label="Expired" value={kpis.expired}
                sub="trial ended, no plan"
                color="#FF453A"
                icon={<AlertCircle size={14} style={{ color: "#FF453A" }} />}
              />
              <KpiCard
                label="Connections" value={kpis.totalRequests}
                sub={`${kpis.acceptedRequests} accepted · ${kpis.pendingRequests} pending`}
                icon={<Zap size={14} style={{ color: MUTED }} />}
              />
              <KpiCard
                label="Tickets" value={kpis.openTickets}
                sub={`${kpis.inProgressTickets} in progress`}
                color={kpis.openTickets > 0 ? "#FF9F0A" : TEXT}
                icon={<MessageSquare size={14} style={{ color: kpis.openTickets > 0 ? "#FF9F0A" : MUTED }} />}
              />
            </div>

            {/* Recent signups */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: 18, color: TEXT, letterSpacing: "-0.02em", marginBottom: 16 }}>
                Recent Signups
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {initialUsers.slice(0, 10).map((u) => (
                  <div key={u.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: SURFACE, border: `1px solid ${BORDER}`,
                    borderRadius: 12, padding: "12px 14px",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                        <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>{u.display_name}</p>
                        <span style={{ fontFamily: FT, fontSize: 11, color: MUTED, textTransform: "capitalize" }}>
                          {u.account_type ?? "crew"}
                        </span>
                      </div>
                      <p style={{ fontFamily: FT, fontSize: 12, color: MUTED }}>{u.email}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span style={{ fontFamily: FT, fontSize: 11, color: MUTED }}>{fmt(u.created_at)}</span>
                      <StatusBadge user={u} />
                      {u.slug && (
                        <Link href={`/crew/${u.slug}`} target="_blank" style={{ color: MUTED }}
                          className="hover:opacity-70 transition-opacity">
                          <ExternalLink size={13} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open tickets preview */}
            {kpis.openTickets > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: 18, color: TEXT, letterSpacing: "-0.02em" }}>
                    Open Tickets
                  </h2>
                  <button onClick={() => setTab("tickets")}
                    style={{ fontFamily: FT, fontSize: 13, color: AMBER, background: "none", border: "none", cursor: "pointer" }}>
                    View all
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {tickets.filter((t) => t.status === "open").slice(0, 3).map((t) => (
                    <div key={t.id} style={{
                      background: SURFACE, border: "1px solid rgba(255,159,10,0.2)",
                      borderRadius: 12, padding: "12px 14px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <CategoryBadge cat={t.category} />
                        <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>{t.subject}</p>
                      </div>
                      <p style={{ fontFamily: FT, fontSize: 12, color: MUTED }}>
                        {t.user_email} · {fmt(t.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div>
            {/* Search */}
            <div style={{ position: "relative", marginBottom: 14 }}>
              <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: MUTED, pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "11px 14px 11px 38px", borderRadius: 12,
                  border: `1px solid ${BORDER}`, background: SURFACE,
                  color: TEXT, fontFamily: FT, fontSize: 14, outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Filter size={12} style={{ color: MUTED }} />
              </div>
              {(["all", "crew", "client"] as const).map((f) => (
                <button key={f} onClick={() => setTypeFilter(f)}
                  style={filterBtn(typeFilter === f, () => {}, f === "all" ? "All Types" : f === "crew" ? "Crew" : "Client")}>
                  {f === "all" ? "All Types" : f === "crew" ? "Crew" : "Client"}
                </button>
              ))}
              <div style={{ width: 1, background: BORDER, alignSelf: "stretch" }} />
              {(["all", "trial", "paid", "expired"] as const).map((f) => {
                const labels = { all: "Any Status", trial: "Trial", paid: "Paid", expired: "Expired" };
                const colors = { all: MUTED, trial: "#FF9F0A", paid: "#32D74B", expired: "#FF453A" };
                return (
                  <button key={f} onClick={() => setStatFilter(f)}
                    style={filterBtn(statFilter === f, () => {}, labels[f], colors[f])}>
                    {labels[f]}
                  </button>
                );
              })}
            </div>

            <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginBottom: 12 }}>
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filteredUsers.map((u) => (
                <div key={u.id} style={{
                  background: SURFACE, border: `1px solid ${BORDER}`,
                  borderRadius: 12, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                      <p style={{ fontFamily: FT, fontSize: 14, fontWeight: 500, color: TEXT }}>{u.display_name}</p>
                      <span style={{ fontFamily: FT, fontSize: 11, color: MUTED, textTransform: "capitalize" }}>
                        {u.account_type ?? "crew"}
                      </span>
                    </div>
                    <p style={{ fontFamily: FT, fontSize: 12, color: MUTED }}>{u.email}</p>
                    {u.city && (
                      <p style={{ fontFamily: FT, fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
                        {u.role ? `${u.role} · ` : ""}{u.city}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <StatusBadge user={u} />
                    <span style={{ fontFamily: FT, fontSize: 11, color: MUTED }}>{fmt(u.created_at)}</span>
                  </div>
                  {u.slug && (
                    <Link href={`/crew/${u.slug}`} target="_blank" style={{ color: MUTED, flexShrink: 0 }}
                      className="hover:opacity-70 transition-opacity">
                      <ExternalLink size={14} />
                    </Link>
                  )}
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div style={{
                  textAlign: "center", padding: "40px 24px",
                  background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14,
                }}>
                  <p style={{ fontFamily: FT, fontSize: 14, color: MUTED }}>No users match these filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TICKETS ── */}
        {tab === "tickets" && (
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {(["all", "open", "in_progress", "resolved"] as const).map((f) => {
                const labels = { all: "All", open: "Open", in_progress: "In Progress", resolved: "Resolved" };
                const colors = { all: MUTED, open: "#FF9F0A", in_progress: "#4A9EFF", resolved: "#32D74B" };
                return (
                  <button key={f} onClick={() => setTicketFilter(f)}
                    style={filterBtn(ticketFilter === f, () => {}, labels[f], colors[f])}>
                    {labels[f]}
                  </button>
                );
              })}
            </div>

            <p style={{ fontFamily: FT, fontSize: 12, color: MUTED, marginBottom: 12 }}>
              {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
            </p>

            {filteredTickets.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "52px 24px",
                background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16,
              }}>
                <MessageSquare size={28} style={{ color: MUTED, margin: "0 auto 12px" }} />
                <p style={{ fontFamily: FT, fontSize: 14, color: MUTED }}>
                  {ticketFilter === "all" ? "No tickets yet." : `No ${ticketFilter.replace("_", " ")} tickets.`}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredTickets.map((t) => (
                  <TicketRow key={t.id} ticket={t} onUpdate={updateTicket} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INVITES ── */}
        {tab === "invites" && (
          <div>
            {/* Generate controls */}
            <div style={{
              background: SURFACE, border: `1px solid ${BORDER}`,
              borderRadius: 16, padding: "20px", marginBottom: 20,
            }}>
              <h2 style={{ fontFamily: FD, fontWeight: 700, fontSize: 16, color: TEXT, letterSpacing: "-0.02em", marginBottom: 16 }}>
                Generate Codes
              </h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {([1, 5, 10, 20] as const).map((n) => (
                  <button key={n} onClick={() => setGenCount(n)}
                    style={{
                      padding: "8px 18px", borderRadius: 10,
                      border: `1px solid ${genCount === n ? `${AMBER}40` : BORDER}`,
                      background: genCount === n ? `${AMBER}14` : "transparent",
                      color: genCount === n ? AMBER : MUTED,
                      fontFamily: FT, fontSize: 14, fontWeight: genCount === n ? 600 : 400,
                      cursor: "pointer",
                    }}>
                    {n}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={generateCodes} disabled={generating}
                  style={{
                    padding: "10px 20px", borderRadius: 10, border: "none",
                    background: AMBER, color: "#000",
                    fontFamily: FT, fontSize: 14, fontWeight: 700,
                    cursor: generating ? "not-allowed" : "pointer",
                    opacity: generating ? 0.6 : 1,
                  }}>
                  {generating ? "Generating…" : `Generate ${genCount}`}
                </button>
                {codes.filter((c) => c.used_count < c.max_uses).length > 0 && (
                  <button onClick={copyAllUnused}
                    style={{
                      padding: "10px 20px", borderRadius: 10,
                      border: `1px solid ${BORDER}`,
                      background: "transparent", color: copied === "__all__" ? "#32D74B" : MUTED,
                      fontFamily: FT, fontSize: 14, cursor: "pointer",
                    }}>
                    {copied === "__all__" ? "Copied!" : "Copy all unused"}
                  </button>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Total", value: codes.length, color: TEXT },
                { label: "Unused", value: codes.filter((c) => c.used_count < c.max_uses).length, color: "#32D74B" },
                { label: "Used", value: codes.filter((c) => c.used_count >= c.max_uses).length, color: MUTED },
              ].map((s) => (
                <div key={s.label} style={{
                  flex: 1, background: SURFACE, border: `1px solid ${BORDER}`,
                  borderRadius: 12, padding: "12px 14px", textAlign: "center",
                }}>
                  <p style={{ fontFamily: FD, fontWeight: 700, fontSize: 24, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</p>
                  <p style={{ fontFamily: FT, fontSize: 11, color: MUTED, marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Code list */}
            {codes.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "52px 24px",
                background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16,
              }}>
                <p style={{ fontFamily: FT, fontSize: 14, color: MUTED }}>No codes yet. Generate some above.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {codes.map((c) => {
                  const used    = c.used_count >= c.max_uses;
                  const expired = c.expires_at && new Date(c.expires_at) < new Date();
                  const statusColor = expired ? "#FF453A" : used ? MUTED : "#32D74B";
                  const statusLabel = expired ? "Expired" : used ? "Used" : "Available";
                  return (
                    <div key={c.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: SURFACE, border: `1px solid ${BORDER}`,
                      borderRadius: 12, padding: "12px 14px",
                    }}>
                      <code style={{
                        fontFamily: '"SF Mono", "Fira Code", monospace',
                        fontSize: 15, fontWeight: 600, letterSpacing: "0.12em",
                        color: used || expired ? MUTED : TEXT,
                        flex: 1,
                      }}>
                        {c.code}
                      </code>
                      <Pill color={statusColor}>{statusLabel}</Pill>
                      <span style={{ fontFamily: FT, fontSize: 11, color: MUTED, flexShrink: 0 }}>
                        {c.used_count}/{c.max_uses}
                      </span>
                      {!used && !expired && (
                        <button onClick={() => copyCode(c.code)}
                          style={{
                            padding: "6px 12px", borderRadius: 8,
                            border: `1px solid ${BORDER}`,
                            background: "transparent",
                            color: copied === c.code ? "#32D74B" : MUTED,
                            fontFamily: FT, fontSize: 12, cursor: "pointer", flexShrink: 0,
                          }}>
                          {copied === c.code ? "Copied" : "Copy"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
