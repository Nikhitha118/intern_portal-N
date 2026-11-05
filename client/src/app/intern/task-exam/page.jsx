"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, Play, RotateCcw, CheckCircle2, ChevronRight, Terminal, FileCode, Save, Send, Lightbulb, Eye, EyeOff } from "lucide-react"

const STARTER_CODE = {
  Backend: `// Task: Build Login API
// Write a secure login endpoint with JWT authentication

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // TODO: Validate input
  
  // TODO: Find user in database
  
  // TODO: Compare password with bcrypt
  
  // TODO: Generate JWT token
  
  // TODO: Return token and user data
  
  res.json({ message: 'Login successful', token: '' });
});

module.exports = router;`,

  Frontend: `// Task: Create Dashboard Component
// Build a responsive dashboard with stats cards

import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    tasks: 0,
    attendance: 0,
    performance: 0
  });

  useEffect(() => {
    // TODO: Fetch stats from API
    
  }, []);

  return (
    <div className="dashboard">
      {/* TODO: Render stat cards */}
      
      {/* TODO: Add charts */}
      
      {/* TODO: Add recent activity */}
    </div>
  );
}`,

  Database: `# Task: MongoDB Schema Design
# Design and implement the user and task collections

from pymongo import MongoClient
from datetime import datetime

client = MongoClient('mongodb://localhost:27017/')
db = client['internportal']

# TODO: Define user schema
user_schema = {
    # Add fields here
}

# TODO: Define task schema  
task_schema = {
    # Add fields here
}

# TODO: Create indexes for performance

# TODO: Insert sample data
def seed_data():
    pass`,

  Documentation: `# Task: API Documentation
# Write OpenAPI/Swagger documentation for the Login API

openapi: 3.0.0
info:
  title: InternPortal API
  version: 1.0.0
  description: Smart Internship Workflow and Evaluation Portal

paths:
  /auth/login:
    post:
      summary: User Login
      # TODO: Add request body schema
      # TODO: Add response schemas
      # TODO: Add error responses
      
  /tasks:
    get:
      summary: Get all tasks
      # TODO: Add query parameters
      # TODO: Add response schema`,

  DevOps: `# Task: Deploy Application
# Write a Docker + CI/CD configuration

# Dockerfile
FROM node:18-alpine
WORKDIR /app

# TODO: Copy package files
# TODO: Install dependencies
# TODO: Copy source code
# TODO: Build application
# TODO: Expose port
# TODO: Start command

---
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # TODO: Add checkout step
      # TODO: Add build step
      # TODO: Add test step
      # TODO: Add deploy step`,

  Testing: `// Task: Unit Testing
// Write Jest tests for the Login API

const request = require('supertest');
const app = require('../app');

describe('POST /auth/login', () => {
  
  test('should login with valid credentials', async () => {
    // TODO: Write test
    const res = await request(app)
      .post('/auth/login')
      .send({ email: '', password: '' });
    
    expect(res.status).toBe(200);
    // TODO: Add more assertions
  });

  test('should reject invalid credentials', async () => {
    // TODO: Write test
  });

  test('should validate required fields', async () => {
    // TODO: Write test
  });
});`,
}

const HINTS = {
  Backend: ["Use bcrypt.compare() to verify passwords", "JWT token: jwt.sign({ userId }, SECRET, { expiresIn: '7d' })", "Always validate req.body before processing", "Return 401 for invalid credentials, 400 for missing fields"],
  Frontend: ["Use useState for local state, useEffect for API calls", "fetch('/api/stats').then(r => r.json()).then(setStats)", "Map over stats object to render cards dynamically", "Add loading state while fetching data"],
  Database: ["Use db.collection.createIndex() for performance", "MongoDB ObjectId for _id fields", "Use timestamps: { createdAt, updatedAt }", "Validate schema with Mongoose or manual checks"],
  Documentation: ["Use $ref for reusable schemas", "Document all possible response codes (200, 400, 401, 404, 500)", "Add examples to request/response bodies", "Use tags to group related endpoints"],
  DevOps: ["Multi-stage Docker builds reduce image size", "Use GitHub Secrets for sensitive values", "Add health check endpoint before deploy", "Use docker-compose for local development"],
  Testing: ["Test happy path AND error cases", "Mock database calls with jest.mock()", "Use beforeEach/afterEach for setup/teardown", "Test edge cases: empty strings, null values"],
}

