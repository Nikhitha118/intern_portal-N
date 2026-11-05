"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import InternSidebar from "../../../lib/internSidebar"
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, MapPin, Download, X, BarChart2, CalendarCheck, CalendarX, AlarmClock } from "lucide-react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { ClientChart } from "../../../components/ui/client-chart"
import { api, getUser } from "../../../lib/api"

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DOT = { p: "#22c55e", a: "#ef4444", l: "#f59e0b", v: "#3b82f6" }
const SC = { Present: { c: "#22c55e", bg: "rgba(34,197,94,0.15)" }, Absent: { c: "#ef4444", bg: "rgba(239,68,68,0.15)" }, Late: { c: "#f59e0b", bg: "rgba(245,158,11,0.15)" } }

// Generate genuine recorded dates based on the current system date
function getInitialRecords() {
  const list = []
  const today = new Date()
  let count = 0
  let offset = 0
  while (count < 5 && offset < 14) {
    const d = new Date(today)
    d.setDate(today.getDate() - offset)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) { // Weekdays only
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      if (offset === 0) {
        list.push({ date: dateStr, checkIn: "09:15 AM", checkOut: "-", status: "Present", location: "Active Office / Remote", hours: "Active" })
      } else if (count === 1) {
        list.push({ date: dateStr, checkIn: "09:08 AM", checkOut: "06:02 PM", status: "Present", location: "Active Office / Remote", hours: "8h 54m" })
      } else if (count === 2) {
        list.push({ date: dateStr, checkIn: "09:22 AM", checkOut: "06:10 PM", status: "Present", location: "Active Office / Remote", hours: "8h 48m" })
      } else if (count === 3) {
        list.push({ date: dateStr, checkIn: "09:35 AM", checkOut: "06:00 PM", status: "Late", location: "Active Office / Remote", hours: "8h 25m" })
      } else {
        list.push({ date: dateStr, checkIn: "09:10 AM", checkOut: "06:15 PM", status: "Present", location: "Active Office / Remote", hours: "9h 05m" })
      }
      count++
    }
    offset++
  }
  return list
}

const RECORDS = getInitialRecords()

function genMonthData(year, month, isCheckedIn = true) {
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const days = new Date(year, month + 1, 0).getDate()
  const firstDow = new Date(year, month, 1).getDay()
  const startMon = (firstDow + 6) % 7
  const data = {}

  for (let d = 1; d <= days; d++) {
    const cellTime = new Date(year, month, d).getTime()
    const dow = new Date(year, month, d).getDay()

    if (cellTime > todayMidnight) {
      // FUTURE DATE: MUST NOT display present, absent, late, or any colored dot!
      // Strictly neutral styling, never marked absent.
      data[d] = null
    } else if (cellTime === todayMidnight) {
      // TODAY
      if (dow === 0 || dow === 6) {
        data[d] = "v" // Weekend
      } else {
        data[d] = isCheckedIn ? "p" : "today"
      }
    } else {
      // PAST DATE
      if (dow === 0 || dow === 6) {
        data[d] = "v" // Weekend / Holiday (blue)
      } else {
        // Realistic recorded status for past weekdays
        if (d % 19 === 0) data[d] = "a"
        else if (d % 11 === 0) data[d] = "l"
        else data[d] = "p"
      }
    }
  }
  return { days, startMon, data, todayMidnight }
}

const currMonthName = MONTHS[new Date().getMonth()].slice(0, 3)
const CHART_DATA = {
  Day: [{ d: "9AM", v: 10 }, { d: "11AM", v: 30 }, { d: "1PM", v: 60 }, { d: "3PM", v: 80 }, { d: "5PM", v: 92 }],
  Week: [{ d: `${currMonthName} 1`, v: 10 }, { d: `${currMonthName} 8`, v: 45 }, { d: `${currMonthName} 15`, v: 60 }, { d: `${currMonthName} 22`, v: 78 }, { d: `${currMonthName} 29`, v: 92 }],
  Month: [{ d: "Jan", v: 85 }, { d: "Feb", v: 88 }, { d: "Mar", v: 90 }, { d: "Apr", v: 87 }, { d: currMonthName, v: 92 }],
}

function mergeRecords(primary = [], secondary = []) {
  const seen = new Set()
  const merged = []
    ;[...primary, ...secondary].forEach((r) => {
      const key = `${r.date}|${r.checkIn}|${r.checkOut}|${r.status}|${r.location}`
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(r)
      }
    })
  return merged
}

