# UIT Đăng ký học phần (Course Registration) - Microservices

Local setup with Docker Compose. Tech stack: NestJS (backend), React + Vite + Tailwind + Ant Design (frontend), PostgreSQL, Redis, RabbitMQ.

## Prerequisites

- Docker and Docker Compose
- Node 20+ (for local dev without Docker)

## Quick start (Docker Compose)

1. Copy environment file and optionally adjust:
   ```bash
   cp .env.example .env
   ```

2. Run database migrations (after Postgres is up). Wait ~5–10 seconds after starting Postgres, then:

   **Linux/macOS (bash):**
   ```bash
   docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp < database/migrations/001_users.sql
   docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp < database/migrations/002_courses_classes.sql
   docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp < database/migrations/003_enrollments.sql
   docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp < database/seed.sql
   ```

   **Windows (PowerShell)**:
   ```powershell
   Get-Content database\migrations\001_users.sql | docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp
   Get-Content database\migrations\002_courses_classes.sql | docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp
   Get-Content database\migrations\003_enrollments.sql | docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp
   Get-Content database\seed.sql | docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp
   ```

3. Start all services:
   ```bash
   docker compose up -d
   ```
   To rebuild: `docker compose down --rmi local` then `docker compose up -d --build`.

4. Open http://localhost:8080 (gateway port; set `GATEWAY_PORT` in `.env` if you prefer another port). Login with seed user: **Mã sinh viên** `23520718`, **Mật khẩu** `password`. Admin: `admin` / `password`. (To use `password`, generate a bcrypt hash from `services/auth` and update `database/seed.sql`.)

## Project structure

- `api-gateway/` – Nginx config (proxy + static frontend when built via Dockerfile.gateway)
- `frontend/` – React SPA (Vite, Tailwind, Ant Design)
- `services/auth/` – Auth service (JWT, login/me/logout)
- `services/course/` – Course service (Excel upload, list, stats)
- `services/registration/` – Registration service (enroll, cancel, conflict/capacity checks)
- `services/notification/` – Notification service (RabbitMQ consumer, Mailtrap email)
- `database/migrations/` – SQL migrations
- `docker-compose.yml` – Full stack
- `Dockerfile.gateway` – Builds frontend and Nginx (build from repo root)

## Local development (without Docker for backend)

1. Start only infrastructure: `docker compose up -d postgres redis rabbitmq`
2. Run migrations (see above).
3. In separate terminals, from each service folder: `npm install` then `npm run start:dev`
   - `services/auth`, `services/course`, `services/registration`, `services/notification`
4. Frontend: `cd frontend` -> `npm install` -> `npm run dev` (Vite proxies /api to port 80; run Nginx locally or set `VITE_API_BASE_URL=http://localhost:3001` etc. and proxy per service, or run a local Nginx with same config.)

## Environment variables

See `.env.example`. Key variables: `POSTGRES_*`, `REDIS_URL`, `RABBITMQ_*`, `JWT_SECRET`, `MAILTRAP_*` for email testing.

## Requirements

- See each service `README.md` and `package.json` for Node/npm scripts.
- Root `.env.example` lists all variables for setup.

## Copyright
This website is designed and implemented based on the Course Registration system of the University of Information Technology. It is developed solely for the NT548 course project and is intended for academic purposes only. It is not used for any commercial purposes or any improper activities.