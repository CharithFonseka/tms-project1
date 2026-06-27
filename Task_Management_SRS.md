# INTE 21323 - PROJECT - Task Management System
## Software Requirements Specification (SRS)

**Total Allocated Marks for Final Evaluation:** 40%  
**Final Submission Deadline:** 2026-06-06  
**Group Assignment | INTE 21323** A Task Management System (TMS) is a software application designed to help individuals or teams plan, organize, track, and complete tasks efficiently. It's widely used in personal productivity, team collaboration, and project management. A Task Management System (TMS) is essential in project management because it provides a structured way to organize, assign, and track tasks throughout the project lifecycle.

In any project, multiple activities need to be coordinated among different team members, and without a centralized system, tasks can easily be overlooked, duplicated, or delayed. A TMS ensures that every task is clearly defined, assigned to a responsible individual, and given a deadline, which improves accountability and reduces confusion within the team. It also enables real-time progress tracking, allowing managers to monitor what has been completed, what is in progress, and what is pending, thereby making it easier to identify bottlenecks early and take corrective action.

Additionally, by centralizing all project-related information such as task details, updates, and communication, a TMS enhances collaboration and keeps everyone aligned with project goals. Tools like Trello and Jira demonstrate how such systems can improve efficiency and productivity by streamlining workflows and ensuring that deadlines are consistently met, ultimately contributing to the successful completion of projects.

Popular examples include:
* Trello
* Asana
* Jira

---

## Introduction

This document defines the functional and non-functional requirements for the Task Management System, a full-stack web application that allows users to create, manage, and track tasks collaboratively in real time. The system enables:
* User Registration, Authentication and role-based access control
* Create and manage **projects** as the top-level organizational unit
* Create tasks under a project scope
* Assign tasks to people
* Set deadlines and priorities
* Track progress (e.g., To Do → In Progress → Done)
* Collaborate (comments, attachments, updates)
* Real-time Notifications updates using WebSockets
* Secure API communication
* Deployment in a cloud environment

---

## Functional Requirements

### User Authentication
The system shall allow registered users to log in using valid credentials (email and password). Credentials shall be validated against stored records with proper input validation and secure handling.
* **On success:** access is granted
* **On failure:** appropriate error message is returned

### JWT-Based Session Management
Upon successful authentication:
* The system shall generate a short-lived **access token** (JWT) containing user ID, role, and expiration time (default: 15 minutes).
* The system shall also issue a long-lived **refresh token** stored in an HTTP-only cookie (default: 7 days).
* The access token shall be securely signed to prevent tampering.
* The client shall include the access token in the Authorization header (or HTTP-only cookie) for all protected API requests.

The system shall:
* Validate token signature, expiration, and integrity on each request
* Expose a `POST /api/auth/refresh` endpoint that accepts a valid refresh token cookie and returns a new access token
* Reject invalid/expired tokens with `401 Unauthorized`
* Invalidate refresh tokens on logout

### Authorization & Role-Based Access Control (RBAC)
Access to system features shall be restricted based on authentication status and user roles:
* Protected routes require a valid JWT
* Unauthorized access → 401 Unauthorized
* Forbidden actions → 403 Forbidden

**Roles:**
* **Administrator (Admin):** Full access to user management and system configuration. Can create, update, deactivate users, and assign roles.
* **Project Manager:** Can create/manage projects and tasks, assign tasks, set priorities, deadlines, and monitor progress.
* **Collaborator:** Can view assigned tasks, update task status, add comments/attachments. Cannot modify restricted fields or delete tasks.

### User Management
Accessible only to Administrators. Other users do not have ability to update others or their profile.

**Core Features**
The system shall allow:
* Create, view, update, deactivate users
* Assign roles to users
* View users via searchable and filterable list

**Validation & Constraints**
* Required fields: name, email, role
* Email must be valid and unique
* All inputs must be validated before submission

**User Onboarding**
* Upon user creation: System shall send an email with username and temporary password
* On first login: Users must reset password (mandatory) before accessing the system. Password policies must be enforced.
* Minimum length and complexity enforced

**Storing Passwords**
* Passwords shall be stored using secure hashing (e.g., bcrypt)
* Plain-text passwords shall never be stored
* All operations shall include: Validation, Error handling, Success confirmations

---

## Project Management

> **Note (G-1, G-2, G-3 resolved):** Tasks are scoped under Projects. A Project is the top-level organizational container. All task CRUD operates within a project context.

