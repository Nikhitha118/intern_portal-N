"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useRoleGuard, usePortalAuth, PortalLoadingSkeleton, getUser, logout } from "../../../lib/roleGuard"
import {
  KEY_INTERN_TO_MENTOR,
  KEY_MENTOR_TO_INTERN,
  MENTOR_CHANNEL_PRIYA,
  appendChatMessage,
  canonicalInternId,
} from "../../../lib/chatSync"
import {
  saveInternEvaluation,
  updateSubmission,
  gradeLabel,
  DEFAULT_RUBRICS,
  internKeyFromUser,
  getAllSubmissions,
  getPendingSubmissions,
  KEY_INTERN_SUBMISSIONS,
  downloadSubmissionFile,
  isImageSubmission,
} from "../../../lib/evaluationSync"
import {
  mentorCheckIn,
  mentorCheckOut,
  getActiveSession,
  getMentorAttendanceRecords,
  KEY_MENTOR_ATTENDANCE,
} from "../../../lib/mentorAttendanceSync"
import {
  LayoutDashboard, Users, ClipboardList, FileText, Star, UserCheck,
  BookOpen, MessageSquare, Calendar, BarChart3, Settings, LogOut,
  Bell, Search, Plus, X, Download, Upload, Send, ChevronLeft,
  ChevronRight, Eye, Edit, Trash2, CheckCircle2, RefreshCw,
  UserPlus, Megaphone, Clock, PenLine, CheckCircle,
} from "lucide-react"
import { IconBadge, ActionRow } from "../../../lib/iconBadge"
import { ResponsiveContainer, AreaChart, Area, Tooltip, CartesianGrid, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const G = { background: "rgba(17,25,40,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px" }
const inp = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 12px", fontSize: "14px", color: "white", outline: "none", width: "100%" }

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Users, label: "My Interns", id: "interns" },
  { icon: ClipboardList, label: "Tasks", id: "tasks" },
  { icon: FileText, label: "Submissions", id: "submissions" },
  { icon: Star, label: "Evaluations", id: "evaluations" },
  { icon: UserCheck, label: "Attendance", id: "attendance" },
  { icon: BookOpen, label: "Journals", id: "journals" },
  { icon: MessageSquare, label: "Messages", id: "messages" },
  { icon: Calendar, label: "Calendar", id: "calendar" },
  { icon: BarChart3, label: "Analytics", id: "analytics" },
  { icon: Settings, label: "Settings", id: "settings" },
]

const DEMO_INTERNS = [
  { id: "1", name: "Riya Verma", dept: "Frontend", progress: 85, tasks: "6/10", attendance: "90%", status: "Active", score: 88.8, avatar: "R", color: "#7C3AED" },
  { id: "2", name: "Karan Verma", dept: "UI/UX", progress: 72, tasks: "8/10", attendance: "80%", status: "Active", score: 80.2, avatar: "K", color: "#06B6D4" },
  { id: "3", name: "Sneha Patil", dept: "Backend", progress: 90, tasks: "9/10", attendance: "92%", status: "Active", score: 90.1, avatar: "S", color: "#22c55e" },
  { id: "4", name: "Mehul Joshi", dept: "Data", progress: 60, tasks: "6/10", attendance: "75%", status: "On Leave", score: 75.5, avatar: "M", color: "#f59e0b" },
  { id: "5", name: "Rohit Shah", dept: "DevOps", progress: 70, tasks: "4/10", attendance: "70%", status: "Active", score: 70.3, avatar: "R", color: "#ec4899" },
  { id: "6", name: "Arjun Singh", dept: "DevOps", progress: 88, tasks: "7/10", attendance: "88%", status: "Active", score: 88.0, avatar: "A", color: "#a855f7" },
]

const STA_C = { "In Progress": { c: "#06B6D4", bg: "rgba(6,182,212,0.15)" }, Completed: { c: "#22c55e", bg: "rgba(34,197,94,0.15)" }, Pending: { c: "#ef4444", bg: "rgba(239,68,68,0.15)" }, Review: { c: "#f59e0b", bg: "rgba(245,158,11,0.15)" }, Approved: { c: "#22c55e", bg: "rgba(34,197,94,0.15)" }, "Needs Changes": { c: "#f59e0b", bg: "rgba(245,158,11,0.15)" }, Late: { c: "#ef4444", bg: "rgba(239,68,68,0.15)" } }
const PRI_C = { High: { c: "#ef4444" }, Medium: { c: "#f97316" }, Low: { c: "#22c55e" } }
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

