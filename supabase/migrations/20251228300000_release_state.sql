-- Release State: Proper cohort-ready model
-- Replaces is_published with status (draft/scheduled/live) + release_at

-- ============================================
-- 1. COURSE RELEASE STATE
-- ============================================

-- Add status enum type
DO $$ BEGIN
  CREATE TYPE course_status AS ENUM ('draft', 'scheduled', 'live');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add status and release_at to courses
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS status course_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS release_at TIMESTAMPTZ;

-- Migrate existing data: is_published=true -> live, is_published=false -> draft
UPDATE courses
SET status = CASE
  WHEN is_published = true THEN 'live'::course_status
  ELSE 'draft'::course_status
END
WHERE status IS NULL OR status = 'draft';

-- Set release_at for live courses to their published_at or created_at
UPDATE courses
SET release_at = COALESCE(published_at, created_at)
WHERE status = 'live' AND release_at IS NULL;

-- ============================================
-- 2. MODULE RELEASE OVERRIDE (optional per-module release)
-- ============================================

ALTER TABLE modules
ADD COLUMN IF NOT EXISTS release_at TIMESTAMPTZ;

-- ============================================
-- 3. HELPER FUNCTION: Calculate effective start date
-- ============================================

-- For a user in a course, the effective start is the later of:
-- 1. Course release_at (when the course went live)
-- 2. User's enrolled_at (when they joined)
CREATE OR REPLACE FUNCTION get_effective_start(
  p_course_release_at TIMESTAMPTZ,
  p_enrolled_at TIMESTAMPTZ
) RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN GREATEST(
    COALESCE(p_course_release_at, p_enrolled_at),
    p_enrolled_at
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 4. HELPER FUNCTION: Check if module is unlocked
-- ============================================

CREATE OR REPLACE FUNCTION is_module_unlocked(
  p_user_id UUID,
  p_module_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_course_release_at TIMESTAMPTZ;
  v_module_release_at TIMESTAMPTZ;
  v_module_unlock_days INTEGER;
  v_enrolled_at TIMESTAMPTZ;
  v_effective_start TIMESTAMPTZ;
  v_unlock_date TIMESTAMPTZ;
  v_has_manual_unlock BOOLEAN;
  v_has_completed_lesson BOOLEAN;
BEGIN
  -- Get module and course info
  SELECT
    c.release_at,
    m.release_at,
    m.unlock_after_days
  INTO v_course_release_at, v_module_release_at, v_module_unlock_days
  FROM modules m
  JOIN courses c ON m.course_id = c.id
  WHERE m.id = p_module_id;

  -- Get enrollment info
  SELECT enrolled_at INTO v_enrolled_at
  FROM user_course_progress
  WHERE user_id = p_user_id
    AND course_id = (SELECT course_id FROM modules WHERE id = p_module_id)
    AND status = 'active';

  IF v_enrolled_at IS NULL THEN
    RETURN FALSE; -- Not enrolled
  END IF;

  -- Check manual unlock
  SELECT EXISTS(
    SELECT 1 FROM user_module_unlocks
    WHERE user_id = p_user_id AND module_id = p_module_id
  ) INTO v_has_manual_unlock;

  IF v_has_manual_unlock THEN
    RETURN TRUE;
  END IF;

  -- Check if user has completed any lesson in this module (completion overrides lock)
  SELECT EXISTS(
    SELECT 1 FROM user_lesson_progress ulp
    JOIN lessons l ON ulp.lesson_id = l.id
    WHERE ulp.user_id = p_user_id
      AND l.module_id = p_module_id
      AND ulp.is_complete = true
  ) INTO v_has_completed_lesson;

  IF v_has_completed_lesson THEN
    RETURN TRUE;
  END IF;

  -- Calculate effective start and unlock date
  v_effective_start := get_effective_start(v_course_release_at, v_enrolled_at);

  -- Module-level release override
  IF v_module_release_at IS NOT NULL AND NOW() < v_module_release_at THEN
    RETURN FALSE;
  END IF;

  -- Time-based unlock
  v_unlock_date := v_effective_start + (COALESCE(v_module_unlock_days, 0) || ' days')::INTERVAL;

  RETURN NOW() >= v_unlock_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 5. UPDATE RLS POLICIES FOR STATUS-BASED ACCESS
-- ============================================

-- Drop and recreate course RLS to use status
DROP POLICY IF EXISTS "Members can view published courses" ON courses;
CREATE POLICY "Members can view live/scheduled courses" ON courses
  FOR SELECT USING (
    -- Draft: only content managers can see
    (status = 'draft' AND can_manage_tenant_content(auth.uid(), tenant_id))
    OR
    -- Scheduled/Live: all tenant members can see
    (status IN ('scheduled', 'live') AND is_tenant_member(auth.uid(), tenant_id))
  );

-- ============================================
-- 6. BACKFILL: Ensure all published courses are 'live'
-- ============================================

UPDATE courses
SET status = 'live'
WHERE is_published = true AND status != 'live';

UPDATE courses
SET status = 'draft'
WHERE is_published = false AND status = 'live';
