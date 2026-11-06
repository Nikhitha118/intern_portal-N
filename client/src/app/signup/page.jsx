"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./signup.css";

function Signup() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [socialLoading, setSocialLoading] = useState(null); // "google" | "github" | "linkedin" | null
  const [oauthNotice, setOauthNotice] = useState("");
  const [formData, setFormData] = useState({ fullName: "", email: "", role: "", password: "", confirmPassword: "", terms: false });
  const [errors, setErrors] = useState({});

  // Back button — goes to previous page (settings or login)
  const handleBack = () => router.back();

  const validate = () => {
    let e = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    if (!formData.role) e.role = "Please select role";
    if (formData.password.length < 6) e.password = "Minimum 6 characters required";
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!formData.terms) e.terms = "Accept terms & conditions";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  React.useEffect(() => {
    // Check if redirected with an OAuth error
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const err = urlParams.get("error");
      if (err) {
        setOauthNotice(decodeURIComponent(err));
      }
    }

    fetch(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/", { mode: "no-cors" }).catch(() => { });
  }, []);

  const handleSocialAuth = async (provider) => {
    if (socialLoading || loading) return;
    setServerError("");
    setOauthNotice("");
    setSocialLoading(provider);

    // Securely pass selected role if intern, mentor, or institution (never allow admin escalation)
    const selectedRole = ["intern", "mentor", "institution"].includes((formData.role || "").toLowerCase())
      ? formData.role.toLowerCase()
      : "intern";

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${apiUrl}/auth/oauth/authorize/${provider}?role=${selectedRole}&format=json`);
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }

      // If deployed backend is 404 or unreachable, try localhost:5000 if running locally
      if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && apiUrl !== "http://localhost:5000") {
        try {
          const localRes = await fetch(`http://localhost:5000/auth/oauth/authorize/${provider}?role=${selectedRole}&format=json`);
          const localData = await localRes.json().catch(() => ({}));
          if (localRes.ok && localData?.url) {
            window.location.href = localData.url;
            return;
          }
        } catch { }
      }

      if (data?.configured === false || res.status === 400 || res.status === 404) {
        setOauthNotice(
          data?.error || `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth is not configured on the backend. Please configure credentials in server/.env.`
        );
        setSocialLoading(null);
      } else {
        window.location.href = `${apiUrl}/auth/oauth/authorize/${provider}?role=${selectedRole}`;
      }
    } catch {
      try {
        const localRes = await fetch(`http://localhost:5000/auth/oauth/authorize/${provider}?role=${selectedRole}&format=json`);
        const localData = await localRes.json().catch(() => ({}));
        if (localRes.ok && localData?.url) {
          window.location.href = localData.url;
          return;
        } else if (localData?.error) {
          setOauthNotice(localData.error);
          setSocialLoading(null);
          return;
        }
      } catch { }

      setOauthNotice(`Could not initiate ${provider} registration. Please ensure backend server is reachable.`);
      setSocialLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError("");
    setSuccessMessage("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const cleanFullName = formData.fullName.trim();
      const cleanEmail = formData.email.trim().toLowerCase();

      const attemptFetch = (url, timeoutMs = 15000) => {
        return new Promise(async (resolve, reject) => {
          const controller = new AbortController();
          const timer = setTimeout(() => {
            controller.abort();
            reject(new Error("Timeout"));
          }, timeoutMs);
          try {
            const r = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fullName: cleanFullName,
                name: cleanFullName,
                email: cleanEmail,
                password: formData.password,
                role: formData.role
              }),
              signal: controller.signal,
            });
            clearTimeout(timer);
            resolve(r);
          } catch (err) {
            clearTimeout(timer);
            reject(err);
          }
        });
      };

      let res = null;
      let timedOut = false;
      try {
        res = await attemptFetch(`${apiUrl}/auth/register`, 15000);
      } catch (err) {
        if (err?.message === "Timeout" || err?.name === "AbortError") {
          timedOut = true;
        }
        // Local fallback attempt only if developing on localhost
        if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && apiUrl !== "http://localhost:5000") {
          try {
            res = await attemptFetch("http://localhost:5000/auth/register", 3000);
          } catch { }
        }
      }

      let data = null;
      if (res) {
        try { data = await res.json(); } catch { }
      }

      if (!res) {
        setServerError(
          timedOut
            ? "Server took too long to respond. Render may still be waking up, please wait a moment and try again."
            : "Unable to connect to backend server. Please verify network connection."
        );
        setLoading(false);
        return;
      }

      if (res.status === 409) {
        setServerError(data?.error || "Email already registered. Please login.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setServerError(data?.error || "Registration error. Please try again.");
        setLoading(false);
        return;
      }

      // Registration successful: do NOT auto-login, show success message and redirect to login
      setSuccessMessage(data?.message || "Registration successful! Please login.");
      setLoading(false);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setServerError("Registration error. Please try again.");
      setLoading(false);
    }
  };

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-left">
          {/* BACK BUTTON */}
          <button onClick={handleBack} style={{ position: "absolute", top: "20px", left: "20px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", padding: "6px 14px", color: "rgba(255,255,255,0.8)", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", zIndex: 10 }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
            ← Back
          </button>
          <div className="signup-header">
            <h1>Create Your Account</h1>
            <p>Build your internship journey</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <span className="input-icon"><User size={16} /></span>
              <input type="text" placeholder="Full Name" value={formData.fullName} className={errors.fullName ? "error-border" : ""} onChange={e => set("fullName", e.target.value)} />
              {errors.fullName && <small>{errors.fullName}</small>}
            </div>
            <div className="input-group">
              <span className="input-icon"><Mail size={16} /></span>
              <input type="email" placeholder="Email Address" value={formData.email} className={errors.email ? "error-border" : ""} onChange={e => set("email", e.target.value)} />
              {errors.email && <small>{errors.email}</small>}
            </div>
            <div className="input-group">
              <span className="input-icon"><Shield size={16} /></span>
              <select value={formData.role} className={errors.role ? "error-border" : ""} onChange={e => set("role", e.target.value)}>
                <option value="">Choose Role</option>
                <option value="intern">Intern</option>
                <option value="mentor">Mentor</option>
                <option value="institution">Institution</option>
                <option value="admin">Admin</option>
              </select>
              <span className="select-arrow">⌄</span>
              {errors.role && <small>{errors.role}</small>}
            </div>
            <div className="input-group">
              <span className="input-icon"><Lock size={16} /></span>
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} className={errors.password ? "error-border" : ""} onChange={e => set("password", e.target.value)} />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</span>
              {errors.password && <small>{errors.password}</small>}
            </div>
            <div className="input-group">
              <span className="input-icon"><Lock size={16} /></span>
              <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={formData.confirmPassword} className={errors.confirmPassword ? "error-border" : ""} onChange={e => set("confirmPassword", e.target.value)} />
              <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</span>
              {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
            </div>
            <label className="terms">
              <input type="checkbox" checked={formData.terms} onChange={e => set("terms", e.target.checked)} />
              <span>I agree to Terms & Conditions</span>
            </label>
            {errors.terms && <small className="terms-error">{errors.terms}</small>}
            {serverError && (
              <p style={{ color: "#ef4444", fontSize: "12px", textAlign: "center", margin: "8px 0", padding: "8px", background: "rgba(239,68,68,0.1)", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)" }}>
                <AlertTriangle size={14} className="inline" style={{ verticalAlign: "middle", marginRight: 4 }} /> {serverError}
              </p>
            )}
            {successMessage && (
              <p style={{ color: "#22c55e", fontSize: "12px", textAlign: "center", margin: "8px 0", padding: "8px", background: "rgba(34,197,94,0.1)", borderRadius: "8px", border: "1px solid rgba(34,197,94,0.3)" }}>
                ✓ {successMessage}
              </p>
            )}
            <button type="submit" className="signup-btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating account…" : "Continue"}
            </button>
          </form>
          <div className="divider"><span>or continue with</span></div>
          {oauthNotice && (
            <div style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "10px",
              padding: "8px 12px",
              margin: "0 0 12px 0",
              fontSize: "12px",
              color: "#fca5a5",
              lineHeight: "1.4",
              textAlign: "left"
            }}>
              <AlertTriangle size={13} style={{ verticalAlign: "middle", marginRight: 5, color: "#ef4444" }} />
              {oauthNotice}
            </div>
          )}
          <div className="social-icons">
            <button
              type="button"
              className="social-btn"
              onClick={() => handleSocialAuth("google")}
              disabled={Boolean(socialLoading) || loading}
              title="Sign up with Google"
              style={{
                cursor: socialLoading ? "not-allowed" : "pointer",
                opacity: socialLoading && socialLoading !== "google" ? 0.4 : 1
              }}
            >
              {socialLoading === "google" ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <i className="fa-brands fa-google"></i>
              )}
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={() => handleSocialAuth("github")}
              disabled={Boolean(socialLoading) || loading}
              title="Sign up with GitHub"
              style={{
                cursor: socialLoading ? "not-allowed" : "pointer",
                opacity: socialLoading && socialLoading !== "github" ? 0.4 : 1
              }}
            >
              {socialLoading === "github" ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <i className="fa-brands fa-github"></i>
              )}
            </button>
          </div>
          <p className="bottom-text">Already have an account? <Link href="/login"> Login</Link></p>
        </div>
        <div className="signup-right">
          <div className="overlay"></div>
          <div className="right-content">
            <h2>Smart Internship Portal</h2>
            <p>Discover internships, connect with mentors, and grow your career.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
