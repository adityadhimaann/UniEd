# 🏗️ UniEd LMS - Complete Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Browser    │  │  Mobile App  │  │   Desktop    │             │
│  │   (React)    │  │ (React Native)│  │   (Electron) │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                  │                  │                      │
│         └──────────────────┼──────────────────┘                      │
│                            │                                         │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
                             │ HTTPS / WebSocket
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                      API GATEWAY / LOAD BALANCER                      │
│                         (Render / Nginx)                              │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                         BACKEND SERVER                                │
│                      (Node.js + Express.js)                           │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE LAYER                          │   │
│  │                                                               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │  CORS    │  │  Helmet  │  │   Rate   │  │  Morgan  │   │   │
│  │  │          │  │ Security │  │  Limiter │  │  Logger  │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  │                                                               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │   Auth   │  │   Role   │  │ Validate │  │  Upload  │   │   │
│  │  │   JWT    │  │  Check   │  │   Joi    │  │  Multer  │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      ROUTES LAYER                            │   │
│  │                                                               │   │
│  │  /api/v1/auth              /api/v1/quizzes ✨NEW             │   │
│  │  /api/v1/courses           /api/v1/discussions ✨NEW         │   │
│  │  /api/v1/assignments       /api/v1/live-sessions ✨NEW       │   │
│  │  /api/v1/grades            /api/v1/progress ✨NEW            │   │
│  │  /api/v1/attendance        /api/v1/materials ✨NEW           │   │
│  │  /api/v1/messages          /api/v1/instructor                │   │
│  │  /api/v1/announcements     /api/v1/student                   │   │
│  │  /api/v1/reviews           /api/v1/oauth                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   CONTROLLER LAYER                           │   │
│  │                                                               │   │
│  │  authController         quizController ✨NEW                 │   │
│  │  courseController       discussionController ✨NEW           │   │
│  │  assignmentController   liveSessionController ✨NEW          │   │
│  │  gradeController        progressController ✨NEW             │   │
│  │  attendanceController   courseMaterialController ✨NEW       │   │
│  │  messageController      instructorController                 │   │
│  │  announcementController studentController                    │   │
│  │  reviewController       enrollmentController                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     SERVICE LAYER                            │   │
│  │                    (Business Logic)                          │   │
│  │                                                               │   │
│  │  authService            quizService ✨NEW                    │   │
│  │  emailService           discussionService ✨NEW              │   │
│  │  notificationService    liveSessionService ✨NEW             │   │
│  │  instructorService      progressService ✨NEW                │   │
│  │  studentService         courseMaterialService ✨NEW          │   │
│  │  messageService         reviewService                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SOCKET.IO LAYER                           │   │
│  │                   (Real-time Events)                         │   │
│  │                                                               │   │
│  │  • Notifications        • Live Sessions ✨NEW                │   │
│  │  • Messages             • Discussion Updates ✨NEW           │   │
│  │  • Attendance           • Quiz Submissions ✨NEW             │   │
│  │  • Announcements        • Progress Updates ✨NEW             │   │
│  │  • Online Status        • Certificate Issued ✨NEW           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                        DATA LAYER                                     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    MONGODB DATABASE                          │   │
│  │                                                               │   │
│  │  Existing Collections:                                       │   │
│  │  • users                • enrollments                        │   │
│  │  • courses              • assignments                        │   │
│  │  • grades               • attendance                         │   │
│  │  • announcements        • messages                           │   │
│  │  • notifications        • reviews                            │   │
│  │  • courseenrollmentrequests                                  │   │
│  │                                                               │   │
│  │  New Collections: ✨                                         │   │
│  │  • quizzes              • progresses                         │   │
│  │  • discussions          • certificates                       │   │
│  │  • livesessions         • coursematerials                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      REDIS CACHE                             │   │
│  │                                                               │   │
│  │  • Session Storage      • Rate Limiting                      │   │
│  │  • Cache Layer          • Real-time Data                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                  │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Cloudinary  │  │    OAuth     │  │    Email     │             │
│  │ File Storage │  │ Google/MS    │  │  Nodemailer  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │     Zoom     │  │ Google Meet  │  │  MS Teams    │             │
│  │  Live Class  │  │  Live Class  │  │  Live Class  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Feature Architecture

