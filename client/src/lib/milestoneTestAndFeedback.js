/**
 * 15-Day Milestone Tests and Weekly Mentor Feedback data & sync layer
 */
import { getAssignedRole } from "./assessmentData"
import { canonicalInternId } from "./chatSync"

export const KEY_15_DAY_TESTS = "intern_15_day_milestone_tests"
export const KEY_WEEKLY_FEEDBACK = "intern_weekly_mentor_feedback"

export const ROLE_MENTOR_INFO = {
  "Backend Developer": {
    name: "Rahul Sharma",
    role: "Backend Architect & Tech Lead",
    company: "CodeCraft Solutions",
    email: "rahul.sharma@codecraft.io",
    avatar: "R",
    color: "#7C3AED",
  },
  "Frontend Developer": {
    name: "Priya Verma",
    role: "Frontend Tech Lead & Design Systems",
    company: "CodeCraft Solutions",
    email: "priya.verma@codecraft.io",
    avatar: "P",
    color: "#ec4899",
  },
  "Full Stack Developer": {
    name: "Amit Patel",
    role: "Senior Full Stack Engineer",
    company: "Tech Solutions",
    email: "amit.patel@techsolutions.com",
    avatar: "A",
    color: "#f59e0b",
  },
  "DevOps & Cloud Engineer": {
    name: "Sneha Iyer",
    role: "DevOps & Cloud Lead",
    company: "CloudTech",
    email: "sneha.iyer@cloudtech.com",
    avatar: "S",
    color: "#22c55e",
  },
  "Data Structures & Core Engineer": {
    name: "Vikram Singh",
    role: "Principal Systems Engineer",
    company: "DataLabs Inc",
    email: "vikram.singh@datalabs.com",
    avatar: "V",
    color: "#06B6D4",
  },
}

export function getMentorForRole(role) {
  return ROLE_MENTOR_INFO[role] || ROLE_MENTOR_INFO["Backend Developer"]
}

