/** Cross-portal intern ↔ mentor messaging via localStorage */

export const MENTOR_CHANNEL_PRIYA = "priya"
export const KEY_INTERN_TO_MENTOR = "internToMentorMsgs"
export const KEY_MENTOR_TO_INTERN = "mentorToInternMsgs"
export const MAX_CHAT_MSGS = 300

export function internSlug(fromName) {
  return (fromName || "intern").toLowerCase().trim().replace(/\s+/g, "-")
}

/** Stable id so mentor/intern tabs always match the same person */
export function canonicalInternId(fromName, fallbackId) {
  if (fromName) return `intern-${internSlug(fromName)}`
  if (fallbackId) return fallbackId
  return "intern-unknown"
}

export function internContactId(fromName, userId) {
  return canonicalInternId(fromName, userId ? `intern-${userId}` : null)
}

export function messageMatchesIntern(m, user) {
  const name = (user?.fullName || user?.name || "").trim()
  // If user has no specific name or id (e.g. default demo/intern login), accept all mentor messages
  if (!name && !user?.id) return true

  const myCanonical = canonicalInternId(name, user?.id ? `intern-${user.id}` : null)
  const slug = internSlug(name)

  if (!m.toInternId && !m.toInternName) return true
  if (m.toInternId === myCanonical) return true
  if (m.toInternId === `intern-${user?.id}`) return true
  if (m.toInternName && internSlug(m.toInternName) === slug) return true
  if (m.toInternId && m.toInternId.endsWith(slug)) return true
  if (m.toInternId === "intern-unknown" || m.toInternId === "intern-user" || m.toInternId === "intern-intern") return true
  return false
}

export function appendChatMessage(storageKey, msg) {
  let existing = []
  try {
    existing = JSON.parse(localStorage.getItem(storageKey) || "[]")
    if (!Array.isArray(existing)) existing = []
  } catch {
    existing = []
  }
  const updated = [...existing, msg].slice(-MAX_CHAT_MSGS)
  localStorage.setItem(storageKey, JSON.stringify(updated))
  try {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: storageKey,
        newValue: JSON.stringify(updated),
        storageArea: localStorage,
      })
    )
    window.dispatchEvent(new CustomEvent(storageKey, { detail: msg }))
  } catch {}
  return updated
}
