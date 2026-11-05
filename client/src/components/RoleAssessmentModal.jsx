"use client"
import { useState } from "react"
import {
  X, CheckCircle2, Award, ChevronRight, ChevronLeft,
  RotateCcw, Sparkles, Code2, Database, Cpu, Layers,
  CheckCircle, ArrowRight
} from "lucide-react"
import {
  ASSESSMENT_QUESTIONS,
  determineRole,
  saveAssessmentResult
} from "../lib/assessmentData"
import { api, getInternUser } from "../lib/api"

export default function RoleAssessmentModal({ isOpen, onClose, onRoleAssigned, currentRole }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

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

    // Save locally
    saveAssessmentResult(evaluated)

    // Sync to backend if logged in
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
    if (onRoleAssigned) {
      onRoleAssigned(evaluated.assignedRole, evaluated)
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-cyan-500/25 bg-[#070B1A] text-white shadow-2xl transition-all"
        style={{
          boxShadow: "0 0 50px rgba(6, 182, 212, 0.15), 0 0 80px rgba(124, 58, 237, 0.15)"
        }}
      >
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 sm:px-8 py-4 bg-[#0a1026]/90 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Award size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                Intern Role Skill Assessment
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                  16 MCQs
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Tests FSD, Data Structures, Backend & Databases to assign your specialization role.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* PROGRESS BAR & JUMP PILLS */}
        {!showResult && (
          <div className="px-6 sm:px-8 pt-3 pb-2 bg-[#070B1A] border-b border-white/5 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-gray-300 mb-2 font-medium">
              <span>Question {currentIdx + 1} of {totalQ}</span>
              <span className="text-cyan-400 font-bold">{answeredCount}/{totalQ} Answered ({progressPct}%)</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
              />
            </div>
            {/* Quick Navigation Numbers */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {ASSESSMENT_QUESTIONS.map((q, idx) => {
                const isAns = answers[q.id] !== undefined
                const isCur = idx === currentIdx
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`min-w-[30px] h-[30px] px-1 rounded-lg text-xs font-bold transition flex items-center justify-center flex-shrink-0 cursor-pointer shadow-sm ${
                      isCur
                        ? "ring-2 ring-cyan-400 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-black scale-105"
                        : isAns
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div className="relative z-10 p-6 sm:p-8 flex-1 overflow-y-auto">
          {!showResult ? (
            <div>
              {/* Question domain badge */}
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300">
                  {getDomainIcon(currentQ.domain)}
                  {currentQ.subject}
                </span>
                <span className="text-xs text-gray-500 font-mono">Q{currentQ.id} of 16</span>
              </div>

              {/* Question title */}
              <h3 className="text-lg sm:text-xl font-bold leading-relaxed mb-6 text-white">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-3.5 mb-6">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] === idx
                  const optionLabel = ["A", "B", "C", "D"][idx]
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(currentQ.id, idx)}
                      className={`group flex items-center gap-4 p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer min-h-[52px] ${
                        isSelected
                          ? "bg-gradient-to-r from-cyan-500/15 via-purple-600/15 to-transparent border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.2)] scale-[1.008]"
                          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition flex-shrink-0 shadow-sm ${
                          isSelected
                            ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
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

              {/* Quick Navigation Numbers */}
              <div className="flex items-center justify-center gap-2 py-2 mb-2 flex-wrap">
                {ASSESSMENT_QUESTIONS.map((q, idx) => {
                  const isAns = answers[q.id] !== undefined
                  const isCur = idx === currentIdx
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
                        isCur
                          ? "ring-4 ring-cyan-400/30 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-extrabold scale-110"
                          : isAns
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
                          : "bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* RESULT SCREEN */
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 mb-4 shadow-xl">
                <Sparkles size={40} className="text-white animate-pulse" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/40 mb-2">
                Assessment Completed
              </div>

              <h2 className="text-2xl font-black mb-1">
                Assigned Role: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{result?.assignedRole}</span>
              </h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
                {result?.description}
              </p>

              {/* SCORE CARD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-6">
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                  <div className="text-xl font-black text-cyan-400">{result?.score} / {result?.totalQuestions}</div>
                  <div className="text-[10px] text-gray-400 uppercase mt-0.5">Overall Score</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                  <div className="text-xl font-black text-purple-400">{result?.percentage}%</div>
                  <div className="text-[10px] text-gray-400 uppercase mt-0.5">Accuracy</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                  <div className="text-xl font-black text-emerald-400">6 Tasks</div>
                  <div className="text-[10px] text-gray-400 uppercase mt-0.5">Tailored Tasks</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                  <div className="text-xs font-bold text-yellow-300 mt-1">{result?.roleBadge}</div>
                  <div className="text-[10px] text-gray-400 uppercase mt-0.5">Title</div>
                </div>
              </div>

              {/* DOMAIN BREAKDOWN */}
              <div className="max-w-md mx-auto space-y-2 mb-6 text-left">
                <div className="text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2 text-center">
                  Subject Breakdown
                </div>
                {result && Object.entries(result.domainScores).map(([key, domain]) => (
                  <div key={key} className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                        {getDomainIcon(key)} {domain.name}
                      </span>
                      <span className="font-bold text-cyan-300">{domain.score} / {domain.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
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

        {/* FOOTER ACTIONS (Always accessible) */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 px-6 py-4 bg-[#0a1026]/95 flex-shrink-0">
          {!showResult ? (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <div className="flex items-center gap-2">
                {currentIdx < totalQ - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:brightness-110 shadow-lg shadow-purple-600/20 transition"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || answeredCount === 0}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:brightness-110 shadow-lg shadow-green-600/30 transition disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    {submitting ? "Evaluating..." : `Submit Assessment (${answeredCount}/${totalQ})`}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition"
              >
                <RotateCcw size={14} /> Retake Test
              </button>

              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white hover:brightness-110 shadow-lg shadow-purple-600/30 transition"
              >
                View Role Tasks <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
