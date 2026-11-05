"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser, getToken, ROLE_ROUTES, PortalLoadingSkeleton } from "../../lib/roleGuard"

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    const user = getUser()
    if (!token || !user?.role) {
      router.replace("/login")
      return
    }
    const role = String(user.role).toLowerCase()
    router.replace(ROLE_ROUTES[role] || "/intern/dashboard")
  }, [router])

  return <PortalLoadingSkeleton title="Loading Dashboard..." />
}

