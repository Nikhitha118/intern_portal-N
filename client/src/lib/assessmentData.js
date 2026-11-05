// ─── Intern Role Assessment Questions (16 MCQs across FSD, DS, Backend & DB) ─

export const ASSESSMENT_QUESTIONS = [
  // ── DOMAIN 1: Full Stack & Frontend (FSD) (Questions 1 - 4) ──
  {
    id: 1,
    domain: "frontend",
    subject: "Full Stack (React)",
    question: "In React, what is the primary purpose of the useEffect hook?",
    options: [
      "To directly mutate and re-render the DOM tree synchronously",
      "To perform side effects such as data fetching, subscriptions, and DOM updates after rendering",
      "To define global CSS styles for components",
      "To compile JSX into browser-compatible binary code"
    ],
    correctIndex: 1,
    explanation: "useEffect allows functional components to execute side effects like data fetching or timers after the render phase."
  },
  {
    id: 2,
    domain: "frontend",
    subject: "Frontend (CSS)",
    question: "Which modern CSS layout mechanism is designed specifically for two-dimensional grid layouts with both rows and columns?",
    options: [
      "CSS Flexbox",
      "CSS Grid Layout",
      "Float-based positioning",
      "Absolute positioning with z-index"
    ],
    correctIndex: 1,
    explanation: "CSS Grid is a 2D layout system (rows & columns), whereas Flexbox is primarily a 1D system (row or column)."
  },
  {
    id: 3,
    domain: "frontend",
    subject: "Full Stack (JavaScript)",
    question: "What is the key difference between '==' and '===' operators in JavaScript?",
    options: [
      "'==' checks both value and type, while '===' checks only value",
      "'===' performs strict equality comparison without type coercion",
      "'===' can only be used to compare primitive numbers",
      "There is no difference; both perform identical type casting"
    ],
    correctIndex: 1,
    explanation: "'===' checks both value and type without converting types (strict equality), whereas '==' performs type coercion."
  },
  {
    id: 4,
    domain: "frontend",
    subject: "Frontend (Optimization)",
    question: "Which technique is commonly used to optimize initial page load by only loading components when needed?",
    options: [
      "Synchronous script evaluation",
      "Code splitting and Lazy Loading (e.g. React.lazy / dynamic imports)",
      "Base64 inlining all large video assets",
      "Continuous HTTP polling"
    ],
    correctIndex: 1,
    explanation: "Code splitting and lazy loading delay fetching JavaScript bundles until the user navigates to or renders that component."
  },

  // ── DOMAIN 2: Backend & REST APIs (Questions 5 - 8) ──
  {
    id: 5,
    domain: "backend",
    subject: "Backend (REST APIs)",
    question: "According to REST conventions, which HTTP method should be used to partially update an existing resource?",
    options: [
      "GET",
      "POST",
      "PATCH",
      "DELETE"
    ],
    correctIndex: 2,
    explanation: "PATCH is used for partial modifications to an existing resource, whereas PUT typically replaces the entire resource."
  },
  {
    id: 6,
    domain: "backend",
    subject: "Backend (Security & Auth)",
    question: "What are the three core parts that constitute a JSON Web Token (JWT)?",
    options: [
      "Protocol, Host, and Query Parameters",
      "Header, Payload, and Signature",
      "Public Key, Private Key, and Salt",
      "Client ID, Client Secret, and Grant Type"
    ],
    correctIndex: 1,
    explanation: "A JWT is composed of three dot-separated base64-encoded parts: Header (algorithm), Payload (claims/data), and Signature."
  },
  {
    id: 7,
    domain: "backend",
    subject: "Backend (Architecture)",
    question: "What is the primary role of a middleware function in Express or Flask?",
    options: [
      "To render HTML elements directly on client hardware",
      "To intercept, process, or authenticate incoming requests and responses before route handlers execute",
      "To compile JavaScript into WebAssembly",
      "To manage local browser localStorage cookies"
    ],
    correctIndex: 1,
    explanation: "Middleware intercepts HTTP requests to validate tokens, log activity, parse bodies, or enforce CORS before the final handler."
  },
  {
    id: 8,
    domain: "backend",
    subject: "Backend (Security)",
    question: "Why should user passwords always be hashed with a unique salt (e.g., using Bcrypt) before storing in the database?",
    options: [
      "To shorten the password character length in storage",
      "To prevent rainbow table attacks and ensure one-way mathematical irreversibility",
      "To allow the server administrator to easily decrypt lost passwords",
      "To automatically validate email addresses"
    ],
    correctIndex: 1,
    explanation: "Salting and hashing with algorithms like Bcrypt ensures passwords cannot be cracked through precomputed rainbow tables or reverse lookups."
  },

  // ── DOMAIN 3: Data Structures & Algorithms (DS) (Questions 9 - 12) ──
  {
    id: 9,
    domain: "ds",
    subject: "Data Structures (Complexity)",
    question: "What is the average time complexity for searching, inserting, and deleting an element in a Hash Map?",
    options: [
      "O(N²)",
      "O(log N)",
      "O(1) - Constant Time",
      "O(N) - Linear Time"
    ],
    correctIndex: 2,
    explanation: "Hash maps compute a hash code for instantaneous O(1) average lookup, insertion, and deletion."
  },
  {
    id: 10,
    domain: "ds",
    subject: "Data Structures (Trees)",
    question: "In a Binary Search Tree (BST), which tree traversal order visits elements in ascending numerical sorted order?",
    options: [
      "Pre-order Traversal (Root, Left, Right)",
      "In-order Traversal (Left, Root, Right)",
      "Post-order Traversal (Left, Right, Root)",
      "Breadth-First Level Traversal"
    ],
    correctIndex: 1,
    explanation: "In-order traversal visits the left subtree, then the root, then the right subtree, resulting in sorted ascending order for a BST."
  },
  {
    id: 11,
    domain: "ds",
    subject: "Data Structures (Stacks & Queues)",
    question: "Which data structure operates on a LIFO (Last-In, First-Out) order?",
    options: [
      "Queue",
      "Stack",
      "Circular Buffer",
      "Priority Queue"
    ],
    correctIndex: 1,
    explanation: "A Stack adds and removes items from the top (LIFO), used in call stacks, undo mechanisms, and DFS."
  },
  {
    id: 12,
    domain: "ds",
    subject: "Algorithms (Sorting)",
    question: "What is the worst-case time complexity of QuickSort when an unbalanced pivot is chosen repeatedly?",
    options: [
      "O(N log N)",
      "O(N²)",
      "O(1)",
      "O(log N)"
    ],
    correctIndex: 1,
    explanation: "If the pivot consistently splits the array into sizes 0 and N-1 (e.g. sorted input with last-element pivot), QuickSort degrades to O(N²)."
  },

  // ── DOMAIN 4: Database & Cloud/DevOps (Questions 13 - 16) ──
  {
    id: 13,
    domain: "db",
    subject: "Databases (MongoDB vs SQL)",
    question: "How does a document database like MongoDB store data differently from a traditional relational database (RDBMS)?",
    options: [
      "MongoDB stores data strictly in binary CSV files",
      "MongoDB stores flexible, schema-free BSON/JSON documents inside collections instead of rigid tables with rows and columns",
      "MongoDB does not support document querying or updating",
      "RDBMS stores data in key-value memory caches only"
    ],
    correctIndex: 1,
    explanation: "MongoDB is a NoSQL document database that structures records as dynamic JSON/BSON documents inside collections."
  },
  {
    id: 14,
    domain: "db",
    subject: "Databases (Indexing)",
    question: "What is the primary benefit of creating an index on database fields like 'email' or 'userId'?",
    options: [
      "It compresses the database file to 50% size",
      "It allows the query engine to find documents rapidly via B-Trees without scanning every single record (full table scan)",
      "It automatically encrypts the fields with AES-256",
      "It prevents duplicate fields from being read"
    ],
    correctIndex: 1,
    explanation: "Indexes create efficient search data structures (often B-trees) that locate matched records in O(log N) instead of scanning the full collection."
  },
  {
    id: 15,
    domain: "db",
    subject: "DevOps (Git)",
    question: "Which Git command creates a new feature branch and immediately switches your local working tree to that branch?",
    options: [
      "git branch -d new-feature",
      "git checkout -b new-feature (or git switch -c new-feature)",
      "git merge new-feature",
      "git push origin --all"
    ],
    correctIndex: 1,
    explanation: "'git checkout -b <branch>' creates and checks out the new branch in a single command."
  },
  {
    id: 16,
    domain: "db",
    subject: "DevOps (Docker)",
    question: "What is the primary advantage of containerizing an application using Docker?",
    options: [
      "It eliminates the need for software testing",
      "It packages the application, runtime, and all dependencies into a lightweight, portable container that runs consistently across any environment",
      "It converts backend code automatically into web assembly",
      "It replaces the need for a web server"
    ],
    correctIndex: 1,
    explanation: "Docker packages code and its exact dependencies together, eliminating the 'works on my machine' issue across dev, staging, and production."
  }
]

