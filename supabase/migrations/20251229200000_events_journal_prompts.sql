-- Migration: Add Events, Journaling, and Lesson Prompts
-- Features:
--   1. Events - First-class calendar events with tenant/course visibility
--   2. Journaling - Staff-visible journal entries with comments and read receipts
--   3. Lesson Prompts - Dynamic assignments with responses and feedback

-- ============================================================================
-- 0. DROP LEGACY TABLES (unused from old project scaffold)
-- ============================================================================

DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- ============================================================================
-- 1. EVENTS TABLE
-- ============================================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  meeting_url TEXT,
  replay_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'tenant_members' CHECK (visibility IN ('tenant_members', 'course_enrolled')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_tenant_starts ON events(tenant_id, starts_at);
CREATE INDEX idx_events_course ON events(course_id) WHERE course_id IS NOT NULL;

COMMENT ON TABLE events IS 'Calendar events for live sessions and calls';
COMMENT ON COLUMN events.visibility IS 'tenant_members = all tenant members, course_enrolled = only enrolled users';

-- ============================================================================
-- 2. JOURNAL TABLES
-- ============================================================================

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title TEXT,
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'staff' CHECK (visibility IN ('staff', 'cohort')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journal_entries_tenant_created ON journal_entries(tenant_id, created_at DESC);
CREATE INDEX idx_journal_entries_author ON journal_entries(author_user_id);
CREATE INDEX idx_journal_entries_status ON journal_entries(tenant_id, status);
CREATE INDEX idx_journal_entries_lesson ON journal_entries(lesson_id) WHERE lesson_id IS NOT NULL;

COMMENT ON TABLE journal_entries IS 'User journal/reflection entries visible to staff';
COMMENT ON COLUMN journal_entries.visibility IS 'staff = visible to staff only, cohort = visible to cohort (future)';

CREATE TABLE journal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journal_comments_entry ON journal_comments(entry_id, created_at);

COMMENT ON TABLE journal_comments IS 'Comments on journal entries from staff or author';

CREATE TABLE journal_read_receipts (
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  staff_user_id UUID NOT NULL REFERENCES profiles(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (entry_id, staff_user_id)
);

CREATE INDEX idx_journal_read_receipts_staff ON journal_read_receipts(tenant_id, staff_user_id);

COMMENT ON TABLE journal_read_receipts IS 'Tracks which staff have read which entries';

-- ============================================================================
-- 3. LESSON PROMPTS TABLES
-- ============================================================================

CREATE TABLE lesson_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt_body TEXT NOT NULL,
  response_schema JSONB NOT NULL DEFAULT '[]',
  required BOOLEAN NOT NULL DEFAULT FALSE,
  due_mode TEXT NOT NULL DEFAULT 'none' CHECK (due_mode IN ('none', 'relative_days', 'fixed_date')),
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lesson_prompts_lesson ON lesson_prompts(lesson_id);

COMMENT ON TABLE lesson_prompts IS 'Assignments/prompts attached to lessons';
COMMENT ON COLUMN lesson_prompts.response_schema IS 'JSON array defining fields: [{id, type, label, placeholder, required}]';
COMMENT ON COLUMN lesson_prompts.due_mode IS 'none = no due date, relative_days = days from lesson access, fixed_date = specific date';

CREATE TABLE prompt_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES lesson_prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  response JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(prompt_id, user_id)
);

CREATE INDEX idx_prompt_responses_prompt_user ON prompt_responses(prompt_id, user_id);
CREATE INDEX idx_prompt_responses_status ON prompt_responses(tenant_id, status);

COMMENT ON TABLE prompt_responses IS 'User responses to lesson prompts';
COMMENT ON COLUMN prompt_responses.response IS 'JSON object with field answers: {field_id: answer}';

CREATE TABLE prompt_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  response_id UUID NOT NULL REFERENCES prompt_responses(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prompt_feedback_response ON prompt_feedback(response_id, created_at);

COMMENT ON TABLE prompt_feedback IS 'Staff feedback on prompt responses';

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Get tenant_id from a lesson (through module -> course)
CREATE OR REPLACE FUNCTION get_lesson_tenant_id(p_lesson_id UUID)
RETURNS UUID AS $$
  SELECT c.tenant_id
  FROM lessons l
  JOIN modules m ON m.id = l.module_id
  JOIN courses c ON c.id = m.course_id
  WHERE l.id = p_lesson_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user can view an event based on visibility rules
CREATE OR REPLACE FUNCTION can_view_event(p_user_id UUID, p_event_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = p_event_id
    AND is_tenant_member(p_user_id, e.tenant_id)
    AND (
      e.visibility = 'tenant_members'
      OR (
        e.visibility = 'course_enrolled'
        AND EXISTS (
          SELECT 1 FROM user_course_progress ucp
          WHERE ucp.user_id = p_user_id
          AND ucp.course_id = e.course_id
          AND ucp.status = 'active'
        )
      )
    )
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- 5. ENABLE RLS
-- ============================================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. EVENTS RLS POLICIES
-- ============================================================================

-- Members can view events based on visibility
CREATE POLICY "Members can view visible events"
  ON events FOR SELECT
  USING (
    is_tenant_member(auth.uid(), tenant_id)
    AND (
      visibility = 'tenant_members'
      OR (
        visibility = 'course_enrolled'
        AND EXISTS (
          SELECT 1 FROM user_course_progress ucp
          WHERE ucp.user_id = auth.uid()
          AND ucp.course_id = events.course_id
          AND ucp.status = 'active'
        )
      )
    )
  );

-- Content managers can create events
CREATE POLICY "Content managers can create events"
  ON events FOR INSERT
  WITH CHECK (can_manage_tenant_content(auth.uid(), tenant_id));

-- Content managers can update events
CREATE POLICY "Content managers can update events"
  ON events FOR UPDATE
  USING (can_manage_tenant_content(auth.uid(), tenant_id));

-- Content managers can delete events
CREATE POLICY "Content managers can delete events"
  ON events FOR DELETE
  USING (can_manage_tenant_content(auth.uid(), tenant_id));

-- ============================================================================
-- 7. JOURNAL ENTRIES RLS POLICIES
-- ============================================================================

-- Author can view own entries
CREATE POLICY "Authors can view own journal entries"
  ON journal_entries FOR SELECT
  USING (author_user_id = auth.uid());

-- Staff can view all entries in tenant
CREATE POLICY "Staff can view all journal entries"
  ON journal_entries FOR SELECT
  USING (can_manage_tenant_content(auth.uid(), tenant_id));

-- Tenant members can create entries
CREATE POLICY "Members can create journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (
    author_user_id = auth.uid()
    AND is_tenant_member(auth.uid(), tenant_id)
  );

-- Author can update own active entries
CREATE POLICY "Authors can update own journal entries"
  ON journal_entries FOR UPDATE
  USING (author_user_id = auth.uid() AND status = 'active')
  WITH CHECK (author_user_id = auth.uid());

-- Staff can update entries (for status changes)
CREATE POLICY "Staff can update journal entries"
  ON journal_entries FOR UPDATE
  USING (can_manage_tenant_content(auth.uid(), tenant_id));

-- Author can delete own draft entries (use status change instead in practice)
CREATE POLICY "Authors can delete own draft entries"
  ON journal_entries FOR DELETE
  USING (author_user_id = auth.uid() AND status = 'active');

-- ============================================================================
-- 8. JOURNAL COMMENTS RLS POLICIES
-- ============================================================================

-- Entry author and staff can view comments
CREATE POLICY "Entry authors and staff can view comments"
  ON journal_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = journal_comments.entry_id
      AND (
        je.author_user_id = auth.uid()
        OR can_manage_tenant_content(auth.uid(), je.tenant_id)
      )
    )
  );

-- Entry author and staff can create comments
CREATE POLICY "Entry authors and staff can create comments"
  ON journal_comments FOR INSERT
  WITH CHECK (
    author_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = entry_id
      AND (
        je.author_user_id = auth.uid()
        OR can_manage_tenant_content(auth.uid(), je.tenant_id)
      )
    )
  );

