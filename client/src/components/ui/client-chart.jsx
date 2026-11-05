"use client"
import React, { useState, useEffect } from "react"
import { ResponsiveContainer } from "recharts"

export function useHasMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

export function ClientChart({ children, height = "100%", minHeight = 120, className = "" }) {
  const mounted = useHasMounted()

  return (
    <div
      className={`chart-stable-container ${className}`}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={35}>
          {children}
        </ResponsiveContainer>
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "40%",
              height: "4px",
              borderRadius: "999px",
              background: "linear-gradient(90deg, rgba(6,182,212,0.1), rgba(124,58,237,0.2), rgba(6,182,212,0.1))",
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ClientChart

