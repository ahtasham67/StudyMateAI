-- Quiz Tables Migration for StudyMateAI
-- Run this script to create the necessary quiz tables

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    study_material_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    total_questions INTEGER,
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (study_material_id) REFERENCES study_materials(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER')),
    points INTEGER DEFAULT 1,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Create quiz_options table
CREATE TABLE IF NOT EXISTS quiz_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_number INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_study_material_id ON quizzes(study_material_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);

-- Create trigger to update updated_at timestamp for quizzes
CREATE OR REPLACE FUNCTION update_quiz_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quiz_updated_at_trigger
    BEFORE UPDATE ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_updated_at();

-- Create trigger to update updated_at timestamp for quiz_questions
CREATE TRIGGER update_quiz_question_updated_at_trigger
    BEFORE UPDATE ON quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_updated_at();

-- Create trigger to update updated_at timestamp for quiz_options
CREATE TRIGGER update_quiz_option_updated_at_trigger
    BEFORE UPDATE ON quiz_options
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_updated_at();

-- Insert sample data (optional, for testing)
-- Uncomment the lines below if you want to add sample quiz data

/*
-- Sample quiz (assumes study_material_id=1 and user_id=1 exist)
INSERT INTO quizzes (title, description, study_material_id, user_id, total_questions, duration_minutes)
VALUES ('Sample Mathematics Quiz', 'A quiz generated from calculus notes', 1, 1, 5, 15);

-- Sample questions (assumes quiz_id=1 exists)
INSERT INTO quiz_questions (quiz_id, question_number, question_text, question_type, points)
VALUES 
(1, 1, 'What is the derivative of x²?', 'MULTIPLE_CHOICE', 2),
(1, 2, 'The integral of sin(x) is -cos(x) + C', 'TRUE_FALSE', 1);

-- Sample options (assumes question_ids exist)
INSERT INTO quiz_options (question_id, option_number, option_text, is_correct)
VALUES 
(1, 1, '2x', true),
(1, 2, 'x', false),
(1, 3, 'x²', false),
(1, 4, '1', false),
(2, 1, 'True', true),
(2, 2, 'False', false);
*/
