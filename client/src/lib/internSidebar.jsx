"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  LayoutDashboard, ClipboardList, BookOpenCheck, FileText,
  BarChart3, Calendar, MessageSquare, User, Settings,
  GraduationCap, ChevronDown, LogOut, UserPlus, Star, Sparkles,
  Menu, X
} from "lucide-react"
import { getInternUser, resolveInternName, getInternPhoto, DEFAULT_INTERN_AVATAR, clearUserSession } from "./api"
import { useTranslation } from "./i18n"

const menuItems = [
  { icon: LayoutDashboard, title: "Dashboard",  path: "/intern/dashboard" },
  { icon: ClipboardList,   title: "Tasks",       path: "/intern/tasks" },
  { icon: Sparkles,        title: "Skill Test",  path: "/intern/assessment" },
  { icon: BookOpenCheck,   title: "Attendance",  path: "/intern/attendance" },
  { icon: FileText,        title: "Journals",    path: "/intern/journals" },
  { icon: Star,            title: "Evaluation",  path: "/intern/evaluation" },
  { icon: BarChart3,       title: "Analytics",   path: "/intern/analytics" },
  { icon: Calendar,        title: "Calendar",    path: "/intern/calendar" },
  { icon: MessageSquare,   title: "Messages",    path: "/intern/messages" },
  { icon: User,            title: "Mentor",      path: "/intern/mentor" },
  { icon: Settings,        title: "Settings",    path: "/intern/settings" },
]

export default function InternSidebar({ active }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useTranslation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [userName, setUserName] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const u = getInternUser()
        return resolveInternName(u) || ""
      } catch {}
    }
    return ""
  })
  const [userRole, setUserRole] = useState("Intern")
  const [userPhoto, setUserPhoto] = useState(() => {
    if (typeof window !== "undefined") {
      return getInternPhoto()
    }
    return DEFAULT_INTERN_AVATAR
  })

  useEffect(() => {
    const load = () => {
      try {
        const u = getInternUser()
        const resolved = resolveInternName(u)
        setUserName(resolved || "")
        const assignedRole = localStorage.getItem("intern_assigned_role") || u.internRole
        if (assignedRole) {
          setUserRole(assignedRole)
        } else if (u.role) {
          setUserRole(u.role)
        }
        setUserPhoto(getInternPhoto())
      } catch {}
    }
    load()
    const id = setInterval(load, 2000)
    window.addEventListener("intern_role_updated", load)
    window.addEventListener("intern_photo_updated", load)
    window.addEventListener("user_session_updated", load)
    window.addEventListener("storage", load)
    return () => {
      clearInterval(id)
      window.removeEventListener("intern_role_updated", load)
      window.removeEventListener("intern_photo_updated", load)
      window.removeEventListener("user_session_updated", load)
      window.removeEventListener("storage", load)
    }
  }, [])

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = () => {
    clearUserSession()
    router.push("/login")
  }

  const activePage = active || menuItems.find(m => pathname?.startsWith(m.path))?.title || "Dashboard"

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full w-full p-4 select-none">
      {/* TOP: LOGO & MENU */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* LOGO */}
        <div className="flex items-center justify-between gap-3 mb-6 px-2 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-900/30">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight leading-none block">
                InternPortal
              </span>
              <span className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider block mt-0.5">
                Workspace
              </span>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl bg-[#111827] text-gray-400 hover:text-white border border-[#1e293b]"
          >
            <X size={18} />
          </button>
        </div>

        {/* MENU ITEMS (Scrollable with clean thin scrollbar) */}
        <nav className="flex flex-col gap-1.5 overflow-y-auto flex-1 pr-1 pb-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.title
            return (
              <button
                key={item.title}
                onClick={() => {
                  setMobileOpen(false)
                  router.push(item.path)
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold border-cyan-400/30 shadow-md shadow-purple-900/20"
                    : "bg-transparent text-gray-400 hover:text-white hover:bg-[#111827] border-transparent"
                }`}
              >
                <Icon size={19} className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                <span className="truncate">{t(item.title)}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* BOTTOM: USER PROFILE & PROGRESS CARD */}
      <div className="relative bg-[#0f172a] rounded-2xl p-3.5 border border-[#1e293b] flex-shrink-0 mt-3 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center font-bold text-sm text-white flex-shrink-0 overflow-hidden shadow-md">
              <img src={userPhoto || DEFAULT_INTERN_AVATAR} className="w-full h-full object-cover" alt="profile" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">{userName || "Intern"}</p>
              <p className="text-[11px] text-cyan-400 font-medium truncate capitalize mt-0.5">{userRole}</p>
            </div>
          </div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg hover:bg-[#1e293b] text-gray-400 hover:text-white transition flex-shrink-0 cursor-pointer"
          >
            <ChevronDown size={14} className={`transition-transform duration-200 ${showMenu ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl z-50 p-1 divide-y divide-[#1e293b]/60">
            <button
              onClick={() => { setShowMenu(false); router.push("/login") }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-[#1e293b] transition cursor-pointer"
            >
              <UserPlus size={14} className="text-cyan-400" />
              <span>{t("Add Another Account") || "Add Account"}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition cursor-pointer"
            >
              <LogOut size={14} />
              <span>{t("Logout")}</span>
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-3 pt-2.5 border-t border-[#1e293b]/80">
          <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium mb-1">
            <span>{t("Internship Progress")}</span>
            <span className="text-white font-bold text-sm">75%</span>
          </div>
          <div className="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
            <div className="w-[75%] h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
          </div>
          <p className="text-[10px] text-gray-500 font-medium mt-1.5 flex items-center justify-between">
            <span>28 {t("Days Left")}</span>
            <span className="text-cyan-400/80 font-mono">Sprint 1</span>
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* MOBILE HAMBURGER BUTTON (Visible only on <lg screens) */}
      <div className="lg:hidden fixed top-3 left-3 z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2.5 rounded-2xl bg-[#0f172a]/90 backdrop-blur-md border border-[#1e293b] text-white shadow-xl hover:bg-[#1e293b] transition flex items-center gap-2 cursor-pointer"
        >
          <Menu size={18} className="text-cyan-400" />
          <span className="text-xs font-bold pr-1">Menu</span>
        </button>
      </div>

      {/* MOBILE DRAWER BACKDROP */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
        />
      )}

      {/* MOBILE DRAWER ASIDE */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-[#020617] border-r border-[#1e293b] shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* DESKTOP SIDEBAR (Permanent, fixed 240px wide on lg+ screens) */}
      <aside className="hidden lg:flex w-[240px] min-w-[240px] h-screen sticky top-0 bg-[#020617] border-r border-[#1e293b] flex-col flex-shrink-0 z-30">
        {sidebarContent}
      </aside>
    </>
  )
}