// â”€â”€ SIDEBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Sidebar({ active, setActive }) {
  const router = useRouter()
  const [user, setUser] = useState(() => {
    try {
      const u = getUser("mentor")
      if (u?.fullName) return u
    } catch { }
    return { fullName: "Mentor", role: "mentor" }
  })
  useEffect(() => {
    const load = () => {
      try {
        const u = getUser("mentor")
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
            <span style={{ fontSize: "13px", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>MENTOR PORTAL</span>
            <div style={{ fontSize: "10px", color: "#06B6D4", fontWeight: 600 }}>Guidance & Reviews</div>
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
              {(user.fullName || "M").charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={user.fullName || "Mentor"}>
                {user.fullName || "Mentor"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: "10px", color: "#22c55e", fontWeight: 600 }}>Online</span>
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

// ── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ title, subtitle, user, notifCount = 0, attendanceHint = "" }) {
  return (
    <div style={{ height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, background: "#0B1120" }}>
      <div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{subtitle}</div>}
        {attendanceHint && (
          <div style={{ fontSize: "10px", color: "#22c55e", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
            {attendanceHint}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ position: "relative" }}>
          <Search size={12} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
          <input placeholder="Search interns..." style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", padding: "6px 10px 6px 28px", fontSize: "10px", color: "white", outline: "none", width: "180px" }} />
        </div>
        <button style={{ position: "relative", width: "32px", height: "32px", borderRadius: "9px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Bell size={14} color="white" />
          {notifCount > 0 && <span style={{ position: "absolute", top: "4px", right: "4px", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", border: "1.5px solid #0B1120", fontSize: "7px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }} />}
        </button>
      </div>
    </div>
  )
}

// â”€â”€ 1. DASHBOARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Dashboard({ setActive, user }) {
  const [tasks, setTasks] = useState([])
  const trendData = [{ d: "Mon 13", v: 20 }, { d: "Tue 14", v: 28 }, { d: "Wed 15", v: 24 }, { d: "Thu 16", v: 35 }, { d: "Fri 17", v: 30 }, { d: "Sat 18", v: 22 }, { d: "Sun 19", v: 18 }]
  const pieData = [{ name: "Pending", v: 18, c: "#ef4444" }, { name: "In Progress", v: 14, c: "#06B6D4" }, { name: "Review", v: 9, c: "#f59e0b" }, { name: "Completed", v: 8, c: "#22c55e" }]
  useEffect(() => { fetch(`${BASE}/mentor/tasks`).then(r => r.json()).then(d => { if (Array.isArray(d)) setTasks(d) }).catch(() => { }) }, [])
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
        {[{ l: "Total Interns", v: "12", c: "#7C3AED", Icon: Users }, { l: "Assigned Tasks", v: "24", c: "#06B6D4", Icon: ClipboardList }, { l: "Pending Reviews", v: "18", c: "#f59e0b", Icon: Clock }, { l: "Completed Tasks", v: "7", c: "#22c55e", Icon: CheckCircle2 }].map((s, i) => (
          <div key={i} style={{ ...G, padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
            <IconBadge Icon={s.Icon} color={s.c} size={18} box={40} />
            <div><div style={{ fontSize: "24px", fontWeight: 700, color: s.c }}>{s.v}</div><div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div></div>
          </div>
        ))}
      </div>
      {/* Row 2: Interns Overview (left) + Task Status Overview (right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {/* Interns Overview — scrollable to show all 6 */}
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "white" }}>Interns Overview</span>
            <button onClick={() => setActive("interns")} style={{ fontSize: "11px", color: "#7C3AED", background: "none", border: "none", cursor: "pointer" }}>View All</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", maxHeight: "160px", overflowY: "auto" }}>
            {DEMO_INTERNS.map((intern, i) => (
              <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "10px 6px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: intern.color + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: intern.color, margin: "0 auto 6px" }}>{intern.avatar}</div>
                <div style={{ fontSize: "10px", fontWeight: 500, color: "white", marginBottom: "2px" }}>{intern.name.split(" ")[0]}</div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)" }}>{intern.dept}</div>
                <div style={{ marginTop: "4px", height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${intern.progress}%`, height: "100%", background: intern.color, borderRadius: "2px" }} />
                </div>
                <div style={{ fontSize: "9px", color: intern.color, marginTop: "2px" }}>{intern.progress}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Status Overview — beside Interns Overview */}
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "white", marginBottom: "10px" }}>Task Status Overview</div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ width: "110px", height: "110px", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={50} dataKey="v" strokeWidth={0}>{pieData.map((d, i) => <Cell key={i} fill={d.c} />)}</Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.c }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: d.c }}>{d.v} ({Math.round(d.v / 49 * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Submissions Trend — full width below */}
      <div style={{ ...G, padding: "14px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Submissions Trend (This Week)</div>
        <div style={{ height: "160px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.5} /><stop offset="95%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="d" stroke="#94a3b8" fontSize={9} />
              <YAxis stroke="#94a3b8" fontSize={9} />
              <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px" }} />
              <Area type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2} fill="url(#mg)" dot={{ fill: "#7C3AED", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// â”€â”€ 2. MY INTERNS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MyInterns({ setActive }) {
  const [sel, setSel] = useState(DEMO_INTERNS[0])
  const [search, setSearch] = useState("")
  const [showAddIntern, setShowAddIntern] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [newIntern, setNewIntern] = useState({ name: "", dept: "Frontend", email: "" })
  const [announcement, setAnnouncement] = useState("")
  const [announceSent, setAnnounceSent] = useState(false)
  const [interns, setInterns] = useState(DEMO_INTERNS)
  const filtered = interns.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  const exportList = () => {
    const rows = [["Name", "Department", "Progress", "Tasks", "Attendance", "Status"]]
    interns.forEach(i => rows.push([i.name, i.dept, `${i.progress}%`, i.tasks, i.attendance, i.status]))
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "interns_list.csv"; a.click(); URL.revokeObjectURL(url)
  }

  const addIntern = () => {
    if (!newIntern.name.trim()) return
    const colors = ["#7C3AED", "#06B6D4", "#22c55e", "#f59e0b", "#ec4899", "#a855f7"]
    const ni = { id: String(Date.now()), name: newIntern.name, dept: newIntern.dept, progress: 0, tasks: "0/10", attendance: "0%", status: "Active", score: 0, avatar: newIntern.name.charAt(0).toUpperCase(), color: colors[interns.length % colors.length] }
    setInterns(p => [...p, ni]); setShowAddIntern(false); setNewIntern({ name: "", dept: "Frontend", email: "" })
  }

  const sendAnnouncement = () => {
    if (!announcement.trim()) return
    try {
      const existing = JSON.parse(localStorage.getItem("announcements") || "[]")
      localStorage.setItem("announcements", JSON.stringify([{ text: announcement, from: "Mentor", time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), date: new Date().toLocaleDateString() }, ...existing]))
    } catch { }
    setAnnounceSent(true); setTimeout(() => { setAnnounceSent(false); setShowAnnouncement(false); setAnnouncement("") }, 1500)
  }

  return (
    <div style={{ display: "flex", gap: "12px", height: "calc(100vh - 120px)" }}>
      {/* Left table */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
          {[{ l: "All Interns", v: String(interns.length), c: "#7C3AED" }, { l: "Active", v: String(interns.filter(i => i.status === "Active").length), c: "#22c55e" }, { l: "On Leave", v: String(interns.filter(i => i.status === "On Leave").length), c: "#f59e0b" }, { l: "Completed", v: String(interns.filter(i => i.status === "Completed").length), c: "#06B6D4" }].map((s, i) => (
            <div key={i} style={{ ...G, padding: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={11} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search interns..." style={{ ...inp, paddingLeft: "28px", width: "200px" }} />
          </div>
          <button onClick={() => setShowAddIntern(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "10px", cursor: "pointer" }}>
            <Plus size={11} /> Add Intern
          </button>
        </div>
        <div style={{ ...G, overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Intern", "Department", "Progress", "Tasks", "Attendance", "Status"].map(h => <th key={h} style={{ textAlign: "left", padding: "9px 12px", fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((intern, i) => (
                <tr key={i} onClick={() => setSel(intern)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: sel?.id === intern.id ? "rgba(124,58,237,0.1)" : "transparent" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = sel?.id === intern.id ? "rgba(124,58,237,0.1)" : "transparent"}>
                  <td style={{ padding: "9px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: intern.color + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: intern.color }}>{intern.avatar}</div>
                      <span style={{ fontSize: "10px", fontWeight: 500, color: "white" }}>{intern.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "9px 12px", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{intern.dept}</td>
                  <td style={{ padding: "9px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "50px", height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: `${intern.progress}%`, height: "100%", background: intern.color, borderRadius: "2px" }} />
                      </div>
                      <span style={{ fontSize: "11px", color: "white" }}>{intern.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "9px 12px", fontSize: "10px", color: "white" }}>{intern.tasks}</td>
                  <td style={{ padding: "9px 12px", fontSize: "10px", color: "white" }}>{intern.attendance}</td>
                  <td style={{ padding: "9px 12px" }}><span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "11px", color: intern.status === "Active" ? "#22c55e" : intern.status === "On Leave" ? "#f59e0b" : "#06B6D4", background: intern.status === "Active" ? "rgba(34,197,94,0.15)" : intern.status === "On Leave" ? "rgba(245,158,11,0.15)" : "rgba(6,182,212,0.15)" }}>{intern.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right profile panel */}
      {sel && (
        <div style={{ width: "240px", minWidth: "240px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ ...G, padding: "14px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "white", marginBottom: "10px" }}>Intern Profile</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: sel.color + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: sel.color }}>{sel.avatar}</div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "white" }}>{sel.name}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{sel.dept} Intern</div>
              </div>
            </div>
            {[["Email", `${sel.name.toLowerCase().replace(" ", ".")}@intern.com`], ["Phone", "+91 98765 43210"]].map(([l, v]) => (
              <div key={l} style={{ marginBottom: "6px" }}>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{l}</div>
                <div style={{ fontSize: "11px", color: "white" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* QUICK ACTIONS - fully activated */}
          <div style={{ ...G, padding: "14px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <ActionRow Icon={UserPlus} label="Add New Intern" onClick={() => setShowAddIntern(true)} />
              <ActionRow Icon={ClipboardList} label="Export List" onClick={exportList} />
              <ActionRow Icon={Megaphone} label="Send Announcement" onClick={() => setShowAnnouncement(true)} />
            </div>
          </div>

          <div style={{ ...G, padding: "14px" }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "white", marginBottom: "6px" }}>Stats</div>
            {[["Total Interns", String(interns.length)], ["Assigned Tasks", "24"]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{l}</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD INTERN MODAL */}
      {showAddIntern && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "380px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: "6px" }}><UserPlus size={14} /> Add New Intern</span>
              <button onClick={() => setShowAddIntern(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            {[{ l: "Full Name *", k: "name", p: "e.g. Arjun Singh" }, { l: "Email", k: "email", p: "arjun@intern.com" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input value={newIntern[f.k]} onChange={e => setNewIntern(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.p} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Department</label>
              <select value={newIntern.dept} onChange={e => setNewIntern(p => ({ ...p, dept: e.target.value }))} style={inp}>
                {["Frontend", "Backend", "Database", "DevOps", "Testing", "Documentation"].map(d => <option key={d} style={{ background: "#0B1120" }}>{d}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setShowAddIntern(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "11px" }}>Cancel</button>
              <button onClick={addIntern} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>Add Intern</button>
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT MODAL */}
      {showAnnouncement && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: "6px" }}><Megaphone size={14} /> Send Announcement</span>
              <button onClick={() => setShowAnnouncement(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginBottom: "10px" }}>This will be visible to all interns in their dashboard notifications.</p>
            <textarea rows={4} value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Type your announcement here..." style={{ ...inp, resize: "none", marginBottom: "14px" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowAnnouncement(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "11px" }}>Cancel</button>
              <button onClick={sendAnnouncement} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: announceSent ? "rgba(34,197,94,0.3)" : "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>
                {announceSent ? "Sent!" : "Send to All Interns"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// â”€â”€ 3. TASKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Tasks({ setActive }) {
  const [tasks, setTasks] = useState([])
  const [sel, setSel] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: "", intern: "", priority: "High", dueDate: "", status: "Pending" })
  const fileRef = useRef(null)

  useEffect(() => {
    fetch(`${BASE}/mentor/tasks`).then(r => r.json()).then(d => { if (Array.isArray(d)) { setTasks(d); if (d.length) setSel(d[0]) } }).catch(() => {
      setTasks([{ _id: "1", title: "Build Login API", intern: "Riya Verma", priority: "High", dueDate: "May 15, 2025", status: "In Progress", progress: 70 }, { _id: "2", title: "UI Design System", intern: "Karan Verma", priority: "Medium", dueDate: "May 12, 2025", status: "Review", progress: 90 }, { _id: "3", title: "Database Schema", intern: "Sneha Patil", priority: "High", dueDate: "May 10, 2025", status: "Completed", progress: 100 }, { _id: "4", title: "User Analytics", intern: "Mehul Joshi", priority: "Low", dueDate: "May 19, 2025", status: "In Progress", progress: 40 }, { _id: "5", title: "API Documentation", intern: "Rohit Shah", priority: "Medium", dueDate: "May 14, 2025", status: "Review", progress: 60 }, { _id: "6", title: "Bug Fix #235", intern: "Arjun Singh", priority: "High", dueDate: "May 11, 2025", status: "Completed", progress: 100 }])
    })
  }, [])

  const addTask = async () => {
    if (!form.title || !form.intern) return
    const doc = { ...form, progress: 0, createdAt: new Date().toISOString() }
    await fetch(`${BASE}/mentor/tasks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(doc) }).catch(() => { })
    const newTask = { ...doc, _id: Date.now().toString() }
    setTasks(p => [...p, newTask])
    // Sync to localStorage so ALL intern portals pick it up
    try {
      const existing = JSON.parse(localStorage.getItem("mentorAssignedTasks") || "[]")
      const newEntry = {
        id: newTask._id,
        name: newTask.title,
        cat: "Backend",
        due: newTask.dueDate,
        pri: newTask.priority,
        status: newTask.status || "Pending",
        pct: 0,
        bg: "#7C3AED",
        desc: `Assigned by mentor. Complete with proper validation and error handling.`,
        assignedTo: newTask.intern || "All"
      }
      const updated = [newEntry, ...existing]
      localStorage.setItem("mentorAssignedTasks", JSON.stringify(updated))
      // Fire storage event so intern tabs pick it up instantly
      window.dispatchEvent(new StorageEvent("storage", {
        key: "mentorAssignedTasks",
        newValue: JSON.stringify(updated),
        storageArea: localStorage
      }))
    } catch { }
    setShowAdd(false); setForm({ title: "", intern: "", priority: "High", dueDate: "", status: "Pending" })
  }

  return (
    <div style={{ display: "flex", gap: "12px", height: "calc(100vh - 120px)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
          {[{ l: "Total Tasks", v: "24", c: "#7C3AED" }, { l: "Pending Review", v: "8", c: "#f59e0b" }, { l: "In Progress", v: "10", c: "#06B6D4" }, { l: "Completed", v: "6", c: "#22c55e" }].map((s, i) => (
            <div key={i} style={{ ...G, padding: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "9px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "10px", cursor: "pointer" }}>
            <Plus size={11} /> Add Task
          </button>
        </div>
        <div style={{ ...G, overflow: "hidden", flex: 1 }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "10px", fontWeight: 600, color: "white" }}>Task Overview</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Task", "Intern", "Priority", "Due Date", "Status", "Progress"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr key={i} onClick={() => setSel(t)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: sel?._id === t._id ? "rgba(124,58,237,0.1)" : "transparent" }}>
                  <td style={{ padding: "8px 12px", fontSize: "10px", color: "white" }}>{t.title}</td>
                  <td style={{ padding: "8px 12px", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{t.intern}</td>
                  <td style={{ padding: "8px 12px" }}><span style={{ fontSize: "11px", fontWeight: 600, color: PRI_C[t.priority]?.c || "#fff" }}>{t.priority}</span></td>
                  <td style={{ padding: "8px 12px", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{t.dueDate}</td>
                  <td style={{ padding: "8px 12px" }}><span style={{ padding: "2px 7px", borderRadius: "999px", fontSize: "11px", color: STA_C[t.status]?.c || "#fff", background: STA_C[t.status]?.bg || "rgba(255,255,255,0.1)" }}>{t.status}</span></td>
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "50px", height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ width: `${t.progress || 0}%`, height: "100%", background: "#7C3AED", borderRadius: "2px" }} />
                      </div>
                      <span style={{ fontSize: "10px", color: "white" }}>{t.progress || 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Task Details Panel */}
      {sel && (
        <div style={{ width: "260px", minWidth: "260px", ...G, padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>Task Details</div>
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: "5px", alignSelf: "flex-start" }}>
            <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: 600 }}>{sel.priority} Priority</span>
          </div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>{sel.title}</div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Develop and implement {sel.title} with proper validation and error handling.</div>
          {[["Due Date", sel.dueDate], ["Intern", sel.intern], ["Status", sel.status]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>{l}</div>
              <div style={{ fontSize: "10px", color: "white" }}>{v}</div>
            </div>
          ))}
          <div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Progress</div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${sel.progress || 0}%`, height: "100%", background: "linear-gradient(90deg,#7C3AED,#06B6D4)", borderRadius: "3px" }} />
            </div>
            <div style={{ fontSize: "11px", color: "#7C3AED", marginTop: "2px" }}>{sel.progress || 0}%</div>
          </div>
          <div style={{ display: "flex", gap: "6px", marginTop: "auto" }}>
            <button style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontSize: "10px", cursor: "pointer" }}>Edit</button>
            <button onClick={() => setTasks(p => p.filter(t => t._id !== sel._id))} style={{ flex: 1, padding: "8px", borderRadius: "8px", background: "rgba(239,68,68,0.15)", border: "none", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}>Delete</button>
          </div>
          <button onClick={() => setActive("tasks")} style={{ width: "100%", padding: "9px", borderRadius: "9px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}>View All Tasks</button>
        </div>
      )}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>Add Task</span>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            {[{ l: "Task Title", k: "title" }, { l: "Intern Name", k: "intern" }, { l: "Due Date", k: "dueDate" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={inp}>
                {["High", "Medium", "Low"].map(o => <option key={o} style={{ background: "#0B1120" }}>{o}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "11px" }}>Cancel</button>
              <button onClick={addTask} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// â”€â”€ 4. SUBMISSIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Submissions() {
  const [subs, setSubs] = useState([])
  const [sel, setSel] = useState(null)
  const [reviewModal, setReviewModal] = useState(false)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewStatus, setReviewStatus] = useState("Approved")
  const fileRef = useRef(null)
  useEffect(() => {
    fetch(`${BASE}/mentor/submissions`).then(r => r.json()).then(d => { if (Array.isArray(d)) { setSubs(d); if (d.length) setSel(d[0]) } }).catch(() => {
      const demo = [{ _id: "1", intern: "Riya Verma", task: "Build Login API", submittedOn: "May 10, 2025", file: "login_api.zip", fileSize: "541 KB", status: "Approved", comments: "Great work! Code looks clean and well-structured.", submittedBy: "Riya Verma" }, { _id: "2", intern: "Karan Verma", task: "UI Design System", submittedOn: "May 08, 2025", file: "design_system.zip", fileSize: "1.2 MB", status: "Needs Changes", comments: "Needs more responsive design." }, { _id: "3", intern: "Sneha Patil", task: "Database Schema", submittedOn: "May 08, 2025", file: "schema_diagram.pdf", fileSize: "2.1 MB", status: "Approved", comments: "Well structured." }, { _id: "4", intern: "Mehul Joshi", task: "User Analytics", submittedOn: "May 02, 2025", file: "analytics_report.pdf", fileSize: "890 KB", status: "Needs Changes", comments: "Add more visualizations." }, { _id: "5", intern: "Rohit Shah", task: "API Documentation", submittedOn: "May 08, 2025", file: "api_docs.pdf", fileSize: "1.4 MB", status: "Approved", comments: "Well documented." }, { _id: "6", intern: "Arjun Singh", task: "Bug Fix PR", submittedOn: "May 06, 2025", file: "bugfix_pr.zip", fileSize: "320 KB", status: "Approved", comments: "Clean fix." }]
      setSubs(demo); setSel(demo[0])
    })
  }, [])

  // Sync intern portal submissions from localStorage
  useEffect(() => {
    const sync = () => {
      const stored = getAllSubmissions()
      if (!stored.length) return
      setSubs((prev) => {
        const map = new Map()
        prev.forEach((s) => map.set(String(s._id || s.id), s))
        stored.forEach((s) => {
          const id = String(s.id || s._id)
          map.set(id, { ...map.get(id), ...s, _id: id })
        })
        return Array.from(map.values()).sort(
          (a, b) =>
            new Date(b.submittedAt || b.submittedOn || 0) -
            new Date(a.submittedAt || a.submittedOn || 0)
        )
      })
      setSel((prev) => {
        if (prev) {
          const updated = stored.find((s) => String(s.id || s._id) === String(prev._id || prev.id))
          if (updated) return { ...prev, ...updated, _id: updated.id || updated._id }
          return prev
        }
        const pending = stored.find((s) => s.status === "Pending Review")
        return pending ? { ...pending, _id: pending.id || pending._id } : null
      })
    }
    sync()
    const id = setInterval(sync, 1500)
    window.addEventListener("storage", sync)
    window.addEventListener(KEY_INTERN_SUBMISSIONS, sync)
    return () => {
      clearInterval(id)
      window.removeEventListener("storage", sync)
      window.removeEventListener(KEY_INTERN_SUBMISSIONS, sync)
    }
  }, [])
  const download = (f) => { const blob = new Blob([`File: ${f}`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = f; a.click(); URL.revokeObjectURL(url) }

  const openReview = (e, sub) => {
    e.stopPropagation()
    setReviewTarget(sub)
    setReviewComment(sub.comments || "")
    setReviewStatus(sub.status === "Approved" ? "Approved" : "Needs Changes")
    setReviewModal(true)
  }

  const submitReview = () => {
    if (!reviewTarget) return
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const mentorName = user.fullName || "Mentor"
    const now = new Date()
    const timeStr = now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) + "  ·  " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

    // Update submission status
    setSubs(p => p.map(x => x._id === reviewTarget._id ? { ...x, status: reviewStatus, comments: reviewComment } : x))
    if (sel?._id === reviewTarget._id) setSel(p => ({ ...p, status: reviewStatus, comments: reviewComment }))
    fetch(`${BASE}/mentor/submissions/${reviewTarget._id}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: reviewStatus, comments: reviewComment }) }).catch(() => { })

    // Push mentor comment to localStorage so intern's journal page picks it up
    try {
      const existing = JSON.parse(localStorage.getItem("mentorComments") || "[]")
      const comment = {
        id: Date.now().toString(),
        submissionId: reviewTarget._id,
        journalTitle: reviewTarget.task?.replace("Journal: ", "") || reviewTarget.task,
        internName: reviewTarget.intern,
        text: reviewComment,
        mentor: mentorName,
        time: timeStr,
        status: reviewStatus
      }
      const updated2 = [comment, ...existing]
      localStorage.setItem("mentorComments", JSON.stringify(updated2))
      window.dispatchEvent(new StorageEvent("storage", { key: "mentorComments", newValue: JSON.stringify(updated2), storageArea: localStorage }))
    } catch { }

    try {
      updateSubmission(reviewTarget._id || reviewTarget.id, {
        status: reviewStatus,
        comments: reviewComment,
        mentor: mentorName,
        reviewedAt: new Date().toISOString(),
      })
    } catch { }

    setReviewModal(false); setReviewTarget(null); setReviewComment("")
  }
  return (
    <div style={{ display: "flex", gap: "12px", height: "calc(100vh - 120px)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
          {[{ l: "Total Submissions", v: "36", c: "#7C3AED" }, { l: "Approved", v: "20", c: "#22c55e" }, { l: "Needs Changes", v: "14", c: "#f59e0b" }, { l: "Late", v: "2", c: "#ef4444" }].map((s, i) => (
            <div key={i} style={{ ...G, padding: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "white" }}>Submissions Overview</div>
        <div style={{ ...G, overflow: "hidden", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Submission", "Intern", "Task", "Submitted On", "Status", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {subs.map((s, i) => (
                <tr key={i} onClick={() => setSel(s)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: sel?._id === s._id ? "rgba(124,58,237,0.1)" : "transparent" }}>
                  <td style={{ padding: "8px 12px", fontSize: "10px", color: "#06B6D4" }}>{s.file || s.fileName}</td>
                  <td style={{ padding: "8px 12px", fontSize: "10px", color: "white" }}>{s.intern || s.internId}</td>
                  <td style={{ padding: "8px 12px", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{s.task || s.taskId}</td>
                  <td style={{ padding: "8px 12px", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{s.submittedOn || s.submittedAt?.slice(0, 10)}</td>
                  <td style={{ padding: "8px 12px" }}><span style={{ padding: "2px 7px", borderRadius: "999px", fontSize: "11px", color: STA_C[s.status]?.c || "#fff", background: STA_C[s.status]?.bg || "rgba(255,255,255,0.1)" }}>{s.status}</span></td>
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button onClick={e => { e.stopPropagation(); download(s.file || s.fileName || "file") }} style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(6,182,212,0.15)", border: "none", color: "#06B6D4", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}><Download size={9} /> View</button>
                      <button onClick={e => openReview(e, s)} style={{ padding: "3px 8px", borderRadius: "6px", background: "rgba(124,58,237,0.2)", border: "none", color: "#a78bfa", fontSize: "11px", cursor: "pointer" }}>Review</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {sel && (
        <div style={{ width: "240px", minWidth: "240px", ...G, padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>Submission Preview</div>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "white" }}>{sel.task || sel.taskId}</div>
          <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "11px", color: STA_C[sel.status]?.c || "#fff", background: STA_C[sel.status]?.bg || "rgba(255,255,255,0.1)", alignSelf: "flex-start" }}>{sel.status}</span>
          {[["Submitted On", sel.submittedOn || sel.submittedAt?.slice(0, 10) || "-"], ["Submitted By", sel.intern || sel.submittedBy || "-"]].map(([l, v]) => (
            <div key={l}><div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{l}</div><div style={{ fontSize: "10px", color: "white" }}>{v}</div></div>
          ))}
          {sel.comments && (
            <div><div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Comments</div><div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{sel.comments}</div></div>
          )}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={11} color="#7C3AED" /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", color: "white" }}>{sel.file || sel.fileName || "-"}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{sel.fileSize || sel.fileSize || "-"}</div>
            </div>
            <button onClick={() => download(sel.file || sel.fileName || "file")} style={{ background: "none", border: "none", cursor: "pointer" }}><Download size={12} color="#06B6D4" /></button>
          </div>
          <button onClick={e => openReview({ stopPropagation: () => { } }, sel)} style={{ width: "100%", padding: "9px", borderRadius: "9px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}>
            Add Review & Comment
          </button>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewModal && reviewTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "440px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "white" }}> Review Submission</span>
              <button onClick={() => setReviewModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="rgba(255,255,255,0.5)" /></button>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "10px 12px", marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>Submission</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "white" }}>{reviewTarget.task}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>by {reviewTarget.intern}</div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "6px" }}>Status</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["Approved", "Needs Changes", "Pending Review"].map(s => (
                  <button key={s} onClick={() => setReviewStatus(s)}
                    style={{ flex: 1, padding: "7px", borderRadius: "8px", border: `1px solid ${reviewStatus === s ? "#7C3AED" : "rgba(255,255,255,0.1)"}`, background: reviewStatus === s ? "rgba(124,58,237,0.2)" : "transparent", color: reviewStatus === s ? "#a78bfa" : "rgba(255,255,255,0.5)", fontSize: "11px", cursor: "pointer", fontWeight: reviewStatus === s ? 600 : 400 }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "6px" }}>Comment for Intern</label>
              <textarea rows={4} value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                placeholder="Write your feedback here... This will appear in the intern's journal as a Mentor Comment."
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 12px", fontSize: "11px", color: "white", outline: "none", resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setReviewModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "11px" }}>Cancel</button>
              <button onClick={submitReview} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// â”€â”€ 5. EVALUATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Evaluations() {
  const [sel, setSel] = useState(DEMO_INTERNS[1])
  const [pendingSubs, setPendingSubs] = useState([])
  const [activeSub, setActiveSub] = useState(null)
  const [showFilePreview, setShowFilePreview] = useState(false)
  const [scores, setScores] = useState({ "Technical Skills": 24, "Problem Solving": 18, "Code Quality": 16, "Documentation": 12, "Communication": 10 })
  const [feedback, setFeedback] = useState("Overall great work on the dashboard. Improve responsiveness.")
  const [done, setDone] = useState(false)
  const RUBRICS = DEFAULT_RUBRICS
  const total = Object.values(scores).reduce((s, v) => s + v, 0)

  useEffect(() => {
    const sync = () => {
      const pending = getPendingSubmissions()
      setPendingSubs(pending)
      setActiveSub((prev) => {
        if (prev) {
          const u = pending.find((s) => String(s.id) === String(prev.id))
          return u || prev
        }
        return pending[0] || null
      })
      if (pending[0]?.intern) {
        const match = DEMO_INTERNS.find(
          (d) => d.name.toLowerCase() === pending[0].intern.toLowerCase()
        )
        if (match) setSel(match)
      }
    }
    sync()
    const id = setInterval(sync, 1500)
    window.addEventListener("storage", sync)
    window.addEventListener(KEY_INTERN_SUBMISSIONS, sync)
    return () => {
      clearInterval(id)
      window.removeEventListener("storage", sync)
      window.removeEventListener(KEY_INTERN_SUBMISSIONS, sync)
    }
  }, [])

  useEffect(() => {
    if (activeSub) setShowFilePreview(true)
  }, [activeSub?.id])

  const pickSubmission = (sub) => {
    setActiveSub(sub)
    setShowFilePreview(true)
    const match = DEMO_INTERNS.find(
      (d) => d.name.toLowerCase() === (sub.intern || "").toLowerCase()
    )
    if (match) setSel(match)
    else
      setSel({
        id: sub.internId || sub.id,
        name: sub.intern || "Intern",
        avatar: (sub.intern || "I").charAt(0).toUpperCase(),
        color: "#7C3AED",
        tasks: "1/10",
      })
  }

  const openSubmissionFile = (sub) => {
    if (!sub) return
    downloadSubmissionFile(sub)
    setShowFilePreview(true)
  }
  const submit = async () => {
    const user = getUser()
    const criteriaComments = {}
    RUBRICS.forEach((r) => {
      criteriaComments[r.name] =
        r.name === "Technical Skills" ? "Good understanding of components." :
          r.name === "Problem Solving" ? "Implemented efficiently." :
            r.name === "Code Quality" ? "Clean and maintainable code." :
              r.name === "Documentation" ? "Well documented." : "Responsive and clear."
    })
    await fetch(`${BASE}/mentor/evaluations/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ internId: sel.id, mentorId: user.id, scores, feedback, totalScore: total, grade: total >= 90 ? "A" : total >= 75 ? "B" : total >= 60 ? "C" : "D", period: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }) }) }).catch(() => { })
    const internName = activeSub?.intern || sel.name
    const internUserId = activeSub?.internUserId || ""
    const resolvedInternId =
      activeSub?.internId ||
      internKeyFromUser({ fullName: internName, id: internUserId })
    const isJournal =
      activeSub?.type === "journal" ||
      String(activeSub?.task || "").startsWith("Journal:")
    saveInternEvaluation({
      internName,
      internId: resolvedInternId,
      internUserId,
      mentorName: user.fullName || "Priya Sharma",
      mentorId: user.id,
      scores,
      rubrics: RUBRICS,
      criteriaComments,
      feedback,
      totalScore: total,
      grade: total >= 90 ? "A" : total >= 75 ? "B" : total >= 60 ? "C" : "D",
      gradeLabel: gradeLabel(total),
      period: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      type: activeSub ? (isJournal ? "journal" : "task") : "performance",
      taskName: activeSub?.task || "",
      submissionId: activeSub?.id,
    })
    if (activeSub) {
      updateSubmission(activeSub.id, {
        status: total >= 60 ? "Approved" : "Needs Changes",
        comments: feedback,
        mentor: user.fullName || "Priya Sharma",
        reviewedAt: new Date().toISOString(),
        evaluationScore: total,
        evaluationVisibleToIntern: true,
      })
      setPendingSubs((p) => p.filter((s) => String(s.id) !== String(activeSub.id)))
      setActiveSub(null)
    }
    setDone(true); setTimeout(() => setDone(false), 2500)
  }
  const pendingCount = pendingSubs.length
  const previewSub = showFilePreview && activeSub ? activeSub : null
  return (
    <div style={{ display: "flex", gap: "16px", height: "calc(100vh - 120px)", minHeight: 0, overflow: "hidden" }}>
      {/* LEFT — file preview + evaluation form */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "12px", overflow: "hidden" }}>
        {previewSub && (
          <div style={{ ...G, padding: "14px", flexShrink: 0, maxHeight: "min(42vh, 360px)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>Submitted file</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{previewSub.intern} · {previewSub.task}</div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button type="button" onClick={() => downloadSubmissionFile(previewSub)} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", borderRadius: "8px", background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.35)", color: "#06B6D4", fontSize: "10px", cursor: "pointer" }}>
                  <Download size={12} /> Download
                </button>
                <button type="button" onClick={() => setShowFilePreview(false)} style={{ padding: "6px 8px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                  <X size={12} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: "120px", borderRadius: "12px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {previewSub.fileData && isImageSubmission(previewSub) ? (
                <img src={previewSub.fileData} alt={previewSub.file} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <FileText size={40} color="#7C3AED" style={{ margin: "0 auto 10px" }} />
                  <div style={{ fontSize: "11px", color: "white", marginBottom: "4px" }}>{previewSub.file}</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>{previewSub.fileSize}</div>
                  {!previewSub.fileData && (
                    <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", marginTop: "8px" }}>Preview unavailable — use Download</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", flexShrink: 0 }}>
          {[{ l: "Evaluations Done", v: "16", c: "#7C3AED" }, { l: "Pending", v: String(pendingCount || "0"), c: "#f59e0b" }, { l: "Avg Score", v: "82.4", c: "#22c55e" }, { l: "Completion Rate", v: "76%", c: "#06B6D4" }].map((s, i) => (
            <div key={i} style={{ ...G, padding: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "white", flexShrink: 0 }}>
          {activeSub
            ? `Evaluate: ${activeSub.task} — ${activeSub.intern}`
            : `Evaluate: ${sel.name}`}
        </div>
        <div style={{ ...G, padding: "14px", flex: 1, minHeight: 0, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Criteria", "Weightage", "Max Score", "Score", "Comments"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {RUBRICS.map(r => (
                <tr key={r.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px 12px", fontSize: "10px", color: "white" }}>{r.name}</td>
                  <td style={{ padding: "10px 12px", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{r.weight}%</td>
                  <td style={{ padding: "10px 12px", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{r.max}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <input type="number" min="0" max={r.max} value={scores[r.name] || 0} onChange={e => setScores(p => ({ ...p, [r.name]: Math.min(r.max, parseInt(e.target.value) || 0) }))}
                      style={{ ...inp, width: "60px", textAlign: "center" }} />
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                    {r.name === "Technical Skills" ? "Good understanding of components." : r.name === "Problem Solving" ? "Implemented efficiently." : r.name === "Code Quality" ? "Clean and maintainable code." : r.name === "Documentation" ? "Well documented." : "Responsive and clear."}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid rgba(255,255,255,0.1)" }}>
                <td colSpan={2} style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 700, color: "white" }}>Total</td>
                <td style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 700, color: "white" }}>100%</td>
                <td style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 700, color: "#7C3AED" }}>{total}</td>
                <td />
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: "10px" }}>
            <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Feedback</label>
            <textarea rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} style={{ ...inp, resize: "vertical", minHeight: "72px" }} />
          </div>
          <button onClick={submit} style={{ marginTop: "12px", padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
            {done ? "Submitted!" : "Submit Evaluation"}
          </button>
        </div>
      </div>

      {/* RIGHT — compact sidebar */}
      <div style={{ width: "260px", minWidth: "260px", maxWidth: "260px", display: "flex", flexDirection: "column", gap: "10px", minHeight: 0, overflow: "hidden" }}>
        {/* Compact pending queue */}
        {pendingSubs.length > 0 && (
          <div style={{ ...G, padding: "8px 10px", flexShrink: 0 }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "#f59e0b", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={11} /> Pending ({pendingCount})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px", maxHeight: "72px", overflowY: "auto" }}>
              {pendingSubs.map((sub) => {
                const isActive = activeSub && String(activeSub.id) === String(sub.id)
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => pickSubmission(sub)}
                    title={sub.file}
                    style={{
                      width: "100%", textAlign: "left", padding: "5px 8px", borderRadius: "6px", cursor: "pointer",
                      background: isActive ? "rgba(245,158,11,0.25)" : "transparent",
                      border: isActive ? "1px solid rgba(245,158,11,0.45)" : "1px solid transparent",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "9px", color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      <strong>{sub.intern}</strong> · {sub.task}
                    </span>
                    <span style={{ fontSize: "8px", color: "#f59e0b", flexShrink: 0 }}>New</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Submission quick info */}
        <div style={{ ...G, padding: "12px", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {activeSub ? (
            <>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "white", marginBottom: "10px" }}>{activeSub.intern}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.55)", marginBottom: "12px" }}>{activeSub.task} · {activeSub.submittedOn}</div>
              <button
                type="button"
                onClick={() => openSubmissionFile(activeSub)}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: "10px",
                  padding: "10px", display: "flex", alignItems: "center", gap: "10px",
                }}
              >
                <FileText size={18} color="#a78bfa" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeSub.file}</div>
                  <div style={{ fontSize: "9px", color: "#06B6D4", marginTop: "3px" }}>Click to preview left & download</div>
                </div>
                <Download size={14} color="#06B6D4" />
              </button>
              <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginTop: "14px", lineHeight: 1.5 }}>
                Total score: <strong style={{ color: "#a78bfa" }}>{total}</strong> — {gradeLabel(total)}
              </p>
            </>
          ) : (
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: 0 }}>
              Pick a pending submission or an intern to evaluate.
            </p>
          )}
        </div>

        <div style={{ ...G, padding: "8px 10px", flexShrink: 0, maxHeight: "140px", overflowY: "auto" }}>
          <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>Interns</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {DEMO_INTERNS.map((intern, i) => (
              <button key={i} type="button" onClick={() => { setSel(intern); setActiveSub(null); setShowFilePreview(false) }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 8px", borderRadius: "6px", background: sel?.id === intern.id && !activeSub ? "rgba(124,58,237,0.2)" : "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: intern.color + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: intern.color }}>{intern.avatar}</div>
                <span style={{ fontSize: "10px", color: "white", flex: 1 }}>{intern.name}</span>
                {pendingSubs.some(p => (p.intern || "").toLowerCase() === intern.name.toLowerCase()) && (
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// â”€â”€ 6. ATTENDANCE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Attendance() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [liveRecords, setLiveRecords] = useState([])
  const [activeSession, setActiveSession] = useState(null)

  const loadRecords = () => {
    setLiveRecords(getMentorAttendanceRecords())
    setActiveSession(getActiveSession())
  }

  useEffect(() => {
    loadRecords()
    const id = setInterval(loadRecords, 2000)
    const onEvt = () => loadRecords()
    window.addEventListener(KEY_MENTOR_ATTENDANCE, onEvt)
    window.addEventListener("storage", onEvt)
    return () => {
      clearInterval(id)
      window.removeEventListener(KEY_MENTOR_ATTENDANCE, onEvt)
      window.removeEventListener("storage", onEvt)
    }
  }, [])

  const days = new Date(year, month + 1, 0).getDate()
  const startDay = new Date(year, month, 1).getDay()
  const cells = [...Array(startDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const ATT = { 1: "p", 2: "p", 3: "p", 4: "p", 5: "p", 6: "p", 7: "p", 8: "p", 9: "p", 10: "p", 11: "p", 12: "p", 13: "p", 14: "p", 15: "p", 16: "p", 17: "p", 18: "a", 19: "p", 20: "p", 21: "p", 22: "p", 23: "l", 24: "p", 25: "p", 26: "p", 27: "p", 28: "p", 29: "p", 30: "p" }
  const attWithToday = { ...ATT, [now.getDate()]: month === now.getMonth() && year === now.getFullYear() ? "p" : ATT[now.getDate()] }
  const DOT = { p: "#22c55e", a: "#ef4444", l: "#f59e0b", h: "#06B6D4" }
  const DEMO_RECORDS = [
    { date: "May 22, 2025", checkIn: "09:01 AM", checkOut: "06:10 PM", status: "Present" }, { date: "May 21, 2025", checkIn: "09:07 AM", checkOut: "06:02 PM", status: "Present" }, { date: "May 20, 2025", checkIn: "09:11 AM", checkOut: "06:01 PM", status: "Present" }, { date: "May 19, 2025", checkIn: "09:22 AM", checkOut: "05:45 PM", status: "Late" }, { date: "May 18, 2025", checkIn: "-", checkOut: "-", status: "Absent" },
  ]
  const liveRows = liveRecords.map((r) => ({
    date: r.date,
    checkIn: r.checkIn,
    checkOut: r.checkOut || "-",
    status: activeSession?.id === r.id && !r.checkOutIso ? "Active" : r.status,
    isLive: true,
  }))
  const demoRows = DEMO_RECORDS.filter(
    (d) => !liveRows.some((l) => l.date === d.date && l.checkIn === d.checkIn)
  )
  const records = [...liveRows, ...demoRows].slice(0, 12)
  return (
    <div style={{ display: "flex", gap: "12px", height: "calc(100vh - 120px)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
          {[
            { l: "Attendance %", v: "92%", c: "#22c55e", data: [{ v: 70 }, { v: 80 }, { v: 88 }, { v: 75 }, { v: 92 }] },
            { l: "Present Days", v: "22", c: "#7C3AED", data: [{ v: 18 }, { v: 19 }, { v: 20 }, { v: 21 }, { v: 22 }] },
            { l: "Absent Days", v: "2", c: "#ef4444", data: [{ v: 4 }, { v: 3 }, { v: 3 }, { v: 2 }, { v: 2 }] },
            { l: "Late Check-ins", v: "1", c: "#f59e0b", data: [{ v: 3 }, { v: 2 }, { v: 2 }, { v: 1 }, { v: 1 }] }
          ].map((s, i) => (
            <div key={i} style={{ ...G, padding: "10px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", height: "130px" }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{s.l}</div>
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "65px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={s.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={s.c} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={s.c} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={s.c} strokeWidth={2} fill={`url(#grad${i})`} dot={false} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...G, padding: "14px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }} style={{ background: "none", border: "none", cursor: "pointer", color: "white" }}><ChevronLeft size={16} /></button>
            <span style={{ fontSize: "10px", fontWeight: 600, color: "white" }}>{MONTHS[month]} {year}</span>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }} style={{ background: "none", border: "none", cursor: "pointer", color: "white" }}><ChevronRight size={16} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", marginBottom: "4px" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.4)", padding: "3px" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px" }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} style={{ height: "36px" }} />
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
              const att = attWithToday[day]
              return (
                <div key={i} style={{ height: "36px", borderRadius: "6px", background: isToday ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.03)", border: isToday ? "1px solid rgba(124,58,237,0.5)" : "1px solid transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "11px", color: isToday ? "#a78bfa" : "rgba(255,255,255,0.7)" }}>{day}</span>
                  {att && <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: DOT[att], marginTop: "1px" }} />}
                </div>
              )
            })}
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {[["Present", "#22c55e"], ["Absent", "#ef4444"], ["Late", "#f59e0b"], ["Half Day", "#06B6D4"]].map(([l, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: c }} /><span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{l}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ width: "280px", minWidth: "280px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "white" }}>Monthly Overview</div>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div style={{ position: "relative", width: "80px", height: "80px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={[{ v: 92, c: "#22c55e" }, { v: 8, c: "rgba(255,255,255,0.08)" }]} cx="50%" cy="50%" innerRadius={26} outerRadius={38} dataKey="v" strokeWidth={0}>{[{ v: 92, c: "#22c55e" }, { v: 8, c: "rgba(255,255,255,0.08)" }].map((d, i) => <Cell key={i} fill={d.c} />)}</Pie></PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "white" }}>92%</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {[["Present", "22 (92%)", "#22c55e"], ["Absent", "2 (8%)", "#ef4444"], ["Late", "1 (4%)", "#f59e0b"], ["Half Day", "0 (0%)", "#06B6D4"]].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} /><span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{l}</span><span style={{ fontSize: "11px", color: "white", marginLeft: "auto" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "white" }}>Recent Records</div>
        <div style={{ ...G, overflow: "hidden", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Date", "Check In", "Check Out", "Status"].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 10px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: r.isLive ? "rgba(34,197,94,0.06)" : "transparent" }}>
                  <td style={{ padding: "7px 10px", fontSize: "11px", color: "white" }}>{r.date}{r.isLive ? " *" : ""}</td>
                  <td style={{ padding: "7px 10px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{r.checkIn}</td>
                  <td style={{ padding: "7px 10px", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{r.checkOut}</td>
                  <td style={{ padding: "7px 10px" }}><span style={{ padding: "1px 6px", borderRadius: "999px", fontSize: "10px", color: r.status === "Active" ? "#22c55e" : STA_C[r.status]?.c || "#fff", background: r.status === "Active" ? "rgba(34,197,94,0.2)" : STA_C[r.status]?.bg || "rgba(255,255,255,0.1)" }}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// â”€â”€ 7. JOURNALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Journals({ setActive }) {
  const [journals, setJournals] = useState([])
  const [sel, setSel] = useState(null)
  const [comment, setComment] = useState("")
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    fetch(`${BASE}/intern/journals/`).then(r => r.json()).then(d => { if (Array.isArray(d) && d.length) { setJournals(d); setSel(d[0]) } }).catch(() => {
      const demo = [{ _id: "1", date: "May 24, 2025", title: "Implemented authentication API using JWT", workedOn: "Today I implemented the user authentication API using JWT authentication. Passwords are encrypted using bcrypt. I also wrote unit tests for the auth endpoints.", learned: "1. JWT token structure\n2. Middleware for authentication\n3. Error handling in auth flows", challenges: "Token refresh logic was complex.", tomorrowPlan: "Add logout endpoint.", status: "Pending", mentorComment: null }, { _id: "2", date: "May 23, 2025", title: "Worked on Dashboard UI", workedOn: "Built the main dashboard with charts.", learned: "Recharts library usage.", challenges: "Responsive layout.", tomorrowPlan: "Add more widgets.", status: "Approved", mentorComment: { text: "Great work! Please add more test cases.", mentor: "Priya Sharma" } }, { _id: "3", date: "May 20, 2025", title: "Fixed UI bugs and improved UX", workedOn: "Fixed several UI bugs.", learned: "CSS specificity.", challenges: "Cross-browser issues.", tomorrowPlan: "Continue testing.", status: "Approved", mentorComment: null }]
      setJournals(demo); setSel(demo[0])
    })
  }, [])
  const addComment = async () => {
    if (!sel || !comment.trim()) return
    await fetch(`${BASE}/intern/journals/${sel._id}/comment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: comment, mentor: getUser().fullName || "Mentor" }) }).catch(() => { })
    setJournals(p => p.map(j => j._id === sel._id ? { ...j, mentorComment: { text: comment, mentor: getUser().fullName || "Mentor" } } : j))
    setSel(p => ({ ...p, mentorComment: { text: comment, mentor: getUser().fullName || "Mentor" } }))
    // Dispatch so intern tab reacts instantly
    try {
      const existing = JSON.parse(localStorage.getItem("mentorComments") || "[]")
      const u = getUser()
      const mc = { id: Date.now().toString(), journalTitle: sel.title, text: comment, mentor: u.fullName || "Mentor", time: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) + " - " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }
      const updated = [mc, ...existing]
      localStorage.setItem("mentorComments", JSON.stringify(updated))
      window.dispatchEvent(new StorageEvent("storage", { key: "mentorComments", newValue: JSON.stringify(updated), storageArea: localStorage }))
    } catch { }
    setComment(""); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", height: "calc(100vh - 120px)" }}>
      {/* Stat cards row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", flexShrink: 0 }}>
        {[{ l: "Total Journals", v: String(journals.length || 18), c: "#7C3AED" }, { l: "This Week", v: "5", c: "#06B6D4" }, { l: "Pending Review", v: String(journals.filter(j => j.status !== "Approved").length || 3), c: "#f59e0b" }, { l: "Approved", v: String(journals.filter(j => j.status === "Approved").length || 15), c: "#22c55e" }].map((s, i) => (
          <div key={i} style={{ ...G, padding: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Main content row — timeline + detail */}
      <div style={{ display: "flex", gap: "12px", flex: 1, overflow: "hidden", minHeight: 0 }}>
        <div style={{ width: "220px", minWidth: "220px", ...G, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "10px", fontWeight: 600, color: "white" }}>Journal Timeline</div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {journals.map((j, i) => (
              <button key={i} onClick={() => setSel(j)}
                style={{ width: "100%", textAlign: "left", padding: "10px 12px", background: sel?._id === j._id ? "rgba(124,58,237,0.1)" : "transparent", borderLeft: sel?._id === j._id ? "2px solid #7C3AED" : "2px solid transparent", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>{j.date}</div>
                <div style={{ fontSize: "10px", color: "white", marginBottom: "3px" }}>{j.title}</div>
                <span style={{ padding: "1px 6px", borderRadius: "999px", fontSize: "10px", color: j.status === "Approved" ? "#22c55e" : "#f59e0b", background: j.status === "Approved" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)" }}>{j.status || "Pending"}</span>
              </button>
            ))}
          </div>
        </div>
        {sel && (
          <div style={{ flex: 1, ...G, padding: "16px", overflowY: "auto" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "white", marginBottom: "4px" }}>{sel.title}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "12px" }}>{sel.date}</div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "white", marginBottom: "6px" }}>What I worked on today</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "10px" }}>{sel.workedOn}</div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "white", marginBottom: "6px" }}>What I learned today</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "10px", whiteSpace: "pre-line" }}>{sel.learned}</div>
            {sel.mentorComment && (
              <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "10px", padding: "12px", marginBottom: "10px" }}>
                <div style={{ fontSize: "11px", color: "#a78bfa", marginBottom: "4px" }}>Mentor Comments</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)" }}>{sel.mentorComment.text}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>- {sel.mentorComment.mentor}</div>
              </div>
            )}
            <div>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Add Comment</label>
              <textarea rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Write feedback..." style={{ ...inp, resize: "none", marginBottom: "8px" }} />
              <button onClick={addComment} style={{ padding: "7px 16px", borderRadius: "9px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "10px", fontWeight: 600, cursor: "pointer" }}>
                {saved ? "Saved!" : "Submit Comment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// â”€â”€ 8. MESSAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Messages() {
  const [contacts, setContacts] = useState([])
  const [sel, setSel] = useState(null)
  const [input, setInput] = useState("")
  const [chats, setChats] = useState({})
  const chatEndRef = useRef(null)
  const seenMsgIds = useRef(new Set())
  const mentorUser = getUser()

  useEffect(() => {
    const demo = [
      { _id: "intern-riya", fromName: "Riya Verma", role: "Frontend Intern", lastMsg: "Hi Mentor, I have completed the login API.", time: "10:36 AM", unread: 2, online: true },
      { _id: "intern-karan", fromName: "Karan Verma", role: "UI/UX Intern", lastMsg: "Almost done with the dashboard UI!", time: "Yesterday", unread: 0, online: false },
      { _id: "intern-sneha", fromName: "Sneha Patil", role: "Backend Intern", lastMsg: "Sure, uploading now.", time: "May 22", unread: 0, online: true },
      { _id: "intern-mehul", fromName: "Mehul Joshi", role: "Data Analyst", lastMsg: "Thanks for the feedback.", time: "May 21", unread: 0, online: false },
      { _id: "intern-arjun", fromName: "Arjun Singh", role: "DevOps Intern", lastMsg: "Deployment done.", time: "May 19", unread: 0, online: false },
    ]
    setContacts(demo); setSel(demo[0])
    setChats({
      "intern-riya": [
        { from: "them", text: "Hi Mentor, I have completed the login API.", time: "10:36 AM", senderName: "Riya Verma" },
        { from: "me", text: "Great! Please share the documentation too.", time: "10:39 AM" },
        { from: "them", text: "Sure, uploading now.", time: "10:41 AM", senderName: "Riya Verma" },
      ],
      "intern-karan": [
        { from: "them", text: "How is the frontend coming along?", time: "Yesterday", senderName: "Karan Verma" },
        { from: "me", text: "Keep up the good work!", time: "Yesterday" },
      ]
    })
    fetch(`${BASE}/mentor/messages`).then(r => r.json()).then(d => { if (Array.isArray(d) && d.length) { setContacts(d); setSel(d[0]) } }).catch(() => { })
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chats, sel])

  // Intern → mentor: route by intern sender (fromInternId / fromName), not mentor id in `to`
  useEffect(() => {
    const processMessages = () => {
      try {
        const internMsgs = JSON.parse(localStorage.getItem(KEY_INTERN_TO_MENTOR) || "[]")
        if (!internMsgs.length) return

        const newByIntern = []
        internMsgs.forEach(m => {
          if (!m.fromName) return
          const contactId = canonicalInternId(m.fromName, m.fromInternId)
          newByIntern.push({ ...m, contactId })
        })
        if (!newByIntern.length) return

        setChats(prev => {
          const updated = { ...prev }
          newByIntern.forEach(m => {
            const existing = updated[m.contactId] || []
            const key = `${m.id || ""}|${m.text}|${m.time}|${m.fromName}`
            const seen = new Set(existing.map(x => `${x.id || ""}|${x.text}|${x.time}|${x.senderName}`))
            if (!seen.has(key)) {
              updated[m.contactId] = [...existing, {
                id: m.id,
                from: "them",
                text: m.text,
                time: m.time,
                senderName: m.fromName,
                image: m.image,
              }]
            }
          })
          return updated
        })

        setContacts(prev => {
          let next = [...prev]
          newByIntern.forEach(m => {
            const last = m
            const idx = next.findIndex(c =>
              c._id === m.contactId ||
              canonicalInternId(c.fromName, c._id) === m.contactId ||
              (c.fromName && c.fromName.toLowerCase() === m.fromName.toLowerCase())
            )
            if (idx >= 0) {
              next[idx] = { ...next[idx], _id: m.contactId, fromName: m.fromName, lastMsg: last.text, time: last.time, unread: (next[idx].unread || 0) + 1 }
            } else {
              next = [{
                _id: m.contactId,
                fromName: m.fromName,
                role: "Intern",
                lastMsg: last.text,
                time: last.time,
                unread: 1,
                online: true,
              }, ...next]
            }
          })
          return next
        })

        const latestNew = newByIntern.filter(m => m.id && !seenMsgIds.current.has(m.id)).pop()
        if (latestNew?.id) {
          seenMsgIds.current.add(latestNew.id)
          setSel({
            _id: latestNew.contactId,
            fromName: latestNew.fromName,
            role: "Intern",
            lastMsg: latestNew.text,
            time: latestNew.time,
            unread: 0,
            online: true,
          })
        }
      } catch { }
    }

    processMessages()
    const pollId = setInterval(processMessages, 1000)
    const onStorage = (e) => {
      if (e.key === KEY_INTERN_TO_MENTOR) processMessages()
    }
    const onCustom = () => processMessages()
    window.addEventListener("storage", onStorage)
    window.addEventListener(KEY_INTERN_TO_MENTOR, onCustom)
    return () => {
      clearInterval(pollId)
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(KEY_INTERN_TO_MENTOR, onCustom)
    }
  }, [])

  const send = () => {
    if (!input.trim() || !sel) return
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    const text = input.trim()
    const mentorName = getUser()?.fullName || "Mentor"
    const internId = canonicalInternId(sel.fromName, sel._id)
    setChats(p => ({ ...p, [internId]: [...(p[internId] || p[sel._id] || []), { from: "me", text, time: now, senderName: mentorName }] }))
    setInput("")

    appendChatMessage(KEY_MENTOR_TO_INTERN, {
      mentorContactId: sel.to || sel.mentorContactId || MENTOR_CHANNEL_PRIYA,
      fromName: mentorName,
      toInternId: internId,
      toInternName: sel.fromName,
      text,
      time: now,
      id: Date.now().toString(),
    })
  }

  const activeInternId = sel ? canonicalInternId(sel.fromName, sel._id) : null
  const activeChat = activeInternId ? (chats[activeInternId] || chats[sel._id] || []) : []

  const COLORS = ["#7C3AED", "#06B6D4", "#22c55e", "#f59e0b", "#ec4899"]
  return (
    <div style={{ display: "flex", gap: "0", height: "calc(100vh - 120px)", ...G, overflow: "hidden" }}>
      {/* Contacts */}
      <div style={{ width: "220px", minWidth: "220px", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "11px", fontWeight: 600, color: "white" }}>Conversations</div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {contacts.map((c, i) => {
            const cid = canonicalInternId(c.fromName, c._id)
            const isActive = activeInternId === cid
            return (
              <button key={cid} onClick={() => setSel({ ...c, _id: cid })}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: isActive ? "rgba(124,58,237,0.1)" : "transparent", borderLeft: isActive ? "2px solid #7C3AED" : "2px solid transparent", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", textAlign: "left" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: COLORS[i % COLORS.length] + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: COLORS[i % COLORS.length] }}>{c.fromName.charAt(0)}</div>
                  {c.online && <div style={{ position: "absolute", bottom: 0, right: 0, width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", border: "1.5px solid #0B1120" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "10px", fontWeight: 500, color: "white" }}>{c.fromName}</span>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastMsg}</div>
                </div>
                {c.unread > 0 && <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "white", flexShrink: 0 }}>{c.unread}</div>}
              </button>
            )
          })}
        </div>
      </div>
      {/* Chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {sel && (
          <>
            <div style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#7C3AED33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#7C3AED" }}>{sel.fromName.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "white" }}>{sel.fromName}</div>
                  <div style={{ fontSize: "10px", color: sel.online ? "#22c55e" : "rgba(255,255,255,0.4)" }}>{sel.role}  ·  {sel.online ? "Online" : "Offline"}</div>
                </div>
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>You: <span style={{ color: "#a78bfa", fontWeight: 600 }}>{getUser()?.fullName || "Mentor"}</span></div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {(activeChat.length ? activeChat : [{ from: "them", text: sel.lastMsg, time: sel.time, senderName: sel.fromName }]).map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "70%", padding: "9px 12px", borderRadius: "14px", fontSize: "11px", lineHeight: 1.5, background: msg.from === "me" ? "linear-gradient(135deg,#7C3AED,#06B6D4)" : "rgba(255,255,255,0.08)", color: "white" }}>
                    {msg.from === "me" && <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", marginBottom: "2px", fontWeight: 600 }}>{msg.senderName || mentorUser?.fullName || "Mentor"}</div>}
                    {msg.from === "them" && <div style={{ fontSize: "10px", color: "#a78bfa", marginBottom: "2px", fontWeight: 600 }}>{msg.senderName || sel.fromName}</div>}
                    {msg.image ? (
                      <img src={msg.image} alt="photo" style={{ borderRadius: "8px", maxWidth: "100%", maxHeight: "180px", objectFit: "cover", cursor: "pointer", display: "block" }} onClick={() => window.open(msg.image, "_blank")} />
                    ) : (
                      <div>{msg.text}</div>
                    )}
                    <div style={{ fontSize: "10px", marginTop: "3px", textAlign: "right", color: "rgba(255,255,255,0.5)" }}>{msg.time}</div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "8px" }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type a message..." style={{ ...inp, flex: 1 }} />
              <button onClick={send} style={{ padding: "8px 14px", borderRadius: "9px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                <Send size={11} /> Send
              </button>
            </div>
          </>
        )}
      </div>
      {/* Profile panel */}
      {sel && (
        <div style={{ width: "200px", minWidth: "200px", borderLeft: "1px solid rgba(255,255,255,0.08)", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, color: "white" }}>Profile</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#7C3AED33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#7C3AED", margin: "0 auto 6px" }}>{sel.fromName.charAt(0)}</div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "white" }}>{sel.fromName}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{sel.role}</div>
          </div>
          {[["Email", `${sel.fromName.toLowerCase().replace(" ", ".")}@intern.com`], ["Phone", "+91 98155 43210"]].map(([l, v]) => (
            <div key={l}><div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{l}</div><div style={{ fontSize: "11px", color: "white" }}>{v}</div></div>
          ))}
          <button style={{ width: "100%", padding: "8px", borderRadius: "9px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "10px", cursor: "pointer" }}>View Profile</button>
        </div>
      )}
    </div>
  )
}

// â”€â”€ 9. CALENDAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MentorCalendar() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [view, setView] = useState("Month")
  const [showAdd, setShowAdd] = useState(false)
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({ title: "", date: "", time: "", type: "Meeting", color: "#7C3AED", priority: "Medium" })
  useEffect(() => {
    fetch(`${BASE}/mentor/calendar`).then(r => r.json()).then(d => { if (Array.isArray(d)) setEvents(d) }).catch(() => {
      setEvents([{ _id: "1", title: "Build Login API", date: "2025-05-06", time: "10:30 AM", color: "#7C3AED", type: "Task", intern: "Riya Verma", priority: "High" }, { _id: "2", title: "Create Dashboard UI", date: "2025-05-09", time: "11:00 AM", color: "#06B6D4", type: "Task", intern: "Karan Verma", priority: "High" }, { _id: "3", title: "Mentor Meeting", date: "2025-05-15", time: "4:00 PM", color: "#22c55e", type: "Meeting", intern: "All", priority: "Medium" }, { _id: "4", title: "Weekly Review", date: "2025-05-27", time: "10:00 AM", color: "#f59e0b", type: "Review", intern: "All", priority: "Low" }, { _id: "5", title: "Project Demo", date: "2025-05-29", time: "2:00 PM", color: "#ec4899", type: "Demo", intern: "All", priority: "Medium" }])
    })
  }, [])
  const days = new Date(year, month + 1, 0).getDate()
  const startDay = new Date(year, month, 1).getDay()
  const cells = [...Array(startDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const getEventsForDay = (d) => events.filter(e => { const ed = new Date(e.date); return ed.getDate() === d && ed.getMonth() === month && ed.getFullYear() === year })
  const addEvent = async () => {
    if (!form.title || !form.date) return
    await fetch(`${BASE}/mentor/calendar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => { })
    setEvents(p => [...p, { ...form, _id: Date.now().toString() }])
    setShowAdd(false); setForm({ title: "", date: "", time: "", type: "Meeting", color: "#7C3AED", priority: "Medium" })
  }
  const upcoming = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5)
  return (
    <div style={{ display: "flex", gap: "12px", height: "calc(100vh - 120px)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }} style={{ width: "26px", height: "26px", borderRadius: "7px", background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={13} /></button>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "white", minWidth: "130px", textAlign: "center" }}>{MONTHS[month]} {year}</span>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }} style={{ width: "26px", height: "26px", borderRadius: "7px", background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={13} /></button>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {["Month", "Week", "Day"].map(v => <button key={v} onClick={() => setView(v)} style={{ padding: "5px 12px", borderRadius: "8px", fontSize: "10px", border: "none", cursor: "pointer", background: view === v ? "linear-gradient(135deg,#7C3AED,#06B6D4)" : "rgba(255,255,255,0.06)", color: view === v ? "white" : "rgba(255,255,255,0.5)" }}>{v}</button>)}
            <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "8px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "10px", cursor: "pointer" }}><Plus size={11} /> Create Event</button>
          </div>
        </div>
        <div style={{ ...G, padding: "12px", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", marginBottom: "4px" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ textAlign: "center", fontSize: "11px", color: "rgba(255,255,255,0.4)", padding: "4px" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px" }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} style={{ height: "70px" }} />
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
              const dayEvs = getEventsForDay(day)
              return (
                <div key={i} style={{ height: "70px", borderRadius: "6px", background: isToday ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.02)", border: isToday ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.04)", padding: "4px", overflow: "hidden" }}>
                  <div style={{ fontSize: "10px", color: isToday ? "#a78bfa" : "rgba(255,255,255,0.7)", fontWeight: isToday ? 700 : 400, marginBottom: "2px" }}>{day}</div>
                  {dayEvs.slice(0, 2).map((ev, j) => (
                    <div key={j} style={{ fontSize: "8px", color: "white", background: ev.color + "cc", borderRadius: "3px", padding: "1px 4px", marginBottom: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {/* Upcoming Events */}
      <div style={{ width: "220px", minWidth: "220px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "white" }}>Upcoming Events</div>
        {upcoming.map((ev, i) => (
          <div key={i} style={{ ...G, padding: "10px", borderLeft: `3px solid ${ev.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "white" }}>{ev.title}</div>
              <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "4px", background: PRI_C[ev.priority]?.c + "22", color: PRI_C[ev.priority]?.c || "#fff" }}>{ev.priority}</span>
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{ev.time}</div>
          </div>
        ))}
        <button style={{ width: "100%", padding: "8px", borderRadius: "9px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontSize: "10px", cursor: "pointer" }}>View Full Calendar</button>
      </div>
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "24px", width: "380px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>Create Event</span>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={14} color="white" /></button>
            </div>
            {[{ l: "Title", k: "title" }, { l: "Date", k: "date", type: "date" }, { l: "Time", k: "time", type: "time" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input type={f.type || "text"} value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "11px" }}>Cancel</button>
              <button onClick={addEvent} style={{ flex: 1, padding: "9px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// â”€â”€ 10. ANALYTICS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Analytics() {
  const trendData = [{ d: "May 1", v: 20 }, { d: "May 6", v: 35 }, { d: "May 11", v: 55 }, { d: "May 16", v: 70 }, { d: "May 21", v: 85 }, { d: "May 26", v: 95 }, { d: "May 31", v: 100 }]
  const attData = DEMO_INTERNS.map(i => ({ name: i.name.split(" ")[0], att: parseInt(i.attendance) }))
  const pieData = [{ name: "Pending", v: 18, c: "#ef4444" }, { name: "In Progress", v: 14, c: "#06B6D4" }, { name: "Review", v: 9, c: "#f59e0b" }, { name: "Completed", v: 8, c: "#22c55e" }]
  const taskDue = [{ task: "Build Login API", intern: "Riya Verma", due: "May 15, 2025", status: "High" }, { task: "Create Dashboard UI", intern: "Karan Verma", due: "May 28, 2025", status: "High" }, { task: "Database Schema Design", intern: "Sneha Patil", due: "May 27, 2025", status: "Medium" }]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
        {[{ l: "Task Completion Rate", v: "76%", c: "#22c55e" }, { l: "Avg. Attendance", v: "92%", c: "#7C3AED" }, { l: "Avg. Evaluation Score", v: "82.4", c: "#06B6D4" }, { l: "Total Interns", v: "12", c: "#f59e0b" }].map((s, i) => (
          <div key={i} style={{ ...G, padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Submission Trend</div>
          <div style={{ height: "150px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs><linearGradient id="at" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.5} /><stop offset="95%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="d" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px" }} />
                <Area type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2} fill="url(#at)" dot={{ fill: "#7C3AED", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Task Status Distribution</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "120px", height: "120px", flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} dataKey="v" strokeWidth={0}>{pieData.map((d, i) => <Cell key={i} fill={d.c} />)}</Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>49</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Total Tasks</div>
              {pieData.map(d => <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "3px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: d.c }} /><span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{d.name} ({d.v})</span></div>)}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Top Performing Interns</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Intern", "Tasks Completed", "Avg. Score", "Attendance"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {DEMO_INTERNS.sort((a, b) => b.score - a.score).map((intern, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "6px 8px", fontSize: "10px", color: "white" }}>{intern.name}</td>
                  <td style={{ padding: "6px 8px", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{intern.tasks}</td>
                  <td style={{ padding: "6px 8px", fontSize: "10px", fontWeight: 700, color: "#7C3AED" }}>{intern.score}</td>
                  <td style={{ padding: "6px 8px", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{intern.attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ ...G, padding: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Attendance Overview</div>
          <div style={{ height: "150px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="att" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

// â”€â”€ 11. SETTINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MentorSettings({ user, setUser }) {
  const [tab, setTab] = useState("Profile Settings")
  const [form, setForm] = useState({ fullName: user.fullName || "Priya Sharma", email: user.email || "priya@mentor.com", phone: "+91 98155 43210", designation: "Senior Software Engineer", bio: "Mentor with 6+ years of experience in product development and mentoring." })
  const [notifs, setNotifs] = useState({ email: true, inApp: true, sms: false, push: true, taskAssignments: true, submissionAlerts: true, evaluationReminders: true, mentorMessages: true, systemAnnouncements: true })
  const [theme, setTheme] = useState("Dark")
  const [saved, setSaved] = useState(false)
  const [cur, setCur] = useState(""); const [nw, setNw] = useState(""); const [conf, setConf] = useState(""); const [pwMsg, setPwMsg] = useState("")

  const save = async () => {
    const u = getUser()
    if (u.id) await fetch(`${BASE}/auth/profile/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: form.fullName, bio: form.bio, phone: form.phone }) }).catch(() => { })
    const updated = { ...u, fullName: form.fullName }
    localStorage.setItem("user", JSON.stringify(updated)); setUser(updated)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }
  const changePw = async () => {
    if (!cur || !nw || nw !== conf) { setPwMsg("Check fields"); return }
    const u = getUser()
    const res = await fetch(`${BASE}/auth/change-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id, currentPassword: cur, newPassword: nw }) }).catch(() => ({ ok: false }))
    setPwMsg(res.ok ? "Password changed!" : "Failed - check current password")
    if (res.ok) { setCur(""); setNw(""); setConf("") }
  }
  const TABS = ["Profile Settings", "Notification Settings", "Security", "Appearance", "Account Preferences", "Integrations", "Data & Privacy", "Billing"]
  return (
    <div style={{ display: "flex", gap: "12px", height: "calc(100vh - 120px)" }}>
      {/* Left menu */}
      <div style={{ width: "180px", minWidth: "180px", ...G, padding: "10px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "8px", background: tab === t ? "rgba(124,58,237,0.2)" : "transparent", border: tab === t ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent", color: tab === t ? "white" : "rgba(255,255,255,0.55)", fontSize: "10px", cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>
      {/* Profile Settings */}
      {tab === "Profile Settings" && (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ ...G, padding: "16px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "white", marginBottom: "14px" }}>Profile Settings</div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "white" }}>
                {(form.fullName || "M").charAt(0)}
              </div>
              <button style={{ padding: "5px 12px", borderRadius: "8px", background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontSize: "10px", cursor: "pointer" }}>Change Photo</button>
            </div>
            {[{ l: "Full Name", k: "fullName" }, { l: "Email", k: "email" }, { l: "Phone", k: "phone" }, { l: "Designation", k: "designation" }].map(f => (
              <div key={f.k} style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                <input value={form[f.k] || ""} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={inp} disabled={f.k === "email"} />
              </div>
            ))}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>Bio</label>
              <textarea rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} style={{ ...inp, resize: "none" }} />
            </div>
            <button onClick={save} style={{ padding: "9px 20px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
              {saved ? "Saved!" : "Update Profile"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ ...G, padding: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "white", marginBottom: "12px" }}>Preferences</div>
              {[{ l: "Language", v: "English" }, { l: "Time Zone", v: "(GMT+5:30) Asia/Kolkata" }, { l: "Date Format", v: "MM/DD/YYYY" }, { l: "Time Format", v: "12-Hour (AM/PM)" }].map(f => (
                <div key={f.l} style={{ marginBottom: "10px" }}>
                  <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
                  <select style={inp}><option style={{ background: "#0B1120" }}>{f.v}</option></select>
                </div>
              ))}
              <div style={{ marginTop: "10px" }}>
                <div style={{ fontSize: "10px", fontWeight: 500, color: "white", marginBottom: "8px" }}>Appearance</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["Light", "Dark", "System"].map(t => (
                    <button key={t} onClick={() => setTheme(t)} style={{ flex: 1, padding: "7px", borderRadius: "8px", fontSize: "10px", border: "none", cursor: "pointer", background: theme === t ? "linear-gradient(135deg,#7C3AED,#06B6D4)" : "rgba(255,255,255,0.06)", color: theme === t ? "white" : "rgba(255,255,255,0.5)" }}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {tab === "Notification Settings" && (
        <div style={{ flex: 1, ...G, padding: "16px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "white", marginBottom: "14px" }}>Notification Settings</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "white", marginBottom: "10px" }}>Notification Channels</div>
              {[{ k: "email", l: "Email Notifications" }, { k: "inApp", l: "In-App Notifications" }, { k: "sms", l: "SMS Notifications" }, { k: "push", l: "Push Notifications" }].map(item => (
                <div key={item.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{item.l}</span>
                  <button onClick={() => setNotifs(p => ({ ...p, [item.k]: !p[item.k] }))} style={{ width: "38px", height: "20px", borderRadius: "999px", position: "relative", border: "none", cursor: "pointer", background: notifs[item.k] ? "linear-gradient(135deg,#7C3AED,#06B6D4)" : "rgba(255,255,255,0.1)" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "white", position: "absolute", top: "2px", transition: "all 0.2s", left: notifs[item.k] ? "calc(100% - 18px)" : "2px" }} />
                  </button>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 600, color: "white", marginBottom: "10px" }}>Notification Preferences</div>
              {[{ k: "taskAssignments", l: "Task Assignments" }, { k: "submissionAlerts", l: "Submission Alerts" }, { k: "evaluationReminders", l: "Evaluation Reminders" }, { k: "mentorMessages", l: "Mentor Messages" }, { k: "systemAnnouncements", l: "System Announcements" }].map(item => (
                <div key={item.k} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <input type="checkbox" checked={notifs[item.k]} onChange={e => setNotifs(p => ({ ...p, [item.k]: e.target.checked }))} style={{ accentColor: "#7C3AED" }} />
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>{item.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab === "Security" && (
        <div style={{ flex: 1, ...G, padding: "16px", maxWidth: "400px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "white", marginBottom: "14px" }}>Change Password</div>
          {[{ l: "Current Password", v: cur, set: setCur }, { l: "New Password", v: nw, set: setNw }, { l: "Confirm Password", v: conf, set: setConf }].map(f => (
            <div key={f.l} style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block", marginBottom: "4px" }}>{f.l}</label>
              <input type="password" value={f.v} onChange={e => f.set(e.target.value)} style={inp} />
            </div>
          ))}
          {pwMsg && <div style={{ fontSize: "10px", color: pwMsg.includes("Saved!") ? "#22c55e" : "#ef4444", marginBottom: "8px" }}>{pwMsg}</div>}
          <button onClick={changePw} style={{ padding: "9px 20px", borderRadius: "10px", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", color: "white", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>Update Password</button>
        </div>
      )}
      {!["Profile Settings", "Notification Settings", "Security"].includes(tab) && (
        <div style={{ flex: 1, ...G, padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>{tab} - Coming soon</div>
      )}
    </div>
  )
}

// â”€â”€ MAIN EXPORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MentorDashboardContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const auth = usePortalAuth(["mentor", "evaluator", "admin"], "mentor")
  const [active, setActive] = useState(tabParam || "dashboard")
  const [user, setUser] = useState(() => {
    try {
      const u = getUser("mentor")
      if (u?.fullName) return u
    } catch { }
    return { fullName: "Mentor", role: "mentor" }
  })
  const [attendanceHint, setAttendanceHint] = useState("")

  useEffect(() => {
    if (auth.user?.fullName) {
      setUser(auth.user)
    }
  }, [auth.user])

  useEffect(() => {
    const load = () => {
      try {
        const u = getUser("mentor")
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
    const u = user?.fullName ? user : (() => {
      try {
        return getUser("mentor")
      } catch { return {} }
    })()
    const session = mentorCheckIn(u)
    if (session) setAttendanceHint(`Checked in at ${session.checkIn}`)

    const refreshHint = () => {
      const active = getActiveSession()
      if (active) setAttendanceHint(`Checked in at ${active.checkIn}`)
      else setAttendanceHint("")
    }
    const id = setInterval(refreshHint, 2000)

    const onLeave = () => {
      mentorCheckOut()
    }
    window.addEventListener("beforeunload", onLeave)
    window.addEventListener("pagehide", onLeave)

    return () => {
      clearInterval(id)
      window.removeEventListener("beforeunload", onLeave)
      window.removeEventListener("pagehide", onLeave)
      mentorCheckOut()
    }
  }, [user?.fullName])

  useEffect(() => { if (tabParam) setActive(tabParam) }, [tabParam])

  if (auth.loading || !auth.authorized) {
    return <PortalLoadingSkeleton title="Mentor Portal" />
  }

  const mentorDisplayName = user.fullName && user.fullName !== "Mentor" ? user.fullName : (auth.user?.fullName || "Mentor")
  const TITLES = { dashboard: `Welcome back, ${mentorDisplayName}!`, interns: "My Interns", tasks: "Tasks", submissions: "Submissions", evaluations: "Evaluations", attendance: "Attendance", journals: "Journals", messages: "Messages", calendar: "Calendar", analytics: "Analytics", settings: "Settings" }
  const SUBS = { dashboard: "Here's what's happening with your interns today.", interns: "Manage and track all your assigned interns.", tasks: "Assign and monitor intern tasks.", submissions: "Review intern submissions.", evaluations: "Evaluate intern performance.", attendance: "Track intern attendance.", journals: "Review intern journals.", messages: "Communicate with interns.", calendar: "Schedule and manage events.", analytics: "Performance insights.", settings: "Manage your account." }

  const renderContent = () => {
    switch (active) {
      case "dashboard": return <Dashboard setActive={setActive} user={user} />
      case "interns": return <MyInterns setActive={setActive} />
      case "tasks": return <Tasks setActive={setActive} />
      case "submissions": return <Submissions />
      case "evaluations": return <Evaluations />
      case "attendance": return <Attendance />
      case "journals": return <Journals setActive={setActive} />
      case "messages": return <Messages />
      case "calendar": return <MentorCalendar />
      case "analytics": return <Analytics />
      case "settings": return <MentorSettings user={user} setUser={setUser} />
      default: return <Dashboard setActive={setActive} user={user} />
    }
  }

  return (
    <div className="portal-root" style={{ width: "100%", height: "100vh", overflow: "hidden", display: "flex", background: "transparent", color: "white" }}>
      <Sidebar active={active} setActive={setActive} />
      <main className="portal-main" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar title={TITLES[active] || "Mentor Portal"} subtitle={SUBS[active]} user={user} notifCount={2} attendanceHint={attendanceHint} />
        <div className="portal-content" style={{ flex: 1, overflow: "auto", padding: "24px 28px", minWidth: 0 }}>
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default function MentorDashboard() {
  return (
    <Suspense fallback={<PortalLoadingSkeleton title="Mentor Portal" />}>
      <MentorDashboardContent />
    </Suspense>
  )
}