### 1. Quiz System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      QUIZ SYSTEM                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Student Flow:                                               │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │Browse│→ │Start │→ │Answer│→ │Submit│→ │Result│         │
│  │Quiz  │  │Attempt│  │Ques. │  │Quiz  │  │Score │         │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘         │
│                                                              │
│  Faculty Flow:                                               │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                   │
│  │Create│→ │Publish│→ │Monitor│→ │Stats │                   │
│  │Quiz  │  │Quiz  │  │Attempts│  │Analytics│                │
│  └──────┘  └──────┘  └──────┘  └──────┘                   │
│                                                              │
│  Auto-grading Engine:                                        │
│  ┌────────────────────────────────────────────┐             │
│  │ MCQ → Compare answer → Award points        │             │
│  │ True/False → Compare → Award points        │             │
│  │ Short Answer → Normalize → Compare → Award│             │
│  │ Essay → Manual grading required            │             │
│  └────────────────────────────────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Discussion Forum Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   DISCUSSION FORUM                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Thread Structure:                                           │
│  ┌──────────────────────────────────────────┐               │
│  │ Discussion (Root)                        │               │
│  │  ├─ Reply 1                              │               │
│  │  │   ├─ Like (User1, User2)              │               │
│  │  │   └─ Timestamp                        │               │
│  │  ├─ Reply 2                              │               │
│  │  │   ├─ Like (User3)                     │               │
│  │  │   └─ Timestamp                        │               │
│  │  └─ Reply 3                              │               │
│  │      └─ Timestamp                        │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
│  Features:                                                   │
│  • Pin (Faculty) → Stays at top                             │
│  • Lock (Faculty) → No new replies                          │
│  • Like → Engagement tracking                               │
│  • Tags → Organization                                      │
│  • Attachments → File support                               │
│  • Real-time → Socket.IO updates                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. Live Session Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LIVE SESSION                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Session Lifecycle:                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │Schedule│→│Remind│→│Start │→│Live  │→│End   │         │
│  │Session │  │Users │  │Session│  │Class │  │Session│         │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘         │
│                                                              │
│  Participant Tracking:                                       │
│  ┌────────────────────────────────────────┐                 │
│  │ User joins → Record join time          │                 │
│  │ User active → Track duration           │                 │
│  │ User leaves → Record leave time        │                 │
│  │ Calculate → Total duration             │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
│  Integration:                                                │
│  ┌──────┐  ┌──────┐  ┌──────┐                              │
│  │ Zoom │  │Google│  │  MS  │                              │
│  │      │  │ Meet │  │Teams │                              │
│  └──────┘  └──────┘  └──────┘                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4. Progress Tracking Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  PROGRESS TRACKING                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Progress Calculation:                                       │
│  ┌────────────────────────────────────────┐                 │
│  │ Module Progress (33%)                  │                 │
│  │  ├─ Module 1: 100% ✓                   │                 │
│  │  ├─ Module 2: 50%                      │                 │
│  │  └─ Module 3: 0%                       │                 │
│  │                                        │                 │
│  │ Assignment Progress (33%)              │                 │
│  │  ├─ Completed: 4/5 (80%)               │                 │
│  │  └─ Average Grade: 85%                 │                 │
│  │                                        │                 │
│  │ Quiz Progress (33%)                    │                 │
│  │  ├─ Completed: 2/3 (67%)               │                 │
│  │  └─ Average Score: 90%                 │                 │
│  │                                        │                 │
│  │ Overall Progress: 75%                  │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
│  Certificate Trigger:                                        │
│  Progress ≥ 100% → Auto-issue certificate                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Quiz Submission Flow

```
Student                Backend              Database           Socket.IO
   │                      │                    │                  │
   │  Start Attempt       │                    │                  │
   ├─────────────────────►│                    │                  │
   │                      │  Create Attempt    │                  │
   │                      ├───────────────────►│                  │
   │  Attempt Started     │                    │                  │
   │◄─────────────────────┤                    │                  │
   │                      │                    │                  │
   │  Submit Answers      │                    │                  │
   ├─────────────────────►│                    │                  │
   │                      │  Auto-grade        │                  │
   │                      │  Calculate Score   │                  │
   │                      │  Update Attempt    │                  │
   │                      ├───────────────────►│                  │
   │                      │  Update Progress   │                  │
   │                      ├───────────────────►│                  │
   │                      │                    │  Notify Student  │
   │                      │                    │─────────────────►│
   │  Results + Grade     │                    │                  │
   │◄─────────────────────┤                    │                  │
   │                      │                    │                  │
```

