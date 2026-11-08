// ─── Central API — all frontend calls go through here ────────────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

async function req(path, opts = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...opts,
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, data, status: res.status }
  } catch {
    return { ok: false, data: {}, status: 0 }
  }
}

const get = (p) => req(p)
const post = (p, b) => req(p, { method: "POST", body: JSON.stringify(b) })
const put = (p, b) => req(p, { method: "PUT", body: JSON.stringify(b) })
const del = (p) => req(p, { method: "DELETE" })
const patch = (p, b) => req(p, { method: "PATCH", body: JSON.stringify(b) })

export const api = {
  // ── AUTH (shared) ──────────────────────────────────────────────────────────
  login: (b) => post("/auth/login", b),
  register: (b) => post("/auth/register", b),
  demoLogin: () => get("/auth/demo-login"),
  oauthStatus: () => get("/auth/oauth/status"),
  getOAuthUrl: (p, r) => get(`/auth/oauth/authorize/${p}?role=${r || "intern"}&format=json`),
  profile: (id) => get(`/auth/profile/${id}`),
  updateProfile: (id, b) => put(`/auth/profile/${id}`, b),
  deleteAccount: (id) => del(`/auth/profile/${id}`),
  changePassword: (b) => post("/auth/change-password", b),

  // ── INTERN — TASKS (/intern/tasks) ─────────────────────────────────────────
  getTasks: (uid) => get(`/intern/tasks${uid ? `?userId=${uid}` : ""}`),
  getTaskSummary: (uid) => get(`/intern/tasks/summary${uid ? `?userId=${uid}` : ""}`),
  getDashboardSummary: (uid) => get(`/intern/dashboard/summary${uid ? `?userId=${uid}` : ""}`),
  createTask: (b) => post("/intern/tasks/", b),
  updateTask: (id, b) => put(`/intern/tasks/${id}`, b),
  deleteTask: (id) => del(`/intern/tasks/${id}`),
  patchTask: (id, b) => patch(`/intern/tasks/${id}/status`, b),
  submitTask: (id, b) => post(`/intern/tasks/${id}/submit`, b),

  // ── INTERN — JOURNALS (/intern/journals) ───────────────────────────────────
  getJournals: (uid) => get(`/intern/journals/${uid ? `?userId=${uid}` : ""}`),
  createJournal: (b) => post("/intern/journals/", b),
  updateJournal: (id, b) => put(`/intern/journals/${id}`, b),
  deleteJournal: (id) => del(`/intern/journals/${id}`),
  addJournalComment: (id, b) => post(`/intern/journals/${id}/comment`, b),

  // ── INTERN — ATTENDANCE (/intern/attendance) ───────────────────────────────
  checkIn: (b) => post("/intern/attendance/checkin", b),
  checkOut: (id, b) => patch(`/intern/attendance/checkout/${id}`, b),
  getAttendance: (uid) => get(`/intern/attendance/all${uid ? `?userId=${uid}` : ""}`),
  getStats: (uid) => get(`/intern/attendance/stats${uid ? `?userId=${uid}` : ""}`),
  updateAttendance: (id, b) => patch(`/intern/attendance/${id}`, b),
  deleteAttendance: (id) => del(`/intern/attendance/${id}`),

  // ── INTERN — CALENDAR (/intern/calendar) ───────────────────────────────────
  getEvents: (uid) => get(`/intern/calendar/all${uid ? `?userId=${uid}` : ""}`),
  addEvent: (b) => post("/intern/calendar/add", b),
  getUpcoming: (uid) => get(`/intern/calendar/upcoming${uid ? `?userId=${uid}` : ""}`),
  deleteEvent: (id) => del(`/intern/calendar/${id}`),

  // ── INTERN — SETTINGS (/intern/settings) ───────────────────────────────────
  getSettings: (uid) => get(`/intern/settings/${uid}`),
  updateSettings: (uid, b) => put(`/intern/settings/${uid}`, b),

  // ── SHARED — MENTORS (/mentors) ────────────────────────────────────────────
  getMentors: () => get("/mentors/all"),
  addMentor: (b) => post("/mentors/add", b),
  connect: (id, b) => post(`/mentors/connect/${id}`, b),

  // ── SHARED — MESSAGES (/messages) ─────────────────────────────────────────
  sendMsg: (b) => post("/messages/send", b),
  getConvo: (a, b) => get(`/messages/conversation?senderId=${a}&receiverId=${b}`),
  getConvos: (uid) => get(`/messages/conversations/${uid}`),
  markRead: (b) => patch("/messages/read", b),

  // ── MENTOR — EVALUATIONS (/mentor) ────────────────────────────────────────
  getRubrics: () => get("/mentor/rubrics"),
  createRubric: (b) => post("/mentor/rubrics", b),
  deleteRubric: (id) => del(`/mentor/rubrics/${id}`),
  submitEval: (b) => post("/mentor/evaluations/submit", b),
  getEvals: (id) => get(`/mentor/evaluations/intern/${id}`),
  getAllEvals: () => get("/mentor/evaluations/all"),
  getSubmissions: (uid) => get(`/mentor/submissions${uid ? `?internId=${uid}` : ""}`),
  submitDoc: (b) => post("/mentor/submissions", b),
  reviewSubmission: (id, b) => patch(`/mentor/submissions/${id}/review`, b),
  addFeedback: (b) => post("/mentor/feedback", b),
  getFeedback: (uid) => get(`/mentor/feedback${uid ? `?mentorId=${uid}` : ""}`),
  getPerformance: (id) => get(`/mentor/performance/${id}`),

  // ── ADMIN (/admin) ─────────────────────────────────────────────────────────
  adminOverview: () => get("/admin/overview"),
  adminGetUsers: () => get("/admin/users"),
  adminDeleteUser: (id) => del(`/admin/users/${id}`),
  adminChangeRole: (id, b) => patch(`/admin/users/${id}/role`, b),
  adminGetAllTasks: () => get("/admin/interns/tasks"),
  adminGetAllAtt: () => get("/admin/interns/attendance"),
  adminGetAllJournals: () => get("/admin/interns/journals"),
  adminGetAllEvals: () => get("/admin/mentors/evaluations"),
  adminGetLogs: () => get("/admin/logs"),
  adminInstOverview: () => get("/admin/institution/overview"),

  // ── INSTITUTION (/institution) ─────────────────────────────────────────────
  instOverview: () => get("/institution/overview"),
  instScoreAnalytics: () => get("/institution/score-analytics"),
  instGetReports: () => get("/institution/reports"),
  instGenReport: (b) => post("/institution/reports/generate", b),
  instDeleteReport: (id) => del(`/institution/reports/${id}`),
  instGetSettings: (uid) => get(`/institution/settings/${uid}`),
  instUpdateSettings: (uid, b) => put(`/institution/settings/${uid}`, b),
}