-- ============================================================================
-- 9. JOURNAL READ RECEIPTS RLS POLICIES
-- ============================================================================

-- Staff can view read receipts
CREATE POLICY "Staff can view read receipts"
  ON journal_read_receipts FOR SELECT
  USING (can_manage_tenant_content(auth.uid(), tenant_id));

-- Staff can create read receipts
CREATE POLICY "Staff can create read receipts"
  ON journal_read_receipts FOR INSERT
  WITH CHECK (
    staff_user_id = auth.uid()
    AND can_manage_tenant_content(auth.uid(), tenant_id)
  );

-- Staff can update read receipts
CREATE POLICY "Staff can update read receipts"
  ON journal_read_receipts FOR UPDATE
  USING (
    staff_user_id = auth.uid()
    AND can_manage_tenant_content(auth.uid(), tenant_id)
  );

-- ============================================================================
-- 10. LESSON PROMPTS RLS POLICIES
-- ============================================================================

-- Members can view prompts for lessons in their tenant
CREATE POLICY "Members can view prompts"
  ON lesson_prompts FOR SELECT
  USING (is_tenant_member(auth.uid(), tenant_id));

-- Content managers can create prompts
CREATE POLICY "Content managers can create prompts"
  ON lesson_prompts FOR INSERT
  WITH CHECK (can_manage_tenant_content(auth.uid(), tenant_id));