// ─── Role Tasks Catalog ────────────────────────────────────────────────────────
export const ROLE_TASKS = {
  "Frontend Developer": [
    {
      id: "fe-1",
      name: "Build Responsive Landing Page & Design System",
      cat: "Frontend",
      due: "May 26, 2025",
      pri: "High",
      status: "In Progress",
      pct: 70,
      bg: "#06B6D4",
      desc: "Design and implement modern responsive layouts with glassmorphic cards, typography hierarchy, and mobile navigation."
    },
    {
      id: "fe-2",
      name: "Implement State Management & Theme Switcher",
      cat: "Frontend",
      due: "May 30, 2025",
      pri: "High",
      status: "Submitted",
      pct: 100,
      bg: "#06B6D4",
      desc: "Build persistent dark/light theme switching with smooth CSS variables and global UI state handling."
    },
    {
      id: "fe-3",
      name: "Create Interactive Reusable UI Component Library",
      cat: "Frontend",
      due: "Jun 03, 2025",
      pri: "Medium",
      status: "In Progress",
      pct: 60,
      bg: "#06B6D4",
      desc: "Develop modular Shadcn UI components: modal dialogs, accordions, toast notifications, and date pickers."
    },
    {
      id: "fe-4",
      name: "Connect Real-Time Recharts Visualizations",
      cat: "Frontend",
      due: "Jun 07, 2025",
      pri: "Medium",
      status: "Pending",
      pct: 25,
      bg: "#06B6D4",
      desc: "Bind REST API analytics data to animated Area, Bar, and Line charts with custom gradient tooltips."
    },
    {
      id: "fe-5",
      name: "Optimize Web Vitals, Asset Bundling & Lighthouse",
      cat: "Frontend",
      due: "Jun 12, 2025",
      pri: "Low",
      status: "Pending",
      pct: 0,
      bg: "#06B6D4",
      desc: "Audit and improve First Contentful Paint (FCP) and Cumulative Layout Shift (CLS) scores above 90."
    },
    {
      id: "fe-6",
      name: "Client-Side Form Validation with Zod & React Hook Form",
      cat: "Frontend",
      due: "Jun 16, 2025",
      pri: "Medium",
      status: "Pending",
      pct: 0,
      bg: "#06B6D4",
      desc: "Implement robust client-side validation rules, inline error feedback, and sanitized inputs."
    }
  ],
  "Backend Developer": [
    {
      id: "be-1",
      name: "Build Secure JWT Authentication & RBAC Middleware",
      cat: "Backend",
      due: "May 25, 2025",
      pri: "High",
      status: "In Progress",
      pct: 70,
      bg: "#7C3AED",
      desc: "Develop a secure login/register API with token validation, expiry refresh, and role-based route guards."
    },
    {
      id: "be-2",
      name: "Design & Optimize MongoDB Collections and Indexing",
      cat: "Database",
      due: "May 29, 2025",
      pri: "High",
      status: "Submitted",
      pct: 100,
      bg: "#10b981",
      desc: "Create collection schemas with BSON validation, compound indexing, and query optimization."
    },
    {
      id: "be-3",
      name: "Create RESTful CRUD APIs for Tasks & Journals",
      cat: "Backend",
      due: "Jun 04, 2025",
      pri: "Medium",
      status: "In Progress",
      pct: 50,
      bg: "#7C3AED",
      desc: "Build full CRUD endpoints with request body validation, pagination, and standardized HTTP response codes."
    },
    {
      id: "be-4",
      name: "Implement Rate Limiting, CORS & Error Handling Middleware",
      cat: "Backend",
      due: "Jun 08, 2025",
      pri: "Medium",
      status: "Pending",
      pct: 20,
      bg: "#7C3AED",
      desc: "Protect backend services from DDoS/abuse using IP rate-limiting, secure headers, and global exception handlers."
    },
    {
      id: "be-5",
      name: "Build Automated Unit & Integration Tests with PyTest/Jest",
      cat: "Testing",
      due: "Jun 13, 2025",
      pri: "High",
      status: "Pending",
      pct: 0,
      bg: "#8b5cf6",
      desc: "Write comprehensive test suites covering edge cases, authentication failures, and database transactions."
    },
    {
      id: "be-6",
      name: "Implement Redis Caching Layer for Frequent Queries",
      cat: "Backend",
      due: "Jun 18, 2025",
      pri: "Low",
      status: "Pending",
      pct: 0,
      bg: "#7C3AED",
      desc: "Cache high-throughput database endpoints in Redis with TTL expiration to minimize database latency."
    }
  ],
  "Full Stack Developer": [
    {
      id: "fs-1",
      name: "End-to-End Auth: Next.js Auth + Flask/Node JWT API",
      cat: "Full Stack",
      due: "May 25, 2025",
      pri: "High",
      status: "In Progress",
      pct: 75,
      bg: "#6366F1",
      desc: "Build full-stack user authentication with protected routes, secure HTTP cookies, and local session sync."
    },
    {
      id: "fs-2",
      name: "Build Internship Task Management & Kanban Board",
      cat: "Full Stack",
      due: "May 29, 2025",
      pri: "High",
      status: "Submitted",
      pct: 100,
      bg: "#6366F1",
      desc: "Implement drag-and-drop Kanban workflow with real-time status updates synced between client and database."
    },
    {
      id: "fs-3",
      name: "Integrate MongoDB Database with Next.js Client via APIs",
      cat: "Database",
      due: "Jun 04, 2025",
      pri: "Medium",
      status: "In Progress",
      pct: 60,
      bg: "#10b981",
      desc: "Create robust data pipelines connecting MongoDB models to front-end interactive dashboards."
    },
    {
      id: "fs-4",
      name: "Implement Real-Time Chat & AI Assistant Message Stream",
      cat: "Full Stack",
      due: "Jun 09, 2025",
      pri: "High",
      status: "Pending",
      pct: 20,
      bg: "#6366F1",
      desc: "Develop interactive AI streaming responses and WebSocket chat sync between interns and mentors."
    },
    {
      id: "fs-5",
      name: "Containerize Full-Stack App with Docker & Docker Compose",
      cat: "DevOps",
      due: "Jun 14, 2025",
      pri: "Medium",
      status: "Pending",
      pct: 0,
      bg: "#ec4899",
      desc: "Build multi-stage Dockerfiles for client and server with unified orchestration via docker-compose."
    },
    {
      id: "fs-6",
      name: "Write OpenAPI / Swagger Documentation & API Contract",
      cat: "Documentation",
      due: "Jun 18, 2025",
      pri: "Low",
      status: "Pending",
      pct: 0,
      bg: "#f59e0b",
      desc: "Generate interactive API documentation detailing all endpoints, request schemas, and sample payloads."
    }
  ],
  "Data Structures & Core Engineer": [
    {
      id: "ds-1",
      name: "Implement In-Memory LRU Cache with Hash Map & Doubly Linked List",
      cat: "Data Structures",
      due: "May 25, 2025",
      pri: "High",
      status: "In Progress",
      pct: 70,
      bg: "#ec4899",
      desc: "Build an O(1) get and put Least Recently Used cache with automated node eviction and thread safety."
    },
    {
      id: "ds-2",
      name: "Design Graph Traversal & Shortest Path Algorithm for Mentor Matching",
      cat: "Algorithms",
      due: "May 30, 2025",
      pri: "High",
      status: "Submitted",
      pct: 100,
      bg: "#a855f7",
      desc: "Implement Dijkstra / BFS algorithms to match interns with mentors based on skill compatibility graph."
    },
    {
      id: "ds-3",
      name: "Build Priority Queue & Min-Heap for Task Deadline Scheduler",
      cat: "Data Structures",
      due: "Jun 05, 2025",
      pri: "Medium",
      status: "In Progress",
      pct: 50,
      bg: "#ec4899",
      desc: "Construct a binary min-heap to order and dispatch tasks dynamically by approaching deadlines."
    },
    {
      id: "ds-4",
      name: "Optimize Database Search from O(N) to O(log N) via Trie Tree",
      cat: "Algorithms",
      due: "Jun 10, 2025",
      pri: "Medium",
      status: "Pending",
      pct: 15,
      bg: "#a855f7",
      desc: "Build a prefix tree (Trie) for instantaneous search auto-completion across thousands of portal records."
    },
    {
      id: "ds-5",
      name: "Algorithm Benchmarking & Big-O Complexity Performance Report",
      cat: "Testing",
      due: "Jun 15, 2025",
      pri: "Low",
      status: "Pending",
      pct: 0,
      bg: "#8b5cf6",
      desc: "Profile execution time and space complexity against large input datasets with memory profiling tools."
    },
    {
      id: "ds-6",
      name: "Implement Balanced AVL / Red-Black Tree for Sorted Student Index",
      cat: "Data Structures",
      due: "Jun 20, 2025",
      pri: "High",
      status: "Pending",
      pct: 0,
      bg: "#ec4899",
      desc: "Implement self-balancing binary search tree rotations ensuring O(log N) worst-case insertion and deletion."
    }
  ],
  "DevOps & Cloud Engineer": [
    {
      id: "do-1",
      name: "Set Up Docker Containerization for Client & Server Services",
      cat: "DevOps",
      due: "May 25, 2025",
      pri: "High",
      status: "In Progress",
      pct: 80,
      bg: "#ec4899",
      desc: "Build optimized multi-stage alpine container images with non-root security profiles."
    },
    {
      id: "do-2",
      name: "Configure CI/CD Automation Pipeline with GitHub Actions",
      cat: "DevOps",
      due: "May 30, 2025",
      pri: "High",
      status: "Submitted",
      pct: 100,
      bg: "#ec4899",
      desc: "Automate code linting, unit testing, docker build, and cloud artifact deployment on each pull request."
    },
    {
      id: "do-3",
      name: "Deploy Multi-Container Setup with Nginx Reverse Proxy",
      cat: "DevOps",
      due: "Jun 05, 2025",
      pri: "Medium",
      status: "In Progress",
      pct: 40,
      bg: "#ec4899",
      desc: "Configure Nginx load balancing, SSL termination, and reverse proxy routing between client and server."
    },
    {
      id: "do-4",
      name: "Implement Centralized Logging & Health Check Monitoring",
      cat: "DevOps",
      due: "Jun 10, 2025",
      pri: "Medium",
      status: "Pending",
      pct: 20,
      bg: "#ec4899",
      desc: "Set up structured JSON logging, liveness/readiness probes, and error rate alerting."
    },
    {
      id: "do-5",
      name: "Automate MongoDB Database Backups & S3 Snapshot Archival",
      cat: "Database",
      due: "Jun 15, 2025",
      pri: "Low",
      status: "Pending",
      pct: 0,
      bg: "#10b981",
      desc: "Write automated cron backup scripts that dump, compress, and upload daily database snapshots to S3."
    },
    {
      id: "do-6",
      name: "Security Hardening: SSL/TLS, CORS Policies & Secret Vault",
      cat: "Security",
      due: "Jun 20, 2025",
      pri: "High",
      status: "Pending",
      pct: 0,
      bg: "#f43f5e",
      desc: "Audit server vulnerabilities, enforce TLS 1.3, configure strict CSP headers, and manage environment secrets."
    }
  ]
}