### Core Features
Authorized users (primarily Project Managers and Administrators) shall be able to:
* Create, view, update, and delete projects
* List all projects (Project Managers see projects they own; Collaborators see projects they are assigned to via tasks)

### Project Attributes
Each project shall include:
* `id` — UUID, system-generated (required)
* `name` — string (required)
* `description` — string (optional)
* `created_by` — FK to `Users` (system-set to the creator)
* `created_at` / `updated_at` — timestamps (system-managed)

### Permissions
* **Administrators:** full project CRUD across all projects
* **Project Managers:** can create projects and fully manage projects they own
* **Collaborators:** read-only access to projects where they have an assigned task

### Validation Rules
* `name` is mandatory and must be unique per creator
* Deleting a project shall cascade-delete all associated tasks, comments, and attachments

---

## Task Management

### Core Features
Authorized users (primarily Project Managers) shall be able to:
* Create, view, update, assign, delete tasks **within a project**

The system shall provide:
* Task views (table/board/Kanban) filtered to the selected project
* Filtering by status, priority, and text search
* Sorting by due date, priority, or creation date
* Paginated results (default page size: 20 items)

### Task Attributes
Each task shall include:
* `id` — UUID, system-generated
* `project_id` — FK to `Projects` (optional for backward compatibility; new tasks must supply it)
* Title (required)
* Description (optional)
* Assigned user(s) — via a `TaskAssignments` join table supporting multiple assignees
* Due date (required)
* Priority (`Low`, `Medium`, `High` — default: `Medium`)
* Status (`To Do`, `In Progress`, `Completed` — default: `To Do`)
* `created_by` — FK to `Users`
* `created_at` / `updated_at` — timestamps

### Status Transition Rules
> **G-4 resolved.** Status changes shall follow a forward-only progression:

```
To Do  →  In Progress  →  Completed
```

* A task may not skip states (e.g., `To Do → Completed` is forbidden).
* Only the assigned Collaborator, the owning Project Manager, or an Administrator may change status.
* The backend shall reject invalid transitions with `400 Bad Request`.

### Validation Rules
* Title is mandatory
* Due date must be valid (past dates are rejected unless `allowPastDue` flag is explicitly set by Admin/PM)
* Priority must match predefined values (`Low`, `Medium`, `High`)
* Assignment limited to existing users
* `project_id` must reference an existing project when provided

### Permissions
* **Project Managers:** full task control within their projects
* **Collaborators:** Can view assigned tasks, update status (forward-only), add comments/attachments. Cannot delete or modify restricted fields.

### Pagination
* All list endpoints (`GET /api/tasks`, `GET /api/projects/:id/tasks`) shall support `page` and `limit` query parameters.
* Default: `page=1`, `limit=20`.
* Response shall include `total` count alongside the data array.

### System Behavior
* All operations shall include validation and error handling
* UI shall provide clear feedback and confirmations
* Task updates shall reflect immediately (linked to real-time module)

---

## Comments & Attachments

> **G-6 resolved.** The following requirements govern collaboration at the task level.

### Comments

**Core Features**
Authenticated users who are assigned to a task (or are PM/Admin) shall be able to:
* Add a comment to a task
* View all comments for a task (paginated, oldest-first)
* Delete their own comment (Admins can delete any comment)

**Comment Attributes**
* `id` — UUID
* `task_id` — FK to `Tasks`
* `user_id` — FK to `Users` (the commenter)
* `body` — string (required, max 5 000 characters)
* `created_at` / `updated_at`

**Validation Rules**
* `body` is mandatory and must not be blank
* HTML/script tags shall be stripped (XSS prevention)

### Attachments

**Core Features**
Authenticated users who are assigned to a task (or are PM/Admin) shall be able to:
* Upload a file attachment to a task
* View/download all attachments for a task
* Delete their own attachment (Admins can delete any)

**Attachment Attributes**
* `id` — UUID
* `task_id` — FK to `Tasks`
* `user_id` — FK to `Users` (uploader)
* `file_url` — URL to the file in cloud storage (Supabase Storage bucket)
* `file_name` — original filename
* `file_size` — bytes
* `created_at`

**Constraints**
* Maximum file size: **10 MB** per upload
* Permitted MIME types: images (`image/*`), PDF, plain text, common office formats (`.docx`, `.xlsx`)
* Files are stored in a Supabase Storage bucket; the database stores only the URL

---

