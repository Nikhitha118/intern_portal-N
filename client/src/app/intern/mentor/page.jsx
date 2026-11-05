"use client"
import React, { useState, useEffect } from "react"
import InternSidebar from "../../../lib/internSidebar"
import { Search, MessageSquare, Plus, X, Save, Users, Zap, Calendar, Clock, Sparkles, CheckCircle2, UserCheck, Filter, ArrowRight } from "lucide-react"
import { api, getUser } from "../../../lib/api"
import { getAssignedRole, STORAGE_KEY_ROLE } from "../../../lib/assessmentData"

const MENTORS = [
  { id: 1, name: "Rahul Sharma", role: "Backend Developer", company: "CodeCraft Solutions", expertise: ["Node.js", "Express", "MongoDB"], availability: "Mon–Fri\n10:00 AM–5:00 PM", available: true, experience: "8+ Years", completed: 8, upcoming: 2, avatar: "R", color: "#7C3AED" },
  { id: 2, name: "Priya Verma", role: "Frontend Developer", company: "CodeCraft Solutions", expertise: ["React", "Next.js", "Tailwind"], availability: "Mon–Sat\n9:00 AM–6:00 PM", available: true, experience: "6+ Years", completed: 6, upcoming: 1, avatar: "P", color: "#ec4899" },
  { id: 3, name: "Amit Patel", role: "Full Stack Developer", company: "Tech Solutions", expertise: ["JavaScript", "Node.js", "React"], availability: "Mon–Fri\n11:00 AM–7:00 PM", available: true, experience: "7+ Years", completed: 5, upcoming: 1, avatar: "A", color: "#f59e0b" },
  { id: 4, name: "Sneha Iyer", role: "DevOps Engineer", company: "CloudTech", expertise: ["AWS", "Docker", "CI/CD"], availability: "Mon–Fri\n10:00 AM–4:00 PM", available: true, experience: "5+ Years", completed: 4, upcoming: 0, avatar: "S", color: "#22c55e" },
  { id: 5, name: "Vikram Singh", role: "Data Scientist", company: "DataLabs Inc", expertise: ["Python", "ML", "TensorFlow"], availability: "Mon–Thu\n9:00 AM–5:00 PM", available: true, experience: "4+ Years", completed: 3, upcoming: 1, avatar: "V", color: "#06B6D4" },
]

const EX_COLORS = { "Node.js": "#7C3AED", "Express": "#06B6D4", "MongoDB": "#22c55e", "React": "#3b82f6", "Next.js": "#7C3AED", "Tailwind": "#06B6D4", "JavaScript": "#f59e0b", "AWS": "#f97316", "Docker": "#3b82f6", "CI/CD": "#22c55e", "Python": "#3b82f6", "ML": "#7C3AED", "TensorFlow": "#f97316" }

const ROLE_MENTOR_CONFIG = {
  "Frontend Developer": {
    primaryMentorName: "Priya Verma",
    relatedMentorNames: ["Amit Patel"],
    tagline: "UI/UX Architecture, React, Next.js & Tailwind CSS",
    color: "#ec4899",
  },
  "Backend Developer": {
    primaryMentorName: "Rahul Sharma",
    relatedMentorNames: ["Amit Patel"],
    tagline: "RESTful APIs, Node.js, Express & MongoDB Databases",
    color: "#7C3AED",
  },
  "Full Stack Developer": {
    primaryMentorName: "Amit Patel",
    relatedMentorNames: ["Priya Verma", "Rahul Sharma"],
    tagline: "End-to-End Web Systems, React & Node.js Integration",
    color: "#f59e0b",
  },
  "DevOps & Cloud Engineer": {
    primaryMentorName: "Sneha Iyer",
    relatedMentorNames: ["Rahul Sharma"],
    tagline: "AWS Cloud, Docker Containers & CI/CD Pipelines",
    color: "#22c55e",
  },
  "Data Structures & Core Engineer": {
    primaryMentorName: "Vikram Singh",
    relatedMentorNames: ["Rahul Sharma"],
    tagline: "Algorithms, Machine Learning & Computational Systems",
    color: "#06B6D4",
  },
}

const AVAILABLE_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps & Cloud Engineer",
  "Data Structures & Core Engineer",
]

