# Notification Service

UIT Đăng ký học phần - Consumes registration events from RabbitMQ and sends confirmation emails (Mailtrap for local testing).

## Setup

Set MAILTRAP_USER and MAILTRAP_PASS in .env (from Mailtrap inbox). Events: registration.enrolled (send list of classes), registration.cancelled (send confirmation).
