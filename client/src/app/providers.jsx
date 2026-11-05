"use client"
import { ThemeProvider } from "../lib/theme"
import { useEffect } from "react"

export default function Providers({ children }) {
  useEffect(() => {
    // Clean up external debug badges/portals without triggering forced reflow
    const cleanBadges = () => {
      const badSelectors = [
        "#react-scan-root",
        "[data-react-scan]",
        "[data-nextjs-dev-tools-button]",
        "[data-nextjs-toast]",
        "nextjs-portal",
      ]
      badSelectors.forEach((sel) => {
        try {
          document.querySelectorAll(sel).forEach((el) => el.remove())
        } catch {}
      })
    }
    cleanBadges()
    const timer = setTimeout(cleanBadges, 1200)
    return () => clearTimeout(timer)
  }, [])

  return <ThemeProvider>{children}</ThemeProvider>
}
