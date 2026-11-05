"use client"
import { ArrowUp, ArrowDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Search, Bell, LayoutDashboard, ClipboardList, Calendar,
  MessageSquare, Settings, User, BarChart3, BookOpenCheck,
  CheckCircle2, FileText, UserCheck, GraduationCap, Bot,
  Send, X, LogOut, UserPlus, Mic, Paperclip, ChevronDown,
  Camera, FolderOpen, Sparkles, Volume2, VolumeX, Copy,
  Check, Square, Radio, Play, RotateCcw,
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts"
import { ClientChart } from "../../../components/ui/client-chart"
import { getUser, getInternUser, resolveInternName, getInternPhoto, clearUserSession, DEFAULT_INTERN_AVATAR } from "../../../lib/api"
import InternSidebar from "../../../lib/internSidebar"
import MarkdownRenderer from "../../../components/MarkdownRenderer"

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY

const PERF_DATA = {
  Day:  [{ day:"9AM",value:3 },{ day:"11AM",value:5 },{ day:"1PM",value:7 },{ day:"3PM",value:6 },{ day:"5PM",value:8 }],
  Week: [{ day:"Mon",value:4 },{ day:"Tue",value:6 },{ day:"Wed",value:7 },{ day:"Thu",value:8 },{ day:"Fri",value:9 },{ day:"Sat",value:8 },{ day:"Sun",value:7 }],
  Month:[{ day:"W1",value:5 },{ day:"W2",value:6.5 },{ day:"W3",value:7.8 },{ day:"W4",value:8.9 }],
}

// Robust Markdown renderer backed by MarkdownRenderer component
function FormattedMessage({ text }) {
  return <MarkdownRenderer text={text} />
}

export default function InternDashboard() {
  const router = useRouter()
  const [openAI, setOpenAI] = useState(false)
  const [message, setMessage] = useState("")
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [aiWidth, setAiWidth] = useState(33)
  const [loading, setLoading] = useState(false)
  const [perfPeriod, setPerfPeriod] = useState("Week")
  const [userName, setUserName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const u = getInternUser()
        return resolveInternName(u)
      } catch {}
    }
    return ""
  })
  const [userRole, setUserRole] = useState("Intern")
  const [userPhoto, setUserPhoto] = useState(() => {
    if (typeof window !== "undefined") {
      return getInternPhoto()
    }
    return DEFAULT_INTERN_AVATAR
  })
  const [isListening, setIsListening] = useState(false)
  const [showAICamera, setShowAICamera] = useState(false)
  const [liveActivities, setLiveActivities] = useState([
    { type:"task",       text:"Task submitted — Login API",    time:"2h ago",  color:"bg-green-500",  icon:"task",       path:"/intern/tasks" },
    { type:"journal",    text:"Journal uploaded — May 20",     time:"5h ago",  color:"bg-blue-500",   icon:"journal",    path:"/intern/journals" },
    { type:"attendance", text:"Attendance marked — Present",   time:"9h ago",  color:"bg-orange-500", icon:"attendance", path:"/intern/attendance" },
  ])
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "ai",
      text: "Hello! 👋\n\nI'm your Internship Assistant. I can help you with:\n\n1. **Overall Performance** — Understand your internship progress and scores.\n2. **Assigned Tasks** — Check task details and completion status.\n3. **Upcoming Deadlines** — Know which tasks are due next.\n4. **Attendance** — Review your attendance records.\n5. **Coding Help** — Understand programming concepts and fix errors.\n\nWhat would you like help with first?",
      timestamp: "Just now"
    },
  ])
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("intern_ai_voice_enabled") !== "false"
    }
    return true
  })
  const [speakingIndex, setSpeakingIndex] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const chatEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const aiVideoRef = useRef(null)
  const aiStreamRef = useRef(null)

  const [assignedRole, setAssignedRole] = useState(null)
  const [assessmentScore, setAssessmentScore] = useState(null)

  // Poll localStorage for real username and assigned role — use intern-specific key
  useEffect(() => {
    const load = () => {
      try {
        const u = getInternUser()
        const resolved = resolveInternName(u)
        if (resolved) {
          setUserName(resolved)
          setMessages(prev => {
            if (prev.length === 1 && prev[0].id === "welcome-1") {
              const updatedText = `Hello ${resolved}! 👋\n\nI'm your Internship Assistant. I can help you with:\n\n1. **Overall Performance** — Understand your internship progress and scores.\n2. **Assigned Tasks** — Check task details and completion status.\n3. **Upcoming Deadlines** — Know which tasks are due next.\n4. **Attendance** — Review your attendance records.\n5. **Coding Help** — Understand programming concepts and fix errors.\n\nWhat would you like help with first?`
              if (prev[0].text !== updatedText) {
                return [{ ...prev[0], text: updatedText }]
              }
            }
            return prev
          })
        }
        const role = localStorage.getItem("intern_assigned_role") || u.internRole
        if (role) {
          setAssignedRole(role)
          setUserRole(role)
        } else if (u.role) {
          setUserRole(u.role)
        }
        try {
          const res = JSON.parse(localStorage.getItem("intern_assessment_result") || "null")
          if (res) setAssessmentScore(res.score || res.totalScore)
        } catch {}
        const currentPhoto = getInternPhoto()
        setUserPhoto(currentPhoto)
      } catch {}
    }
    load()
    const id = setInterval(load, 1500)
    window.addEventListener("intern_role_updated", load)
    window.addEventListener("intern_photo_updated", load)
    window.addEventListener("storage", load)
    return () => {
      clearInterval(id)
      window.removeEventListener("intern_role_updated", load)
      window.removeEventListener("intern_photo_updated", load)
      window.removeEventListener("storage", load)
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Poll localStorage for attendance activities pushed from attendance page
  useEffect(() => {
    const loadActivities = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("recentActivities") || "[]")
        if (stored.length > 0) {
          const mapped = stored.map(a => ({
            type: a.type,
            text: a.text,
            time: a.time,
            color: a.type === "checkout" ? "bg-red-500" : a.type === "attendance" ? "bg-orange-500" : "bg-green-500",
            icon: a.type,
            path: "/intern/attendance",
            loc: a.loc,
          }))
          setLiveActivities(prev => {
            const defaults = prev.filter(p => p.type !== "attendance" && p.type !== "checkout")
            return [...mapped, ...defaults].slice(0, 5)
          })
        }
      } catch {}
    }
    loadActivities()
    const id = setInterval(loadActivities, 2000)
    return () => clearInterval(id)
  }, [])

  const menuItems = [
    { icon: LayoutDashboard, title: "Dashboard",  path: "/intern/dashboard",  active: true },
    { icon: ClipboardList,   title: "Tasks",       path: "/intern/tasks" },
    { icon: BookOpenCheck,   title: "Attendance",  path: "/intern/attendance" },
    { icon: FileText,        title: "Journals",    path: "/intern/journals" },
    { icon: BarChart3,       title: "Analytics",   path: "/intern/analytics" },
    { icon: Calendar,        title: "Calendar",    path: "/intern/calendar" },
    { icon: MessageSquare,   title: "Messages",    path: "/intern/messages" },
    { icon: User,            title: "Mentor",      path: "/intern/mentor" },
    { icon: Settings,        title: "Settings",    path: "/intern/settings" },
  ]

  // --- VOICE REPLY (TEXT-TO-SPEECH) ---
  const cleanTextForSpeech = (text) => {
    if (!text) return ""
    return text
      .replace(/```[\s\S]*?```/g, "code block omitted.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*#_~]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[•\-\+]\s+/g, ". ")
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  const speakText = (text, idx = null) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    if (speakingIndex === idx && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setSpeakingIndex(null)
      return
    }
    window.speechSynthesis.cancel()
    const spoken = cleanTextForSpeech(text)
    if (!spoken) return

    const utterance = new SpeechSynthesisUtterance(spoken)
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice =
      voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("US") || v.name.includes("Samantha") || v.name.includes("Jenny"))) ||
      voices.find(v => v.lang.startsWith("en"))
    if (preferredVoice) utterance.voice = preferredVoice
    utterance.rate = 1.05
    utterance.pitch = 1.0
    utterance.onstart = () => setSpeakingIndex(idx)
    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setSpeakingIndex(null)
  }

  const toggleVoiceReply = () => {
    setVoiceReplyEnabled(prev => {
      const next = !prev
      if (typeof window !== "undefined") {
        localStorage.setItem("intern_ai_voice_enabled", String(next))
      }
      if (!next) stopSpeaking()
      return next
    })
  }

  const copyMessageText = (text, index) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
      })
    }
  }

  // --- VOICE CHAT (SPEECH-TO-TEXT) ---
  const startMic = () => {
    if (typeof window === "undefined") return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.")
      return
    }
    stopSpeaking()

    if (isListening) {
      try { recognitionRef.current?.stop() } catch {}
      setIsListening(false)
      setShowAttachMenu(false)
      if (message.trim()) {
        sendMessage(message.trim())
      }
      return
    }

    try {
      const rec = new SR()
      rec.lang = "en-US"
      rec.interimResults = true
      rec.maxAlternatives = 1

      rec.onstart = () => {
        setIsListening(true)
        setShowAttachMenu(false)
      }

      rec.onresult = (e) => {
        let transcript = ""
        for (let i = 0; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript
        }
        if (transcript) {
          setMessage(transcript)
        }
      }

      rec.onerror = (e) => {
        console.warn("Speech recognition error:", e.error)
        setIsListening(false)
      }

      rec.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = rec
      rec.start()
    } catch (err) {
      console.error("Failed to start speech recognition:", err)
      setIsListening(false)
    }
  }

  // AI Camera
  const openAICamera = async () => {
    setShowAICamera(true); setShowAttachMenu(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      aiStreamRef.current = stream
      setTimeout(() => { if (aiVideoRef.current) aiVideoRef.current.srcObject = stream }, 100)
    } catch { alert("Camera permission denied."); setShowAICamera(false) }
  }
  const captureAIPhoto = () => {
    if (!aiVideoRef.current) return
    const canvas = document.createElement("canvas")
    canvas.width = aiVideoRef.current.videoWidth; canvas.height = aiVideoRef.current.videoHeight
    canvas.getContext("2d").drawImage(aiVideoRef.current, 0, 0)
    aiStreamRef.current?.getTracks().forEach(t => t.stop()); setShowAICamera(false)
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(p => [
      ...p,
      { id: `u-${Date.now()}`, role:"user", text:"[Photo captured from webcam]", timestamp: timeStr },
      { id: `ai-${Date.now()}`, role:"ai", text:"Photo captured! Describe what's in it and I'll help you analyze or debug it.", timestamp: timeStr }
    ])
  }

  // --- SEND MESSAGE (FREE AI API + FALLBACKS + VOICE REPLY) ---
  const sendMessage = async (overrideText) => {
    const textToSend = (typeof overrideText === "string" ? overrideText : message).trim()
    if (!textToSend || loading) return

    stopSpeaking()
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: timeStr
    }

    setMessages(p => [...p, userMsg])
    setMessage("")
    setLoading(true)
    setShowAttachMenu(false)

    let replyText = ""
    let replyProvider = "free-ai"

    // 1. Try local Next.js /api/ai (Pollinations AI + context)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 16000)
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          context: {
            userName,
            userRole,
            performanceScore: assessmentScore || "8.9",
            tasksCount: "18/24 completed",
            attendancePct: "92%"
          },
          history: messages.slice(-4).map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }))
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (res.ok) {
        const data = await res.json()
        if (data?.reply && !data.reply.startsWith("ERROR:")) {
          replyText = data.reply
          replyProvider = data.provider || "pollinations"
        }
      }
    } catch (e) {
      console.warn("Local /api/ai route bypassed, trying direct free AI:", e.message)
    }

    // 2. Direct browser fallback to Pollinations AI
    if (!replyText) {
      try {
        const directController = new AbortController()
        const directTimeout = setTimeout(() => directController.abort(), 12000)
        const directRes = await fetch("https://text.pollinations.ai/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: `You are the Internship Assistant for engineering intern ${userName} (${userRole}). Explain things in simple, student-friendly English organized into short numbered steps (1., 2., 3.) or bullet points. Never write one long unbroken paragraph. Format code in clean markdown code blocks. For tutorials, explain one clear step at a time (What to do, Where to do it, Expected result).`
              },
              { role: "user", content: textToSend }
            ],
            model: "openai"
          }),
          signal: directController.signal
        })
        clearTimeout(directTimeout)
        if (directRes.ok) {
          const pollText = await directRes.text()
          if (pollText && pollText.trim() && !pollText.includes("error code:")) {
            replyText = pollText.trim()
            replyProvider = "browser-pollinations"
          }
        }
      } catch (e) {
        console.warn("Direct browser Pollinations call bypassed:", e.message)
      }
    }

    // 3. Smart local assistant fallback (instant intelligent answer, no error messages, zero API key required)
    if (!replyText) {
      replyText = generateSmartFallbackClient(textToSend, userName, userRole)
      replyProvider = "local-intelligent"
    }

    const aiMsg = {
      id: `ai-${Date.now()}`,
      role: "ai",
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: replyProvider
    }

    setMessages(p => {
      const updated = [...p, aiMsg]
      const newIdx = updated.length - 1
      if (voiceReplyEnabled) {
        setTimeout(() => {
          speakText(replyText, newIdx)
        }, 350)
      }
      return updated
    })
    setLoading(false)
  }

  function generateSmartFallbackClient(userInput, name, role) {
    const lower = userInput.toLowerCase()

    if (lower.match(/^(hi|hello|hey|greetings|who are you|help)/) || lower.includes("start")) {
      return `Hello ${name}! 👋\n\nI'm your Internship Assistant. I can help you with:\n\n1. **Overall Performance** — Understand your internship progress and scores.\n2. **Assigned Tasks** — Check task details and completion status.\n3. **Upcoming Deadlines** — Know which tasks are due next.\n4. **Attendance** — Review your attendance records.\n5. **Coding Help** — Understand programming concepts and fix errors.\n\nWhat would you like help with first?`
    }

    if (lower.match(/performance|score|rating|progress|overall|grade|standing|stats/)) {
      return `📊 **Overall Performance Summary for ${name}**\n\nHere is a clear breakdown of your current standing:\n\n1. **Overall Rating** — **8.9 / 10** ⭐ (+8% improvement from last assessment)\n2. **Curriculum Progress** — **75% completed** (28 days remaining in this internship cycle)\n3. **Task Completion** — **18 tasks completed** out of 24 assigned (75% completion rate)\n4. **Attendance Record** — **92%** consistent attendance record\n5. **Mentor Evaluation** — Rated top percentile for code structure, API design, and daily journals.\n\n🎯 **Next Step:** Complete your upcoming **UI Case Study** task due in 2 days to maintain your score!`
    }

    if (lower.match(/task|assigned|completed|todo|work|kanban/)) {
      return `📋 **Assigned Tasks Overview**\n\nHere is the current status of your project assignments:\n\n1. **Total Assigned** — 24 tasks across your technical curriculum\n2. **Completed & Approved** — 18 tasks (including recent 'Login API' submission)\n3. **Active / In Progress** — 6 tasks remaining on your board\n4. **Next Priority Task** — 'UI Case Study' (High Priority, Due in 2 days)\n\n👉 **Action:** Head over to the **Tasks** tab to update your Kanban board or submit your latest code!`
    }

    if (lower.match(/deadline|due|upcoming|schedule/)) {
      return `⏳ **Upcoming Deadlines**\n\nHere are your critical deadlines arranged in chronological order:\n\n1. 🔴 **UI Case Study** — Due in **2 Days** (High Priority)\n2. 🔵 **API Integration** — Due in **4 Days** (Medium Priority)\n3. 🟢 **Weekly Learning Journal** — Due in **7 Days** (Regular Review)\n\nMake sure to review requirements early and ask your mentor if you have any blockers!`
    }

    if (lower.match(/attendance|present|absent|hours|checkin|check-in/)) {
      return `🕒 **Attendance Insights**\n\nHere is your real-time attendance log:\n\n1. **Current Attendance Rate** — **92%** (+5% improvement this month)\n2. **Today's Status** — Marked **Present** (Active session: 09:10 AM – 06:05 PM)\n3. **Average Daily Hours** — **8 hours 55 minutes** per active working day\n\nYour presence is logged automatically during active portal sessions. You can review the monthly calendar in the **Attendance** tab.`
    }

    if (lower.match(/tutorial|step|guide|how to|build|create/)) {
      return `💡 **Step-by-Step Guide**\n\nLet's take this one step at a time so it's easy and clear:\n\n1. **What to do:** Set up the API endpoint route file in your project.\n2. **Where to do it:** In your workspace, locate or create \`server/intern/routes/api_routes.py\`.\n3. **Expected result:** A clean Flask Blueprint that accepts incoming JSON requests and returns structured responses.\n\n\`\`\`python\nfrom flask import Blueprint, jsonify, request\n\napi_bp = Blueprint("api_bp", __name__)\n\n@api_bp.route("/status", methods=["GET"])\ndef check_status():\n    return jsonify({"status": "active", "service": "intern-portal"}), 200\n\`\`\`\n\nLet me know once you've done this, and we'll move to the next step! 👍`
    }

    if (lower.match(/journal|diary|daily report|reflection/)) {
      return `📖 **Daily Learning Journals**\n\nLogging your daily progress contributes directly to your final evaluation grade:\n\n1. **Latest Entry** — 'Integrated Login API' (Uploaded 5 hours ago)\n2. **Review Status** — Under mentor review\n3. **Best Practice** — Record: 1) What you built today, 2) Blockers encountered, and 3) Solutions discovered.\n\nGo to the **Journals** tab to create or edit your daily entries.`
    }

    if (lower.match(/mentor|guidance|meeting|feedback|review/)) {
      return `🧑‍🏫 **Mentor Support & Feedback**\n\nHere is how to get help from your assigned mentors:\n\n1. **Available Mentors** — Rahul Sharma (Backend Lead), Priya Verma (Frontend Lead), Amit Patel (Database Admin)\n2. **1-on-1 Sessions** — Request code reviews or architecture discussions anytime\n3. **Weekly Feedback** — Mentors review your journals and code every Friday\n\nVisit the **Mentor** tab to view mentor schedules and start a discussion.`
    }

    if (lower.includes("api") || lower.includes("rest")) {
      return `🌐 **REST API Architecture Explained Step-by-Step**\n\nAn API (Application Programming Interface) allows frontend and backend services to communicate:\n\n1. **HTTP Methods:**\n   • \`GET\` — Read data from the server\n   • \`POST\` — Create new records\n   • \`PUT\` / \`PATCH\` — Update existing records\n   • \`DELETE\` — Remove records\n\n2. **JSON Data Format:** The universal lightweight format for sending request and response payloads.\n\n3. **Example Code Block:**\n\`\`\`javascript\n// Fetching data from our portal API\nconst res = await fetch("/api/tasks")\nconst data = await res.json()\nconsole.log("Tasks:", data)\n\`\`\`\n\n4. **Authentication:** Bearer JWT tokens in request headers keep endpoints secure and stateless.`
    }

    if (lower.match(/react|next|javascript|js|frontend/)) {
      return `💻 **Frontend Architecture (React 19 & Next.js App Router)**\n\nHere is a quick overview of our frontend architecture:\n\n1. **App Router Structure** — Pages are organized in folder directories under \`client/src/app/...\`.\n2. **Client Components** — Add \`'use client'\` at the top of files that use React hooks (\`useState\`, \`useEffect\`).\n3. **Modern Styling** — Styled using Tailwind CSS with responsive breakpoints and glassmorphic dark theme.\n4. **Fast State Sync** — Synchronizes user profile and task updates seamlessly via localStorage and REST APIs.`
    }

    if (lower.match(/python|flask|backend|mongodb|mongo/)) {
      return `⚙️ **Backend & Database Architecture (Flask & MongoDB)**\n\nHere is how our server is structured:\n\n1. **Flask Modular Blueprints** — Routes are isolated into clean modules (\`auth\`, \`tasks\`, \`attendance\`, \`journals\`).\n2. **MongoDB NoSQL Collections** — Data is stored as flexible JSON documents in MongoDB collections.\n3. **Security Standards** — Passwords hashed with Bcrypt and requests verified using JWT tokens.\n4. **Python Virtual Environment** — Managed inside the \`server/venv\` directory.`
    }

    return `🤖 **Internship Assistant**\n\nRegarding **"${userInput}"**:\n\nI can help you step-by-step with any of the following:\n\n1. **Overall Performance** — Review ratings, completion %, and attendance\n2. **Assigned Tasks** — Check Kanban tasks, deadlines, and submissions\n3. **Coding & Debugging** — Step-by-step help with React, Next.js, Python, Flask, or MongoDB\n4. **Mentor Guidance** — Connect with industry mentors and view feedback\n\nWhat specific topic or error would you like to solve?`
  }

  const startDragging = (e) => {
    e.preventDefault()
    document.onmousemove = (event) => {
      const newWidth = ((window.innerWidth - event.clientX) / window.innerWidth) * 100
      if (newWidth >= 25 && newWidth <= 45) setAiWidth(newWidth)
    }
    document.onmouseup = () => { document.onmousemove = null }
  }

  const handleLogout = () => {
    clearUserSession()
    router.push("/login")
  }

  return (
    <div className="portal-root relative h-screen w-full max-w-full overflow-hidden text-white flex">
      {/* Background Video (Matching Tasks Image 1) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="data:video/mp4;base64," type="video/mp4" />
      </video>

      {/* Dark Overlay (Matching Tasks Image 1) */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      {/* Main Content Layout */}
      <div className="relative z-10 flex w-full h-full min-w-0">
        {/* SIDEBAR (Matches Tasks and all other intern pages) */}
        <InternSidebar active="Dashboard"/>

        {/* MAIN DASHBOARD */}
        <main className="portal-main flex-1 flex flex-col h-screen overflow-y-auto p-6 lg:p-8 gap-6 min-w-0">
          {/* TOP */}
          <div className="flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {userName && userName.trim() ? `Welcome back, ${userName.trim()}!` : "Welcome back!"}
              </h1>
              <p className="text-gray-400 text-sm mt-1">Here is your internship progress, active workflows, and analytics.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 text-gray-400" size={16}/>
                <input
                  type="text"
                  placeholder="Search overview..."
                  className="w-48 sm:w-64 bg-[#0f172a] border border-[#1e293b] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none text-white focus:border-cyan-500/50 transition placeholder-gray-500"
                />
              </div>
              <button
                onClick={() => setOpenAI(true)}
                title="Open AI Mentor"
                className="w-10 h-10 rounded-xl bg-[#0f172a] border border-cyan-500/40 text-cyan-400 hover:text-white hover:bg-cyan-500/20 flex items-center justify-center transition shadow-md cursor-pointer"
              >
                <Bot size={18} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-[#0f172a] border border-[#1e293b] flex items-center justify-center relative hover:bg-[#111827] transition">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-600 text-[9px] font-bold flex items-center justify-center">3</span>
              </button>
              <button onClick={() => router.push("/intern/settings")} title="Profile Settings" className="w-10 h-10 rounded-xl overflow-hidden border border-purple-500/40 hover:border-cyan-400 transition flex-shrink-0 cursor-pointer shadow-md bg-[#0f172a]">
                <img src={userPhoto || DEFAULT_INTERN_AVATAR} className="w-full h-full object-cover" alt="avatar"/>
              </button>
            </div>
          </div>

          {/* ROLE STATUS BANNER */}
          <div className="p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 shadow-xl flex-wrap"
            style={{
              background: assignedRole
                ? "linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(6, 182, 212, 0.16))"
                : "linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(239, 68, 68, 0.16))",
              borderColor: assignedRole ? "rgba(99, 102, 241, 0.4)" : "rgba(245, 158, 11, 0.45)",
            }}>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{
                  background: assignedRole
                    ? "linear-gradient(135deg, #06B6D4, #6366F1)"
                    : "linear-gradient(135deg, #f59e0b, #ef4444)"
                }}>
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full"
                    style={{
                      background: assignedRole ? "rgba(34, 211, 238, 0.2)" : "rgba(245, 158, 11, 0.2)",
                      color: assignedRole ? "#22d3ee" : "#fbbf24",
                      border: `1px solid ${assignedRole ? "rgba(34, 211, 238, 0.4)" : "rgba(245, 158, 11, 0.4)"}`
                    }}>
                    {assignedRole ? "Assigned Specialization" : "Skill Assessment Pending"}
                  </span>
                  {assessmentScore !== null && (
                    <span className="text-xs text-gray-300 font-mono">
                      Score: <strong className="text-white">{assessmentScore}/16</strong> ({Math.round((assessmentScore / 16) * 100)}%)
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-white mt-1.5">
                  {assignedRole ? (
                    <>
                      Role: <span className="text-cyan-300 font-bold">{assignedRole}</span> • Specialized curriculum activated
                    </>
                  ) : (
                    "Complete the 16-question MCQ assessment to unlock your role track and tailored internship tasks!"
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(assignedRole ? "/intern/tasks" : "/intern/assessment")}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition flex items-center gap-2 flex-shrink-0 hover:brightness-110 shadow-lg cursor-pointer"
              style={{
                background: assignedRole
                  ? "linear-gradient(135deg, #06B6D4, #7C3AED)"
                  : "linear-gradient(135deg, #f59e0b, #ef4444)"
              }}>
              {assignedRole ? "View Role Tasks →" : "Take MCQ Test →"}
            </button>
          </div>

          {/* TOP CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard title="Assigned"    value="24"  trend="+12%" trendType="up" subtitle="from last week" color1="#3b82f6" color2="#06b6d4" onClick={()=>router.push("/intern/tasks")}/>
            <StatCard title="Completed"   value="18"  trend="+18%" trendType="up" subtitle="from last week" color1="#10b981" color2="#14b8a6" onClick={()=>router.push("/intern/tasks")}/>
            <StatCard title="Attendance"  value="92%" trend="+5%"  trendType="up" subtitle="from last week" color1="#ec4899" color2="#d946ef" onClick={()=>router.push("/intern/attendance")}/>
            <StatCard title="Performance" value="8.9" trend="+8%"  trendType="up" subtitle="from last week" color1="#f97316" color2="#eab308" onClick={()=>router.push("/intern/analytics")}/>
          </div>

          {/* MIDDLE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PROGRESS */}
            <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] p-6 card-hover shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Internship Progress</h2>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">28 Days Left</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="64" stroke="#1e293b" strokeWidth="12" fill="none"/>
                    <circle cx="80" cy="80" r="64" stroke="url(#gradient)" strokeWidth="12" fill="none" strokeDasharray="402" strokeDashoffset="100" strokeLinecap="round"/>
                    <defs><linearGradient id="gradient"><stop offset="0%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#a855f7"/></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <h3 className="text-3xl font-extrabold text-white">75%</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Completed</p>
                  </div>
                </div>
                <div className="space-y-4 w-full sm:w-auto">
                  <Legend color="bg-purple-500" title="Completed Tasks" value="75%"/>
                  <Legend color="bg-cyan-400" title="In Progress" value="15%"/>
                  <Legend color="bg-pink-500" title="Pending Reviews" value="10%"/>
                </div>
              </div>
            </div>

            {/* CHART */}
            <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] p-6 card-hover shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="text-lg font-bold text-white">Performance Analytics</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Average weekly activity scores</p>
                </div>
                <div className="flex bg-[#111827] border border-[#1e293b] rounded-xl p-1 gap-1">
                  {["Day","Week","Month"].map(p=>(
                    <button key={p} onClick={()=>setPerfPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${perfPeriod===p?"bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow":"text-gray-400 hover:text-white"}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="h-56 w-full min-w-0">
                <ClientChart height={224} minHeight={200}>
                  <AreaChart data={PERF_DATA[perfPeriod]}>
                    <defs>
                      <linearGradient id="blue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b"/>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11}/>
                    <YAxis stroke="#94a3b8" fontSize={11}/>
                    <Tooltip contentStyle={{ backgroundColor:"#0f172a", border:"1px solid #1e293b", borderRadius:"12px" }} labelStyle={{ color:"#94a3b8" }} itemStyle={{ color:"#38bdf8" }} cursor={{ fill:"rgba(56,189,248,0.08)" }}/>
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#blue)"/>
                  </AreaChart>
                </ClientChart>
              </div>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] p-6 card-hover shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4">Recent Activities</h2>
              <div className="space-y-3">
                {liveActivities.slice(0,4).map((a,i) => {
                  const iconEl = a.type==="attendance"||a.type==="checkout"
                    ? <UserCheck size={16}/>
                    : a.type==="task" ? <CheckCircle2 size={16}/>
                    : <FileText size={16}/>
                  return (
                    <ActivityItem key={i} icon={iconEl} title={a.text} time={a.time} color={a.color} onClick={()=>router.push(a.path||"/intern/attendance")}/>
                  )
                })}
              </div>
            </div>
            <div className="bg-[#0f172a] rounded-3xl border border-[#1e293b] p-6 card-hover shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4">Upcoming Deadlines</h2>
              <div className="space-y-3">
                <DeadlineItem title="UI Case Study" days="2 Days" onClick={()=>router.push("/intern/tasks")}/>
                <DeadlineItem title="API Integration" days="4 Days" onClick={()=>router.push("/intern/tasks")}/>
                <DeadlineItem title="Journal Submit" days="7 Days" onClick={()=>router.push("/intern/journals")}/>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI ASSISTANT SLIDE-OVER DRAWER (NEVER SQUISHES DASHBOARD) */}
      {openAI && (
        <>
          <div
            onClick={() => {
              stopSpeaking()
              setOpenAI(false)
            }}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px] transition-opacity cursor-pointer"
          />
          <div className="fixed top-0 right-0 h-screen z-50 border-l border-[#1e293b] flex flex-col shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right duration-300"
            style={{ width: `${Math.max(aiWidth, 32)}%`, minWidth: "380px", maxWidth: "620px", backgroundImage: "url('/dashboard.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#020617" }}>
          {/* DRAG */}
          <div onMouseDown={startDragging} className="absolute left-0 top-0 w-1.5 h-full bg-[#1e293b] hover:bg-cyan-500 cursor-col-resize z-20"/>
          {/* OVERLAY */}
          <div className="absolute inset-0 bg-[#020617]/85 pointer-events-none"/>
          {/* HEADER */}
          <div className="relative z-10 h-14 border-b border-[#1e293b] flex items-center justify-between px-3.5 bg-[#020617]/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
                <Bot size={18} className="text-white"/>
              </div>
              <div>
                <h1 className="text-sm font-bold flex items-center gap-1.5 leading-none">
                  Internship Assistant
                  <span className="text-[10px] font-normal text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    AI Mentor
                  </span>
                </h1>
                <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"/>
                  Voice & Step-by-Step Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Reply Toggle Switch */}
              <button
                type="button"
                onClick={toggleVoiceReply}
                title={voiceReplyEnabled ? "Voice Reply is ON (Click to mute)" : "Voice Reply is OFF (Click to enable)"}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5 border transition cursor-pointer ${
                  voiceReplyEnabled
                    ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                    : "bg-[#111827] text-gray-400 border-[#1e293b] hover:text-white"
                }`}
              >
                {voiceReplyEnabled ? (
                  <>
                    <Volume2 size={13} className="text-cyan-400 animate-pulse" />
                    <span>Voice: ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX size={13} className="text-gray-400" />
                    <span>Voice: OFF</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking()
                  setOpenAI(false)
                }}
                title="Close AI Assistant"
                className="w-8 h-8 rounded-xl bg-[#111827] border border-[#1e293b] flex items-center justify-center hover:bg-red-900/30 text-gray-400 hover:text-white transition"
              >
                <X size={15}/>
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES DISPLAYED CLEARLY ONE AFTER ONE */}
          <div className="relative z-10 flex-1 overflow-y-auto p-3.5 space-y-4 scroll-smooth">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user"
              return (
                <div
                  key={msg.id || index}
                  className={`flex flex-col ${isUser ? "items-end ml-auto max-w-[85%]" : "items-start mr-auto max-w-[96%]"} gap-1`}
                >
                  {/* Meta header (Sender name, avatar, timestamp, audio controls) */}
                  <div className={`flex items-center gap-1.5 text-[11px] px-1 ${isUser ? "text-gray-400 justify-end" : "text-gray-400 justify-between w-full"}`}>
                    {!isUser ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-md bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white">
                            <Bot size={10} />
                          </div>
                          <span className="font-semibold text-cyan-300">Internship Assistant</span>
                          <span className="text-gray-500">• {msg.timestamp || "Just now"}</span>
                        </div>
                        {/* Audio Speak & Copy Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => speakText(msg.text, index)}
                            title={speakingIndex === index ? "Stop speaking" : "Listen (Voice Reply)"}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] flex items-center gap-1 border transition cursor-pointer ${
                              speakingIndex === index
                                ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                                : "bg-[#111827]/80 hover:bg-[#1e293b] text-gray-400 hover:text-cyan-300 border-[#1e293b]"
                            }`}
                          >
                            {speakingIndex === index ? (
                              <>
                                <Square size={10} className="fill-red-400 text-red-400" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={11} className="text-cyan-400" />
                                <span>Voice</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyMessageText(msg.text, index)}
                            title="Copy message"
                            className="p-1 rounded-md bg-[#111827]/80 hover:bg-[#1e293b] text-gray-400 hover:text-cyan-300 border border-[#1e293b] transition cursor-pointer"
                          >
                            {copiedIndex === index ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">{msg.timestamp || "Just now"}</span>
                        <span className="font-medium text-purple-300">{userName || "You"}</span>
                        <img
                          src={userPhoto || DEFAULT_INTERN_AVATAR}
                          alt="User"
                          className="w-4 h-4 rounded-full object-cover border border-purple-400/50"
                        />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble with 14-16px readable typography */}
                  <div
                    className={`p-4 sm:p-4.5 rounded-2xl text-[14px] sm:text-[15px] leading-relaxed shadow-lg ${
                      isUser
                        ? "rounded-tr-sm bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-purple-900/30 break-words"
                        : "rounded-tl-sm bg-[#080e1a]/95 backdrop-blur-md border border-cyan-500/25 text-slate-100 shadow-cyan-950/40 w-full"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    ) : (
                      <MarkdownRenderer text={msg.text} />
                    )}
                  </div>
                </div>
              )
            })}

            {/* Loading typing indicator */}
            {loading && (
              <div className="flex flex-col items-start mr-auto max-w-[85%] gap-1">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 px-1">
                  <div className="w-4 h-4 rounded-md bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white">
                    <Bot size={10} />
                  </div>
                  <span className="font-semibold text-cyan-300">Internship Assistant</span>
                  <span className="text-cyan-400 animate-pulse">is thinking & replying…</span>
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#080e1a]/95 backdrop-blur-md border border-cyan-500/25 flex items-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-cyan-400"
                      style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                  <span className="text-[12px] text-gray-300 ml-1">Formulating step-by-step response…</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          {/* INPUT BAR WITH VOICE CHAT & ATTACHMENTS */}
          <div className="relative z-10 border-t border-[#1e293b] p-2.5 bg-[#020617]/85 backdrop-blur-md">
            {/* Listening Wave Banner when Speech-to-Text active */}
            {isListening && (
              <div className="mb-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-950/90 to-purple-950/90 border border-cyan-500/40 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs text-cyan-200 font-medium">Listening to your voice... Speak now!</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    recognitionRef.current?.stop()
                    setIsListening(false)
                    if (message.trim()) sendMessage()
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-[11px] font-bold transition cursor-pointer"
                >
                  Done & Send
                </button>
              </div>
            )}

            <div className={`bg-[#111827]/90 rounded-2xl flex items-center gap-2 px-2.5 py-2 border transition ${
              isListening ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)]" : "border-[#1e293b] focus-within:border-cyan-500/50"
            }`}>
              {/* Attachment menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={()=>setShowAttachMenu(!showAttachMenu)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${showAttachMenu?"bg-purple-600/40":"bg-[#1e293b] hover:bg-purple-900/30 text-gray-400 hover:text-white"}`}
                >
                  <Paperclip size={15}/>
                </button>
                {showAttachMenu && (
                  <div className="absolute bottom-11 left-0 bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden z-50 w-44 shadow-2xl backdrop-blur-lg">
                    <label className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-[#1e293b] text-xs border-b border-[#1e293b] transition">
                      <FolderOpen size={13} className="text-cyan-400"/> Open File Explorer
                      <input
                        ref={fileInputRef}
                        type="file"
                        style={{ display:"none" }}
                        onChange={e=>{
                          if(e.target.files[0]){
                            const fname = e.target.files[0].name
                            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            setMessages(p=>[
                              ...p,
                              { id:`u-${Date.now()}`, role:"user", text:`📎 Attached file: ${fname}`, timestamp: timeStr },
                              { id:`ai-${Date.now()}`, role:"ai", text:`I see you attached **${fname}**. Paste its code or description here and I'll analyze it!`, timestamp: timeStr }
                            ])
                            setShowAttachMenu(false)
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={openAICamera}
                      className="flex items-center gap-2 px-3 py-2.5 hover:bg-[#1e293b] text-xs w-full text-left border-b border-[#1e293b] transition cursor-pointer"
                    >
                      <Camera size={13} className="text-pink-400"/> Camera (Webcam)
                    </button>
                    <button
                      type="button"
                      onClick={startMic}
                      className={`flex items-center gap-2 px-3 py-2.5 hover:bg-[#1e293b] text-xs w-full text-left transition cursor-pointer ${isListening?"text-green-400 font-medium":"text-white"}`}
                    >
                      <Mic size={13} className={isListening?"text-green-400":"text-yellow-400"}/> {isListening?"🔴 Stop & Send":"Voice Chat (Mic)"}
                    </button>
                  </div>
                )}
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder={isListening ? "Listening to voice input…" : "Ask anything (e.g. 'show performance', 'how to build API')…"}
                className="flex-1 bg-transparent outline-none text-[13px] sm:text-[14px] text-white placeholder-gray-500"
              />

              {/* Mic / Voice Chat shortcut button */}
              <button
                type="button"
                onClick={startMic}
                title={isListening ? "Stop listening and send" : "Voice Chat (Speak into microphone)"}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                  isListening
                    ? "bg-red-500/30 border border-red-500/60 text-red-400 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    : "bg-[#1e293b] hover:bg-purple-900/40 text-gray-400 hover:text-cyan-400"
                }`}
              >
                <Mic size={15} className={isListening ? "text-red-400" : "text-gray-400 hover:text-cyan-400"}/>
              </button>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading || !message.trim()}
                title="Send message"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                  loading || !message.trim()
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:scale-105 active:scale-95 shadow-md shadow-purple-900/30 cursor-pointer"
                }`}
              >
                <Send size={15}/>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 px-1">
              <span>Enter to send • 📎 attach photo/file • 🎤 voice chat</span>
              <span className="text-cyan-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/>
                Free AI Online
              </span>
            </div>
          </div>
          </div>
        </>
      )}

      {/* FLOATING ASSISTANT ICON (BOTTOM RIGHT) */}
      {!openAI && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center">
          <button
            onClick={() => setOpenAI(true)}
            title="Open Internship Assistant"
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-medium shadow-[0_0_25px_rgba(124,58,237,0.55)] hover:shadow-[0_0_35px_rgba(6,182,212,0.85)] border border-cyan-400/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer backdrop-blur-xl"
          >
            <div className="relative flex items-center justify-center">
              <Bot size={22} className="text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#020617] animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#020617]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[12px] font-bold leading-tight flex items-center gap-1.5">
                Internship Assistant
                <Sparkles size={12} className="text-yellow-300 animate-pulse" />
              </span>
              <span className="text-[10px] text-cyan-200/80 font-normal">Ask anything • Step-by-step</span>
            </div>
          </button>
        </div>
      )}

      {/* AI CAMERA MODAL */}
      {showAICamera && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-[440px] flex flex-col items-center gap-4">
            <div className="flex justify-between items-center w-full">
              <span className="text-sm font-bold flex items-center gap-2"><Camera size={14}/> Camera</span>
              <button onClick={()=>{ aiStreamRef.current?.getTracks().forEach(t=>t.stop()); setShowAICamera(false) }}><X size={14} className="text-gray-400"/></button>
            </div>
            <video ref={aiVideoRef} autoPlay playsInline muted className="w-full rounded-xl bg-black max-h-64 object-cover"/>
            <div className="flex gap-3 w-full">
              <button onClick={()=>{ aiStreamRef.current?.getTracks().forEach(t=>t.stop()); setShowAICamera(false) }} className="flex-1 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-gray-400">Cancel</button>
              <button onClick={captureAIPhoto} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold flex items-center justify-center gap-1"><Camera size={12}/> Capture</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CARD_DATA = {
  Assigned:    [{ day:"Mon",v:3 },{ day:"Tue",v:5 },{ day:"Wed",v:4 },{ day:"Thu",v:7 },{ day:"Fri",v:6 },{ day:"Sat",v:9 },{ day:"Sun",v:8 }],
  Completed:   [{ day:"Mon",v:2 },{ day:"Tue",v:4 },{ day:"Wed",v:6 },{ day:"Thu",v:5 },{ day:"Fri",v:8 },{ day:"Sat",v:9 },{ day:"Sun",v:10 }],
  Attendance:  [{ day:"Mon",v:70 },{ day:"Tue",v:80 },{ day:"Wed",v:88 },{ day:"Thu",v:75 },{ day:"Fri",v:92 },{ day:"Sat",v:85 },{ day:"Sun",v:95 }],
  Performance: [{ day:"Mon",v:4 },{ day:"Tue",v:5 },{ day:"Wed",v:6 },{ day:"Thu",v:7 },{ day:"Fri",v:7 },{ day:"Sat",v:8 },{ day:"Sun",v:9 }],
}

function StatCard({ title, value, trend, trendType, subtitle, color1, color2, onClick }) {
  const [hovered, setHovered] = useState(false)
  const data = CARD_DATA[title] || CARD_DATA.Assigned
  const gradId = `sc-${title.replace(/\s+/g,"")}`
  const unit = title === "Attendance" ? "%" : ""

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden bg-[#0f172a] border rounded-3xl flex flex-col cursor-pointer transition-all duration-300 shadow-lg"
      style={{
        minHeight:"160px",
        borderColor: hovered ? color2 : "#1e293b",
        boxShadow: hovered ? `0 0 22px ${color2}40` : "none",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* subtle colour tint */}
      <div className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-300"
        style={{ background:`linear-gradient(160deg, ${color1}55, ${color2}22)`, opacity: hovered ? 0.22 : 0.10 }}/>

      {/* TEXT */}
      <div className="relative z-10 px-5 pt-4 pb-1 flex-shrink-0">
        <p className="text-xs font-semibold tracking-wider uppercase transition-colors duration-200"
          style={{ color: hovered ? color2 : "#94a3b8" }}>
          {title}
        </p>
        <h3
          className="text-3xl font-extrabold leading-tight mt-1 transition-all duration-200"
          style={{
            color: hovered ? "#ffffff" : "#f1f5f9",
            textShadow: hovered ? `0 0 20px ${color2}99` : "none",
          }}
        >
          {value}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: trendType==="up" ? "#4ade80" : "#f87171" }}>
          {trendType === "up" ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
          <span className="font-semibold">{trend}</span>
          <span className="text-gray-400 ml-0.5">{subtitle}</span>
        </div>
      </div>

      {/* REAL CHART */}
      <div className="relative z-10 w-full min-w-0" style={{ height:"90px" }}>
        <ClientChart height={90} minHeight={85}>
          <AreaChart data={data} margin={{ top:8, right:12, bottom:0, left:-20 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color2} stopOpacity={hovered ? 0.7 : 0.5}/>
                <stop offset="100%" stopColor={color1} stopOpacity={0.03}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="day" stroke="#334155" tick={{ fill:"#64748b", fontSize:10 }} tickLine={false} axisLine={false}/>
            <YAxis stroke="#334155" tick={{ fill:"#64748b", fontSize:10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}${unit}`}/>
            <Tooltip
              contentStyle={{ backgroundColor:"#0f172a", border:`1px solid ${color2}55`, borderRadius:"10px", padding:"6px 10px" }}
              labelStyle={{ color:"#94a3b8", fontSize:"11px", marginBottom:"2px" }}
              itemStyle={{ color:color2, fontSize:"12px", fontWeight:"bold" }}
              formatter={v => [`${v}${unit}`, title]}
              cursor={{ stroke:color2, strokeWidth:1, strokeDasharray:"4 2" }}
            />
            <Area type="monotone" dataKey="v" stroke={color2} strokeWidth={2.5} fill={`url(#${gradId})`}
              dot={false} activeDot={{ r:4, fill:color2, stroke:"#0f172a", strokeWidth:2 }}/>
          </AreaChart>
        </ClientChart>
      </div>
    </div>
  )
}

function Legend({ color, title, value }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex items-center gap-2.5">
        <div className={`w-3.5 h-3.5 rounded-full ${color}`}/>
        <span className="text-sm text-gray-300 font-medium">{title}</span>
      </div>
      <span className="text-purple-400 text-sm font-bold">{value}</span>
    </div>
  )
}

function ActivityItem({ icon, title, time, color, onClick }) {
  const getTimeColor = (t) => {
    if (t.includes("2h")) return "text-red-400"
    if (t.includes("5h")) return "text-blue-400"
    return "text-green-400"
  }
  return (
    <div onClick={onClick} className="flex items-center gap-3.5 bg-[#111827] rounded-2xl px-4 py-3 cursor-pointer hover:bg-[#1e293b] transition border border-[#1e293b]/70 shadow-sm">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0 text-white`}>{icon}</div>
      <h3 className="text-sm font-medium text-white truncate flex-1">{title}</h3>
      <div className={`text-xs font-semibold whitespace-nowrap ${getTimeColor(time)}`}>{time}</div>
    </div>
  )
}

function DeadlineItem({ title, days, onClick }) {
  const num = parseInt(days)
  let percent = 0, barColor = "", textColor = ""
  if (num <= 2) { percent = 20; barColor = "bg-red-500"; textColor = "text-red-400" }
  else if (num <= 4) { percent = 50; barColor = "bg-blue-500"; textColor = "text-blue-400" }
  else { percent = 100; barColor = "bg-green-500"; textColor = "text-green-400" }
  return (
    <div onClick={onClick} className="flex items-center gap-3.5 bg-[#111827] rounded-2xl px-4 py-3 cursor-pointer hover:bg-[#1e293b] transition border border-[#1e293b]/70 shadow-sm">
      <h3 className="text-sm font-medium text-white whitespace-nowrap">{title}</h3>
      <div className="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width:`${percent}%` }}/>
      </div>
      <div className={`text-xs font-semibold whitespace-nowrap ${textColor}`}>{days}</div>
    </div>
  )
}
