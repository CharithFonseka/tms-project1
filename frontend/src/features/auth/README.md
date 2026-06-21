# Auth Module

## Routes
- `/login` — public, renders `LoginPage`
- `/reset-password` — protected (must be logged in), renders `ResetPasswordPage`. Used when `user.mustResetPassword` is `true` after login.

## Auth state
Provided by `AuthContext` (`src/context/AuthContext.jsx`), wraps the whole app in `App.jsx`.
- `user` — current logged-in user object, or `null`
- `loading` — `true` briefly on first load while session is restored from `sessionStorage`
- `login(email, password)` — calls `POST /api/auth/login`, stores user, returns user data
- `logout()` — clears user from state and storage

## API functions used (`src/api/authApi.js`)
- `loginRequest(email, password)` → `POST /auth/login`
- `resetPasswordRequest(oldPassword, newPassword)` → `PUT /auth/reset-password`