// ─── Role Determination Function ──────────────────────────────────────────────
export function determineRole(answers) {
  let feScore = 0
  let beScore = 0
  let dsScore = 0
  let dbScore = 0

  ASSESSMENT_QUESTIONS.forEach(q => {
    const isCorrect = answers[q.id] === q.correctIndex
    if (isCorrect) {
      if (q.domain === "frontend") feScore++
      else if (q.domain === "backend") beScore++
      else if (q.domain === "ds") dsScore++
      else if (q.domain === "db") dbScore++
    }
  })

  const totalScore = feScore + beScore + dsScore + dbScore
  const totalQuestions = ASSESSMENT_QUESTIONS.length
  const percentage = Math.round((totalScore / totalQuestions) * 100)

  let assignedRole = "Full Stack Developer"
  let roleBadge = "Full Stack Engineer"
  let description = "You demonstrated well-balanced competence across both frontend UI architecture and backend API systems."

  if (feScore >= 3 && beScore >= 3) {
    assignedRole = "Full Stack Developer"
    roleBadge = "Full Stack Engineer"
    description = "Outstanding dual-mastery in client interfaces, React hooks, and backend RESTful architectures."
  } else if (feScore > beScore && feScore >= dsScore) {
    assignedRole = "Frontend Developer"
    roleBadge = "Frontend Specialist"
    description = "Excellence in UI/UX architecture, component lifecycle, CSS Grid, React, and Core Web Vitals."
  } else if (beScore > feScore && beScore >= dsScore) {
    assignedRole = "Backend Developer"
    roleBadge = "Backend & API Architect"
    description = "Exceptional understanding of REST endpoints, JWT authentication, Bcrypt security, and middleware pipelines."
  } else if (dsScore > feScore && dsScore > beScore) {
    assignedRole = "Data Structures & Core Engineer"
    roleBadge = "Algorithm & Systems Engineer"
    description = "High proficiency in algorithmic complexity, Hash Maps, BST traversals, stacks, and tree optimizations."
  } else if (dbScore >= 3) {
    assignedRole = "DevOps & Cloud Engineer"
    roleBadge = "DevOps & Infrastructure Engineer"
    description = "Strong foundation in MongoDB schemas, indexing, Docker containerization, and Git branching workflows."
  } else if (feScore >= beScore) {
    assignedRole = "Frontend Developer"
    roleBadge = "Frontend Specialist"
    description = "Strong potential in client-side development, responsive layouts, and modern web application building."
  } else {
    assignedRole = "Backend Developer"
    roleBadge = "Backend & API Architect"
    description = "Strong potential in server-side development, database communication, and secure API handling."
  }

  return {
    assignedRole,
    roleBadge,
    description,
    score: totalScore,
    totalQuestions,
    percentage,
    domainScores: {
      frontend: { score: feScore, total: 4, name: "Frontend & UI" },
      backend: { score: beScore, total: 4, name: "Backend & APIs" },
      ds: { score: dsScore, total: 4, name: "Data Structures & Algo" },
      db: { score: dbScore, total: 4, name: "Databases & DevOps" }
    }
  }
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────
export const STORAGE_KEY_ROLE = "intern_assigned_role"
export const STORAGE_KEY_ASSESSMENT = "intern_assessment_result"

export function getAssignedRole() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEY_ROLE) || null
}

export function saveAssessmentResult(result) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY_ROLE, result.assignedRole)
  localStorage.setItem(STORAGE_KEY_ASSESSMENT, JSON.stringify(result))

  // Update user object in storage
  try {
    const rawUser = localStorage.getItem("user_intern") || localStorage.getItem("user")
    if (rawUser) {
      const u = JSON.parse(rawUser)
      u.internRole = result.assignedRole
      u.assessmentScore = result.percentage
      localStorage.setItem("user", JSON.stringify(u))
      localStorage.setItem("user_intern", JSON.stringify(u))
    }
  } catch {}

  // Trigger storage event so all components sync immediately
  window.dispatchEvent(new Event("intern_role_updated"))
}

export function getTasksForRole(role) {
  if (!role || !ROLE_TASKS[role]) {
    // Default fallback to Full Stack if not taken
    return ROLE_TASKS["Full Stack Developer"]
  }
  return ROLE_TASKS[role]
}
