<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6C3DE8,100:00B4D8&height=200&section=header&text=UniEd&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=Unified%20Education%20Platform&descAlignY=60&descSize=20&descColor=ffffff" width="100%"/>

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-uniedplatform.vercel.app-6C3DE8?style=for-the-badge&logoColor=white)](https://uniedplatform.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-69.5%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://github.com/adityadhimaann/UniEd)
[![JavaScript](https://img.shields.io/badge/JavaScript-29.7%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://github.com/adityadhimaann/UniEd)
[![Commits](https://img.shields.io/badge/Commits-154-00B4D8?style=for-the-badge&logo=git&logoColor=white)](https://github.com/adityadhimaann/UniEd/commits/main)
[![Stars](https://img.shields.io/github/stars/adityadhimaann/UniEd?style=for-the-badge&color=FFD700&logo=github)](https://github.com/adityadhimaann/UniEd/stargazers)

<br/>

> **UniEd** is a production-grade, full-stack EdTech platform that eliminates the fragmentation problem in online education — bringing courses, live classes, assignments, grades, attendance, and AI-powered assessments into one unified system.

<br/>

</div>

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🔌 API Reference](#-api-reference)
- [🤖 AI Features](#-ai-features)
- [📡 Real-Time Systems](#-real-time-systems)
- [🌍 Deployment](#-deployment)
- [📈 Impact & Metrics](#-impact--metrics)
- [🙌 Author](#-author)

---

## 🎯 Overview

Students today juggle 5–7 different tools for their education — one for video calls, one for assignments, another for grades, another for messaging. **UniEd solves this completely.**

Built as a **real production system** (not a course project), UniEd handles:

- ✅ Student registration & course enrollment
- ✅ Live lecture streaming (WebRTC)
- ✅ Real-time 1:1 messaging for doubt resolution (Socket.IO)
- ✅ Attendance tracking & assignment management
- ✅ Centralized grading & performance dashboards
- ✅ AI-powered interview simulation & automated feedback
- ✅ Role-based access for Students and Faculty

---

## ✨ Features

### 👨‍🎓 Student Portal
| Feature | Description |
|---|---|
| **Course Discovery & Enrollment** | Browse catalogue, enroll in courses, track progress |
| **Live Lectures** | WebRTC-powered real-time video streaming from faculty |
| **1:1 Messaging** | Socket.IO instant messaging for doubt resolution |
| **Attendance Dashboard** | View attendance records and alerts |
| **Assignment Submission** | Submit, track deadlines, view grades |
| **AI Interview Simulator** | Real-time mock interviews with automated feedback |
| **Performance Analytics** | Personalized analytics on grades and engagement |

### 👩‍🏫 Faculty Portal
| Feature | Description |
|---|---|
| **Class Management** | Create and manage courses, upload materials |
| **Live Streaming** | Broadcast live lectures to enrolled students |
| **Attendance Marking** | Mark and export attendance in real-time |
| **Assignment Management** | Create assignments, set deadlines, grade submissions |
| **Grade Centre** | Centralized grading with bulk operations |
| **Student Analytics** | Track individual and cohort performance |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│         React.js + TypeScript + Tailwind CSS            │
│    [Student Portal]    [Faculty Portal]    [Admin]      │
└────────────────────┬───────────────────────────────────-┘
                     │ REST APIs + WebSocket
┌────────────────────▼────────────────────────────────────┐
│                   BACKEND LAYER                         │
│              Node.js + Express.js                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Auth    │  │ Courses  │  │ Grades   │  │  AI    │  │
│  │ Service  │  │ Service  │  │ Service  │  │ Engine │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │         WebRTC Signaling + Socket.IO Server      │   │
│  └──────────────────────────────────────────────────┘   │
└──────────┬──────────────────┬───────────────────────────┘
           │                  │
┌──────────▼───────┐  ┌───────▼──────────┐
│    PostgreSQL     │  │    MongoDB        │
│  (Relational:     │  │  (Documents:      │
│  users, grades,   │  │  content, chats,  │
│  enrollment)      │  │  assignments)     │
└──────────────────┘  └──────────────────┘
           │
┌──────────▼───────────────────┐
│    Google Cloud Platform     │
│    (Hosting + Storage)       │
└──────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React.js-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=flat-square&logo=webrtc&logoColor=white)

### Backend
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=flat-square&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white)

### Databases
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)

### Cloud & DevOps
![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

### AI & ML
![OpenAI](https://img.shields.io/badge/Generative_AI-412991?style=flat-square&logo=openai&logoColor=white)

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.x
npm >= 9.x
PostgreSQL >= 14
MongoDB >= 6
```

### 1. Clone the Repository

```bash
git clone https://github.com/adityadhimaann/UniEd.git
cd UniEd
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/unied

# MongoDB
MONGO_URI=mongodb://localhost:27017/unied

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Google Cloud
GCP_PROJECT_ID=your_gcp_project_id
GCP_BUCKET_NAME=your_bucket_name

# AI
GEMINI_API_KEY=your_gemini_api_key
```

```bash
# Run database migrations
npm run migrate

# Start backend server
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

```bash
npm run dev
```

### 4. Open in Browser

```
Frontend:  http://localhost:5173
Backend:   http://localhost:5000
```

---

## � Running with Docker

You can run the UniEd backend using Docker for a more consistent environment.

### 1. Build the Backend Image
From the root directory:
```bash
cd backend
docker build -t unied-backend .
```

### 2. Run the Backend Container
Make sure your `.env` file is ready in the `backend` folder and run:
```bash
docker run -p 5000:5000 --env-file .env unied-backend
```

*Note: If your database is running on your Mac (outside the container), update your `MONGODB_URI` or `DATABASE_URL` in `.env` to use `host.docker.internal` instead of `localhost`.*

---

## �📁 Project Structure

```
UniEd/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Buttons, inputs, cards
│   │   │   ├── dashboard/    # Dashboard widgets
│   │   │   ├── video/        # WebRTC video components
│   │   │   └── chat/         # Messaging UI
│   │   ├── pages/
│   │   │   ├── student/      # Student portal pages
│   │   │   ├── faculty/      # Faculty portal pages
│   │   │   └── auth/         # Login, register
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Global state (Auth, Socket)
│   │   ├── services/         # API service layer
│   │   └── utils/            # Helpers & constants
│   └── public/
│
└── backend/
    ├── src/
    │   ├── controllers/      # Route handlers
    │   ├── services/         # Business logic layer
    │   ├── models/           # DB schemas (Mongoose + Sequelize)
    │   ├── routes/           # Express route definitions
    │   ├── middleware/        # Auth, error handling, validation
    │   ├── socket/           # Socket.IO event handlers
    │   ├── webrtc/           # WebRTC signaling logic
    │   └── ai/               # AI assessment engine
    ├── prisma/               # PostgreSQL migrations
    └── config/               # DB connections, env config
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user (student/faculty) |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET`  | `/api/auth/me` | Get current authenticated user |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/courses` | Get all available courses |
| `POST` | `/api/courses` | Create a new course (faculty) |
| `POST` | `/api/courses/:id/enroll` | Enroll in a course (student) |
| `GET`  | `/api/courses/:id/students` | Get enrolled students |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/attendance/mark` | Mark attendance for a session |
| `GET`  | `/api/attendance/:courseId` | Get attendance records |

### Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/assignments` | Create assignment (faculty) |
| `POST` | `/api/assignments/:id/submit` | Submit assignment (student) |
| `PATCH`| `/api/assignments/:id/grade` | Grade a submission (faculty) |

### AI Assessment
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/interview/start` | Start AI interview session |
| `POST` | `/api/ai/interview/respond` | Submit answer, get next question |
| `GET`  | `/api/ai/interview/:id/report` | Get full assessment report |

---

## 🤖 AI Features

### AI Interview Simulator

UniEd includes a built-in AI-powered interview and assessment engine:

```
Student starts session
        │
        ▼
AI generates personalized question
based on course topic + student level
        │
        ▼
Student responds (text/voice)
        │
        ▼
AI evaluates: accuracy, depth, clarity
        │
        ▼
Real-time feedback + follow-up question
        │
        ▼
Session ends → Full performance report
with scores, weak areas, recommendations
```

**Capabilities:**
- 🧠 Adaptive questioning based on response quality
- 📊 Automated scoring across multiple dimensions
- 💬 Natural language feedback generation
- 📈 Session-over-session progress tracking
- 🎯 Topic-specific drill-down assessment

---

## 📡 Real-Time Systems

### Live Lecture Streaming (WebRTC)

```
Faculty (Broadcaster)
        │
        │ Offer SDP
        ▼
  Signaling Server (Node.js)
        │
        │ Answer SDP + ICE Candidates
        ▼
Students (Viewers) ←──── P2P Media Stream
```

- Faculty initiates broadcast → signaling server creates room
- Students join room → WebRTC peer connections established
- Low-latency video/audio streamed directly peer-to-peer
- Fallback to TURN server for restricted network environments

### 1:1 Messaging (Socket.IO)

```javascript
// Real-time events
socket.on('message:send',   handleNewMessage)
socket.on('message:read',   handleReadReceipt)
socket.on('user:typing',    handleTypingIndicator)
socket.on('user:online',    handlePresenceUpdate)
```

- Persistent message history in MongoDB
- Read receipts and typing indicators
- Online/offline presence tracking
- File and image sharing support

---

## 🌍 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
vercel --prod
```

Live at: **[uniedplatform.vercel.app](https://uniedplatform.vercel.app)**

### Backend → Google Cloud Platform

```bash
# Build Docker image
docker build -t unied-backend .

# Deploy to GCP Cloud Run
gcloud run deploy unied-backend \
  --image gcr.io/PROJECT_ID/unied-backend \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```

---

## 📈 Impact & Metrics

| Metric | Value |
|--------|-------|
| **Real-time concurrent users supported** | Multiple simultaneous sessions |
| **Latency (API responses)** | < 200ms average |
| **Live streaming** | WebRTC peer-to-peer, sub-second latency |
| **Database design** | Dual DB — PostgreSQL + MongoDB |
| **Codebase** | 154 commits, TypeScript-first |
| **Deployment** | Live on Vercel + GCP |

---

## 🙌 Author

<div align="center">

**Aditya Kumar**

[![Portfolio](https://img.shields.io/badge/Portfolio-adidev.works-6C3DE8?style=for-the-badge&logo=firefox&logoColor=white)](https://www.adidev.works)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-adityadhimaann-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/adityadhimaann)
[![GitHub](https://img.shields.io/badge/GitHub-adityadhimaann-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/adityadhimaann)
[![Email](https://img.shields.io/badge/Email-dhimanaditya56@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:dhimanaditya56@gmail.com)

*Final-year CSE student at Lovely Professional University | Full-Stack Developer | AI Builder*

*Top 15 / 25,000+ — Finarva AI Hackathon (Gromo × AWS × Sarvam AI)*

</div>

---

<div align="center">

If you found this project useful, please consider giving it a ⭐ — it helps others discover it!

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00B4D8,100:6C3DE8&height=100&section=footer" width="100%"/>

</div>
