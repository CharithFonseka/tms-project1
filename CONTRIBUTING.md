# Contributing to TMS — Task Management System

> **Handoff document.** Any agent or new team member can pick up this project using this guide alone. Read it fully before writing any code.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Layout](#3-repository-layout)
4. [Local Development Setup](#4-local-development-setup)
5. [Branch Strategy](#5-branch-strategy)
6. [Commit Message Format](#6-commit-message-format)
7. [Pull Request Process](#7-pull-request-process)
8. [Module Ownership](#8-module-ownership)
9. [Environment Variables](#9-environment-variables)
10. [Testing](#10-testing)
11. [Deployment](#11-deployment)
12. [Open Items & Known TODOs](#12-open-items--known-todos)

---

## 1. Project Overview

A full-stack Task Management System (TMS) built for **INTE 21323**.  
Users belong to one of three roles (`Admin`, `Project Manager`, `Collaborator`) and collaborate on **Projects** that contain **Tasks**. Tasks support comments, file attachments, and real-time status notifications via WebSockets.

- **Frontend (Vercel):** `https://<your-app>.vercel.app`  
- **Backend API (Render):** `https://<your-backend>.onrender.com/api`  
- **Swagger UI:** `https://<your-backend>.onrender.com/api-docs`  
- **GitHub Repo:** `https://github.com/CharithFonseka/tms-project1`  
- **Requirements:** [`Task_Management_SRS.md`](./Task_Management_SRS.md)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Axios, Socket.io-client, Zod |
| Backend | Node.js 22, Express 5, Socket.io 4, Nodemailer |
| Auth | JWT (short-lived access token + HTTP-only refresh cookie), bcrypt |
| Database | PostgreSQL via Supabase JS SDK v2 |
| File Storage | Supabase Storage bucket |
| API Docs | swagger-jsdoc + swagger-ui-express |
| Validation | Joi (backend), Zod (frontend) |
| Security | helmet, express-rate-limit, sanitize-html, CORS |
| Testing | Jest + Supertest (backend), Vitest (frontend) |
| DevOps | Docker, GitHub Actions, Azure App Service (backend), Azure Static Web Apps (frontend) |

---

## 3. Repository Layout

```
tms-project1/                   ← monorepo root
├── backend/
│   ├── src/
│   │   ├── config/             # DB client, env loader
│   │   ├── middlewares/        # JWT, RBAC, rate limiter, sanitize, error handler
│   │   ├── modules/            # auth | users | tasks | comments | attachments | notifications
│   │   │   └── <module>/
│   │   │       ├── <module>.routes.js
│   │   │       ├── <module>.controller.js
│   │   │       ├── <module>.service.js
│   │   │       └── <module>.validation.js   (where applicable)
│   │   ├── sockets/            # Socket.io init, handshake auth, event emitters
│   │   ├── utils/              # ApiError, apiResponse, logger
│   │   └── app.js              # Express app factory
│   ├── tests/
│   ├── .env.example            # Required env vars — NEVER commit .env
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios client + per-module API helpers
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── features/           # auth | admin | tasks | notifications
│   │   ├── routes/             # ProtectedRoute, AppRoutes
│   │   ├── components/         # Shared UI (Button, Modal, Input, etc.)
│   │   └── socket/             # socket.client.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── .github/
│   ├── workflows/              # ci.yml (tests + build gate)
│   ├── ISSUE_TEMPLATE/         # bug_report.md, feature_request.md, task.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS              # Auto-assigns reviewers per module path
├── docker-compose.yml          # Local full-stack dev environment
├── Task_Management_SRS.md      # Authoritative requirements document
└── CONTRIBUTING.md             # ← this file
```

---

## 4. Local Development Setup

### Prerequisites
- Node.js ≥ 22, npm ≥ 10
- Docker Desktop (for full-stack compose)
- A Supabase project with the schema applied (see `Task_Management_SRS.md → Database Tables`)

### Option A — Docker Compose (recommended)

```bash
# 1. Clone the repo
git clone https://github.com/CharithFonseka/tms-project1.git
cd tms-project1

# 2. Set up backend environment
cp backend/.env.example backend/.env
# Fill in all values in backend/.env (see Section 9)

# 3. Start both services
docker compose up --build
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- Swagger: `http://localhost:3000/api-docs`

### Option B — Manual (no Docker)

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env          # fill in values
npm install
npm run dev                   # nodemon, auto-restarts on save

# Terminal 2 — Frontend
cd frontend
cp .env.example .env.development   # fill in VITE_API_BASE_URL etc.
npm install
npm run dev                   # Vite dev server on :5173
```

---

## 5. Branch Strategy

```
main          ← production (Azure deployments trigger from here)
  └── develop ← daily integration (everyone branches from here)
        ├── feature/auth-rbac                  # Person 1
        ├── feature/tasks-comments-attachments # Person 2
        ├── feature/realtime-notifications-security # Person 3
        ├── feature/frontend-auth-admin        # Person 4
        └── feature/frontend-tasks-devops      # Person 5
```

**Rules:**
1. **Never push directly to `main` or `develop`.**
2. Branch from `develop`: `git checkout develop && git pull && git checkout -b feature/<your-branch>`
3. PR target = `develop` (not `main`). `develop → main` is done as a milestone release PR.
4. Keep feature branches short-lived. Delete after merge.
5. Sync regularly: `git merge develop` into your feature branch to stay current.

---

## 6. Commit Message Format

Follow **Conventional Commits** (`type(scope): subject`):

| Type | When to use |
|---|---|
| `feat` | New functionality |
| `fix` | Bug fix |
| `docs` | Documentation or SRS changes |
| `refactor` | Internal restructure, no behavior change |
| `test` | Adding or updating tests |
| `chore` | Build, CI, deps, tooling |

**Examples:**
```
feat(tasks): add project_id FK and project scope to task creation
fix(auth): refresh token not cleared on logout
docs(srs): add Comments & Attachments section (G-6)
test(notifications): add reconnect delivery test
chore(ci): pin Node to 22 in deploy-backend workflow
```

---

## 7. Pull Request Process

1. Push your branch: `git push -u origin feature/<your-branch>`
2. Open a PR on GitHub: **base = `develop`**, compare = your branch.
3. Fill in the **PR template** (`.github/PULL_REQUEST_TEMPLATE.md`).
4. Reference the issue: include `Closes #<issue-number>` in the description.
5. Wait for **at least 1 approval** from the assigned CODEOWNER reviewer.
6. CI must pass (tests + build).
7. Squash-merge or merge-commit — no rebase-merges onto `develop`.

**Reviewer pairings:**
- Person 1 ↔ Person 2 (backend CRUD PRs)
- Person 3 reviews any PR touching `middlewares/`, `sockets/`, or security headers
- Person 4 ↔ Person 5 (frontend PRs)
- Person 5 reviews all CI/CD, Docker, and docs PRs

---

## 8. Module Ownership

| Module | Paths | Owner |
|---|---|---|
| Auth, JWT, RBAC, User Mgmt | `backend/src/modules/auth/`, `backend/src/modules/users/`, `backend/src/middlewares/jwt.*`, `backend/src/middlewares/rbac.*` | Person 1 |
| Tasks, Comments, Attachments | `backend/src/modules/tasks/`, `.../comments/`, `.../attachments/` | Person 2 |
| Real-Time, Notifications, Security | `backend/src/modules/notifications/`, `backend/src/sockets/`, all `middlewares/`, `backend/src/app.js` | Person 3 |
| Auth UI, Admin UI | `frontend/src/features/auth/`, `.../admin/`, `AuthContext.jsx`, `routes/` | Person 4 |
| Task Board UI, Notifications UI, DevOps | `frontend/src/features/tasks/`, `.../notifications/`, `socket/`, `.github/`, `Dockerfiles`, `docker-compose.yml` | Person 5 |

> **CODEOWNERS** (`.github/CODEOWNERS`) automates review requests. Update it with real GitHub handles before enabling branch protection.

---

## 9. Environment Variables

### Backend — `backend/.env.example`

```env
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-side only, never expose to frontend

# JWT
JWT_SECRET=<min-32-char-random-string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=<smtp-password>
EMAIL_FROM="TMS System <noreply@example.com>"

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend — `frontend/.env.example`

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_USE_MOCKS=false
```

> Add new variables to `.env.example` **in the same commit** that introduces them in code.

---

## 10. Testing

### Running tests

```bash
# Backend (Jest + Supertest)
cd backend
npm test                        # runs all tests once
npm test -- --watch             # watch mode

# Frontend (Vitest)
cd frontend
npm test                        # run once
npm run test:ui                 # Vitest browser UI
```

### Coverage targets (per SRS Testing Requirements)
- **Minimum 1 test per API endpoint**
- **Minimum 1 test per UI feature page**
- CI will run `npm test` on every PR; failing tests block merge.

### Where tests live
- Backend: `backend/tests/<module>/`
- Frontend: `frontend/src/tests/` and `frontend/src/features/<feature>/tests/`

---

## 11. Deployment

The app deploys to **Render** (backend) and **Vercel** (frontend). Both
platforms auto-deploy from the connected GitHub repo on push to `main`, so
there are no deploy GitHub Actions — CI (`.github/workflows/ci.yml`) only runs
tests and the frontend build as a PR gate.

### Backend — Render
- Blueprint: [`render.yaml`](./render.yaml) (Node web service, `rootDir: backend`, health check `/health`).
- Set the secret env vars in the Render dashboard: `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`,
  `FRONTEND_URL` (the Vercel origin). `PORT` is provided by Render.

### Frontend — Vercel
- Config: [`frontend/vercel.json`](./frontend/vercel.json) (Vite build, SPA rewrites).
- Set build-time env vars in the Vercel dashboard: `VITE_API_BASE_URL`
  (the Render backend `…/api`) and `VITE_SOCKET_URL` (the Render backend origin).

### Manual deploy check
After a `main` push:
1. Confirm CI is green in the **Actions** tab, and the Render/Vercel dashboards show a successful deploy.
2. Hit `GET https://<your-backend>.onrender.com/health` — expect `{"status":"ok"}`.
3. Open the Vercel frontend URL and log in.

---

## 12. Open Items & Known TODOs

| # | Item | Owner | Priority |
|---|---|---|---|
| T-1 | `project_id` FK not yet on the `Tasks` table in Supabase — migration needed | Person 2 | 🔴 High |
| T-2 | `POST /api/auth/refresh` endpoint not yet implemented (SRS G-5) | Person 1 | 🔴 High |
| T-3 | `POST /api/auth/socket-token` endpoint referenced by frontend socket client — needs implementing | Person 1 | 🔴 High |
| T-4 | CODEOWNERS `@handle-1` … `@handle-5` placeholders need replacing with real GitHub usernames | Person 5 | 🟠 Medium |
| T-5 | Frontend Azure Static Web Apps URL not confirmed — update `CONTRIBUTING.md` and `Task_Management_SRS.md` Deployment section | Person 5 | 🟠 Medium |
| T-6 | `TaskCard.jsx` inline delete dialog should use shared `Modal` component from Person 4 | Person 5 → Person 4 | 🟡 Low |
| T-7 | `Projects` table and `GET/POST /api/projects` routes do not yet exist — SRS now requires them | Person 2 | 🔴 High |
| T-8 | Deadline cron job exists (`backend/src/jobs/`) — confirm 24h window matches SRS spec | Person 3 | 🟡 Low |

---

*Last updated: 2026-06-26 by Antigravity agent. Re-run the agent or update manually when any open item above is resolved.*
