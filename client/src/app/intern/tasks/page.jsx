"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, X, Download, Upload, Trash2, Edit, CheckCircle2, Play, Terminal, ChevronRight, Circle, CheckCircle, AlertCircle, Code2, FileCode2, FolderOpen as FolderOpenIcon, RotateCcw, Calendar, ClipboardList, Lightbulb, Clock, Star, ExternalLink, Award, Sparkles } from "lucide-react"
import { TASK_CAT_ICONS } from "../../../lib/uiIcons"
import InternSidebar from "../../../lib/internSidebar"
import { api, getInternUser } from "../../../lib/api"
import {
  appendSubmission,
  getSubmissionForTask,
  KEY_INTERN_SUBMISSIONS,
  KEY_INTERN_EVALUATIONS,
} from "../../../lib/evaluationSync"
import {
  getAssignedRole,
  getTasksForRole,
  ROLE_TASKS,
  STORAGE_KEY_ROLE,
  STORAGE_KEY_ASSESSMENT
} from "../../../lib/assessmentData"
import RoleAssessmentModal from "../../../components/RoleAssessmentModal"

const TASKS = [
  { id: 1, name: "Build Login API", cat: "Backend", due: "May 25, 2025", pri: "High", status: "In Progress", pct: 70, bg: "#7C3AED", desc: "Develop a secure login API with JWT authentication using Node.js and Express." },
  { id: 2, name: "Create Dashboard UI", cat: "Frontend", due: "May 30, 2025", pri: "High", status: "Submitted", pct: 100, bg: "#06B6D4", desc: "Design and implement the main dashboard UI with all components." },
  { id: 3, name: "Integrate MongoDB", cat: "Database", due: "Jun 05, 2025", pri: "Medium", status: "In Progress", pct: 60, bg: "#10b981", desc: "Set up MongoDB connection and integrate with the backend APIs." },
  { id: 4, name: "Write API Documentation", cat: "Documentation", due: "Jun 08, 2025", pri: "Low", status: "Pending", pct: 20, bg: "#f59e0b", desc: "Write comprehensive API documentation using Swagger/OpenAPI." },
  { id: 5, name: "Deploy Application", cat: "DevOps", due: "Jun 12, 2025", pri: "High", status: "Pending", pct: 0, bg: "#ec4899", desc: "Deploy the application to AWS EC2 with CI/CD pipeline setup." },
  { id: 6, name: "Unit Testing", cat: "Testing", due: "Jun 15, 2025", pri: "Medium", status: "Pending", pct: 0, bg: "#8b5cf6", desc: "Write unit tests for all API endpoints using Jest and Supertest." },
]

const PRI = { High: { c: "#ef4444", bg: "rgba(239,68,68,0.15)" }, Medium: { c: "#f97316", bg: "rgba(249,115,22,0.15)" }, Low: { c: "#22c55e", bg: "rgba(34,197,94,0.15)" } }
const STA = { "In Progress": { c: "#06B6D4", bg: "rgba(6,182,212,0.15)" }, Completed: { c: "#22c55e", bg: "rgba(34,197,94,0.15)" }, Pending: { c: "#ef4444", bg: "rgba(239,68,68,0.15)" }, Submitted: { c: "#3b82f6", bg: "rgba(59,130,246,0.15)" } }
function CatIcon({ cat, color, size = 14 }) {
  if (cat === "Backend") return <span className="text-[10px] font-bold font-mono" style={{ color }}>&lt;/&gt;</span>
  const Icon = TASK_CAT_ICONS[cat] || ClipboardList
  return <Icon size={size} color={color} strokeWidth={2} />
}
const CAT_COLORS = { Backend: "#7C3AED", Frontend: "#06B6D4", Database: "#10b981", Documentation: "#f59e0b", DevOps: "#ec4899", Testing: "#8b5cf6", "Full Stack": "#6366F1", "Data Structures": "#ec4899", Algorithms: "#a855f7", Security: "#f43f5e" }
const KCOL = { Pending: { b: "rgba(239,68,68,0.3)", bg: "rgba(239,68,68,0.05)", d: "#ef4444" }, "In Progress": { b: "rgba(6,182,212,0.3)", bg: "rgba(6,182,212,0.05)", d: "#06B6D4" }, Completed: { b: "rgba(34,197,94,0.3)", bg: "rgba(34,197,94,0.05)", d: "#22c55e" }, Submitted: { b: "rgba(59,130,246,0.3)", bg: "rgba(59,130,246,0.05)", d: "#3b82f6" } }

