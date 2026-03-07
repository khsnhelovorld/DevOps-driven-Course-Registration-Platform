-- UIT Đăng ký học phần - Courses and classes (from Excel upload)
-- Run order: 002 (after 001)

CREATE TYPE sheet_type AS ENUM ('theory', 'practice');

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(32) NOT NULL,
    name VARCHAR(512) NOT NULL,
    credits INT NOT NULL DEFAULT 0,
    semester INT NOT NULL,
    academic_year INT NOT NULL,
    sheet_type sheet_type NOT NULL DEFAULT 'theory',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_code, semester, academic_year, sheet_type)
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    class_code VARCHAR(64) NOT NULL,
    max_students INT NOT NULL DEFAULT 0,
    day_of_week VARCHAR(16),
    periods VARCHAR(64),
    room VARCHAR(64),
    lecturer_id VARCHAR(32),
    lecturer_name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    bi_weekly VARCHAR(16),
    faculty_code VARCHAR(32),
    training_system VARCHAR(32),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_id, class_code)
);

CREATE INDEX idx_courses_code_semester_year ON courses(course_code, semester, academic_year);
CREATE INDEX idx_classes_course_id ON classes(course_id);
CREATE INDEX idx_classes_class_code ON classes(class_code);

COMMENT ON TABLE courses IS 'Course master from Excel (Mã MH, Tên Môn Học, Số TC)';
COMMENT ON TABLE classes IS 'Class sections from Excel (Mã Lớp, Sĩ số, Thứ, Tiết, Giảng viên, etc.)';
