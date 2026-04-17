# Smart Thesis Hub — Database Schema
**Database:** MongoDB · **ODM:** Mongoose

---

## Collections Overview

| Collection | Purpose |
|-----------|---------|
| `users` | Base auth for all roles |
| `students` | Student academic profiles |
| `supervisors` | Supervisor/faculty profiles |
| `requests` | Supervision request workflow |
| `projects` | Project idea catalog |
| `notifications` | In-app notification feed |
| `feedbacks` | User feedback submissions |
| `categories` | Project topic categories |
| `videos` | Educational video resources |
| `ratings` | Supervisor's student ratings |

---

## users
```
_id          ObjectId   PK
name         String     required
email        String     required, unique, lowercase
password     String     required (bcrypt hashed, select:false)
role         String     enum: student | supervisor | admin
isActive     Boolean    default: true
isEmailVerified Boolean default: false
profilePic   String     nullable (S3 URL)
lastLogin    Date
createdAt    Date       auto
updatedAt    Date       auto
```

## students
```
_id          ObjectId   PK
userId       ObjectId   FK → users (unique)
rollNo       String     required, unique (format: 191-35-1001)
department   String     enum: CSE|SWE|ICT|ICE|ETE|MCT|BBA|EEE|ME|TE
year         Number     1–4
semester     Number     1–8
gpa          Float      0.0–4.0
interests    String[]   for AI matching
bio          String     max 500
phone        String
supervisorId ObjectId   FK → supervisors (null until assigned)
status       String     enum: searching|pending|assigned|completed
savedProjects ObjectId[] FK → projects
thesisTitle  String
thesisProgress Number  0–100
createdAt    Date
```

## supervisors
```
_id              ObjectId   PK
userId           ObjectId   FK → users (unique)
title            String     enum: Professor|Associate Professor|...
department       String     CSE|SWE|ICT|ICE|ETE|MCT
university       String     default: Daffodil International University
researchAreas    String[]
publications     Number
experience       Number     (years)
bio              String     max 1000
phone            String
officeRoom       String
maxSlots         Number     default: 5
isAcceptingStudents Boolean default: true
rating           Float      0.0–5.0
ratingCount      Number
assignedStudents ObjectId[] FK → students
virtual: availableSlots = maxSlots - assignedStudents.length
```

## requests
```
_id              ObjectId   PK
studentId        ObjectId   FK → users
supervisorId     ObjectId   FK → users
studentProfileId ObjectId   FK → students
supervisorProfileId ObjectId FK → supervisors
message          String     required, min:15, max:1000
researchArea     String     required
projectTitle     String
status           String     enum: pending|accepted|rejected|cancelled|withdrawn
supervisorNote   String     max 500
respondedAt      Date
createdAt        Date
```

## projects
```
_id            ObjectId   PK
title          String     required, max:200
description    String     max:2000
category       String     enum: AI/ML|IoT|Blockchain|Web Dev|...
supervisorId   ObjectId   FK → supervisors
difficulty     String     Beginner|Intermediate|Advanced
availableSlots Number     default: 3
tags           String[]
views          Number     default: 0
isActive       Boolean    default: true
applicants     ObjectId[] FK → students
```

## notifications
```
_id          ObjectId   PK
userId       ObjectId   FK → users
type         String     enum: request_sent|request_accepted|request_rejected|system|reminder|new_project
title        String     required
body         String     required
isRead       Boolean    default: false
relatedId    ObjectId   (optional reference)
relatedModel String     (optional)
createdAt    Date
```

## feedbacks
```
_id           ObjectId   PK
userId        ObjectId   FK → users (optional)
name          String
email         String
category      String     General|Bug Report|Feature Request|...
subject       String     required, max:200
body          String     required, max:2000
rating        Number     1–5
status        String     open|in_progress|resolved|closed
adminResponse String
createdAt     Date
```

## videos
```
_id        ObjectId   PK
title      String     required
youtubeUrl String     required
youtubeId  String     required (11-char YT ID)
thumbnail  String     (auto-generated from YT)
duration   String     e.g. "18:32"
category   String     Research Methods|Tools|Planning|...
views      Number     default: 0
addedBy    ObjectId   FK → users
isActive   Boolean    default: true
```

## ratings
```
_id          ObjectId   PK
supervisorId ObjectId   FK → supervisors
studentId    ObjectId   FK → students
rating       Number     1–5 (required)
comment      String     max:500
createdAt    Date
Index: { supervisorId, studentId } unique
```

---

## Indexes
```
users:        email (unique)
students:     userId (unique), rollNo (unique)
supervisors:  userId (unique)
requests:     { studentId, supervisorId }, status
notifications: { userId, isRead }
ratings:      { supervisorId, studentId } unique
```

---

## Relationships
```
User (1) ──── (1) Student
User (1) ──── (1) Supervisor
Student (M) ──── (1) Supervisor   [via supervisorId]
Student (1) ──── (M) Request
Supervisor (1) ──── (M) Request
Supervisor (1) ──── (M) Project
Student (M) ──── (M) Project      [via savedProjects]
User (1) ──── (M) Notification
User (1) ──── (M) Feedback
Supervisor (1) ──── (M) Rating
Student (1) ──── (M) Rating
```
