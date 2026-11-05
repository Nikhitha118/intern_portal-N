"use client"
import { useState, useRef, useEffect } from "react"
import InternSidebar from "../../../lib/internSidebar"
import { Camera, Save, LogOut, Bell, Shield, Eye, Palette, User, Trash2, Lock, Moon, Sun, Plus, X, FolderOpen, Check, Sparkles, Globe } from "lucide-react"
import { api, getUser, getInternUser, setInternPhoto, getInternPhoto, DEFAULT_INTERN_AVATAR, clearUserSession, resolveInternName } from "../../../lib/api"
import { useRouter } from "next/navigation"
import { useTheme } from "../../../lib/theme"
import { useTranslation, LANGUAGES } from "../../../lib/i18n"

const MENU_ITEMS = [
  { icon: User, key: "Profile", defaultLabel: "Profile", defaultDesc: "Personal info & skills" },
  { icon: Shield, key: "Security", defaultLabel: "Security", defaultDesc: "Password & 2FA" },
  { icon: Bell, key: "Notifications", defaultLabel: "Notifications", defaultDesc: "Alerts & reminders" },
  { icon: Palette, key: "Appearance", defaultLabel: "Appearance", defaultDesc: "Theme & display" },
  { icon: Eye, key: "Privacy", defaultLabel: "Privacy", defaultDesc: "Data & visibility" },
  { icon: Trash2, key: "Account", defaultLabel: "Account", defaultDesc: "Manage account" },
]

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useTranslation()
  const [active, setActive] = useState("Appearance") // Open Appearance by default as requested
  const [hov, setHov] = useState(null)
  const [appearanceMsg, setAppearanceMsg] = useState("")
  const [notifs, setNotifs] = useState({ email: true, push: true, tasks: false, journal: true })
  const [privacy, setPrivacy] = useState({ profileVisible: true, activityVisible: false })
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState("")
  const [form, setForm] = useState({ name: "", email: "", role: "", bio: "", phone: "" })
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [photo, setPhoto] = useState(() => {
    if (typeof window !== "undefined") {
      return getInternPhoto()
    }
    return DEFAULT_INTERN_AVATAR
  })
  const [showPhotoMenu, setShowPhotoMenu] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const photoRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // Security
  const [cur, setCur] = useState("")
  const [nw, setNw] = useState("")
  const [conf, setConf] = useState("")
  const [show, setShow] = useState({ cur: false, nw: false, conf: false })
  const [twoFA, setTwoFA] = useState(false)
  const [pwMsg, setPwMsg] = useState("")
  const [pwErr, setPwErr] = useState("")

  useEffect(() => {
    try {
      const u = getInternUser()
      const n = resolveInternName(u)
      if (n || u.email) setForm(f => ({ ...f, name: n || f.name, email: u.email || f.email, role: u.internRole || u.role || f.role }))
      if (u.photo) setPhoto(u.photo)
    } catch { }

    const user = getUser()
    if (!user.id) return

    api.profile(user.id).then(r => {
      if (r.ok && r.data) {
        setForm({
          name: r.data.fullName || "",
          email: r.data.email || "",
          role: r.data.role || "intern",
          bio: r.data.bio || "",
          phone: r.data.phone || ""
        })
        if (r.data.skills?.length) setSkills(r.data.skills)
      }
    }).catch(() => { })

    api.getSettings(user.id).then(r => {
      if (r.ok && r.data) {
        setNotifs({
          email: r.data.emailNotifications ?? true,
          push: r.data.pushNotifications ?? true,
          tasks: r.data.taskReminders ?? false,
          journal: true
        })
      }
      if (user.photo) setPhoto(user.photo)
      else setPhoto(getInternPhoto())
    }).catch(() => { })

    const onPhotoUpdated = () => {
      setPhoto(getInternPhoto())
    }
    window.addEventListener("intern_photo_updated", onPhotoUpdated)
    window.addEventListener("storage", onPhotoUpdated)
    return () => {
      window.removeEventListener("intern_photo_updated", onPhotoUpdated)
      window.removeEventListener("storage", onPhotoUpdated)
    }
  }, [])

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    setAppearanceMsg(`✓ ${t("Theme changed to")} ${newTheme === "dark" ? t("Dark Mode") : t("Light Mode")}`)
    setTimeout(() => setAppearanceMsg(""), 3000)
  }

  const handleLangChange = (newCode) => {
    setLang(newCode)
    const selected = LANGUAGES.find(l => l.code === newCode)
    setAppearanceMsg(`✓ ${t("Language updated to")} ${selected?.nativeName || newCode}`)
    setTimeout(() => setAppearanceMsg(""), 3000)
  }

  const handleSave = async () => {
    setSaveError("")
    const user = getUser()
    if (user.id) {
      const r = await api.updateProfile(user.id, {
        fullName: form.name,
        bio: form.bio,
        role: form.role,
        skills,
        phone: form.phone
      })
      if (!r.ok) {
        setSaveError("Save failed")
        return
      }
    }
    const updated = { ...getUser(), fullName: form.name, name: form.name, role: form.role, ...(photo ? { photo } : {}) }
    localStorage.setItem("user", JSON.stringify(updated))
    localStorage.setItem("user_intern", JSON.stringify(updated))
    if (form.name) localStorage.setItem("login_user_name", form.name)
    if (updated.email) {
      localStorage.setItem(`account_${updated.email.toLowerCase().trim()}`, JSON.stringify(updated))
    }
    window.dispatchEvent(new Event("user_session_updated"))
    window.dispatchEvent(new Event("storage"))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handlePhoto = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target.result
      setPhoto(url)
      setInternPhoto(url)
    }
    reader.readAsDataURL(f)
  }

  const openCamera = async () => {
    setShowCamera(true)
    setShowPhotoMenu(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream }, 100)
    } catch {
      alert("Camera permission denied.")
      setShowCamera(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0)
    const url = canvas.toDataURL("image/jpeg")
    setPhoto(url)
    setInternPhoto(url)
    streamRef.current?.getTracks().forEach(t => t.stop())
    setShowCamera(false)
  }

  const changePw = async () => {
    setPwMsg("")
    setPwErr("")
    if (!cur) { setPwErr("Enter current password"); return }
    if (!nw || nw.length < 6) { setPwErr("New password must be at least 6 characters"); return }
    if (nw !== conf) { setPwErr("Passwords do not match"); return }
    const user = getUser()
    const apiRoot = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    try {
      const res = await fetch(`${apiRoot}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, currentPassword: cur, newPassword: nw })
      })
      const data = await res.json()
      if (res.ok) {
        setPwMsg("Saved! Password updated!")
        setCur("")
        setNw("")
        setConf("")
      } else {
        setPwErr(data.error || "Update failed")
      }
    } catch {
      setPwErr("Cannot connect to server.")
    }
  }

  const handleLogout = () => {
    clearUserSession()
    router.push("/login")
  }

  const isLight = theme === "light"
  const inp = isLight
    ? "w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-900 focus:border-purple-500 shadow-xs transition"
    : "w-full bg-[#111827] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm outline-none text-white focus:border-cyan-500 transition"

  const cardBg = isLight
    ? "bg-white border border-gray-200 text-slate-900 shadow-sm"
    : "bg-[#111827] border border-[#1e293b] text-white shadow-sm"

  const Toggle = ({ val, onChange }) => (
    <button
      onClick={() => onChange(!val)}
      className="w-11 h-6 rounded-full relative border-none cursor-pointer flex-shrink-0 transition-all shadow-inner"
      style={{ background: val ? "linear-gradient(135deg,#7C3AED,#06B6D4)" : isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.12)" }}
    >
      <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-md" style={{ left: val ? "calc(100% - 22px)" : "2px" }} />
    </button>
  )

  const renderContent = () => {
    switch (active) {
      case "Appearance": return (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h2 className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{t("Appearance")}</h2>
            <p className="text-sm text-gray-400 mt-1">{t("Theme & display")}</p>
          </div>

          {appearanceMsg && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/15 to-purple-600/15 border border-cyan-400/40 text-cyan-300 text-sm font-semibold flex items-center gap-2.5 animate-fadeIn shadow-md">
              <Sparkles size={16} className="text-cyan-400" />
              <span>{appearanceMsg}</span>
            </div>
          )}

          {/* THEME SELECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-gray-300"}`}>{t("Theme")}</p>
              <span className="text-xs text-gray-400">{t("Active")}: <span className="font-bold text-cyan-400 capitalize">{theme}</span></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { v: "dark", label: t("Dark Mode"), icon: <Moon size={22} />, desc: t("Black & blue futuristic UI") },
                { v: "light", label: t("Light Mode"), icon: <Sun size={22} />, desc: t("Clean light interface") }
              ].map(item => {
                const isSelected = theme === item.v
                return (
                  <button
                    key={item.v}
                    onClick={() => handleThemeChange(item.v)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all relative ${isSelected
                      ? "border-cyan-400 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.2)] scale-[1.01]"
                      : isLight
                        ? "border-gray-200 bg-gray-50/80 hover:border-purple-400 hover:bg-white shadow-sm"
                        : "border-[#1e293b] bg-[#111827] hover:border-purple-500/40 shadow-sm"
                      }`}
                  >
                    {isSelected && (
                      <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-cyan-400 text-black flex items-center justify-center font-bold text-xs shadow-md">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                    <div className={`mb-3 ${isSelected ? "text-cyan-400" : "text-gray-400"}`}>{item.icon}</div>
                    <p className={`text-base font-bold ${isLight && !isSelected ? "text-slate-800" : "text-white"}`}>{item.label}</p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* LANGUAGE SELECTION */}
          <div className="space-y-3 pt-3 border-t border-[#1e293b]/50">
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-gray-300"}`}>{t("Language")}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t("Select Interface Language")}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LANGUAGES.map(l => {
                const isSelected = lang === l.code
                return (
                  <button
                    key={l.code}
                    onClick={() => handleLangChange(l.code)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${isSelected
                      ? "border-purple-500 bg-gradient-to-br from-purple-600/20 to-cyan-500/15 shadow-[0_0_12px_rgba(168,85,247,0.25)] scale-[1.02]"
                      : isLight
                        ? "border-gray-200 bg-gray-50/80 hover:border-purple-400"
                        : "border-[#1e293b] bg-[#111827] hover:border-purple-500/40"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-2xl">{l.flag}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs shadow-sm">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-extrabold ${isSelected ? "text-cyan-300" : isLight ? "text-slate-800" : "text-white"}`}>
                        {l.nativeName}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">{l.label}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* LIVE PREVIEW BOX */}
          <div className={`p-5 rounded-2xl border transition-colors shadow-lg ${isLight ? "bg-white border-gray-200" : "bg-[#0b1120] border-[#1e293b]"}`}>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <Globe size={14} className="text-cyan-400" />
              <span>Live Interface Preview</span>
            </p>
            <div className="space-y-1.5">
              <p className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                {t("Dashboard")} &bull; {t("Tasks")} &bull; {t("Journals")} &bull; {t("Settings")}
              </p>
              <p className="text-xs text-gray-400">
                {t("Internship Progress")}: <span className="font-bold text-cyan-400">75%</span> &bull; 28 {t("Days Left")}
              </p>
            </div>
          </div>
        </div>
      )

      case "Profile": return (
        <div className="space-y-5 max-w-2xl">
          <div>
            <h2 className="text-2xl font-bold">{t("Profile Settings")}</h2>
            <p className="text-sm text-gray-400 mt-1">Manage your identity and public profile details.</p>
          </div>

          <div className="flex items-center gap-5 p-4 rounded-2xl bg-[#0f172a]/60 border border-[#1e293b]">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-bold overflow-hidden border-2 border-purple-500/40 shadow-lg">
                <img src={photo || DEFAULT_INTERN_AVATAR} className="w-full h-full object-cover" alt="profile" />
              </div>
              <button onClick={() => setShowPhotoMenu(!showPhotoMenu)} className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-purple-600 border-2 border-[#020617] flex items-center justify-center shadow-md">
                <Camera size={13} color="white" />
              </button>
              {showPhotoMenu && (
                <div className="absolute top-full left-0 mt-2 bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden z-20 w-48 shadow-2xl">
                  <label className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer hover:bg-[#1e293b] text-xs font-semibold border-b border-[#1e293b]">
                    <FolderOpen size={14} /> Choose from Files
                    <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { handlePhoto(e); setShowPhotoMenu(false) }} />
                  </label>
                  <button onClick={openCamera} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#1e293b] text-xs font-semibold w-full text-left"><Camera size={14} /> Take a Photo</button>
                </div>
              )}
            </div>
            <div>
              <p className="text-base font-bold text-white">{form.name || "Your Name"}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{form.role || "intern"}</p>
              <button onClick={() => setShowPhotoMenu(!showPhotoMenu)} className="mt-2 px-3.5 py-1.5 rounded-xl bg-purple-600/20 border border-purple-600/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-600/30 transition">
                <Camera size={12} /> {t("Change Photo")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { l: t("Full Name"), k: "name" },
              { l: t("Email"), k: "email" },
              { l: t("Role"), k: "role" },
              { l: t("Phone"), k: "phone" }
            ].map(f => (
              <div key={f.k}>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">{f.l}</label>
                <input value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} className={inp} />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">{t("Bio")}</label>
            <textarea rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className={`${inp} resize-none`} />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">{t("Skills")}</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(s => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600/20 border border-purple-600/30 text-purple-300 text-xs font-semibold">
                  {s}
                  <button onClick={() => setSkills(p => p.filter(x => x !== s))} className="hover:text-white"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2.5">
              <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === "Enter" && newSkill.trim() && (setSkills(p => [...p, newSkill.trim()]), setNewSkill(""))} placeholder="Add skill..." className={`${inp} flex-1`} />
              <button onClick={() => newSkill.trim() && (setSkills(p => [...p, newSkill.trim()]), setNewSkill(""))} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-sm font-semibold text-white shadow-md"><Plus size={16} /></button>
            </div>
          </div>

          {saveError && <p className="text-xs text-red-400">⚠️ {saveError}</p>}
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-sm font-bold text-white shadow-lg hover:opacity-95 transition">
            <Save size={15} /> {saved ? t("Saved!") : t("Save Changes")}
          </button>
        </div>
      )

      case "Security": return (
        <div className="space-y-5 max-w-2xl">
          <div>
            <h2 className="text-2xl font-bold">{t("Security Settings")}</h2>
            <p className="text-sm text-gray-400 mt-1">Manage password updates and two-factor authentication.</p>
          </div>

          <div className="space-y-4">
            {[
              { l: t("Current Password"), k: "cur", v: cur, set: setCur },
              { l: t("New Password"), k: "nw", v: nw, set: setNw },
              { l: t("Confirm New Password"), k: "conf", v: conf, set: setConf }
            ].map(f => (
              <div key={f.k}>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">{f.l}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input type={show[f.k] ? "text" : "password"} value={f.v} onChange={e => f.set(e.target.value)} className={`${inp} pl-10 pr-10`} />
                  <button type="button" onClick={() => setShow(p => ({ ...p, [f.k]: !p[f.k] }))} className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white transition">{show[f.k] ? <Eye size={15} /> : <Lock size={15} />}</button>
                </div>
              </div>
            ))}
          </div>

          <div className={`flex items-center justify-between rounded-2xl p-4.5 ${cardBg}`}>
            <div>
              <p className="text-sm font-semibold">{t("Two-Factor Authentication")}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t("Add extra security to your account")}</p>
            </div>
            <Toggle val={twoFA} onChange={setTwoFA} />
          </div>

          {pwErr && <p className="text-xs text-red-400">⚠️ {pwErr}</p>}
          {pwMsg && <p className="text-xs text-green-400">✓ {pwMsg}</p>}
          <button onClick={changePw} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-sm font-bold text-white shadow-lg hover:opacity-95 transition">
            <Save size={15} /> {t("Update Password")}
          </button>
        </div>
      )

      case "Notifications": return (
        <div className="space-y-4 max-w-2xl">
          <div>
            <h2 className="text-2xl font-bold">{t("Notification Preferences")}</h2>
            <p className="text-sm text-gray-400 mt-1">Configure when and how you receive portal alerts.</p>
          </div>

          <div className="space-y-3">
            {[
              { k: "email", l: t("Email Notifications"), d: t("Receive updates via email") },
              { k: "push", l: t("Push Notifications"), d: t("Browser push notifications") },
              { k: "tasks", l: t("Task Reminders"), d: t("Reminders for upcoming deadlines") },
              { k: "journal", l: t("Journal Reminders"), d: t("Daily journal writing reminders") }
            ].map(item => (
              <div key={item.k} className={`flex items-center justify-between rounded-2xl p-4 ${cardBg}`}>
                <div>
                  <p className="text-sm font-semibold">{item.l}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.d}</p>
                </div>
                <Toggle val={notifs[item.k]} onChange={v => {
                  const u = { ...notifs, [item.k]: v }
                  setNotifs(u)
                  const user = getUser()
                  if (user.id) api.updateSettings(user.id, { emailNotifications: u.email, pushNotifications: u.push, taskReminders: u.tasks }).catch(() => { })
                }} />
              </div>
            ))}
          </div>
        </div>
      )

      case "Privacy": return (
        <div className="space-y-4 max-w-2xl">
          <div>
            <h2 className="text-2xl font-bold">{t("Privacy Settings")}</h2>
            <p className="text-sm text-gray-400 mt-1">Control your profile visibility and export your data.</p>
          </div>

          <div className="space-y-3">
            {[
              { k: "profileVisible", l: t("Public Profile"), d: t("Allow others to see your profile") },
              { k: "activityVisible", l: t("Activity Visibility"), d: t("Show your activity to mentors") }
            ].map(item => (
              <div key={item.k} className={`flex items-center justify-between rounded-2xl p-4 ${cardBg}`}>
                <div>
                  <p className="text-sm font-semibold">{item.l}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.d}</p>
                </div>
                <Toggle val={privacy[item.k]} onChange={v => setPrivacy(p => ({ ...p, [item.k]: v }))} />
              </div>
            ))}
          </div>

          <div className={`rounded-2xl p-5 ${cardBg}`}>
            <p className="text-sm font-bold mb-1">{t("Data Export")}</p>
            <p className="text-xs text-gray-400 mb-3">{t("Download all your data as a JSON file")}</p>
            <button onClick={async () => {
              const user = getUser()
              const tasks = await api.getTasks(user.id).then(r => r.data || []).catch(() => [])
              const journals = await api.getJournals(user.id).then(r => r.data || []).catch(() => [])
              const blob = new Blob([JSON.stringify({ user, tasks, journals, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `internportal_data_${Date.now()}.json`
              a.click()
              URL.revokeObjectURL(url)
            }} className="px-5 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold hover:bg-cyan-500/30 transition">
              {t("Export My Data")}
            </button>
          </div>
        </div>
      )

      case "Account": return (
        <div className="space-y-4 max-w-2xl">
          <div>
            <h2 className="text-2xl font-bold">{t("Account Management")}</h2>
            <p className="text-sm text-gray-400 mt-1">Switch profiles, sign out, or delete your account.</p>
          </div>

          <div className={`rounded-2xl p-5 ${cardBg}`}>
            <p className="text-sm font-bold mb-1">{t("Add Another Account")}</p>
            <p className="text-xs text-gray-400 mb-3">{t("Sign in with a different account")}</p>
            <button onClick={() => router.push("/login")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs sm:text-sm font-semibold text-white shadow-md">
              + {t("Add Another Account")}
            </button>
          </div>

          <div className={`rounded-2xl p-5 ${cardBg}`}>
            <p className="text-sm font-bold mb-1">{t("Logout")}</p>
            <p className="text-xs text-gray-400 mb-3">{t("Sign out from this device")}</p>
            <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs sm:text-sm font-semibold hover:bg-red-500/30 transition">
              <LogOut size={14} /> {t("Logout")}
            </button>
          </div>

          <div className="bg-[#111827] border border-red-500/20 rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-bold text-red-400 mb-1">{t("Delete Account")}</p>
            <p className="text-xs text-gray-400 mb-3">Permanently delete your account and all data. This cannot be undone.</p>
            <button onClick={async () => {
              if (!confirm("Are you sure? This will permanently delete your account.")) return
              const user = getUser()
              const apiRoot = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
              if (user.id) await fetch(`${apiRoot}/auth/profile/${user.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }).catch(() => { })
              localStorage.removeItem("token")
              localStorage.removeItem("user")
              router.push("/signup")
            }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs sm:text-sm font-semibold hover:bg-red-500/30 transition">
              <Trash2 size={14} /> {t("Delete Account")}
            </button>
          </div>
        </div>
      )

      default: return null
    }
  }

  return (
    <div className={`portal-root h-screen w-full max-w-full overflow-hidden flex relative transition-colors duration-300 ${isLight ? "text-slate-900" : "text-white"}`}>
      {/* VIDEO BACKGROUND */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="data:video/mp4;base64," type="video/mp4" />
      </video>

      {/* THEME OVERLAY */}
      <div className={`absolute inset-0 transition-colors duration-300 z-0 ${isLight ? "bg-slate-100/90 backdrop-blur-md" : "bg-black/70"}`}></div>

      {/* CONTENT */}
      <div className="relative z-10 flex w-full h-full min-w-0">
        <InternSidebar active="Settings" />

        {/* SETTINGS LEFT MENU — Desktop */}
        <div className={`hidden md:flex md:w-60 lg:w-64 md:min-w-60 lg:min-w-64 border-r flex-col p-4 gap-2 transition-colors flex-shrink-0 ${isLight ? "bg-white/95 border-gray-200 text-slate-800" : "bg-[#020617]/90 backdrop-blur-md border-[#1e293b] text-white"
          }`}>
          <p className="text-xs font-bold text-gray-400 px-3 py-2 tracking-wider uppercase">
            {t("Settings")}
          </p>
          <div className="space-y-1">
            {MENU_ITEMS.map(item => {
              const Icon = item.icon
              const isA = active === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  onMouseEnter={() => setHov(item.key)}
                  onMouseLeave={() => setHov(null)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all ${isA
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-400/40 shadow-sm"
                    : isLight
                      ? "hover:bg-gray-100"
                      : "hover:bg-[#0f172a]"
                    }`}
                >
                  <Icon size={16} className={isA ? "text-cyan-400" : hov === item.key ? "text-purple-400" : "text-gray-400"} />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${isA ? (isLight ? "text-purple-900" : "text-white") : (isLight ? "text-slate-700" : "text-gray-300")}`}>
                      {t(item.defaultLabel)}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{t(item.defaultDesc)}</p>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="mt-auto pt-4 border-t border-[#1e293b]/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition"
            >
              <LogOut size={16} /> {t("Logout")}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className={`flex-1 flex flex-col h-screen overflow-y-auto p-6 lg:p-10 min-w-0 transition-colors ${isLight ? "text-slate-900" : "text-white"}`}>
          {/* Mobile sub-tabs */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-[#1e293b] flex-shrink-0">
            {MENU_ITEMS.map(item => {
              const Icon = item.icon
              const isA = active === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isA
                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md"
                    : "bg-[#111827] text-gray-400 hover:text-white border border-[#1e293b]"
                    }`}
                >
                  <Icon size={14} />
                  <span>{t(item.defaultLabel)}</span>
                </button>
              )
            })}
          </div>

          <div className="w-full">
            {renderContent()}
          </div>
        </div>

        {/* WEBCAM MODAL */}
        {showCamera && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 sm:p-8 w-full max-w-md flex flex-col items-center gap-5 shadow-2xl">
              <div className="flex justify-between items-center w-full">
                <span className="text-base font-bold flex items-center gap-2 text-white"><Camera size={16} /> Take a Photo</span>
                <button onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); setShowCamera(false) }}><X size={16} className="text-gray-400 hover:text-white" /></button>
              </div>
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-2xl bg-black max-h-64 object-cover shadow-inner" />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div className="flex gap-3 w-full">
                <button onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); setShowCamera(false) }} className="flex-1 py-2.5 rounded-xl bg-[#111827] border border-[#1e293b] text-sm text-gray-400">Cancel</button>
                <button onClick={capturePhoto} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-sm font-bold text-white flex items-center justify-center gap-1.5 shadow-md"><Camera size={14} /> Capture Photo</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