// ─── 15-DAY MILESTONE TEST QUESTION POOLS (15 Questions Per Track) ──────────
export const MILESTONE_QUESTIONS_BY_ROLE = {
  "Backend Developer": [
    {
      id: 1,
      topic: "API Architecture",
      q: "Which HTTP status code is most appropriate when a requested resource is created successfully?",
      options: ["200 OK", "201 Created", "202 Accepted", "204 No Content"],
      correct: 1,
      explanation: "HTTP 201 Created signifies that the request succeeded and resulted in a new resource creation."
    },
    {
      id: 2,
      topic: "Node.js Concurrency",
      q: "In the Node.js event loop, which phase handles setTimeout and setInterval callbacks?",
      options: ["Poll phase", "Check phase", "Timers phase", "Pending callbacks phase"],
      correct: 2,
      explanation: "The Timers phase executes callbacks scheduled by setTimeout() and setInterval()."
    },
    {
      id: 3,
      topic: "Authentication & Security",
      q: "What is the primary function of the 'salt' when hashing passwords with bcrypt?",
      options: [
        "To encrypt the password symmetrically",
        "To prevent rainbow table attacks by adding random data before hashing",
        "To compress the hashed string to fit in memory",
        "To auto-expire passwords after 30 days"
      ],
      correct: 1,
      explanation: "Salting ensures identical passwords generate completely different hashes, protecting against precomputed rainbow table lookups."
    },
    {
      id: 4,
      topic: "Database & MongoDB",
      q: "Which index type in MongoDB is best suited to enforce unique field values across documents?",
      options: ["Compound Index", "Unique Index", "TTL Index", "Sparse Index"],
      correct: 1,
      explanation: "A Unique index ensures MongoDB rejects documents where the indexed field has a duplicate value."
    },
    {
      id: 5,
      topic: "Express.js Architecture",
      q: "How must error-handling middleware functions be declared in Express.js?",
      options: [
        "app.use((err, req, res) => {})",
        "app.use((req, res, next) => {})",
        "app.use((err, req, res, next) => {}) with exactly 4 parameters",
        "app.catch((error) => {})"
      ],
      correct: 2,
      explanation: "Express identifies error-handling middleware strictly by having exactly 4 arguments: (err, req, res, next)."
    },
    {
      id: 6,
      topic: "Asynchronous Patterns",
      q: "What happens if an unhandled promise rejection occurs in a modern Node.js process?",
      options: [
        "It is silently ignored by the V8 runtime",
        "The process terminates with a non-zero exit code unless an 'unhandledRejection' listener is present",
        "Node automatically retries the asynchronous operation 3 times",
        "It converts into a synchronous alert popup"
      ],
      correct: 1,
      explanation: "Modern Node.js versions crash with a non-zero exit code upon unhandled promise rejections."
    },
    {
      id: 7,
      topic: "REST Best Practices",
      q: "Which HTTP method should be idempotent and used to replace an entire resource representation?",
      options: ["POST", "PATCH", "PUT", "OPTIONS"],
      correct: 2,
      explanation: "PUT is idempotent and replaces the target resource representation in its entirety."
    },
    {
      id: 8,
      topic: "JWT Tokens",
      q: "Where in a standard HTTP request header should a JWT bearer token be placed?",
      options: [
        "Header: Content-Type: application/jwt",
        "Header: Authorization: Bearer <token>",
        "Header: Proxy-Authorization: <token>",
        "Header: Accept-Token: Bearer <token>"
      ],
      correct: 1,
      explanation: "Standard REST APIs transmit bearer tokens via the 'Authorization: Bearer <token>' header."
    },
    {
      id: 9,
      topic: "MongoDB Performance",
      q: "What command in MongoDB provides detailed execution statistics including keysExamined and executionTimeMillis?",
      options: ["db.collection.stats()", "db.collection.find().explain('executionStats')", "db.collection.profile()", "db.collection.benchmark()"],
      correct: 1,
      explanation: "explain('executionStats') returns in-depth query planning and execution cost metrics."
    },
    {
      id: 10,
      topic: "Middleware Chains",
      q: "What happens in Express if a middleware does not call next() and does not send a response?",
      options: [
        "Express immediately calls the next route handler",
        "The client request hangs until it hits a socket timeout",
        "The server throws a 500 internal server error",
        "The request restarts from the beginning"
      ],
      correct: 1,
      explanation: "If next() is omitted and res is not ended, the connection remains open until client or gateway timeout."
    },
    {
      id: 11,
      topic: "Security",
      q: "Which security vulnerability is mitigated by implementing Helmet.js in an Express app?",
      options: [
        "Buffer overflow in V8 garbage collector",
        "Various HTTP header vulnerabilities (e.g. X-Powered-By, Clickjacking, MIME-sniffing)",
        "SQL injection in raw database drivers",
        "DDoS attacks on the network switch"
      ],
      correct: 1,
      explanation: "Helmet sets sensible HTTP security headers like X-Content-Type-Options, Frameguard, and HSTS."
    },
    {
      id: 12,
      topic: "Data Validation",
      q: "Which library is commonly used in Node.js for declarative request payload validation schema?",
      options: ["Lodash", "Zod / Joi", "Chalk", "Commander"],
      correct: 1,
      explanation: "Zod and Joi are leading schema definition and runtime validation libraries for Node payloads."
    },
    {
      id: 13,
      topic: "Caching & Performance",
      q: "What is the primary benefit of Redis in-memory caching in front of a MongoDB database?",
      options: [
        "It eliminates the need for any permanent database storage",
        "Sub-millisecond read response times for high-frequency repeated queries",
        "Automatic schema migration for relational databases",
        "Enforces client-side CSS minification"
      ],
      correct: 1,
      explanation: "Redis stores frequently read data in RAM, reducing heavy MongoDB I/O cycles to sub-milliseconds."
    },
    {
      id: 14,
      topic: "Git & CI/CD",
      q: "Which Git command is recommended to inspect commit logs in a concise, one-line graphical format?",
      options: ["git status", "git log --oneline --graph --decorate", "git diff HEAD~1", "git branch -a"],
      correct: 1,
      explanation: "'git log --oneline --graph' provides an intuitive visual branch tree for PR reviews."
    },
    {
      id: 15,
      topic: "Error Handling",
      q: "What is the best practice for production error responses to API clients?",
      options: [
        "Return the full internal V8 stack trace and file system path",
        "Return a structured JSON error { success: false, message: 'Friendly error message', code: 'ERROR_CODE' } without leaking internal system traces",
        "Return raw HTML string dumps",
        "Never return an error code; always return status 200 with an empty body"
      ],
      correct: 1,
      explanation: "Production APIs must sanitize error messages to prevent leaking server paths, environment variables, or database structures."
    }
  ],

  "Frontend Developer": [
    {
      id: 1,
      topic: "React Fundamentals",
      q: "What is the difference between controlled and uncontrolled components in React?",
      options: [
        "Controlled components store state in the DOM; uncontrolled use React state",
        "Controlled components have their form data handled by React state; uncontrolled store state in the DOM via refs",
        "Controlled components cannot be modified by user input",
        "Uncontrolled components cannot accept props"
      ],
      correct: 1,
      explanation: "Controlled inputs derive their current value directly from React state via value/onChange."
    },
    {
      id: 2,
      topic: "CSS Layout",
      q: "Which CSS property allows elements to keep their aspect ratio across all screen resizes?",
      options: ["aspect-ratio", "object-fit", "flex-basis", "grid-auto-flow"],
      correct: 0,
      explanation: "The aspect-ratio CSS property defines a preferred width-to-height ratio for an element."
    },
    {
      id: 3,
      topic: "Next.js Architecture",
      q: "In the Next.js App Router, which file convention defines the root UI wrapper shared across routes?",
      options: ["page.jsx", "layout.jsx", "template.jsx", "loading.jsx"],
      correct: 1,
      explanation: "layout.jsx provides persistent shared layouts and preserves state across sub-routes."
    },
    {
      id: 4,
      topic: "Performance",
      q: "What hook should be used to prevent expensive recalculations during component re-renders?",
      options: ["useCallback", "useMemo", "useRef", "useEffect"],
      correct: 1,
      explanation: "useMemo caches the result of a calculation between re-renders based on dependencies."
    },
    {
      id: 5,
      topic: "State Management",
      q: "When should React Context be preferred over local component state?",
      options: [
        "For every single button click or form text field",
        "When state needs to be accessed by many deeply nested components (e.g. theme, authenticated user, locale)",
        "When rendering static SVG icons",
        "Only when using TypeScript classes"
      ],
      correct: 1,
      explanation: "Context is ideal for global or cross-cutting data like themes, auth sessions, and translations."
    },
    {
      id: 6,
      topic: "Web Accessibility",
      q: "What is the purpose of the 'aria-label' attribute on interactive HTML elements?",
      options: [
        "To define the CSS hover transition speed",
        "To provide a string label for screen readers when visible text is absent (e.g. icon buttons)",
        "To trigger browser spellchecking",
        "To preload Google web fonts"
      ],
      correct: 1,
      explanation: "aria-label provides accessible descriptions for screen readers, essential for icon-only buttons."
    },
    {
      id: 7,
      topic: "DOM & Events",
      q: "What does event.preventDefault() do when submitting an HTML form in React?",
      options: [
        "It cancels the component render tree",
        "It prevents the default browser page reload so JavaScript can handle submission via AJAX/fetch",
        "It clears all input field values immediately",
        "It encrypts the form payload"
      ],
      correct: 1,
      explanation: "preventDefault stops the default HTTP GET/POST form navigation, allowing SPA handling."
    },
    {
      id: 8,
      topic: "React Hooks",
      q: "Why can React hooks not be called inside loops, conditions, or nested functions?",
      options: [
        "V8 engine will run out of call stack memory",
        "React relies on the exact same call order on every render to correctly associate state with hooks",
        "Hooks require asynchronous callbacks",
        "JSX parser cannot transpile conditionals"
      ],
      correct: 1,
      explanation: "The Rules of Hooks require stable execution order so React correctly indexes hook state."
    },
    {
      id: 9,
      topic: "CSS Modern",
      q: "What does the CSS 'backdrop-filter: blur(10px)' property accomplish?",
      options: [
        "Blurs the text inside the current container",
        "Applies a blur graphical effect to the area behind an element (frosted glass/glassmorphism)",
        "Blurs the entire browser window",
        "Adds drop shadow to the border box"
      ],
      correct: 1,
      explanation: "backdrop-filter applies visual effects like blur or saturation to the elements behind the target."
    },
    {
      id: 10,
      topic: "Next.js SSR vs CSR",
      q: "Which directive must be added at the top of a file in Next.js App Router to use useState or browser APIs?",
      options: ["'use server'", "'use client'", "'use browser'", "'export dynamic'"],
      correct: 1,
      explanation: "'use client' declares a boundary indicating that component subtree renders on the client."
    },
    {
      id: 11,
      topic: "Virtual DOM",
      q: "Why is the 'key' prop crucial when rendering lists in React?",
      options: [
        "It styles the list item with CSS",
        "It gives elements a stable identity so React's reconciliation diffing algorithm can reuse DOM nodes",
        "It binds the item to database primary key directly",
        "It prevents the item from re-rendering forever"
      ],
      correct: 1,
      explanation: "Keys help React identify which items have changed, been added, or been removed during diffing."
    },
    {
      id: 12,
      topic: "Responsive Design",
      q: "In Tailwind CSS, what is the default breakpoint for the 'md:' prefix?",
      options: ["480px", "640px", "768px", "1024px"],
      correct: 2,
      explanation: "In Tailwind CSS, 'md' targets screen widths at or above 768px."
    },
    {
      id: 13,
      topic: "Performance",
      q: "What is Core Web Vitals' 'LCP' metric?",
      options: [
        "Low CSS Priority",
        "Largest Contentful Paint — measures perceived page loading speed by timing when main content finishes rendering",
        "Linear Canvas Processing",
        "Lazy Component Parsing"
      ],
      correct: 1,
      explanation: "Largest Contentful Paint (LCP) measures when the largest text block or image is rendered."
    },
    {
      id: 14,
      topic: "TypeScript / JS",
      q: "What is the benefit of Optional Chaining ('?.') in JavaScript?",
      options: [
        "It forces an object to become immutable",
        "It safely accesses nested object properties without throwing a TypeError if a reference is null or undefined",
        "It converts promises into synchronous calls",
        "It doubles string concatenation speed"
      ],
      correct: 1,
      explanation: "Optional chaining evaluates to undefined instead of throwing error when reading deep properties."
    },
    {
      id: 15,
      topic: "Web Security",
      q: "How does React automatically protect against Cross-Site Scripting (XSS) in JSX?",
      options: [
        "By refusing to render any strings with more than 50 characters",
        "By escaping all string values embedded in JSX expressions before rendering them to the DOM",
        "By blocking all external network requests",
        "By running a local anti-virus scan in WebAssembly"
      ],
      correct: 1,
      explanation: "React escapes embedded values before rendering, preventing script tags from executing as code."
    }
  ],

  "Full Stack Developer": [
    {
      id: 1,
      topic: "Architecture",
      q: "In a 3-tier Full Stack architecture, what constitutes the Presentation, Application, and Data tiers?",
      options: [
        "HTML, CSS, JavaScript",
        "Frontend Client (Browser/Mobile), Backend API Server (Node/Express), Database (MongoDB/PostgreSQL)",
        "DevOps, Git, Cloud",
        "Router, Controller, Model"
      ],
      correct: 1,
      explanation: "3-tier architecture separates Presentation (Client UI), Application (Logic/APIs), and Data (DB)."
    },
    {
      id: 2,
      topic: "API Protocol",
      q: "What are the main advantages of WebSockets over standard HTTP polling for real-time portals?",
      options: [
        "WebSockets do not require an IP address",
        "Full-duplex, bidirectional communication over a single persistent TCP connection with minimal header overhead",
        "WebSockets work without any backend server",
        "WebSockets eliminate the need for authentication"
      ],
      correct: 1,
      explanation: "WebSockets maintain a persistent low-latency connection allowing instant client-server streaming."
    },
    {
      id: 3,
      topic: "Security",
      q: "What is the purpose of CORS (Cross-Origin Resource Sharing) headers?",
      options: [
        "To speed up CSS downloading across CDNs",
        "To allow or restrict resources on a web server from being requested from another domain outside its origin",
        "To automatically encrypt database passwords",
        "To compile TypeScript in the cloud"
      ],
      correct: 1,
      explanation: "CORS is a browser security mechanism that restricts cross-origin HTTP requests unless permitted."
    },
    {
      id: 4,
      topic: "Full Stack Auth",
      q: "Why are HTTP-only cookies preferred over localStorage for storing sensitive refresh tokens?",
      options: [
        "HTTP-only cookies have infinite storage size",
        "HTTP-only cookies cannot be accessed by client-side JavaScript, mitigating Cross-Site Scripting (XSS) token theft",
        "localStorage does not work on mobile phones",
        "HTTP-only cookies automatically encrypt the database"
      ],
      correct: 1,
      explanation: "Cookies with the HttpOnly flag prevent malicious client scripts from extracting session tokens."
    },
    {
      id: 5,
      topic: "Database",
      q: "When designing a MongoDB database for an intern portal, when should embedded subdocuments be favored over references?",
      options: [
        "When related data exceeds the 16MB document size limit",
        "When related data is frequently read together with the parent and has a 1-to-few bounded relationship",
        "Never; MongoDB requires relational foreign keys",
        "Only when querying via GraphQL"
      ],
      correct: 1,
      explanation: "Embedding delivers fast single-query reads for bounded, tightly coupled parent-child data."
    },
    {
      id: 6,
      topic: "State Synchronization",
      q: "How does optimistic UI updating improve perceived user experience in a web application?",
      options: [
        "It postpones backend requests until the user logs out",
        "It updates the UI immediately assuming server success, rolling back only if the server returns an error",
        "It deletes all client cache on every route change",
        "It forces the CPU into overclock mode"
      ],
      correct: 1,
      explanation: "Optimistic UI eliminates visual latency by showing the expected state before server roundtrip finishes."
    },
    {
      id: 7,
      topic: "Server-Side Performance",
      q: "What is the purpose of database connection pooling in high-concurrency Node.js services?",
      options: [
        "To pool all client passwords into one table",
        "To reuse a cached pool of open database connections instead of opening and tearing down sockets per request",
        "To compress SQL tables into ZIP archives",
        "To automatically restart crashed containers"
      ],
      correct: 1,
      explanation: "Connection pools avoid the heavy TCP and TLS handshake overhead of establishing new DB connections."
    },
    {
      id: 8,
      topic: "API Design",
      q: "Which HTTP header specifies the format of the data being sent in a POST request body?",
      options: ["Accept", "Content-Type", "User-Agent", "Cache-Control"],
      correct: 1,
      explanation: "Content-Type (e.g. application/json) informs the receiver how to parse the incoming request stream."
    },
    {
      id: 9,
      topic: "Error Handling",
      q: "In an end-to-end web system, why should input validation occur on BOTH client and server?",
      options: [
        "It shouldn't; client validation is always 100% sufficient",
        "Client validation provides instant user feedback; server validation is critical security against bypassed clients",
        "Because browsers delete server error codes",
        "To satisfy HTML5 W3C licensing fees"
      ],
      correct: 1,
      explanation: "Client validation improves UX; server validation is indispensable because clients can be spoofed or bypassed."
    },
    {
      id: 10,
      topic: "Deployment",
      q: "What is the role of Nginx or a reverse proxy in front of a Node.js web application?",
      options: [
        "To write database schemas",
        "SSL/TLS termination, static asset serving, load balancing, and request rate limiting",
        "To compile React JSX components into binary",
        "To replace the Node.js runtime entirely"
      ],
      correct: 1,
      explanation: "Reverse proxies offload SSL encryption, cache static assets, and distribute traffic across worker processes."
    },
    {
      id: 11,
      topic: "Pagination",
      q: "Why is cursor-based pagination preferred over offset-based pagination on large datasets?",
      options: [
        "Offset pagination requires MongoDB Enterprise",
        "Cursor pagination avoids skipping millions of rows (O(N) cost) and handles real-time dataset inserts cleanly",
        "Cursor pagination only works with mouse pointers",
        "Offset pagination cannot sort ascending"
      ],
      correct: 1,
      explanation: "Cursor pagination queries from the last seen ID/timestamp, maintaining constant O(1) query time."
    },
    {
      id: 12,
      topic: "Caching",
      q: "What does the HTTP header 'Cache-Control: no-cache' instruct the browser to do?",
      options: [
        "Never download the requested resource",
        "Cache the response but revalidate with the origin server (via ETag) before reusing it",
        "Delete the user's hard drive cache",
        "Store the file in localStorage permanently"
      ],
      correct: 1,
      explanation: "'no-cache' means the client can store the response, but must validate with the server before use."
    },
    {
      id: 13,
      topic: "Clean Code",
      q: "What is the primary objective of Separation of Concerns (SoC) in full stack development?",
      options: [
        "To place all HTML, SQL, and CSS inside a single 10,000-line file",
        "To organize software into distinct sections where each section addresses a separate responsibility (UI, Logic, DB)",
        "To prevent developers from sharing code repositories",
        "To encrypt source code before committing to Git"
      ],
      correct: 1,
      explanation: "Separation of concerns keeps code modular, testable, and easier to scale without unintended side-effects."
    },
    {
      id: 14,
      topic: "Testing",
      q: "What is the primary difference between Unit Tests and End-to-End (E2E) Tests?",
      options: [
        "Unit tests test isolated functions in isolation; E2E tests verify the complete integrated system flow as a real user",
        "Unit tests require a real web browser; E2E tests do not",
        "Unit tests are only run in production",
        "E2E tests cannot test API endpoints"
      ],
      correct: 0,
      explanation: "Unit tests check individual code units; E2E tests validate entire user journeys across client, server, and DB."
    },
    {
      id: 15,
      topic: "Async Execution",
      q: "What is the difference between Promise.all() and Promise.allSettled()?",
      options: [
        "Promise.all rejects immediately upon the first failure; Promise.allSettled waits for all promises to finish regardless of outcome",
        "Promise.allSettled only works in Node.js 8",
        "Promise.all cannot accept an array of promises",
        "There is no difference"
      ],
      correct: 0,
      explanation: "Promise.all fail-fasts on any rejection, whereas Promise.allSettled returns status for all operations."
    }
  ],

  "DevOps & Cloud Engineer": [
    {
      id: 1,
      topic: "Docker Containers",
      q: "What is the primary advantage of multi-stage Docker builds?",
      options: [
        "They allow Docker to run on Windows without WSL",
        "They produce drastically smaller, secure production images by leaving compilation tools in intermediate build stages",
        "They run containers at double CPU clock frequency",
        "They auto-generate Kubernetes manifests"
      ],
      correct: 1,
      explanation: "Multi-stage builds copy only compiled artifacts into the final runtime container, discarding heavy SDKs."
    },
    {
      id: 2,
      topic: "CI/CD Pipelines",
      q: "What is the difference between Continuous Delivery and Continuous Deployment?",
      options: [
        "Continuous Delivery requires automated testing; Deployment does not",
        "In Continuous Delivery, production release requires manual approval; in Continuous Deployment, every passing commit auto-deploys to production",
        "Delivery is only used for mobile apps",
        "They are two unrelated marketing terms"
      ],
      correct: 1,
      explanation: "Continuous Deployment deploys straight to production automatically upon green tests without human gates."
    },
    {
      id: 3,
      topic: "Cloud Infrastructure",
      q: "What AWS service provides managed container orchestration based on Kubernetes?",
      options: ["Amazon EC2", "Amazon EKS", "AWS Lambda", "Amazon S3"],
      correct: 1,
      explanation: "Amazon EKS (Elastic Kubernetes Service) is AWS's managed control plane for Kubernetes."
    },
    {
      id: 4,
      topic: "Linux Systems",
      q: "Which Linux command is used to inspect active network listening ports and process IDs?",
      options: ["ss -tulpn or netstat -tulpn", "ls -la", "cat /etc/hosts", "chmod +x"],
      correct: 0,
      explanation: "ss -tulpn displays TCP/UDP listening sockets along with process names and PIDs."
    },
    {
      id: 5,
      topic: "Infrastructure as Code",
      q: "Which declarative tool is widely used to provision and version multi-cloud infrastructure via HCL?",
      options: ["Terraform", "Docker Swarm", "Jenkinsfile", "Webpack"],
      correct: 0,
      explanation: "HashiCorp Terraform provisions cloud resources across AWS, GCP, and Azure using HCL."
    },
    {
      id: 6,
      topic: "Observability",
      q: "What are the three pillars of modern cloud observability?",
      options: [
        "HTML, CSS, JavaScript",
        "Metrics, Logs, and Traces",
        "Dev, Stage, and Prod",
        "Compute, Storage, and Networking"
      ],
      correct: 1,
      explanation: "Metrics (numeric telemetry), Logs (event records), and Distributed Tracing constitute observability."
    },
    {
      id: 7,
      topic: "Kubernetes Architecture",
      q: "What is the smallest deployable computing unit in Kubernetes?",
      options: ["Container", "Pod", "Node", "Namespace"],
      correct: 1,
      explanation: "A Pod represents a single instance of an application process and encapsulates one or more containers."
    },
    {
      id: 8,
      topic: "Security",
      q: "Why should Docker containers NEVER run application processes as the 'root' user in production?",
      options: [
        "Because root processes run slower",
        "A container breakout could grant attackers root privileges over the host operating system kernel",
        "Docker daemon refuses to start root containers",
        "Linux file permissions don't apply to root"
      ],
      correct: 1,
      explanation: "Running as non-root (USER 1000) adheres to least privilege and mitigates host takeover vulnerabilities."
    },
    {
      id: 9,
      topic: "Load Balancing",
      q: "What deployment strategy brings up a new identical environment (Green) alongside the current live environment (Blue) for zero-downtime cutover?",
      options: ["Blue-Green Deployment", "Canary Deployment", "Rolling Update", "Recreate Deployment"],
      correct: 0,
      explanation: "Blue-Green deployment allows testing of the new environment before switching live router traffic instantly."
    },
    {
      id: 10,
      topic: "GitOps",
      q: "What is the core premise of GitOps (e.g. ArgoCD, Flux)?",
      options: [
        "Using Git to replace Linux bash shells",
        "Git is the single source of truth for desired infrastructure and application state, continuously synchronized by an agent",
        "Deleting all GitHub pull requests automatically",
        "Hosting databases inside Git repositories"
      ],
      correct: 1,
      explanation: "GitOps stores declarative infrastructure in Git and reconciles live cluster state automatically."
    },
    {
      id: 11,
      topic: "DNS & Networking",
      q: "Which DNS record type maps a domain name directly to an IPv4 address?",
      options: ["A Record", "CNAME Record", "MX Record", "TXT Record"],
      correct: 0,
      explanation: "An 'A' record maps a hostname to an IPv4 address (e.g. 192.0.2.1)."
    },
    {
      id: 12,
      topic: "Container Networking",
      q: "What does Docker port mapping syntax '-p 8080:3000' signify?",
      options: [
        "Host port 3000 forwards to container port 8080",
        "Host port 8080 forwards traffic to container port 3000",
        "Both ports 8080 and 3000 are blocked",
        "It opens 8,080 ports inside the container"
      ],
      correct: 1,
      explanation: "The format is -p <host-port>:<container-port>, routing host 8080 to container 3000."
    },
    {
      id: 13,
      topic: "Monitoring",
      q: "Which open-source time-series database and alerting toolkit is standard for Kubernetes monitoring?",
      options: ["Prometheus", "MongoDB", "SQLite", "Hadoop"],
      correct: 0,
      explanation: "Prometheus scrapes and stores pull-based metrics and integrates seamlessly with Grafana."
    },
    {
      id: 14,
      topic: "Storage",
      q: "In Docker, what is the best mechanism for persisting container data beyond the container's lifecycle?",
      options: ["Ephemeral container layer", "Named Docker Volumes or Bind Mounts", "Base64 environment variables", "Git commit history"],
      correct: 1,
      explanation: "Docker Volumes reside on the host filesystem outside the container union filesystem lifecycle."
    },
    {
      id: 15,
      topic: "Automation",
      q: "In GitHub Actions, which keyword triggers a workflow whenever code is pushed to the 'main' branch?",
      options: ["on: push: branches: [main]", "run: deploy: main", "trigger: always", "start: github.push"],
      correct: 0,
      explanation: "The 'on: push: branches: [main]' event trigger initiates pipeline jobs on commits to main."
    }
  ],

  "Data Structures & Core Engineer": [
    {
      id: 1,
      topic: "Complexity Analysis",
      q: "What is the worst-case time complexity of searching for an element in an unsorted array of size N?",
      options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
      correct: 2,
      explanation: "In an unsorted array, linear search must examine up to all N elements in the worst case."
    },
    {
      id: 2,
      topic: "Trees",
      q: "What property distinguishes a Binary Search Tree (BST) from a standard Binary Tree?",
      options: [
        "All nodes must have exactly two child nodes",
        "For every node, left subtree values are strictly smaller and right subtree values are strictly greater",
        "All leaves must be on the same horizontal level",
        "Values must be prime numbers"
      ],
      correct: 1,
      explanation: "In a BST, all keys in the left subtree are smaller than the node, and right subtree keys are greater."
    },
    {
      id: 3,
      topic: "Graph Traversal",
      q: "Which data structure is fundamentally used to implement Breadth-First Search (BFS) in a graph?",
      options: ["Stack", "Queue", "Heap / Priority Queue", "Disjoint Set"],
      correct: 1,
      explanation: "BFS explores neighbor vertices level-by-level using a First-In-First-Out (FIFO) Queue."
    },
    {
      id: 4,
      topic: "Hash Tables",
      q: "What is the average time complexity for insertion, deletion, and lookup in a well-designed Hash Map?",
      options: ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
      correct: 0,
      explanation: "Hash maps provide amortized O(1) constant time operations assuming uniform hash distribution."
    },
    {
      id: 5,
      topic: "Sorting Algorithms",
      q: "Which sorting algorithm achieves O(N log N) time complexity in the worst case and is stable?",
      options: ["Quick Sort", "Merge Sort", "Bubble Sort", "Selection Sort"],
      correct: 1,
      explanation: "Merge Sort guarantees O(N log N) time across all cases and preserves relative order of equal keys."
    },
    {
      id: 6,
      topic: "Dynamic Programming",
      q: "What two essential properties must a problem exhibit to be solvable via Dynamic Programming?",
      options: [
        "Parallel threads and binary trees",
        "Optimal Substructure and Overlapping Subproblems",
        "Greedy choice and prime factorization",
        "Recursion and sorted inputs"
      ],
      correct: 1,
      explanation: "Dynamic programming memoizes solutions to overlapping subproblems that compose optimal global solutions."
    },
    {
      id: 7,
      topic: "Heaps",
      q: "In a Min-Heap of size N, what is the time complexity to extract the minimum element and re-heapify?",
      options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
      correct: 1,
      explanation: "Extracting the root takes O(1), but bubbling down the replacement element takes O(log N)."
    },
    {
      id: 8,
      topic: "Stacks & Queues",
      q: "Which data structure is most naturally suited to evaluate Reverse Polish Notation (Postfix) expressions?",
      options: ["Queue", "Stack", "Binary Search Tree", "Linked List"],
      correct: 1,
      explanation: "Postfix evaluation pushes operands onto a LIFO Stack and pops them when operators are encountered."
    },
    {
      id: 9,
      topic: "Graph Algorithms",
      q: "Dijkstra's single-source shortest path algorithm requires all graph edge weights to be:",
      options: ["Negative integers", "Non-negative (>= 0)", "Uniformly 1", "Floating point decimals"],
      correct: 1,
      explanation: "Dijkstra assumes non-negative edge weights; graphs with negative edges require the Bellman-Ford algorithm."
    },
    {
      id: 10,
      topic: "Bit Manipulation",
      q: "What does the bitwise expression '(n & (n - 1)) == 0' determine for a positive integer n?",
      options: [
        "Whether n is an odd number",
        "Whether n is an exact power of 2",
        "Whether n is divisible by 10",
        "Whether n is negative"
      ],
      correct: 1,
      explanation: "Powers of two have a single set bit; subtracting 1 flips all lower bits, resulting in 0 under bitwise AND."
    },
    {
      id: 11,
      topic: "Recursion & Call Stack",
      q: "What causes a 'Stack Overflow' error in recursive functions?",
      options: [
        "Allocating an array that is larger than 10MB",
        "Exceeding the call stack limit due to missing or unreachable base termination cases",
        "Using async/await inside loops",
        "Returning a boolean instead of an integer"
      ],
      correct: 1,
      explanation: "Unbounded recursion pushes stack frames continuously until memory reserved for the call stack is exhausted."
    },
    {
      id: 12,
      topic: "Linked Lists",
      q: "Which algorithm detects a cycle in a singly linked list in O(N) time and O(1) auxiliary space?",
      options: ["Binary Search", "Floyd's Cycle-Finding Algorithm (Tortoise and Hare)", "Kruskal's Algorithm", "Quick Select"],
      correct: 1,
      explanation: "Floyd's algorithm uses slow (1 step) and fast (2 steps) pointers to detect closed loops in O(1) space."
    },
    {
      id: 13,
      topic: "Space Complexity",
      q: "What is the auxiliary space complexity of an in-place Quick Sort algorithm?",
      options: ["O(1) strictly", "O(log N) for the recursive call stack", "O(N^2)", "O(2^N)"],
      correct: 1,
      explanation: "Even though Quick Sort sorts in-place without extra array allocations, its call stack consumes O(log N) space."
    },
    {
      id: 14,
      topic: "Trie (Prefix Tree)",
      q: "For which application is a Trie data structure optimal over a balanced BST?",
      options: [
        "Finding shortest paths between cities",
        "Prefix search, autocomplete, and dictionary word validation in O(L) time where L is word length",
        "Sorting floating point numbers",
        "Calculating standard deviation"
      ],
      correct: 1,
      explanation: "Tries provide O(L) lookup independent of dataset size N, making them ideal for search autocompletion."
    },
    {
      id: 15,
      topic: "Algorithm Design",
      q: "What is the time complexity of finding the K-th smallest element using QuickSelect on average?",
      options: ["O(N^2)", "O(N)", "O(N log N)", "O(K log N)"],
      correct: 1,
      explanation: "QuickSelect only recurses into one partition branch, achieving average linear O(N) time complexity."
    }
  ]
}

