"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import InternSidebar from "../../../lib/internSidebar"
import { getInternUser, resolveInternName, getInternPhoto, DEFAULT_INTERN_AVATAR } from "../../../lib/api"
import { getAssignedRole } from "../../../lib/assessmentData"
import {
  getSaved15DayTests,
  getSavedWeeklyFeedback,
  getMentorForRole,
  KEY_15_DAY_TESTS,
  KEY_WEEKLY_FEEDBACK,
} from "../../../lib/milestoneTestAndFeedback"
import MilestoneTestModal from "../../../components/MilestoneTestModal"
import {
  Star, Award, Calendar, CheckCircle2, ChevronDown, ChevronUp,
  MessageSquare, User, Clock, ArrowRight, ShieldCheck, Sparkles,
  TrendingUp, FileText, CheckCircle
} from "lucide-react"

export default function InternEvaluationPage() {
  const router = useRouter()
  const [user, setUser] = useState({})
  const [assignedRole, setAssignedRole] = useState("Backend Developer")
  const [tests15Day, setTests15Day] = useState([])
  const [weeklyFeedback, setWeeklyFeedback] = useState([])
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [expandedFeedbackId, setExpandedFeedbackId] = useState(null)

  const loadData = () => {
    try {
      const u = getInternUser()
      setUser(u)
      const role = getAssignedRole(u) || localStorage.getItem("intern_assigned_role") || "Backend Developer"
      setAssignedRole(role)

      const tests = getSaved15DayTests(u, role)
      setTests15Day(tests)

      const feedback = getSavedWeeklyFeedback(u, role)
      setWeeklyFeedback(feedback)
    } catch (e) {
      console.error("Evaluation load error:", e)
    }
  }

  useEffect(() => {
    loadData()
    const onStorage = (e) => {
      if (e.key === KEY_15_DAY_TESTS || e.key === KEY_WEEKLY_FEEDBACK) {
        loadData()
      }
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener(KEY_15_DAY_TESTS, loadData)
    window.addEventListener(KEY_WEEKLY_FEEDBACK, loadData)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(KEY_15_DAY_TESTS, loadData)
      window.removeEventListener(KEY_WEEKLY_FEEDBACK, loadData)
    }
  }, [])

  const mentor = getMentorForRole(assignedRole)
  const sprint1Test = tests15Day.find((t) => t.sprintNumber === 1) || tests15Day[0] || null

  // Calculate dynamic next evaluation date (e.g. next Friday at 3:00 PM)
  const getNextEvaluationDate = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = (5 - day + 7) % 7 || 7 // Next Friday
    d.setDate(d.getDate() + diff)
    return {
      formatted: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      daysRemaining: diff,
      time: "03:00 PM"
    }
  }
  const nextEval = getNextEvaluationDate()

  const toggleFeedbackExpand = (id) => {
    setExpandedFeedbackId(prev => (prev === id ? null : id))
  }

  return (
    <div className="portal-root h-screen w-full max-w-full overflow-hidden text-white flex relative bg-[#020617]">
      {/* Background glow effects */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* CONTENT */}
      <div className="relative z-10 flex w-full h-full min-w-0">
        <InternSidebar active="Evaluation" />

        <main className="flex-1 flex flex-col h-screen overflow-y-auto p-5 sm:p-7 lg:p-9 gap-6 min-w-0 custom-scrollbar">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-5 flex-shrink-0">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Performance Evaluation</h1>
                <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck size={14} /> Verified Evaluation Record
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Official milestone performance rating, mentor evaluations, and upcoming review schedule.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto bg-[#0f172a] border border-[#1e293b] px-3.5 py-2 rounded-2xl shadow-sm">
              <span className="text-xs text-gray-400 font-medium">Specialization:</span>
              <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                {assignedRole}
              </span>
            </div>
          </div>

          {/* 6 ESSENTIAL EVALUATION SECTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* 1. OVERALL PERFORMANCE RATING (Span 7) */}
            <div className="lg:col-span-7 bg-[#0f172a]/95 border border-cyan-500/25 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <Award size={24} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">1. Overall Performance Rating</h2>
                    <p className="text-xs text-gray-400">Comprehensive internship performance benchmark</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Grade A+ (Distinction)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-3">
                <div className="p-4 rounded-2xl bg-[#070B1A] border border-[#1e293b] text-center">
                  <div className="text-3xl sm:text-4xl font-black text-cyan-400">4.8 <span className="text-lg text-gray-400 font-normal">/ 5.0</span></div>
                  <div className="text-xs text-gray-400 font-semibold uppercase mt-1 tracking-wider">Overall Score</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#070B1A] border border-[#1e293b] text-center">
                  <div className="text-3xl sm:text-4xl font-black text-purple-400">92%</div>
                  <div className="text-xs text-gray-400 font-semibold uppercase mt-1 tracking-wider">Completion Rate</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#070B1A] border border-[#1e293b] text-center">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400">18 / 24</div>
                  <div className="text-xs text-gray-400 font-semibold uppercase mt-1 tracking-wider">Tasks Delivered</div>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="mt-2 pt-3 border-t border-[#1e293b]">
                <div className="flex items-center justify-between text-xs text-gray-300 mb-1.5 font-medium">
                  <span>Internship Curriculum Milestone Progress</span>
                  <span className="text-cyan-400 font-bold">92% on track</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full w-[92%]" />
                </div>
              </div>
            </div>

            {/* 3. MENTOR PERFORMANCE RATING (Span 5) */}
            <div className="lg:col-span-5 bg-[#0f172a]/95 border border-purple-500/25 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                    <Star size={22} className="fill-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">3. Mentor Performance Rating</h2>
                    <p className="text-xs text-gray-400">Evaluated on technical & soft skills</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                  ⭐ Top 10%
                </span>
              </div>

              <div className="space-y-2.5 my-2">
                {[
                  { label: "Code Architecture & Logic", score: "4.9 / 5.0", pct: 98 },
                  { label: "Problem Solving & Speed", score: "4.8 / 5.0", pct: 96 },
                  { label: "Daily Journals & Communication", score: "4.7 / 5.0", pct: 94 },
                  { label: "Task Consistency & Attendance", score: "4.9 / 5.0", pct: 98 },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#070B1A] p-2.5 px-3.5 rounded-xl border border-[#1e293b] flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-medium">{item.label}</span>
                    <span className="text-purple-300 font-bold">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 15-DAY SKILL TEST PERFORMANCE (Span 6) */}
            <div className="lg:col-span-6 bg-[#0f172a]/90 border border-[#1e293b] hover:border-cyan-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">2. 15-Day Skill Test Performance</h2>
                    <p className="text-xs text-gray-400">Sprint 1 Technical Knowledge Benchmark</p>
                  </div>
                </div>
                {sprint1Test?.completed ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Completed
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-semibold">
                    Ready to Take
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#070B1A] border border-[#1e293b] flex items-center justify-between gap-4 my-2">
                <div>
                  <div className="text-2xl font-black text-white">
                    {sprint1Test?.completed ? `${sprint1Test.score}%` : "90%"}
                    <span className="text-xs text-gray-400 font-normal ml-2">Score</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {sprint1Test?.completed
                      ? `Accuracy: ${sprint1Test.correctAnswers}/${sprint1Test.totalQuestions} Questions Correct`
                      : "18 / 20 Correct Answers (Sprint 1 Milestone)"}
                  </p>
                </div>
                <button
                  onClick={() => setIsTestModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:brightness-110 shadow-md cursor-pointer transition flex-shrink-0"
                >
                  {sprint1Test?.completed ? "Retake Test" : "Start Test"}
                </button>
              </div>
            </div>

            {/* 4. ASSIGNED MENTOR (Span 6) */}
            <div className="lg:col-span-6 bg-[#0f172a]/90 border border-[#1e293b] hover:border-purple-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                    <User size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">4. Assigned Mentor</h2>
                    <p className="text-xs text-gray-400">Direct technical guide for {assignedRole}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  Primary Mentor
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#070B1A] border border-[#1e293b] flex items-center justify-between gap-4 my-2">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-lg font-black text-white shadow-md flex-shrink-0">
                    {mentor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{mentor.name}</p>
                    <p className="text-xs text-gray-400">{mentor.role} &bull; {mentor.company}</p>
                    <p className="text-[11px] text-cyan-300/80 font-mono mt-0.5">{mentor.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/intern/messages")}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#111827] border border-[#1e293b] text-gray-200 hover:text-white hover:border-cyan-500/40 transition flex items-center gap-1.5 cursor-pointer shadow-sm flex-shrink-0"
                >
                  <MessageSquare size={13} /> Message
                </button>
              </div>
            </div>

            {/* 5. WEEKLY MENTOR FEEDBACK (Span 8) */}
            <div className="lg:col-span-8 bg-[#0f172a]/95 border border-[#1e293b] rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e293b]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">5. Weekly Mentor Feedback</h2>
                    <p className="text-xs text-gray-400">Summarized in 1–2 lines with expandable details</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {weeklyFeedback.length} Weekly Reviews Logged
                </span>
              </div>

              <div className="space-y-3.5">
                {weeklyFeedback.slice(0, 3).map((item) => {
                  const isExpanded = expandedFeedbackId === item.id
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#070B1A] border border-[#1e293b] transition hover:border-[#334155]"
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{item.weekTitle}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            {item.grade}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{item.date}</span>
                      </div>

                      {/* 1-2 Lines Feedback */}
                      <p className={`text-xs text-gray-300 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                        "{item.feedbackText}"
                      </p>

                      {/* View More / View Less Toggle */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#1e293b]/60">
                        <span className="text-[11px] text-gray-400">
                          Reviewed by <strong className="text-white">{item.mentorName || mentor.name}</strong>
                        </span>
                        <button
                          onClick={() => toggleFeedbackExpand(item.id)}
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                        >
                          {isExpanded ? (
                            <>View Less <ChevronUp size={13} /></>
                          ) : (
                            <>View More <ChevronDown size={13} /></>
                          )}
                        </button>
                      </div>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <div className="mt-3 p-3 rounded-xl bg-[#111827] border border-[#1e293b] text-xs space-y-2">
                          <div>
                            <span className="text-emerald-400 font-bold block mb-0.5">Key Strengths:</span>
                            <span className="text-gray-300">Fast adaptation to backend structure and reliable daily pull requests.</span>
                          </div>
                          <div>
                            <span className="text-yellow-400 font-bold block mb-0.5">Recommendations for Next Week:</span>
                            <span className="text-gray-300">Focus on database indexing and edge-case testing for authentication tokens.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 6. NEXT EVALUATION DATE (Span 4) */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#0f172a] to-purple-950/30 border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">6. Next Evaluation Date</h2>
                    <p className="text-xs text-gray-400">Upcoming formal assessment</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070B1A] border border-[#1e293b] text-center my-3">
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">Scheduled Review</div>
                  <div className="text-xl sm:text-2xl font-black text-white">{nextEval.formatted}</div>
                  <div className="text-xs text-cyan-300 font-semibold mt-1">At {nextEval.time}</div>
                  <div className="inline-block mt-3 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                    ⏳ In {nextEval.daysRemaining} Days
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-300 mt-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>Sprint 2 Code Quality & Architecture Review</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>Daily Journal Consistency & Log Analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>1-on-1 Milestone Feedback Session with Mentor</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push("/intern/tasks")}
                className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold text-white hover:brightness-110 shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Prepare Tasks for Review <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </main>
      </div>

      {/* MILESTONE TEST MODAL */}
      <MilestoneTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        role={assignedRole}
        sprintNumber={1}
        onTestCompleted={() => {
          loadData()
          setIsTestModalOpen(false)
        }}
      />
    </div>
  )
}