## Real-Time Features (WebSocket-Based)
The system shall use WebSockets (Socket.io) to push updates without polling.

### Events and Notifications
Users shall receive real-time notifications for:
* Task assignments
* Status changes
* Comments added to a task they are assigned to
* Approaching deadlines (triggered when a task's `due_date` is **≤ 24 hours away** — evaluated by a scheduled cron job running every hour)
* Administrative updates (user deactivation, role change)

### Client Behavior
WebSocket connection established after authentication. UI shall update dynamically (tasks, statuses, notifications).

### Notification Handling
Notifications shall be:
* Role-based and user-specific
* Displayed via in-app alerts or notification panel

**Offline users:** Notifications shall be stored in the `Notifications` table and delivered upon reconnection.

### Reliability & Security
* Implement reconnection strategies (e.g., exponential backoff with a maximum of 5 retries)
* Ensure secure transmission (WSS in production)
* Prevent unauthorized subscription to events (JWT verified during socket handshake)

---

## Validation & Error Handling
The system shall enforce validation at both:
* Frontend (immediate feedback)
* Backend (final validation layer)

Validation includes:
* Required fields
* Data formats (email, dates, UUIDs)
* Business rules (status transitions, role permissions)

### Error Handling (Backend)
The API shall return Standard HTTP status codes with Structured error response as required. Structured error response shall follow:
```json
{
  "code": 400,
  "message": "Validation failed",
  "description": "title is required"
}
```

**Error codes:**
* 400 Bad Request
* 401 Unauthorized
* 403 Forbidden
* 404 Not Found
* 429 Too Many Requests (rate limit exceeded)
* 500 Internal Server Error

### Frontend Handling
* Display user-friendly error messages
* Map input field-level errors to inputs
* Show global errors via alerts/notifications
* Maintain consistent error UI patterns

---

## Security
* The system shall prevent SQL Injection attacks by ensuring that user inputs cannot manipulate database queries.
* All database interactions shall use parameterized queries or ORM frameworks (Supabase JS client) instead of dynamic query concatenation.
* Input data shall be validated and sanitized before processing (using `sanitize-html` middleware).
* Store passwords using bcrypt hashing (minimum 10 salt rounds).
* Use HTTPS for all deployed services; all WebSocket connections use WSS.
* Sanitise and validate all inputs to avoid XSS/SQLi.
* Use best practices with reference to OWASP Top 10 recommendations.
* The system shall ensure all data transmitted between client and server is encrypted (TLS 1.2+).
* Rate limiting shall be applied: login endpoint (`5 requests / 15 min`), general API (`100 requests / 15 min`).
* HTTP security headers shall be set via `helmet` (CSP, HSTS, X-Frame-Options, etc.).

---

## System Architecture

> **G-9 resolved.** The system uses a layered MVC-style architecture: frontend on Vercel, backend on Render.

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│  Vercel                                                 │
│  React + Vite (Frontend)                                │
│  Features: Auth, Admin, Tasks, Notifications            │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / WSS
┌────────────────────────▼────────────────────────────────┐
│  Render                                                 │
│  Node.js + Express (Backend)                            │
│  Modules: auth, users, projects, tasks,                 │
│           comments, attachments, notifications          │
│  Socket.io server (real-time)                           │
└────────────────────────┬────────────────────────────────┘
                         │ Supabase JS SDK
┌────────────────────────▼────────────────────────────────┐
│  Supabase (PostgreSQL)                                  │
│  Tables: Users, Projects, Tasks, TaskAssignments,       │
│          Comments, Attachments, Notifications           │
│  Storage: Supabase Storage bucket (attachments)         │
└─────────────────────────────────────────────────────────┘
```

### Database Tables

| Table | Key Columns |
|---|---|
| `Users` | id, name, email (unique), password_hash, role, is_active |
| `Projects` | id, name, description, created_by (FK Users) |
| `Tasks` | id, project_id (FK Projects), title, description, status, priority, due_date, created_by (FK Users) |
| `TaskAssignments` | task_id (FK Tasks), user_id (FK Users) — composite PK |
| `Comments` | id, task_id (FK Tasks), user_id (FK Users), body |
| `Attachments` | id, task_id (FK Tasks), user_id (FK Users), file_url, file_name, file_size |
| `Notifications` | id, user_id (FK Users), message, type, is_read, created_at |

### Folder Structure
```
tms-project1/
├── backend/src/
│   ├── config/          # DB client, env validation
│   ├── middlewares/     # JWT, RBAC, rate limiter, sanitize, error handler
│   ├── modules/         # auth, users, tasks, comments, attachments, notifications
│   ├── sockets/         # Socket.io server, handshake auth, event emitters
│   └── utils/           # ApiError, apiResponse, logger
├── frontend/src/
│   ├── api/             # Axios client + per-module API helpers
│   ├── context/         # AuthContext, SocketContext
│   ├── features/        # auth, admin, tasks, notifications
│   └── routes/          # ProtectedRoute, AppRoutes
├── .github/
│   ├── workflows/       # CI (tests + build) — deploy via Render/Vercel
│   ├── ISSUE_TEMPLATE/  # Bug, Feature, Task templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── docker-compose.yml
├── CONTRIBUTING.md
└── README.md
```

---

## Deployment Requirements
* Docker containerization with separate `Dockerfile` for backend and frontend.
* Cloud deployment: **backend on Render** ([`render.yaml`](./render.yaml)) and **frontend on Vercel** ([`frontend/vercel.json`](./frontend/vercel.json)). Both auto-deploy from the connected GitHub repo on push to `main`.
* CI via GitHub Actions: `ci.yml` runs backend Jest and frontend Vitest + build on every PR and push to `main`/`develop` (the PR test gate).
* Ensure CORS and environment variable configuration for production.
* Environment variables shall be documented in `.env.example` files (one per service — never commit real `.env` files).

**Live URLs:**
* **Frontend (Vercel):** `https://<your-app>.vercel.app`
* **Backend API (Render):** `https://<your-backend>.onrender.com/api`
* **Swagger UI:** `https://<your-backend>.onrender.com/api-docs`

> Replace the placeholders above with the actual Vercel and Render URLs once deployed.

---

## Testing Requirements

> **G-10 resolved.** The following scope defines what must be tested before any PR can merge.

### Backend — Functional Tests (Jest + Supertest)
Each module owner must provide tests covering:
* **Auth module:** login success/failure, token refresh, protected-route rejection on missing/expired token
* **Users module:** create user (Admin only), list/filter users, deactivate user, role assignment
* **Tasks module:** CRUD operations, status transition validation (forward-only), collaborator scope restriction, pagination
* **Comments module:** add/view/delete comment, body validation
* **Attachments module:** upload (valid MIME, size limit), delete
* **Notifications module:** mark-as-read, queued delivery on reconnect

### Frontend — Component Tests (Vitest / React Testing Library)
* `LoginPage` — form validation, API call, redirect on success
* `TaskBoard` — renders correct columns, filter changes trigger refetch
* `TaskForm` — required field validation, assignee multi-select
* `ProtectedRoute` — redirects unauthenticated users, enforces role

### Coverage Target
A minimum of **one test per API endpoint** and **one test per UI feature page** is required before the PR is approved.

---

## Git & Documentation Requirements

### Version Control
* Every contributor must use feature branches (see `CONTRIBUTING.md` for branch naming)
* Use pull requests and merge commits — no direct pushes to `main` or `develop`
* Follow **Conventional Commits**: `type(scope): subject`
  * Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
  * Example: `feat(tasks): add project_id FK to task creation`

### API Documentation
* Use Swagger/OpenAPI (`swagger-jsdoc`) for documenting all REST endpoints
* Swagger UI available at `/api-docs` on the deployed backend
* Every new endpoint must include a `@swagger` JSDoc block before merging

### README.md
* Project overview
* Technologies used
* Setup instructions (local + Docker)
* API usage (link to Swagger UI)
* Team member contributions

### Environment Variables
* Each service (`backend/`, `frontend/`) must maintain an up-to-date `.env.example` listing all required variables with descriptions but no real values.
* New environment variables introduced in a PR must be added to `.env.example` in the same commit.

### Folder Structure
Follow clean, modular folder structure — see System Architecture section above.

---

## Deliverables
* Source code, API documentation (Swagger), ER diagram, DB schema, deployment diagram.
* After initiation of projects each team must publish their source code to a GitHub public repository and share the link.
* Make sure to demonstrate the website from a properly hosted URL.

---

## Grading Criteria

**Total Marks: 100**

| Category | Marks (%) |
| :--- | :--- |
| Frontend | 20 |
| Backend | 20 |
| Database | 10 |
| Security | 15 |
| Real-Time Notifications | 10 |
| DevOps & Deployment | 20 |
| Documentation | 5 |
| **Total Marks** | **100** |
