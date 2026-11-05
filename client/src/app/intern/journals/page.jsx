"use client"
import { useState, useEffect, useRef } from "react"
import InternSidebar from "../../../lib/internSidebar"
import {
  Search, Plus, X, Download, Paperclip, Send, CheckCircle2,
  Code2, Lightbulb, AlertTriangle, Compass, Calendar, ChevronDown,
  ChevronUp, Edit, Clock, Sparkles, FileText, Check, Eye, EyeOff,
  User, MessageSquare, ArrowRight, ShieldCheck
} from "lucide-react"
import { api, getUser, getInternUser } from "../../../lib/api"
import { appendSubmission } from "../../../lib/evaluationSync"

// Generate initial journals with genuine dynamic dates
function getInitialJournals() {
  const d0 = new Date()
  const d1 = new Date(); d1.setDate(d0.getDate() - 1)
  const d2 = new Date(); d2.setDate(d0.getDate() - 2)
  const d3 = new Date(); d3.setDate(d0.getDate() - 3)
  const d4 = new Date(); d4.setDate(d0.getDate() - 4)

  const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })

  return [
    {
      id: 1,
      date: fmt(d0),
      label: "Today",
      title: "Integrated Login API & JWT Middleware",
      workedOn: "Integrated the user login API with JWT authentication. Implemented token validation and secure route authorization.",
      learned: "Understood token expiration cycles, refresh token rotation, and bearer header verification patterns.",
      challenges: "Configuring CORS headers for preflight OPTIONS requests.",
      tomorrow: "Complete password reset workflow and error interceptors.",
      attachment: { name: "auth_flow.png", size: "420 KB" },
      comment: { text: "Great work! Error handling is clean and robust. Keep it up.", mentor: "Rahul Sharma", time: `${fmt(d0)} • 11:30 AM` }
    },
    {
      id: 2,
      date: fmt(d1),
      label: "Yesterday",
      title: "Role-Based Route Protection",
      workedOn: "Created protected route guards for Intern, Mentor, and Admin dashboards with automatic redirects.",
      learned: "Learned Next.js App Router middleware and client session storage synchronization.",
      challenges: "Preventing client-side flicker on unauthorized route access.",
      tomorrow: "Build the database schema for user profiles.",
      attachment: null,
      comment: null
    },
    {
      id: 3,
      date: fmt(d2),
      label: "2 days ago",
      title: "MongoDB Schema & Index Design",
      workedOn: "Designed MongoDB collections for interns, attendance logs, and journals with indexing on userId.",
      learned: "Understood compound indexes and performance optimization for frequent date queries.",
      challenges: "Balancing embedded subdocuments versus normalized references.",
      tomorrow: "Implement REST CRUD endpoints in Flask.",
      attachment: null,
      comment: { text: "Schema looks solid. Make sure to index the date field as well.", mentor: "Priya Verma", time: `${fmt(d2)} • 04:15 PM` }
    },
    {
      id: 4,
      date: fmt(d3),
      label: "3 days ago",
      title: "Swagger & OpenAPI Documentation",
      workedOn: "Documented authentication and attendance REST endpoints using OpenAPI standards and interactive Swagger UI.",
      learned: "Best practices for writing self-describing API specifications with request/response schemas.",
      challenges: "Describing polymorphic error response models.",
      tomorrow: "Write unit tests for authentication routes.",
      attachment: null,
      comment: null
    },
    {
      id: 5,
      date: fmt(d4),
      label: "4 days ago",
      title: "Unit Testing with PyTest & Jest",
      workedOn: "Wrote automated unit test cases for token generation, password hashing, and input validation.",
      learned: "Mocking external services and test fixtures in modern test runners.",
      challenges: "Simulating expired JWT tokens without waiting for real timeouts.",
      tomorrow: "Integrate continuous testing in the build pipeline.",
      attachment: null,
      comment: null
    }
  ]
}

