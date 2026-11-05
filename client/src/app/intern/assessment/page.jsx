"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import InternSidebar from "../../../lib/internSidebar"
import {
  ASSESSMENT_QUESTIONS,
  determineRole,
  saveAssessmentResult,
  getAssignedRole
} from "../../../lib/assessmentData"
import { api, getInternUser } from "../../../lib/api"
import {
  Award, Sparkles, CheckCircle2, ChevronRight, ChevronLeft,
  RotateCcw, Code2, Database, Cpu, Layers, ArrowRight, ShieldCheck
} from "lucide-react"

export default function AssessmentPage() {
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [existingRole, setExistingRole] = useState(null)

  useEffect(() => {
    const role = getAssignedRole()
    if (role) {
      setExistingRole(role)
    }
  }, [])

  const currentQ = ASSESSMENT_QUESTIONS[currentIdx]
  const totalQ = ASSESSMENT_QUESTIONS.length
  const answeredCount = Object.keys(answers).length
  const progressPct = Math.round((answeredCount / totalQ) * 100)

  const handleSelectOption = (qId, optionIdx) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }))
  }

  const handleNext = () => {
    if (currentIdx < totalQ - 1) {
      setCurrentIdx(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const evaluated = determineRole(answers)
    setResult(evaluated)
    saveAssessmentResult(evaluated)

    try {
      const user = getInternUser()
      if (user && user.id) {
        await api.updateProfile(user.id, {
          internRole: evaluated.assignedRole,
          assessment: evaluated
        })
      }
    } catch {}

    setSubmitting(false)
    setShowResult(true)
  }

  const handleRestart = () => {
    setAnswers({})
    setCurrentIdx(0)
    setShowResult(false)
    setResult(null)
  }

  const getDomainIcon = (domain) => {
    switch (domain) {
      case "frontend": return <Code2 size={15} className="text-cyan-400" />
      case "backend": return <Layers size={15} className="text-purple-400" />
      case "ds": return <Cpu size={15} className="text-pink-400" />
      case "db": return <Database size={15} className="text-emerald-400" />
      default: return <Sparkles size={15} className="text-yellow-400" />
    }
  }

  return (
    <div className="portal-root flex h-screen w-full max-w-full overflow-hidden text-white bg-[#020617] relative">
      <InternSidebar active="Skill Test" />

      <main className="flex-1 flex flex-col h-screen min-w-0 p-3 sm:p-5 lg:p-8 relative overflow-hidden justify-center">
        {/* Glow ambient background gradients */}
        <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-5xl mx-auto h-[94vh] max-h-[860px] rounded-3xl border border-cyan-500/25 bg-[#070B1A]/95 backdrop-blur-xl shadow-2xl overflow-hidden relative z-10 flex flex-col">
          {/* HEADER (Sticky / Fixed at top) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 px-6 sm:px-8 py-4 bg-[#0a1026]/95 gap-3 flex-shrink-0">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Award size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2.5 flex-wrap">
                  Intern Role Assessment
                  <span className="text-xs px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm">
                    16 Questions
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                  Assess your technical skills to automatically assign your specialization role and tasks.
                </p>
              </div>
            </div>

            {existingRole && !showResult && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-semibold self-start sm:self-auto shadow-sm">
                <ShieldCheck size={16} /> Current: {existingRole}
              </div>
            )}
          </div>

          {/* PROGRESS & NUMBERED JUMP NAVIGATION (Always visible) */}
          {!showResult && (
            <div className="px-6 sm:px-8 pt-3.5 pb-2.5 bg-[#070B1A] border-b border-white/5 flex-shrink-0">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-300 mb-2 font-medium">
                <span>Question {currentIdx + 1} of {totalQ}</span>
                <span className="text-cyan-400 font-bold">{answeredCount}/{totalQ} Answered ({progressPct}%)</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden shadow-inner mb-3">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                  style={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
                />
              </div>

              {/* Numbered Jump Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {ASSESSMENT_QUESTIONS.map((q, idx) => {
                  const isAns = answers[q.id] !== undefined
                  const isCur = idx === currentIdx
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`min-w-[34px] h-[34px] px-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center flex-shrink-0 shadow-sm cursor-pointer ${
                        isCur
                          ? "ring-2 ring-cyan-400/80 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-black scale-105 shadow-md shadow-cyan-500/30"
                          : isAns
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold border border-purple-400/40"
                          : "bg-white/[0.05] text-gray-400 border border-white/10 hover:bg-white/[0.1] hover:text-white"
                      }`}
                      title={`Jump to Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* QUESTION OR RESULT BODY (Independently scrollable) */}
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
            {!showResult ? (
              <div className="max-w-3xl mx-auto">
                {/* Domain Pill */}
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-200">
                    {getDomainIcon(currentQ.domain)}
                    {currentQ.subject}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">Question {currentIdx + 1} of {totalQ}</span>
                </div>

                {/* Question */}
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold leading-relaxed mb-6 text-white">
                  {currentQ.question}
                </h2>

                {/* Options List */}
                <div className="space-y-3.5 mb-4">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = answers[currentQ.id] === idx
                    const optionLabel = ["A", "B", "C", "D"][idx]
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectOption(currentQ.id, idx)}
                        className={`group flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-cyan-500/15 via-purple-600/15 to-transparent border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                            : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/25"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold transition flex-shrink-0 mt-0.5 shadow-sm ${
                            isSelected
                              ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md"
                              : "bg-white/10 text-gray-400 group-hover:text-white"
                          }`}
                        >
                          {optionLabel}
                        </div>
                        <span className={`text-sm sm:text-base leading-relaxed ${isSelected ? "text-white font-semibold" : "text-gray-200"}`}>
                          {opt}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* RESULTS */
              <div className="text-center py-6 sm:py-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 mb-5 shadow-2xl">
                  <Sparkles size={48} className="text-white animate-pulse" />
                </div>

                <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-semibold border border-cyan-500/40 mb-3 shadow-sm">
                  Assessment Completed
                </div>

                <h2 className="text-3xl sm:text-4xl font-black mb-3">
                  Assigned Role: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{result?.assignedRole}</span>
                </h2>
                <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                  {result?.description}
                </p>

                {/* STAT CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto mb-10">
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 text-center shadow-lg">
                    <div className="text-3xl font-extrabold text-cyan-400">{result?.score} / {result?.totalQuestions}</div>
                    <div className="text-xs sm:text-sm text-gray-400 uppercase mt-1 font-semibold tracking-wider">Overall Score</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 text-center shadow-lg">
                    <div className="text-3xl font-extrabold text-purple-400">{result?.percentage}%</div>
                    <div className="text-xs sm:text-sm text-gray-400 uppercase mt-1 font-semibold tracking-wider">Accuracy</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 text-center shadow-lg">
                    <div className="text-3xl font-extrabold text-emerald-400">6 Tasks</div>
                    <div className="text-xs sm:text-sm text-gray-400 uppercase mt-1 font-semibold tracking-wider">Assigned</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 text-center shadow-lg">
                    <div className="text-base font-bold text-yellow-300 mt-1">{result?.roleBadge}</div>
                    <div className="text-xs sm:text-sm text-gray-400 uppercase mt-1 font-semibold tracking-wider">Title</div>
                  </div>
                </div>

                {/* SUBJECT METRICS */}
                <div className="max-w-2xl mx-auto space-y-4 mb-10 text-left">
                  {result && Object.entries(result.domainScores).map(([key, domain]) => (
                    <div key={key} className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 shadow-sm">
                      <div className="flex justify-between text-sm sm:text-base mb-2.5">
                        <span className="text-gray-200 flex items-center gap-2.5 font-medium">
                          {getDomainIcon(key)} {domain.name}
                        </span>
                        <span className="font-bold text-cyan-300">{domain.score} / {domain.total}</span>
                      </div>
                      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                          style={{ width: `${(domain.score / domain.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER (Always accessible and visible at bottom) */}
          <div className="flex items-center justify-between border-t border-white/10 px-6 sm:px-8 py-4 sm:py-4.5 bg-[#0a1026]/95 gap-4 flex-shrink-0 z-20">
            {!showResult ? (
              <>
                <button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="h-12 flex items-center gap-2 px-6 sm:px-8 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronLeft size={20} /> Previous
                </button>

                <div className="flex items-center gap-3">
                  {currentIdx < totalQ - 1 ? (
                    <button
                      onClick={handleNext}
                      className="h-12 flex items-center gap-2 px-7 sm:px-9 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:brightness-110 shadow-lg shadow-purple-600/25 transition cursor-pointer"
                    >
                      Next <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || answeredCount === 0}
                      className="h-12 flex items-center gap-2 px-8 sm:px-10 rounded-xl sm:rounded-2xl text-sm sm:text-base font-extrabold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:brightness-110 shadow-lg shadow-green-600/30 transition disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 size={20} />
                      {submitting ? "Evaluating..." : `Submit Assessment (${answeredCount}/${totalQ})`}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleRestart}
                  className="h-12 flex items-center gap-2 px-6 sm:px-8 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition cursor-pointer"
                >
                  <RotateCcw size={18} /> Retake Test
                </button>

                <button
                  onClick={() => router.push("/intern/tasks")}
                  className="h-12 flex items-center gap-2 px-8 sm:px-10 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white hover:brightness-110 shadow-lg shadow-purple-600/30 transition cursor-pointer"
                >
                  View My Tasks <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