export function getQuestionsForRole(role) {
  return MILESTONE_QUESTIONS_BY_ROLE[role] || MILESTONE_QUESTIONS_BY_ROLE["Backend Developer"]
}

// ─── INITIAL 15-DAY TEST RESULTS GENERATOR ──────────────────────────────────
export function getInitial15DayTests(user, role) {
  const mentor = getMentorForRole(role)
  const internName = user?.fullName || user?.name || "Intern"
  return [
    {
      id: "milestone-15-sprint-1",
      milestone: "Day 15 Milestone Test (Sprint 1)",
      sprintNumber: 1,
      dayNumber: 15,
      role: role || "Backend Developer",
      internName,
      status: "Passed",
      score: 92,
      totalQuestions: 15,
      correctCount: 14,
      timeSpent: "14m 20s",
      grade: "A+",
      performanceLevel: "Outstanding",
      dateTaken: "Day 15 Milestone • Oct 28, 2026",
      evaluatedBy: mentor.name,
      mentorCompany: mentor.company,
      certificateId: `CERT-DAY15-${Math.abs(internName.split("").reduce((a,c)=>a+c.charCodeAt(0),0))}-92`,
      summary: `Exemplary performance! Demonstrated solid mastery over ${role} fundamentals, API architecture, and database operations. Strong analytical problem solving.`,
      breakdown: [
        { topic: "Core Architecture & APIs", score: 95, color: "#7C3AED" },
        { topic: "Implementation & Debugging", score: 92, color: "#06B6D4" },
        { topic: "Data Systems & Indexing", score: 90, color: "#10b981" },
        { topic: "Security & Best Practices", score: 91, color: "#f59e0b" },
      ],
      strengths: [
        "Precise comprehension of REST status codes and stateless authentication.",
        "Accurate query profiling and database index optimization understanding.",
        "Clean error boundary and asynchronous rejection handling."
      ],
      improvementAreas: [
        "Review edge-case token expiration refresh flows in production pipelines.",
        "Deepen familiarity with multi-stage containerization optimizations."
      ]
    },
    {
      id: "milestone-30-sprint-2",
      milestone: "Day 30 Mid-Term Assessment (Sprint 2)",
      sprintNumber: 2,
      dayNumber: 30,
      role: role || "Backend Developer",
      internName,
      status: "Upcoming",
      score: null,
      totalQuestions: 15,
      dateScheduled: "Day 30 Milestone • Nov 12, 2026",
      daysRemaining: 12,
      evaluatedBy: mentor.name,
      summary: "Sprint 2 Mid-term evaluation focusing on end-to-end integration, performance tuning, and service reliability.",
      breakdown: [],
      strengths: [],
      improvementAreas: []
    },
    {
      id: "milestone-45-sprint-3",
      milestone: "Day 45 Advanced Sprint Assessment",
      sprintNumber: 3,
      dayNumber: 45,
      role: role || "Backend Developer",
      internName,
      status: "Locked",
      score: null,
      totalQuestions: 15,
      dateScheduled: "Day 45 Milestone • Nov 27, 2026",
      summary: "Advanced systems architecture, distributed caching, and microservice scaling assessment.",
      breakdown: [],
    },
    {
      id: "milestone-60-sprint-4",
      milestone: "Day 60 Final Capstone & Technical Defense",
      sprintNumber: 4,
      dayNumber: 60,
      role: role || "Backend Developer",
      internName,
      status: "Locked",
      score: null,
      totalQuestions: 20,
      dateScheduled: "Day 60 Milestone • Dec 12, 2026",
      summary: "Comprehensive evaluation of all internship deliverables, capstone project demo, and industry readiness.",
      breakdown: [],
    }
  ]
}

