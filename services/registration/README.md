# Registration Service

UIT Đăng ký học phần - Student enrollment (enroll, cancel, list). Validates capacity and schedule conflict; publishes events to RabbitMQ for Notification Service.

## Endpoints (via gateway: /api/registrations/...)

- `GET /available-classes` - List open classes with registered count (query: semester, academicYear).
- `POST /enroll` - Body: `{ classIds: string[] }`. Requires JWT. Validates full class and schedule conflict.
- `GET /my-classes` - Requires JWT. Returns current user's enrolled classes.
- `POST /cancel/:enrollmentId` - Requires JWT. Cancel one enrollment.

Events published to RabbitMQ exchange `registration.events`: `registration.enrolled`, `registration.cancelled`, `registration.failed_full`, `registration.failed_conflict`.
