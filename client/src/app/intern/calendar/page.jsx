"use client"
import { useState, useEffect } from "react"
import InternSidebar from "../../../lib/internSidebar"
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, Sparkles } from "lucide-react"
import { api, getUser } from "../../../lib/api"

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

const BASE_EVENTS = {
  // Static presets if needed, with dynamic fallback
  "2026-0":{ 5:[{l:"Mentor Meeting",c:"#7C3AED"}], 8:[{l:"Task Deadline",c:"#ef4444"}], 12:[{l:"Journal Submit",c:"#06B6D4"}], 15:[{l:"Code Review",c:"#22c55e"}], 20:[{l:"Sprint Start",c:"#7C3AED"}], 25:[{l:"Report Submit",c:"#f59e0b"}], 28:[{l:"Presentation",c:"#ec4899"}] },
}

function getMonthEvents(y, m) {
  const key = `${y}-${m}`
  if (BASE_EVENTS[key]) return BASE_EVENTS[key]
  // Generate realistic events for any active month
  return {
    1: [{ l: "Sprint Kickoff", c: "#7C3AED" }],
    4: [{ l: "Task Deadline", c: "#ef4444" }],
    8: [{ l: "Journal Submission", c: "#06B6D4" }],
    12: [{ l: "Code Review", c: "#22c55e" }],
    15: [{ l: "Mentor Sync", c: "#7C3AED" }],
    18: [{ l: "Feature Demo", c: "#f59e0b" }],
    22: [{ l: "Milestone Review", c: "#06B6D4" }],
    27: [{ l: "Monthly Report", c: "#ec4899" }],
  }
}

function getUpcomingEvents(now) {
  const y = now.getFullYear()
  const m = now.getMonth()
  const d = now.getDate()
  const monthName = MONTHS[m].slice(0, 3)

  return [
    { title: "Mentor Sync", date: `${monthName} ${Math.min(d + 1, 28)}, ${y}`, time: "10:00 AM – 11:00 AM", color: "#7C3AED", type: "Meeting" },
    { title: "Sprint Task Deadline", date: `${monthName} ${Math.min(d + 3, 28)}, ${y}`, time: "11:59 PM", color: "#ef4444", type: "Deadline" },
    { title: "Journal Submission", date: `${monthName} ${Math.min(d + 5, 28)}, ${y}`, time: "05:00 PM", color: "#06B6D4", type: "Submission" },
    { title: "Code Architecture Review", date: `${monthName} ${Math.min(d + 7, 28)}, ${y}`, time: "02:00 PM", color: "#22c55e", type: "Review" },
    { title: "Milestone Evaluation", date: `${monthName} ${Math.min(d + 10, 28)}, ${y}`, time: "12:00 PM", color: "#f59e0b", type: "Evaluation" },
  ]
}

