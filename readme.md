# Task Management System — Team Work Breakdown & Git Workflow Guide

**Stack:** Node.js + Express (backend) · React + Vite (frontend) · Supabase/PostgreSQL (database) · Socket.io (real-time) · Docker + GitHub Actions (DevOps)

This guide splits the project into 5 ownership areas, gives each person the exact folders/files they own, and defines the Git branching model the whole team follows. Read your section fully before writing any code.

---

## 0. Repository Setup (whoever creates the repo does this first)

Use **one GitHub repository** (monorepo) with `backend/` and `frontend/` as top-level folders — this matches the assignment's "single public repo" deliverable and keeps PRs easy to review.

```
task-management-system/
├── backend/
├── frontend/
├── .github/workflows/ci.yml
├── docker-compose.yml
├── README.md
└── .gitignore
```

Branch protection (set this in GitHub → Settings → Branches before anyone pushes):
- `main` — protected, requires 1 PR approval + passing CI, no direct pushes. This is the deployed/production branch.
- `develop` — protected, requires 1 PR approval. This is the default branch everyone branches from and merges into daily.

Also create a **GitHub Project (board)** with one Issue per task below, so progress is visible and each PR can reference `Closes #<issue-number>`.

### Important architecture decision: Supabase + custom JWT
Since you're using your own JWT auth (not Supabase Auth), the backend should hold the **`SUPABASE_SERVICE_ROLE_KEY`** (server-side only, never sent to the frontend) and disable/bypass Row Level Security, since your Express middleware is what enforces role-based access — not Supabase policies. The frontend never talks to Supabase directly; it only calls your Express API. This keeps authorization logic in one place and avoids duplicating RBAC rules in both Postgres policies and Express middleware.

---

## 1. The 5 Roles

| # | Person | Owns | Grading categories covered |
|---|--------|------|----------------------------|
| 1 | Backend Dev A | Auth, JWT, RBAC, User Management | Backend, Database (Users), Security (auth-specific) |
| 2 | Backend Dev B | Tasks, Comments, Attachments | Backend, Database (Tasks/Comments/Attachments) |
| 3 | Backend Dev C | Real-time (Socket.io), Notifications, App-wide Security hardening | Real-Time Notifications, Security (lead) |
| 4 | Frontend Dev A | Auth UI, Admin/User Management UI | Frontend (half) |
| 5 | Frontend Dev B | Task Board UI, Notification UI, DevOps & Deployment, Docs compilation | Frontend (half), DevOps, Documentation |

Security and Documentation are also **cross-cutting**: every person secures and documents their own module (see the checklist at the bottom). Person 3 leads the dedicated security pass; Person 5 leads DevOps and compiles the final README/Swagger.

Branch each person works from (created off `develop`):
- `feature/auth-rbac` → Person 1
- `feature/tasks-comments-attachments` → Person 2
- `feature/realtime-notifications-security` → Person 3
- `feature/frontend-auth-admin` → Person 4
- `feature/frontend-tasks-devops` → Person 5

---

## 2. Backend Folder Structure (everyone builds inside this shared skeleton)

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # Supabase client init
│   │   └── env.js                # loads/validates env vars
│   ├── middlewares/
│   │   ├── jwt.middleware.js     # Person 1
│   │   ├── rbac.middleware.js    # Person 1
│   │   ├── errorHandler.js       # Person 3
│   │   ├── rateLimiter.js        # Person 3
│   │   └── sanitize.middleware.js# Person 3
│   ├── modules/
│   │   ├── auth/                 # Person 1
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validation.js
│   │   ├── users/                # Person 1
│   │   │   ├── users.routes.js
│   │   │   ├── users.controller.js
│   │   │   ├── users.service.js
│   │   │   └── users.validation.js
│   │   ├── tasks/                # Person 2
│   │   │   ├── tasks.routes.js
│   │   │   ├── tasks.controller.js
│   │   │   ├── tasks.service.js
│   │   │   └── tasks.validation.js
│   │   ├── comments/              # Person 2
│   │   │   ├── comments.routes.js
│   │   │   ├── comments.controller.js
│   │   │   └── comments.service.js
│   │   ├── attachments/           # Person 2
│   │   │   ├── attachments.routes.js
│   │   │   ├── attachments.controller.js
│   │   │   └── attachments.service.js
│   │   └── notifications/         # Person 3
│   │       ├── notifications.routes.js
│   │       ├── notifications.controller.js
│   │       └── notifications.service.js
│   ├── sockets/                   # Person 3
│   │   ├── socket.server.js
│   │   ├── socket.auth.js
│   │   └── events/
│   │       ├── task.events.js
│   │       └── notification.events.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── apiResponse.js
│   └── app.js
├── tests/
├── .env.example
├── Dockerfile
└── package.json
```

### Person 1 — Auth, JWT & RBAC

**Build:**
- `auth.routes.js` / `auth.controller.js` / `auth.service.js` — login endpoint, password verification (bcrypt), JWT generation
- `users.routes.js` / `users.controller.js` / `users.service.js` — admin-only CRUD: create user (sends temp password email), update, deactivate, list/search/filter
- `jwt.middleware.js` — verifies token signature/expiry, attaches `req.user`
- `rbac.middleware.js` — `requireRole(['Admin'])` style guard used on protected routes
- `users.validation.js` — required fields, unique/valid email, role enum check

**Skeleton example (`jwt.middleware.js`):**
```js
const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