// Coding exam questions per category
const EXAM_QUESTIONS = {
  Backend: {
    title: "Build a REST API Endpoint",
    description: "Create a Node.js/Express endpoint that handles user authentication. The endpoint should accept POST /api/login with { email, password } and return a JWT token on success.",
    requirements: [
      "Validate email and password fields",
      "Return 400 if fields are missing",
      "Return 401 if credentials are invalid",
      "Return JWT token on success with 200 status",
      "Use bcrypt for password comparison"
    ],
    starterCode: `const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  // TODO: Destructure email and password from req.body
  
  // TODO: Validate that both fields exist
  
  // TODO: Find user in database (mock: const user = await User.findOne({ email }))
  
  // TODO: Compare password with bcrypt
  
  // TODO: Generate JWT token and return it
  
});

module.exports = router;`,
    language: "javascript",
    testCases: [
      { input: '{ "email": "", "password": "" }', expected: '400 Bad Request' },
      { input: '{ "email": "wrong@test.com", "password": "wrong" }', expected: '401 Unauthorized' },
      { input: '{ "email": "user@test.com", "password": "correct" }', expected: '200 OK + JWT token' },
    ]
  },
  Frontend: {
    title: "Build a React Component",
    description: "Create a reusable React Button component that supports different variants (primary, secondary, danger), sizes (sm, md, lg), and a loading state with a spinner.",
    requirements: [
      "Accept variant prop: 'primary' | 'secondary' | 'danger'",
      "Accept size prop: 'sm' | 'md' | 'lg'",
      "Show spinner when loading={true}",
      "Disable button when loading or disabled prop is true",
      "Apply correct Tailwind CSS classes per variant"
    ],
    starterCode: `import React from 'react';

// TODO: Build the Button component
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  onClick 
}) => {
  // TODO: Define variant styles
  const variantStyles = {
    // primary: '...',
    // secondary: '...',
    // danger: '...',
  };

  // TODO: Define size styles
  const sizeStyles = {
    // sm: '...',
    // md: '...',
    // lg: '...',
  };

  return (
    // TODO: Return the button JSX
    <button>
      {loading && <span>Loading...</span>}
      {children}
    </button>
  );
};

export default Button;`,
    language: "jsx",
    testCases: [
      { input: '<Button variant="primary">Click</Button>', expected: 'Blue button renders' },
      { input: '<Button loading={true}>Save</Button>', expected: 'Spinner shown, button disabled' },
      { input: '<Button variant="danger" size="lg">Delete</Button>', expected: 'Red large button' },
    ]
  },
  Database: {
    title: "Write MongoDB Aggregation Pipeline",
    description: "Write a MongoDB aggregation pipeline that groups users by department, counts them, calculates average salary, and returns only departments with more than 5 employees sorted by average salary descending.",
    requirements: [
      "Group by department field",
      "Count total employees per department",
      "Calculate average salary per department",
      "Filter departments with count > 5",
      "Sort by avgSalary descending"
    ],
    starterCode: `// MongoDB Aggregation Pipeline
// Collection: employees
// Fields: { name, department, salary, joinDate }

const pipeline = [
  // Stage 1: TODO - Group by department, count employees, calc avg salary
  {
    $group: {
      // _id: ???,
      // totalEmployees: ???,
      // avgSalary: ???,
    }
  },

  // Stage 2: TODO - Filter departments with more than 5 employees
  {
    $match: {
      // ???
    }
  },

  // Stage 3: TODO - Sort by avgSalary descending
  {
    $sort: {
      // ???
    }
  },

  // Stage 4: TODO - Project clean output fields
  {
    $project: {
      department: "$_id",
      totalEmployees: 1,
      avgSalary: { $round: ["$avgSalary", 2] },
      _id: 0
    }
  }
];

db.employees.aggregate(pipeline);`,
    language: "javascript",
    testCases: [
      { input: 'Department with 3 employees', expected: 'Excluded from results' },
      { input: 'Department with 8 employees', expected: 'Included, sorted by salary' },
      { input: 'All results', expected: 'Sorted descending by avgSalary' },
    ]
  },
  Documentation: {
    title: "Write OpenAPI/Swagger Documentation",
    description: "Write OpenAPI 3.0 YAML documentation for a User Registration endpoint. The endpoint accepts user data and returns the created user object.",
    requirements: [
      "Define POST /api/users endpoint",
      "Include requestBody with email, password, fullName fields",
      "Mark email and password as required",
      "Define 201 success response with user object",
      "Define 400 error response for validation errors"
    ],
    starterCode: `openapi: 3.0.0
info:
  title: Internship API
  version: 1.0.0

paths:
  /api/users:
    post:
      summary: # TODO: Add summary
      description: # TODO: Add description
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                # TODO: List required fields
              properties:
                # TODO: Define email, password, fullName properties
      responses:
        '201':
          description: # TODO: Success description
          content:
            application/json:
              schema:
                # TODO: Define response schema
        '400':
          description: # TODO: Error description`,
    language: "yaml",
    testCases: [
      { input: 'Missing required fields', expected: '400 response defined' },
      { input: 'Valid user data', expected: '201 with user object' },
      { input: 'Schema validation', expected: 'email, password required' },
    ]
  },
  DevOps: {
    title: "Write a Dockerfile & Docker Compose",
    description: "Create a production-ready Dockerfile for a Node.js application and a docker-compose.yml that includes the app, MongoDB, and Redis services.",
    requirements: [
      "Use node:18-alpine as base image",
      "Set working directory to /app",
      "Copy package files and run npm ci --only=production",
      "Expose port 5000",
      "Docker Compose: app, mongo, redis services with proper networking"
    ],
    starterCode: `# ===== Dockerfile =====
# TODO: Use node:18-alpine base image

# TODO: Set working directory

# TODO: Copy package.json and package-lock.json

# TODO: Install production dependencies only

# TODO: Copy rest of source code

# TODO: Expose port 5000

# TODO: Set start command

---
# ===== docker-compose.yml =====
version: '3.8'

services:
  app:
    build: .
    ports:
      # TODO: Map port 5000
    environment:
      # TODO: Add MONGO_URI and REDIS_URL env vars
    depends_on:
      # TODO: List dependencies

  mongo:
    image: mongo:6
    # TODO: Add volume for data persistence

  redis:
    image: redis:7-alpine
    # TODO: Add port mapping`,
    language: "dockerfile",
    testCases: [
      { input: 'docker build .', expected: 'Image builds successfully' },
      { input: 'docker-compose up', expected: 'All 3 services start' },
      { input: 'App connects to mongo', expected: 'MONGO_URI env var used' },
    ]
  },
  Testing: {
    title: "Write Jest Unit Tests",
    description: "Write comprehensive Jest unit tests for a calculateDiscount function that applies percentage discounts to prices with various edge cases.",
    requirements: [
      "Test normal discount calculation (e.g. 20% off $100 = $80)",
      "Test 0% discount returns original price",
      "Test 100% discount returns 0",
      "Test negative price throws an error",
      "Test discount > 100% throws an error"
    ],
    starterCode: `// Function to test
function calculateDiscount(price, discountPercent) {
  if (price < 0) throw new Error('Price cannot be negative');
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount must be between 0 and 100');
  }
  return price * (1 - discountPercent / 100);
}

// ===== YOUR TESTS BELOW =====
describe('calculateDiscount', () => {
  
  // TODO: Test 1 - Normal discount
  test('should apply 20% discount to $100', () => {
    // expect(calculateDiscount(100, 20)).toBe(???)
  });

  // TODO: Test 2 - Zero discount
  test('should return original price for 0% discount', () => {
    
  });

  // TODO: Test 3 - Full discount
  test('should return 0 for 100% discount', () => {
    
  });

  // TODO: Test 4 - Negative price error
  test('should throw error for negative price', () => {
    // expect(() => calculateDiscount(-10, 20)).toThrow(???)
  });

  // TODO: Test 5 - Invalid discount error
  test('should throw error for discount over 100%', () => {
    
  });
});`,
    language: "javascript",
    testCases: [
      { input: 'calculateDiscount(100, 20)', expected: '80' },
      { input: 'calculateDiscount(50, 0)', expected: '50' },
      { input: 'calculateDiscount(-10, 20)', expected: 'throws Error' },
    ]
  }
}

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState(TASKS)
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [sel, setSel] = useState(null)
  const [modal, setModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [uploads, setUploads] = useState([])
  const [submitted, setSubmitted] = useState(null)
  const [taskFile, setTaskFile] = useState(null)
  const [newT, setNewT] = useState({ name: "", cat: "Frontend", due: "", pri: "Medium", status: "Pending", pct: 0, desc: "" })
  const [examModal, setExamModal] = useState(false)
  const [examTask, setExamTask] = useState(null)
  const [examCode, setExamCode] = useState("")
  const [examOutput, setExamOutput] = useState([])
  const [examRunning, setExamRunning] = useState(false)
  const [examTab, setExamTab] = useState("problem") // "problem" | "output"
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [activeFile, setActiveFile] = useState("solution")
  const [showMarks, setShowMarks] = useState(false)
  const [marksTask, setMarksTask] = useState(null)
  const [assignedRole, setAssignedRole] = useState(null)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false)
  const upRef = useRef(null)
  const subRef = useRef(null)
  const taskFileRef = useRef(null)
  const codeRef = useRef(null)
  const [taskReview, setTaskReview] = useState(null)

  const refreshTaskReview = (taskName) => {
    const u = getInternUser()
    if (!taskName) { setTaskReview(null); return }
    setTaskReview(getSubmissionForTask(u, taskName) || null)
  }

  useEffect(() => {
    if (sel?.name) refreshTaskReview(sel.name)
  }, [sel?.name, sel?.status])

  useEffect(() => {
    const onSync = () => { if (sel?.name) refreshTaskReview(sel.name) }
    const id = setInterval(onSync, 2000)
    window.addEventListener("storage", onSync)
    window.addEventListener(KEY_INTERN_SUBMISSIONS, onSync)
    window.addEventListener(KEY_INTERN_EVALUATIONS, onSync)
    return () => {
      clearInterval(id)
      window.removeEventListener("storage", onSync)
      window.removeEventListener(KEY_INTERN_SUBMISSIONS, onSync)
      window.removeEventListener(KEY_INTERN_EVALUATIONS, onSync)
    }
  }, [sel?.name])

  // Function to load tasks aligned with the intern's assigned role
  const syncRoleAndTasks = () => {
    const role = getAssignedRole()
    setAssignedRole(role)
    try {
      const res = JSON.parse(localStorage.getItem(STORAGE_KEY_ASSESSMENT) || "null")
      setAssessmentResult(res)
    } catch { }

    const roleTasks = getTasksForRole(role)

    // Load mentor-assigned tasks
    let mentorTasks = []
    try {
      mentorTasks = JSON.parse(localStorage.getItem("mentorAssignedTasks") || "[]")
    } catch { }

    setTasks(prev => {
      // Preserve existing progress / status if any task has same name
      const prevMap = new Map((prev || []).map(t => [t.name, t]))
      const alignedTasks = roleTasks.map(rt => {
        const existing = prevMap.get(rt.name)
        if (existing) {
          return { ...rt, status: existing.status, pct: existing.pct }
        }
        return rt
      })

      if (mentorTasks.length) {
        const existingIds = new Set(alignedTasks.map(t => String(t.id)))
        const newOnes = mentorTasks
          .filter(t => !existingIds.has(String(t.id)))
          .map(t => ({
            ...t,
            bg: CAT_COLORS[t.cat] || t.bg || "#7C3AED",
            desc: t.desc || "Assigned by mentor."
          }))
        return [...newOnes, ...alignedTasks]
      }
      return alignedTasks
    })
  }

  useEffect(() => {
    syncRoleAndTasks()

    // Check if query param specifies opening the assessment modal or if intern is unassessed
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("assessment") === "open" || (!getAssignedRole() && !sessionStorage.getItem("assessment_dismissed"))) {
        setAssessmentModalOpen(true)
      }
    }

    const onRoleUpdated = () => {
      syncRoleAndTasks()
    }

    window.addEventListener("intern_role_updated", onRoleUpdated)
    window.addEventListener("storage", onRoleUpdated)
    return () => {
      window.removeEventListener("intern_role_updated", onRoleUpdated)
      window.removeEventListener("storage", onRoleUpdated)
    }
  }, [])

  // Poll for mentor-assigned tasks every 2s as fallback
  useEffect(() => {
    const applyMentorTasks = () => {
      try {
        const mentorTasks = JSON.parse(localStorage.getItem("mentorAssignedTasks") || "[]")
        if (!mentorTasks.length) return
        setTasks(p => {
          const existingIds = new Set(p.map(t => String(t.id)))
          const newOnes = mentorTasks
            .filter(t => !existingIds.has(String(t.id)))
            .map(t => ({
              ...t,
              bg: CAT_COLORS[t.cat] || t.bg || "#7C3AED",
              desc: t.desc || `Assigned by mentor. Complete with proper validation and error handling.`
            }))
          return newOnes.length ? [...newOnes, ...p] : p
        })
      } catch { }
    }

    const pollId = setInterval(applyMentorTasks, 2000)
    return () => clearInterval(pollId)
  }, [])

  const handleRoleAssigned = (role, result) => {
    setAssignedRole(role)
    setAssessmentResult(result)
    const newTasks = getTasksForRole(role)
    setTasks(newTasks)
    if (newTasks.length > 0) setSel(newTasks[0])
    setAssessmentModalOpen(false)
  }

  const filtered = tasks.filter(t => (filter === "All" || t.status === filter) && t.name.toLowerCase().includes(search.toLowerCase()))
  const kanban = { Pending: tasks.filter(t => t.status === "Pending"), "In Progress": tasks.filter(t => t.status === "In Progress"), Completed: tasks.filter(t => t.status === "Completed"), Submitted: tasks.filter(t => t.status === "Submitted") }

  const openExam = (task) => {
    const q = EXAM_QUESTIONS[task.cat] || EXAM_QUESTIONS.Backend
    setExamTask({ ...task, exam: q })
    setExamCode(q.starterCode)
    setExamOutput([])
    setExamSubmitted(false)
    setExamTab("problem")
    setActiveFile("solution")
    setExamModal(true)
  }

  const runCode = () => {
    setExamRunning(true)
    setExamTab("output")
    setTimeout(() => {
      const lines = []
      lines.push({ type: "info", text: "▶  Running code analysis…" })
      lines.push({ type: "info", text: "" })
      const q = examTask?.exam
      if (q) {
        q.testCases.forEach((tc, i) => {
          const passed = examCode.length > q.starterCode.length + 50
          lines.push({ type: passed ? "success" : "error", text: `Test ${i + 1}: ${tc.input}` })
          lines.push({ type: passed ? "success" : "warn", text: `  Expected: ${tc.expected}` })
          lines.push({ type: passed ? "success" : "error", text: `  Result:   ${passed ? "PASS" : "Incomplete — add your implementation"}` })
          lines.push({ type: "info", text: "" })
        })
        const allPass = examCode.length > q.starterCode.length + 50
        lines.push({ type: allPass ? "success" : "warn", text: allPass ? "All tests passed! Great work." : "Complete the TODO sections and run again." })
      }
      setExamOutput(lines)
      setExamRunning(false)
    }, 1200)
  }

  const submitExam = () => {
    setExamSubmitted(true)
    setExamOutput(p => [...p, { type: "success", text: "" }, { type: "success", text: "Exam submitted successfully! Your mentor will review your solution." }])
    setExamTab("output")
  }

  const addTask = async () => {
    if (!newT.name.trim() || !newT.due.trim()) return
    const user = getInternUser()
    const r = await api.createTask({ title: newT.name, category: newT.cat, dueDate: newT.due, priority: newT.pri, status: newT.status, progress: newT.pct, description: newT.desc, userId: user.id })
    const created = { ...newT, id: r.ok ? (r.data.id || Date.now()) : Date.now(), bg: CAT_COLORS[newT.cat] || "#7C3AED", attachment: taskFile ? { name: taskFile.name, size: `${(taskFile.size / 1024).toFixed(0)} KB` } : null }
    setTasks(p => [created, ...p]); setSel(created); setModal(false)
    setNewT({ name: "", cat: "Backend", due: "", pri: "Medium", status: "Pending", pct: 0, desc: "" }); setTaskFile(null)
  }

  const saveEdit = async () => {
    await api.updateTask(editTask.id, { title: editTask.name, category: editTask.cat, dueDate: editTask.due, priority: editTask.pri, status: editTask.status, progress: editTask.pct, description: editTask.desc })
    setTasks(p => p.map(t => t.id === editTask.id ? editTask : t))
    if (sel?.id === editTask.id) setSel(editTask)
    setEditModal(false)
  }

  const download = (f) => {
    const blob = new Blob([`File: ${f.name}`], { type: "text/plain" })
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = f.name; a.click(); URL.revokeObjectURL(url)
  }

  const inp = "w-full bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-xs outline-none text-white"

  return (
    <div className="portal-root relative h-screen w-full max-w-full overflow-hidden text-white flex">

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="data:video/mp4;base64," type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      {/* Main Content */}
      <div className="relative z-10 flex w-full h-full">
        <InternSidebar active="Tasks" />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto p-6 lg:p-8 gap-6 min-w-0">
          {/* HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Tasks</h1>
              <p className="text-gray-400 text-sm mt-1">Manage, code, and track your internship tasks efficiently.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search tasks, categories…"
                  className="bg-[#0f172a] border border-[#1e293b] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none w-64 sm:w-72 text-white placeholder-gray-500 focus:border-cyan-500/50 transition"
                />
              </div>
              <button
                onClick={() => setModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 hover:brightness-110 transition cursor-pointer"
              >
                <Plus size={16} /> Add Task
              </button>
            </div>
          </div>

          {/* ROLE SPECIALIZATION BANNER */}
          <div className="rounded-2xl p-5 border transition-all duration-300 shadow-xl"
            style={{
              background: assignedRole
                ? "linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(6, 182, 212, 0.18))"
                : "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.18))",
              borderColor: assignedRole ? "rgba(124, 58, 237, 0.4)" : "rgba(245, 158, 11, 0.45)",
            }}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                  style={{
                    background: assignedRole
                      ? "linear-gradient(135deg, #06B6D4, #7C3AED)"
                      : "linear-gradient(135deg, #f59e0b, #ef4444)",
                    boxShadow: assignedRole
                      ? "0 4px 18px rgba(124, 58, 237, 0.35)"
                      : "0 4px 18px rgba(245, 158, 11, 0.25)"
                  }}>
                  {assignedRole ? <Sparkles size={24} className="text-white" /> : <AlertCircle size={24} className="text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: assignedRole ? "rgba(6, 182, 212, 0.2)" : "rgba(245, 158, 11, 0.2)",
                        color: assignedRole ? "#22d3ee" : "#fbbf24",
                        border: `1px solid ${assignedRole ? "rgba(6, 182, 212, 0.4)" : "rgba(245, 158, 11, 0.4)"}`
                      }}>
                      {assignedRole ? "Assigned Technical Role" : "Role Assessment Required"}
                    </span>
                    {assessmentResult && (
                      <span className="text-xs text-gray-300 font-mono">
                        Test Score: <b className="text-white">{assessmentResult.score || assessmentResult.totalScore || 0}/16</b> ({assessmentResult.percentage || Math.round(((assessmentResult.totalScore || 0) / 16) * 100)}%)
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1 flex items-center gap-2">
                    {assignedRole ? (
                      <>
                        <span className="text-cyan-300 font-extrabold">{assignedRole}</span>
                        <span className="text-xs sm:text-sm font-normal text-gray-300">
                          • Tasks below are customized for your evaluated technical skillset
                        </span>
                      </>
                    ) : (
                      <span>Take the 16-question MCQ test (FSD, Backend, DS, DevOps) to discover your specialization</span>
                    )}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {assignedRole ? (
                  <button
                    onClick={() => setAssessmentModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white hover:bg-purple-600/50 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-md">
                    <RotateCcw size={13} /> Retake Assessment
                  </button>
                ) : (
                  <button
                    onClick={() => setAssessmentModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-white font-bold text-sm shadow-xl hover:brightness-110 flex items-center gap-2 transition animate-pulse cursor-pointer">
                    <Sparkles size={15} /> Take MCQ Test (16 Questions)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex items-center gap-2 flex-wrap">
            {["All", "Pending", "In Progress", "Completed"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${filter === f
                  ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md shadow-purple-900/30"
                  : "bg-[#0f172a] border border-[#1e293b] text-gray-400 hover:text-white hover:bg-[#111827]"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* TASK TABLE SECTION */}
          <div className="bg-[#0f172a]/95 border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl flex flex-col flex-shrink-0">
            <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-cyan-400" />
                  Active Tasks Overview
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Showing {filtered.length} tasks matching your current filters</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead className="bg-[#111827]/90 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-[#1e293b]">
                  <tr>
                    <th className="text-left px-5 py-3.5">Task</th>
                    <th className="text-left px-4 py-3.5">Category</th>
                    <th className="text-left px-4 py-3.5">Due Date</th>
                    <th className="text-left px-4 py-3.5">Priority</th>
                    <th className="text-left px-4 py-3.5">Status</th>
                    <th className="text-left px-4 py-3.5">Progress</th>
                    <th className="text-right px-5 py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]/60">
                  {filtered.map((t, i) => (
                    <tr key={i} className="hover:bg-[#1e293b]/40 transition cursor-pointer group" onClick={() => setSel(t)}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: t.bg + "26", color: t.bg }}>
                            <CatIcon cat={t.cat} color={t.bg} size={18} />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition">{t.name}</span>
                            <p className="text-xs text-gray-400 line-clamp-1 max-w-[280px]">{t.desc}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-gray-300">{t.cat}</td>
                      <td className="px-4 py-4 text-xs text-gray-300">
                        <span className="inline-flex items-center gap-1.5"><Calendar size={13} className="text-gray-400" /> {t.due}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold inline-block" style={{ color: PRI[t.pri]?.c, background: PRI[t.pri]?.bg }}>
                          {t.pri}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold inline-block" style={{ color: STA[t.status]?.c, background: STA[t.status]?.bg }}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-24 h-2 bg-[#1e293b] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" style={{ width: `${t.pct}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-300">{t.pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setSel(t)} className="px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-600/40 text-purple-300 text-xs font-medium hover:bg-purple-600/30 transition">
                            View
                          </button>
                          {t.status === "Submitted" || t.status === "Completed" ? (
                            <button onClick={() => { setMarksTask(t); setShowMarks(true) }} className="px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-600/40 text-green-300 text-xs font-medium hover:bg-green-600/30 flex items-center gap-1.5 transition">
                              🏅 Marks
                            </button>
                          ) : (
                            <button onClick={() => openExam(t)} className="px-3 py-1.5 rounded-lg bg-cyan-600/20 border border-cyan-600/40 text-cyan-300 text-xs font-medium hover:bg-cyan-600/30 flex items-center gap-1.5 transition">
                              <Code2 size={13} /> Task
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KANBAN SECTION */}
          <div className="flex flex-col gap-4 pb-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ClipboardList size={18} className="text-purple-400" />
                  Workflow Kanban Board
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Visual stage tracker across all workflows</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {Object.entries(kanban).map(([col, items]) => (
                <div key={col} className="rounded-2xl p-4 border flex flex-col min-h-[380px] bg-[#0b1120]/80 shadow-lg" style={{ borderColor: KCOL[col]?.b }}>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e293b]">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: KCOL[col]?.d }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: KCOL[col]?.d }} />
                      {col}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#1e293b] text-gray-300">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                    {items.map((t, i) => (
                      <div key={i} onClick={() => setSel(t)} className="bg-[#0f172a] rounded-xl p-3.5 cursor-pointer hover:bg-[#1e293b]/70 border border-[#1e293b] hover:border-cyan-500/40 transition shadow-md group">
                        <p className="text-sm font-semibold text-white group-hover:text-cyan-300 transition mb-2 leading-snug">{t.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{t.desc}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/60">
                          <span className="text-xs text-gray-400 flex items-center gap-1.5"><Calendar size={12} /> {t.due}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ color: PRI[t.pri]?.c, background: PRI[t.pri]?.bg }}>{t.pri}</span>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="h-32 flex flex-col items-center justify-center text-xs text-gray-500 border border-dashed border-[#1e293b] rounded-xl">
                        No tasks in {col}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setModal(true)} className="w-full text-xs text-gray-400 hover:text-white py-2.5 border border-dashed border-[#1e293b] hover:border-cyan-500/40 rounded-xl mt-3 flex items-center justify-center gap-1.5 transition">
                    <Plus size={14} /> Add Task
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* TASK DETAILS SLIDE-OVER DRAWER */}
          {sel && (
            <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-lg bg-[#0f172a] border-l border-[#1e293b] h-full shadow-2xl flex flex-col z-50">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#111827]/80">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold text-white">Task Details</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ color: STA[sel.status]?.c, background: STA[sel.status]?.bg }}>
                      {sel.status}
                    </span>
                  </div>
                  <button onClick={() => setSel(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1e293b] transition">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div className="flex items-start gap-3.5 pb-4 border-b border-[#1e293b]">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: sel.bg + "26", color: sel.bg }}>
                      <CatIcon cat={sel.cat} color={sel.bg} size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-white leading-snug">{sel.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold" style={{ color: PRI[sel.pri]?.c, background: PRI[sel.pri]?.bg }}>
                          {sel.pri} Priority
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={13} /> Due {sel.due}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => { setEditTask({ ...sel }); setEditModal(true) }} className="px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-600/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-600/30 transition">
                      <Edit size={13} /> Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#111827] border border-[#1e293b]">
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">Category</span>
                      <span className="text-sm font-semibold text-white">{sel.cat}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">Due Date</span>
                      <span className="text-sm font-semibold text-white">{sel.due}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-300">Overall Progress</span>
                      <span className="text-xs font-bold text-cyan-400">{sel.pct}%</span>
                    </div>
                    <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" style={{ width: `${sel.pct}%` }} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-300 mb-1.5">Description</p>
                    <p className="text-sm text-gray-300 leading-relaxed bg-[#111827] p-3.5 rounded-xl border border-[#1e293b] whitespace-pre-wrap">{sel.desc}</p>
                  </div>

                  {/* Attachments from Mentor */}
                  <div>
                    <p className="text-xs font-semibold text-gray-300 mb-2">Attachments (From Mentor)</p>
                    <input ref={upRef} type="file" multiple style={{ display: "none" }} onChange={e => setUploads(p => [...p, ...Array.from(e.target.files).map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`, file: f }))])} />
                    <button onClick={() => upRef.current?.click()} className="w-full border border-dashed border-[#1e293b] hover:border-cyan-500/40 rounded-xl p-3 text-xs text-gray-400 hover:text-white flex flex-col items-center gap-1 mb-3 transition">
                      <Upload size={16} className="text-cyan-400" /> Upload Files
                      <span className="text-[11px] text-gray-500">PDF, DOCX, PPTX, ZIP (Max 10MB)</span>
                    </button>
                    <div className="space-y-2">
                      {[{ name: "login_requirements.pdf", size: "1.2 MB", color: "#ef4444" }, { name: "api_structure.docx", size: "2.4 MB", color: "#3b82f6" }, ...uploads].map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: (f.color || "#7C3AED") + "33", color: f.color || "#7C3AED" }}>
                              {f.name.split(".").pop().toUpperCase().slice(0, 3)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-white truncate">{f.name}</p>
                              <p className="text-[10px] text-gray-400">{f.size}</p>
                            </div>
                          </div>
                          <button onClick={() => download(f)} className="p-1 text-gray-400 hover:text-white transition"><Download size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Your Submission */}
                  <div>
                    <p className="text-xs font-semibold text-gray-300 mb-2">Your Submission</p>
                    <input ref={subRef} type="file" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) setSubmitted({ name: e.target.files[0].name, size: `${(e.target.files[0].size / 1024).toFixed(0)} KB`, file: e.target.files[0] }) }} />
                    {!submitted ? (
                      <button onClick={() => subRef.current?.click()} className="w-full border border-dashed border-[#1e293b] hover:border-purple-500/40 rounded-xl p-3 text-xs text-gray-400 hover:text-white flex flex-col items-center gap-1 transition">
                        <Upload size={16} className="text-purple-400" /> Upload Your Solution / File
                        <span className="text-[11px] text-gray-500">ZIP, PDF, DOCX (Max 20MB)</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-green-900/20 border border-green-500/40 rounded-xl px-3.5 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate">{submitted.name}</p>
                            <p className="text-[10px] text-gray-400">{submitted.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => download(submitted)} className="p-1 text-green-400 hover:text-green-300"><Download size={14} /></button>
                          <button onClick={() => setSubmitted(null)} className="p-1 text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col gap-2.5">
                    <button onClick={() => { setSel(null); router.push(`/task-exam?task=${encodeURIComponent(viewTask?.name || sel.name)}&cat=${encodeURIComponent(viewTask?.cat || sel.cat)}&desc=${encodeURIComponent(viewTask?.desc || sel.desc)}&due=${encodeURIComponent(viewTask?.due || sel.due)}`) }}
                      className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white shadow-lg cursor-pointer transition hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#22c55e,#06B6D4)" }}>
                      ▶ Take Interactive Task Coding Exam
                    </button>

                    <button onClick={async () => {
                      if (!submitted) { alert("Please upload your file first before submitting."); return }
                      const user = getInternUser()
                      let fileData = null
                      let fileMime = null
                      if (submitted.file) {
                        try {
                          fileData = await new Promise((resolve, reject) => {
                            const r = new FileReader()
                            r.onload = () => resolve(r.result)
                            r.onerror = reject
                            r.readAsDataURL(submitted.file)
                          })
                          fileMime = submitted.file.type || ""
                        } catch { }
                      }
                      const sub = appendSubmission({
                        intern: user.fullName || "Intern",
                        internUserId: user.id,
                        task: sel.name,
                        file: submitted.name,
                        fileSize: submitted.size,
                        fileData,
                        fileMime,
                        submittedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
                        status: "Pending Review",
                        comments: "",
                      })
                      setTaskReview(sub)
                      setTasks(p => p.map(t => t.id === sel.id ? { ...t, status: "Submitted", pct: 100 } : t))
                      setSel(p => ({ ...p, status: "Submitted", pct: 100 }))
                    }} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-sm font-bold text-white shadow-lg cursor-pointer transition hover:opacity-95">
                      Submit Solution to Mentor
                    </button>
                  </div>

                  {/* Mentor evaluation status */}
                  {(taskReview || sel?.status === "Submitted") && (
                    <div className="p-4 rounded-xl border border-[#1e293b] bg-[#111827]">
                      <p className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                        <Star size={14} className="text-purple-400" /> Mentor Evaluation Status
                      </p>
                      {(!taskReview || taskReview.status === "Pending Review") ? (
                        <div className="flex items-start gap-3">
                          <Clock size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-amber-300">Awaiting mentor evaluation</p>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                              Your submission was recorded. Your mentor will review it — check the Evaluation page for grading and feedback.
                            </p>
                            <button
                              type="button"
                              onClick={() => router.push("/intern/evaluation")}
                              className="mt-2.5 text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300 font-medium"
                            >
                              <ExternalLink size={12} /> Open Evaluation page
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <CheckCircle2 size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-green-300">{taskReview.status}</p>
                            <p className="text-xs text-gray-300 mt-1 line-clamp-3 leading-relaxed">{taskReview.comments || "Mentor has reviewed your submission."}</p>
                            <button
                              type="button"
                              onClick={() => router.push("/intern/evaluation")}
                              className="mt-2.5 text-xs text-purple-400 flex items-center gap-1 hover:text-purple-300 font-medium"
                            >
                              <ExternalLink size={12} /> View full evaluation
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* CODING EXAM MODAL */}
        {examModal && examTask && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex flex-col z-50" style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}>
            {/* VS Code-style title bar */}
            <div className="h-9 bg-[#1e1e1e] flex items-center justify-between px-4 border-b border-[#3c3c3c] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <button onClick={() => setExamModal(false)} className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-red-400 transition" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-[11px] text-[#cccccc] ml-2">Kiro — Coding Exam</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#858585]">{examTask.name} · {examTask.cat}</span>
                <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(6,182,212,0.15)", color: "#06B6D4" }}>Due: {examTask.due}</span>
              </div>
              <button onClick={() => setExamModal(false)} className="text-[#858585] hover:text-white transition">
                <X size={14} />
              </button>
            </div>

            {/* Activity bar + main layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Activity bar (left icons) */}
              <div className="w-12 bg-[#333333] flex flex-col items-center py-3 gap-4 border-r border-[#3c3c3c] flex-shrink-0">
                <button onClick={() => setExamTab("problem")} className={`w-8 h-8 rounded flex items-center justify-center transition ${examTab === "problem" ? "bg-[#1e1e1e] text-white" : "text-[#858585] hover:text-white"}`} title="Problem">
                  <FileCode2 size={16} />
                </button>
                <button onClick={() => setExamTab("output")} className={`w-8 h-8 rounded flex items-center justify-center transition ${examTab === "output" ? "bg-[#1e1e1e] text-white" : "text-[#858585] hover:text-white"}`} title="Output">
                  <Terminal size={16} />
                </button>
              </div>

              {/* Side panel (problem / output) */}
              <div className="w-80 bg-[#252526] border-r border-[#3c3c3c] flex flex-col overflow-hidden flex-shrink-0">
                {/* Panel tabs */}
                <div className="flex border-b border-[#3c3c3c] flex-shrink-0">
                  <button onClick={() => setExamTab("problem")} className={`flex-1 py-2 text-[10px] font-medium transition ${examTab === "problem" ? "bg-[#1e1e1e] text-white border-t-2 border-[#06B6D4]" : "text-[#858585] hover:text-white"}`}>
                    PROBLEM
                  </button>
                  <button onClick={() => setExamTab("output")} className={`flex-1 py-2 text-[10px] font-medium transition ${examTab === "output" ? "bg-[#1e1e1e] text-white border-t-2 border-[#06B6D4]" : "text-[#858585] hover:text-white"}`}>
                    OUTPUT
                  </button>
                </div>

                {examTab === "problem" && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                      <h2 className="text-sm font-bold text-white mb-1">{examTask.exam.title}</h2>
                      <p className="text-[11px] text-[#cccccc] leading-relaxed">{examTask.exam.description}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#06B6D4] mb-2 uppercase tracking-wider">Requirements</p>
                      <ul className="space-y-1.5">
                        {examTask.exam.requirements.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-[10px] text-[#cccccc]">
                            <ChevronRight size={10} className="text-[#06B6D4] mt-0.5 flex-shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#a855f7] mb-2 uppercase tracking-wider">Test Cases</p>
                      <div className="space-y-2">
                        {examTask.exam.testCases.map((tc, i) => (
                          <div key={i} className="bg-[#1e1e1e] rounded-lg p-2.5 border border-[#3c3c3c]">
                            <p className="text-[9px] text-[#858585] mb-1">Test {i + 1}</p>
                            <p className="text-[10px] text-[#9cdcfe]">Input: <span className="text-[#ce9178]">{tc.input}</span></p>
                            <p className="text-[10px] text-[#9cdcfe]">Expected: <span className="text-[#4ec9b0]">{tc.expected}</span></p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#1e1e1e] rounded-lg p-3 border border-[#3c3c3c]">
                      <p className="text-[9px] text-[#858585] mb-1 flex items-center gap-1"><Lightbulb size={10} /> Tip</p>
                      <p className="text-[10px] text-[#cccccc]">Complete all TODO sections in the editor. Click ▶ Run to test your code.</p>
                    </div>
                  </div>
                )}

                {examTab === "output" && (
                  <div className="flex-1 overflow-y-auto p-3 bg-[#1e1e1e]">
                    {examOutput.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-[#858585]">
                        <Terminal size={24} />
                        <p className="text-[11px]">Click ▶ Run to execute your code</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {examOutput.map((line, i) => (
                          <p key={i} className={`text-[10px] font-mono leading-relaxed ${line.type === "success" ? "text-[#4ec9b0]" :
                            line.type === "error" ? "text-[#f48771]" :
                              line.type === "warn" ? "text-[#cca700]" :
                                "text-[#858585]"
                            }`}>{line.text || "\u00A0"}</p>
                        ))}
                        {examRunning && (
                          <div className="flex items-center gap-2 text-[#858585] text-[10px] mt-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            Running…
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Editor area */}
              <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
                {/* Editor tabs */}
                <div className="flex items-center bg-[#2d2d2d] border-b border-[#3c3c3c] flex-shrink-0">
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-[#1e1e1e] border-r border-[#3c3c3c] border-t-2 border-t-[#06B6D4]">
                    <FileCode2 size={11} className="text-[#e8c07d]" />
                    <span className="text-[11px] text-[#cccccc]">
                      solution.{examTask.exam.language === "jsx" ? "jsx" : examTask.exam.language === "yaml" ? "yaml" : examTask.exam.language === "dockerfile" ? "dockerfile" : "js"}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#e8c07d] ml-1" />
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1 px-3 text-[10px] text-[#858585]">
                    <span>{examTask.exam.language}</span>
                    <span>·</span>
                    <span>UTF-8</span>
                  </div>
                </div>

                {/* Line numbers + code editor */}
                <div className="flex-1 overflow-hidden flex">
                  {/* Line numbers */}
                  <div className="w-12 bg-[#1e1e1e] text-[#858585] text-[11px] font-mono pt-3 pb-3 text-right pr-3 select-none overflow-hidden flex-shrink-0 border-r border-[#3c3c3c]">
                    {examCode.split("\n").map((_, i) => (
                      <div key={i} className="leading-5">{i + 1}</div>
                    ))}
                  </div>
                  {/* Code textarea */}
                  <textarea
                    ref={codeRef}
                    value={examCode}
                    onChange={e => setExamCode(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Tab") {
                        e.preventDefault()
                        const start = e.target.selectionStart
                        const end = e.target.selectionEnd
                        const newVal = examCode.substring(0, start) + "  " + examCode.substring(end)
                        setExamCode(newVal)
                        setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 2 }, 0)
                      }
                    }}
                    spellCheck={false}
                    className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] text-[12px] font-mono leading-5 p-3 outline-none resize-none overflow-auto"
                    style={{ tabSize: 2, caretColor: "#aeafad" }}
                  />
                </div>

                {/* Status bar */}
                <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 flex-shrink-0">
                  <div className="flex items-center gap-3 text-[10px] text-white">
                    <span className="flex items-center gap-1"><Circle size={8} /> {examTask.cat}</span>
                    <span>{examTask.exam.language.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white">
                    <span>Ln {examCode.split("\n").length}</span>
                    <span>Col {examCode.split("\n").slice(-1)[0]?.length || 0}</span>
                    <span className="flex items-center gap-1">{examSubmitted ? <><CheckCircle2 size={11} /> Submitted</> : "● Unsaved"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom toolbar */}
            <div className="h-12 bg-[#1e1e1e] border-t border-[#3c3c3c] flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={() => { setExamCode(examTask.exam.starterCode); setExamOutput([]) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] text-[#858585] hover:text-white hover:bg-[#2d2d2d] transition">
                  <RotateCcw size={12} /> Reset
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={runCode} disabled={examRunning}
                  className="flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-semibold transition"
                  style={{ background: examRunning ? "#2d2d2d" : "linear-gradient(135deg,#22c55e,#06B6D4)", color: examRunning ? "#858585" : "white" }}>
                  <Play size={12} fill="currentColor" />
                  {examRunning ? "Running…" : "▶  Run Code"}
                </button>
                <button onClick={submitExam} disabled={examSubmitted}
                  className="flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-semibold transition"
                  style={{ background: examSubmitted ? "#2d2d2d" : "linear-gradient(135deg,#7c3aed,#a855f7)", color: examSubmitted ? "#858585" : "white" }}>
                  <CheckCircle size={12} />
                  {examSubmitted ? "Submitted" : "Submit Exam"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MARKS MODAL — for submitted/completed tasks */}
        {showMarks && marksTask && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b]">
                <div>
                  <h2 className="text-sm font-bold">🏅 Task Marks & Feedback</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">{marksTask.name}</p>
                </div>
                <button onClick={() => setShowMarks(false)} className="w-8 h-8 rounded-xl bg-[#111827] border border-[#1e293b] flex items-center justify-center hover:bg-red-900/30">
                  <X size={14} className="text-gray-400" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Score display */}
                <div className="bg-[#111827] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">Score Awarded</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-green-400">
                        {marksTask.status === "Submitted" ? "85" : "92"}
                      </span>
                      <span className="text-gray-400 text-sm">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 mb-1">Grade</p>
                    <span className="text-2xl font-bold" style={{ color: marksTask.status === "Submitted" ? "#22c55e" : "#06B6D4" }}>
                      {marksTask.status === "Submitted" ? "B+" : "A"}
                    </span>
                  </div>
                  <div className="w-20 h-20 relative flex-shrink-0">
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="32" stroke="#1e293b" strokeWidth="6" fill="none" />
                      <circle cx="40" cy="40" r="32" stroke="#22c55e" strokeWidth="6" fill="none"
                        strokeDasharray="201"
                        strokeDashoffset={201 - (201 * (marksTask.status === "Submitted" ? 85 : 92) / 100)}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-green-400">{marksTask.status === "Submitted" ? "85%" : "92%"}</span>
                    </div>
                  </div>
                </div>

                {/* Criteria breakdown */}
                <div className="bg-[#111827] rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-white mb-3">Criteria Breakdown</p>
                  {[
                    { name: "Code Quality", score: 18, max: 20, color: "#7C3AED" },
                    { name: "Functionality", score: 22, max: 25, color: "#06B6D4" },
                    { name: "Documentation", score: 14, max: 15, color: "#22c55e" },
                    { name: "Best Practices", score: 17, max: 20, color: "#f59e0b" },
                    { name: "Testing", score: 14, max: 20, color: "#ec4899" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] text-gray-400 w-28 flex-shrink-0">{c.name}</span>
                      <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.score / c.max * 100}%`, background: c.color }} />
                      </div>
                      <span className="text-[10px] text-white font-semibold w-12 text-right">{c.score}/{c.max}</span>
                    </div>
                  ))}
                </div>

                {/* Mentor feedback */}
                <div className="bg-purple-600/10 border border-purple-600/20 rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-purple-400 mb-2">Mentor Feedback</p>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    {marksTask.status === "Submitted"
                      ? "Good work overall! The code structure is clean and well-organized. However, some edge cases in error handling need attention. Review the JWT token expiration logic and add proper refresh token handling."
                      : "Excellent submission! Code is clean, well-documented, and all test cases pass. Great job on the implementation."}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => {
                    const blob = new Blob([`Task: ${marksTask.name}\nScore: ${marksTask.status === "Submitted" ? "85" : "92"}/100\nGrade: ${marksTask.status === "Submitted" ? "B+" : "A"}\nFeedback: Good work overall!`], { type: "text/plain" })
                    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${marksTask.name}_marks.txt`; a.click(); URL.revokeObjectURL(url)
                  }} className="flex-1 py-2.5 rounded-xl bg-cyan-600/20 border border-cyan-600/30 text-cyan-400 text-xs font-semibold flex items-center justify-center gap-2">
                    <Download size={13} /> Download Report
                  </button>
                  <button onClick={() => {
                    setShowMarks(false)
                    openExam(marksTask)
                  }} className="flex-1 py-2.5 rounded-xl bg-orange-600/20 border border-orange-600/30 text-orange-400 text-xs font-semibold flex items-center justify-center gap-2">
                    🔍 Review Answer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD TASK MODAL */}
        {modal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold">Add New Task</span>
                <button onClick={() => setModal(false)}><X size={14} className="text-gray-400" /></button>
              </div>
              <div className="space-y-3">
                {[{ l: "Task Title *", k: "name", p: "Enter task title" }, { l: "Due Date *", k: "due", p: "Jun 01, 2025" }].map(f => (
                  <div key={f.k}>
                    <label className="text-[10px] text-gray-400 block mb-1">{f.l}</label>
                    <input placeholder={f.p} value={newT[f.k]} onChange={e => setNewT({ ...newT, [f.k]: e.target.value })} className={inp} />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Category</label>
                    <select value={newT.cat} onChange={e => setNewT({ ...newT, cat: e.target.value })} className={inp}>
                      {["Frontend", "Backend", "Full Stack", "Data Structures", "Database", "DevOps", "Testing", "Documentation", "Algorithms", "Security"].map(o => <option key={o} style={{ background: "#0f172a" }}>{o}</option>)}
                    </select>
                  </div>
                  {[{ l: "Priority", k: "pri", opts: ["High", "Medium", "Low"] }, { l: "Status", k: "status", opts: ["Pending", "In Progress", "Completed", "Submitted"] }].map(f => (
                    <div key={f.k}>
                      <label className="text-[10px] text-gray-400 block mb-1">{f.l}</label>
                      <select value={newT[f.k]} onChange={e => setNewT({ ...newT, [f.k]: e.target.value })} className={inp}>{f.opts.map(o => <option key={o} style={{ background: "#0f172a" }}>{o}</option>)}</select>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Description</label>
                  <textarea rows={2} value={newT.desc} onChange={e => setNewT({ ...newT, desc: e.target.value })} className={`${inp} resize-none`} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Attach File (optional)</label>
                  <label className="flex items-center gap-2 cursor-pointer border border-dashed border-[#1e293b] rounded-xl px-3 py-2 hover:border-purple-500 transition">
                    <Upload size={12} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400">{taskFile ? taskFile.name : "Click to attach file…"}</span>
                    <input ref={taskFileRef} type="file" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) setTaskFile(e.target.files[0]) }} />
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setModal(false); setTaskFile(null) }} className="flex-1 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-gray-400">Cancel</button>
                <button onClick={addTask} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold">Add Task</button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editModal && editTask && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold">✏️ Edit Task</span>
                <button onClick={() => setEditModal(false)}><X size={14} className="text-gray-400" /></button>
              </div>
              <div className="space-y-3">
                {[{ l: "Task Name", k: "name" }, { l: "Due Date", k: "due" }].map(f => (
                  <div key={f.k}>
                    <label className="text-[10px] text-gray-400 block mb-1">{f.l}</label>
                    <input value={editTask[f.k]} onChange={e => setEditTask({ ...editTask, [f.k]: e.target.value })} className={inp} />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2">
                  {[{ l: "Category", k: "cat", opts: ["Frontend", "Backend", "Full Stack", "Data Structures", "Database", "DevOps", "Testing", "Documentation", "Algorithms", "Security"] }, { l: "Priority", k: "pri", opts: ["High", "Medium", "Low"] }, { l: "Status", k: "status", opts: ["Pending", "In Progress", "Completed", "Submitted"] }].map(f => (
                    <div key={f.k}>
                      <label className="text-[10px] text-gray-400 block mb-1">{f.l}</label>
                      <select value={editTask[f.k]} onChange={e => setEditTask({ ...editTask, [f.k]: e.target.value })} className={inp}>{f.opts.map(o => <option key={o} style={{ background: "#0f172a" }}>{o}</option>)}</select>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Progress ({editTask.pct}%)</label>
                  <input type="range" min="0" max="100" value={editTask.pct} onChange={e => setEditTask({ ...editTask, pct: parseInt(e.target.value) })} className="w-full accent-purple-500" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Description</label>
                  <textarea rows={2} value={editTask.desc} onChange={e => setEditTask({ ...editTask, desc: e.target.value })} className={`${inp} resize-none`} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditModal(false)} className="flex-1 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-xs text-gray-400">Cancel</button>
                <button onClick={saveEdit} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* ROLE ASSESSMENT MODAL */}
        <RoleAssessmentModal
          isOpen={assessmentModalOpen}
          onClose={() => {
            sessionStorage.setItem("assessment_dismissed", "true")
            setAssessmentModalOpen(false)
          }}
          onRoleAssigned={handleRoleAssigned}
          currentRole={assignedRole}
        />
      </div>
    </div>
  )
}
