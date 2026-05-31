# EduConnect — MERN Stack Educational Platform

A full-stack, role-based educational platform built with **MongoDB, Express.js, React, and Node.js**.

## 🏗️ Project Structure

```
educonnect/
├── server/                  # Node.js + Express REST API
│   ├── server.js
│   ├── .env
│   └── src/
│       ├── models/          # Mongoose schemas
│       │   ├── User.js
│       │   ├── Course.js
│       │   ├── Assignment.js
│       │   ├── Submission.js
│       │   ├── Announcement.js
│       │   └── Enrollment.js
│       ├── routes/          # REST API routes
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── course.routes.js
│       │   ├── assignment.routes.js
│       │   ├── submission.routes.js
│       │   ├── announcement.routes.js
│       │   └── enrollment.routes.js
│       └── middleware/
│           └── auth.middleware.js
└── client/                  # React SPA
    └── src/
        ├── context/         # AuthContext (JWT state)
        ├── hooks/           # useApi custom hook
        ├── components/      # Reusable components
        └── pages/           # Route-level page components
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js >= 18
- MongoDB (local or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/SananAbid/EduConnect.git
cd EduConnect
```

### 2. Server Setup
```bash
cd server
npm install
```

Create `.env` in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/educonnect
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Start the server:
```bash
npm run dev
```

### 3. Client Setup
```bash
cd ../client
npm install
npm start
```

The React app runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

## 👥 User Roles

| Role    | Capabilities |
|---------|-------------|
| **Student** | Browse/enroll in courses, submit assignments, view grades & announcements |
| **Teacher** | Create/manage courses, post assignments, grade submissions, post announcements |
| **Admin**   | Full access: manage all users, roles, courses, system-wide announcements |

## 🔗 API Endpoints Summary

| Module        | Base URL              |
|---------------|-----------------------|
| Auth          | `/api/auth`           |
| Users         | `/api/users`          |
| Courses       | `/api/courses`        |
| Assignments   | `/api/assignments`    |
| Submissions   | `/api/submissions`    |
| Announcements | `/api/announcements`  |
| Enrollments   | `/api/enrollments`    |

## 🔐 Authentication
- JWT-based authentication
- Token stored in `localStorage`
- All protected routes require `Authorization: Bearer <token>` header

## 🧰 Tech Stack
- **Frontend:** React 18, React Router v6, Context API, Fetch API
- **Backend:** Node.js, Express.js, Mongoose, JWT, bcryptjs
- **Database:** MongoDB
- **Validation:** express-validator