**Database tables owned:** `Users` (already in your schema — no changes needed, just write the queries).

---

### Person 2 — Tasks, Comments & Attachments

**Build:**
- `tasks.routes.js` / `.controller.js` / `.service.js` — create/view/update/assign/delete tasks, status transitions, filtering/sorting, handles `TaskAssignments` join table for multi-user assignment
- `comments.routes.js` / `.controller.js` / `.service.js` — add/view comments per task
- `attachments.routes.js` / `.controller.js` / `.service.js` — upload to Supabase Storage bucket, store `file_url` in `Attachments` table
- `tasks.validation.js` — title required, valid due date, priority/status enums, assignee must exist

**Skeleton example (`tasks.service.js` — using Supabase JS client):**
```js
async function createTask(data, userId) {
  const { data: task, error } = await supabase
    .from('Tasks')
    .insert({ ...data, created_by: userId })
    .select()
    .single();
  if (error) throw new ApiError(400, error.message);
  return task;
}
```

**Database tables owned:** `Tasks`, `TaskAssignments`, `Comments`, `Attachments`.

---

### Person 3 — Real-Time, Notifications & Security Lead

**Build:**
- `socket.server.js` — initializes Socket.io on top of the HTTP server
- `socket.auth.js` — verifies JWT during the socket handshake before allowing connection
- `events/task.events.js` / `notification.events.js` — emits `task:assigned`, `task:statusChanged`, `comment:added`, `deadline:approaching` to the right user rooms
- `notifications.routes.js` / `.controller.js` / `.service.js` — persist notifications, mark as read, deliver queued notifications on reconnect
- **Security pass (app-wide):** `rateLimiter.js`, `helmet` config in `app.js`, `sanitize.middleware.js` (XSS/SQLi input cleaning), centralized `errorHandler.js` returning the structured `{ code, message, description }` error format, CORS configuration, OWASP Top 10 checklist review across all routes written by Persons 1 & 2

**Skeleton example (`socket.auth.js`):**
```js
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    socket.join(`user:${socket.user.id}`); // room per user
    next();
  } catch {
    next(new Error('Unauthorized socket connection'));
  }
});
```

**Database tables owned:** `Notifications`.

---

## 3. Frontend Folder Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── axiosClient.js
│   │   ├── authApi.js
│   │   ├── usersApi.js
│   │   ├── tasksApi.js
│   │   └── notificationsApi.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── SocketContext.jsx
│   ├── routes/
│   │   ├── ProtectedRoute.jsx
│   │   └── AppRoutes.jsx
│   ├── features/
│   │   ├── auth/                  # Person 4
│   │   │   ├── LoginPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   ├── admin/                 # Person 4
│   │   │   ├── UserList.jsx
│   │   │   └── UserForm.jsx
│   │   ├── tasks/                 # Person 5
│   │   │   ├── TaskBoard.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskFilters.jsx
│   │   ├── comments/              # Person 5
│   │   │   └── CommentSection.jsx
│   │   └── notifications/         # Person 5
│   │       ├── NotificationBell.jsx
│   │       └── NotificationPanel.jsx
│   ├── components/                # shared Button, Modal, Input, etc.
│   ├── socket/
│   │   └── socket.client.js       # Person 5
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── Dockerfile
└── package.json
```

### Person 4 — Auth & Admin UI

**Build:**
- `LoginPage.jsx` — email/password form, calls `authApi.js`, stores token via `AuthContext`
- `ResetPasswordPage.jsx` — mandatory first-login password reset flow
- `ProtectedRoute.jsx` — redirects to login if no valid token; checks role before rendering admin routes
- `AuthContext.jsx` — holds current user, login/logout functions, exposes `useAuth()`
- `UserList.jsx` / `UserForm.jsx` — admin-only searchable/filterable user table, create/update/deactivate forms

**Skeleton example (`ProtectedRoute.jsx`):**
```jsx
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/403" />;
  return children;
}
```

---

### Person 5 — Task Board UI, Real-Time UI, DevOps & Docs

**Build (frontend):**
- `TaskBoard.jsx` — Kanban/table view with filtering/sorting (To Do / In Progress / Completed columns)
- `TaskCard.jsx`, `TaskForm.jsx`, `TaskFilters.jsx`
- `CommentSection.jsx`, attachment upload UI inside task detail
- `socket.client.js` — connects to the backend Socket.io server with the stored JWT, listens for events and triggers UI updates / toasts
- `NotificationBell.jsx` / `NotificationPanel.jsx` — unread badge, in-app notification list

**Build (DevOps & Docs — root of repo):**
- `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`
- `.github/workflows/ci.yml` — runs lint/tests on every PR to `develop` and `main`
- Cloud deployment (e.g., Render/Railway for backend+Postgres, Vercel/Netlify for frontend, or Azure/AWS if required) + environment variable setup + CORS config for the deployed URLs
- Sets up Swagger/OpenAPI docs endpoint, compiles final `README.md` from each member's module notes

**Skeleton example (`socket.client.js`):**
```js
import { io } from 'socket.io-client';