export const DEFAULT_INTERN_AVATAR = "/intern-avatar.jpg"

export function getInternPhoto() {
  if (typeof window === "undefined") return DEFAULT_INTERN_AVATAR
  try {
    const custom = localStorage.getItem("intern_user_photo")
    if (custom && custom.trim()) return custom
    const u = JSON.parse(localStorage.getItem("user_intern") || localStorage.getItem("user") || "{}")
    if (u?.photo && u.photo.trim()) return u.photo
  } catch { }
  return DEFAULT_INTERN_AVATAR
}

export function setInternPhoto(photoUrl) {
  if (typeof window === "undefined") return
  try {
    const url = photoUrl || DEFAULT_INTERN_AVATAR
    localStorage.setItem("intern_user_photo", url)
    const rawUser = JSON.parse(localStorage.getItem("user") || "{}")
    const rawIntern = JSON.parse(localStorage.getItem("user_intern") || "{}")
    localStorage.setItem("user", JSON.stringify({ ...rawUser, photo: url }))
    localStorage.setItem("user_intern", JSON.stringify({ ...rawIntern, photo: url }))
    window.dispatchEvent(new Event("intern_photo_updated"))
    window.dispatchEvent(new Event("storage"))
  } catch { }
}

export function clearUserSession() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("user_intern")
    localStorage.removeItem("user_mentor")
    localStorage.removeItem("user_institution")
    localStorage.removeItem("user_admin")
    localStorage.removeItem("user_evaluator")
    localStorage.removeItem("login_user_name")
    localStorage.removeItem("login_email")
    localStorage.removeItem("intern_user_photo")
    localStorage.removeItem("intern_assigned_role")
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new Event("user_session_updated"))
    window.dispatchEvent(new Event("intern_role_updated"))
    window.dispatchEvent(new Event("intern_photo_updated"))
  } catch { }
}

