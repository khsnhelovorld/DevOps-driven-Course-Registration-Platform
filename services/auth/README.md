# Auth Service

JWT auth (roles: admin, student). Requires PostgreSQL; run root database migrations and seed first.

```bash
npm install
npm run start:dev
```

**Endpoints** (gateway prefix `/api/auth`):
- `POST /login` — Body: `{ studentId, password }`. Returns `{ accessToken, user }`.
- `GET /me` — Requires `Authorization: Bearer <token>`.
- `POST /logout` — Requires JWT.