// ─── INITIAL WEEKLY MENTOR FEEDBACK ─────────────────────────────────────────
export function getInitialWeeklyFeedback(user, role) {
  const mentor = getMentorForRole(role)
  const internName = user?.fullName || user?.name || "Intern"

  return [
    {
      id: "weekly-fb-w3",
      week: 3,
      period: "Week 3 (Days 15–21): Current Week Work Review",
      dateRange: "Oct 24, 2026 – Oct 30, 2026",
      mentorName: mentor.name,
      mentorRole: mentor.role,
      mentorCompany: mentor.company,
      mentorAvatar: mentor.avatar,
      mentorColor: mentor.color,
      rating: 4.9,
      status: "Exceeds Expectations",
      badge: "Top Performer ⭐",
      reviewedWork: [
        { task: "15-Day Milestone Test", result: "92% Score (Grade A+)" },
        { task: "Write API Documentation", result: "Completed & Approved (100%)" },
        { task: "Create Dashboard UI", result: "Reviewed with high UI precision" },
        { task: "Attendance & Journals", result: "100% On-time submissions" }
      ],
      mentorComment: `Outstanding work this week, ${internName}! Your 15-Day Milestone Test score of 92% is in the top 5% of this internship cohort. Your Swagger/OpenAPI documentation for the core services is thoroughly drafted and ready for frontend team consumption. Code quality is clean, and attendance is exemplary.`,
      keyStrengths: [
        "Exceptional 92% score on the Day 15 Sprint 1 Milestone Assessment.",
        "Comprehensive API documentation with exact request/response schemas.",
        "Consistent daily journal logs and high punctuality."
      ],
      nextWeekGoals: [
        "Prepare for the upcoming Sprint 2 Mid-Term project milestone.",
        "Implement automated integration test cases using Jest/Supertest."
      ],
      criteria: [
        { name: "Technical Execution", score: 98, weight: "30%" },
        { name: "Code Cleanliness & Docs", score: 96, weight: "25%" },
        { name: "Timeliness & Attendance", score: 100, weight: "25%" },
        { name: "Initiative & Teamwork", score: 94, weight: "20%" },
      ]
    },
    {
      id: "weekly-fb-w2",
      week: 2,
      period: "Week 2 (Days 8–14): Core API & Database Integration",
      dateRange: "Oct 17, 2026 – Oct 23, 2026",
      mentorName: mentor.name,
      mentorRole: mentor.role,
      mentorCompany: mentor.company,
      mentorAvatar: mentor.avatar,
      mentorColor: mentor.color,
      rating: 4.8,
      status: "Great Progress",
      badge: "High Velocity 🚀",
      reviewedWork: [
        { task: "Build Login API", result: "Merged with JWT authentication" },
        { task: "Integrate MongoDB", result: "Verified with indexing support" },
        { task: "Error Handling Middleware", result: "4-parameter standard compliant" }
      ],
      mentorComment: `Solid momentum on the authentication pipeline and database integration. The indexing on the user queries resulted in a measurable performance boost. Continue maintaining this level of modularity in your code controllers.`,
      keyStrengths: [
        "Well-structured bcrypt password salting and token payload signing.",
        "Effective asynchronous error catch blocks with unified error responses.",
        "Responsive to code review feedback on Git pull requests."
      ],
      nextWeekGoals: [
        "Focus on Swagger / OpenAPI documentation for all created endpoints.",
        "Complete preparations for the 15-day milestone test."
      ],
      criteria: [
        { name: "Technical Execution", score: 94, weight: "30%" },
        { name: "Code Cleanliness & Docs", score: 92, weight: "25%" },
        { name: "Timeliness & Attendance", score: 96, weight: "25%" },
        { name: "Initiative & Teamwork", score: 92, weight: "20%" },
      ]
    },
    {
      id: "weekly-fb-w1",
      week: 1,
      period: "Week 1 (Days 1–7): Foundation & Onboarding Setup",
      dateRange: "Oct 10, 2026 – Oct 16, 2026",
      mentorName: mentor.name,
      mentorRole: mentor.role,
      mentorCompany: mentor.company,
      mentorAvatar: mentor.avatar,
      mentorColor: mentor.color,
      rating: 4.7,
      status: "Strong Foundation",
      badge: "Quick Starter ⚡",
      reviewedWork: [
        { task: "Development Environment Setup", result: "Verified & Approved" },
        { task: "Repository & Branching Guidelines", result: "Configured cleanly" },
        { task: "Skill Specialization Alignment", result: `Aligned to ${role}` }
      ],
      mentorComment: `Welcome to the internship, ${internName}! You ramped up very quickly on our team's engineering workflows and directory conventions. Your initial setup task was verified without issues.`,
      keyStrengths: [
        "Smooth onboarding setup completed ahead of deadline.",
        "Proactive communication during team standup syncs.",
        "Clear documentation of environment variables in .env.example."
      ],
      nextWeekGoals: [
        "Begin development on the Core Authentication API endpoints.",
        "Review MongoDB schema design conventions."
      ],
      criteria: [
        { name: "Technical Execution", score: 90, weight: "30%" },
        { name: "Code Cleanliness & Docs", score: 92, weight: "25%" },
        { name: "Timeliness & Attendance", score: 98, weight: "25%" },
        { name: "Initiative & Teamwork", score: 95, weight: "20%" },
      ]
    }
  ]
}