### Live Session Flow

```
Instructor            Backend              Students           Socket.IO
   │                      │                    │                  │
   │  Create Session      │                    │                  │
   ├─────────────────────►│                    │                  │
   │                      │  Save Session      │                  │
   │                      │  Notify Students   │                  │
   │                      │                    │◄─────────────────┤
   │                      │                    │  Notification    │
   │  Start Session       │                    │                  │
   ├─────────────────────►│                    │                  │
   │                      │  Update Status     │                  │
   │                      │  Broadcast Start   │                  │
   │                      │                    │◄─────────────────┤
   │                      │                    │  Session Live    │
   │                      │  Student Joins     │                  │
   │                      │◄───────────────────┤                  │
   │                      │  Track Join        │                  │
   │                      │  Broadcast Join    │                  │
   │◄─────────────────────┤                    │◄─────────────────┤
   │  Participant List    │                    │  User Joined     │
   │                      │                    │                  │
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Network Security                                   │
│  ┌────────────────────────────────────────┐                 │
│  │ • HTTPS/TLS                            │                 │
│  │ • CORS Configuration                   │                 │
│  │ • Rate Limiting (100 req/15min)        │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
│  Layer 2: Authentication                                     │
│  ┌────────────────────────────────────────┐                 │
│  │ • JWT Access Token (15 min)            │                 │
│  │ • JWT Refresh Token (7 days)           │                 │
│  │ • OAuth (Google, Microsoft)            │                 │
│  │ • Password Hashing (bcrypt)            │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
│  Layer 3: Authorization                                      │
│  ┌────────────────────────────────────────┐                 │
│  │ • Role-based Access Control            │                 │
│  │ • Permission Checking                  │                 │
│  │ • Ownership Validation                 │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
│  Layer 4: Data Security                                      │
│  ┌────────────────────────────────────────┐                 │
│  │ • Input Validation (Joi)               │                 │
│  │ • XSS Protection                       │                 │
│  │ • MongoDB Injection Prevention         │                 │
│  │ • File Upload Validation               │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (Vercel)                                           │
│  ┌────────────────────────────────────────┐                 │
│  │ • React App                            │                 │
│  │ • CDN Distribution                     │                 │
│  │ • Auto-deploy from Git                 │                 │
│  │ • Environment Variables                │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
│  Backend (Render)                                            │
│  ┌────────────────────────────────────────┐                 │
│  │ • Node.js Server                       │                 │
│  │ • Auto-deploy from Git                 │                 │
│  │ • Environment Variables                │                 │
│  │ • Health Checks                        │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
│  Database (MongoDB Atlas)                                    │
│  ┌────────────────────────────────────────┐                 │
│  │ • Managed MongoDB                      │                 │
│  │ • Automatic Backups                    │                 │
│  │ • Scaling                              │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
│  Storage (Cloudinary)                                        │
│  ┌────────────────────────────────────────┐                 │
│  │ • File Storage                         │                 │
│  │ • Image Optimization                   │                 │
│  │ • CDN Delivery                         │                 │
│  └────────────────────────────────────────┘                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                  OPTIMIZATION STRATEGIES                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Database Level:                                             │
│  • Indexes on frequently queried fields                     │
│  • Compound indexes for complex queries                     │
│  • Aggregation pipelines for analytics                      │
│                                                              │
│  Application Level:                                          │
│  • Redis caching for frequent data                          │
│  • Pagination for large datasets                            │
│  • Lazy loading for resources                               │
│  • Connection pooling                                        │
│                                                              │
│  Frontend Level:                                             │
│  • Code splitting                                            │
│  • Image optimization                                        │
│  • Lazy loading components                                   │
│  • Service workers (PWA ready)                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Architecture Status: ✅ Production Ready**

This architecture supports:
- ✅ Horizontal scaling
- ✅ High availability
- ✅ Real-time features
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Monitoring & logging