export function enrichUserCredentials(u) {
  if (!u || typeof u !== "object") u = {}

  // 1. Check direct properties from authenticated user object
  let name = (u.fullName || u.name || "").trim()
  const isGeneric = !name || ["user", "intern user", "null", "undefined"].includes(name.toLowerCase())

  if (isGeneric && typeof window !== "undefined") {
    // 2. Check if user's specific email has a registered account profile in local registry
    const email = (u.email || localStorage.getItem("login_email") || "").trim().toLowerCase()
    if (email) {
      try {
        const storedAcct = JSON.parse(localStorage.getItem(`account_${email}`) || "null")
        if (storedAcct?.fullName && !["user", "intern user"].includes(storedAcct.fullName.trim().toLowerCase())) {
          name = storedAcct.fullName.trim()
        }
      } catch { }
    }

    // 3. Check active session stored object
    if (!name || ["user", "intern user"].includes(name.toLowerCase())) {
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}")
        if (stored?.fullName && !["user", "intern user"].includes(stored.fullName.trim().toLowerCase())) {
          name = stored.fullName.trim()
        }
      } catch { }
    }

    // 4. Check explicit session name if it matches
    if (!name || ["user", "intern user"].includes(name.toLowerCase())) {
      const explicit = (localStorage.getItem("login_user_name") || "").trim()
      if (explicit && !["user", "intern user"].includes(explicit.toLowerCase())) {
        name = explicit
      }
    }
  }

  // If still generic or empty, leave as clean empty string (NO hardcoded placeholders or email prefixes)
  if (isGeneric && (!name || ["user", "intern user"].includes(name.toLowerCase()))) {
    name = ""
  }

  const id = u.id || u._id || ""
  const photo = (typeof window !== "undefined" && localStorage.getItem("intern_user_photo")) || u.photo || DEFAULT_INTERN_AVATAR

  return {
    ...u,
    id: id,
    _id: id,
    fullName: name,
    name: name,
    photo: photo,
  }
}

export function resolveInternName(u) {
  if (!u || typeof u !== "object") {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("user_intern") || localStorage.getItem("user")
        if (raw) u = JSON.parse(raw)
      } catch { u = {} }
    } else {
      u = {}
    }
  }

  const enriched = enrichUserCredentials(u || {})
  const name = (enriched.fullName || enriched.name || "").trim()
  if (name && !["user", "intern user", "null", "undefined"].includes(name.toLowerCase())) {
    return name
  }
  return ""
}

export function getUser() {
  try {
    const raw = localStorage.getItem("user")
    return enrichUserCredentials(raw ? JSON.parse(raw) : {})
  } catch { return {} }
}

// Role-specific getters — each portal reads its own user so logins don't cross-contaminate
export function getInternUser() {
  try {
    const roleUser = localStorage.getItem("user_intern")
    if (roleUser) return enrichUserCredentials(JSON.parse(roleUser))
    // Fallback: prefer intern/no-role, but allow shared demo users too
    const u = JSON.parse(localStorage.getItem("user") || "{}")
    if (u.role === "intern" || !u.role) return enrichUserCredentials(u)
    // If user_intern is not set, still return current user so intern pages can work in demos
    return enrichUserCredentials(u)
  } catch { return {} }
}

export function getMentorUser() {
  try {
    const roleUser = localStorage.getItem("user_mentor") || localStorage.getItem("user_evaluator")
    if (roleUser) return JSON.parse(roleUser)
    const u = JSON.parse(localStorage.getItem("user") || "{}")
    return (u.role === "mentor" || u.role === "evaluator") ? u : {}
  } catch { return {} }
}