function getMentorRoleDetails(mentor, internRole) {
  const cfg = ROLE_MENTOR_CONFIG[internRole] || ROLE_MENTOR_CONFIG["Frontend Developer"]
  const isPrimary = mentor.name.toLowerCase().includes(cfg.primaryMentorName.toLowerCase())
  const isRelated = cfg.relatedMentorNames.some(rn => mentor.name.toLowerCase().includes(rn.toLowerCase()))

  if (isPrimary) {
    return {
      isAvailableForRole: true,
      isPrimary: true,
      badgeText: "⭐ Primary Mentor",
      badgeColor: "#ec4899",
      statusText: `Available for ${internRole}`,
      isAvailable: true,
      priority: 1,
    }
  } else if (isRelated) {
    return {
      isAvailableForRole: true,
      isPrimary: false,
      badgeText: "Cross-Track Mentor",
      badgeColor: "#06B6D4",
      statusText: "Available for Consultations",
      isAvailable: true,
      priority: 2,
    }
  } else {
    return {
      isAvailableForRole: false,
      isPrimary: false,
      badgeText: `${mentor.role.split(" ")[0]} Track`,
      badgeColor: "#64748b",
      statusText: `Assigned to ${mentor.role} Track`,
      isAvailable: false,
      priority: 3,
    }
  }
}

