"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Role → home route mapping
export const ROLE_ROUTES = {
  intern: "/intern/dashboard",
  mentor: "/mentor/dashboard",
  evaluator: "/mentor/dashboard",
  admin: "/admin/dashboard",
  institution: "/institution/dashboard",
}

/**
 * getUser(expectedRole?) — reads role-specific key first, falls back to shared key
 * and per-account storage to retrieve the authentic registered user.
 */
export function getUser(expectedRole) {
  if (typeof window === "undefined") return {}
  try {
    if (expectedRole) {
      const specific = localStorage.getItem(`user_${expectedRole}`)
      if (specific) {
        const parsed = JSON.parse(specific)
        return enrichUser(parsed)
      }
    }

    // AUTO detect from URL
    const path = window.location.pathname
    const roleFromPath =
      path.startsWith("/intern/") ? "intern" :
        path.startsWith("/mentor/") ? "mentor" :
          path.startsWith("/institution/") ? "institution" :
            path.startsWith("/admin/") ? "admin" :
              path.startsWith("/evaluation/") ? "evaluator" :
                null

    if (roleFromPath) {
      const specific = localStorage.getItem(`user_${roleFromPath}`)
      if (specific) {
        const parsed = JSON.parse(specific)
        return enrichUser(parsed)
      }
    }

    // Fallback to primary session user
    const shared = localStorage.getItem("user")
    if (shared) {
      const parsed = JSON.parse(shared)
      return enrichUser(parsed)
    }

    return {}
  } catch {
    return {}
  }
}

function enrichUser(u) {
  if (!u || typeof u !== "object") return {}
  const res = { ...u }
  // Ensure authentic name from login_user_name or account cache
  if (!res.fullName && res.name) res.fullName = res.name
  if (!res.fullName && typeof window !== "undefined") {
    const savedName = localStorage.getItem("login_user_name")
    if (savedName) res.fullName = savedName
    if (res.email) {
      try {
        const acct = JSON.parse(localStorage.getItem(`account_${res.email.toLowerCase().trim()}`) || "null")
        if (acct?.fullName) res.fullName = acct.fullName
      } catch { }
    }
  }
  return res
}

export function getToken() {
  if (typeof window === "undefined") return ""
  try { return localStorage.getItem("token") || "" } catch { return "" }
}

/**
 * useRoleGuard(allowedRoles) — redirects if role doesn't match allowed list
 */
export function useRoleGuard(allowedRoles) {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    const token = getToken()

    if (!token || !user || !user.role) {
      router.replace("/login")
      return
    }

    const role = String(user.role).toLowerCase()
    const normalizedAllowed = allowedRoles.map(r => String(r).toLowerCase())

    if (!normalizedAllowed.includes(role)) {
      router.replace(ROLE_ROUTES[role] || "/login")
    }
  }, [router, allowedRoles])
}

/**
 * usePortalAuth(allowedRoles, fallbackRole)
 * Synchronous client-side auth validation hook that prevents layout shift
 * and unauthenticated/unauthorized UI flash.
 */
export function usePortalAuth(allowedRoles = [], fallbackRole = "") {
  const router = useRouter()
  const [auth, setAuth] = useState(() => {
    if (typeof window === "undefined") {
      return { loading: true, authorized: false, user: null, role: "" }
    }
    try {
      const token = getToken()
      const user = getUser(fallbackRole)
      if (!token || !user?.role) {
        return { loading: true, authorized: false, user: null, role: "" }
      }
      const role = String(user.role).toLowerCase()
      const allowed = allowedRoles.map(r => String(r).toLowerCase())
      const isOk = allowed.length === 0 || allowed.includes(role)
      return {
        loading: false,
        authorized: isOk,
        user,
        role,
      }
    } catch {
      return { loading: true, authorized: false, user: null, role: "" }
    }
  })

  useEffect(() => {
    const check = () => {
      try {
        const token = getToken()
        const user = getUser(fallbackRole)
        if (!token || !user || !user.role) {
          router.replace("/login")
          return
        }
        const role = String(user.role).toLowerCase()
        const allowed = allowedRoles.map(r => String(r).toLowerCase())
        if (allowed.length > 0 && !allowed.includes(role)) {
          router.replace(ROLE_ROUTES[role] || "/login")
          return
        }
        setAuth({
          loading: false,
          authorized: true,
          user,
          role,
        })
      } catch {
        router.replace("/login")
      }
    }
    check()
    window.addEventListener("user_session_updated", check)
    window.addEventListener("storage", check)
    return () => {
      window.removeEventListener("user_session_updated", check)
      window.removeEventListener("storage", check)
    }
  }, [router, fallbackRole])

  return auth
}

/**
 * Fullscreen stable layout skeleton with 240px sidebar and header
 * Prevents initial layout shift while authentication or heavy data settles
 */
export function PortalLoadingSkeleton({ title = "Loading Portal..." }) {
  return (
    <div className="portal-root bg-[#050816] text-white">
      {/* Sidebar Skeleton (fixed 240px width) */}
      <aside className="w-[240px] min-w-[240px] h-screen bg-[#070B1A] border-r border-[#1e293b] p-4 flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-2xl bg-white/5 animate-pulse" />
            <div className="space-y-1.5">
              <div className="w-24 h-3.5 rounded bg-white/10 animate-pulse" />
              <div className="w-16 h-2 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-full h-10 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 animate-pulse" />
            <div className="space-y-1 flex-1">
              <div className="w-20 h-3 rounded bg-white/10 animate-pulse" />
              <div className="w-12 h-2 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main">
        {/* Top Header Skeleton */}
        <div className="h-16 border-b border-[#1e293b] px-6 flex items-center justify-between flex-shrink-0 bg-[#070B1A]/40">
          <div className="w-36 h-5 rounded bg-white/10 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="w-48 h-9 rounded-xl bg-white/5 animate-pulse" />
            <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse" />
            <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton Cards */}
        <div className="portal-content">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-[#0f172a] border border-[#1e293b] p-4 flex flex-col justify-between animate-pulse">
                <div className="w-20 h-3 rounded bg-white/10" />
                <div className="w-16 h-6 rounded bg-cyan-500/20" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-72 rounded-3xl bg-[#0f172a] border border-[#1e293b] p-6 animate-pulse" />
            <div className="h-72 rounded-3xl bg-[#0f172a] border border-[#1e293b] p-6 animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  )
}

export function logout(router) {
  if (typeof window !== "undefined") {
    const path = window.location.pathname
    const roleFromPath =
      path.startsWith("/intern/") ? "intern" :
        path.startsWith("/mentor/") ? "mentor" :
          path.startsWith("/institution/") ? "institution" :
            path.startsWith("/admin/") ? "admin" :
              path.startsWith("/evaluation/") ? "evaluator" : null
    if (roleFromPath) localStorage.removeItem(`user_${roleFromPath}`)
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
    window.dispatchEvent(new Event("user_session_updated"))
    window.dispatchEvent(new Event("storage"))
  }
  router.push("/login")
}
