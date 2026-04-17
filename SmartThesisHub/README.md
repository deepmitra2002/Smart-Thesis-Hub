# 🎓 Smart Thesis Hub
### Intelligent University Project & Supervisor Management System
**Daffodil International University (DIU)**

---

## 📁 Project Structure

```
SmartThesisHub/
├── frontend/               # React.js Frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components (Dashboard, Supervisors, etc.)
│       ├── context/        # React Context (Auth, State)
│       ├── hooks/          # Custom React hooks
│       ├── utils/          # API helpers, constants
│       └── App.js
├── backend/                # Node.js + Express Backend
│   ├── routes/             # API route definitions
│   ├── controllers/        # Business logic
│   ├── models/             # Mongoose models
│   ├── middleware/         # Auth, error handling
│   ├── config/             # DB config, env
│   └── server.js
├── database/               # MongoDB schemas & seed data
│   ├── seed.js             # Database seeder
│   └── schema.md           # Schema documentation
├── docs/                   # SRS & API documentation
│   ├── srs-document.html   # Full SRS Document
│   └── api-docs.md         # API Reference
├── standalone/             # Standalone HTML (no setup needed)
│   ├── smart-thesis-hub-v2.html   # Full app (open directly in browser)
│   └── smart-thesis-hub-v1.html
└── README.md
```

---

## 🚀 Quick Start (Two Options)

### Option A — Standalone (Instant, No Setup)
```bash
# Just open in your browser — no installation needed!
open standalone/smart-thesis-hub-v2.html
```

### Option B — Full Stack (React + Node.js + MongoDB)

#### Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB v6+ → https://www.mongodb.com/try/download/community
- Git → https://git-scm.com

#### Step 1 — Install Dependencies
```bash
npm run install:all
```

#### Step 2 — Configure Environment
```bash
# Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env and set:
MONGO_URI=mongodb://localhost:27017/smart_thesis_hub
JWT_SECRET=your_super_secret_key_here
SENDGRID_API_KEY=your_sendgrid_key (optional)
```

#### Step 3 — Seed Database
```bash
cd backend
npm run seed
```

#### Step 4 — Run Development Server
```bash
# From root directory — runs both frontend & backend
npm run dev
```

#### Step 5 — Open Browser
```
Frontend → http://localhost:3000
Backend API → http://localhost:5000
API Docs → http://localhost:5000/api-docs
```

---

## 🔐 Demo Credentials

| Role | Email | Password | Special |
|------|-------|----------|---------|
| Student | rafiq@s.diu.edu.bd | student123 | — |
| Supervisor | ariful@diu.edu.bd | super123 | Code: `DIU@2024` |
| Admin | admin@diu.edu.bd | admin123 | Code: `ADMIN#DIU` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router, Axios, CSS Modules |
| Backend | Node.js 18, Express.js 4 |
| Database | MongoDB 6 + Mongoose ODM |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Email | SendGrid (optional) |
| Real-time | Socket.io |
| File Storage | AWS S3 (optional) |

---

## 👥 User Roles

- **Student** — Find supervisors, browse 50+ projects, send requests, watch video resources
- **Supervisor** — Manage requests, rate students, update slots — secured with access code
- **Admin** — Full system control, user management, analytics

---

## 🏫 University
**Daffodil International University**
102/1 Sukrabad, Mirpur Road, Dhanmondi, Dhaka-1207, Bangladesh
www.daffodilvarsity.edu.bd

---

## 📄 License
This project is developed as an academic project for DIU. All rights reserved.
