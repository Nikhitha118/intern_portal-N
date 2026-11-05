"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useRoleGuard, usePortalAuth, PortalLoadingSkeleton, getUser, logout } from "../../../lib/roleGuard"
import {
  LayoutDashboard, Users, ClipboardList, FileText, Star, UserCheck,
  BookOpen, BarChart3, Settings, LogOut, Shield, Search, Bell,
  Plus, X, Download, Edit, Trash2, RefreshCw, ExternalLink,
  Building2, GraduationCap, Activity, Clock, CheckCircle2, Database,
} from "lucide-react"
import { IconBadge } from "../../../lib/iconBadge"

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const G = { background: "rgba(17,25,40,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px" }
const inp = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", color: "white", outline: "none", width: "100%" }

const NAV = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" },
  { icon: Users, label: "All Users", id: "users" },
  { icon: GraduationCap, label: "Intern Portal", id: "intern-portal" },
  { icon: Star, label: "Mentor Portal", id: "mentor-portal" },
  { icon: FileText, label: "Evaluation Portal", id: "eval-portal" },
  { icon: Building2, label: "Institution Portal", id: "inst-portal" },
  { icon: ClipboardList, label: "All Tasks", id: "tasks" },
  { icon: UserCheck, label: "All Attendance", id: "attendance" },
  { icon: BookOpen, label: "All Journals", id: "journals" },
  { icon: BarChart3, label: "System Stats", id: "stats" },
  { icon: Activity, label: "Logs", id: "logs" },
  { icon: Settings, label: "Settings", id: "settings" },
]

const STA_C = { intern: { c: "#06B6D4", bg: "rgba(6,182,212,0.15)" }, mentor: { c: "#22c55e", bg: "rgba(34,197,94,0.15)" }, admin: { c: "#ef4444", bg: "rgba(239,68,68,0.15)" }, institution: { c: "#f59e0b", bg: "rgba(245,158,11,0.15)" } }

