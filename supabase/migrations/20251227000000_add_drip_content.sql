-- Migration: Add drip content (locked modules) and member tracking
-- Allows modules to unlock after X days from enrollment, with manual override

-- ============================================================================
-- 1. Add unlock_after_days to modules table
-- ============================================================================
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS unlock_after_days INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN modules.unlock_after_days IS 'Number of days after enrollment before this module unlocks. 0 = immediate.';

-- ============================================================================
-- 2. Add enrolled_at to user_course_progress table
-- ============================================================================
ALTER TABLE user_course_progress
ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN user_course_progress.enrolled_at IS 'When the user enrolled in this course. Used for drip content calculations.';

-- Backfill existing records: use started_at if available, otherwise now()
UPDATE user_course_progress
SET enrolled_at = COALESCE(started_at, NOW())
WHERE enrolled_at IS NULL;

-- ============================================================================
-- 3. Create user_module_unlocks table for manual overrides
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_module_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  unlocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, module_id)
);

COMMENT ON TABLE user_module_unlocks IS 'Manual module unlocks by admin. Overrides drip schedule.';
COMMENT ON COLUMN user_module_unlocks.unlocked_by IS 'Admin user who granted the unlock.';
COMMENT ON COLUMN user_module_unlocks.notes IS 'Optional reason for manual unlock.';

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_user_module_unlocks_user_id ON user_module_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_unlocks_module_id ON user_module_unlocks(module_id);

-- ============================================================================
-- 4. RLS Policies for user_module_unlocks
-- ============================================================================
ALTER TABLE user_module_unlocks ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies for user_module_unlocks are created in the multi-tenancy
-- migration (20251228000000_add_multi_tenancy.sql) which uses tenant-based auth

-- ============================================================================
-- 5. Function to check if a module is unlocked for a user
-- ============================================================================
CREATE OR REPLACE FUNCTION is_module_unlocked(
  p_user_id UUID,
  p_module_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_manual_unlock BOOLEAN;
  v_unlock_after_days INTEGER;
  v_enrolled_at TIMESTAMPTZ;
  v_course_id UUID;
BEGIN
  -- Check for manual unlock first
  SELECT EXISTS(
    SELECT 1 FROM user_module_unlocks
    WHERE user_id = p_user_id AND module_id = p_module_id
  ) INTO v_manual_unlock;

  IF v_manual_unlock THEN
    RETURN TRUE;
  END IF;

  -- Get module's unlock_after_days and course_id
  SELECT unlock_after_days, course_id
  INTO v_unlock_after_days, v_course_id
  FROM modules
  WHERE id = p_module_id;

  IF v_unlock_after_days IS NULL THEN
    RETURN FALSE; -- Module not found
  END IF;

  -- Get user's enrollment date for this course
  SELECT enrolled_at
  INTO v_enrolled_at
  FROM user_course_progress
  WHERE user_id = p_user_id AND course_id = v_course_id;

  IF v_enrolled_at IS NULL THEN
    RETURN FALSE; -- Not enrolled
  END IF;

  -- Check if enough days have passed
  RETURN NOW() >= (v_enrolled_at + (v_unlock_after_days || ' days')::INTERVAL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. Function to get module unlock date for a user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_module_unlock_date(
  p_user_id UUID,
  p_module_id UUID
) RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_unlock_after_days INTEGER;
  v_enrolled_at TIMESTAMPTZ;
  v_course_id UUID;
BEGIN
  -- Get module's unlock_after_days and course_id
  SELECT unlock_after_days, course_id
  INTO v_unlock_after_days, v_course_id
  FROM modules
  WHERE id = p_module_id;

  IF v_unlock_after_days IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get user's enrollment date
  SELECT enrolled_at
  INTO v_enrolled_at
  FROM user_course_progress
  WHERE user_id = p_user_id AND course_id = v_course_id;

  IF v_enrolled_at IS NULL THEN
    RETURN NULL; -- Not enrolled
  END IF;

  RETURN v_enrolled_at + (v_unlock_after_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. Set default unlock_after_days for existing modules
-- ============================================================================
-- TRX Course modules
UPDATE modules SET unlock_after_days = 0 WHERE order_index = 1; -- Beginner: immediate
UPDATE modules SET unlock_after_days = 35 WHERE order_index = 2; -- Intermediate: 5 weeks
UPDATE modules SET unlock_after_days = 70 WHERE order_index = 3; -- Advanced: 10 weeks