export default function MentorPage() {
  const router_push = (path) => { window.location.href = path }
  const [search, setSearch] = useState("")
  const [connecting, setConnecting] = useState(null)
  const [connectedMentors, setConnectedMentors] = useState({})
  const [mentors, setMentors] = useState(MENTORS)
  const [expandedId, setExpandedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [filterMode, setFilterMode] = useState("role") // "role" or "all"
  const [newSkill, setNewSkill] = useState("")
  const [form, setForm] = useState({ name: "", role: "", company: "", experience: "", availability: "Mon–Fri\n9:00 AM–5:00 PM", expertise: [], available: true })

  // Track intern's assigned role
  const [currentRole, setCurrentRole] = useState("Frontend Developer")

  useEffect(() => {
    const syncRole = () => {
      const stored = getAssignedRole() || getUser()?.internRole || "Frontend Developer"
      setCurrentRole(stored)
    }
    syncRole()
    window.addEventListener("intern_role_updated", syncRole)
    return () => window.removeEventListener("intern_role_updated", syncRole)
  }, [])

  useEffect(() => {
    api.getMentors().then(r => {
      if (r.ok && r.data?.length) {
        setMentors(r.data.map((m, i) => ({
          id: m._id || m.id || i,
          name: m.name,
          role: m.role,
          company: m.company,
          expertise: m.expertise || [],
          availability: m.availability || "Mon–Fri\n10:00 AM–5:00 PM",
          available: m.available ?? true,
          experience: m.experience || "5+ Years",
          completed: m.sessionsCompleted || 6,
          upcoming: m.sessionsUpcoming || 1,
          avatar: (m.name || "?").charAt(0),
          color: ["#7C3AED", "#ec4899", "#f59e0b", "#22c55e", "#06B6D4"][i % 5]
        })))
      }
    }).catch(() => { })
  }, [])

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole)
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, newRole)
      window.dispatchEvent(new Event("intern_role_updated"))
    } catch { }
  }

  const connect = async (mentor) => {
    const id = mentor.id
    setConnecting(id)
    const user = getUser()
    await api.connect(id, { internId: user.id }).catch(() => { })
    setMentors(p => p.map(m => m.id === id ? { ...m, upcoming: m.upcoming + 1 } : m))
    setConnectedMentors(p => ({ ...p, [id]: true }))
    setConnecting(null)
    openMentorChat(mentor)
  }

  const openMentorChat = (mentor) => {
    const contactKey = mentor.name.toLowerCase().includes("priya") ? "priya"
      : mentor.name.toLowerCase().includes("rahul") ? "rahul"
        : mentor.name.toLowerCase().includes("amit") ? "amit"
          : mentor.name.toLowerCase().includes("sneha") ? "sneha"
            : "rahul"
    try {
      localStorage.setItem("active_chat_contact", contactKey)
    } catch { }
    router_push(`/intern/messages?contact=${contactKey}`)
  }

  const addMentor = async () => {
    if (!form.name.trim() || !form.role.trim()) return
    try {
      const apiRoot = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      await fetch(`${apiRoot}/mentors/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
    } catch { }
    setMentors(p => [...p, {
      ...form,
      id: Date.now(),
      completed: 0,
      upcoming: 0,
      avatar: form.name.charAt(0).toUpperCase(),
      color: ["#7C3AED", "#ec4899", "#f59e0b", "#22c55e", "#06B6D4"][p.length % 5]
    }])
    setForm({ name: "", role: "", company: "", experience: "", availability: "Mon–Fri\n9:00 AM–5:00 PM", expertise: [], available: true })
    setShowAdd(false)
  }

  // Calculate mentors with dynamic role details
  const mentorsWithRoleData = mentors.map(m => {
    const roleDetails = getMentorRoleDetails(m, currentRole)
    return {
      ...m,
      roleDetails,
      // The availability is dynamically dictated by the intern's assigned role!
      isAvailable: roleDetails.isAvailable,
      statusLabel: roleDetails.statusText,
    }
  }).sort((a, b) => a.roleDetails.priority - b.roleDetails.priority)

  // Filter based on search & filter mode
  const filteredMentors = mentorsWithRoleData.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.expertise.some(e => e.toLowerCase().includes(search.toLowerCase())) ||
      m.role.toLowerCase().includes(search.toLowerCase())

    if (filterMode === "role") {
      return matchesSearch && m.roleDetails.isAvailableForRole
    }
    return matchesSearch
  })

  const availableForRoleCount = mentorsWithRoleData.filter(m => m.roleDetails.isAvailableForRole).length

  const stats = {
    total: mentors.length,
    activeForRole: availableForRoleCount,
    completed: mentors.reduce((s, m) => s + m.completed, 0),
    upcoming: mentors.reduce((s, m) => s + m.upcoming, 0)
  }

  const inp = "w-full bg-[#111827] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm outline-none text-white focus:border-cyan-500 transition"

  return (
    <div className="portal-root h-screen w-full max-w-full overflow-hidden text-white flex relative">
      {/* VIDEO BACKGROUND */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="data:video/mp4;base64," type="video/mp4" />
      </video>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      {/* CONTENT */}
      <div className="relative z-10 flex w-full h-full">
        <InternSidebar active="Mentor" />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto p-6 lg:p-8 gap-6 min-w-0">

          {/* TOP HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Mentors</h1>
                <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold flex items-center gap-1.5 shadow-sm">
                  <UserCheck size={13} /> Role-Aligned Guidance
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Connect with mentors available and specialized for your internship track.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-3 text-gray-400" size={15} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search mentors or skills…"
                  className="bg-[#0f172a] border border-[#1e293b] rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none w-full sm:w-64 text-white placeholder-gray-500 focus:border-cyan-500 transition shadow-inner"
                />
              </div>
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-sm font-semibold text-white shadow-md hover:opacity-90 transition">
                <Plus size={16} /> Add Mentor
              </button>
            </div>
          </div>

          {/* ROLE ASSIGNMENT BANNER & QUICK TRACK SELECTOR */}
          <div className="bg-gradient-to-r from-purple-950/60 via-[#0f172a] to-cyan-950/50 border border-purple-500/30 rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-5 flex-shrink-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Your Assigned Intern Track</span>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300 mt-0.5">
                  {currentRole}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                  {ROLE_MENTOR_CONFIG[currentRole]?.tagline || "Specialized mentorship aligned with your role"}
                </p>
              </div>
            </div>

            {/* Quick Track Switcher Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-semibold mr-1">Switch Track:</span>
              {AVAILABLE_ROLES.map(role => {
                const isSelected = currentRole === role
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl transition font-semibold border ${isSelected
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-transparent shadow-md scale-105"
                      : "bg-[#0b1120] border-[#1e293b] text-gray-400 hover:text-white hover:border-purple-500/40"
                      }`}
                  >
                    {role.split(" ")[0]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 flex-shrink-0">
            {[
              { l: "Available for Your Role", v: stats.activeForRole, c: "#22c55e", Icon: Zap, desc: `Specialized in ${currentRole.split(" ")[0]}` },
              { l: "Total Mentors", v: stats.total, c: "#7C3AED", Icon: Users, desc: "Across all technical tracks" },
              { l: "Sessions Completed", v: stats.completed, c: "#06B6D4", Icon: Calendar, desc: "Logged mentorship syncs" },
              { l: "Upcoming Sessions", v: stats.upcoming, c: "#f59e0b", Icon: Clock, desc: "Scheduled milestone reviews" }
            ].map((s, i) => (
              <div key={i} className="bg-[#0f172a]/90 backdrop-blur-md border border-[#1e293b] rounded-2xl p-5 hover:border-purple-500/30 transition shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-semibold">{s.l}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.c + "20" }}>
                    <s.Icon size={16} style={{ color: s.c }} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold" style={{ color: s.c }}>{s.v}</div>
                <p className="text-xs text-gray-400 mt-1 truncate">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
            <div className="flex bg-[#0f172a] border border-[#1e293b] rounded-xl p-1 gap-1">
              <button
                onClick={() => setFilterMode("role")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${filterMode === "role"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                <Sparkles size={14} />
                <span>Available for {currentRole} ({availableForRoleCount})</span>
              </button>
              <button
                onClick={() => setFilterMode("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${filterMode === "all"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                <Users size={14} />
                <span>All Mentors ({mentors.length})</span>
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Showing <span className="text-white font-bold">{filteredMentors.length}</span> mentor{filteredMentors.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* MENTORS LIST (Independently scrollable & responsive) */}
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1 pb-6 min-h-[350px]">
            {filteredMentors.map(m => {
              const isAvailable = m.roleDetails.isAvailableForRole
              const isPrimary = m.roleDetails.isPrimary
              const isConnected = !!connectedMentors[m.id]
              const isExpanded = expandedId === m.id

              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-lg flex flex-col gap-4 ${isPrimary
                      ? "bg-[#0f172a]/95 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/30"
                      : isAvailable
                        ? "bg-[#0f172a]/90 border-purple-500/30 hover:border-purple-400/60"
                        : "bg-[#0b1120]/80 border-[#1e293b] opacity-90 hover:opacity-100"
                    }`}
                >
                  {/* Top Row: Mentor Avatar, Name, Company, Role, Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-13 h-13 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0 relative shadow-md"
                        style={{ background: m.color + "33", color: m.color }}
                      >
                        {m.avatar}
                        {isAvailable && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#0f172a] shadow-sm"></span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-white truncate">{m.name}</h3>
                          {isPrimary && (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-sm">
                              ⭐ Primary Mentor
                            </span>
                          )}
                          {!isPrimary && isAvailable && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              Role Aligned
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-300 font-medium mt-0.5">
                          {m.role} &bull; <span className="text-gray-400">{m.company}</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 self-start sm:self-center flex-shrink-0">
                      <button
                        onClick={() => connect(m)}
                        disabled={connecting === m.id || isConnected}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${isConnected
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : isAvailable
                              ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:brightness-110 shadow-purple-600/20"
                              : "bg-[#1e293b] text-gray-300 hover:text-white border border-[#334155]"
                          }`}
                      >
                        {connecting === m.id ? "Connecting…" : isConnected ? "Connected ✓" : isAvailable ? "Connect" : "Request Sync"}
                      </button>

                      <button
                        onClick={() => openMentorChat(m)}
                        className="w-9 h-9 rounded-xl bg-[#111827] border border-[#1e293b] flex items-center justify-center hover:bg-[#1e293b] hover:border-cyan-500/40 text-gray-300 hover:text-cyan-400 transition shadow-sm cursor-pointer"
                        title={`Message ${m.name}`}
                      >
                        <MessageSquare size={16} />
                      </button>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : m.id)}
                        className="px-3 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs font-medium text-gray-400 hover:text-white transition cursor-pointer"
                      >
                        {isExpanded ? "Hide Details" : "Details"}
                      </button>
                    </div>
                  </div>

                  {/* Middle Row: Tech Stack, Availability, Experience, Sessions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3.5 border-t border-[#1e293b]/70 text-xs">
                    <div>
                      <span className="text-gray-400 text-[11px] font-semibold block mb-1.5">Tech Specialization:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.expertise.map(e => (
                          <span
                            key={e}
                            className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold"
                            style={{ background: (EX_COLORS[e] || "#7C3AED") + "22", color: EX_COLORS[e] || "#7C3AED" }}
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[11px] font-semibold block mb-1">Availability Hours:</span>
                      <span className="text-gray-200 font-medium whitespace-pre-line leading-relaxed">{m.availability}</span>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 md:text-right">
                      <div>
                        <span className="text-gray-400 text-[11px] font-semibold block mb-0.5">Experience:</span>
                        <span className="text-white font-bold">{m.experience}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[11px] font-semibold block mb-0.5">Milestones:</span>
                        <span className="text-cyan-300 font-bold">{m.completed} Completed &bull; {m.upcoming} Upcoming</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-3.5 border-t border-[#1e293b] text-xs">
                      <div className="bg-[#0b1120] p-4 rounded-xl border border-[#1e293b]">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Mentor Overview</p>
                        <p className="text-gray-300 leading-relaxed">
                          {m.name} is a {m.role} at {m.company} with {m.experience} of industry experience guiding intern engineering cohorts.
                        </p>
                      </div>
                      <div className="bg-[#0b1120] p-4 rounded-xl border border-[#1e293b]">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Role Track Guidance</p>
                        <p className="text-cyan-300 leading-relaxed font-medium">
                          {isPrimary ? "⭐ Assigned as your primary direct mentor." : isAvailable ? "💡 Available for cross-track reviews & consultations." : "Assigned primarily to other intern cohorts."}
                        </p>
                      </div>
                      <div className="bg-[#0b1120] p-4 rounded-xl border border-[#1e293b]">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Track Record</p>
                        <p className="text-gray-300 leading-relaxed">
                          Conducted {m.completed + m.upcoming} mentorship sessions with consistent positive intern ratings.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {filteredMentors.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm bg-[#0f172a]/60 rounded-2xl border border-[#1e293b]">
                No mentors match the selected criteria. Try adjusting your search or switching to "All Mentors".
              </div>
            )}
          </div>
        </main>

        {/* ADD MENTOR MODAL */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold flex items-center gap-2">
                  <Plus size={18} className="text-cyan-400" /> Add New Mentor
                </span>
                <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-xl hover:bg-white/10 transition"><X size={18} className="text-gray-400 hover:text-white" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { l: "Full Name *", k: "name", p: "e.g. Rahul Sharma" },
                  { l: "Role *", k: "role", p: "e.g. Frontend Developer" },
                  { l: "Company", k: "company", p: "e.g. CodeCraft Solutions" },
                  { l: "Experience", k: "experience", p: "e.g. 5+ Years" }
                ].map(f => (
                  <div key={f.k}>
                    <label className="text-xs font-semibold text-gray-300 block mb-1.5">{f.l}</label>
                    <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.p} className={inp} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Availability</label>
                  <textarea rows={2} value={form.availability} onChange={e => setForm(p => ({ ...p, availability: e.target.value }))} className={`${inp} resize-none`} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-2">Skills / Expertise</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.expertise.map(s => (
                      <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600/20 border border-purple-600/30 text-purple-300 text-xs font-semibold">
                        {s}<button onClick={() => setForm(p => ({ ...p, expertise: p.expertise.filter(x => x !== s) }))} className="ml-1"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && newSkill.trim() && (setForm(p => ({ ...p, expertise: [...p.expertise, newSkill.trim()] })), setNewSkill(""))}
                      placeholder="Add skill…"
                      className={`${inp} flex-1`}
                    />
                    <button onClick={() => newSkill.trim() && (setForm(p => ({ ...p, expertise: [...p.expertise, newSkill.trim()] })), setNewSkill(""))} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-sm font-semibold text-white">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-[#111827] rounded-2xl px-4 py-3 border border-[#1e293b]">
                  <span className="text-sm font-medium text-white">Currently Available</span>
                  <button onClick={() => setForm(p => ({ ...p, available: !p.available }))} className="w-10 h-6 rounded-full relative border-none cursor-pointer" style={{ background: form.available ? "linear-gradient(135deg,#7C3AED,#06B6D4)" : "rgba(255,255,255,0.1)" }}>
                    <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm" style={{ left: form.available ? "calc(100% - 22px)" : "2px" }} />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl bg-[#111827] border border-[#1e293b] text-sm font-semibold text-gray-400 hover:text-white transition">Cancel</button>
                <button onClick={addMentor} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-sm font-bold text-white flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 transition"><Save size={14} /> Add Mentor</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
