"use client"
import React, { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("loading") // "loading" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("")
  const [providerName, setProviderName] = useState("Social")

  useEffect(() => {
    async function processAuth() {
      const error = searchParams.get("error")
      const token = searchParams.get("token")
      const userData = searchParams.get("userData")
      const provider = searchParams.get("provider") || "google"
      const code = searchParams.get("code")
      const state = searchParams.get("state")

      const formattedProvider =
        provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase()
      setProviderName(formattedProvider)

      // 1. Handle error param returned by OAuth provider or backend
      if (error) {
        setStatus("error")
        setErrorMessage(decodeURIComponent(error))
        return
      }

      // 2. Direct token & user profile from backend redirect
      if (token && userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData))
          const role = (user?.role || "intern").toLowerCase()
          const cleanEmail = (user?.email || "").toLowerCase().trim()
          const resolvedName = (user?.fullName || user?.name || cleanEmail.split("@")[0]).trim()
          const photo = user?.photo || "/intern-avatar.jpg"

          // Clear previous user's credentials to avoid cross-contamination
          localStorage.removeItem("login_user_name")
          localStorage.removeItem("login_email")
          localStorage.removeItem("user_intern")
          localStorage.removeItem("user_mentor")
          localStorage.removeItem("user_institution")
          localStorage.removeItem("user_admin")
          localStorage.removeItem("user")

          // Save authenticated user profile
          const enrichedUser = {
            ...user,
            id: user.id || `u_${Date.now()}`,
            fullName: resolvedName,
            name: resolvedName,
            email: cleanEmail,
            role: role,
            photo: photo,
          }

          localStorage.setItem("token", token)
          localStorage.setItem("user", JSON.stringify(enrichedUser))
          localStorage.setItem(`user_${role}`, JSON.stringify(enrichedUser))
          localStorage.setItem("login_email", cleanEmail)
          localStorage.setItem("login_user_name", resolvedName)
          localStorage.setItem("intern_user_photo", photo)
          localStorage.setItem(`account_${cleanEmail}`, JSON.stringify(enrichedUser))

          window.dispatchEvent(new Event("intern_photo_updated"))
          window.dispatchEvent(new Event("storage"))

          setStatus("success")

          // Smooth redirect to the authorized role dashboard
          setTimeout(() => {
            if (role === "mentor" || role === "evaluator") {
              router.push("/mentor/dashboard")
            } else if (role === "admin") {
              router.push("/admin/dashboard")
            } else if (role === "institution") {
              router.push("/institution/dashboard")
            } else {
              router.push("/intern/dashboard")
            }
          }, 900)
        } catch (err) {
          setStatus("error")
          setErrorMessage("Failed to process social login profile. Please try again.")
        }
        return
      }

      // 3. Fallback: If code is provided to client directly, forward to backend
      if (code) {
        const backendBase =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        window.location.href = `${backendBase}/auth/oauth/callback/${provider}?code=${encodeURIComponent(
          code
        )}&state=${encodeURIComponent(state || "")}`
        return
      }

      // 4. No params provided
      setStatus("error")
      setErrorMessage("No authentication details received. Please try logging in again.")
    }

    processAuth()
  }, [searchParams, router])

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "radial-gradient(1000px 500px at 20% 20%, rgba(37,99,235,0.25), transparent 50%), radial-gradient(900px 500px at 90% 30%, rgba(99,102,241,0.2), transparent 60%), #060b1c",
        color: "white",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "rgba(10, 19, 47, 0.9)",
          border: "1px solid rgba(96, 165, 250, 0.3)",
          borderRadius: "24px",
          padding: "36px 32px",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(12px)",
        }}
      >
        {status === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "20px",
                background: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader2 size={30} className="animate-spin" color="#38bdf8" />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
              Authenticating with {providerName}...
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", margin: 0, lineHeight: 1.5 }}>
              Securing connection, verifying your credentials, and preparing your dashboard.
            </p>
          </div>
        )}

        {status === "success" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "20px",
                background: "rgba(34, 197, 94, 0.15)",
                border: "1px solid rgba(34, 197, 94, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={32} color="#22c55e" />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
              Welcome to InternPortal!
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
              {providerName} authentication verified. Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "20px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={30} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
              Authentication Notice
            </h2>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#fca5a5",
                fontSize: "13px",
                lineHeight: 1.5,
                textAlign: "left",
                width: "100%",
                wordBreak: "break-word",
              }}
            >
              {errorMessage}
            </div>
            <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "8px" }}>
              <Link
                href="/login"
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "white",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                }}
              >
                Back to Sign In <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#060b1c",
            color: "white",
          }}
        >
          <Loader2 className="animate-spin" size={32} color="#38bdf8" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}

