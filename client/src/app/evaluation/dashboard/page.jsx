"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useRoleGuard, usePortalAuth, PortalLoadingSkeleton, getUser, logout } from "../../../lib/roleGuard"
import {
  LayoutDashboard, Star, FileText, BarChart3, TrendingUp,
  MessageSquare, Settings, LogOut, Search, Plus, X, Download,
  Eye, Edit, Trash2, ChevronLeft, ChevronRight, Send, ClipboardList,
  Clock, CheckCircle,
} from "lucide-react"
import { IconBadge } from "../../../lib/iconBadge"
import { ResponsiveContainer, AreaChart, Area, Tooltip, CartesianGrid, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts"

const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/evaluation-portal"
const G = { background: "rgba(17,25,40,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px" }
const inp = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", color: "white", outline: "none", width: "100%" }

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Star, label: "Evaluations", id: "evaluations" },
  { icon: FileText, label: "Rubrics", id: "rubrics" },
  { icon: FileText, label: "Submissions", id: "submissions" },
  { icon: BarChart3, label: "Score Analytics", id: "score-analytics" },
  { icon: TrendingUp, label: "Performance Reports", id: "performance-reports" },
  { icon: MessageSquare, label: "Feedback", id: "feedback" },
  { icon: Settings, label: "Settings", id: "settings" },
]

