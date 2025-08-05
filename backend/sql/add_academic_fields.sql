-- Add academic information fields to users table
-- Run this if Hibernate doesn't automatically create the columns

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS university_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS current_term VARCHAR(50),
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(50),
ADD COLUMN IF NOT EXISTS major VARCHAR(100),
ADD COLUMN IF NOT EXISTS year_of_study VARCHAR(50);

-- Add indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_users_university ON users(university_name);
CREATE INDEX IF NOT EXISTS idx_users_major ON users(major);

-- Add comments for documentation
COMMENT ON COLUMN users.university_name IS 'Name of the university/institution the student attends';
COMMENT ON COLUMN users.current_term IS 'Current academic term (e.g., Fall 2024, Spring 2025)';
COMMENT ON COLUMN users.academic_year IS 'Academic year (e.g., 2024-2025)';
COMMENT ON COLUMN users.major IS 'Student''s major or field of study';
COMMENT ON COLUMN users.year_of_study IS 'Current year of study (e.g., 1st Year, 2nd Year, Graduate)';
