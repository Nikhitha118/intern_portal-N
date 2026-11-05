"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useRoleGuard, usePortalAuth, PortalLoadingSkeleton, getUser, logout } from "../../../lib/roleGuard"
import {
  LayoutDashboard, Building2, Briefcase, BookOpen, Users, BarChart3,
  CheckCircle2, FileText, Calendar, Bell, Settings, User, LogOut,
  Search, Plus, X, Download, Upload, Edit, Trash2, ChevronLeft,
  ChevronRight, RefreshCw, Shield, Activity, ArrowUp, CheckCircle,
  BarChart3 as BarChart3Icon, Calendar as CalendarIcon, Star as StarIcon,
  Megaphone, Trophy, Bell as BellIcon, Users as UsersIcon, User as UserIcon, ClipboardList,
} from "lucide-react"
import { IconBadge } from "../../../lib/iconBadge"
import { NOTIF_TYPE_ICONS, ACTIVITY_MODULE_ICONS } from "../../../lib/uiIcons"
import { ResponsiveContainer, AreaChart, Area, Tooltip, CartesianGrid, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts"

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const G = { background: "rgba(17,25,40,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px" }
const inp = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", color: "white", outline: "none", width: "100%" }

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Building2, label: "Organizations", id: "organizations" },
  { icon: Briefcase, label: "Internships", id: "internships" },
  { icon: BookOpen, label: "Departments", id: "departments" },
  { icon: Users, label: "Interns", id: "interns" },
  { icon: BarChart3, label: "Reports & Analytics", id: "reports" },
  { icon: CheckCircle2, label: "Completion Status", id: "completion" },
  { icon: FileText, label: "Documents", id: "documents" },
  { icon: Calendar, label: "Calendar", id: "calendar" },
  { icon: Bell, label: "Notifications", id: "notifications" },
  { icon: Settings, label: "Settings", id: "settings" },
  { icon: User, label: "Profile", id: "profile" },
  { icon: Users, label: "User Management", id: "users" },
  { icon: Activity, label: "System Activity", id: "activity" },
]

const STA_C = { Active: { c: "#22c55e", bg: "rgba(34,197,94,0.15)" }, Pending: { c: "#f59e0b", bg: "rgba(245,158,11,0.15)" }, Inactive: { c: "#ef4444", bg: "rgba(239,68,68,0.15)" }, Completed: { c: "#06B6D4", bg: "rgba(6,182,212,0.15)" }, Failed: { c: "#ef4444", bg: "rgba(239,68,68,0.15)" }, Success: { c: "#22c55e", bg: "rgba(34,197,94,0.15)" } }
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const DEMO_COMPLETION = [
  { internship: "Web Development Internship", completed: 24, inProgress: 12, overdue: 2, completionPct: 78, department: "CSE", organization: "TechNova", mentor: "Priya Sharma", duration: "6 months", placed: 18, avgScore: 86 },
  { internship: "Data Science Program", completed: 18, inProgress: 8, overdue: 1, completionPct: 82, department: "AIML", organization: "DataCore", mentor: "Rahul Mehta", duration: "5 months", placed: 14, avgScore: 88 },
  { internship: "Mobile App Development", completed: 12, inProgress: 14, overdue: 3, completionPct: 65, department: "IT", organization: "AppWorks", mentor: "Sneha Iyer", duration: "4 months", placed: 9, avgScore: 79 },
  { internship: "Cloud & DevOps Track", completed: 20, inProgress: 6, overdue: 0, completionPct: 91, department: "CSE", organization: "CloudNine", mentor: "Amit Patel", duration: "6 months", placed: 17, avgScore: 90 },
  { internship: "UI/UX Design Internship", completed: 10, inProgress: 16, overdue: 2, completionPct: 58, department: "IT", organization: "DesignHub", mentor: "Karan Verma", duration: "4 months", placed: 7, avgScore: 84 },
  { internship: "Cybersecurity Fellowship", completed: 8, inProgress: 8, overdue: 0, completionPct: 72, department: "ECE", organization: "SecureNet", mentor: "Mehul Joshi", duration: "5 months", placed: 6, avgScore: 87 },
]