const STA_C = {
  Completed: { c: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  Pending: { c: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  "In Progress": { c: "#06B6D4", bg: "rgba(6,182,212,0.15)" },
  Overdue: { c: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  Evaluated: { c: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  "Pending Review": { c: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
}

function Sidebar({ active, setActive }) {
  const router = useRouter()
  const [user, setUser] = useState(() => {
    try {
      const u = getUser("evaluator")
      if (u?.fullName) return u
    } catch { }
    return { fullName: "Evaluator", role: "evaluator" }
  })
  useEffect(() => {
    const load = () => {
      try {
        const u = getUser("evaluator")
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
          <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(124,58,237,0.35)" }}>
            <Star size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>EVALUATION</div>
            <div style={{ fontSize: "10px", color: "#06B6D4", fontWeight: 600 }}>Assessment Panel</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto", maxHeight: "calc(100vh - 160px)", paddingRight: "2px" }}>
          {NAV.map(n => {
            const Icon = n.icon; const isA = active === n.id
            return (
              <button key={n.id} onClick={() => setActive(n.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 500, transition: "all 0.15s",
                  background: isA ? "rgba(124,58,237,0.25)" : "transparent",
                  color: isA ? "white" : "rgba(255,255,255,0.6)",
                  borderLeft: isA ? "3px solid #7C3AED" : "3px solid transparent"
                }}>
                <Icon size={15} style={{ color: isA ? "#7C3AED" : "rgba(255,255,255,0.45)", flexShrink: 0 }} />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ marginTop: "auto", padding: "10px 14px 16px", flexShrink: 0 }}>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "white", flexShrink: 0 }}>
              {(user.fullName || "E").charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={user.fullName || "Evaluator"}>
                {user.fullName || "Evaluator"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: "10px", color: "#22c55e", fontWeight: 600 }}>Active</span>
              </div>
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

// ── 1. DASHBOARD ──────────────────────────────────────────────────────────────
function Dashboard({ user }) {
  const [data, setData] = useState(null)
  useEffect(() => { fetch(`${BASE}/overview`).then(r => r.json()).then(d => setData(d)).catch(() => { }) }, [])
  const trendData = [{ d: "May 1", v: 20 }, { d: "May 7", v: 35 }, { d: "May 13", v: 50 }, { d: "May 19", v: 60 }, { d: "May 25", v: 72 }, { d: "May 31", v: 80 }]
  const statusData = [{ name: "Completed", v: 36, c: "#22c55e" }, { name: "In Progress", v: 20, c: "#06B6D4" }, { name: "Pending", v: 10, c: "#f59e0b" }, { name: "Overdue", v: 6, c: "#ef4444" }]
  const criteriaData = [{ name: "Technical Skills", v: 4.35 }, { name: "Problem Solving", v: 4.28 }, { name: "Communication", v: 4.15 }, { name: "Documentation", v: 4.05 }, { name: "Innovation", v: 3.95 }]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "18px", fontWeight: 700, color: "white" }}>Welcome back, {user.fullName || "Evaluator"}!</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        {[{ l: "Evaluations Done", v: data?.total || 36, c: "#7C3AED", Icon: ClipboardList }, { l: "Pending Evaluations", v: data?.pending || 20, c: "#f59e0b", Icon: Clock }, { l: "Average Score", v: `${data?.averageScore || 82.4}`, c: "#22c55e", Icon: Star }, { l: "Completion Rate", v: `${data?.completionRate || 76}%`, c: "#06B6D4", Icon: CheckCircle }].map((s, i) => (
          <div key={i} style={{ ...G, padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
            <IconBadge Icon={s.Icon} color={s.c} size={18} box={40} />
            <div><div style={{ fontSize: "22px", fontWeight: 700, color: s.c }}>{s.v}</div><div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Evaluation Trend (This Month)</div>
          <div style={{ height: "150px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="d" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "10px" }} />
                <Line type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2} dot={{ fill: "#7C3AED", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Score Distribution</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative", width: "100px", height: "100px", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={[{ v: 40, c: "#22c55e" }, { v: 30, c: "#06B6D4" }, { v: 20, c: "#f59e0b" }, { v: 10, c: "#ef4444" }]} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="v" strokeWidth={0}>{[{ v: 40, c: "#22c55e" }, { v: 30, c: "#06B6D4" }, { v: 20, c: "#f59e0b" }, { v: 10, c: "#ef4444" }].map((d, i) => <Cell key={i} fill={d.c} />)}</Pie></PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>82.4</span>
                <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)" }}>Average</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[["Excellent (90-100)", "#22c55e", "40%"], ["Good (75-89)", "#06B6D4", "30%"], ["Average (60-74)", "#f59e0b", "20%"], ["Below Avg (<60)", "#ef4444", "10%"]].map(([l, c, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: c }} /><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)" }}>{l}</span></div>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Evaluations by Status</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative", width: "90px", height: "90px", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={24} outerRadius={42} dataKey="v" strokeWidth={0}>{statusData.map((d, i) => <Cell key={i} fill={d.c} />)}</Pie></PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>72</span>
                <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)" }}>Total</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {statusData.map(d => (
                <div key={d.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: d.c }} /><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)" }}>{d.name}</span></div>
                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>{d.v} ({Math.round(d.v / 72 * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Top Criteria Averages</div>
          {criteriaData.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", minWidth: "120px" }}>{c.name}</span>
              <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${c.v / 5 * 100}%`, height: "100%", background: "linear-gradient(90deg,#7C3AED,#06B6D4)", borderRadius: "3px" }} />
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "white", minWidth: "28px" }}>{c.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 2. EVALUATIONS ────────────────────────────────────────────────────────────
function Evaluations() {
  const [evals, setEvals] = useState([])
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ evaluator: "", type: "Technical", evaluatee: "Dr. Neha Verma", evaluationName: "", dueDate: "", status: "Pending" })
  const load = () => fetch(`${BASE}/evaluations`).then(r => r.json()).then(d => { if (Array.isArray(d)) setEvals(d) }).catch(() => { })
  useEffect(() => { load() }, [])
  const filtered = evals.filter(e => (e.evaluator || "").toLowerCase().includes(search.toLowerCase()) || (e.evaluationName || "").toLowerCase().includes(search.toLowerCase()))
  const add = async () => {
    if (!form.evaluator || !form.evaluationName) return
    await fetch(`${BASE}/evaluations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => { })
    setEvals(p => [...p, { ...form, _id: Date.now().toString() }]); setShowAdd(false)
  }
  const download = (name) => { const blob = new Blob([`Evaluation: ${name}`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${name}.txt`; a.click(); URL.revokeObjectURL(url) }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        {[{ l: "Total Evaluations", v: evals.length || 36, c: "#7C3AED" }, { l: "Pending", v: evals.filter(e => e.status === "Pending").length || 20, c: "#f59e0b" }, { l: "In Progress", v: evals.filter(e => e.status === "In Progress").length || 10, c: "#06B6D4" }, { l: "Completed", v: evals.filter(e => e.status === "Completed").length || 6, c: "#22c55e" }].map((s, i) => (
          <div key={i} style={{ ...G, padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <Search size={11} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search evaluations…" style={{ ...inp, paddingLeft: "28px", width: "220px" }} />
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "11px", cursor: "pointer" }}>
          <Plus size={11} /> Add Evaluation
        </button>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Evaluator", "Type", "Evaluatee", "Evaluation Name", "Due Date", "Status", "Score", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={ev => ev.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "9px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "#a78bfa" }}>{(e.evaluator || "?").charAt(0)}</div>
                    <span style={{ fontSize: "11px", color: "white" }}>{e.evaluator}</span>
                  </div>
                </td>
                <td style={{ padding: "9px 12px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{e.type}</td>
                <td style={{ padding: "9px 12px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{e.evaluatee}</td>
                <td style={{ padding: "9px 12px", fontSize: "11px", color: "white" }}>{e.evaluationName}</td>
                <td style={{ padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{e.dueDate}</td>
                <td style={{ padding: "9px 12px" }}><span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", color: STA_C[e.status]?.c || "#fff", background: STA_C[e.status]?.bg || "rgba(255,255,255,0.1)" }}>{e.status}</span></td>
                <td style={{ padding: "9px 12px", fontSize: "12px", fontWeight: 700, color: e.score ? "#7C3AED" : "rgba(255,255,255,0.3)" }}>{e.score || "—"}</td>
                <td style={{ padding: "9px 12px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => download(e.evaluationName)} style={{ padding: "3px 7px", borderRadius: "6px", background: "rgba(6,182,212,0.15)", border: "none", color: "#06B6D4", fontSize: "10px", cursor: "pointer" }}><Eye size={10} /></button>
                    <button onClick={async () => { await fetch(`${BASE}/evaluations/${e._id}`, { method: "DELETE" }).catch(() => { }); setEvals(p => p.filter(x => x._id !== e._id)) }} style={{ padding: "3px 7px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", border: "none", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}><Trash2 size={10} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing 1 to {filtered.length} of {evals.length}</div>
      </div>
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "420px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Add Evaluation</span>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            {[{ l: "Evaluator Name", k: "evaluator" }, { l: "Evaluation Name", k: "evaluationName" }, { l: "Due Date", k: "dueDate" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inp}>
                {["Technical", "Documentation", "Code Quality", "Presentation", "DevOps", "UI/UX Design"].map(t => <option key={t} style={{ background: "#0B1120" }}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
              <button onClick={add} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 3. RUBRICS ────────────────────────────────────────────────────────────────
function Rubrics() {
  const [rubrics, setRubrics] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", criteria: 5, totalWeight: 100 })
  const load = () => fetch(`${BASE}/rubrics`).then(r => r.json()).then(d => { if (Array.isArray(d)) setRubrics(d) }).catch(() => { })
  useEffect(() => { load() }, [])
  const add = async () => {
    if (!form.name) return
    await fetch(`${BASE}/rubrics`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => { })
    setRubrics(p => [...p, { ...form, _id: Date.now().toString() }]); setShowAdd(false)
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "11px", cursor: "pointer" }}>
          <Plus size={11} /> Create Rubric
        </button>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Rubric Name", "Description", "Criteria", "Total Weight", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rubrics.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 500, color: "white" }}>{r.name}</td>
                <td style={{ padding: "10px 14px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{r.description}</td>
                <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 600, color: "white" }}>{r.criteria}</td>
                <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 600, color: "#7C3AED" }}>{r.totalWeight}%</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(124,58,237,0.2)", border: "none", color: "#a78bfa", fontSize: "10px", cursor: "pointer" }}><Edit size={10} /></button>
                    <button onClick={async () => { await fetch(`${BASE}/rubrics/${r._id}`, { method: "DELETE" }).catch(() => { }); setRubrics(p => p.filter(x => x._id !== r._id)) }} style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", border: "none", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}><Trash2 size={10} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing 1 to {rubrics.length} of {rubrics.length}</div>
      </div>
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Create Rubric</span>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            {[{ l: "Rubric Name", k: "name" }, { l: "Description", k: "description" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Number of Criteria</label>
              <input type="number" min="1" max="10" value={form.criteria} onChange={e => setForm(p => ({ ...p, criteria: parseInt(e.target.value) || 5 }))} style={inp} />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
              <button onClick={add} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 4. SUBMISSIONS ────────────────────────────────────────────────────────────
function Submissions() {
  const [subs, setSubs] = useState([])
  const [search, setSearch] = useState("")
  const fileRef = useRef(null)
  const load = () => fetch(`${BASE}/submissions`).then(r => r.json()).then(d => { if (Array.isArray(d)) setSubs(d) }).catch(() => { })
  useEffect(() => { load() }, [])
  const filtered = subs.filter(s => (s.internName || "").toLowerCase().includes(search.toLowerCase()))
  const download = (file) => { const blob = new Blob([`File: ${file}`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = file; a.click(); URL.revokeObjectURL(url) }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        {[{ l: "Total Submissions", v: subs.length || 45, c: "#7C3AED" }, { l: "Pending Review", v: subs.filter(s => s.status === "Pending Review").length || 18, c: "#f59e0b" }, { l: "Under Evaluation", v: subs.filter(s => s.status === "In Progress").length || 15, c: "#06B6D4" }, { l: "Evaluated", v: subs.filter(s => s.status === "Evaluated").length || 12, c: "#22c55e" }].map((s, i) => (
          <div key={i} style={{ ...G, padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={11} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search submissions…" style={{ ...inp, paddingLeft: "28px" }} />
        </div>
        <select style={{ ...inp, width: "130px" }}><option style={{ background: "#0B1120" }}>All Types</option></select>
        <select style={{ ...inp, width: "140px" }}><option style={{ background: "#0B1120" }}>All Evaluators</option></select>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Intern Name", "Type", "Evaluation", "Submitted On", "File", "Status", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "9px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "#a78bfa" }}>{(s.internName || "?").charAt(0)}</div>
                    <span style={{ fontSize: "11px", color: "white" }}>{s.internName}</span>
                  </div>
                </td>
                <td style={{ padding: "9px 12px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{s.type}</td>
                <td style={{ padding: "9px 12px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{s.evaluation}</td>
                <td style={{ padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{s.submittedOn}</td>
                <td style={{ padding: "9px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ fontSize: "10px", color: "#06B6D4" }}>{s.file}</span>
                    <button onClick={() => download(s.file)} style={{ background: "none", border: "none", cursor: "pointer" }}><Download size={10} color="#06B6D4" /></button>
                  </div>
                </td>
                <td style={{ padding: "9px 12px" }}><span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", color: STA_C[s.status]?.c || "#fff", background: STA_C[s.status]?.bg || "rgba(255,255,255,0.1)" }}>{s.status}</span></td>
                <td style={{ padding: "9px 12px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => download(s.file)} style={{ padding: "3px 7px", borderRadius: "6px", background: "rgba(6,182,212,0.15)", border: "none", color: "#06B6D4", fontSize: "10px", cursor: "pointer" }}><Eye size={10} /></button>
                    <button onClick={async () => { await fetch(`${BASE}/submissions/${s._id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Evaluated" }) }).catch(() => { }); setSubs(p => p.map(x => x._id === s._id ? { ...x, status: "Evaluated" } : x)) }} style={{ padding: "3px 7px", borderRadius: "6px", background: "rgba(124,58,237,0.2)", border: "none", color: "#a78bfa", fontSize: "10px", cursor: "pointer" }}>Evaluate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing 1 to {filtered.length} of {subs.length}</div>
      </div>
    </div>
  )
}

// ── 5. SCORE ANALYTICS ────────────────────────────────────────────────────────
function ScoreAnalytics() {
  const [data, setData] = useState(null)
  useEffect(() => { fetch(`${BASE}/score-analytics`).then(r => r.json()).then(d => setData(d)).catch(() => { }) }, [])
  const trendData = data?.trendData || [{ d: "May 1", v: 75 }, { d: "May 7", v: 78 }, { d: "May 13", v: 80 }, { d: "May 19", v: 82 }, { d: "May 25", v: 82.4 }, { d: "May 31", v: 84 }]
  const deptData = data?.byDept ? Object.entries(data.byDept).map(([k, v]) => ({ name: k, v })) : [{ name: "CSE", v: 85.6 }, { name: "IT", v: 90.2 }, { name: "ECE", v: 78.4 }, { name: "AIML", v: 88.7 }, { name: "ME", v: 74.1 }]
  const distData = [{ name: "Excellent (90-100)", v: 40, c: "#22c55e" }, { name: "Good (80-89)", v: 35, c: "#06B6D4" }, { name: "Average (60-79)", v: 15, c: "#f59e0b" }, { name: "Below Avg (<60)", v: 10, c: "#ef4444" }]
  const topPerformers = data?.topPerformers || [{ name: "Riya Sharma", score: 92.6 }, { name: "Aditya Singh", score: 90.1 }, { name: "Mehul Joshi", score: 88.7 }, { name: "Karan Verma", score: 85.2 }, { name: "Sneha Patil", score: 83.4 }]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        {[{ l: "Average Score", v: `${data?.averageScore || 82.4}`, c: "#7C3AED" }, { l: "Highest Score", v: `${data?.highestScore || 92.6}`, c: "#22c55e" }, { l: "Lowest Score", v: `${data?.lowestScore || 45.3}`, c: "#ef4444" }, { l: "Evaluation Completion", v: `${data?.completionRate || 76}%`, c: "#06B6D4" }].map((s, i) => (
          <div key={i} style={{ ...G, padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Average Score Trend</div>
          <div style={{ height: "150px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="d" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} domain={[60, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "10px" }} />
                <Line type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2} dot={{ fill: "#7C3AED", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Average Score by Department</div>
          <div style={{ height: "150px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} domain={[60, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "10px" }} />
                <Bar dataKey="v" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Score Distribution</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative", width: "100px", height: "100px", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={distData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="v" strokeWidth={0}>{distData.map((d, i) => <Cell key={i} fill={d.c} />)}</Pie></PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>72</span>
                <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)" }}>Total</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {distData.map(d => <div key={d.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><div style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: d.c }} /><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)" }}>{d.name}</span></div><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>{d.v}%</span></div>)}
            </div>
          </div>
        </div>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Top Performing Interns</div>
          {topPerformers.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "#a78bfa" }}>{p.name.charAt(0)}</div>
              <span style={{ fontSize: "11px", color: "white", flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#7C3AED" }}>{p.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 6. PERFORMANCE REPORTS ────────────────────────────────────────────────────
function PerformanceReports() {
  const [reports, setReports] = useState([])
  const [generating, setGenerating] = useState(false)
  const load = () => fetch(`${BASE}/performance-reports`).then(r => r.json()).then(d => { if (Array.isArray(d)) setReports(d) }).catch(() => { })
  useEffect(() => { load() }, [])
  const generate = async () => {
    setGenerating(true)
    const u = getUser()
    await fetch(`${BASE}/performance-reports`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: `Performance Report — ${new Date().toLocaleDateString()}`, type: "Summary", generatedBy: u.fullName || "Dr. Neha Verma" }) }).catch(() => { })
    load(); setGenerating(false)
  }
  const download = (r) => { const blob = new Blob([`Report: ${r.name}\nType: ${r.type}\nGenerated: ${r.generatedOn}\nBy: ${r.generatedBy}`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${r.name}.txt`; a.click(); URL.revokeObjectURL(url) }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <select style={{ ...inp, width: "160px" }}><option style={{ background: "#0B1120" }}>Individual Report</option><option style={{ background: "#0B1120" }}>Department Report</option><option style={{ background: "#0B1120" }}>Organization Report</option></select>
          <select style={{ ...inp, width: "120px" }}><option style={{ background: "#0B1120" }}>May 2025</option></select>
        </div>
        <button onClick={generate} disabled={generating} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "11px", cursor: "pointer" }}>
          <Download size={11} /> {generating ? "Generating…" : "Export PDF"}
        </button>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Report Name", "Type", "Generated On", "Generated By", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 500, color: "white" }}>{r.name}</td>
                <td style={{ padding: "10px 14px" }}><span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", color: "#7C3AED", background: "rgba(124,58,237,0.15)" }}>{r.type}</span></td>
                <td style={{ padding: "10px 14px", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{r.generatedOn}</td>
                <td style={{ padding: "10px 14px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{r.generatedBy}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => download(r)} style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(6,182,212,0.15)", border: "none", color: "#06B6D4", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}><Download size={10} /></button>
                    <button onClick={async () => { await fetch(`${BASE}/performance-reports/${r._id}`, { method: "DELETE" }).catch(() => { }); setReports(p => p.filter(x => x._id !== r._id)) }} style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", border: "none", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}><Trash2 size={10} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing 1 to {reports.length} of {reports.length}</div>
      </div>
    </div>
  )
}

// ── 7. FEEDBACK ───────────────────────────────────────────────────────────────
function Feedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [tab, setTab] = useState("From Mentors")
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ fromName: "Dr. Neha Verma", toName: "", text: "", rating: 5 })
  const load = () => fetch(`${BASE}/feedback`).then(r => r.json()).then(d => { if (Array.isArray(d)) setFeedbacks(d) }).catch(() => { })
  useEffect(() => { load() }, [])
  const filtered = feedbacks.filter(f => (f.toName || "").toLowerCase().includes(search.toLowerCase()))
  const add = async () => {
    if (!form.toName || !form.text) return
    await fetch(`${BASE}/feedback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => { })
    setFeedbacks(p => [...p, { ...form, _id: Date.now().toString(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) }])
    setShowAdd(false); setForm({ fromName: "Dr. Neha Verma", toName: "", text: "", rating: 5 })
  }
  const Stars = ({ rating }) => (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ fontSize: "12px", color: i <= rating ? "#f59e0b" : "rgba(255,255,255,0.2)" }}>★</span>)}
    </div>
  )
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {["From Mentors", "From Interns", "From Institutions"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 14px", borderRadius: "9px", fontSize: "11px", border: "none", cursor: "pointer", background: tab === t ? "linear-gradient(135deg,#7C3AED,#06B6D4)" : "rgba(255,255,255,0.06)", color: tab === t ? "white" : "rgba(255,255,255,0.5)" }}>{t}</button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "11px", cursor: "pointer" }}>
          <Plus size={11} /> Add Feedback
        </button>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={11} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search feedback…" style={{ ...inp, paddingLeft: "28px" }} />
        </div>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["From", "To", "Feedback", "Date", "Rating", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((f, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "#a78bfa" }}>{(f.fromName || "?").charAt(0)}</div>
                    <span style={{ fontSize: "11px", color: "white" }}>{f.fromName}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{f.toName}</td>
                <td style={{ padding: "10px 14px", fontSize: "11px", color: "rgba(255,255,255,0.6)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.text}</td>
                <td style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{f.date}</td>
                <td style={{ padding: "10px 14px" }}><Stars rating={f.rating || 5} /></td>
                <td style={{ padding: "10px 14px" }}>
                  <button style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(6,182,212,0.15)", border: "none", color: "#06B6D4", fontSize: "10px", cursor: "pointer" }}><Eye size={10} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing 1 to {filtered.length} of {feedbacks.length}</div>
      </div>
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Add Feedback</span>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            {[{ l: "To (Intern Name)", k: "toName" }, { l: "Feedback", k: "text" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                {f.k === "text" ? <textarea rows={2} value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={{ ...inp, resize: "none" }} /> : <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />}
              </div>
            ))}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Rating</label>
              <div style={{ display: "flex", gap: "6px" }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} onClick={() => setForm(p => ({ ...p, rating: i }))} style={{ fontSize: "20px", background: "none", border: "none", cursor: "pointer", color: i <= form.rating ? "#f59e0b" : "rgba(255,255,255,0.2)" }}>★</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
              <button onClick={add} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 8. SETTINGS ───────────────────────────────────────────────────────────────
function EvalSettings() {
  const [settings, setSettings] = useState({ evaluatorName: "Dr. Neha Verma", email: "neha.verma@abcit.edu.in", designation: "Professor", department: "Computer Science Engineering", phone: "+91 98765 43210", theme: "dark" })
  const [saved, setSaved] = useState(false)
  const [cur, setCur] = useState(""); const [nw, setNw] = useState(""); const [conf, setConf] = useState(""); const [pwMsg, setPwMsg] = useState("")
  useEffect(() => { fetch(`${BASE}/settings`).then(r => r.json()).then(d => { if (d.evaluatorName) setSettings(d) }).catch(() => { }) }, [])
  const save = async () => {
    await fetch(`${BASE}/settings`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) }).catch(() => { })
    const apiRoot = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const u = getUser(); if (u.id) await fetch(`${apiRoot}/auth/profile/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: settings.evaluatorName, phone: settings.phone }) }).catch(() => { })
    const updated = { ...u, fullName: settings.evaluatorName }; localStorage.setItem("user", JSON.stringify(updated))
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  const changePw = async () => {
    if (!cur || !nw || nw !== conf) { setPwMsg("Check fields"); return }
    const u = getUser()
    const apiRoot = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const res = await fetch(`${apiRoot}/auth/change-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id, currentPassword: cur, newPassword: nw }) }).catch(() => ({ ok: false }))
    setPwMsg(res.ok ? "Password changed!" : "Failed — check current password")
    if (res.ok) { setCur(""); setNw(""); setConf("") }
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      <div style={{ ...G, padding: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "white", marginBottom: "14px" }}>Profile Settings</div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: "white" }}>
            {(settings.evaluatorName || "E").charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>{settings.evaluatorName}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Admin</div>
            <button style={{ marginTop: "4px", padding: "4px 10px", borderRadius: "7px", background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontSize: "10px", cursor: "pointer" }}>Change Photo</button>
          </div>
        </div>
        {[{ l: "Full Name", k: "evaluatorName" }, { l: "Email", k: "email" }, { l: "Phone", k: "phone" }].map(f => (
          <div key={f.k} style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
            <input value={settings[f.k] || ""} onChange={e => setSettings(p => ({ ...p, [f.k]: e.target.value }))} style={inp} disabled={f.k === "email"} />
          </div>
        ))}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Designation</label>
          <select value={settings.designation} onChange={e => setSettings(p => ({ ...p, designation: e.target.value }))} style={inp}>
            {["Professor", "Associate Professor", "Assistant Professor", "HOD", "Dean"].map(d => <option key={d} style={{ background: "#0B1120" }}>{d}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Department</label>
          <select value={settings.department} onChange={e => setSettings(p => ({ ...p, department: e.target.value }))} style={inp}>
            {["Computer Science Engineering", "Information Technology", "Electronics & Communication", "Mechanical Engineering", "Artificial Intelligence"].map(d => <option key={d} style={{ background: "#0B1120" }}>{d}</option>)}
          </select>
        </div>
        <button onClick={save} style={{ padding: "9px 20px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
          {saved ? "Saved!" : "Update Profile"}
        </button>
      </div>
      <div style={{ ...G, padding: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "white", marginBottom: "14px" }}>Change Password</div>
        {[{ l: "Current Password", v: cur, set: setCur }, { l: "New Password", v: nw, set: setNw }, { l: "Confirm Password", v: conf, set: setConf }].map(f => (
          <div key={f.l} style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
            <input type="password" value={f.v} onChange={e => f.set(e.target.value)} style={inp} />
          </div>
        ))}
        {pwMsg && <div style={{ fontSize: "11px", color: pwMsg.includes("changed") ? "#22c55e" : "#ef4444", marginBottom: "8px" }}>{pwMsg}</div>}
        <button onClick={changePw} style={{ padding: "9px 20px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Update Password</button>
      </div>
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
function EvaluationContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const auth = usePortalAuth(["admin", "institution", "mentor", "evaluator"], "evaluator")
  const [active, setActive] = useState(tabParam || "dashboard")
  const [user, setUser] = useState(() => {
    try {
      const u = getUser("evaluator")
      if (u?.fullName) return u
    } catch { }
    return { fullName: "Evaluator", role: "evaluator" }
  })

  useEffect(() => {
    if (auth.user?.fullName) setUser(auth.user)
  }, [auth.user])

  useEffect(() => {
    const load = () => {
      try {
        const u = getUser("evaluator")
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

  useEffect(() => { if (tabParam) setActive(tabParam) }, [tabParam])

  if (auth.loading || !auth.authorized) {
    return <PortalLoadingSkeleton title="Evaluation Portal" />
  }

  const TITLES = { dashboard: "Evaluation Dashboard", evaluations: "Evaluations", rubrics: "Rubrics", submissions: "Submissions for Evaluation", "score-analytics": "Score Analytics", "performance-reports": "Performance Reports", feedback: "Feedback", settings: "Settings" }
  const SUBS = { dashboard: "Here's an overview of evaluation activities.", evaluations: "Manage and track all evaluations.", rubrics: "Create and manage evaluation rubrics.", submissions: "Review intern submissions for evaluation.", "score-analytics": "Detailed score analytics and insights.", "performance-reports": "Generate and view performance reports.", feedback: "View and manage feedback.", settings: "Manage your profile and settings." }

  const renderContent = () => {
    switch (active) {
      case "dashboard": return <Dashboard user={user} />
      case "evaluations": return <Evaluations />
      case "rubrics": return <Rubrics />
      case "submissions": return <Submissions />
      case "score-analytics": return <ScoreAnalytics />
      case "performance-reports": return <PerformanceReports />
      case "feedback": return <Feedback />
      case "settings": return <EvalSettings />
      default: return <Dashboard user={user} />
    }
  }

  return (
    <div className="portal-root" style={{ width: "100%", height: "100vh", overflow: "hidden", display: "flex", background: "#050816", color: "white" }}>
      <Sidebar active={active} setActive={setActive} />
      <main className="portal-main" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, background: "#070B1A" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "white" }}>{TITLES[active] || "Evaluation Portal"}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>{SUBS[active]}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>Active Period</span>
            <button style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", color: "white" }}>
              <Star size={16} />
              <span style={{ position: "absolute", top: "5px", right: "5px", width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", border: "2px solid #070B1A" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "8px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "white" }}>
                {(user.fullName || "E").charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "white", maxWidth: "140px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.fullName || "Evaluator"}
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

export default function EvaluationDashboard() {
  return (
    <Suspense fallback={<PortalLoadingSkeleton title="Evaluation Portal" />}>
      <EvaluationContent />
    </Suspense>
  )
}
