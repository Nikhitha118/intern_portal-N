/** Intern ↔ mentor evaluations & task submissions via localStorage */
import { canonicalInternId } from "./chatSync"

export const KEY_INTERN_EVALUATIONS = "internEvaluations"
export const KEY_INTERN_SUBMISSIONS = "internSubmissions"

export function internKeyFromUser(user) {
  const name = (user?.fullName || user?.name || "").trim()
  return canonicalInternId(name, user?.id ? `intern-${user.id}` : null)
}

function readJson(key, fallback = []) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]")
    return Array.isArray(raw) ? raw : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
  try {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue: JSON.stringify(data),
        storageArea: localStorage,
      })
    )
    window.dispatchEvent(new CustomEvent(key, { detail: data }))
  } catch {}
}

/** Backfill internId on older submissions missing it */
export function repairSubmissionsInternIds() {
  const subs = readJson(KEY_INTERN_SUBMISSIONS)
  let changed = false
  const fixed = subs.map((s) => {
    if (!s.internId && (s.intern || s.internUserId)) {
      changed = true
      return {
        ...s,
        internId: internKeyFromUser({
          fullName: s.intern,
          id: s.internUserId,
        }),
      }
    }
    return s
  })
  if (changed) writeJson(KEY_INTERN_SUBMISSIONS, fixed)
  return fixed
}

function firstName(user) {
  return (user?.fullName || user?.name || "").trim().split(/\s+/)[0]?.toLowerCase() || ""
}

/** Whether a saved row belongs to the logged-in intern */
export function matchesInternRecord(rec, user) {
  if (!rec) return false
  repairSubmissionsInternIds()

  const key = internKeyFromUser(user)
  const uid = user?.id != null ? String(user.id) : ""
  const fn = firstName(user)

  if (rec.internId && rec.internId === key) return true
  if (uid && rec.internUserId != null && String(rec.internUserId) === uid) return true

  const recName = (rec.internName || rec.intern || "").trim().toLowerCase()
  const userName = (user?.fullName || user?.name || "").trim().toLowerCase()
  if (recName && userName) {
    if (recName === userName) return true
    if (fn && recName.includes(fn)) return true
    const recFirst = recName.split(/\s+/)[0]
    if (recFirst && userName.includes(recFirst)) return true
  }
  return false
}

export function gradeLabel(total) {
  if (total >= 90) return "Excellent"
  if (total >= 75) return "Very Good"
  if (total >= 60) return "Good"
  return "Needs Improvement"
}

export function appendSubmission(sub) {
  const internName = sub.intern || sub.internName || "Intern"
  const internUserId = sub.internUserId || ""
  const internId =
    sub.internId ||
    internKeyFromUser({ fullName: internName, id: internUserId })

  const row = {
    ...sub,
    intern: internName,
    internId,
    internUserId,
    id: sub.id || Date.now().toString(),
    status: sub.status || "Pending Review",
    submittedAt: sub.submittedAt || new Date().toISOString(),
  }
  const existing = readJson(KEY_INTERN_SUBMISSIONS)
  const filtered = existing.filter(
    (s) =>
      !(
        s.internId === internId &&
        s.task === row.task &&
        s.status === "Pending Review"
      )
  )
  writeJson(KEY_INTERN_SUBMISSIONS, [row, ...filtered])
  return row
}

export function updateSubmission(id, patch) {
  const existing = readJson(KEY_INTERN_SUBMISSIONS)
  const updated = existing.map((s) =>
    String(s.id) === String(id) || String(s._id) === String(id) ? { ...s, ...patch } : s
  )
  writeJson(KEY_INTERN_SUBMISSIONS, updated)
  return updated
}

export function getSubmissionsForIntern(user) {
  repairSubmissionsInternIds()
  return readJson(KEY_INTERN_SUBMISSIONS)
    .filter((s) => matchesInternRecord(s, user))
    .sort(
      (a, b) =>
        new Date(b.submittedAt || b.submittedOn || 0) -
        new Date(a.submittedAt || a.submittedOn || 0)
    )
}

export function getSubmissionForTask(user, taskName) {
  return getSubmissionsForIntern(user).find((s) => s.task === taskName)
}

/** All submissions (mentor portal) — newest first */
export function getAllSubmissions() {
  repairSubmissionsInternIds()
  return readJson(KEY_INTERN_SUBMISSIONS).sort(
    (a, b) => new Date(b.submittedAt || b.submittedOn || 0) - new Date(a.submittedAt || a.submittedOn || 0)
  )
}

export function getPendingSubmissions() {
  return getAllSubmissions().filter((s) => s.status === "Pending Review")
}

/** Trigger browser download for a submitted file */
export function downloadSubmissionFile(sub) {
  const name = sub?.file || "submission"
  if (sub?.fileData) {
    const a = document.createElement("a")
    a.href = sub.fileData
    a.download = name
    a.rel = "noopener"
    document.body.appendChild(a)
    a.click()
    a.remove()
    return true
  }
  const blob = new Blob(
    [`Placeholder for: ${name}\n\nRe-submit from the intern portal to attach a downloadable copy.`],
    { type: "text/plain" }
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name.includes(".") ? name : `${name}.txt`
  a.click()
  URL.revokeObjectURL(url)
  return false
}

export function isImageSubmission(sub) {
  const mime = sub?.fileMime || ""
  const name = (sub?.file || "").toLowerCase()
  return mime.startsWith("image/") || /\.(jpe?g|png|gif|webp|bmp)$/i.test(name)
}

export function saveInternEvaluation(evalRow) {
  const internName = evalRow.internName || evalRow.intern || "Intern"
  const internUserId = evalRow.internUserId || ""
  const internId =
    evalRow.internId ||
    internKeyFromUser({ fullName: internName, id: internUserId })

  const row = {
    ...evalRow,
    internName,
    internId,
    internUserId,
    id: evalRow.id || Date.now().toString(),
    type: evalRow.type || "performance",
    submittedAt: evalRow.submittedAt || new Date().toISOString(),
    gradeLabel: evalRow.gradeLabel || gradeLabel(evalRow.totalScore || 0),
  }
  const existing = readJson(KEY_INTERN_EVALUATIONS)
  const withoutDup = existing.filter(
    (e) =>
      e.id !== row.id &&
      !(
        row.submissionId &&
        String(e.submissionId) === String(row.submissionId)
      )
  )
  writeJson(KEY_INTERN_EVALUATIONS, [row, ...withoutDup])
  return row
}

export function getEvaluationsForIntern(user) {
  repairSubmissionsInternIds()
  return readJson(KEY_INTERN_EVALUATIONS)
    .filter((e) => matchesInternRecord(e, user))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
}

export function getEvaluationForSubmission(user, submissionId) {
  return getEvaluationsForIntern(user).find(
    (e) => submissionId && String(e.submissionId) === String(submissionId)
  )
}

export const DEFAULT_RUBRICS = [
  { name: "Technical Skills", weight: 30, max: 30 },
  { name: "Problem Solving", weight: 20, max: 20 },
  { name: "Code Quality", weight: 20, max: 20 },
  { name: "Documentation", weight: 15, max: 15 },
  { name: "Communication", weight: 15, max: 15 },
]

export const DEFAULT_CRITERIA_COMMENTS = {
  "Technical Skills": "Good understanding of components.",
  "Problem Solving": "Implemented efficiently.",
  "Code Quality": "Clean and maintainable code.",
  Documentation: "Well documented.",
  Communication: "Responsive and clear.",
}
