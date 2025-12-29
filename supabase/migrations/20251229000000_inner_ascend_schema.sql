-- Inner Ascend Schema Updates
-- Adds new lesson type (live) and content categories

-- 1. Extend lesson_type constraint to include live type
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_lesson_type_check;
ALTER TABLE lessons ADD CONSTRAINT lessons_lesson_type_check
  CHECK (lesson_type IN ('video', 'audio', 'pdf', 'text', 'live'));

-- 2. Create content_category enum for semantic categorization
DO $$ BEGIN
  CREATE TYPE content_category AS ENUM (
    'orientation',
    'transmission',
    'clarification',
    'embodiment',
    'inquiry',
    'meditation',
    'assignment'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Add content_category column to lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_category content_category;

-- 4. Add live lesson fields
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS replay_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS meeting_url TEXT;

-- 5. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_lessons_content_category ON lessons(content_category);
CREATE INDEX IF NOT EXISTS idx_lessons_scheduled_at ON lessons(scheduled_at)
  WHERE lesson_type = 'live';

-- 6. Add comments for documentation
COMMENT ON COLUMN lessons.content_category IS 'Semantic category: orientation, transmission, clarification, embodiment, inquiry, meditation, assignment';
COMMENT ON COLUMN lessons.scheduled_at IS 'For live lessons: when the live call is scheduled (UTC)';
COMMENT ON COLUMN lessons.replay_url IS 'For live lessons: URL to watch replay after the call ends';
COMMENT ON COLUMN lessons.meeting_url IS 'For live lessons: Zoom/Meet URL for joining the live call';
