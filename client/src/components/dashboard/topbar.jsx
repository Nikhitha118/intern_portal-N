"use client"
import { useState, useEffect } from "react"
import { Search, Bell } from "lucide-react"
import { getInternUser, resolveInternName, getInternPhoto, DEFAULT_INTERN_AVATAR } from "../../lib/api"

export function Topbar() {
  const [photo, setPhoto] = useState(() => (typeof window !== "undefined" ? getInternPhoto() : DEFAULT_INTERN_AVATAR))
  const [name, setName] = useState(() => (typeof window !== "undefined" ? (resolveInternName(getInternUser()) || "") : ""))
  const [role, setRole] = useState("Intern")

  useEffect(() => {
    const sync = () => {
      try {
        const u = getInternUser()
        setName(resolveInternName(u) || "")
        setPhoto(getInternPhoto())
        const assignedRole = localStorage.getItem("intern_assigned_role") || u.internRole || u.role
        if (assignedRole) setRole(assignedRole)
      } catch { }
    }
    sync()
    window.addEventListener("intern_photo_updated", sync)
    window.addEventListener("user_session_updated", sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener("intern_photo_updated", sync)
      window.removeEventListener("user_session_updated", sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
      <div className="relative w-full sm:w-[320px] max-w-[350px]">
        <Search
          className="absolute left-3 top-3 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-[#111827] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-3 rounded-xl bg-[#111827] border border-gray-700">
          <Bell className="text-white" size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 bg-[#111827] border border-gray-700 rounded-xl px-4 py-2">
          <img
            src={photo || DEFAULT_INTERN_AVATAR}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
          />
          <div>
            <h3 className="text-white text-sm font-semibold truncate max-w-[140px]" title={name || "Intern"}>
              {name || "Intern"}
            </h3>
            <p className="text-gray-400 text-xs capitalize truncate max-w-[110px]">
              {role}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}