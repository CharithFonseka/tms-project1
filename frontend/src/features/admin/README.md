# Admin Module

## Routes
- `/users` — protected, requires `role: 'Admin'`, renders `UserList`

## What's on this page
- `UserList` — searchable, filterable, paginated table of users
- "Add User" button opens `UserForm` in a modal (create mode)
- "Deactivate" button per row opens a confirmation modal before calling the deactivate endpoint

## API functions used (`src/api/usersApi.js`)
- `listUsersRequest({ search, role, page, limit })` → `GET /users`
- `createUserRequest(payload)` → `POST /users`
- `updateUserRequest(id, payload)` → `PATCH /users/:id`
- `deactivateUserRequest(id)` → `PATCH /users/:id/deactivate`

## For Person 5
To link into this from elsewhere (e.g. a dashboard nav item), just link to `/users` — it's already protected and will redirect to `/login` automatically if the user isn't authenticated.
