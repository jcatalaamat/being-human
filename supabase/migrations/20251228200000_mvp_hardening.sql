-- MVP Hardening: Access revocation, publish enforcement, activity logging

-- ============================================
-- 1. ENROLLMENT STATUS (active/revoked)
-- ============================================

-- Add status to user_course_progress
ALTER TABLE user_course_progress
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked'));

-- Add revoked metadata
ALTER TABLE user_course_progress
ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS revoked_by UUID REFERENCES auth.users(id);

-- Index for filtering active enrollments
CREATE INDEX IF NOT EXISTS idx_user_course_progress_status
ON user_course_progress(status) WHERE status = 'active';

-- ============================================
-- 2. PUBLISHED_AT TIMESTAMPS
-- ============================================

-- Courses already have is_published, add published_at for audit
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Backfill: set published_at for already-published courses
UPDATE courses SET published_at = updated_at WHERE is_published = true AND published_at IS NULL;

-- Add is_published and published_at to modules
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Backfill modules as published
UPDATE modules SET published_at = created_at WHERE is_published = true AND published_at IS NULL;

-- Add is_published and published_at to lessons
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Backfill lessons as published
UPDATE lessons SET published_at = created_at WHERE is_published = true AND published_at IS NULL;

-- ============================================
-- 3. ACTIVITY LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activity_log_tenant ON activity_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);

-- RLS for activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Admins can view their tenant's activity
CREATE POLICY "Admins can view tenant activity" ON activity_log
  FOR SELECT USING (
    can_admin_tenant(auth.uid(), tenant_id)
  );

-- System can insert (via service role)
CREATE POLICY "System can insert activity" ON activity_log
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 4. HELPER FUNCTION: Log Activity
-- ============================================

CREATE OR REPLACE FUNCTION log_activity(
  p_tenant_id UUID,
  p_user_id UUID,
  p_actor_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_log (tenant_id, user_id, actor_id, action, entity_type, entity_id, metadata)
  VALUES (p_tenant_id, p_user_id, p_actor_id, p_action, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. AUTO-LOG TRIGGERS
-- ============================================

-- Log enrollment changes
CREATE OR REPLACE FUNCTION log_enrollment_change()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Get tenant_id from course
  SELECT tenant_id INTO v_tenant_id FROM courses WHERE id = COALESCE(NEW.course_id, OLD.course_id);

  IF TG_OP = 'INSERT' THEN
    PERFORM log_activity(v_tenant_id, NEW.user_id, NEW.user_id, 'enrollment.created', 'course', NEW.course_id);
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'revoked' THEN
      PERFORM log_activity(v_tenant_id, NEW.user_id, NEW.revoked_by, 'enrollment.revoked', 'course', NEW.course_id);
    ELSIF NEW.status = 'active' AND OLD.status = 'revoked' THEN
      PERFORM log_activity(v_tenant_id, NEW.user_id, NULL, 'enrollment.restored', 'course', NEW.course_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_enrollment ON user_course_progress;
CREATE TRIGGER trigger_log_enrollment
  AFTER INSERT OR UPDATE ON user_course_progress
  FOR EACH ROW
  EXECUTE FUNCTION log_enrollment_change();

-- Log lesson completion
CREATE OR REPLACE FUNCTION log_lesson_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_course_id UUID;
BEGIN
  IF NEW.is_complete = true AND (OLD IS NULL OR OLD.is_complete = false) THEN
    -- Get tenant_id via lesson -> module -> course
    SELECT c.tenant_id, c.id INTO v_tenant_id, v_course_id
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    JOIN courses c ON m.course_id = c.id
    WHERE l.id = NEW.lesson_id;

    PERFORM log_activity(v_tenant_id, NEW.user_id, NEW.user_id, 'lesson.completed', 'lesson', NEW.lesson_id,
      jsonb_build_object('course_id', v_course_id));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_lesson_completion ON user_lesson_progress;
CREATE TRIGGER trigger_log_lesson_completion
  AFTER INSERT OR UPDATE ON user_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION log_lesson_completion();

-- Log tenant membership changes
CREATE OR REPLACE FUNCTION log_membership_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_activity(NEW.tenant_id, NEW.user_id, NEW.invited_by, 'membership.created', 'tenant', NEW.tenant_id,
      jsonb_build_object('role', NEW.role));
  ELSIF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    PERFORM log_activity(NEW.tenant_id, NEW.user_id, NULL, 'membership.role_changed', 'tenant', NEW.tenant_id,
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role));
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_activity(OLD.tenant_id, OLD.user_id, NULL, 'membership.removed', 'tenant', OLD.tenant_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_membership ON tenant_memberships;
CREATE TRIGGER trigger_log_membership
  AFTER INSERT OR UPDATE OR DELETE ON tenant_memberships
  FOR EACH ROW
  EXECUTE FUNCTION log_membership_change();

-- Log module unlock overrides
CREATE OR REPLACE FUNCTION log_module_unlock()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Get tenant_id via module -> course
  SELECT c.tenant_id INTO v_tenant_id
  FROM modules m
  JOIN courses c ON m.course_id = c.id
  WHERE m.id = COALESCE(NEW.module_id, OLD.module_id);

  IF TG_OP = 'INSERT' THEN
    PERFORM log_activity(v_tenant_id, NEW.user_id, NEW.unlocked_by, 'module.unlocked', 'module', NEW.module_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_activity(v_tenant_id, OLD.user_id, NULL, 'module.lock_restored', 'module', OLD.module_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_module_unlock ON user_module_unlocks;
CREATE TRIGGER trigger_log_module_unlock
  AFTER INSERT OR DELETE ON user_module_unlocks
  FOR EACH ROW
  EXECUTE FUNCTION log_module_unlock();
