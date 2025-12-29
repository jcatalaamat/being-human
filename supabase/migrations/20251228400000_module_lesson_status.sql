-- Module & Lesson Status: Add draft/scheduled/live status to modules and lessons
-- Allows content creators to control visibility at every level

-- ============================================
-- 1. REUSE EXISTING ENUM (or create if needed)
-- ============================================

-- course_status enum already exists from release_state migration
-- We'll reuse it for modules and lessons

-- ============================================
-- 2. ADD STATUS TO MODULES
-- ============================================

ALTER TABLE modules
ADD COLUMN IF NOT EXISTS status course_status DEFAULT 'live',
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Backfill: existing modules default to 'live' (they were always visible)
UPDATE modules SET status = 'live' WHERE status IS NULL;
UPDATE modules SET is_published = true WHERE is_published IS NULL;

-- ============================================
-- 3. ADD STATUS TO LESSONS
-- ============================================

ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS status course_status DEFAULT 'live',
ADD COLUMN IF NOT EXISTS release_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Backfill: existing lessons default to 'live' (they were always visible)
UPDATE lessons SET status = 'live' WHERE status IS NULL;
UPDATE lessons SET is_published = true WHERE is_published IS NULL;

-- ============================================
-- 4. UPDATE RLS POLICIES
-- ============================================

-- Modules: users can only see live/scheduled modules (or if they manage content)
DROP POLICY IF EXISTS "Modules are viewable if course is accessible" ON modules;
CREATE POLICY "Modules viewable based on status" ON modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = modules.course_id
      AND (
        -- Content managers can see all modules
        can_manage_tenant_content(auth.uid(), c.tenant_id)
        OR
        -- Regular users can see live/scheduled modules in live/scheduled courses
        (
          c.status IN ('scheduled', 'live')
          AND modules.status IN ('scheduled', 'live')
          AND is_tenant_member(auth.uid(), c.tenant_id)
        )
      )
    )
  );

-- Lessons: users can only see live/scheduled lessons
DROP POLICY IF EXISTS "Lessons are viewable if module is accessible" ON lessons;
CREATE POLICY "Lessons viewable based on status" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON c.id = m.course_id
      WHERE m.id = lessons.module_id
      AND (
        -- Content managers can see all lessons
        can_manage_tenant_content(auth.uid(), c.tenant_id)
        OR
        -- Regular users can see live/scheduled lessons in accessible modules/courses
        (
          c.status IN ('scheduled', 'live')
          AND m.status IN ('scheduled', 'live')
          AND lessons.status IN ('scheduled', 'live')
          AND is_tenant_member(auth.uid(), c.tenant_id)
        )
      )
    )
  );

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_modules_status ON modules(status);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
