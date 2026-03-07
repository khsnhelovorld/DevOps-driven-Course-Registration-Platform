-- Seed test users. Passwords: password (bcrypt rounds=10)
-- Generate new hash: cd services/auth; node -e "require('bcrypt').hash('password',10).then(console.log)"

INSERT INTO users (id, student_id, password_hash, full_name, faculty, batch, role, email) VALUES
  (uuid_generate_v4(), '23520718', '$2b$10$Oa0KalPx947PxuKXoTqXM.rWYcxWQYLlMqmOOyHtv.W39S0I7uTnm', 'Huỳnh Quốc Khánh', 'Khoa MMT&TT', '18', 'student', 'student@example.com'),
  (uuid_generate_v4(), 'admin', '$2b$10$Oa0KalPx947PxuKXoTqXM.rWYcxWQYLlMqmOOyHtv.W39S0I7uTnm', 'Admin User', NULL, NULL, 'admin', 'admin@example.com')
ON CONFLICT (student_id) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  faculty = EXCLUDED.faculty,
  batch = EXCLUDED.batch,
  role = EXCLUDED.role,
  email = EXCLUDED.email;
