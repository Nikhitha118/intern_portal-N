# InternPortal — Full Stack Setup Guide

## Project Structure
```
intern-portal/
├── client/                     ← Next.js Frontend
│   ├── public/                 ← Static assets (videos, images)
│   ├── src/
│   │   ├── app/                ← App Router pages & layouts
│   │   │   ├── admin/
│   │   │   ├── api/
│   │   │   ├── evaluation/
│   │   │   ├── institution/
│   │   │   ├── intern/
│   │   │   ├── login/
│   │   │   ├── mentor/
│   │   │   ├── signup/
│   │   │   ├── globals.css
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx
│   │   │   └── providers.jsx
│   │   ├── components/         ← Reusable UI and dashboard components
│   │   ├── hooks/              ← Custom React hooks
│   │   └── lib/                ← API client, utilities, and sync helpers
│   ├── components.json         ← Shadcn UI configuration
│   ├── next.config.mjs         ← Next.js configuration
│   ├── package.json
│   └── tsconfig.json
│
├── server/                     ← Flask + MongoDB Backend
│   ├── models/                 ← MongoDB models (user, task, journal, attendance, calendar, etc.)
│   ├── admin/                  ← Admin portal routes
│   ├── evaluation/             ← Evaluation portal routes
│   ├── institution/            ← Institution portal routes
│   ├── intern/                 ← Intern portal routes
│   ├── mentor/                 ← Mentor portal routes
│   ├── shared/                 ← Shared routes (auth, ai, messages, mentors)
│   ├── middleware/             ← Auth & validation middleware
│   ├── config/                 ← MongoDB database connection
│   ├── app.py                  ← Main Flask app entry point
│   ├── requirements.txt        ← Python dependencies
│   ├── seed_accounts.py        ← Seed test accounts
│   ├── seed_demo.py            ← Seed demo user data
│   └── reset_and_seed.py       ← Reset and reseed databases
│
├── .gitignore
└── README.md
```

---

## 1. Start the Backend (Flask)

```bash
cd server

# Install Python dependencies
pip install -r requirements.txt

# Run the server
python app.py
```
Backend runs at: **http://localhost:5000**

---

## 2. Start the Frontend (Next.js)

```bash
cd client

# Install dependencies
npm install

# Run development server
npm run dev
```
Frontend runs at: **http://localhost:3000**

---

## 3. Backend API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login + get JWT token |
| GET | /auth/profile/:id | Get user profile |
| PUT | /auth/profile/:id | Update profile |
| GET | /intern/tasks/?userId= | Get all tasks |
| POST | /intern/tasks/ | Create task |
| PUT | /intern/tasks/:id | Update task |
| DELETE | /intern/tasks/:id | Delete task |
| PATCH | /intern/tasks/:id/status | Update task status |
| POST | /intern/attendance/checkin | Check in |
| PATCH | /intern/attendance/checkout/:id | Check out |
| GET | /intern/attendance/all?userId= | Get attendance records |
| GET | /intern/attendance/stats?userId= | Get attendance stats |
| GET | /intern/journals/?userId= | Get all journals |
| POST | /intern/journals/ | Create journal |
| POST | /intern/journals/:id/comment | Add mentor comment |
| GET | /mentors/all | Get all mentors |
| POST | /mentors/connect/:id | Connect with mentor |
| POST | /messages/send | Send message |
| GET | /messages/conversation | Get chat between 2 users |
| GET | /messages/conversations/:userId | Get all conversations |
| GET | /intern/calendar/all?userId= | Get events |
| POST | /intern/calendar/add | Add event |
| GET | /intern/calendar/upcoming | Get upcoming events |
| GET | /intern/settings/:userId | Get settings |
| PUT | /intern/settings/:userId | Update settings |

---

## 4. MongoDB
Make sure MongoDB is running locally:
```bash
mongod
```
Or update `MONGO_URI` in `server/.env` to use MongoDB Atlas.