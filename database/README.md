# Database migrations

Run migrations in order: 001_users, 002_courses_classes, 003_enrollments. Then run seed.sql.

**Docker (Linux/macOS):**
```bash
docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp < database/migrations/001_users.sql
docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp < database/migrations/002_courses_classes.sql
docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp < database/migrations/003_enrollments.sql
docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp < database/seed.sql
```

**Windows (PowerShell):**
```powershell
Get-Content database\migrations\001_users.sql | docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp
Get-Content database\migrations\002_courses_classes.sql | docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp
Get-Content database\migrations\003_enrollments.sql | docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp
Get-Content database\seed.sql | docker exec -i uit-dkhp-postgres psql -U uit -d uit_dkhp
```

Seed users: see `database/seed.sql` (passwords in root README).