export function getInstitutionUser() {
  try {
    const roleUser = localStorage.getItem("user_institution")
    if (roleUser) return JSON.parse(roleUser)
    const u = JSON.parse(localStorage.getItem("user") || "{}")
    return u.role === "institution" ? u : {}
  } catch { return {} }
}

// ─── User-Specific Progress Calculator & Sync Helper ────────────────────────
export async function fetchInternProgress(userId) {
  if (!userId) {
    return {
      totalTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      submittedTasks: 0,
      completedTasks: 0,
      rejectedTasks: 0,
      overallProgress: 0,
      attendance: { total: 0, present: 0, percentage: 0 },
      recentActivities: [],
      upcomingDeadlines: []
    }
  }

  try {
    const res = await api.getDashboardSummary(userId)
    if (res.ok && res.data) {
      const d = res.data
      let totalTasks = Number(d.totalTasks) || 0
      let completedTasks = Number(d.completedTasks) || 0
      let submittedTasks = Number(d.submittedTasks) || 0
      let inProgressTasks = Number(d.inProgressTasks) || 0
      let pendingTasks = Number(d.pendingTasks) || 0
      let rejectedTasks = Number(d.rejectedTasks) || 0
      let overallProgress = Math.min(100, Math.max(0, Number(d.overallProgress) || 0))

      // If backend has 0 tasks, check local tasks saved for this user
      if (totalTasks === 0 && typeof window !== "undefined") {
        try {
          const localTasks = JSON.parse(
            localStorage.getItem(`tasks_${userId}`) ||
            localStorage.getItem("tasks") ||
            "[]"
          )
          if (Array.isArray(localTasks) && localTasks.length > 0) {
            totalTasks = localTasks.length
            completedTasks = localTasks.filter(t => t.status === "Completed" || t.pct === 100).length
            submittedTasks = localTasks.filter(t => t.status === "Submitted" || t.status === "Pending Review").length
            inProgressTasks = localTasks.filter(t => t.status === "In Progress" && (t.pct || t.progress || 0) < 100).length
            pendingTasks = localTasks.filter(t => (t.status === "Pending" || !t.status) && (t.pct || t.progress || 0) < 100).length
            rejectedTasks = localTasks.filter(t => t.status === "Rejected").length
            overallProgress = Math.round((completedTasks / totalTasks) * 100)
          }
        } catch { }
      }

      const summary = {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        submittedTasks,
        completedTasks,
        rejectedTasks,
        overallProgress,
        attendance: {
          total: Number(d.attendance?.total) || 0,
          present: Number(d.attendance?.present) || 0,
          late: Number(d.attendance?.late) || 0,
          absent: Number(d.attendance?.absent) || 0,
          attended: Number(d.attendance?.attended) || 0,
          percentage: Number(d.attendance?.percentage) || 0,
        },
        recentActivities: Array.isArray(d.recentActivities) ? d.recentActivities : [],
        upcomingDeadlines: Array.isArray(d.upcomingDeadlines) ? d.upcomingDeadlines : [],
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(`intern_progress_${userId}`, JSON.stringify(summary))
        window.dispatchEvent(new CustomEvent("intern_progress_updated", { detail: summary }))
      }
      return summary
    }
  } catch { }

  // Fallback to cached progress if offline
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(`intern_progress_${userId}`)
      if (cached) return JSON.parse(cached)
    } catch { }
  }

  return {
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overallProgress: 0,
    attendance: { total: 0, present: 0, percentage: 0 },
    recentActivities: [],
    upcomingDeadlines: []
  }
}

export function getStoredInternProgress(userId) {
  if (typeof window === "undefined" || !userId) {
    return {
      totalTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      overallProgress: 0,
      attendance: { total: 0, present: 0, percentage: 0 },
      recentActivities: [],
      upcomingDeadlines: []
    }
  }
  try {
    const raw = localStorage.getItem(`intern_progress_${userId}`)
    if (raw) return JSON.parse(raw)
  } catch { }
  return {
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overallProgress: 0,
    attendance: { total: 0, present: 0, percentage: 0 },
    recentActivities: [],
    upcomingDeadlines: []
  }
}
