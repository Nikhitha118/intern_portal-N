/** Mentor portal auto check-in / check-out (localStorage) */

export const KEY_MENTOR_ATTENDANCE = "mentorAttendanceRecords"
export const KEY_MENTOR_SESSION = "mentorActiveSession"

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function formatTime(d = new Date()) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

export function formatDate(d = new Date()) {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
}

function deriveStatus(checkInDate) {
  const h = checkInDate.getHours()
  const m = checkInDate.getMinutes()
  if (h > 9 || (h === 9 && m > 15)) return "Late"
  return "Present"
}

function readRecords() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY_MENTOR_ATTENDANCE) || "[]")
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function writeRecords(records) {
  localStorage.setItem(KEY_MENTOR_ATTENDANCE, JSON.stringify(records))
  try {
    window.dispatchEvent(new CustomEvent(KEY_MENTOR_ATTENDANCE, { detail: records }))
  } catch {}
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY_MENTOR_SESSION) || "null")
  } catch {
    return null
  }
}

function writeSession(session) {
  if (session) localStorage.setItem(KEY_MENTOR_SESSION, JSON.stringify(session))
  else localStorage.removeItem(KEY_MENTOR_SESSION)
}

export function getActiveSession() {
  const s = getSession()
  if (!s || s.checkOutIso) return null
  if (s.dateKey !== todayKey()) return null
  return s
}

export function getMentorAttendanceRecords() {
  return readRecords().sort(
    (a, b) => new Date(b.checkInIso || 0) - new Date(a.checkInIso || 0)
  )
}

/** Call when mentor portal opens */
export function mentorCheckIn(user = {}) {
  const existing = getActiveSession()
  if (existing) return existing

  const now = new Date()
  const record = {
    id: `mentor-att-${now.getTime()}`,
    mentorName: user.fullName || "Mentor",
    mentorId: user.id || user.fullName || "mentor",
    date: formatDate(now),
    dateKey: todayKey(now),
    checkIn: formatTime(now),
    checkOut: "-",
    checkInIso: now.toISOString(),
    checkOutIso: null,
    status: deriveStatus(now),
    source: "mentor-portal",
  }

  const records = readRecords().filter((r) => r.id !== record.id)
  writeRecords([record, ...records])
  writeSession(record)
  return record
}

/** Call when mentor portal closes or tab unloads */
export function mentorCheckOut() {
  const session = getSession()
  if (!session || session.checkOutIso) return null

  const now = new Date()
  const updated = {
    ...session,
    checkOut: formatTime(now),
    checkOutIso: now.toISOString(),
    status: deriveStatus(new Date(session.checkInIso)),
  }

  writeRecords(readRecords().map((r) => (r.id === session.id ? updated : r)))
  writeSession(null)
  return updated
}