-- Content managers can update prompts
CREATE POLICY "Content managers can update prompts"
  ON lesson_prompts FOR UPDATE
  USING (can_manage_tenant_content(auth.uid(), tenant_id));

-- Content managers can delete prompts
CREATE POLICY "Content managers can delete prompts"
  ON lesson_prompts FOR DELETE
  USING (can_manage_tenant_content(auth.uid(), tenant_id));

-- ============================================================================
-- 11. PROMPT RESPONSES RLS POLICIES
-- ============================================================================

-- Users can view own responses
CREATE POLICY "Users can view own responses"
  ON prompt_responses FOR SELECT
  USING (user_id = auth.uid());

-- Staff can view all responses in tenant
CREATE POLICY "Staff can view all responses"
  ON prompt_responses FOR SELECT
  USING (can_manage_tenant_content(auth.uid(), tenant_id));

-- Users can create own responses
CREATE POLICY "Users can create own responses"
  ON prompt_responses FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND is_tenant_member(auth.uid(), tenant_id)
  );

-- Users can update own responses (draft or submitted for revision)
CREATE POLICY "Users can update own responses"
  ON prompt_responses FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Staff can update responses (for reviewed status)
CREATE POLICY "Staff can update responses"
  ON prompt_responses FOR UPDATE
  USING (can_manage_tenant_content(auth.uid(), tenant_id));

-- ============================================================================
-- 12. PROMPT FEEDBACK RLS POLICIES
-- ============================================================================

-- Response owner and staff can view feedback
CREATE POLICY "Response owners and staff can view feedback"
  ON prompt_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prompt_responses pr
      WHERE pr.id = prompt_feedback.response_id
      AND (
        pr.user_id = auth.uid()
        OR can_manage_tenant_content(auth.uid(), pr.tenant_id)
      )
    )
  );

-- Staff can create feedback
CREATE POLICY "Staff can create feedback"
  ON prompt_feedback FOR INSERT
  WITH CHECK (
    author_user_id = auth.uid()
    AND can_manage_tenant_content(auth.uid(), tenant_id)
  );

-- ============================================================================
-- 13. TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_prompts_updated_at
  BEFORE UPDATE ON lesson_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_responses_updated_at
  BEFORE UPDATE ON prompt_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
