# Course Service

UIT Đăng ký học phần - Course and class management (Excel upload, list, stats).

## Setup

- Node 20+, PostgreSQL (run DB migrations; same DB as Auth/Registration).
- Copy `.env.example` to `.env`.

## Endpoints (via gateway: /api/courses/...)

- `GET /` - List open classes (query: semester, academicYear). Returns classes with course and registeredCount.
- `GET /stats` - Stats: classId, classCode, courseCode, courseName, maxStudents, registeredCount.
- `POST /admin/upload` - Multipart form field `file`: .xlsx with sheets "TKB LT" (theory) and "TKB TH" (practice). Columns: Mã MH, Mã Lớp, Tên Môn Học, Sĩ Số, Tổ TC/Số TC, Thứ, Tiết, Phòng học, Giảng viên, NBD/NHĐ, NKT, etc.

## Excel format

Two sheets: Lý thuyết (LT) and Thực hành (TH). Header row must contain Vietnamese column names (MÃ MH, MÃ LỚP, TÊN MÔN HỌC, SĨ SỐ, ...). Empty or `*` treated as not set.