/** Stat card with background area chart (intern-dashboard style) */
function InstitutionMetricCard({ label, value, trend, color, chartData, gradId, unit = "" }) {
  const [hovered, setHovered] = useState(false)
  const data = chartData || [{ day: "Mon", v: 0 }, { day: "Sun", v: 0 }]
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...G,
        padding: "12px 14px 0",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: "148px",
        borderColor: hovered ? `${color}66` : "rgba(255,255,255,0.08)",
        transition: "border-color 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
        <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: hovered ? color : "rgba(255,255,255,0.45)", marginBottom: "4px" }}>{label}</div>
        <div style={{ fontSize: "26px", fontWeight: 700, color: "white", lineHeight: 1.1 }}>{value}</div>
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px", fontSize: "10px" }}>
            <ArrowUp size={11} color="#4ade80" />
            <span style={{ color: "#4ade80", fontWeight: 600 }}>{trend}</span>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>from last week</span>
          </div>
        )}
      </div>
      <div style={{ position: "relative", zIndex: 1, flex: 1, width: "100%", minHeight: "72px", marginTop: "4px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -26 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={hovered ? 0.65 : 0.45} />
                <stop offset="100%" stopColor={color} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 8 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 8 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}${unit}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0B1120", border: `1px solid ${color}44`, borderRadius: "8px", fontSize: "10px" }}
              formatter={v => [`${v}${unit}`, label]}
            />
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  const router = useRouter()
  const [user, setUser] = useState(() => {
    try {
      const u = getUser("institution")
      if (u?.fullName) return u
    } catch { }
    return { fullName: "Administrator" }
  })
  useEffect(() => {
    const load = () => {
      try {
        const u = getUser("institution")
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
          <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(99,102,241,0.35)" }}>
            <Building2 size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>INSTITUTION</div>
            <div style={{ fontSize: "10px", color: "#818cf8", fontWeight: 600 }}>Campus Portal</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto", maxHeight: "calc(100vh - 160px)", paddingRight: "2px" }}>
          {NAV.map(n => {
            const Icon = n.icon; const isA = active === n.id
            return (
              <button key={n.id} onClick={() => setActive(n.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 500, transition: "all 0.15s",
                  background: isA ? "rgba(99,102,241,0.25)" : "transparent",
                  color: isA ? "white" : "rgba(255,255,255,0.6)",
                  borderLeft: isA ? "3px solid #6366F1" : "3px solid transparent"
                }}>
                <Icon size={15} style={{ color: isA ? "#6366F1" : "rgba(255,255,255,0.45)", flexShrink: 0 }} />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ marginTop: "auto", padding: "10px 14px 16px", flexShrink: 0 }}>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "white", flexShrink: 0 }}>
              {(user.fullName || "A").charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={user.fullName || "Admin"}>
                {user.fullName || "Admin"}
              </div>
              <div style={{ fontSize: "10px", color: "#818cf8", fontWeight: 500 }}>Institution Manager</div>
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

function Topbar({ title, subtitle, notifCount = 0 }) {
  return (
    <div style={{ height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, background: "rgba(11,17,32,0.85)", backdropFilter: "blur(10px)" }}>
      <div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>May 2025</span>
        <button style={{ position: "relative", width: "32px", height: "32px", borderRadius: "9px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Bell size={14} color="white" />
          {notifCount > 0 && <span style={{ position: "absolute", top: "4px", right: "4px", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", border: "1.5px solid #0B1120" }} />}
        </button>
      </div>
    </div>
  )
}

// ── 1. DASHBOARD ──────────────────────────────────────────────────────────────
function Dashboard({ setActive, user }) {
  const [data, setData] = useState(null)
  useEffect(() => { fetch(`${BASE}/institution/overview`).then(r => r.json()).then(d => setData(d)).catch(() => { }) }, [])
  const statCardData = {
    "Total Interns": [{ v: 80 }, { v: 120 }, { v: 150 }, { v: 180 }, { v: 220 }, { v: data?.totalInterns || 250 }],
    "Active Internships": [{ v: 20 }, { v: 35 }, { v: 42 }, { v: 50 }, { v: 55 }, { v: data?.activeInternships || 62 }],
    "Departments": [{ v: 4 }, { v: 5 }, { v: 6 }, { v: 6 }, { v: 7 }, { v: data?.departments || 8 }],
    "Organizations": [{ v: 10 }, { v: 14 }, { v: 18 }, { v: 20 }, { v: 22 }, { v: data?.organizations || 24 }],
  }
  const deptData = [{ name: "CSE", v: 350, c: "#6366F1" }, { name: "IT", v: 198, c: "#06B6D4" }, { name: "ECE", v: 162, c: "#22c55e" }, { name: "AIML", v: 108, c: "#f59e0b" }, { name: "ME", v: 68, c: "#ec4899" }]
  const statusData = [{ name: "Active", v: 46, c: "#22c55e" }, { name: "Completed", v: 48, c: "#06B6D4" }, { name: "Ongoing", v: 24, c: "#6366F1" }, { name: "Pending", v: 10, c: "#f59e0b" }]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>Welcome back, {user.fullName || "Admin"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        {[{ l: "Departments", v: data?.departments || 24, c: "#6366F1", data: [{ v: 18 }, { v: 20 }, { v: 21 }, { v: 22 }, { v: 24 }] }, { l: "Organizations", v: data?.organizations || 128, c: "#06B6D4", data: [{ v: 80 }, { v: 95 }, { v: 110 }, { v: 120 }, { v: 128 }] }, { l: "Internships", v: data?.internships || 896, c: "#22c55e", data: [{ v: 600 }, { v: 700 }, { v: 780 }, { v: 840 }, { v: 896 }] }, { l: "Active Interns", v: data?.activeInterns || 76, c: "#f59e0b", data: [{ v: 50 }, { v: 58 }, { v: 65 }, { v: 70 }, { v: 76 }] }].map((s, i) => (
          <div key={i} style={{ ...G, padding: "14px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: "120px" }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>{s.l}</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: s.c }}>{s.v}</div>
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "65px", zIndex: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={s.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`instg${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={s.c} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={s.c} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={s.c} strokeWidth={2.5} fill={`url(#instg${i})`} dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Overview</div>
          <div style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.6)", marginBottom: "10px" }}>Interns by Department</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "100px", height: "100px", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={deptData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="v" strokeWidth={0}>{deptData.map((d, i) => <Cell key={i} fill={d.c} />)}</Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>896</div>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>Total</div>
              {deptData.map(d => <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}><div style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: d.c }} /><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)" }}>{d.name}</span></div><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>{d.v}</span></div>)}
            </div>
          </div>
        </div>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.6)", marginBottom: "10px" }}>Internships by Status</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "100px", height: "100px", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="v" strokeWidth={0}>{statusData.map((d, i) => <Cell key={i} fill={d.c} />)}</Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>128</div>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>Total</div>
              {statusData.map(d => <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}><div style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: d.c }} /><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)" }}>{d.name}</span></div><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>{d.v}</span></div>)}
            </div>
          </div>
        </div>
      </div>
      <div style={{ ...G, padding: "14px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "10px" }}>Placement Overview</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
          <InstitutionMetricCard label="Placement Rate" value="78%" trend="+12%" color="#22c55e" gradId="place-rate" unit="%" chartData={[{ day: "Mon", v: 68 }, { day: "Tue", v: 70 }, { day: "Wed", v: 72 }, { day: "Thu", v: 74 }, { day: "Fri", v: 76 }, { day: "Sat", v: 77 }, { day: "Sun", v: 78 }]} />
          <InstitutionMetricCard label="Avg. Performance" value="86%" trend="+8%" color="#6366F1" gradId="place-perf" unit="%" chartData={[{ day: "Mon", v: 78 }, { day: "Tue", v: 80 }, { day: "Wed", v: 82 }, { day: "Thu", v: 83 }, { day: "Fri", v: 85 }, { day: "Sat", v: 85 }, { day: "Sun", v: 86 }]} />
          <InstitutionMetricCard label="Satisfaction Score" value="92%" trend="+5%" color="#06B6D4" gradId="place-sat" unit="%" chartData={[{ day: "Mon", v: 85 }, { day: "Tue", v: 87 }, { day: "Wed", v: 88 }, { day: "Thu", v: 90 }, { day: "Fri", v: 91 }, { day: "Sat", v: 91 }, { day: "Sun", v: 92 }]} />
          <InstitutionMetricCard label="Top Recruiters" value="42" trend="+18%" color="#f59e0b" gradId="place-rec" chartData={[{ day: "Mon", v: 28 }, { day: "Tue", v: 32 }, { day: "Wed", v: 35 }, { day: "Thu", v: 38 }, { day: "Fri", v: 40 }, { day: "Sat", v: 41 }, { day: "Sun", v: 42 }]} />
        </div>
      </div>
    </div>
  )
}

// ── 2. ORGANIZATIONS ──────────────────────────────────────────────────────────
function Organizations() {
  const [orgs, setOrgs] = useState([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: "", domain: "", contact: "", email: "", interns: 0, status: "Active" })
  const load = () => fetch(`${BASE}/institution/organizations`).then(r => r.json()).then(d => { if (Array.isArray(d)) setOrgs(d) }).catch(() => { })
  useEffect(() => { load() }, [])
  const filtered = orgs.filter(o => (o.name || "").toLowerCase().includes(search.toLowerCase()) && (filter === "All" || o.status === filter))
  const add = async () => {
    if (!form.name) return
    await fetch(`${BASE}/institution/organizations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => { })
    setOrgs(p => [...p, { ...form, _id: Date.now().toString() }]); setShowAdd(false); setForm({ name: "", domain: "", contact: "", email: "", interns: 0, status: "Active" })
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>Manage and monitor all partner organizations.</div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", fontSize: "11px", cursor: "pointer" }}>
          <Plus size={11} /> Add Organization
        </button>
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={11} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organizations…" style={{ ...inp, paddingLeft: "28px" }} />
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {["All", "Active", "Pending", "Inactive"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "11px", border: "none", cursor: "pointer", background: filter === f ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "rgba(255,255,255,0.06)", color: filter === f ? "white" : "rgba(255,255,255,0.5)" }}>{f} {f === "All" ? `(${orgs.length})` : f === "Active" ? `(${orgs.filter(o => o.status === "Active").length})` : f === "Pending" ? `(${orgs.filter(o => o.status === "Pending").length})` : `(${orgs.filter(o => o.status === "Inactive").length})`}</button>
          ))}
        </div>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Organization", "Domain", "Contact Person", "Interns", "Status", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((o, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 500, color: "white" }}>{o.name}</td>
                <td style={{ padding: "10px 14px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{o.domain}</td>
                <td style={{ padding: "10px 14px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{o.contact}</td>
                <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 600, color: "white" }}>{o.interns}</td>
                <td style={{ padding: "10px 14px" }}><span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", color: STA_C[o.status]?.c || "#fff", background: STA_C[o.status]?.bg || "rgba(255,255,255,0.1)" }}>{o.status}</span></td>
                <td style={{ padding: "10px 14px" }}>
                  <button onClick={async () => { await fetch(`${BASE}/institution/organizations/${o._id}`, { method: "DELETE" }).catch(() => { }); setOrgs(p => p.filter(x => x._id !== o._id)) }} style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", border: "none", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing 1 to {filtered.length} of {orgs.length}</div>
      </div>
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Add Organization</span>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            {[{ l: "Organization Name", k: "name" }, { l: "Domain", k: "domain" }, { l: "Contact Person", k: "contact" }, { l: "Email", k: "email" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
              <button onClick={add} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 3. INTERNSHIPS ────────────────────────────────────────────────────────────
function Internships() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState("All")
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: "", organization: "", domain: "", startDate: "", endDate: "", interns: 0, status: "Active" })
  const load = () => fetch(`${BASE}/institution/internships`).then(r => r.json()).then(d => { if (Array.isArray(d)) setItems(d) }).catch(() => { })
  useEffect(() => { load() }, [])
  const filtered = items.filter(i => filter === "All" || i.status === filter)
  const add = async () => {
    if (!form.title) return
    await fetch(`${BASE}/institution/internships`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => { })
    setItems(p => [...p, { ...form, _id: Date.now().toString() }]); setShowAdd(false)
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>View and manage all internship programs.</div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", fontSize: "11px", cursor: "pointer" }}>
          <Plus size={11} /> Create Internship
        </button>
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {["All", "Active", "Upcoming", "Completed", "Cancelled"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 12px", borderRadius: "8px", fontSize: "11px", border: "none", cursor: "pointer", background: filter === f ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "rgba(255,255,255,0.06)", color: filter === f ? "white" : "rgba(255,255,255,0.5)" }}>{f} ({f === "All" ? items.length : items.filter(i => i.status === f).length})</button>
        ))}
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Internship Title", "Organization", "Domain", "Start Date", "End Date", "Interns", "Status", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "9px 12px", fontSize: "12px", fontWeight: 500, color: "white" }}>{item.title}</td>
                <td style={{ padding: "9px 12px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{item.organization}</td>
                <td style={{ padding: "9px 12px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{item.domain}</td>
                <td style={{ padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{item.startDate}</td>
                <td style={{ padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{item.endDate}</td>
                <td style={{ padding: "9px 12px", fontSize: "12px", fontWeight: 600, color: "white" }}>{item.interns}</td>
                <td style={{ padding: "9px 12px" }}><span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", color: STA_C[item.status]?.c || "#fff", background: STA_C[item.status]?.bg || "rgba(255,255,255,0.1)" }}>{item.status}</span></td>
                <td style={{ padding: "9px 12px" }}>
                  <button onClick={async () => { await fetch(`${BASE}/institution/internships/${item._id}`, { method: "DELETE" }).catch(() => { }); setItems(p => p.filter(x => x._id !== item._id)) }} style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", border: "none", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing 1 to {filtered.length} of {items.length}</div>
      </div>
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "420px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Create Internship</span>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            {[{ l: "Title", k: "title" }, { l: "Organization", k: "organization" }, { l: "Domain", k: "domain" }, { l: "Start Date", k: "startDate" }, { l: "End Date", k: "endDate" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
              <button onClick={add} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 4. DEPARTMENTS ────────────────────────────────────────────────────────────
function Departments() {
  const [depts, setDepts] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: "", hod: "", totalInterns: 0, activeInternships: 0 })
  const load = () => fetch(`${BASE}/institution/departments`).then(r => r.json()).then(d => { if (Array.isArray(d)) setDepts(d) }).catch(() => { })
  useEffect(() => { load() }, [])
  const add = async () => {
    if (!form.name) return
    await fetch(`${BASE}/institution/departments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => { })
    setDepts(p => [...p, { ...form, _id: Date.now().toString() }]); setShowAdd(false)
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>Manage all departments.</div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", fontSize: "11px", cursor: "pointer" }}>
          <Plus size={11} /> Add Department
        </button>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Department", "HOD / Coordinator", "Total Interns", "Active Internships", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {depts.map((d, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 500, color: "white" }}>{d.name}</td>
                <td style={{ padding: "10px 14px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{d.hod}</td>
                <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 600, color: "white" }}>{d.totalInterns}</td>
                <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 600, color: "#6366F1" }}>{d.activeInternships}</td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(99,102,241,0.2)", border: "none", color: "#818CF8", fontSize: "10px", cursor: "pointer" }}><Edit size={10} /></button>
                    <button onClick={async () => { await fetch(`${BASE}/institution/departments/${d._id}`, { method: "DELETE" }).catch(() => { }); setDepts(p => p.filter(x => x._id !== d._id)) }} style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", border: "none", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}><Trash2 size={10} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing 1 to {depts.length} of {depts.length}</div>
      </div>
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "380px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Add Department</span>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            {[{ l: "Department Name", k: "name" }, { l: "HOD / Coordinator", k: "hod" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
              <button onClick={add} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 5. INTERNS ────────────────────────────────────────────────────────────────
function Interns() {
  const [interns, setInterns] = useState([])
  const [search, setSearch] = useState("")
  useEffect(() => { fetch(`${BASE}/institution/interns`).then(r => r.json()).then(d => { if (Array.isArray(d)) setInterns(d) }).catch(() => { }) }, [])
  const filtered = interns.filter(i => (i.name || "").toLowerCase().includes(search.toLowerCase()))
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>All registered interns across programs.</div>
        <div style={{ position: "relative" }}>
          <Search size={11} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search interns…" style={{ ...inp, paddingLeft: "28px", width: "200px" }} />
        </div>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Name", "Email", "Department", "Internship", "Organization", "Progress", "Status"].map(h => <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((intern, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "9px 12px", fontSize: "12px", fontWeight: 500, color: "white" }}>{intern.name}</td>
                <td style={{ padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{intern.email}</td>
                <td style={{ padding: "9px 12px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{intern.dept || "CSE"}</td>
                <td style={{ padding: "9px 12px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{intern.internship || "Web Development"}</td>
                <td style={{ padding: "9px 12px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{intern.organization || "TechNova"}</td>
                <td style={{ padding: "9px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "50px", height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${intern.progress || 50}%`, height: "100%", background: "#6366F1", borderRadius: "2px" }} />
                    </div>
                    <span style={{ fontSize: "10px", color: "white" }}>{intern.progress || 50}%</span>
                  </div>
                </td>
                <td style={{ padding: "9px 12px" }}><span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", color: STA_C[intern.status || "Active"]?.c || "#fff", background: STA_C[intern.status || "Active"]?.bg || "rgba(255,255,255,0.1)" }}>{intern.status || "Active"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing {filtered.length} interns</div>
      </div>
    </div>
  )
}

// ── 5. REPORTS & ANALYTICS ────────────────────────────────────────────────────
function ReportsAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  useEffect(() => { fetch(`${BASE}/institution/score-analytics`).then(r => r.json()).then(d => setAnalytics(d)).catch(() => { }) }, [])
  const trendData = [{ d: "Jan", v: 60 }, { d: "Feb", v: 65 }, { d: "Mar", v: 70 }, { d: "Apr", v: 72 }, { d: "May", v: 78 }, { d: "Jun", v: 82 }]
  const deptData = [{ name: "CSE", v: 350, c: "#6366F1" }, { name: "IT", v: 198, c: "#06B6D4" }, { name: "ECE", v: 162, c: "#22c55e" }, { name: "AIML", v: 108, c: "#f59e0b" }, { name: "ME", v: 68, c: "#ec4899" }, { name: "Others", v: 10, c: "#a855f7" }]
  const statusBar = [{ name: "Active", v: 532, c: "#22c55e" }, { name: "Upcoming", v: 224, c: "#6366F1" }, { name: "Completed", v: 88, c: "#06B6D4" }, { name: "Cancelled", v: 52, c: "#ef4444" }]
  const perfData = [{ name: "Excellent (90-100)", v: 32, c: "#22c55e" }, { name: "Good (80-89)", v: 28, c: "#6366F1" }, { name: "Average (70-79)", v: 20, c: "#06B6D4" }, { name: "Below Avg (<60)", v: 10, c: "#f59e0b" }, { name: "Not Rated", v: 10, c: "#94a3b8" }]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>Detailed insights and analytics across your institution.</div>
        <button style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "11px", cursor: "pointer" }}>
          <Download size={11} /> Export Report ▾
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        {[{ l: "Overall Completion", v: `${analytics?.overallCompletion || 78}%`, c: "#22c55e", Icon: CheckCircle }, { l: "Avg. Performance", v: `${analytics?.avgPerformance || 86}%`, c: "#6366F1", Icon: BarChart3Icon }, { l: "Attendance Rate", v: `${analytics?.attendanceRate || 92}%`, c: "#06B6D4", Icon: CalendarIcon }, { l: "Avg. Evaluation Score", v: `${analytics?.avgEvaluationScore || 4.5}`, c: "#f59e0b", Icon: StarIcon }].map((s, i) => (
          <div key={i} style={{ ...G, padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <IconBadge Icon={s.Icon} color={s.c} size={16} box={36} />
            <div><div style={{ fontSize: "20px", fontWeight: 700, color: s.c }}>{s.v}</div><div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Reports Over Time</div>
          <div style={{ height: "150px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="d" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "10px" }} />
                <Line type="monotone" dataKey="v" stroke="#6366F1" strokeWidth={2} dot={{ fill: "#6366F1", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Reports by Department</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "100px", height: "100px", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={deptData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="v" strokeWidth={0}>{deptData.map((d, i) => <Cell key={i} fill={d.c} />)}</Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>896</div>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>Total</div>
              {deptData.map(d => <div key={d.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}><div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: d.c }} /><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)" }}>{d.name}</span></div><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>{Math.round(d.v / 896 * 100)}%</span></div>)}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Internships by Status</div>
          <div style={{ height: "140px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBar}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "10px" }} />
                <Bar dataKey="v" radius={[4, 4, 0, 0]}>{statusBar.map((d, i) => <Cell key={i} fill={d.c} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Performance Distribution</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "100px", height: "100px", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={perfData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="v" strokeWidth={0}>{perfData.map((d, i) => <Cell key={i} fill={d.c} />)}</Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>896</div>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Total</div>
              {perfData.map(d => <div key={d.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}><div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: d.c }} /><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)" }}>{d.name}</span></div><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>{d.v}%</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 6. COMPLETION STATUS ──────────────────────────────────────────────────────
function CompletionStatus() {
  const [items, setItems] = useState(DEMO_COMPLETION)
  const [detail, setDetail] = useState(null)
  useEffect(() => {
    fetch(`${BASE}/institution/completion-status`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) setItems(d) })
      .catch(() => { })
  }, [])

  const totals = items.reduce((a, it) => ({
    completed: a.completed + (it.completed || 0),
    inProgress: a.inProgress + (it.inProgress || 0),
    overdue: a.overdue + (it.overdue || 0),
  }), { completed: 0, inProgress: 0, overdue: 0 })
  const overallPct = items.length
    ? Math.round(items.reduce((s, it) => s + (it.completionPct || 0), 0) / items.length)
    : 78

  const detailChart = detail ? [
    { day: "W1", v: Math.max(0, (detail.completionPct || 0) - 18) },
    { day: "W2", v: Math.max(0, (detail.completionPct || 0) - 12) },
    { day: "W3", v: Math.max(0, (detail.completionPct || 0) - 6) },
    { day: "W4", v: detail.completionPct || 0 },
  ] : []

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>Track internship completion across programs.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        <InstitutionMetricCard label="Overall Completion" value={`${overallPct}%`} trend="+12%" color="#22c55e" gradId="comp-overall" unit="%" chartData={[{ day: "Mon", v: 62 }, { day: "Tue", v: 66 }, { day: "Wed", v: 70 }, { day: "Thu", v: 73 }, { day: "Fri", v: 76 }, { day: "Sat", v: 77 }, { day: "Sun", v: overallPct }]} />
        <InstitutionMetricCard label="Completed" value={String(totals.completed)} trend="+18%" color="#6366F1" gradId="comp-done" chartData={[{ day: "Mon", v: 18 }, { day: "Tue", v: 22 }, { day: "Wed", v: 26 }, { day: "Thu", v: 28 }, { day: "Fri", v: 30 }, { day: "Sat", v: 31 }, { day: "Sun", v: totals.completed || 32 }]} />
        <InstitutionMetricCard label="In Progress" value={String(totals.inProgress)} trend="+8%" color="#06B6D4" gradId="comp-prog" chartData={[{ day: "Mon", v: 48 }, { day: "Tue", v: 52 }, { day: "Wed", v: 56 }, { day: "Thu", v: 58 }, { day: "Fri", v: 60 }, { day: "Sat", v: 62 }, { day: "Sun", v: totals.inProgress || 64 }]} />
        <InstitutionMetricCard label="Overdue" value={String(totals.overdue)} trend="-5%" color="#ef4444" gradId="comp-late" chartData={[{ day: "Mon", v: 12 }, { day: "Tue", v: 11 }, { day: "Wed", v: 10 }, { day: "Thu", v: 9 }, { day: "Fri", v: 9 }, { day: "Sat", v: 8 }, { day: "Sun", v: totals.overdue || 8 }]} />
      </div>
      <div style={{ ...G, overflow: "hidden", position: "relative", minHeight: "320px" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.12, pointerEvents: "none", zIndex: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[{ day: "Mon", v: 40 }, { day: "Tue", v: 55 }, { day: "Wed", v: 48 }, { day: "Thu", v: 70 }, { day: "Fri", v: 62 }, { day: "Sat", v: 78 }, { day: "Sun", v: 85 }]} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="comp-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#6366F1" strokeWidth={2} fill="url(#comp-bg)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(11,17,32,0.75)" }}>
              {["Internship", "Completed", "In Progress", "Overdue", "Completion %", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(11,17,32,0.55)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(11,17,32,0.55)"}>
                  <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 500, color: "white" }}>{item.internship}</td>
                  <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 600, color: "#22c55e" }}>{item.completed}</td>
                  <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 600, color: "#06B6D4" }}>{item.inProgress}</td>
                  <td style={{ padding: "10px 14px", fontSize: "12px", fontWeight: 600, color: item.overdue > 0 ? "#ef4444" : "rgba(255,255,255,0.4)" }}>{item.overdue}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "80px", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${item.completionPct}%`, height: "100%", background: item.completionPct >= 70 ? "#22c55e" : item.completionPct >= 40 ? "#f59e0b" : "#ef4444", borderRadius: "3px" }} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: item.completionPct >= 70 ? "#22c55e" : item.completionPct >= 40 ? "#f59e0b" : "#ef4444" }}>{item.completionPct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => setDetail(item)} style={{ padding: "4px 10px", borderRadius: "6px", background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.35)", color: "#a5b4fc", fontSize: "10px", cursor: "pointer", fontWeight: 600 }}>Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={() => setDetail(null)}>
          <div style={{ ...G, width: "100%", maxWidth: "520px", padding: "18px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>{detail.internship}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>{detail.department || "—"} · {detail.organization || "—"}</div>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "white" }}><X size={14} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "8px", marginBottom: "12px" }}>
              {[
                ["Completion", `${detail.completionPct}%`, "#22c55e"],
                ["Completed", String(detail.completed), "#6366F1"],
                ["In Progress", String(detail.inProgress), "#06B6D4"],
                ["Overdue", String(detail.overdue), "#ef4444"],
                ["Placed", String(detail.placed || "—"), "#f59e0b"],
                ["Avg. Score", `${detail.avgScore || "—"}%`, "#8B5CF6"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)" }}>{l}</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Completion trend</div>
            <div style={{ height: "100px", marginBottom: "12px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={detailChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="detail-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} axisLine={false} unit="%" />
                  <Area type="monotone" dataKey="v" stroke="#6366F1" strokeWidth={2} fill="url(#detail-grad)" dot={{ r: 3, fill: "#6366F1" }} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              <div><strong style={{ color: "rgba(255,255,255,0.7)" }}>Mentor:</strong> {detail.mentor || "Not assigned"}</div>
              <div><strong style={{ color: "rgba(255,255,255,0.7)" }}>Duration:</strong> {detail.duration || "—"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 7. DOCUMENTS ──────────────────────────────────────────────────────────────
function Documents() {
  const [docs, setDocs] = useState([])
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: "", category: "Guidelines", type: "PDF" })
  const fileRef = useRef(null)
  const load = () => fetch(`${BASE}/institution/reports`).then(r => r.json()).then(d => { if (Array.isArray(d)) setDocs(d) }).catch(() => { })
  useEffect(() => { load() }, [])
  const filtered = docs.filter(d => (d.name || "").toLowerCase().includes(search.toLowerCase()))
  const download = (name) => { const blob = new Blob([`Document: ${name}`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url) }
  const add = async () => {
    if (!form.name) return
    await fetch(`${BASE}/institution/reports`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => { })
    setDocs(p => [...p, { ...form, _id: Date.now().toString(), uploadedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) }]); setShowAdd(false)
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>Manage institution documents and templates.</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) { setForm(p => ({ ...p, name: e.target.files[0].name })); setShowAdd(true) } }} />
          <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", fontSize: "11px", cursor: "pointer" }}>
            <Upload size={11} /> Upload Document
          </button>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={11} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…" style={{ ...inp, paddingLeft: "28px" }} />
        </div>
        <select style={{ ...inp, width: "140px" }}>
          {["All Categories", "Templates", "Guidelines", "Forms", "Formats", "Policies"].map(c => <option key={c} style={{ background: "#0B1120" }}>{c}</option>)}
        </select>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Document Name", "Category", "Type", "Uploaded On", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "9px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((doc, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "9px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={11} color="#818CF8" /></div>
                    <span style={{ fontSize: "11px", color: "white" }}>{doc.name}</span>
                  </div>
                </td>
                <td style={{ padding: "9px 14px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{doc.category}</td>
                <td style={{ padding: "9px 14px" }}><span style={{ padding: "2px 7px", borderRadius: "4px", fontSize: "10px", color: "#06B6D4", background: "rgba(6,182,212,0.15)" }}>{doc.type}</span></td>
                <td style={{ padding: "9px 14px", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{doc.uploadedOn}</td>
                <td style={{ padding: "9px 14px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button onClick={() => download(doc.name)} style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(6,182,212,0.15)", border: "none", color: "#06B6D4", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}><Download size={9} /></button>
                    <button style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(99,102,241,0.2)", border: "none", color: "#818CF8", fontSize: "10px", cursor: "pointer" }}><Edit size={9} /></button>
                    <button onClick={async () => { await fetch(`${BASE}/institution/reports/${doc._id}`, { method: "DELETE" }).catch(() => { }); setDocs(p => p.filter(x => x._id !== doc._id)) }} style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", border: "none", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}><Trash2 size={9} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing 1 to {filtered.length} of {docs.length}</div>
      </div>
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "380px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Add Document</span>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            {[{ l: "Document Name", k: "name" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inp}>
                {["Templates", "Guidelines", "Forms", "Formats", "Policies"].map(c => <option key={c} style={{ background: "#0B1120" }}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
              <button onClick={add} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 8. CALENDAR ───────────────────────────────────────────────────────────────
function InstCalendar() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [view, setView] = useState("Month")
  const [events, setEvents] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: "", date: "", time: "", type: "Meeting", color: "#6366F1" })
  const load = () => fetch(`${BASE}/institution/calendar`).then(r => r.json()).then(d => { if (Array.isArray(d)) setEvents(d) }).catch(() => { })
  useEffect(() => { load() }, [])
  const days = new Date(year, month + 1, 0).getDate()
  const startDay = new Date(year, month, 1).getDay()
  const cells = [...Array(startDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const getEvs = (d) => events.filter(e => { const ed = new Date(e.date); return ed.getDate() === d && ed.getMonth() === month && ed.getFullYear() === year })
  const addEvent = async () => {
    if (!form.title || !form.date) return
    await fetch(`${BASE}/institution/calendar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => { })
    setEvents(p => [...p, { ...form, _id: Date.now().toString() }]); setShowAdd(false)
  }
  const upcoming = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5)
  return (
    <div style={{ display: "flex", gap: "12px", height: "calc(100vh - 120px)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }} style={{ width: "26px", height: "26px", borderRadius: "7px", background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={13} /></button>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "white", minWidth: "130px", textAlign: "center" }}>{MONTHS[month]} {year}</span>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }} style={{ width: "26px", height: "26px", borderRadius: "7px", background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={13} /></button>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {["Month", "Week", "Day"].map(v => <button key={v} onClick={() => setView(v)} style={{ padding: "5px 12px", borderRadius: "8px", fontSize: "11px", border: "none", cursor: "pointer", background: view === v ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "rgba(255,255,255,0.06)", color: view === v ? "white" : "rgba(255,255,255,0.5)" }}>{v}</button>)}
            <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "8px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", fontSize: "11px", cursor: "pointer" }}><Plus size={11} /> Add Event</button>
          </div>
        </div>
        <div style={{ ...G, padding: "12px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", marginBottom: "4px" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.4)", padding: "4px" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px" }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} style={{ height: "70px" }} />
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
              const dayEvs = getEvs(day)
              return (
                <div key={i} style={{ height: "70px", borderRadius: "6px", background: isToday ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.02)", border: isToday ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.04)", padding: "4px", overflow: "hidden" }}>
                  <div style={{ fontSize: "11px", color: isToday ? "#818CF8" : "rgba(255,255,255,0.7)", fontWeight: isToday ? 700 : 400, marginBottom: "2px" }}>{day}</div>
                  {dayEvs.slice(0, 2).map((ev, j) => (
                    <div key={j} style={{ fontSize: "8px", color: "white", background: (ev.color || "#6366F1") + "cc", borderRadius: "3px", padding: "1px 4px", marginBottom: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
        <button style={{ alignSelf: "center", padding: "8px 20px", borderRadius: "9px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818CF8", fontSize: "11px", cursor: "pointer" }}>View Full Calendar</button>
      </div>
      <div style={{ width: "220px", minWidth: "220px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "white" }}>Upcoming Events</div>
        {upcoming.map((ev, i) => (
          <div key={i} style={{ ...G, padding: "10px", borderLeft: `3px solid ${ev.color || "#6366F1"}` }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "white", marginBottom: "3px" }}>{ev.title}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{ev.time}</div>
          </div>
        ))}
      </div>
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "380px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Add Event</span>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            {[{ l: "Title", k: "title" }, { l: "Date", k: "date", type: "date" }, { l: "Time", k: "time", type: "time" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input type={f.type || "text"} value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
              <button onClick={addEvent} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 9. NOTIFICATIONS ──────────────────────────────────────────────────────────
function Notifications() {
  const [notifs, setNotifs] = useState([])
  const [filter, setFilter] = useState("All")
  const load = () => fetch(`${BASE}/institution/notifications`).then(r => r.json()).then(d => { if (Array.isArray(d)) setNotifs(d) }).catch(() => { })
  useEffect(() => { load() }, [])
  const markAll = async () => { await fetch(`${BASE}/institution/notifications/read-all`, { method: "PATCH" }).catch(() => { }); setNotifs(p => p.map(n => ({ ...n, read: true }))) }
  const filtered = notifs.filter(n => filter === "All" || (filter === "Unread" && !n.read) || (filter === "Announcements" && n.type === "announcement") || (filter === "System" && n.type === "system"))
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>All important notifications and announcements.</div>
        <button onClick={markAll} style={{ padding: "6px 14px", borderRadius: "8px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818CF8", fontSize: "11px", cursor: "pointer" }}>Mark all as read</button>
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {["All", "Unread", "Announcements", "System"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 12px", borderRadius: "8px", fontSize: "11px", border: "none", cursor: "pointer", background: filter === f ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "rgba(255,255,255,0.06)", color: filter === f ? "white" : "rgba(255,255,255,0.5)" }}>
            {f} {f === "Unread" ? `(${notifs.filter(n => !n.read).length})` : ""}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {filtered.map((n, i) => (
          <div key={i} style={{ ...G, padding: "12px", display: "flex", alignItems: "flex-start", gap: "12px", opacity: n.read ? 0.7 : 1, borderLeft: `3px solid ${n.color || "#6366F1"}` }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: (n.color || "#6366F1") + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IconBadge Icon={NOTIF_TYPE_ICONS[n.type] || BellIcon} color={n.color || "#6366F1"} size={14} box={32} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: "12px", fontWeight: 500, color: "white" }}>{n.title}</div>
                {!n.read && <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "999px", background: "#6366F1", color: "white", flexShrink: 0 }}>New</span>}
              </div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing 1 to {filtered.length} of {notifs.length}</div>
    </div>
  )
}

// ── 10. SETTINGS ──────────────────────────────────────────────────────────────
function InstSettings() {
  const [tab, setTab] = useState("General Settings")
  const [settings, setSettings] = useState({ institutionName: "Abcit Institute of Technology", address: "123 Education Street, Bangalore, Karnataka, India", email: "info@abcit.edu.in", phone: "+91 98765 43210", website: "www.abcit.edu.in", timezone: "(GMT+05:30) Asia/Kolkata", dateFormat: "DD MMM YYYY", currency: "INR", theme: "dark", primaryColor: "#6366F1" })
  const [saved, setSaved] = useState(false)
  useEffect(() => { fetch(`${BASE}/institution/settings`).then(r => r.json()).then(d => { if (d.institutionName) setSettings(d) }).catch(() => { }) }, [])
  const save = async () => {
    await fetch(`${BASE}/institution/settings`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) }).catch(() => { })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  const TABS = ["General Settings", "Notification Settings", "User Management", "Role Management", "Security Settings", "Academic Settings", "Integrations", "Backup & Restore"]
  return (
    <div style={{ display: "flex", gap: "12px", height: "calc(100vh - 120px)" }}>
      <div style={{ width: "180px", minWidth: "180px", ...G, padding: "10px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "8px", background: tab === t ? "rgba(99,102,241,0.2)" : "transparent", border: tab === t ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent", color: tab === t ? "white" : "rgba(255,255,255,0.55)", fontSize: "11px", cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>
      {tab === "General Settings" && (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ ...G, padding: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "white", marginBottom: "14px" }}>General Settings</div>
            {[{ l: "Institution Name", k: "institutionName" }, { l: "Address", k: "address" }, { l: "Email", k: "email" }, { l: "Phone", k: "phone" }, { l: "Website", k: "website" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input value={settings[f.k] || ""} onChange={e => setSettings(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Timezone</label>
              <select value={settings.timezone} onChange={e => setSettings(p => ({ ...p, timezone: e.target.value }))} style={inp}>
                <option style={{ background: "#0B1120" }}>(GMT+05:30) Asia/Kolkata</option>
                <option style={{ background: "#0B1120" }}>(GMT+00:00) UTC</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Date Format</label>
                <select value={settings.dateFormat} onChange={e => setSettings(p => ({ ...p, dateFormat: e.target.value }))} style={inp}>
                  {["DD MMM YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map(f => <option key={f} style={{ background: "#0B1120" }}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Currency</label>
                <select value={settings.currency} onChange={e => setSettings(p => ({ ...p, currency: e.target.value }))} style={inp}>
                  {["INR (₹)", "USD ($)", "EUR (€)"].map(c => <option key={c} style={{ background: "#0B1120" }}>{c}</option>)}
                </select>
              </div>
            </div>
            <button onClick={save} style={{ padding: "9px 20px", borderRadius: "10px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
          <div style={{ ...G, padding: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "white", marginBottom: "14px" }}>Logo</div>
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "rgba(99,102,241,0.15)", border: "2px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Building2 size={40} color="#818CF8" /></div>
            <button style={{ width: "100%", padding: "8px", borderRadius: "9px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818CF8", fontSize: "11px", cursor: "pointer", marginBottom: "14px" }}>Change Logo</button>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "10px" }}>Theme</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
              {["#6366F1", "#06B6D4", "#22c55e", "#f59e0b"].map(c => (
                <button key={c} onClick={() => setSettings(p => ({ ...p, primaryColor: c }))} style={{ width: "28px", height: "28px", borderRadius: "50%", background: c, border: settings.primaryColor === c ? "3px solid white" : "3px solid transparent", cursor: "pointer" }} />
              ))}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginBottom: "6px" }}>Primary Color</div>
            <input value={settings.primaryColor} onChange={e => setSettings(p => ({ ...p, primaryColor: e.target.value }))} style={{ ...inp, fontFamily: "monospace" }} />
          </div>
        </div>
      )}
      {tab !== "General Settings" && (
        <div style={{ flex: 1, ...G, padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>{tab} — Coming soon</div>
      )}
    </div>
  )
}

// ── 11. PROFILE ───────────────────────────────────────────────────────────────
function Profile() {
  const [tab, setTab] = useState("Profile Information")
  const [form, setForm] = useState({ fullName: "Admin User", employeeId: "ADM001", email: "admin@abcit.edu.in", dept: "Administration", role: "Institution Administrator", phone: "+91 98765 43210", dateJoined: "Jun 18, 2025 10:30 AM", lastLogin: "May 28, 2025 11:30 AM" })
  const [prefs, setPrefs] = useState({ language: "English", dateFormat: "DD MM YYYY", timeFormat: "12-Hour (AM/PM)", itemsPerPage: "10" })
  const [saved, setSaved] = useState(false)
  const [cur, setCur] = useState(""); const [nw, setNw] = useState(""); const [conf, setConf] = useState(""); const [pwMsg, setPwMsg] = useState("")
  useEffect(() => {
    const u = getUser()
    if (u.fullName) setForm(p => ({ ...p, fullName: u.fullName, email: u.email || p.email }))
    fetch(`${BASE}/institution/profile?userId=${u.id || ""}`).then(r => r.json()).then(d => { if (d.fullName) setForm(p => ({ ...p, ...d })) }).catch(() => { })
  }, [])
  const save = async () => {
    const u = getUser()
    if (u.id) await fetch(`${BASE}/auth/profile/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: form.fullName, phone: form.phone }) }).catch(() => { })
    const updated = { ...u, fullName: form.fullName }; localStorage.setItem("user", JSON.stringify(updated))
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  const changePw = async () => {
    if (!cur || !nw || nw !== conf) { setPwMsg("Check fields"); return }
    const u = getUser()
    const res = await fetch(`${BASE}/auth/change-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id, currentPassword: cur, newPassword: nw }) }).catch(() => ({ ok: false }))
    setPwMsg(res.ok ? "Password changed!" : "Failed — check current password")
    if (res.ok) { setCur(""); setNw(""); setConf("") }
  }
  const TABS = ["Profile Information", "Change Password", "Account Preferences", "Sessions", "Security"]
  return (
    <div style={{ display: "flex", gap: "12px", height: "calc(100vh - 120px)" }}>
      <div style={{ width: "180px", minWidth: "180px", ...G, padding: "10px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "8px", background: tab === t ? "rgba(99,102,241,0.2)" : "transparent", border: tab === t ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent", color: tab === t ? "white" : "rgba(255,255,255,0.55)", fontSize: "11px", cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>
      {tab === "Profile Information" && (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ ...G, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: 700, color: "white" }}>
                {(form.fullName || "A").charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>{form.fullName}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{form.role}</div>
                <button style={{ marginTop: "4px", padding: "4px 10px", borderRadius: "7px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", color: "#818CF8", fontSize: "10px", cursor: "pointer" }}>Change Photo</button>
              </div>
            </div>
            {[{ l: "Full Name", k: "fullName" }, { l: "Email", k: "email" }, { l: "Phone", k: "phone" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input value={form[f.k] || ""} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} disabled={f.k === "email"} />
              </div>
            ))}
            <button onClick={save} style={{ padding: "9px 20px", borderRadius: "10px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
              {saved ? "Saved!" : "Update Profile"}
            </button>
          </div>
          <div style={{ ...G, padding: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "white", marginBottom: "14px" }}>Details</div>
            {[["Employee ID", form.employeeId], ["Department", form.dept], ["Role", form.role], ["Date Joined", form.dateJoined], ["Last Login", form.lastLogin]].map(([l, v]) => (
              <div key={l} style={{ marginBottom: "10px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px 12px" }}>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>{l}</div>
                <div style={{ fontSize: "11px", color: "white" }}>{v || "—"}</div>
              </div>
            ))}
            <div style={{ fontSize: "12px", fontWeight: 600, color: "white", marginTop: "10px", marginBottom: "8px" }}>Preferences</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[{ l: "Language", k: "language", opts: ["English", "Hindi", "Tamil"] }, { l: "Date Format", k: "dateFormat", opts: ["DD MM YYYY", "MM/DD/YYYY"] }, { l: "Time Format", k: "timeFormat", opts: ["12-Hour (AM/PM)", "24-Hour"] }, { l: "Items Per Page", k: "itemsPerPage", opts: ["10", "25", "50"] }].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "3px" }}>{f.l}</label>
                  <select value={prefs[f.k]} onChange={e => setPrefs(p => ({ ...p, [f.k]: e.target.value }))} style={{ ...inp, fontSize: "11px" }}>
                    {f.opts.map(o => <option key={o} style={{ background: "#0B1120" }}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab === "Change Password" && (
        <div style={{ flex: 1, ...G, padding: "16px", maxWidth: "400px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "white", marginBottom: "14px" }}>Change Password</div>
          {[{ l: "Current Password", v: cur, set: setCur }, { l: "New Password", v: nw, set: setNw }, { l: "Confirm Password", v: conf, set: setConf }].map(f => (
            <div key={f.l} style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
              <input type="password" value={f.v} onChange={e => f.set(e.target.value)} style={inp} />
            </div>
          ))}
          {pwMsg && <div style={{ fontSize: "11px", color: pwMsg.includes("changed") ? "#22c55e" : "#ef4444", marginBottom: "8px" }}>{pwMsg}</div>}
          <button onClick={changePw} style={{ padding: "9px 20px", borderRadius: "10px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Update Password</button>
        </div>
      )}
      {!["Profile Information", "Change Password"].includes(tab) && (
        <div style={{ flex: 1, ...G, padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>{tab} — Coming soon</div>
      )}
    </div>
  )
}

// ── 12. USER MANAGEMENT ───────────────────────────────────────────────────────
function UserManagement() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", role: "Department User", dept: "", status: "Active" })
  const load = () => fetch(`${BASE}/institution/users`).then(r => r.json()).then(d => { if (Array.isArray(d)) setUsers(d) }).catch(() => { })
  useEffect(() => { load() }, [])
  const filtered = users.filter(u => (u.name || "").toLowerCase().includes(search.toLowerCase()))
  const add = async () => {
    if (!form.name || !form.email) return
    await fetch(`${BASE}/institution/users`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => { })
    setUsers(p => [...p, { ...form, _id: Date.now().toString() }]); setShowAdd(false)
  }
  const ROLE_C = { Administrator: { c: "#6366F1", bg: "rgba(99,102,241,0.15)" }, "Department User": { c: "#06B6D4", bg: "rgba(6,182,212,0.15)" }, "Other User": { c: "#f59e0b", bg: "rgba(245,158,11,0.15)" } }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>Manage portal users and their access.</div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", fontSize: "11px", cursor: "pointer" }}>
          <Plus size={11} /> Add User
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        {[{ l: "Total Users", v: "56", c: "#6366F1", Icon: UsersIcon }, { l: "Administrators", v: "12", c: "#22c55e", Icon: Shield }, { l: "Department Users", v: "24", c: "#06B6D4", Icon: UserIcon }, { l: "Other Users", v: "20", c: "#f59e0b", Icon: UserIcon }].map((s, i) => (
          <div key={i} style={{ ...G, padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <IconBadge Icon={s.Icon} color={s.c} size={16} box={36} />
            <div><div style={{ fontSize: "20px", fontWeight: 700, color: s.c }}>{s.v}</div><div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={11} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ ...inp, paddingLeft: "28px" }} />
        </div>
        <select style={{ ...inp, width: "130px" }}><option style={{ background: "#0B1120" }}>All Roles</option></select>
        <select style={{ ...inp, width: "120px" }}><option style={{ background: "#0B1120" }}>All Status</option></select>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["User Name", "Email", "Role", "Department", "Status", "Last Login", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "9px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#818CF8" }}>{(u.name || "?").charAt(0)}</div>
                    <span style={{ fontSize: "11px", fontWeight: 500, color: "white" }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{u.email}</td>
                <td style={{ padding: "9px 12px" }}><span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", color: ROLE_C[u.role]?.c || "#fff", background: ROLE_C[u.role]?.bg || "rgba(255,255,255,0.1)" }}>{u.role}</span></td>
                <td style={{ padding: "9px 12px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{u.dept}</td>
                <td style={{ padding: "9px 12px" }}><span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", color: STA_C[u.status]?.c || "#fff", background: STA_C[u.status]?.bg || "rgba(255,255,255,0.1)" }}>{u.status}</span></td>
                <td style={{ padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{u.lastLogin}</td>
                <td style={{ padding: "9px 12px" }}>
                  <button onClick={async () => { await fetch(`${BASE}/institution/users/${u._id}`, { method: "DELETE" }).catch(() => { }); setUsers(p => p.filter(x => x._id !== u._id)) }} style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", border: "none", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing 1 to {filtered.length} of {users.length}</div>
      </div>
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Add User</span>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            {[{ l: "Full Name", k: "name" }, { l: "Email", k: "email" }, { l: "Department", k: "dept" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={inp}>
                {["Administrator", "Department User", "Other User"].map(r => <option key={r} style={{ background: "#0B1120" }}>{r}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
              <button onClick={add} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "none", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Add User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 13. SYSTEM ACTIVITY ───────────────────────────────────────────────────────
function SystemActivity() {
  const [activities, setActivities] = useState([])
  useEffect(() => { fetch(`${BASE}/institution/system-activity`).then(r => r.json()).then(d => { if (Array.isArray(d)) setActivities(d) }).catch(() => { }) }, [])
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>Monitor system logs and activity.</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <select style={{ ...inp, width: "150px" }}><option style={{ background: "#0B1120" }}>All Activities</option></select>
          <select style={{ ...inp, width: "160px" }}><option style={{ background: "#0B1120" }}>May 19 - May 25, 2025</option></select>
        </div>
      </div>
      <div style={{ ...G, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["Activity", "User", "Module", "Date & Time", "IP Address", "Status"].map(h => <th key={h} style={{ textAlign: "left", padding: "9px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {activities.map((a, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "9px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <IconBadge Icon={ACTIVITY_MODULE_ICONS[a.module] || ClipboardList} color="#6366F1" size={12} box={28} />
                    <span style={{ fontSize: "11px", color: "white" }}>{a.activity}</span>
                  </div>
                </td>
                <td style={{ padding: "9px 14px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{a.user}</td>
                <td style={{ padding: "9px 14px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{a.module}</td>
                <td style={{ padding: "9px 14px", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{a.dateTime}</td>
                <td style={{ padding: "9px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{a.ip}</td>
                <td style={{ padding: "9px 14px" }}><span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", color: STA_C[a.status]?.c || "#fff", background: STA_C[a.status]?.bg || "rgba(255,255,255,0.1)" }}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "10px 14px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Showing 1 to {activities.length} of {activities.length} activities</div>
      </div>
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
function InstitutionContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const auth = usePortalAuth(["institution", "admin"], "institution")
  const [active, setActive] = useState(tabParam || "dashboard")
  const [user, setUser] = useState(() => {
    try {
      const u = getUser("institution")
      if (u?.fullName) return u
    } catch { }
    return { fullName: "Administrator" }
  })

  useEffect(() => {
    if (auth.user?.fullName) setUser(auth.user)
  }, [auth.user])

  useEffect(() => {
    const load = () => {
      try {
        const u = getUser("institution")
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

  useEffect(() => {
    if (!tabParam) return
    setActive(tabParam === "completion-status" ? "completion" : tabParam)
  }, [tabParam])

  if (auth.loading || !auth.authorized) {
    return <PortalLoadingSkeleton title="Institution Portal" />
  }

  const TITLES = { dashboard: "Institution Dashboard", organizations: "Organizations", internships: "Internships", departments: "Departments", interns: "Interns", reports: "Reports & Analytics", completion: "Completion Status", documents: "Documents", calendar: "Calendar", notifications: "Notifications", settings: "Settings", profile: "My Profile", users: "User Management", activity: "System Activity" }
  const SUBS = { dashboard: "Here's what's happening in your institution today.", organizations: "Manage and monitor all partner organizations.", internships: "View and manage all internship programs.", departments: "Manage all departments.", interns: "All registered interns across programs.", reports: "Detailed insights and analytics across your institution.", completion: "Track internship completion across programs.", documents: "Manage institution documents and templates.", calendar: "Schedule and manage institutional events.", notifications: "All important notifications and announcements.", settings: "Manage system and portal settings.", profile: "View and manage your profile information.", users: "Manage portal users and their access.", activity: "Monitor system logs and activity." }

  const renderContent = () => {
    switch (active) {
      case "dashboard": return <Dashboard setActive={setActive} user={user} />
      case "organizations": return <Organizations />
      case "internships": return <Internships />
      case "departments": return <Departments />
      case "interns": return <Interns />
      case "reports": return <ReportsAnalytics />
      case "completion": return <CompletionStatus />
      case "documents": return <Documents />
      case "calendar": return <InstCalendar />
      case "notifications": return <Notifications />
      case "settings": return <InstSettings />
      case "profile": return <Profile />
      case "users": return <UserManagement />
      case "activity": return <SystemActivity />
      default: return <Dashboard setActive={setActive} user={user} />
    }
  }

  return (
    <div className="portal-root" style={{ width: "100%", height: "100vh", overflow: "hidden", display: "flex", background: "transparent", color: "white" }}>
      <Sidebar active={active} setActive={setActive} />
      <main className="portal-main" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar title={TITLES[active] || "Institution Portal"} subtitle={SUBS[active]} notifCount={3} />
        <div className="portal-content" style={{ flex: 1, overflow: "auto", padding: "24px 28px", minWidth: 0 }}>
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default function InstitutionDashboard() {
  return (
    <Suspense fallback={<PortalLoadingSkeleton title="Institution Portal" />}>
      <InstitutionContent />
    </Suspense>
  )
}
