-- Add SM-2 spaced repetition fields to user_flashcards table
ALTER TABLE user_flashcards ADD COLUMN IF NOT EXISTS difficulty INTEGER DEFAULT 0;
ALTER TABLE user_flashcards ADD COLUMN IF NOT EXISTS interval INTEGER DEFAULT 0;
ALTER TABLE user_flashcards ADD COLUMN IF NOT EXISTS ease INTEGER DEFAULT 250;
ALTER TABLE user_flashcards ADD COLUMN IF NOT EXISTS repetition INTEGER DEFAULT 0;
ALTER TABLE user_flashcards ADD COLUMN IF NOT EXISTS next_review TIMESTAMPTZ;
ALTER TABLE user_flashcards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Ensure highlights table exists (it should, but for completeness)
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id),
  page INT NOT NULL,
  text TEXT NOT NULL,
  color TEXT DEFAULT 'yellow',
  bbox JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
