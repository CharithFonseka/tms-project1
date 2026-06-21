# OWASP Top 10 Review — Task Management System

| Risk | Status | Where addressed |
|---|---|---|
| A01 Broken Access Control | ✅ | rbac.middleware.js on every protected route; Collaborator-scoped queries in tasks.service.js |
| A02 Cryptographic Failures | ✅ | bcrypt for passwords (10 salt rounds); JWT signed with secret; HTTPS enforced in deployment |
| A03 Injection | ✅ | All queries via Supabase JS client (parameterized); no raw SQL string concatenation anywhere |
| A04 Insecure Design | ✅ | RBAC enforced at middleware layer, not just UI; mandatory password reset on first login |
| A05 Security Misconfiguration | ✅ | helmet() applied; CORS restricted to known frontend origin in production; .env gitignored |
| A06 Vulnerable Components | ⚠️ | Run `npm audit`, patch any high/critical findings before final submission |
| A07 Identification & Auth Failures | ✅ | Rate limiting on login; generic "Invalid credentials" message; JWT expiry enforced |
| A08 Software & Data Integrity | ✅ | JWT signature verified on every request; no client-supplied data trusted for authorization |
| A09 Logging & Monitoring | ⚠️ | Basic console logging on 500 errors; consider structured logging if time allows |
| A10 Server-Side Request Forgery | N/A | App makes no outbound requests based on user-supplied URLs |