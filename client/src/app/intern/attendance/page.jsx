"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import InternSidebar from "../../../lib/internSidebar"
import {
  ChevronLeft, ChevronRight, CheckCircle2, Clock, MapPin,
  Download, X, BarChart2, CalendarCheck, CalendarX, AlarmClock,
  AlertCircle, ChevronDown, Check, RefreshCw
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid
} from "recharts"
import { ClientChart } from "../../../components/ui/client-chart"
import { api, getInternUser, getUser } from "../../../lib/api"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const DOT = { p: "#22c55e", a: "#ef4444", l: "#f59e0b", v: "#3b82f6" }

const SC = {
  Present: { c: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.35)" },
  Absent: { c: "#ef4444", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.35)" },
  Late: { c: "#f59e0b", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.35)" },
}

// Robust date string parser for any format ("May 01, 2025", "2025-05-01", etc.)
function parseDate(dateStr) {
  if (!dateStr) return new Date(0)
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date(0) : d
}

function formatDateString(d = new Date()) {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
}

// Deduplicate attendance records by user & date (preserves most complete record)
function deduplicateRecords(records = []) {
  const map = new Map()
  for (const r of records) {
    const dStr = (r.date || "").trim()
    if (!dStr) continue
    if (map.has(dStr)) {
      const existing = map.get(dStr)
      const existingHasCheckout = existing.checkOut && existing.checkOut !== "-"
      const newHasCheckout = r.checkOut && r.checkOut !== "-"
      if (newHasCheckout && !existingHasCheckout) {
        map.set(dStr, r)
      } else if (String(r._id || "") > String(existing._id || "") && !existingHasCheckout) {
        map.set(dStr, r)
      }
    } else {
      map.set(dStr, r)
    }
  }
  return Array.from(map.values()).sort((a, b) => parseDate(b.date) - parseDate(a.date))
}