// ─── STORAGE SYNC HELPERS ───────────────────────────────────────────────────
export function getSaved15DayTests(user, role) {
  try {
    const raw = localStorage.getItem(KEY_15_DAY_TESTS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  const initial = getInitial15DayTests(user, role)
  save15DayTests(initial)
  return initial
}

export function save15DayTests(tests) {
  try {
    localStorage.setItem(KEY_15_DAY_TESTS, JSON.stringify(tests))
    window.dispatchEvent(new CustomEvent(KEY_15_DAY_TESTS, { detail: tests }))
  } catch {}
}

export function record15DayTestSubmission(testResult) {
  try {
    const current = getSaved15DayTests()
    const updated = current.map(t => {
      if (t.id === testResult.id || t.sprintNumber === testResult.sprintNumber) {
        return { ...t, ...testResult, status: "Passed" }
      }
      return t
    })
    save15DayTests(updated)
    return updated
  } catch {
    return []
  }
}

export function getSavedWeeklyFeedback(user, role) {
  try {
    const raw = localStorage.getItem(KEY_WEEKLY_FEEDBACK)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  const initial = getInitialWeeklyFeedback(user, role)
  saveWeeklyFeedback(initial)
  return initial
}

export function saveWeeklyFeedback(feedbackList) {
  try {
    localStorage.setItem(KEY_WEEKLY_FEEDBACK, JSON.stringify(feedbackList))
    window.dispatchEvent(new CustomEvent(KEY_WEEKLY_FEEDBACK, { detail: feedbackList }))
  } catch {}
}