function Sidebar({ active, setActive }) {
  const router = useRouter()
  const [user, setUser] = useState(() => {
    try {
      const u = getUser("admin")
      if (u?.fullName) return u
    } catch { }
    return { fullName: "Administrator" }
  })

  useEffect(() => {
    const load = () => {
      try {
        const u = getUser("admin")
        if (u?.fullName) setUser(u)
      } catch { }
    }
    load()
    window.addEventListener("user_session_updated", load)
    window.addEventListener("storage", load)
    return () => {
      window.removeEventListener("user_session_updated", load)
      window.removeEventListener("storage", load)
    }
  }, [])

  return (
    <aside style={{ width: "240px", minWidth: "240px", height: "100vh", background: "#070B1A", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "16px 14px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", padding: "0 4px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg,#ef4444,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(239,68,68,0.35)" }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>ADMIN PANEL</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>Full Access Control</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto", maxHeight: "calc(100vh - 160px)", paddingRight: "2px" }}>
          {NAV.map(n => {
            const Icon = n.icon; const isA = active === n.id
            return (
              <button key={n.id} onClick={() => setActive(n.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 500, transition: "all 0.15s",
                  background: isA ? "rgba(239,68,68,0.2)" : "transparent",
                  color: isA ? "white" : "rgba(255,255,255,0.6)",
                  borderLeft: isA ? "3px solid #ef4444" : "3px solid transparent"
                }}>
                <Icon size={15} style={{ color: isA ? "#ef4444" : "rgba(255,255,255,0.45)", flexShrink: 0 }} />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ marginTop: "auto", padding: "10px 14px 16px", flexShrink: 0 }}>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg,#ef4444,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "white", flexShrink: 0 }}>
              {(user.fullName || "A").charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={user.fullName || "Administrator"}>
                {user.fullName || "Administrator"}
              </div>
              <div style={{ fontSize: "10px", color: "#ef4444", fontWeight: 500 }}>Administrator</div>
            </div>
          </div>
          <button onClick={() => logout(router)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "7px 10px", borderRadius: "9px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
            <LogOut size={12} /> Logout
          </button>
        </div>
      </div>
    </aside>
  )
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function Overview({ setActive }) {
  const [data, setData] = useState(null)
  const router = useRouter()
  const load = () => fetch(`${BASE}/admin/overview`).then(r => r.json()).then(d => setData(d)).catch(() => { })
  useEffect(() => { load() }, [])
  const portals = [
    { label: "Intern Portal", path: "/intern/dashboard", color: "#06B6D4", Icon: GraduationCap, desc: "Tasks, Attendance, Journals, Analytics" },
    { label: "Mentor Portal", path: "/mentor/dashboard", color: "#22c55e", Icon: UserCheck, desc: "My Interns, Evaluations, Submissions" },
    { label: "Evaluation Portal", path: "/evaluation/dashboard", color: "#7C3AED", Icon: Star, desc: "Rubrics, Score Analytics, Reports" },
    { label: "Institution Portal", path: "/institution/dashboard", color: "#f59e0b", Icon: Building2, desc: "Organizations, Internships, Departments" },
  ]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "10px" }}>
        {[{ l: "Total Users", v: data?.users?.total || 0, c: "#7C3AED", Icon: Users }, { l: "Interns", v: data?.users?.interns || 0, c: "#06B6D4", Icon: GraduationCap }, { l: "Mentors", v: data?.users?.mentors || 0, c: "#22c55e", Icon: UserCheck }, { l: "Institutions", v: data?.users?.institutions || 0, c: "#f59e0b", Icon: Building2 }, { l: "Admins", v: data?.users?.admins || 0, c: "#ef4444", Icon: Shield }].map((s, i) => (
          <div key={i} style={{ ...G, padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <IconBadge Icon={s.Icon} color={s.c} size={16} box={36} />
            <div><div style={{ fontSize: "20px", fontWeight: 700, color: s.c }}>{s.v}</div><div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div></div>
          </div>
        ))}
      </div>
      {/* Portal Access Cards */}
      <div style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>Portal Access</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        {portals.map((p, i) => (
          <div key={i} style={{ ...G, padding: "16px", cursor: "pointer", transition: "all 0.2s", borderLeft: `3px solid ${p.color}` }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(17,25,40,0.85)"}>
            <div style={{ marginBottom: "8px" }}><IconBadge Icon={p.Icon} color={p.color} size={22} box={44} /></div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "white", marginBottom: "4px" }}>{p.label}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginBottom: "12px" }}>{p.desc}</div>
            <button onClick={() => router.push(p.path)} style={{ width: "100%", padding: "7px", borderRadius: "8px", background: `${p.color}22`, border: `1px solid ${p.color}44`, color: p.color, fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
              <ExternalLink size={11} /> Open Portal
            </button>
          </div>
        ))}
      </div>
      {/* Data Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#06B6D4", marginBottom: "8px" }}><GraduationCap size={14} /> Intern Data</div>
          {[["Tasks", data?.intern?.tasks || 0], ["Journals", data?.intern?.journals || 0], ["Attendance Records", data?.intern?.attendance || 0]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{l}</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#22c55e", marginBottom: "8px" }}><UserCheck size={14} /> Mentor Data</div>
          {[["Evaluations", data?.mentor?.evaluations || 0], ["Submissions", data?.mentor?.submissions || 0], ["Rubrics", data?.mentor?.rubrics || 0]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{l}</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#f59e0b", marginBottom: "8px" }}><Building2 size={14} /> Institution Data</div>
          {[["Organizations", data?.institution?.organizations || 0], ["Internships", data?.institution?.internships || 0], ["Departments", data?.institution?.departments || 0]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{l}</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── ALL USERS ─────────────────────────────────────────────────────────────────
function AllUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const load = () => { setLoading(true); fetch(`${BASE}/admin/users`).then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d) }).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])
  const filtered = users.filter(u => (u.fullName || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase()))
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>All Users ({users.length})</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ position: "relative" }}>
            <Search size={11} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ ...inp, paddingLeft: "28px", width: "200px" }} />
          </div>
          <button onClick={load} style={{ padding: "7px 12px", borderRadius: "9px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Name", "Email", "Role", "Created", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>Loading…</td></tr>
              : filtered.map((u, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: `${STA_C[u.role]?.c || "#7C3AED"}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: STA_C[u.role]?.c || "#7C3AED" }}>{(u.fullName || "?").charAt(0)}</div>
                      <span style={{ fontSize: "12px", color: "white" }}>{u.fullName || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{u.email}</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", color: STA_C[u.role]?.c || "#7C3AED", background: `${STA_C[u.role]?.c || "#7C3AED"}22`, textTransform: "capitalize" }}>{u.role || "intern"}</span></td>
                  <td style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <select defaultValue={u.role} onChange={async e => { await fetch(`${BASE}/admin/users/${u._id || u.id}/role`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: e.target.value }) }).catch(() => { }); load() }}
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "3px 6px", fontSize: "10px", color: "white", cursor: "pointer" }}>
                        {["intern", "mentor", "admin", "institution"].map(r => <option key={r} value={r} style={{ background: "#0B1023" }}>{r}</option>)}
                      </select>
                      <button onClick={async () => { if (confirm(`Delete ${u.fullName}?`)) { await fetch(`${BASE}/admin/users/${u._id || u.id}`, { method: "DELETE" }).catch(() => { }); load() } }}
                        style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", border: "none", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── GENERIC DATA TABLE ────────────────────────────────────────────────────────
function DataTable({ title, url, columns, deleteUrl }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const load = () => { setLoading(true); fetch(url).then(r => r.json()).then(d => { if (Array.isArray(d)) setData(d) }).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [url])
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>{title} ({data.length})</div>
        <button onClick={load} style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {columns.map(c => <th key={c.key} style={{ textAlign: "left", padding: "9px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{c.label}</th>)}
            {deleteUrl && <th style={{ padding: "9px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Action</th>}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={columns.length + 1} style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>Loading…</td></tr>
              : data.length === 0 ? <tr><td colSpan={columns.length + 1} style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>No data</td></tr>
                : data.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    {columns.map(c => <td key={c.key} style={{ padding: "9px 14px", fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{String(row[c.key] || "—").slice(0, 60)}</td>)}
                    {deleteUrl && <td style={{ padding: "9px 14px" }}>
                      <button onClick={async () => { await fetch(`${deleteUrl}/${row._id || row.id}`, { method: "DELETE" }).catch(() => { }); load() }} style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", border: "none", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}><Trash2 size={10} /></button>
                    </td>}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── SYSTEM STATS ──────────────────────────────────────────────────────────────
function SystemStats() {
  const [stats, setStats] = useState(null)
  useEffect(() => { fetch(`${BASE}/admin/stats`).then(r => r.json()).then(d => setStats(d)).catch(() => { }) }, [])
  const DB_COLORS = { shared_db: "#7C3AED", intern_db: "#06B6D4", mentor_db: "#22c55e", evaluation_db: "#f59e0b", institution_db: "#ec4899", admin_db: "#ef4444" }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>System Database Statistics</div>
      {stats && Object.entries(stats).map(([dbName, collections]) => (
        <div key={dbName} style={{ ...G, padding: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: DB_COLORS[dbName] || "#7C3AED", marginBottom: "10px" }}><Database size={14} /> {dbName}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
            {Object.entries(collections).map(([col, count]) => (
              <div key={col} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px 10px" }}>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>{col}</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: DB_COLORS[dbName] || "#7C3AED" }}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── LOGS ──────────────────────────────────────────────────────────────────────
function Logs() {
  return <DataTable title="Admin Activity Logs" url={`${BASE}/admin/logs`} columns={[{ key: "action", label: "Action" }, { key: "userId", label: "User ID" }, { key: "newRole", label: "New Role" }, { key: "by", label: "By" }, { key: "at", label: "Time" }]} />
}

// ── PORTAL VIEWS ──────────────────────────────────────────────────────────────
function InternPortalView() {
  const router = useRouter()
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>Intern Portal Data</div>
        <button onClick={() => router.push("/intern/dashboard")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", color: "#06B6D4", fontSize: "11px", cursor: "pointer" }}>
          <ExternalLink size={11} /> Open Intern Portal
        </button>
      </div>
      <DataTable title="All Intern Tasks" url={`${BASE}/admin/intern/tasks`} columns={[{ key: "title", label: "Title" }, { key: "category", label: "Category" }, { key: "status", label: "Status" }, { key: "priority", label: "Priority" }, { key: "userId", label: "User ID" }, { key: "dueDate", label: "Due" }]} deleteUrl={`${BASE}/admin/intern/tasks`} />
    </div>
  )
}

function MentorPortalView() {
  const router = useRouter()
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>Mentor Portal Data</div>
        <button onClick={() => router.push("/mentor/dashboard")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: "11px", cursor: "pointer" }}>
          <ExternalLink size={11} /> Open Mentor Portal
        </button>
      </div>
      <DataTable title="All Mentor Evaluations" url={`${BASE}/admin/mentor/evaluations`} columns={[{ key: "internId", label: "Intern ID" }, { key: "mentorId", label: "Mentor ID" }, { key: "totalScore", label: "Score" }, { key: "grade", label: "Grade" }, { key: "period", label: "Period" }]} />
    </div>
  )
}

function EvalPortalView() {
  const router = useRouter()
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>Evaluation Portal Data</div>
        <button onClick={() => router.push("/evaluation/dashboard")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontSize: "11px", cursor: "pointer" }}>
          <ExternalLink size={11} /> Open Evaluation Portal
        </button>
      </div>
      <DataTable title="All Evaluations" url={`${BASE}/admin/evaluation/evaluations`} columns={[{ key: "evaluator", label: "Evaluator" }, { key: "type", label: "Type" }, { key: "evaluationName", label: "Evaluation" }, { key: "status", label: "Status" }, { key: "score", label: "Score" }]} />
    </div>
  )
}

function InstPortalView() {
  const router = useRouter()
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>Institution Portal Data</div>
        <button onClick={() => router.push("/institution/dashboard")} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", fontSize: "11px", cursor: "pointer" }}>
          <ExternalLink size={11} /> Open Institution Portal
        </button>
      </div>
      <DataTable title="All Organizations" url={`${BASE}/admin/institution/organizations`} columns={[{ key: "name", label: "Name" }, { key: "domain", label: "Domain" }, { key: "contact", label: "Contact" }, { key: "interns", label: "Interns" }, { key: "status", label: "Status" }]} />
    </div>
  )
}

function AdminSettings() {
  const [settings, setSettings] = useState({ systemName: "InternPortal", version: "3.0", maintenanceMode: false })
  const [saved, setSaved] = useState(false)
  useEffect(() => { fetch(`${BASE}/admin/settings`).then(r => r.json()).then(d => { if (d.systemName) setSettings(d) }).catch(() => { }) }, [])
  const save = async () => {
    await fetch(`${BASE}/admin/settings`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) }).catch(() => { })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  return (
    <div style={{ maxWidth: "500px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>Admin Settings</div>
      <div style={{ ...G, padding: "16px" }}>
        {[{ l: "System Name", k: "systemName" }, { l: "Version", k: "version" }].map(f => (
          <div key={f.k} style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
            <input value={settings[f.k] || ""} onChange={e => setSettings(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
          <span style={{ fontSize: "12px", color: "white" }}>Maintenance Mode</span>
          <button onClick={() => setSettings(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))} style={{ width: "38px", height: "20px", borderRadius: "999px", position: "relative", border: "none", cursor: "pointer", background: settings.maintenanceMode ? "#ef4444" : "rgba(255,255,255,0.1)" }}>
            <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "white", position: "absolute", top: "2px", transition: "all 0.2s", left: settings.maintenanceMode ? "calc(100% - 18px)" : "2px" }} />
          </button>
        </div>
        <button onClick={save} style={{ padding: "9px 20px", borderRadius: "10px", background: "linear-gradient(135deg,#ef4444,#7C3AED)", border: "none", color: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
      <div style={{ ...G, padding: "14px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "10px" }}>Admin Permissions</div>
        {["View all users", "View all intern data", "View all mentor evaluations", "View all institution data", "Delete users", "Change user roles", "View system logs", "Access all portals"].map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <CheckCircle2 size={12} color="#22c55e" />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
function AdminContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const auth = usePortalAuth(["admin"], "admin")
  const [active, setActive] = useState(tabParam || "overview")
  const user = auth.user || { fullName: "Administrator" }

  useEffect(() => { if (tabParam) setActive(tabParam) }, [tabParam])

  if (auth.loading || !auth.authorized) {
    return <PortalLoadingSkeleton title="Admin Panel" />
  }

  const renderContent = () => {
    switch (active) {
      case "overview": return <Overview setActive={setActive} />
      case "users": return <AllUsers />
      case "intern-portal": return <InternPortalView />
      case "mentor-portal": return <MentorPortalView />
      case "eval-portal": return <EvalPortalView />
      case "inst-portal": return <InstPortalView />
      case "tasks": return <DataTable title="All Intern Tasks" url={`${BASE}/admin/intern/tasks`} columns={[{ key: "title", label: "Title" }, { key: "category", label: "Category" }, { key: "status", label: "Status" }, { key: "priority", label: "Priority" }, { key: "userId", label: "User ID" }]} deleteUrl={`${BASE}/admin/intern/tasks`} />
      case "attendance": return <DataTable title="All Attendance" url={`${BASE}/admin/intern/attendance`} columns={[{ key: "internName", label: "Intern" }, { key: "date", label: "Date" }, { key: "checkIn", label: "Check In" }, { key: "checkOut", label: "Check Out" }, { key: "status", label: "Status" }, { key: "location", label: "Location" }]} />
      case "journals": return <DataTable title="All Journals" url={`${BASE}/admin/intern/journals`} columns={[{ key: "title", label: "Title" }, { key: "date", label: "Date" }, { key: "workedOn", label: "Worked On" }, { key: "userId", label: "User ID" }]} />
      case "stats": return <SystemStats />
      case "logs": return <Logs />
      case "settings": return <AdminSettings />
      default: return <Overview setActive={setActive} />
    }
  }

  const TITLES = { overview: "Admin Overview", users: "All Users", "intern-portal": "Intern Portal", "mentor-portal": "Mentor Portal", "eval-portal": "Evaluation Portal", "inst-portal": "Institution Portal", tasks: "All Tasks", attendance: "All Attendance", journals: "All Journals", stats: "System Stats", logs: "Admin Logs", settings: "Admin Settings" }

  return (
    <div className="portal-root" style={{ width: "100%", height: "100vh", overflow: "hidden", display: "flex", background: "#050816", color: "white" }}>
      <Sidebar active={active} setActive={setActive} />
      <main className="portal-main" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, background: "#070B1A" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", fontWeight: 700, color: "white" }}>
            <Shield size={18} color="#ef4444" /> {TITLES[active] || "Admin Panel"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
              <input placeholder="Search administration..." style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "7px 12px 7px 32px", fontSize: "12px", color: "white", outline: "none", width: "200px" }} />
            </div>
            <button style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
              <Bell size={16} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "8px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg,#ef4444,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "white" }}>
                {(user.fullName || "A").charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "white", maxWidth: "140px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.fullName || "Administrator"}
              </span>
            </div>
          </div>
        </div>
        <div className="portal-content" style={{ flex: 1, overflow: "auto", padding: "24px 28px", minWidth: 0 }}>
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<PortalLoadingSkeleton title="Admin Panel" />}>
      <AdminContent />
    </Suspense>
  )
}
