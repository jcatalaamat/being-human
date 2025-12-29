-- Auto-enroll new tenant members in all published courses
-- This trigger fires when a user is added to a tenant

-- Function to auto-enroll user in all tenant's published courses
CREATE OR REPLACE FUNCTION auto_enroll_tenant_member()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert enrollment records for all published courses in the tenant
  INSERT INTO user_course_progress (user_id, course_id, enrolled_at, started_at)
  SELECT
    NEW.user_id,
    c.id,
    NOW(),
    NOW()
  FROM courses c
  WHERE c.tenant_id = NEW.tenant_id
    AND c.is_published = true
  ON CONFLICT (user_id, course_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on tenant_memberships insert
DROP TRIGGER IF EXISTS trigger_auto_enroll_on_join ON tenant_memberships;
CREATE TRIGGER trigger_auto_enroll_on_join
  AFTER INSERT ON tenant_memberships
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_tenant_member();

-- Also auto-enroll existing members when a new course is published
CREATE OR REPLACE FUNCTION auto_enroll_on_course_publish()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when course becomes published (was not published, now is)
  IF (OLD.is_published = false OR OLD.is_published IS NULL) AND NEW.is_published = true THEN
    -- Enroll all tenant members in this course
    INSERT INTO user_course_progress (user_id, course_id, enrolled_at, started_at)
    SELECT
      tm.user_id,
      NEW.id,
      NOW(),
      NOW()
    FROM tenant_memberships tm
    WHERE tm.tenant_id = NEW.tenant_id
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on courses update (when published)
DROP TRIGGER IF EXISTS trigger_auto_enroll_on_publish ON courses;
CREATE TRIGGER trigger_auto_enroll_on_publish
  AFTER UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_on_course_publish();

-- Backfill: Enroll all existing tenant members in published courses they're not yet enrolled in
INSERT INTO user_course_progress (user_id, course_id, enrolled_at, started_at)
SELECT DISTINCT
  tm.user_id,
  c.id,
  NOW(),
  NOW()
FROM tenant_memberships tm
CROSS JOIN courses c
WHERE c.tenant_id = tm.tenant_id
  AND c.is_published = true
  AND NOT EXISTS (
    SELECT 1 FROM user_course_progress ucp
    WHERE ucp.user_id = tm.user_id AND ucp.course_id = c.id
  )
ON CONFLICT (user_id, course_id) DO NOTHING;
