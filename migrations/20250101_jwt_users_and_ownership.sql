-- Migration: 20250101_jwt_users_and_ownership
-- Description: Create users table and add user_id to existing tables
-- NOTE: This is a destructive migration that resets user data to ensure schema consistency.

-- 1. Drop existing users table and cascade to remove constraints
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create users table with new schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at timestamptz DEFAULT now()
);

-- 3. Reset and add user_id columns to existing tables
-- We drop the column first to ensure we can re-add it with the correct foreign key constraint pointing to the new users table.

-- Documents
ALTER TABLE documents DROP COLUMN IF EXISTS user_id;
ALTER TABLE documents ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- MCQ Sets
ALTER TABLE mcq_sets DROP COLUMN IF EXISTS user_id;
ALTER TABLE mcq_sets ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Flashcard Sets
ALTER TABLE flashcard_sets DROP COLUMN IF EXISTS user_id;
ALTER TABLE flashcard_sets ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Summaries
ALTER TABLE summaries DROP COLUMN IF EXISTS user_id;
ALTER TABLE summaries ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Mindmaps
ALTER TABLE mindmaps DROP COLUMN IF EXISTS user_id;
ALTER TABLE mindmaps ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Notes
ALTER TABLE notes DROP COLUMN IF EXISTS user_id;
ALTER TABLE notes ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Quiz Results
ALTER TABLE quiz_results DROP COLUMN IF EXISTS user_id;
ALTER TABLE quiz_results ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Chat Sessions
ALTER TABLE chat_sessions DROP COLUMN IF EXISTS user_id;
ALTER TABLE chat_sessions ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Highlights
ALTER TABLE highlights DROP COLUMN IF EXISTS user_id;
ALTER TABLE highlights ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- User Notes
ALTER TABLE user_notes DROP COLUMN IF EXISTS user_id;
ALTER TABLE user_notes ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- User Flashcards
ALTER TABLE user_flashcards DROP COLUMN IF EXISTS user_id;
ALTER TABLE user_flashcards ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 4. Add Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_mcq_sets_user ON mcq_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user ON flashcard_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);
