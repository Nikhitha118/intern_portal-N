"use client"
import { usePortalAuth, PortalLoadingSkeleton } from "../../lib/roleGuard"

// Intern portal layout — protects all intern pages from unauthenticated access
export default function InternLayout({ children }) {
  const auth = usePortalAuth(["intern", "admin"], "intern")

  if (auth.loading || !auth.authorized) {
    return <PortalLoadingSkeleton title="Intern Portal" />
  }

  return <>{children}</>
}