export function TaskExamContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskName = searchParams.get("task") || "Build Login API"
  const taskCat  = searchParams.get("cat")  || "Backend"
  const taskDesc = searchParams.get("desc") || "Complete the task as described."
  const taskDue  = searchParams.get("due")  || ""

  const [code, setCode] = useState(STARTER_CODE[taskCat] || STARTER_CODE.Backend)
  const [output, setOutput] = useState("")
  const [running, setRunning] = useState(false)
  const [saved, setSaved] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [activeFile, setActiveFile] = useState("main")
  const [showHints, setShowHints] = useState(false)
  const [timer, setTimer] = useState(0)
  const [lineCount, setLineCount] = useState(0)
  const textareaRef = useRef(null)

  // Timer
  useEffect(() => {
    const id = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Line count
  useEffect(() => {
    setLineCount(code.split("\n").length)
  }, [code])

  const formatTime = (s) => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`

  const runCode = () => {
    setRunning(true)
    setOutput("")
    setTimeout(() => {
      const lines = code.split("\n").filter(l => l.trim())
      const todos = lines.filter(l => l.includes("TODO")).length
      const filled = lines.filter(l => !l.includes("TODO") && l.trim() && !l.trim().startsWith("//") && !l.trim().startsWith("#")).length
      setOutput(`> Running ${taskCat} task...\n\n[OK] Syntax check passed\n[OK] ${filled} lines of code detected\n${todos > 0 ? `[WARN] ${todos} TODO items remaining\n` : "[OK] All TODOs completed!\n"}\n> Output:\n${
        taskCat === "Backend" ? "Server started on port 5000\nPOST /auth/login → 200 OK\nToken generated successfully" :
        taskCat === "Frontend" ? "Component rendered successfully\nStats loaded: { tasks: 24, attendance: 92%, performance: 8.9 }" :
        taskCat === "Testing" ? `Test Suites: 1 passed\nTests: ${Math.max(1, 3 - todos)} passed, ${todos} pending\nTime: 1.234s` :
        "Execution completed successfully"
      }\n\n${todos === 0 ? "Task looks complete! Ready to submit." : `${todos} items still need attention.`}`)
      setRunning(false)
    }, 1200)
  }

  const saveCode = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    try { localStorage.setItem(`task_code_${taskName}`, code) } catch {}
  }

  const submitTask = () => {
    setSubmitted(true)
    try { localStorage.setItem(`task_submitted_${taskName}`, JSON.stringify({ code, submittedAt: new Date().toISOString() })) } catch {}
  }

  const hints = HINTS[taskCat] || HINTS.Backend

  // Line numbers
  const lines = code.split("\n")

  return (
    <div className="portal-root" style={{ width:"100%", height:"100vh", overflow:"hidden", display:"flex", flexDirection:"column", background:"#0d1117", color:"white", fontFamily:"'Consolas','Monaco','Courier New',monospace" }}>

      {/* TOP BAR — VS Code style */}
      <div style={{ height:"38px", background:"#161b22", borderBottom:"1px solid #30363d", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 12px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          {/* Traffic lights */}
          <div style={{ display:"flex", gap:"6px" }}>
            <button onClick={()=>router.back()} style={{ width:"12px", height:"12px", borderRadius:"50%", background:"#ff5f57", border:"none", cursor:"pointer" }} title="Close"/>
            <div style={{ width:"12px", height:"12px", borderRadius:"50%", background:"#febc2e" }}/>
            <div style={{ width:"12px", height:"12px", borderRadius:"50%", background:"#28c840" }}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <FileCode size={14} color="#7C3AED"/>
            <span style={{ fontSize:"12px", color:"#e6edf3", fontWeight:500 }}>{taskName}</span>
            <span style={{ fontSize:"10px", color:"#8b949e", padding:"1px 6px", borderRadius:"4px", background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)" }}>{taskCat}</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <button onClick={runCode} disabled={running} className="lg:hidden px-2.5 py-1 rounded bg-green-600/30 text-green-400 text-xs font-semibold flex items-center gap-1 border border-green-500/40 cursor-pointer">
            <Play size={11}/> Run
          </button>
          <button onClick={saveCode} className="lg:hidden px-2.5 py-1 rounded bg-cyan-600/30 text-cyan-400 text-xs font-semibold flex items-center gap-1 border border-cyan-500/40 cursor-pointer">
            <Save size={11}/> Save
          </button>
          <button onClick={submitTask} className="lg:hidden px-2.5 py-1 rounded bg-purple-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer">
            <Send size={11}/> Submit
          </button>
          <span style={{ fontSize:"11px", color:"#8b949e" }}>⏱ {formatTime(timer)}</span>
          {taskDue && <span className="hidden sm:inline" style={{ fontSize:"11px", color:"#f59e0b" }}>Due: {taskDue}</span>}
          <span className="hidden sm:inline" style={{ fontSize:"11px", color:"#8b949e" }}>{lineCount} lines</span>
        </div>
      </div>

      {/* MENU BAR */}
      <div className="hidden sm:flex" style={{ height:"28px", background:"#161b22", borderBottom:"1px solid #21262d", alignItems:"center", padding:"0 8px", gap:"2px", flexShrink:0 }}>
        {["File","Edit","View","Run","Terminal","Help"].map(m=>(
          <button key={m} style={{ padding:"2px 10px", borderRadius:"4px", background:"none", border:"none", cursor:"pointer", fontSize:"12px", color:"#8b949e" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
            onMouseLeave={e=>e.currentTarget.style.background="none"}>{m}</button>
        ))}
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* ACTIVITY BAR */}
        <div className="hidden sm:flex" style={{ width:"48px", background:"#161b22", borderRight:"1px solid #21262d", flexDirection:"column", alignItems:"center", padding:"8px 0", gap:"4px", flexShrink:0 }}>
          {[
            { Icon: FileCode, label:"Explorer", active:true },
            { Icon: Terminal, label:"Search" },
            { Icon: ChevronRight, label:"Git" },
            { Icon: Play, label:"Debug" },
            { Icon: CheckCircle2, label:"Extensions" },
          ].map(item=>(
            <button key={item.label} title={item.label}
              style={{ width:"36px", height:"36px", borderRadius:"8px", background: item.active?"rgba(124,58,237,0.2)":"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", borderLeft: item.active?"2px solid #7C3AED":"2px solid transparent" }}>
              <item.Icon size={14} color={item.active ? "#a78bfa" : "#8b949e"}/>
            </button>
          ))}
        </div>

        {/* SIDEBAR — File Explorer */}
        <div className="hidden md:flex" style={{ width:"200px", background:"#161b22", borderRight:"1px solid #21262d", flexDirection:"column", flexShrink:0 }}>
          <div style={{ padding:"8px 12px", fontSize:"10px", fontWeight:700, color:"#8b949e", letterSpacing:"0.08em", borderBottom:"1px solid #21262d" }}>EXPLORER</div>
          <div style={{ padding:"4px 0" }}>
            <div style={{ padding:"4px 12px", fontSize:"11px", color:"#8b949e", display:"flex", alignItems:"center", gap:"4px" }}>
              <ChevronRight size={10}/> INTERNPORTAL
            </div>
            {[
              { name:`main.${taskCat==="Backend"||taskCat==="Testing"?"js":taskCat==="Frontend"?"jsx":taskCat==="Database"?"py":"yml"}`, active:activeFile==="main" },
              { name:"package.json", active:false },
              { name:"README.md", active:false },
            ].map(f=>(
              <button key={f.name} onClick={()=>setActiveFile(f.name)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:"6px", padding:"3px 20px", background:f.active?"rgba(124,58,237,0.15)":"none", border:"none", cursor:"pointer", textAlign:"left" }}>
                <FileCode size={12} color={f.active ? "#e6edf3" : "#8b949e"}/>
                <span style={{ fontSize:"11px", color: f.active?"#e6edf3":"#8b949e" }}>{f.name}</span>
              </button>
            ))}
          </div>

          {/* Task Info Panel */}
          <div style={{ marginTop:"auto", padding:"10px", borderTop:"1px solid #21262d" }}>
            <div style={{ fontSize:"10px", color:"#8b949e", marginBottom:"6px", fontWeight:600 }}>TASK INFO</div>
            <div style={{ fontSize:"10px", color:"#e6edf3", lineHeight:1.5, marginBottom:"8px" }}>{taskDesc}</div>
            <button onClick={()=>setShowHints(!showHints)}
              style={{ width:"100%", padding:"5px", borderRadius:"6px", background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", color:"#f59e0b", fontSize:"10px", cursor:"pointer" }}>
              {showHints ? "Hide Hints" : <><Lightbulb size={10} className="inline"/> Show Hints</>}
            </button>
            {showHints && (
              <div style={{ marginTop:"8px", display:"flex", flexDirection:"column", gap:"4px" }}>
                {hints.map((h,i)=>(
                  <div key={i} style={{ fontSize:"9px", color:"rgba(255,255,255,0.6)", padding:"4px 6px", background:"rgba(255,255,255,0.04)", borderRadius:"4px", lineHeight:1.4 }}>
                    {h}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MAIN EDITOR AREA */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* TAB BAR */}
          <div style={{ height:"35px", background:"#0d1117", borderBottom:"1px solid #21262d", display:"flex", alignItems:"center", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:"0", height:"100%" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"0 14px", height:"100%", background:"#0d1117", borderRight:"1px solid #21262d", borderTop:"1px solid #7C3AED" }}>
                <FileCode size={12} color="#8b949e"/>
                <span style={{ fontSize:"12px", color:"#e6edf3" }}>main.{taskCat==="Backend"||taskCat==="Testing"?"js":taskCat==="Frontend"?"jsx":taskCat==="Database"?"py":"yml"}</span>
                <span style={{ fontSize:"10px", color:"#f59e0b", marginLeft:"2px" }}>●</span>
              </div>
            </div>
          </div>

          {/* CODE EDITOR */}
          <div style={{ flex:1, display:"flex", overflow:"hidden", position:"relative" }}>
            {/* Line numbers */}
            <div style={{ width:"48px", background:"#0d1117", borderRight:"1px solid #21262d", overflowY:"hidden", flexShrink:0, paddingTop:"8px", userSelect:"none" }}>
              {lines.map((_,i)=>(
                <div key={i} style={{ height:"20px", display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:"8px", fontSize:"12px", color:"#3d444d", lineHeight:"20px" }}>
                  {i+1}
                </div>
              ))}
            </div>
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e=>setCode(e.target.value)}
              onKeyDown={e=>{
                if(e.key==="Tab"){e.preventDefault();const s=e.target.selectionStart;const end=e.target.selectionEnd;setCode(c=>c.substring(0,s)+"  "+c.substring(end));setTimeout(()=>{if(textareaRef.current){textareaRef.current.selectionStart=s+2;textareaRef.current.selectionEnd=s+2}},0)}
                if((e.ctrlKey||e.metaKey)&&e.key==="s"){e.preventDefault();saveCode()}
                if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();runCode()}
              }}
              spellCheck={false}
              style={{ flex:1, background:"#0d1117", border:"none", outline:"none", color:"#e6edf3", fontSize:"13px", lineHeight:"20px", padding:"8px 12px", resize:"none", fontFamily:"'Consolas','Monaco','Courier New',monospace", overflowY:"auto", whiteSpace:"pre", tabSize:2 }}
            />
          </div>

          {/* TERMINAL / OUTPUT */}
          <div style={{ height:"180px", background:"#0d1117", borderTop:"1px solid #21262d", display:"flex", flexDirection:"column", flexShrink:0 }}>
            <div style={{ height:"28px", background:"#161b22", display:"flex", alignItems:"center", gap:"12px", padding:"0 12px", borderBottom:"1px solid #21262d", flexShrink:0 }}>
              <button style={{ fontSize:"11px", color:"#e6edf3", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"4px", borderBottom:"1px solid #7C3AED", paddingBottom:"2px" }}>
                <Terminal size={11}/> Terminal
              </button>
              <button style={{ fontSize:"11px", color:"#8b949e", background:"none", border:"none", cursor:"pointer" }}>Output</button>
              <button style={{ fontSize:"11px", color:"#8b949e", background:"none", border:"none", cursor:"pointer" }}>Problems</button>
              <div style={{ flex:1 }}/>
              <button onClick={()=>setOutput("")} style={{ background:"none", border:"none", cursor:"pointer", color:"#8b949e" }}><X size={11}/></button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"8px 12px", fontSize:"12px", lineHeight:1.6, color:"#8b949e", fontFamily:"'Consolas','Monaco','Courier New',monospace" }}>
              {output ? (
                <pre style={{ margin:0, whiteSpace:"pre-wrap", color: output.includes("complete!") ? "#22c55e" : output.includes("[WARN]") ? "#f59e0b" : "#8b949e" }}>{output}</pre>
              ) : (
                <span style={{ color:"#3d444d" }}>$ Press Ctrl+Enter to run, Ctrl+S to save</span>
              )}
              {running && <span style={{ color:"#7C3AED" }}>Running...</span>}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Status */}
        <div className="hidden xl:flex flex-col flex-shrink-0" style={{ width:"220px", background:"#161b22", borderLeft:"1px solid #21262d" }}>
          <div style={{ padding:"10px 12px", borderBottom:"1px solid #21262d" }}>
            <div style={{ fontSize:"10px", color:"#8b949e", fontWeight:700, marginBottom:"8px", letterSpacing:"0.08em" }}>TASK STATUS</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
              {[
                { l:"Category", v:taskCat, c:"#7C3AED" },
                { l:"Due Date", v:taskDue||"No deadline", c:"#f59e0b" },
                { l:"Time Spent", v:formatTime(timer), c:"#06B6D4" },
                { l:"Lines Written", v:String(lineCount), c:"#22c55e" },
              ].map(s=>(
                <div key={s.l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:"6px", padding:"6px 8px" }}>
                  <div style={{ fontSize:"9px", color:"#8b949e" }}>{s.l}</div>
                  <div style={{ fontSize:"12px", fontWeight:600, color:s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding:"10px 12px", display:"flex", flexDirection:"column", gap:"8px" }}>
            <button onClick={runCode} disabled={running}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", padding:"8px", borderRadius:"8px", background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.3)", color:"#22c55e", fontSize:"12px", cursor:"pointer", fontWeight:600 }}>
              <Play size={12}/> {running ? "Running…" : "Run (Ctrl+↵)"}
            </button>
            <button onClick={saveCode}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", padding:"8px", borderRadius:"8px", background:"rgba(6,182,212,0.15)", border:"1px solid rgba(6,182,212,0.3)", color:"#06B6D4", fontSize:"12px", cursor:"pointer" }}>
              <Save size={12}/> {saved ? "Saved!" : "Save (Ctrl+S)"}
            </button>
            <button onClick={()=>setCode(STARTER_CODE[taskCat]||STARTER_CODE.Backend)}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", padding:"8px", borderRadius:"8px", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", color:"#f59e0b", fontSize:"12px", cursor:"pointer" }}>
              <RotateCcw size={12}/> Reset
            </button>
            {!submitted ? (
              <button onClick={submitTask}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", padding:"10px", borderRadius:"8px", background:"linear-gradient(135deg,#7C3AED,#06B6D4)", border:"none", color:"white", fontSize:"12px", cursor:"pointer", fontWeight:700, boxShadow:"0 0 16px rgba(124,58,237,0.4)", marginTop:"4px" }}>
                <Send size={12}/> Submit Task
              </button>
            ) : (
              <div style={{ padding:"10px", borderRadius:"8px", background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.3)", textAlign:"center" }}>
                <CheckCircle2 size={16} color="#22c55e" style={{ margin:"0 auto 4px" }}/>
                <div style={{ fontSize:"11px", color:"#22c55e", fontWeight:600 }}>Submitted!</div>
                <button onClick={()=>router.back()} style={{ marginTop:"6px", fontSize:"10px", color:"rgba(255,255,255,0.5)", background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>← Back to Tasks</button>
              </div>
            )}
          </div>

          {/* Keyboard shortcuts */}
          <div style={{ marginTop:"auto", padding:"10px 12px", borderTop:"1px solid #21262d" }}>
            <div style={{ fontSize:"9px", color:"#3d444d", fontWeight:700, marginBottom:"6px" }}>SHORTCUTS</div>
            {[["Ctrl+Enter","Run code"],["Ctrl+S","Save"],["Tab","Indent"]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
                <span style={{ fontSize:"9px", color:"#8b949e", background:"rgba(255,255,255,0.06)", padding:"1px 5px", borderRadius:"3px" }}>{k}</span>
                <span style={{ fontSize:"9px", color:"#3d444d" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATUS BAR — VS Code style */}
      <div style={{ height:"22px", background:"#7C3AED", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 12px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontSize:"10px", color:"white", display:"flex", alignItems:"center", gap:"4px" }}>⎇ main</span>
          <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.8)" }}>InternPortal Task Exam</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.8)" }}>Ln {lineCount}, Col 1</span>
          <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.8)" }}>{taskCat}</span>
          <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.8)" }}>UTF-8</span>
        </div>
      </div>
    </div>
  )
}

export default function TaskExamPage() {
  return (
    <Suspense fallback={
      <div style={{ width:"100%", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0d1117", color:"white", fontSize:"14px" }}>
        Loading task…
      </div>
    }>
      <TaskExamContent />
    </Suspense>
  )
}