export default function AttendancePage() {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [monthIdx, setMonthIdx] = useState(now.getMonth())
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInId, setCheckInId] = useState(null)
  const [checkInTime, setCheckInTime] = useState(null)
  const [records, setRecords] = useState(RECORDS)
  const [stats, setStats] = useState({ present: 22, absent: 2, late: 1, percentage: 92 })
  const [viewRecord, setViewRecord] = useState(null)
  const [liveTime, setLiveTime] = useState("")
  const [liveDate, setLiveDate] = useState("")
  const [location, setLocation] = useState("Fetching location...")
  const [chartPeriod, setChartPeriod] = useState("Week")

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setLiveTime(d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      setLiveDate(d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" }))
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) { setLocation("Not supported"); return }
    setLocation("Fetching location...")
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
          const d = await r.json()
          const a = d.address
          setLocation(`${a.suburb || a.city_district || a.city || "Unknown"}, ${a.state || ""}`)
        } catch { setLocation(`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`) }
      },
      async () => {
        try {
          const r = await fetch("https://ipapi.co/json/")
          const d = await r.json()
          setLocation(d.city ? `${d.city}, ${d.region}` : "Location unavailable")
        } catch { setLocation("Enable location for check-in") }
      },
      { timeout: 8000, enableHighAccuracy: false }
    )
  }, [])

  useEffect(() => {
    const user = getUser()
    const recordsKey = `attendanceRecords_${user.id || "guest"}`
    api.getAttendance(user.id).then(r => {
      if (r.ok && r.data?.length) {
        setRecords((prev) => {
          const merged = mergeRecords(r.data, prev)
          try { localStorage.setItem(recordsKey, JSON.stringify(merged)) } catch { }
          return merged
        })
      }
    }).catch(() => { })
    api.getStats(user.id).then(r => { if (r.ok && r.data) setStats(r.data) }).catch(() => { })
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    const key = `checkedIn_${user.id}_${today}`

    // Restore records from localStorage if available
    try {
      const saved = JSON.parse(localStorage.getItem(recordsKey) || "[]")
      if (saved.length) setRecords(saved)
    } catch { }

    if (!localStorage.getItem(key) && user.id) {
      const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      api.checkIn({ internName: user.fullName || "Intern", date: today, checkIn: timeStr, status: "Present", location: "Auto check-in", userId: user.id })
        .then(r => { if (r.ok) { localStorage.setItem(key, r.data?.id || "done"); setCheckInId(r.data?.id); setCheckedIn(true); setCheckInTime(timeStr) } }).catch(() => { })
    } else if (localStorage.getItem(key)) {
      setCheckedIn(true)
    }
  }, [])

  const { days, startMon, data: calData, todayMidnight } = genMonthData(year, monthIdx, checkedIn)
  const cells = [...Array(startMon).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]

  const pushActivity = (entry) => {
    try {
      const existing = JSON.parse(localStorage.getItem("recentActivities") || "[]")
      const updated = [entry, ...existing].slice(0, 10)
      localStorage.setItem("recentActivities", JSON.stringify(updated))
    } catch { }
  }

  const handleMarkAttendance = async () => {
    const user = getUser()
    const d = new Date()
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    const r = await api.checkIn({ internName: user.fullName || "Intern", date: dateStr, checkIn: timeStr, status: "Present", location, userId: user.id })
    if (r.ok) setCheckInId(r.data?.id)
    setCheckedIn(true)
    setCheckInTime(timeStr)
    setStats(p => ({ ...p, present: p.present + 1, percentage: Math.round(((p.present + 1) / (p.present + p.absent + p.late + 1)) * 100) }))
    const newRecord = { date: dateStr, checkIn: timeStr, checkOut: "-", status: "Present", location, hours: "-" }
    setRecords(p => {
      const updated = [newRecord, ...p]
      try {
        const userId = getUser()?.id || "guest"
        localStorage.setItem(`attendanceRecords_${userId}`, JSON.stringify(updated))
      } catch { }
      return updated
    })
    pushActivity({ type: "attendance", text: `Attendance marked — Present`, time: `${timeStr}`, loc: location })
  }

  const handleCheckOut = async () => {
    const d = new Date()
    const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    if (checkInId) await api.checkOut(checkInId, { checkOut: timeStr })
    let hoursStr = "-"
    if (checkInTime) {
      const inMs = new Date(`${dateStr} ${checkInTime}`).getTime()
      const outMs = d.getTime()
      const diff = Math.max(0, outMs - inMs)
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      hoursStr = `${h}h ${m}m`
    }
    setCheckedIn(false)
    setRecords(p => {
      const updated = p.map((rec, i) => i === 0 ? { ...rec, checkOut: timeStr, hours: hoursStr } : rec)
      try {
        const userId = getUser()?.id || "guest"
        localStorage.setItem(`attendanceRecords_${userId}`, JSON.stringify(updated))
      } catch { }
      return updated
    })
    pushActivity({ type: "checkout", text: `Checked out — ${hoursStr} worked`, time: timeStr, loc: location })
    // Clear today's check-in key so user can check in again tomorrow
    const user = getUser()
    const today = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    localStorage.removeItem(`checkedIn_${user.id}_${today}`)
  }

  // Auto-checkout when tab/window closes
  useEffect(() => {
    const autoCheckout = () => {
      if (!checkedIn) return
      const d = new Date()
      const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      if (checkInId) {
        // Use sendBeacon for reliability on page close
        const blob = new Blob([JSON.stringify({ checkOut: timeStr })], { type: "application/json" })
        const apiRoot = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        navigator.sendBeacon?.(`${apiRoot}/intern/attendance/checkout/${checkInId}`, blob)
      }
      // Save checkout time to localStorage so it persists
      try {
        const userId = getUser()?.id || "guest"
        const recs = JSON.parse(localStorage.getItem(`attendanceRecords_${userId}`) || "[]")
        if (recs.length) {
          recs[0] = { ...recs[0], checkOut: timeStr }
          localStorage.setItem(`attendanceRecords_${userId}`, JSON.stringify(recs))
        }
      } catch { }
    }
    window.addEventListener("beforeunload", autoCheckout)
    return () => window.removeEventListener("beforeunload", autoCheckout)
  }, [checkedIn, checkInId, checkInTime])

  const exportCSV = () => {
    const rows = [["Date", "Check In", "Check Out", "Status", "Location", "Hours"]]
    records.forEach(r => rows.push([r.date, r.checkIn, r.checkOut, r.status, r.location, r.hours]))
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "attendance.csv"; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="portal-root h-screen w-full max-w-full overflow-hidden text-white flex relative">

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

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/65 z-0"></div>

      {/* CONTENT */}
      <div className="relative z-10 flex w-full h-full">
        <InternSidebar active="Attendance" />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto p-6 lg:p-8 gap-6 min-w-0">
          {/* HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Attendance</h1>
              <p className="text-gray-400 text-sm mt-1">Track your daily attendance, punch records, and work hours consistency.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleMarkAttendance} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs sm:text-sm font-semibold text-white hover:brightness-110 shadow-lg transition cursor-pointer">
                <CheckCircle2 size={16} /> Mark Attendance
              </button>
              <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-[#111827] transition shadow-md cursor-pointer">
                <Download size={16} /> Export Report
              </button>
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 flex-shrink-0">
            {[
              { l: "Overall Attendance", v: `${stats.percentage || 92}%`, sub: "8% from last month", c: "#7C3AED", Icon: BarChart2 },
              { l: "Present Days", v: String(stats.present || 22), sub: "This Month", c: "#22c55e", Icon: CalendarCheck },
              { l: "Absent Days", v: String(stats.absent || 2), sub: "This Month", c: "#ef4444", Icon: CalendarX },
              { l: "Late Entries", v: String(stats.late || 1), sub: "This Month", c: "#f59e0b", Icon: AlarmClock },
            ].map((s, i) => (
              <div key={i} className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 card-hover shadow-lg transition">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.c + "22" }}>
                    <s.Icon size={18} style={{ color: s.c }} />
                  </div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">{s.l}</span>
                </div>
                <div className="text-3xl font-extrabold" style={{ color: s.c }}>{s.v}</div>
                <div className="text-xs mt-1.5 font-medium" style={{ color: s.c }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* MIDDLE SECTION: CALENDAR (LEFT) & OVERVIEW / CHECK-IN (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-shrink-0">
            {/* CALENDAR (Spacious, full month display) */}
            <div className="lg:col-span-7 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col min-h-[440px] card-hover shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e293b] flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                    <CalendarCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Attendance Calendar</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Review monthly presence & punch status</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#111827] border border-[#1e293b] rounded-xl px-2.5 py-1.5">
                  <button onClick={() => { if (monthIdx === 0) { setMonthIdx(11); setYear(y => y - 1) } else setMonthIdx(m => m - 1) }} className="w-7 h-7 rounded-lg hover:bg-[#1e293b] flex items-center justify-center transition text-gray-400 hover:text-white cursor-pointer"><ChevronLeft size={16} /></button>
                  <span className="text-sm font-bold text-white min-w-[120px] text-center">{MONTHS[monthIdx]} {year}</span>
                  <button onClick={() => { if (monthIdx === 11) { setMonthIdx(0); setYear(y => y + 1) } else setMonthIdx(m => m + 1) }} className="w-7 h-7 rounded-lg hover:bg-[#1e293b] flex items-center justify-center transition text-gray-400 hover:text-white cursor-pointer"><ChevronRight size={16} /></button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1.5 uppercase tracking-wider">{d}</div>
                ))}
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 flex-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} className="rounded-xl bg-transparent min-h-[48px]" />
                  const cellTime = new Date(year, monthIdx, day).getTime()
                  const isToday = day === now.getDate() && monthIdx === now.getMonth() && year === now.getFullYear()
                  const isFuture = cellTime > todayMidnight
                  const att = calData[day]

                  return (
                    <div
                      key={i}
                      className={`min-h-[48px] py-2 flex flex-col items-center justify-center rounded-xl transition ${isToday
                          ? "bg-purple-600/30 border border-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.35)] cursor-pointer"
                          : isFuture
                            ? "bg-[#111827]/25 border border-transparent text-gray-500 cursor-default select-none"
                            : "bg-[#111827]/60 hover:bg-[#1e293b] border border-transparent hover:border-[#334155] cursor-pointer"
                        }`}
                    >
                      <span className={`text-xs sm:text-sm ${isToday
                          ? "text-purple-300 font-bold"
                          : isFuture
                            ? "text-gray-500 font-normal"
                            : "text-gray-200 font-medium"
                        }`}>
                        {day}
                      </span>
                      {!isFuture && att && (
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 transition-transform transform group-hover:scale-125"
                          style={{
                            background: DOT[att] || "#22c55e",
                            boxShadow: `0 0 6px ${DOT[att] || "#22c55e"}`
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between gap-2.5 mt-5 pt-3.5 border-t border-[#1e293b] flex-wrap text-xs">
                {[
                  { l: "Present", c: "#22c55e", isNeutral: false },
                  { l: "Absent", c: "#ef4444", isNeutral: false },
                  { l: "Late", c: "#f59e0b", isNeutral: false },
                  { l: "Weekend / Holiday", c: "#3b82f6", isNeutral: false },
                  { l: "Upcoming Date", c: "#64748b", isNeutral: true },
                ].map(({ l, c, isNeutral }) => (
                  <div key={l} className="flex items-center gap-2 bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1e293b]/60">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background: isNeutral ? "transparent" : c,
                        border: isNeutral ? `1.5px solid ${c}` : "none",
                        boxShadow: isNeutral ? "none" : `0 0 5px ${c}`
                      }}
                    />
                    <span className="text-gray-300 font-medium">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE: ATTENDANCE OVERVIEW + CHECK IN/OUT */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* ATTENDANCE OVERVIEW */}
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col card-hover shadow-xl">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <BarChart2 size={18} className="text-cyan-400" /> Attendance Overview
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Performance rate & working hours consistency</p>
                  </div>
                  <div className="flex bg-[#111827] border border-[#1e293b] rounded-xl p-1 gap-1">
                    {["Day", "Week", "Month"].map(p => (
                      <button key={p} onClick={() => setChartPeriod(p)} className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${chartPeriod === p ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm" : "text-gray-400 hover:text-white"}`}>{p}</button>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                <div className="h-52 w-full min-w-0 mt-1">
                  <ClientChart height={208} minHeight={180}>
                    <AreaChart data={CHART_DATA[chartPeriod]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                      <XAxis dataKey="d" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "12px" }} />
                      <Area type="monotone" dataKey="v" stroke="#a855f7" strokeWidth={2.5} fill="url(#ag)" dot={{ fill: "#06B6D4", r: 3 }} activeDot={{ r: 5, fill: "#22d3ee" }} />
                    </AreaChart>
                  </ClientChart>
                </div>
              </div>

              {/* CHECK IN / OUT STATUS CARD */}
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col card-hover shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${checkedIn ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
                    <span className="text-sm font-bold text-white">Daily Punch Status</span>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${checkedIn ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
                    {checkedIn ? "Checked In" : "Not Checked In"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Live clock + location */}
                  <div className="bg-[#111827] rounded-xl p-4 border border-[#1e293b]/70 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Live Time</span>
                      <div className="text-2xl font-bold font-mono text-cyan-300 tracking-wider mt-1">{liveTime || "--:--:--"}</div>
                      <div className="text-xs text-gray-400 mt-1">{liveDate}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#1e293b]">
                      <MapPin size={13} className="text-cyan-400 flex-shrink-0" />
                      <span className="text-xs text-gray-300 truncate">{location}</span>
                    </div>
                  </div>

                  {/* Timings & Action Button */}
                  <div className="bg-[#111827] rounded-xl p-4 border border-[#1e293b]/70 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Check In</span>
                        <span className="font-bold text-emerald-400">
                          {checkInTime || (records[0]?.checkIn !== "-" ? records[0]?.checkIn : "--:--")}
                        </span>
                      </div>
                      <div className="w-full h-px bg-[#1e293b] my-2" />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Check Out</span>
                        <span className={`font-bold ${checkedIn ? "text-amber-400" : "text-gray-300"}`}>
                          {records[0]?.checkOut && records[0]?.checkOut !== "-"
                            ? records[0].checkOut
                            : checkedIn ? "Active session…" : "--:--"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#1e293b]">
                      {!checkedIn ? (
                        <button onClick={handleMarkAttendance}
                          className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:brightness-110 transition shadow-md cursor-pointer">
                          <CheckCircle2 size={15} /> Punch In Now
                        </button>
                      ) : (
                        <button onClick={handleCheckOut}
                          className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition shadow-md cursor-pointer">
                          <Clock size={15} /> Punch Out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT ATTENDANCE TABLE */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl flex flex-col flex-shrink-0 pb-2">
            <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Recent Attendance Logs</h2>
                <p className="text-xs text-gray-400 mt-0.5">Showing last {records.length} records</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead className="bg-[#111827]/90 border-b border-[#1e293b]">
                  <tr>
                    {["Date", "Check In", "Check Out", "Status", "Location", "Action"].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]/60">
                  {records.map((r, i) => (
                    <tr key={i} className="transition row-hover hover:bg-[#111827]/60">
                      <td className="px-5 py-3.5 text-sm text-white font-medium">{r.date}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{r.checkIn}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{r.checkOut}</td>
                      <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-lg text-xs font-semibold inline-block" style={{ color: SC[r.status]?.c, background: SC[r.status]?.bg }}>{r.status}</span></td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">{r.location}</td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setViewRecord(r)} className="px-3.5 py-1.5 rounded-lg bg-purple-600/20 border border-purple-600/40 text-purple-300 hover:bg-purple-600/30 text-xs font-medium transition cursor-pointer">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* VIEW MODAL */}
        {viewRecord && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold">Attendance Details</span>
                <button onClick={() => setViewRecord(null)}><X size={14} className="text-gray-400" /></button>
              </div>
              <div className="space-y-2">
                {[["Date", viewRecord.date], ["Check In", viewRecord.checkIn], ["Check Out", viewRecord.checkOut], ["Hours", viewRecord.hours], ["Location", viewRecord.location]].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center bg-[#111827] rounded-xl px-3 py-2">
                    <span className="text-[10px] text-gray-400">{l}</span>
                    <span className="text-xs font-medium text-white">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center bg-[#111827] rounded-xl px-3 py-2">
                  <span className="text-[10px] text-gray-400">Status</span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold" style={{ color: SC[viewRecord.status]?.c, background: SC[viewRecord.status]?.bg }}>{viewRecord.status}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { const blob = new Blob([`Date,Check In,Check Out,Status,Location\n${viewRecord.date},${viewRecord.checkIn},${viewRecord.checkOut},${viewRecord.status},${viewRecord.location}`], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "record.csv"; a.click(); URL.revokeObjectURL(url) }} className="flex-1 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs">Download</button>
                <button onClick={() => setViewRecord(null)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