export default function JournalsPage() {
  const [journals, setJournals] = useState(() => getInitialJournals())
  const [selected, setSelected] = useState(() => getInitialJournals()[0])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showExtraDetails, setShowExtraDetails] = useState(false)
  const [editJ, setEditJ] = useState(null)
  const [journalFile, setJournalFile] = useState(null)
  const journalFileRef = useRef(null)
  const [newJ, setNewJ] = useState({ title: "", workedOn: "", learned: "", challenges: "", tomorrow: "" })
  const [sentIds, setSentIds] = useState(new Set())
  const [sentSubmissions, setSentSubmissions] = useState({})
  const [mentorComments, setMentorComments] = useState([])

  const openEdit = () => {
    if (!selected) return
    setEditJ({ ...selected })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editJ.title.trim() || !editJ.workedOn.trim()) {
      alert("Title and 'What I worked on' are required.")
      return
    }
    const user = getInternUser()
    const payload = {
      title: editJ.title,
      workedOn: editJ.workedOn,
      learned: editJ.learned,
      challenges: editJ.challenges,
      tomorrowPlan: editJ.tomorrow,
      date: editJ.date,
      userId: user.id,
    }
    try {
      await api.updateJournal(editJ.id, payload)
    } catch {}

    setJournals(prev => prev.map(j => (j.id === editJ.id ? editJ : j)))
    setSelected(editJ)
    setShowEditModal(false)
  }

  useEffect(() => {
    const user = getUser()
    api.getJournals(user.id).then(r => {
      if (r.ok && r.data?.length) {
        const mapped = r.data.map(j => ({
          id: j._id || j.id,
          date: j.date || "",
          label: "Saved",
          title: j.title || "",
          workedOn: j.workedOn || "",
          learned: j.learned || "",
          challenges: j.challenges || "",
          tomorrow: j.tomorrowPlan || j.tomorrow || "",
          attachment: null,
          comment: j.mentorComment || null
        }))
        setJournals(mapped)
        if (mapped.length) setSelected(mapped[0])
      }
    }).catch(() => {})

    // Load sent submissions from local storage
    try {
      const subs = JSON.parse(localStorage.getItem("internSubmissions") || "[]")
      const map = {}
      subs.filter(s => s.type === "journal").forEach(s => { map[s.journalId || s.id] = s })
      setSentSubmissions(map)
      const ids = new Set(subs.filter(s => s.type === "journal").map(s => Number(s.journalId) || s.journalId))
      setSentIds(ids)
    } catch {}

    // Poll mentor comments
    const pollComments = () => {
      try {
        const comments = JSON.parse(localStorage.getItem("mentorComments") || "[]")
        if (!comments.length) return
        setMentorComments(comments)
        setJournals(prev => prev.map(j => {
          const mc = comments.find(c =>
            c.journalTitle &&
            (c.journalTitle.toLowerCase() === j.title?.toLowerCase() ||
             j.title?.toLowerCase().includes(c.journalTitle?.toLowerCase()))
          )
          if (mc && (!j.comment || j.comment.text !== mc.text)) {
            return { ...j, comment: { text: mc.text, mentor: mc.mentor, time: mc.time } }
          }
          return j
        }))
        setSelected(prev => {
          if (!prev) return prev
          const mc = comments.find(c =>
            c.journalTitle &&
            (c.journalTitle.toLowerCase() === prev.title?.toLowerCase() ||
             prev.title?.toLowerCase().includes(c.journalTitle?.toLowerCase()))
          )
          if (mc && (!prev.comment || prev.comment.text !== mc.text)) {
            return { ...prev, comment: { text: mc.text, mentor: mc.mentor, time: mc.time } }
          }
          return prev
        })
      } catch {}
    }
    pollComments()
    const id = setInterval(pollComments, 1500)
    return () => clearInterval(id)
  }, [])

  const filtered = journals.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.workedOn.toLowerCase().includes(search.toLowerCase()) ||
    j.learned.toLowerCase().includes(search.toLowerCase())
  )

  const sendToMentor = (journal) => {
    const user = getInternUser()
    const sub = appendSubmission({
      id: `journal-${journal.id}-${Date.now()}`,
      journalId: String(journal.id),
      intern: user.fullName || "Intern",
      internUserId: user.id || "",
      task: `Journal: ${journal.title}`,
      file: `journal_${journal.title.replace(/\s+/g, "_").toLowerCase()}.pdf`,
      fileSize: "—",
      submittedOn: journal.date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      status: "Pending Review",
      comments: `Worked on: ${journal.workedOn?.slice(0, 100)}`,
      type: "journal",
    })
    setSentIds(p => new Set([...p, journal.id]))
    setSentSubmissions(p => ({ ...p, [String(journal.id)]: sub }))
  }

  const handleAdd = async () => {
    if (!newJ.title.trim() || !newJ.workedOn.trim()) {
      alert("Please enter a title and description of what you worked on.")
      return
    }
    const user = getInternUser()
    const now = new Date()
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    const payload = {
      title: newJ.title,
      workedOn: newJ.workedOn,
      learned: newJ.learned || "Continued progress on milestone modules.",
      challenges: newJ.challenges || "None reported.",
      tomorrowPlan: newJ.tomorrow || "Proceed with next sprint deliverable.",
      date: dateStr,
      userId: user.id
    }
    const r = await api.createJournal(payload)
    const newId = r.ok ? (r.data.id || Date.now()) : Date.now()
    const j = {
      ...payload,
      id: newId,
      label: "Today",
      attachment: journalFile ? { name: journalFile.name, size: `${(journalFile.size / 1024).toFixed(0)} KB` } : null,
      comment: null
    }
    setJournals(p => [j, ...p])
    setSelected(j)
    setShowModal(false)
    setNewJ({ title: "", workedOn: "", learned: "", challenges: "", tomorrow: "" })
    setJournalFile(null)
  }

  const getFeedbackStatus = (j) => {
    if (j.comment || mentorComments.find(c => c.journalTitle === j.title)) {
      const mc = j.comment || mentorComments.find(c => c.journalTitle === j.title)
      return { text: `Reviewed by ${mc.mentor || "Mentor"}`, color: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)" }
    }
    if (sentIds.has(j.id) || sentSubmissions[String(j.id)]) {
      return { text: "Pending Review", color: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)" }
    }
    return { text: "Draft / Not Sent", color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" }
  }

  return (
    <div className="portal-root h-screen w-full max-w-full overflow-hidden text-white flex relative bg-[#020617]">
      {/* Background glow effects */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* CONTENT */}
      <div className="relative z-10 flex w-full h-full min-w-0">
        <InternSidebar active="Journals" />

        {/* LEFT COLUMN: INDEPENDENTLY SCROLLABLE COMPACT JOURNAL LIST */}
        <div className="w-80 sm:w-96 min-w-[320px] bg-[#070B1A]/95 border-r border-[#1e293b] flex flex-col flex-shrink-0 h-screen">
          {/* Header with Title & New Journal Button */}
          <div className="p-5 border-b border-[#1e293b] flex-shrink-0 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Journals
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  {journals.length}
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Daily work & mentor feedback</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold flex items-center gap-1.5 text-white hover:brightness-110 transition shadow-md shadow-purple-600/20 cursor-pointer flex-shrink-0"
            >
              <Plus size={15} /> New Journal
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-[#1e293b] flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, work, or learning…"
                className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 outline-none focus:border-cyan-500/50 transition shadow-inner"
              />
            </div>
          </div>

          {/* Clean Compact Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {filtered.map(j => {
              const isSelected = selected?.id === j.id
              const isSent = sentIds.has(j.id) || Boolean(sentSubmissions[String(j.id)])
              const fbStatus = getFeedbackStatus(j)

              return (
                <div
                  key={j.id}
                  onClick={() => setSelected(j)}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer flex flex-col gap-2.5 ${
                    isSelected
                      ? "bg-purple-950/20 border-cyan-400/70 shadow-[0_0_18px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/40"
                      : "bg-[#0f172a]/80 border-[#1e293b] hover:bg-[#111827] hover:border-[#334155]"
                  }`}
                >
                  {/* Row 1: Date & Feedback Status Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs text-purple-300 font-semibold flex items-center gap-1.5">
                      <Calendar size={13} className="text-purple-400" /> {j.date}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: fbStatus.bg, color: fbStatus.color, border: `1px solid ${fbStatus.border}` }}
                    >
                      {fbStatus.text}
                    </span>
                  </div>

                  {/* Row 2: Project / Task Title */}
                  <h3 className="text-sm font-bold text-white line-clamp-1">{j.title}</h3>

                  {/* Row 3: Short Work Description (Maximum 2 lines) */}
                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    <strong className="text-gray-400 font-semibold">Work: </strong>
                    {j.workedOn || "No work details entered."}
                  </p>

                  {/* Row 4: Learning Summary (Maximum 2 lines) */}
                  <p className="text-xs text-cyan-300/90 line-clamp-2 leading-relaxed">
                    <strong className="text-cyan-400 font-semibold">Learned: </strong>
                    {j.learned || "Core engineering concepts and implementation."}
                  </p>

                  {/* Row 5: Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1e293b]/60 mt-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(j) }}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      View Details <ArrowRight size={13} />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); sendToMentor(j) }}
                      disabled={isSent}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        isSent
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 cursor-default"
                          : "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:brightness-110 shadow-sm"
                      }`}
                    >
                      {isSent ? (
                        <><CheckCircle2 size={13} /> Sent</>
                      ) : (
                        <><Send size={13} /> Send to Mentor</>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SINGLE SELECTED JOURNAL DETAILS VIEW */}
        {selected ? (
          <div className="flex-1 flex flex-col h-screen overflow-y-auto p-6 lg:p-8 space-y-6 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#1e293b] gap-4 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold bg-purple-600/20 border border-purple-500/30 px-3 py-1 rounded-full">
                    <Calendar size={13} /> {selected.date}
                  </span>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={getFeedbackStatus(selected)}
                  >
                    {getFeedbackStatus(selected).text}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{selected.title}</h2>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={openEdit}
                  className="px-3.5 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#111827] flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Edit size={14} /> Edit
                </button>

                <button
                  onClick={() => sendToMentor(selected)}
                  disabled={sentIds.has(selected.id) || Boolean(sentSubmissions[String(selected.id)])}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md cursor-pointer ${
                    sentIds.has(selected.id) || Boolean(sentSubmissions[String(selected.id)])
                      ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 cursor-default"
                      : "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:brightness-110 shadow-purple-600/20"
                  }`}
                >
                  {sentIds.has(selected.id) || Boolean(sentSubmissions[String(selected.id)]) ? (
                    <><CheckCircle2 size={14} /> Sent to Mentor</>
                  ) : (
                    <><Send size={14} /> Send to Mentor</>
                  )}
                </button>
              </div>
            </div>

            {/* Core Section 1: Work Accomplished */}
            <div className="rounded-2xl p-5 bg-[#0f172a]/90 border border-cyan-500/25 shadow-lg">
              <div className="flex items-center gap-3 mb-3 pb-2.5 border-b border-[#1e293b]">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                  <Code2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Work Accomplished</h3>
                  <p className="text-xs text-gray-400">Core engineering output completed today</p>
                </div>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line font-normal">
                {selected.workedOn || "No work details provided."}
              </p>
            </div>

            {/* Core Section 2: Key Learnings & Takeaways */}
            <div className="rounded-2xl p-5 bg-[#0f172a]/90 border border-purple-500/25 shadow-lg">
              <div className="flex items-center gap-3 mb-3 pb-2.5 border-b border-[#1e293b]">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Key Learnings & Takeaways</h3>
                  <p className="text-xs text-gray-400">Concepts, patterns and technologies acquired</p>
                </div>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line font-normal">
                {selected.learned || "No learnings recorded for this entry."}
              </p>
            </div>

            {/* Expandable Section: Challenges & Tomorrow's Plan */}
            <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a]/60 overflow-hidden shadow-sm">
              <button
                onClick={() => setShowExtraDetails(prev => !prev)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#111827] transition cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-gray-300">
                  <Compass size={16} className="text-emerald-400" />
                  <span>Additional Details (Blockers & Next Day Priorities)</span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-[#111827] border border-[#1e293b] flex items-center justify-center text-gray-400">
                  {showExtraDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              {showExtraDetails && (
                <div className="p-4 pt-0 space-y-4 border-t border-[#1e293b]">
                  <div className="mt-3">
                    <p className="text-xs font-bold text-pink-400 mb-1 flex items-center gap-1.5">
                      <AlertTriangle size={13} /> Challenges & Blockers Encountered:
                    </p>
                    <p className="text-xs sm:text-sm text-gray-300 pl-5 leading-relaxed">
                      {selected.challenges || "No blockers reported."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <Compass size={13} /> Tomorrow's Action Plan:
                    </p>
                    <p className="text-xs sm:text-sm text-gray-300 pl-5 leading-relaxed">
                      {selected.tomorrow || "Continue with assigned sprint tasks."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Mentor Feedback Section */}
            {(selected.comment || mentorComments.find(c => c.journalTitle === selected.title)) ? (
              (() => {
                const mc = selected.comment || mentorComments.find(c => c.journalTitle === selected.title)
                return (
                  <div className="bg-gradient-to-r from-purple-950/30 to-cyan-950/30 border border-purple-500/40 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#1e293b]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-black text-white">
                          {(mc.mentor || "M").charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{mc.mentor || "Assigned Mentor"}</p>
                          <p className="text-[10px] text-purple-300 font-medium">Verified Mentor Review</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">{mc.time}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic">
                      "{mc.text}"
                    </p>
                  </div>
                )
              })()
            ) : (
              <div className="bg-[#0f172a]/50 border border-dashed border-[#1e293b] rounded-2xl p-5 flex items-center justify-between gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2.5">
                  <Clock size={16} className="text-yellow-400/80" />
                  <span>
                    {sentIds.has(selected.id)
                      ? "Submitted to mentor — awaiting review and evaluation remarks."
                      : "Draft journal entry — click 'Send to Mentor' to request feedback."}
                  </span>
                </div>
                {!sentIds.has(selected.id) && (
                  <button
                    onClick={() => sendToMentor(selected)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 font-semibold cursor-pointer transition flex-shrink-0"
                  >
                    Send Now
                  </button>
                )}
              </div>
            )}

            {/* Attachments (if any) */}
            {selected.attachment && (
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400">
                    <Paperclip size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{selected.attachment.name}</p>
                    <p className="text-[10px] text-gray-400">{selected.attachment.size}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const blob = new Blob([`Attachment: ${selected.attachment.name}`], { type: "text/plain" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = selected.attachment.name
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1e293b] text-xs font-medium text-gray-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download size={13} /> Download
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Select a journal from the list to view its full details.
          </div>
        )}
      </div>

      {/* NEW JOURNAL MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#070B1A] border border-cyan-500/30 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#1e293b] bg-[#0a1026] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white">
                  <Plus size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">New Daily Journal</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">Project / Task Title *</label>
                <input
                  value={newJ.title}
                  onChange={e => setNewJ({ ...newJ, title: e.target.value })}
                  placeholder="e.g. Completed User Authentication API"
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">What I Worked On *</label>
                <textarea
                  rows={3}
                  value={newJ.workedOn}
                  onChange={e => setNewJ({ ...newJ, workedOn: e.target.value })}
                  placeholder="Summarize the core engineering work done today..."
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">What I Learned</label>
                <textarea
                  rows={2}
                  value={newJ.learned}
                  onChange={e => setNewJ({ ...newJ, learned: e.target.value })}
                  placeholder="Key concepts, architecture patterns, or tools explored..."
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">Challenges / Blockers (Optional)</label>
                <input
                  value={newJ.challenges}
                  onChange={e => setNewJ({ ...newJ, challenges: e.target.value })}
                  placeholder="Any tricky bugs or configuration blockers..."
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">Tomorrow's Plan (Optional)</label>
                <input
                  value={newJ.tomorrow}
                  onChange={e => setNewJ({ ...newJ, tomorrow: e.target.value })}
                  placeholder="Next planned milestones..."
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div className="p-5 border-t border-[#1e293b] bg-[#0a1026] flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold text-white hover:brightness-110 shadow-md transition cursor-pointer"
              >
                Save Journal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editJ && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#070B1A] border border-cyan-500/30 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#1e293b] bg-[#0a1026] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                  <Edit size={18} />
                </div>
                <h3 className="text-lg font-bold text-white">Edit Journal Entry</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">Title *</label>
                <input
                  value={editJ.title}
                  onChange={e => setEditJ({ ...editJ, title: e.target.value })}
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">What I Worked On *</label>
                <textarea
                  rows={3}
                  value={editJ.workedOn}
                  onChange={e => setEditJ({ ...editJ, workedOn: e.target.value })}
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 text-xs sm:text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">What I Learned</label>
                <textarea
                  rows={2}
                  value={editJ.learned}
                  onChange={e => setEditJ({ ...editJ, learned: e.target.value })}
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 text-xs sm:text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">Challenges</label>
                <input
                  value={editJ.challenges || ""}
                  onChange={e => setEditJ({ ...editJ, challenges: e.target.value })}
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">Tomorrow's Plan</label>
                <input
                  value={editJ.tomorrow || ""}
                  onChange={e => setEditJ({ ...editJ, tomorrow: e.target.value })}
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="p-5 border-t border-[#1e293b] bg-[#0a1026] flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold text-white hover:brightness-110 shadow-md transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}