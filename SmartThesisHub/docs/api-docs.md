# Smart Thesis Hub — API Reference
**Base URL:** `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

## Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login and get JWT | Public |
| POST | `/auth/refresh` | Refresh access token | Refresh token |
| POST | `/auth/logout` | Logout | JWT |
| GET | `/auth/me` | Get current user + profile | JWT |

**Login body:**
```json
{ "email": "ariful@diu.edu.bd", "password": "super123", "role": "supervisor", "accessCode": "DIU@2024" }
```

---

## Supervisors
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/supervisors` | List all (query: dept, area, hasSlots, search) | JWT |
| GET | `/supervisors/:id` | Get supervisor by ID | JWT |
| PATCH | `/supervisors/:id` | Update profile | Supervisor/Admin |
| GET | `/supervisors/:id/students` | Get assigned students | JWT |
| POST | `/supervisors/rate-student` | Rate a student | Supervisor |

---

## Requests
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/requests` | Send supervision request | Student |
| GET | `/requests` | Get requests (role-filtered) | JWT |
| PATCH | `/requests/:id/status` | Accept / Reject | Supervisor/Admin |
| DELETE | `/requests/:id` | Withdraw request | Student |

**Create request body:**
```json
{ "supervisorId": "<id>", "message": "Your message here (min 15 chars)", "researchArea": "Machine Learning" }
```

---

## Projects
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/projects` | List all (query: category, difficulty, search) | JWT |
| GET | `/projects/:id` | Get project by ID | JWT |
| POST | `/projects` | Create project | Admin/Supervisor |
| PATCH | `/projects/:id` | Update project | Admin/Supervisor |
| DELETE | `/projects/:id` | Remove project | Admin |

---

## Students
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/students` | List all students | Supervisor/Admin |
| GET | `/students/me` | Get own student profile | Student |
| PATCH | `/students/me` | Update own profile | Student |
| POST | `/students/me/save-project/:id` | Toggle save project | Student |
| GET | `/students/:id` | Get student by ID | JWT |

---

## Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Get user notifications | JWT |
| PATCH | `/notifications/read-all` | Mark all as read | JWT |
| PATCH | `/notifications/:id/read` | Mark one as read | JWT |
| DELETE | `/notifications/:id` | Delete notification | JWT |

---

## Videos
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/videos` | List all videos (query: category) | JWT |
| POST | `/videos` | Add new video | Admin |
| PATCH | `/videos/:id/view` | Increment view count | JWT |
| DELETE | `/videos/:id` | Remove video | Admin |

---

## Feedback
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/feedback` | Submit feedback | JWT |
| GET | `/feedback` | List all feedback | Admin |
| PATCH | `/feedback/:id` | Respond to feedback | Admin |

---

## Recommendations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/recommendations` | Get matched supervisors | Student |

---

## Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/analytics` | System stats | Admin |
| GET | `/admin/activity-log` | Recent activity | Admin |
| POST | `/admin/create-user` | Create user with credentials | Admin |
| GET | `/users` | List all users | Admin |
| PATCH | `/users/:id/toggle-active` | Enable/disable user | Admin |
| DELETE | `/users/:id` | Delete user permanently | Admin |

---

## Error Format
```json
{ "error": "Human-readable error message" }
```

## Success Format
```json
{ "message": "Success description", "data": { ... } }
```

## HTTP Status Codes
- `200` OK · `201` Created · `400` Bad Request
- `401` Unauthorized · `403` Forbidden · `404` Not Found
- `409` Conflict · `500` Server Error
