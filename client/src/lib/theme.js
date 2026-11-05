"use client"
import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext({ theme:"dark", setTheme:()=>{} })

function applyVars(t) {
  if (typeof document === "undefined") return
  const r = document.documentElement
  if (t === "light") {
    r.setAttribute("data-theme","light")
    r.classList.add("light")
    r.classList.remove("dark")
    r.style.setProperty("--page-bg","#f0f4f8")
    r.style.setProperty("--sidebar-bg","#1e1b4b")
    r.style.setProperty("--card-bg","rgba(255,255,255,0.95)")
    r.style.setProperty("--card-border","rgba(0,0,0,0.08)")
    r.style.setProperty("--text","#0f172a")
    r.style.setProperty("--text-muted","rgba(15,23,42,0.6)")
    r.style.setProperty("--text-faint","rgba(15,23,42,0.4)")
    r.style.setProperty("--input-bg","rgba(0,0,0,0.06)")
    r.style.setProperty("--input-border","rgba(0,0,0,0.15)")
    r.style.setProperty("--divider","rgba(0,0,0,0.08)")
    r.style.setProperty("--panel-bg","#f8fafc")
    r.style.setProperty("--row-hover","rgba(124,58,237,0.05)")
  } else {
    r.setAttribute("data-theme","dark")
    r.classList.add("dark")
    r.classList.remove("light")
    r.style.setProperty("--page-bg","#050816")
    r.style.setProperty("--sidebar-bg","#070B1A")
    r.style.setProperty("--card-bg","rgba(17,25,40,0.85)")
    r.style.setProperty("--card-border","rgba(255,255,255,0.08)")
    r.style.setProperty("--text","#ffffff")
    r.style.setProperty("--text-muted","rgba(255,255,255,0.5)")
    r.style.setProperty("--text-faint","rgba(255,255,255,0.35)")
    r.style.setProperty("--input-bg","rgba(255,255,255,0.06)")
    r.style.setProperty("--input-border","rgba(255,255,255,0.1)")
    r.style.setProperty("--divider","rgba(255,255,255,0.07)")
    r.style.setProperty("--panel-bg","#070B1A")
    r.style.setProperty("--row-hover","rgba(255,255,255,0.02)")
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark")

  useEffect(() => {
    const saved = localStorage.getItem("ip-theme") || "dark"
    setThemeState(saved)
    applyVars(saved)
  }, [])

  const setTheme = (t) => {
    setThemeState(t)
    localStorage.setItem("ip-theme", t)
    applyVars(t)
    try {
      window.dispatchEvent(new CustomEvent("ip_theme_changed", { detail: t }))
    } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
