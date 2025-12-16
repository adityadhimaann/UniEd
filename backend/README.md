# UniEd Backend API

> Backend API for UniEd - Unified Education Platform

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Cache**: Redis
- **Storage**: Cloudinary
- **Authentication**: JWT (Access & Refresh Tokens)
- **Validation**: Joi
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # MongoDB models
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── middlewares/     # Express middlewares
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── socket/          # Socket.io handlers
│   └── app.js           # Express app setup
├── uploads/             # File uploads directory
├── tests/               # Test files
├── .env                 # Environment variables
├── server.js            # Entry point
└── package.json
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Redis (optional but recommended)

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB:**
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

4. **Start Redis (optional):**
   ```bash
   # macOS (with Homebrew)
   brew services start redis

   # Or use Docker
   docker run -d -p 6379:6379 --name redis redis
   ```

5. **Run the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/unied |
| `JWT_SECRET` | Access token secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `REDIS_URL` | Redis connection URL | redis://localhost:6379 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |

## 🌐 API Endpoints

### Base URL: `/api/v1`

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login user | ❌ |
| POST | `/logout` | Logout user | ✅ |
| POST | `/refresh-token` | Refresh access token | ❌ |
| GET | `/profile` | Get current user profile | ✅ |
| POST | `/forgot-password` | Send password reset email | ❌ |
| POST | `/reset-password` | Reset password | ❌ |
| GET | `/verify-email` | Verify email address | ❌ |

### Users (`/users`) - Coming Soon

### Courses (`/courses`) - Coming Soon

### Assignments (`/assignments`) - Coming Soon

### Grades (`/grades`) - Coming Soon

### Attendance (`/attendance`) - Coming Soon

### Announcements (`/announcements`) - Coming Soon

### Messages (`/messages`) - Coming Soon

## 🔐 Authentication

### JWT Strategy

The API uses a dual-token authentication system:

1. **Access Token** (15 minutes)
   - Short-lived token for API requests
   - Stored in memory on the client
   - Includes: `userId`, `email`, `role`

2. **Refresh Token** (7 days)
   - Long-lived token for getting new access tokens
   - Stored in database
   - Should be stored securely (httpOnly cookie recommended)

### Usage Example

```javascript
// Login
POST /api/v1/auth/login
{
  "email": "student@unied.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}

// Use access token in subsequent requests
GET /api/v1/auth/profile
Headers: {
  "Authorization": "Bearer <accessToken>"
}
```

## 👥 Role-Based Access Control (RBAC)

### Roles & Permissions

**Student:**
- read:own-profile, update:own-profile
- read:courses, enroll:courses
- submit:assignments, read:own-grades
- send:messages, read:announcements

**Faculty:**
- read:all-profiles
- create:courses, create:assignments
- grade:assignments, mark:attendance
- create:announcements, read:analytics

**Admin:**
- all:permissions
- manage:users, manage:courses
- system:settings

## 📊 Database Models

- **User**: Authentication & user profiles
- **Course**: Course information
- **Enrollment**: Student-course relationships
- **Assignment**: Assignments & submissions
- **Grade**: Student grades & GPA
- **Attendance**: Class attendance records
- **Announcement**: System announcements
- **Message**: User-to-user messaging
- **Notification**: User notifications

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 API Response Format

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **JWT**: Secure authentication
- **Password Hashing**: bcrypt
- **Input Validation**: Joi schemas
- **File Upload Limits**: 5MB max

## 🚦 Health Check

```bash
GET /health

Response:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-12T10:30:00.000Z"
}
```

## 📦 NPM Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm test        # Run tests
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License

ISC