export default function AttendancePage() {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [monthIdx, setMonthIdx] = useState(now.getMonth())
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInId, setCheckInId] = useState(null)
  const [checkInTime, setCheckInTime] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewRecord, setViewRecord] = useState(null)
  const [liveTime, setLiveTime] = useState("")
  const [liveDate, setLiveDate] = useState("")
  const [location, setLocation] = useState("Fetching location...")
  const [chartPeriod, setChartPeriod] = useState("All") // "Day", "Week", "Month", "All"
  const [statusMenuOpen, setStatusMenuOpen] = useState(null) // ID of record with open status menu
  const [punchMenuOpen, setPunchMenuOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  // Live Clock
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setLiveTime(d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      setLiveDate(d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Geolocation
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocation("Location not supported")
      return
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
          const d = await r.json()
          const a = d.address || {}
          setLocation(`${a.suburb || a.city_district || a.city || "Office"}, ${a.state || ""}`)
        } catch {
          setLocation(`${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`)
        }
      },
      () => setLocation("Office / Remote"),
      { timeout: 6000, enableHighAccuracy: false }
    )
  }, [])

  // Load real attendance data for logged-in intern
  const loadAttendance = async () => {
    try {
      setLoading(true)
      const u = getInternUser() || getUser()
      const uid = u?.id || u?._id
      if (!uid) {
        setRecords([])
        setLoading(false)
        return
      }

      const res = await api.getAttendance(uid)
      if (res.ok && Array.isArray(res.data)) {
        const deduped = deduplicateRecords(res.data)
        setRecords(deduped)

        // Check if checked in today
        const todayStr = formatDateString(new Date())
        const todayRec = deduped.find(r => r.date === todayStr)
        if (todayRec) {
          if (todayRec.checkIn && todayRec.checkIn !== "-" && (!todayRec.checkOut || todayRec.checkOut === "-")) {
            setCheckedIn(true)
            setCheckInId(todayRec._id)
            setCheckInTime(todayRec.checkIn)
          } else {
            setCheckedIn(false)
            setCheckInId(todayRec._id)
            setCheckInTime(todayRec.checkIn)
          }
        } else {
          setCheckedIn(false)
          setCheckInId(null)
          setCheckInTime(null)
        }
      } else {
        setRecords([])
      }
    } catch (err) {
      console.error("Error loading attendance:", err)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttendance()
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // Formula & Calculations:
  // - Present Days: Unique days with status === "Present"
  // - Late Entries: Unique days with status === "Late" (Attended work, but late)
  // - Absent Days: Unique days with status === "Absent"
  // - Attended Days: Present Days + Late Entries (no double counting)
  // - Total Eligible Days: Present Days + Late Entries + Absent Days
  // - Attendance Percentage: (Attended Days / Total Eligible Days) * 100
  // - If Total == 0: 0.0% ("No attendance records yet")
  // ─────────────────────────────────────────────────────────────────────────────

  // Overall (All-time) stats
  const overallStats = useMemo(() => {
    let present = 0, late = 0, absent = 0
    for (const r of records) {
      const st = (r.status || "").trim().toLowerCase()
      if (st === "present") present++
      else if (st === "late") late++
      else if (st === "absent") absent++
      else present++
    }
    const attended = present + late
    const total = present + late + absent
    const percentage = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0
    return { present, late, absent, attended, total, percentage }
  }, [records])

  // Filtered stats according to current selected period (Day, Week, Month, All)
  const currentStats = useMemo(() => {
    if (chartPeriod === "All") {
      return overallStats
    }

    const todayStr = formatDateString(new Date())
    const todayDate = new Date()

    if (chartPeriod === "Day") {
      const todayRec = records.find(r => r.date === todayStr)
      if (!todayRec) {
        return { present: 0, late: 0, absent: 0, attended: 0, total: 0, percentage: 0, periodName: "Today" }
      }
      const st = (todayRec.status || "").toLowerCase()
      const isPres = st === "present"
      const isLate = st === "late"
      const isAbs = st === "absent"
      const att = isPres || isLate ? 1 : 0
      return {
        present: isPres ? 1 : 0,
        late: isLate ? 1 : 0,
        absent: isAbs ? 1 : 0,
        attended: att,
        total: 1,
        percentage: att ? 100 : 0,
        periodName: "Today"
      }
    }

    if (chartPeriod === "Week") {
      // Calculate current week (Monday through Sunday)
      const curr = new Date()
      const dayOfWeek = (curr.getDay() + 6) % 7 // Monday = 0
      const monday = new Date(curr)
      monday.setDate(curr.getDate() - dayOfWeek)
      monday.setHours(0, 0, 0, 0)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)

      const weekRecs = records.filter(r => {
        const d = parseDate(r.date)
        return d >= monday && d <= sunday
      })

      let present = 0, late = 0, absent = 0
      for (const r of weekRecs) {
        const st = (r.status || "").toLowerCase()
        if (st === "present") present++
        else if (st === "late") late++
        else if (st === "absent") absent++
      }
      const attended = present + late
      const total = present + late + absent
      const percentage = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0
      return { present, late, absent, attended, total, percentage, periodName: "This Week" }
    }

    if (chartPeriod === "Month") {
      // Current active calendar month and year
      const monthRecs = records.filter(r => {
        const d = parseDate(r.date)
        return d.getMonth() === monthIdx && d.getFullYear() === year
      })

      let present = 0, late = 0, absent = 0
      for (const r of monthRecs) {
        const st = (r.status || "").toLowerCase()
        if (st === "present") present++
        else if (st === "late") late++
        else if (st === "absent") absent++
      }
      const attended = present + late
      const total = present + late + absent
      const percentage = total > 0 ? Math.round((attended / total) * 1000) / 10 : 0
      return { present, late, absent, attended, total, percentage, periodName: `${MONTHS[monthIdx]} ${year}` }
    }

    return overallStats
  }, [records, chartPeriod, monthIdx, year, overallStats])

  // ─────────────────────────────────────────────────────────────────────────────
  // Dynamic Chart Data (Generated strictly from real records)
  // ─────────────────────────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (records.length === 0) return []

    if (chartPeriod === "Day") {
      const todayStr = formatDateString(new Date())
      const todayRec = records.find(r => r.date === todayStr) || records[0]
      if (!todayRec) return []

      const st = (todayRec.status || "").toLowerCase()
      const val = st === "absent" ? 0 : 100
      return [
        { d: "9 AM", v: val },
        { d: "11 AM", v: val },
        { d: "1 PM", v: val },
        { d: "3 PM", v: val },
        { d: "5 PM", v: val },
      ]
    }

    if (chartPeriod === "Week") {
      const curr = new Date()
      const dayOfWeek = (curr.getDay() + 6) % 7 // Monday = 0
      const monday = new Date(curr)
      monday.setDate(curr.getDate() - dayOfWeek)

      const daysName = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      const points = []

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        const dStr = formatDateString(d)
        const rec = records.find(r => r.date === dStr)

        if (rec) {
          const st = (rec.status || "").toLowerCase()
          points.push({ d: daysName[i], v: st === "absent" ? 0 : 100 })
        } else {
          // If past or current day, leave as neutral or plot 0 if weekday passed
          const isFuture = d.getTime() > new Date().setHours(23, 59, 59, 999)
          points.push({ d: daysName[i], v: isFuture ? null : 0 })
        }
      }
      return points
    }

    if (chartPeriod === "All") {
      const monthGroups = {}
      for (const r of records) {
        const d = parseDate(r.date)
        const key = `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
        if (!monthGroups[key]) monthGroups[key] = { attended: 0, total: 0 }
        const st = (r.status || "").toLowerCase()
        if (st === "present" || st === "late") monthGroups[key].attended++
        monthGroups[key].total++
      }
      return Object.entries(monthGroups).map(([k, v]) => ({
        d: k,
        v: Math.round((v.attended / v.total) * 100)
      }))
    }

    // Default: Month (Grouped by weeks of active month)
    const monthRecs = records.filter(r => {
      const d = parseDate(r.date)
      return d.getMonth() === monthIdx && d.getFullYear() === year
    })

    if (monthRecs.length === 0) return []

    // Group into Week 1 (1-7), Week 2 (8-14), Week 3 (15-21), Week 4 (22-28), Week 5 (29-31)
    const weeks = [
      { name: "W1 (1-7)", start: 1, end: 7 },
      { name: "W2 (8-14)", start: 8, end: 14 },
      { name: "W3 (15-21)", start: 15, end: 21 },
      { name: "W4 (22-28)", start: 22, end: 28 },
      { name: "W5 (29+)", start: 29, end: 31 },
    ]

    const points = []
    for (const w of weeks) {
      const recsInWeek = monthRecs.filter(r => {
        const day = parseDate(r.date).getDate()
        return day >= w.start && day <= w.end
      })

      if (recsInWeek.length > 0) {
        let attended = 0
        for (const r of recsInWeek) {
          const st = (r.status || "").toLowerCase()
          if (st === "present" || st === "late") attended++
        }
        const pct = Math.round((attended / recsInWeek.length) * 100)
        points.push({ d: w.name, v: pct })
      } else {
        points.push({ d: w.name, v: 0 })
      }
    }
    return points
  }, [records, chartPeriod, monthIdx, year])

  // ─────────────────────────────────────────────────────────────────────────────
  // Calendar Days Calculation (Real records mapping)
  // ─────────────────────────────────────────────────────────────────────────────
  const calendarData = useMemo(() => {
    const today = new Date()
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
    const firstDow = new Date(year, monthIdx, 1).getDay()
    const startMon = (firstDow + 6) % 7 // Monday = 0
    const cellMap = {}

    // Map user's real records for this month
    const monthRecs = records.filter(r => {
      const d = parseDate(r.date)
      return d.getMonth() === monthIdx && d.getFullYear() === year
    })

    const recordByDay = {}
    for (const r of monthRecs) {
      const dayNum = parseDate(r.date).getDate()
      recordByDay[dayNum] = r
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, monthIdx, d)
      const cellTime = cellDate.getTime()
      const dow = cellDate.getDay()
      const isWeekend = (dow === 0 || dow === 6)

      if (cellTime > todayMidnight) {
        // Future date: strictly neutral, never marked absent
        cellMap[d] = { type: null, isFuture: true, record: null }
      } else if (cellTime === todayMidnight) {
        // Today
        const rec = recordByDay[d]
        if (rec) {
          const st = (rec.status || "").toLowerCase()
          cellMap[d] = {
            type: st === "absent" ? "a" : st === "late" ? "l" : "p",
            isToday: true,
            record: rec
          }
        } else {
          cellMap[d] = {
            type: checkedIn ? "p" : isWeekend ? "v" : "today",
            isToday: true,
            record: null
          }
        }
      } else {
        // Past date
        const rec = recordByDay[d]
        if (rec) {
          const st = (rec.status || "").toLowerCase()
          cellMap[d] = {
            type: st === "absent" ? "a" : st === "late" ? "l" : "p",
            record: rec
          }
        } else if (isWeekend) {
          cellMap[d] = { type: "v", record: null } // Weekend
        } else {
          // Past weekday with no punch: neutral, NOT absent
          cellMap[d] = { type: null, record: null }
        }
      }
    }

    const cells = [...Array(startMon).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
    return { daysInMonth, startMon, cellMap, cells, todayMidnight }
  }, [records, monthIdx, year, checkedIn])

  // ─────────────────────────────────────────────────────────────────────────────
  // Punch In / Status Changing Handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const handleMarkStatus = async (chosenStatus = "Present") => {
    try {
      const u = getInternUser() || getUser()
      const uid = u?.id || u?._id
      if (!uid) return

      const d = new Date()
      const dateStr = formatDateString(d)
      const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

      const res = await api.checkIn({
        internName: u.fullName || u.name || "Intern",
        date: dateStr,
        checkIn: chosenStatus === "Absent" ? "-" : timeStr,
        status: chosenStatus,
        location: chosenStatus === "Absent" ? "Leave / Absent" : location,
        userId: uid
      })

      if (res.ok) {
        if (chosenStatus === "Present" || chosenStatus === "Late") {
          setCheckedIn(true)
          setCheckInTime(timeStr)
          setCheckInId(res.data?.id)
        } else {
          setCheckedIn(false)
          setCheckInTime("-")
        }
      }

      await loadAttendance()
      setPunchMenuOpen(false)

      // Notify other tabs/components
      window.dispatchEvent(new Event("intern_attendance_updated"))
    } catch (err) {
      console.error("Error marking attendance:", err)
    }
  }

  const handleCheckOut = async () => {
    try {
      const d = new Date()
      const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

      if (checkInId) {
        await api.checkOut(checkInId, { checkOut: timeStr })
      }
      setCheckedIn(false)
      await loadAttendance()
      window.dispatchEvent(new Event("intern_attendance_updated"))
    } catch (err) {
      console.error("Error during checkout:", err)
    }
  }

  // Update record status (e.g. from Present to Absent or Late)
  const handleChangeStatus = async (record, newStatus) => {
    try {
      setUpdatingId(record._id)
      const res = await api.updateAttendance(record._id, {
        status: newStatus,
        checkIn: newStatus === "Absent" ? "-" : (record.checkIn === "-" ? "09:00 AM" : record.checkIn),
        checkOut: newStatus === "Absent" ? "-" : record.checkOut
      })

      if (res.ok) {
        // Optimistically update local records
        setRecords(prev => prev.map(r => r._id === record._id ? {
          ...r,
          status: newStatus,
          checkIn: newStatus === "Absent" ? "-" : r.checkIn,
          checkOut: newStatus === "Absent" ? "-" : r.checkOut
        } : r))

        if (viewRecord && viewRecord._id === record._id) {
          setViewRecord(prev => ({
            ...prev,
            status: newStatus,
            checkIn: newStatus === "Absent" ? "-" : prev.checkIn,
            checkOut: newStatus === "Absent" ? "-" : prev.checkOut
          }))
        }

        // Trigger global progress sync
        const u = getInternUser() || getUser()
        const uid = u?.id || u?._id
        if (uid) {
          const freshStats = await api.getStats(uid)
          if (freshStats.ok) {
            window.dispatchEvent(new CustomEvent("intern_progress_updated", { detail: freshStats.data }))
          }
        }
      }
    } catch (err) {
      console.error("Error updating status:", err)
    } finally {
      setUpdatingId(null)
      setStatusMenuOpen(null)
    }
  }

  const exportCSV = () => {
    if (records.length === 0) return
    const rows = [["Date", "Check In", "Check Out", "Status", "Location", "Hours"]]
    records.forEach(r => rows.push([r.date, r.checkIn || "-", r.checkOut || "-", r.status, r.location || "-", r.hours || "-"]))
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance_${formatDateString(new Date())}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="portal-root min-h-screen w-full max-w-full overflow-hidden text-white flex bg-[#0b0f19]">
      <InternSidebar active="Attendance" />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto p-6 lg:p-8 gap-6 min-w-0 bg-[#0b0f19]">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Attendance Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              Live attendance records, verified punch logs, and verified attendance rates.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Mark Attendance Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPunchMenuOpen(!punchMenuOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs sm:text-sm font-semibold text-white hover:brightness-110 shadow-lg transition cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>Mark Attendance</span>
                <ChevronDown size={14} />
              </button>

              {punchMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => handleMarkStatus("Present")}
                    className="w-full text-left px-4 py-2 text-xs sm:text-sm text-emerald-400 hover:bg-[#111827] flex items-center gap-2 transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    Punch In (Present)
                  </button>
                  <button
                    onClick={() => handleMarkStatus("Late")}
                    className="w-full text-left px-4 py-2 text-xs sm:text-sm text-amber-400 hover:bg-[#111827] flex items-center gap-2 transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    Mark Today as Late
                  </button>
                  <button
                    onClick={() => handleMarkStatus("Absent")}
                    className="w-full text-left px-4 py-2 text-xs sm:text-sm text-red-400 hover:bg-[#111827] flex items-center gap-2 transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    Mark Today as Absent
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={exportCSV}
              disabled={records.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-[#111827] transition shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* CALCULATION FORMULA BANNER */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <BarChart2 size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-200">
                Attendance Formula: <span className="text-cyan-300 font-mono">((Present Days + Late Entries) / Total Eligible Attendance Days) × 100</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Late entries count toward attended days without double counting. Unmarked or future dates are never counted as absent.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0b0f19] border border-[#1e293b] px-3 py-1.5 rounded-xl text-xs font-mono text-purple-300">
            <span>Period:</span>
            <strong className="text-white">{currentStats.periodName || "Overall"}</strong>
          </div>
        </div>

        {/* 4 SUMMARY STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 flex-shrink-0">
          {/* Card 1: Overall Percentage */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-lg transition hover:border-purple-500/40">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                <BarChart2 size={18} className="text-purple-400" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block leading-tight">
                  Overall Attendance
                </span>
                <span className="text-[10px] text-purple-400 font-mono">
                  {currentStats.periodName || "All-time"}
                </span>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {currentStats.total > 0 ? `${currentStats.percentage}%` : "0%"}
            </div>
            <div className="text-xs mt-1.5 font-medium text-gray-400">
              {currentStats.total > 0
                ? `${currentStats.attended} of ${currentStats.total} eligible days attended`
                : "No attendance records yet"}
            </div>
          </div>

          {/* Card 2: Present Days */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-lg transition hover:border-emerald-500/40">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <CalendarCheck size={18} className="text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block leading-tight">
                  Present Days
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">On-Time Presence</span>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {currentStats.present}
            </div>
            <div className="text-xs mt-1.5 font-medium text-emerald-400/80">
              {currentStats.total > 0
                ? `${Math.round((currentStats.present / currentStats.total) * 100)}% on-time rate`
                : "0 on-time check-ins"}
            </div>
          </div>

          {/* Card 3: Absent Days */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-lg transition hover:border-red-500/40">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <CalendarX size={18} className="text-red-400" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block leading-tight">
                  Absent Days
                </span>
                <span className="text-[10px] text-red-400 font-mono">Unattended Days</span>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-red-400">
              {currentStats.absent}
            </div>
            <div className="text-xs mt-1.5 font-medium text-red-400/80">
              {currentStats.total > 0
                ? `${Math.round((currentStats.absent / currentStats.total) * 100)}% absence rate`
                : "No absent days logged"}
            </div>
          </div>

          {/* Card 4: Late Entries */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 shadow-lg transition hover:border-amber-500/40">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <AlarmClock size={18} className="text-amber-400" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block leading-tight">
                  Late Entries
                </span>
                <span className="text-[10px] text-amber-400 font-mono">Attended Late</span>
              </div>
            </div>
            <div className="text-3xl font-extrabold text-amber-400">
              {currentStats.late}
            </div>
            <div className="text-xs mt-1.5 font-medium text-amber-400/80">
              Counted toward attendance
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: CALENDAR (LEFT) & OVERVIEW / CHECK-IN (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-shrink-0">
          {/* CALENDAR (7 COLS) */}
          <div className="lg:col-span-7 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col min-h-[440px] shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e293b] flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Attendance Calendar</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Real-time attendance dots mapped from database records</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#111827] border border-[#1e293b] rounded-xl px-2.5 py-1.5">
                <button
                  onClick={() => {
                    if (monthIdx === 0) { setMonthIdx(11); setYear(y => y - 1) }
                    else setMonthIdx(m => m - 1)
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-[#1e293b] flex items-center justify-center transition text-gray-400 hover:text-white cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-bold text-white min-w-[130px] text-center">
                  {MONTHS[monthIdx]} {year}
                </span>
                <button
                  onClick={() => {
                    if (monthIdx === 11) { setMonthIdx(0); setYear(y => y + 1) }
                    else setMonthIdx(m => m + 1)
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-[#1e293b] flex items-center justify-center transition text-gray-400 hover:text-white cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1.5 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 flex-1">
              {calendarData.cells.map((day, i) => {
                if (!day) return <div key={i} className="rounded-xl bg-transparent min-h-[48px]" />

                const cell = calendarData.cellMap[day] || {}
                const isToday = cell.isToday
                const isFuture = cell.isFuture
                const attType = cell.type
                const hasRecord = !!cell.record

                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (hasRecord) setViewRecord(cell.record)
                    }}
                    title={hasRecord ? `${formatDateString(parseDate(cell.record.date))}: ${cell.record.status} (${cell.record.checkIn} - ${cell.record.checkOut})` : `Day ${day}`}
                    className={`min-h-[48px] py-2 flex flex-col items-center justify-center rounded-xl transition ${isToday
                        ? "bg-purple-600/30 border border-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.35)] cursor-pointer"
                        : hasRecord
                          ? "bg-[#111827] hover:bg-[#1e293b] border border-[#1e293b] hover:border-cyan-500/40 cursor-pointer shadow-sm"
                          : isFuture
                            ? "bg-[#111827]/20 border border-transparent text-gray-600 cursor-default select-none"
                            : "bg-[#111827]/50 border border-transparent text-gray-400 select-none"
                      }`}
                  >
                    <span className={`text-xs sm:text-sm font-medium ${isToday ? "text-purple-300 font-bold" : isFuture ? "text-gray-600" : "text-gray-200"
                      }`}>
                      {day}
                    </span>

                    {/* Dot Indicator */}
                    {!isFuture && attType && attType !== "today" && (
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 transition-transform transform hover:scale-125"
                        style={{
                          background: DOT[attType] || "#22c55e",
                          boxShadow: `0 0 6px ${DOT[attType] || "#22c55e"}`
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between gap-2 mt-5 pt-3.5 border-t border-[#1e293b] flex-wrap text-xs">
              {[
                { l: "Present", c: "#22c55e", isNeutral: false },
                { l: "Late", c: "#f59e0b", isNeutral: false },
                { l: "Absent", c: "#ef4444", isNeutral: false },
                { l: "Weekend", c: "#3b82f6", isNeutral: false },
                { l: "Upcoming / Unmarked", c: "#64748b", isNeutral: true },
              ].map(({ l, c, isNeutral }) => (
                <div key={l} className="flex items-center gap-1.5 bg-[#111827] px-2.5 py-1 rounded-lg border border-[#1e293b]/70">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: isNeutral ? "transparent" : c,
                      border: isNeutral ? `1.5px solid ${c}` : "none",
                      boxShadow: isNeutral ? "none" : `0 0 5px ${c}`
                    }}
                  />
                  <span className="text-gray-300 font-medium text-[11px]">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE (5 COLS): ATTENDANCE OVERVIEW & CHECK IN STATUS */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* ATTENDANCE OVERVIEW CHART */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col shadow-xl">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BarChart2 size={18} className="text-cyan-400" /> Attendance Overview
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Calculated from actual records ({chartPeriod})</p>
                </div>

                <div className="flex bg-[#111827] border border-[#1e293b] rounded-xl p-1 gap-1">
                  {["Day", "Week", "Month", "All"].map(p => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${chartPeriod === p
                          ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm"
                          : "text-gray-400 hover:text-white"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Container */}
              <div className="h-52 w-full min-w-0 mt-1">
                {chartData.length > 0 ? (
                  <ClientChart height={208} minHeight={180}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                      <XAxis dataKey="d" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "12px" }}
                        formatter={v => [`${v}%`, "Attendance Rate"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="#a855f7"
                        strokeWidth={2.5}
                        fill="url(#attGrad)"
                        dot={{ fill: "#06B6D4", r: 3 }}
                        activeDot={{ r: 5, fill: "#22d3ee" }}
                      />
                    </AreaChart>
                  </ClientChart>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1e293b] bg-[#111827]/40 p-4 text-center">
                    <BarChart2 size={28} className="text-gray-600 mb-2" />
                    <p className="text-xs font-semibold text-gray-300">No attendance data for this period</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Punch in or select another period to view trends</p>
                  </div>
                )}
              </div>
            </div>

            {/* CHECK IN / OUT STATUS CARD */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${checkedIn ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
                  <span className="text-sm font-bold text-white">Daily Punch Status</span>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${checkedIn
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-gray-800 text-gray-400 border border-gray-700"
                  }`}>
                  {checkedIn ? "Checked In" : "Not Checked In"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Live clock + location */}
                <div className="bg-[#111827] rounded-xl p-4 border border-[#1e293b]/70 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Live Time</span>
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
                        {checkInTime || "--:--"}
                      </span>
                    </div>
                    <div className="w-full h-px bg-[#1e293b] my-2" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Check Out</span>
                      <span className={`font-bold ${checkedIn ? "text-amber-400" : "text-gray-300"}`}>
                        {checkedIn ? "Active session…" : "--:--"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1e293b]">
                    {!checkedIn ? (
                      <button
                        onClick={() => handleMarkStatus("Present")}
                        className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:brightness-110 transition shadow-md cursor-pointer"
                      >
                        <CheckCircle2 size={15} /> Punch In Now
                      </button>
                    ) : (
                      <button
                        onClick={handleCheckOut}
                        className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition shadow-md cursor-pointer"
                      >
                        <Clock size={15} /> Punch Out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT ATTENDANCE TABLE WITH STATUS TOGGLE */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl flex flex-col flex-shrink-0 pb-2">
          <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Attendance Records & Punch Logs</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Showing {records.length} unique recorded working days • Click on any status badge to update
              </p>
            </div>
            <button
              onClick={loadAttendance}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1e293b] hover:bg-[#1e293b] text-gray-300 flex items-center gap-1.5 transition"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            {records.length > 0 ? (
              <table className="w-full border-collapse min-w-[700px]">
                <thead className="bg-[#111827]/90 border-b border-[#1e293b]">
                  <tr>
                    {["Date", "Check In", "Check Out", "Status (Click to Change)", "Location", "Hours", "Action"].map(h => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]/60">
                  {records.map((r, i) => (
                    <tr key={r._id || i} className="transition row-hover hover:bg-[#111827]/60">
                      <td className="px-5 py-3.5 text-sm text-white font-medium">{r.date}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{r.checkIn || "-"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300">{r.checkOut || "-"}</td>

                      {/* Status Selector Cell */}
                      <td className="px-5 py-3.5 relative">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setStatusMenuOpen(statusMenuOpen === r._id ? null : r._id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer"
                            style={{
                              color: SC[r.status]?.c || "#22c55e",
                              background: SC[r.status]?.bg || "rgba(34,197,94,0.15)",
                              borderColor: SC[r.status]?.border || "rgba(34,197,94,0.35)",
                            }}
                          >
                            <span>{r.status || "Present"}</span>
                            <ChevronDown size={12} />
                          </button>

                          {/* Inline Status Menu */}
                          {statusMenuOpen === r._id && (
                            <div className="absolute left-0 mt-1.5 w-32 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl py-1 z-30">
                              {["Present", "Late", "Absent"].map(st => (
                                <button
                                  key={st}
                                  onClick={() => handleChangeStatus(r, st)}
                                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#111827] transition ${r.status === st ? "font-bold text-white" : "text-gray-400"
                                    }`}
                                >
                                  <span style={{ color: SC[st]?.c }}>{st}</span>
                                  {r.status === st && <Check size={12} className="text-cyan-400" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-sm text-gray-400 truncate max-w-[150px]">{r.location || "-"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-300 font-mono">{r.hours || "-"}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setViewRecord(r)}
                          className="px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-600/40 text-purple-300 hover:bg-purple-600/30 text-xs font-medium transition cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 px-4">
                <CalendarX size={36} className="mx-auto text-gray-600 mb-2" />
                <p className="text-sm font-semibold text-gray-300">No attendance records yet</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Use "Punch In Now" to mark today's presence, or click "Mark Attendance" above.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* VIEW / EDIT MODAL */}
      {viewRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#1e293b]">
              <div>
                <span className="text-sm font-bold text-white">Attendance Record</span>
                <p className="text-xs text-gray-400 mt-0.5">{viewRecord.date}</p>
              </div>
              <button
                onClick={() => setViewRecord(null)}
                className="w-8 h-8 rounded-lg bg-[#111827] border border-[#1e293b] flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                ["Date", viewRecord.date],
                ["Check In", viewRecord.checkIn || "-"],
                ["Check Out", viewRecord.checkOut || "-"],
                ["Hours Worked", viewRecord.hours || "-"],
                ["Location", viewRecord.location || "-"]
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between items-center bg-[#111827] rounded-xl px-3.5 py-2.5 border border-[#1e293b]/70">
                  <span className="text-xs text-gray-400">{l}</span>
                  <span className="text-xs font-medium text-white">{v}</span>
                </div>
              ))}

              {/* Status Switcher in Modal */}
              <div className="bg-[#111827] rounded-xl px-3.5 py-3 border border-[#1e293b]/70">
                <span className="text-xs text-gray-400 block mb-2">Change Status:</span>
                <div className="grid grid-cols-3 gap-2">
                  {["Present", "Late", "Absent"].map(st => (
                    <button
                      key={st}
                      type="button"
                      disabled={updatingId === viewRecord._id}
                      onClick={() => handleChangeStatus(viewRecord, st)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition cursor-pointer ${viewRecord.status === st
                          ? "ring-2 ring-white/40 shadow"
                          : "opacity-70 hover:opacity-100"
                        }`}
                      style={{
                        color: SC[st]?.c,
                        background: SC[st]?.bg,
                        borderColor: SC[st]?.border,
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => {
                  const blob = new Blob([`Date,Check In,Check Out,Status,Location\n${viewRecord.date},${viewRecord.checkIn},${viewRecord.checkOut},${viewRecord.status},${viewRecord.location}`], { type: "text/csv" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `attendance_${viewRecord.date.replace(/\s+/g, "_")}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/30 transition cursor-pointer"
              >
                Download Entry
              </button>
              <button
                onClick={() => setViewRecord(null)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold hover:brightness-110 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
