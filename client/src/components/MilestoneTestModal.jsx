"use client"
import React, { useState, useEffect } from "react"
import {
  X, CheckCircle2, Award, ChevronRight, ChevronLeft,
  RotateCcw, Sparkles, Clock, AlertCircle, CheckCircle,
  HelpCircle, BookOpen, Star, FileCheck, ShieldCheck
} from "lucide-react"
import {
  getQuestionsForRole,
  record15DayTestSubmission,
  getMentorForRole
} from "../lib/milestoneTestAndFeedback"
import { getInternUser } from "../lib/api"

export default function MilestoneTestModal({
  isOpen,
  onClose,
  onTestCompleted,
  role = "Backend Developer",
  sprintNumber = 1,
  testTitle = "Day 15 Milestone Test (Sprint 1)"
}) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [result, setResult] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(20 * 60) // 20 minutes
  const [timerActive, setTimerActive] = useState(false)

  const questions = getQuestionsForRole(role)
  const totalQ = questions.length

  useEffect(() => {
    if (isOpen && !showResult) {
      setTimerActive(true)
    } else {
      setTimerActive(false)
    }
  }, [isOpen, showResult])

  useEffect(() => {
    if (!timerActive) return
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerActive])

  if (!isOpen) return null

  const currentQ = questions[currentIdx] || questions[0]
  const answeredCount = Object.keys(answers).length
  const progressPct = Math.round((answeredCount / totalQ) * 100)

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handleSelectOption = (qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }))
  }

  const handleNext = () => {
    if (currentIdx < totalQ - 1) setCurrentIdx((prev) => prev + 1)
  }

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx((prev) => prev - 1)
  }

  const handleSubmit = () => {
    setTimerActive(false)
    let correct = 0
    const topicStats = {}

    questions.forEach((q) => {
      const isCorrect = answers[q.id] === q.correct
      if (isCorrect) correct += 1

      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, correct: 0 }
      }
      topicStats[q.topic].total += 1
      if (isCorrect) topicStats[q.topic].correct += 1
    })

    const scorePct = Math.round((correct / totalQ) * 100)
    const grade =
      scorePct >= 90 ? "A+" : scorePct >= 80 ? "A" : scorePct >= 70 ? "B" : scorePct >= 60 ? "C" : "D"
    const performanceLevel =
      scorePct >= 90 ? "Outstanding" : scorePct >= 75 ? "Exceeds Expectations" : "Good"

    const timeSpentSeconds = 20 * 60 - secondsLeft
    const timeSpentM = Math.floor(timeSpentSeconds / 60)
    const timeSpentS = timeSpentSeconds % 60
    const timeSpentStr = `${timeSpentM}m ${timeSpentS}s`

    const breakdown = Object.entries(topicStats).map(([topic, data], i) => {
      const topicPct = Math.round((data.correct / data.total) * 100)
      const colors = ["#7C3AED", "#06B6D4", "#10b981", "#f59e0b", "#ec4899"]
      return {
        topic,
        score: topicPct,
        color: colors[i % colors.length],
      }
    })

    const user = getInternUser() || {}
    const mentor = getMentorForRole(role)

    const evaluatedResult = {
      id: `milestone-${sprintNumber * 15}-sprint-${sprintNumber}`,
      milestone: testTitle,
      sprintNumber,
      dayNumber: sprintNumber * 15,
      role,
      internName: user.fullName || user.name || "Intern",
      status: "Passed",
      score: scorePct,
      totalQuestions: totalQ,
      correctCount: correct,
      timeSpent: timeSpentStr,
      grade,
      performanceLevel,
      dateTaken: `Day ${sprintNumber * 15} Milestone • ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      evaluatedBy: mentor.name,
      mentorCompany: mentor.company,
      certificateId: `CERT-DAY${sprintNumber * 15}-${Math.floor(1000 + Math.random() * 9000)}-${scorePct}`,
      summary: `Completed the ${testTitle} with a score of ${scorePct}% (${grade}). Strong grasp of ${role} core architecture and technical specifications.`,
      breakdown,
      strengths: [
        `High accuracy in ${breakdown[0]?.topic || "Core Architecture"} (${breakdown[0]?.score || 95}%).`,
        `Demonstrated fast problem-solving within ${timeSpentStr}.`,
        "Adherence to technical specifications and engineering standards."
      ],
      improvementAreas: [
        "Continue optimizing deep query structures and latency profiling.",
        "Refine test coverage for complex asynchronous edge cases."
      ],
      answersMap: answers,
    }

    record15DayTestSubmission(evaluatedResult)
    setResult(evaluatedResult)
    setShowResult(true)
    if (onTestCompleted) onTestCompleted(evaluatedResult)
  }

  const handleReset = () => {
    setAnswers({})
    setCurrentIdx(0)
    setShowResult(false)
    setShowReview(false)
    setSecondsLeft(20 * 60)
    setTimerActive(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-[#1e293b] shadow-2xl overflow-hidden text-white"
        style={{
          background: "linear-gradient(180deg, #0b1120 0%, #030712 100%)",
        }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0f172a]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/30 flex-shrink-0">
              <Award size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                  Sprint {sprintNumber} Milestone Test
                </span>
                <span className="text-xs text-gray-400">• Track: <strong className="text-white">{role}</strong></span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">{testTitle}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!showResult && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                  secondsLeft < 180
                    ? "bg-red-950/70 text-red-400 border-red-500/40 animate-pulse"
                    : "bg-[#111827] text-cyan-400 border-[#1e293b]"
                }`}
              >
                <Clock size={14} />
                <span>{formatTimer(secondsLeft)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#111827] border border-[#1e293b] text-gray-400 hover:text-white flex items-center justify-center transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          {showResult ? (
            /* RESULTS SCREEN */
            <div className="space-y-6">
              <div className="text-center p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-purple-950/20 relative overflow-hidden">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-xl shadow-purple-900/50 mb-3 animate-bounce">
                  <Award size={40} className="text-white" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 mb-2">
                  ✓ Milestone Completed & Verified
                </div>
                <h1 className="text-3xl font-extrabold text-white">
                  Score: <span className="text-cyan-400">{result?.score}%</span> ({result?.correctCount}/{result?.totalQuestions} Correct)
                </h1>
                <p className="text-sm text-gray-300 mt-1 max-w-xl mx-auto">
                  Grade: <strong className="text-purple-300 font-bold text-base">{result?.grade}</strong> • Performance: <span className="text-cyan-300 font-medium">{result?.performanceLevel}</span> • Time Taken: {result?.timeSpent}
                </p>
                <p className="text-xs text-gray-400 mt-2 font-mono">
                  Certificate Ref: <span className="text-white">{result?.certificateId}</span>
                </p>
              </div>

              {/* Topic Breakdown */}
              <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-yellow-400" /> Topic Performance Breakdown
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result?.breakdown?.map((b, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#111827] border border-[#1e293b]">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-semibold text-gray-300">{b.topic}</span>
                        <span className="font-bold font-mono" style={{ color: b.color }}>{b.score}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1e293b] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${b.score}%`, backgroundColor: b.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Growth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0f172a] rounded-2xl border border-green-900/30 p-5">
                  <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Evaluated Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    {result?.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#0f172a] rounded-2xl border border-amber-900/30 p-5">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle size={14} /> Recommended Growth Areas
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    {result?.improvementAreas?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Review Section Toggle */}
              {showReview && (
                <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <BookOpen size={16} className="text-cyan-400" /> Detailed Question Review & Solutions
                  </h3>
                  <div className="space-y-3">
                    {questions.map((q, idx) => {
                      const userAns = answers[q.id]
                      const isCorrect = userAns === q.correct
                      return (
                        <div
                          key={q.id}
                          className={`p-4 rounded-xl border text-xs ${
                            isCorrect
                              ? "bg-green-950/15 border-green-500/30"
                              : "bg-red-950/15 border-red-500/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="font-bold text-gray-200">
                              Q{idx + 1}. {q.q}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                                isCorrect
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                            </span>
                          </div>
                          <div className="space-y-1 text-gray-400 mb-2 pl-2">
                            <div>Your Answer: <strong className={isCorrect ? "text-green-300" : "text-red-300"}>{q.options[userAns] || "Not Answered"}</strong></div>
                            {!isCorrect && (
                              <div>Correct Answer: <strong className="text-green-400">{q.options[q.correct]}</strong></div>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 bg-[#0b1120] p-2.5 rounded-lg border border-[#1e293b]">
                            💡 <span className="font-semibold text-gray-300">Explanation:</span> {q.explanation}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Result Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setShowReview(!showReview)}
                  className="px-4 py-2.5 rounded-xl bg-[#111827] border border-[#1e293b] text-xs font-semibold text-gray-300 hover:text-white transition flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen size={14} />
                  <span>{showReview ? "Hide Solutions" : "Review All Questions & Solutions"}</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 rounded-xl bg-[#111827] border border-[#1e293b] text-xs font-semibold text-gray-300 hover:text-white transition flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw size={14} /> Retake Test
                  </button>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold text-white shadow-lg shadow-purple-900/30 hover:brightness-110 transition cursor-pointer"
                  >
                    Save & Return to Evaluation
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE TEST VIEW */
            <div className="space-y-5">
              {/* Question Navigator Pills */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Questions Progress</span>
                  <span className="font-semibold text-cyan-400">
                    {answeredCount} of {totalQ} Answered ({progressPct}%)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined
                    const isCurrent = idx === currentIdx
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                          isCurrent
                            ? "ring-2 ring-cyan-400 bg-cyan-500 text-white shadow-md shadow-cyan-500/50"
                            : isAnswered
                            ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white"
                            : "bg-[#111827] border border-[#1e293b] text-gray-400 hover:text-white hover:bg-[#1e293b]"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Current Question Box */}
              <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30">
                    Question {currentIdx + 1} of {totalQ} • {currentQ.topic}
                  </span>
                  <span className="text-xs text-gray-400">Single Choice</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed mb-6">
                  {currentQ.q}
                </h3>

                {/* Options List */}
                <div className="space-y-3">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = answers[currentQ.id] === optIdx
                    const letters = ["A", "B", "C", "D"]
                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQ.id, optIdx)}
                        className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-cyan-950/40 to-purple-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-950/50"
                            : "bg-[#111827] border-[#1e293b] text-gray-300 hover:border-gray-600 hover:bg-[#161f36]"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition flex-shrink-0 ${
                            isSelected
                              ? "bg-cyan-400 text-black shadow-md"
                              : "bg-[#1e293b] text-gray-400"
                          }`}
                        >
                          {letters[optIdx]}
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-snug flex-1">
                          {option}
                        </span>
                        {isSelected && (
                          <CheckCircle2 size={18} className="text-cyan-400 flex-shrink-0 animate-in zoom-in-50" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="px-4 py-2.5 rounded-xl bg-[#111827] border border-[#1e293b] text-xs font-semibold text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentIdx < totalQ - 1 ? (
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold text-white shadow-lg hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      Next Question <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-xs font-bold text-white shadow-lg shadow-green-900/30 hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer animate-pulse"
                    >
                      <CheckCircle size={16} /> Submit 15-Day Assessment
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