export default function CalendarPage() {
  const now = new Date()
  const [view, setView] = useState("Month")
  // Automatically use the CURRENT month and CURRENT year
  const [year, setYear] = useState(now.getFullYear())
  const [monthIdx, setMonthIdx] = useState(now.getMonth())
  const [modal, setModal] = useState(false)
  const [allEvents, setAllEvents] = useState(BASE_EVENTS)
  const [upcoming, setUpcoming] = useState(() => getUpcomingEvents(new Date()))
  const [newEv, setNewEv] = useState({ title:"", date:"", time:"", color:"#7C3AED" })

  useEffect(() => {
    const user = getUser()
    api.getEvents(user.id).then(r=>{
      if(r.ok&&r.data?.length){
        const merged = { ...BASE_EVENTS }
        r.data.forEach(ev=>{
          const d = new Date(ev.date||ev.createdAt)
          const key = `${d.getFullYear()}-${d.getMonth()}`
          const day = d.getDate()
          if(!merged[key]) merged[key]={}
          if(!merged[key][day]) merged[key][day]=[]
          merged[key][day].push({ l:ev.title, c:ev.color||"#7C3AED" })
        })
        setAllEvents(merged)
      }
    }).catch(()=>{})
  },[])

  const days = new Date(year, monthIdx+1, 0).getDate()
  const startDay = new Date(year, monthIdx, 1).getDay()
  const cells = [...Array(startDay).fill(null), ...Array.from({length:days},(_,i)=>i+1)]
  const eventsForDay = (d) => {
    const evKey = `${year}-${monthIdx}`
    return allEvents[evKey]?.[d] || getMonthEvents(year, monthIdx)[d] || []
  }

  const addEvent = async () => {
    if (!newEv.title||!newEv.date) return
    const user = getUser()
    await api.addEvent({ title:newEv.title, date:newEv.date, time:newEv.time, color:newEv.color, type:"Event", userId:user.id })
    const d = new Date(newEv.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const day = d.getDate()
    setAllEvents(p=>({ ...p, [key]:{ ...(p[key]||{}), [day]:[...(p[key]?.[day]||[]),{ l:newEv.title, c:newEv.color }] } }))
    setUpcoming(p=>[{ title:newEv.title, date:newEv.date, time:newEv.time, color:newEv.color, type:"Event" },...p])
    setModal(false); setNewEv({ title:"", date:"", time:"", color:"#7C3AED" })
  }

  const inp = "w-full bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-xs outline-none text-white"

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
      <InternSidebar active="Calendar"/>
      <main className="flex-1 flex flex-col h-screen overflow-y-auto p-6 lg:p-8 gap-6 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Calendar</h1>
            <p className="text-gray-400 text-sm mt-1">Track your schedule, sprint deadlines and team sync meetings.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#0f172a] border border-[#1e293b] rounded-xl p-1 gap-1">
              {["Month","Week","List"].map(v=>(
                <button key={v} onClick={()=>setView(v)} className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${view===v?"bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow":"text-gray-400 hover:text-white"}`}>{v}</button>
              ))}
            </div>
            <button onClick={()=>setModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs sm:text-sm font-semibold text-white hover:brightness-110 shadow-lg transition cursor-pointer">
              <Plus size={16}/> Add Event
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
          {/* CALENDAR GRID */}
          <div className="lg:col-span-8 xl:col-span-9 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e293b] flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <button onClick={()=>{ if(monthIdx===0){setMonthIdx(11);setYear(y=>y-1)}else setMonthIdx(m=>m-1) }} className="w-8 h-8 rounded-xl bg-[#111827] border border-[#1e293b] flex items-center justify-center hover:border-purple-500/50 transition cursor-pointer"><ChevronLeft size={16}/></button>
                <span className="text-base font-bold text-white tracking-wide min-w-[130px] text-center">{MONTHS[monthIdx]} {year}</span>
                <button onClick={()=>{ if(monthIdx===11){setMonthIdx(0);setYear(y=>y+1)}else setMonthIdx(m=>m+1) }} className="w-8 h-8 rounded-xl bg-[#111827] border border-[#1e293b] flex items-center justify-center hover:border-purple-500/50 transition cursor-pointer"><ChevronRight size={16}/></button>
                <button 
                  onClick={() => {
                    const cur = new Date()
                    setMonthIdx(cur.getMonth())
                    setYear(cur.getFullYear())
                  }} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-400/40 text-xs font-semibold text-cyan-300 hover:border-cyan-400 hover:text-white transition shadow-sm ml-2 cursor-pointer"
                  title="Jump to current date"
                >
                  <CalendarIcon size={14} className="text-cyan-400" />
                  Today
                </button>
              </div>
              {monthIdx === now.getMonth() && year === now.getFullYear() && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Active Month &bull; Day {now.getDate()}</span>
                </div>
              )}
            </div>

            {/* MONTH VIEW */}
            {view==="Month" && (
              <>
                <div className="grid grid-cols-7 gap-0 mb-0 border-b border-[#1e293b]">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} className="text-center text-xs text-gray-400 py-2.5 font-semibold uppercase tracking-wider">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-0 border-l border-t border-[#1e293b]/50">
                  {cells.map((day,i)=>{
                    if(!day) return <div key={i} className="border-b border-r border-[#1e293b]/40 min-h-[85px] sm:min-h-[105px] bg-[#0b1120]/30"/>
                    const isToday = day===now.getDate()&&monthIdx===now.getMonth()&&year===now.getFullYear()
                    const evs = eventsForDay(day)
                    return (
                      <div 
                        key={i} 
                        className={`border-b border-r border-[#1e293b]/40 p-2 sm:p-2.5 min-h-[85px] sm:min-h-[105px] cursor-pointer transition relative group ${
                          isToday 
                            ? "bg-gradient-to-b from-purple-900/35 via-cyan-950/25 to-[#0f172a] ring-2 ring-cyan-400/80 shadow-[inset_0_0_15px_rgba(34,211,238,0.25)] z-10" 
                            : "hover:bg-[#111827]/70"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs sm:text-sm flex items-center justify-center rounded-full font-bold transition ${
                            isToday 
                              ? "w-7 h-7 bg-gradient-to-r from-cyan-400 to-purple-600 text-white shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-105" 
                              : "w-6 h-6 text-gray-300 group-hover:text-white"
                          }`}>
                            {day}
                          </span>
                          {isToday && (
                            <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-sm font-sans animate-pulse">
                              TODAY
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {evs.slice(0,2).map((ev,j)=>(
                            <div key={j} className="text-[11px] rounded-md px-2 py-1 truncate text-white font-medium shadow-xs" style={{ background:ev.c+"dd" }}>{ev.l}</div>
                          ))}
                          {evs.length>2 && <div className="text-[10px] text-cyan-400 font-semibold pl-1">+{evs.length-2} more</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* WEEK VIEW */}
            {view==="Week" && (
              <div className="overflow-y-auto">
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d,i)=>{
                    const dayNum = new Date(year, monthIdx, now.getDate() - now.getDay() + i).getDate()
                    const isToday = i === now.getDay() && monthIdx === now.getMonth() && year === now.getFullYear()
                    return (
                      <div key={d} className={`text-center p-3 rounded-2xl transition ${isToday?"bg-gradient-to-b from-purple-900/40 to-cyan-950/30 border-2 border-cyan-400/80 shadow-[0_0_12px_rgba(34,211,238,0.3)]":"bg-[#111827]/60 border border-[#1e293b]"}`}>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-xs text-gray-400 uppercase font-semibold">{d}</span>
                          {isToday && <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-400 text-black">TODAY</span>}
                        </div>
                        <div className={`text-base font-bold mt-1 ${isToday?"text-cyan-300 font-black":"text-white"}`}>{dayNum}</div>
                      </div>
                    )
                  })}
                </div>
                {["9 AM","10 AM","11 AM","12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM"].map(h=>(
                  <div key={h} className="flex gap-2 mb-1.5">
                    <div className="w-14 text-xs text-gray-400 pt-1.5 flex-shrink-0 font-medium">{h}</div>
                    <div className="flex-1 grid grid-cols-7 gap-2">
                      {Array(7).fill(null).map((_,i)=>(
                        <div key={i} className="h-10 border border-[#1e293b]/40 rounded-xl hover:bg-[#111827]/70 cursor-pointer transition"/>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LIST VIEW */}
            {view==="List" && (
              <div className="space-y-3">
                {upcoming.length===0 ? (
                  <div className="text-center text-gray-400 text-sm py-12">No upcoming events scheduled</div>
                ) : upcoming.map((ev,i)=>(
                  <div key={i} className="flex items-center gap-4 bg-[#111827] rounded-2xl p-4 border-l-4 shadow-sm" style={{ borderColor:ev.color }}>
                    <div className="flex-shrink-0 text-center w-14">
                      <div className="text-xs text-gray-400 uppercase">{new Date(ev.date).toLocaleDateString("en-US",{month:"short"})}</div>
                      <div className="text-2xl font-bold text-white">{new Date(ev.date).getDate()}</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{ev.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{ev.time}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ background:ev.color+"22", color:ev.color }}>{ev.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* UPCOMING EVENTS SIDE CARD */}
          <div className="lg:col-span-4 xl:col-span-3 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col shadow-xl">
            <h2 className="text-base font-bold text-white mb-4">Upcoming Schedule</h2>
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[550px] pr-1">
              {upcoming.map((ev,i)=>(
                <div key={i} className="bg-[#111827] border border-[#1e293b] rounded-xl p-3.5 card-hover shadow-sm transition" style={{ borderLeft:`4px solid ${ev.color}` }}>
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <p className="text-xs font-bold text-white">{ev.title}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold flex-shrink-0" style={{ background:ev.color+"22", color:ev.color }}>{ev.type}</span>
                  </div>
                  <p className="text-xs text-gray-300 font-medium">{ev.date}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ev.time}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2.5 rounded-xl bg-[#111827] border border-[#1e293b] text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#1e293b] transition">View All Events</button>
          </div>
        </div>
      </main>

      {/* ADD EVENT MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-80">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold">Add Event</span>
              <button onClick={()=>setModal(false)}><X size={14} className="text-gray-400"/></button>
            </div>
            <div className="space-y-3">
              {[{l:"Event Title",k:"title",type:"text"},{l:"Date",k:"date",type:"date"},{l:"Time",k:"time",type:"time"}].map(f=>(
                <div key={f.k}>
                  <label className="text-[10px] text-gray-400 block mb-1">{f.l}</label>
                  <input type={f.type} value={newEv[f.k]} onChange={e=>setNewEv({...newEv,[f.k]:e.target.value})} className={inp}/>
                </div>
              ))}
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Color</label>
                <div className="flex gap-2">
                  {["#7C3AED","#06B6D4","#22c55e","#ef4444","#f59e0b","#ec4899"].map(c=>(
                    <button key={c} onClick={()=>setNewEv({...newEv,color:c})} className="w-6 h-6 rounded-full border-2 transition" style={{ background:c, borderColor:newEv.color===c?"white":"transparent" }}/>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setModal(false)} className="flex-1 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-gray-400">Cancel</button>
              <button onClick={addEvent} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}