export function connectSocket(token) {
  const socket = io(import.meta.env.VITE_SOCKET_URL, { auth: { token } });
  socket.on('connect_error', (err) => console.warn('Socket auth failed', err.message));
  return socket;
}
```

**Note:** Person 1 and 2 are responsible for keeping their own `.env.example` entries and `package.json` dependencies accurate so Person 5's Docker build doesn't break.

---

## 4. Git Branching Strategy

```
main        ──●────────────────●───────────────  (production, protected)
                \                \
develop     ──●──●──●──●──●──●──●───────────────  (integration, protected)
               \  \  \  \  \
feature/...     ●  ●  ●  ●  ●   (one per person, short-lived)
```

**Workflow rules:**
1. Never commit directly to `main` or `develop`.
2. Branch off `develop`: `git checkout develop && git pull && git checkout -b feature/<your-branch-name>`.
3. Commit using **Conventional Commits**: `type(scope): subject`
   - Examples: `feat(auth): add JWT verification middleware`, `fix(tasks): correct due date validation`, `docs(readme): add setup instructions`
   - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
4. Push your branch and open a **Pull Request into `develop`** (not `main`).
5. PR requires **at least 1 reviewer approval** before merging. Suggested review pairing:
   - Person 1 ↔ Person 2 review each other's backend PRs
   - Person 3 reviews any PR touching security or sockets (lead)
   - Person 4 ↔ Person 5 review each other's frontend PRs
6. If your feature branch falls behind, sync regularly: `git checkout develop && git pull && git checkout feature/<your-branch> && git merge develop`.
7. When a milestone is stable, open a PR from `develop` → `main` (this triggers deployment).
8. Delete feature branches after merge to keep the branch list clean.

**Onboarding steps for every team member (run once):**
```bash
git clone <repo-url>
cd task-management-system
git checkout develop
git checkout -b feature/<your-branch-name>
# ... do your work, commit in small chunks ...
git push -u origin feature/<your-branch-name>
# open PR on GitHub: base = develop, compare = feature/<your-branch-name>
```

---

## 5. Cross-Cutting Checklist (everyone, regardless of role)

| Area | What you personally must do in your own module |
|------|--------------------------------------------------|
| Validation | Validate every input both client-side and in your Express route before hitting the service layer |
| Security | Never concatenate raw SQL/strings into queries — use the Supabase client or parameterized queries only |
| Error handling | Throw/return errors in the shared `{ code, message, description }` shape so Person 3's error handler can format them consistently |
| Documentation | Add a short module README or JSDoc comments explaining your endpoints/components so Person 5 can compile the final docs |
| Testing | Write at least basic functional tests for your endpoints/components before opening your PR |

---

## 6. Suggested Order of Work

1. **Day 1:** Repo + branch protection setup, backend skeleton (`app.js`, env config, Supabase client), frontend skeleton (routing, AuthContext placeholder). Everyone agrees on API contract (request/response shapes) before writing logic.
2. **Day 2:** Person 1 & 2 build core CRUD APIs in parallel; Person 4 builds login/admin UI against mocked responses if backend isn't ready yet.
3. **Day 3:** Person 5 builds task board UI against the real Tasks API; Person 3 starts Socket.io server and notification triggers.
4. **Day 4:** Integrate real-time end-to-end; Person 3 runs the security hardening pass across all routes.
5. **Day 5:** Person 5 finalizes Docker/CI/CD and deploys; everyone writes their module docs; final README + Swagger compiled; full regression test of the deployed app.