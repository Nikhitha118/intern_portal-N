"use client"
import Link from "next/link"
import { ArrowRight, Search, Mail, Bell, Grid2x2, Clock3, Sparkles } from "lucide-react"

const navItems = ["My Work", "Learning", "Resources", "Team", "Help", "Intern Community"]

export default function RootPage() {
  const movingItems = [
    "New task assigned",
    "Mentor feedback ready",
    "Attendance synced",
    "Session at 4:30 PM",
    "Progress crossed 75%",
  ]

  return (
    <div
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
        background:
          "radial-gradient(1000px 500px at 20% 20%, rgba(37,99,235,0.25), transparent 50%), radial-gradient(900px 500px at 90% 30%, rgba(99,102,241,0.2), transparent 60%), #060b1c",
        color: "white",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "14px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(4, 10, 28, 0.88)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "0.05em" }}>INTERN PORTAL</div>
        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <span key={item} style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", cursor: "pointer" }}>
              {item}
            </span>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/login"
            className="hidden sm:inline-flex"
            style={{
              padding: "8px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(96,165,250,0.6)",
              color: "#dbeafe",
              fontSize: "12px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Book Mentor Session
          </Link>
          <Link href="/login" style={{ color: "white", textDecoration: "none", fontSize: "13px", padding: "6px 10px" }}>
            Log In
          </Link>
          <Link
            href="/signup"
            style={{
              padding: "8px 16px",
              borderRadius: "12px",
              background: "linear-gradient(135deg,#38bdf8,#2563eb)",
              color: "white",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "0 0 16px rgba(37,99,235,0.4)",
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      <main style={{ padding: "32px 20px 48px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        <section style={{ textAlign: "center", marginBottom: "8px" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", marginBottom: "12px", letterSpacing: "0.15em", fontWeight: 600 }}>
            A PERSONALIZED EXPERIENCE FOR GROWTH
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight m-0">
            A Comprehensive Intern
            <br />
            Management Portal
          </h1>
          <p style={{ margin: "16px auto 0", maxWidth: "760px", color: "rgba(255,255,255,0.76)", fontSize: "15px", lineHeight: 1.6 }}>
            Plan your learning path, manage tasks, track progress, access resources, and connect with your mentors.
            Empowering your intern journey, all in one place.
          </p>
          <div style={{ marginTop: "20px" }}>
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                borderRadius: "16px",
                padding: "12px 24px",
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                color: "white",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: 700,
                boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
              }}
            >
              Launch Your Portal <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section
          style={{
            borderRadius: "24px",
            border: "1px solid rgba(96,165,250,0.45)",
            background: "rgba(10,19,47,0.85)",
            boxShadow: "0 0 0 5px rgba(96,165,250,0.14)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                maxWidth: "360px",
              }}
            >
              <Search size={16} color="#94a3b8" />
              <span style={{ fontSize: "13px", color: "#94a3b8" }}>Search Portal</span>
            </div>
            <button style={iconBtn}><Mail size={16} /></button>
            <button style={iconBtn}><Bell size={16} /></button>
            <button style={iconBtn}><Sparkles size={16} /></button>
          </div>
          
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <DashboardCard idx={0} title="Projects" lines={["Internship onboarding", "Build auth module"]} />
            <DashboardCard idx={1} title="Tasks" lines={["API docs pending", "Dashboard UI review"]} />
            <DashboardCard idx={2} title="Metrics" lines={["Progress 76%", "Attendance 92%"]} />
            <DashboardCard idx={3} title="Team Feed" lines={["Mentor shared feedback", "Session scheduled"]} />
          </div>

          <div
            style={{
              margin: "0 16px 12px",
              padding: "8px 12px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              overflow: "hidden",
            }}
          >
            <div className="moving-row" style={{ display: "flex", gap: "10px", width: "max-content" }}>
              {[...movingItems, ...movingItems].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  style={{
                    fontSize: "12px",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    border: "1px solid rgba(56,189,248,0.35)",
                    background: "rgba(30,64,175,0.25)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DashboardCard idx={4} title="Learning" lines={["React hooks revision", "API security notes"]} />
            <DashboardCard idx={5} title="Quick Links" lines={["Open task board", "View mentor messages"]} />
            <DashboardCard idx={6} title="Updates" lines={["2 pending reviews", "1 new announcement"]} />
          </div>
        </section>
      </main>
    </div>
  )
}

function DashboardCard({ title, lines, idx = 0 }) {
  return (
    <div
      style={{
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        padding: "9px",
        animation: `cardBlink 2.2s ease-in-out ${idx * 0.2}s infinite`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <Grid2x2 size={12} color="#60a5fa" />
        <span style={{ fontSize: "11px", fontWeight: 600 }}>{title}</span>
      </div>
      {lines.map((line) => (
        <div key={line} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <Clock3 size={11} color="#94a3b8" />
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)" }}>{line}</span>
        </div>
      ))}
    </div>
  )
}

const iconBtn = {
  width: "30px",
  height: "30px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
}
