-- Seed data for Inner Ascend - A 12-Month Journey of Awakening
-- Month One: Foundations of Self-Awareness (4 weeks, 28 lessons)

-- ============================================================================
-- TENANT: Create default tenant for Inner Ascend
-- ============================================================================
INSERT INTO tenants (id, name, slug)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Inner Ascend',
  'inner-ascend'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug;

-- ============================================================================
-- COURSE: Inner Ascend
-- ============================================================================
INSERT INTO courses (id, tenant_id, title, description, cover_url, status, is_published, instructor_id)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Inner Ascend: A 12-Month Journey of Awakening',
  E'**Month One: Foundations of Self-Awareness**\n\nThis transformative journey begins with the essential foundation: learning to see ourselves clearly, without judgment, and without the agenda to fix.\n\nOver these four weeks, you will:\n- Discover the observer within — the awareness that exists prior to thought\n- Reframe your relationship with ego from enemy to adaptive ally\n- Understand how shame became encoded in your nervous system\n- Reclaim your inner authority and trust your own knowing\n\n**Weekly Structure:**\n- Weekly Orientation (2-3 min)\n- Deep Transmission Teaching (10-20 min)\n- Live Clarification Call (60-90 min)\n- Embodiment Practice (5-10 min)\n- Living Inquiry for Daily Life\n- Guided Meditation (10-20 min)\n- Deeper Assignment for Integration\n\n**Time Commitment:**\n- 1 live call per week\n- 10-20 minutes daily practice\n- Optional deeper exploration',
  '',
  'live',
  true,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  is_published = EXCLUDED.is_published;

-- ============================================================================
-- WEEK 1: Awareness Before Change
-- ============================================================================
INSERT INTO modules (id, course_id, title, description, order_index, unlock_after_days, status, is_published)
VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Week 1: Awareness Before Change',
  'Week One lays the foundation for the entire INNER ASCEND journey. Nothing in this work moves forward without awareness. Before regulation, before integration, before creation — there is seeing.',
  0,
  0,
  'live',
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  unlock_after_days = EXCLUDED.unlock_after_days;

-- Week 1 Lessons
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_category, content_url, duration_sec, order_index, status, is_published)
VALUES
  ('c1000001-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Weekly Orientation: Awareness Before Change',
   'Set expectations and calm the system before content. Names the tone of the week, normalizes resistance, and prevents over-efforting.',
   'video', 'orientation', '', 180, 0, 'live', true),

  ('c1000002-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Transmission: The Observer Within',
   'Most human suffering does not come from experience itself, but from the unconscious resistance to experience. We try to change what we have not yet fully felt.',
   'video', 'transmission', '', 900, 1, 'live', true),

  ('c1000003-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Live Clarification Call: Week 1',
   'Live Q&A session to anchor presence, clarify misunderstandings, and model how to be with the work. No new content — only clarification, reflection, orientation.',
   'live', 'clarification', NULL, 5400, 2, 'live', true),

  ('c1000004-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Embodiment Practice: Learning to Stay',
   'A somatic practice to experience raw sensation before the mind creates labels and stories. The practice is not focus — the practice is staying.',
   'video', 'embodiment', '', 480, 3, 'live', true),

  ('c1000005-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Living Inquiry: What Do I Try to Change Before I Have Fully Felt It?',
   'A self-inquiry practice to bring into daily life. Let the answer reveal itself through lived moments.',
   'text', 'inquiry', NULL, 180, 4, 'live', true),

  ('c1000006-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Meditation: Staying With What Is',
   'A guided meditation to settle into pure awareness, the unchanging background of all experience.',
   'audio', 'meditation', '', 900, 5, 'live', true),

  ('c1000007-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001',
   'Deeper Assignment: Interrupting Premature Change',
   'A contemplative practice to deepen your relationship with the observing presence.',
   'text', 'assignment', NULL, 240, 6, 'live', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  lesson_type = EXCLUDED.lesson_type,
  content_category = EXCLUDED.content_category,
  duration_sec = EXCLUDED.duration_sec;

-- Update Week 1 text content
UPDATE lessons SET content_text = E'# Living Inquiry: Week One\n\nHold this question gently throughout the week:\n\n**"What do I try to change before I have fully felt it?"**\n\n## How to Practice\n\nDo not answer this intellectually. Let the answer reveal itself through lived moments.\n\nNotice when you:\n- Want an emotion to end before you''ve felt it fully\n- Want a conversation to resolve quickly\n- Want clarity before presence\n- Rush ahead of yourself\n\nWhen you notice this, pause. Take one slow breath. Ask internally: "What is actually happening right now?"\n\nThis is awareness in motion.\n\nThere is no rush. This work unfolds at the pace of safety.'
WHERE id = 'c1000005-0000-0000-0000-000000000001';

UPDATE lessons SET content_text = E'# Deeper Assignment: Interrupting Premature Change\n\nFor 7 days, notice one specific pattern:\n\n**The moment you try to change an experience before fully feeling it.**\n\nThis might show up as:\n- Wanting an emotion to end\n- Explaining yourself internally\n- Distracting yourself\n- Spiritualizing discomfort\n\n## The Practice\n\nEach time you notice this:\n1. Pause for one breath\n2. Name silently: "Not yet seen."\n3. Do nothing else\n\nNo journaling required. No correction. Just interruption.\n\nThis trains awareness to arrive before action.'
WHERE id = 'c1000007-0000-0000-0000-000000000001';

-- Update Week 1 live call scheduled_at
UPDATE lessons SET scheduled_at = '2025-01-08T19:00:00Z', meeting_url = ''
WHERE id = 'c1000003-0000-0000-0000-000000000001';

-- ============================================================================
-- WEEK 2: Meeting the Ego as Adaptive Intelligence
-- ============================================================================
INSERT INTO modules (id, course_id, title, description, order_index, unlock_after_days, status, is_published)
VALUES (
  'b2000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Week 2: Meeting the Ego as Adaptive Intelligence',
  'Week Two invites you into a radically different relationship with the ego. Instead of trying to rise above it, silence it, or dismantle it, you are asked to understand it from the inside.',
  1,
  7,
  'live',
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  unlock_after_days = EXCLUDED.unlock_after_days;

-- Week 2 Lessons
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_category, content_url, duration_sec, order_index, status, is_published)
VALUES
  ('c2000001-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'Weekly Orientation: The Ego as Protector',
   'Introduction to reframing our relationship with ego from enemy to ally. This week is about ending the inner war.',
   'video', 'orientation', '', 150, 0, 'live', true),

  ('c2000002-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'Transmission: Adaptive Intelligence',
   'The ego is not your enemy. It is a constellation of adaptive strategies developed in response to lived experience. Every ego strategy was once intelligent.',
   'video', 'transmission', '', 1080, 1, 'live', true),

  ('c2000003-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'Live Clarification Call: Week 2',
   'Exploring our relationship with ego patterns. Safe space for questions and sharing about protective strategies.',
   'live', 'clarification', NULL, 5400, 2, 'live', true),

  ('c2000004-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'Embodiment Practice: Naming Protection',
   'A body-based practice for meeting protective patterns with compassion. Whenever you notice defensiveness, pause and silently say: "This is protection."',
   'video', 'embodiment', '', 420, 3, 'live', true),

  ('c2000005-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'Living Inquiry: What Is This Part of Me Trying to Protect?',
   'Questions to bring curiosity to our automatic responses and defenses.',
   'text', 'inquiry', NULL, 180, 4, 'live', true),

  ('c2000006-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'Meditation: Seeing Protection Without Judgment',
   'A meditation of radical acceptance for meeting the ego with awareness instead of war.',
   'audio', 'meditation', '', 1200, 5, 'live', true),

  ('c2000007-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001',
   'Deeper Assignment: Mapping Your Protectors',
   'An exercise to identify and honor the protective strategies that have served you.',
   'text', 'assignment', NULL, 300, 6, 'live', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  lesson_type = EXCLUDED.lesson_type,
  content_category = EXCLUDED.content_category,
  duration_sec = EXCLUDED.duration_sec;

-- Update Week 2 text content
UPDATE lessons SET content_text = E'# Living Inquiry: Week Two\n\nHold this inquiry gently throughout the week:\n\n**"What is this part of me trying to protect?"**\n\n## How to Practice\n\nLet the answer emerge through sensation, memory, and behavior — not thought alone.\n\nWhen you notice:\n- Defensiveness\n- Self-justification\n- The urge to explain or withdraw\n\nAsk with genuine curiosity: "What is this protecting?"\n\nYou do not need to resolve anything. Curiosity keeps awareness open. Judgment collapses it.\n\nSeeing is enough.'
WHERE id = 'c2000005-0000-0000-0000-000000000001';

UPDATE lessons SET content_text = E'# Deeper Assignment: Mapping Protection\n\nOnce this week, sit down with a notebook.\n\nWrite the answers to these prompts slowly:\n\n1. **What situations trigger protection most often?**\n\n2. **What does protection look like in me?**\n   (control, silence, performance, withdrawal, attack)\n\n3. **What does this part seem to be afraid would happen if it relaxed?**\n\nDo not try to heal or reframe.\n\nEnd the assignment by writing this sentence:\n\n**"This strategy once kept me safe."**\n\nStop there.'
WHERE id = 'c2000007-0000-0000-0000-000000000001';

-- Update Week 2 live call
UPDATE lessons SET scheduled_at = '2025-01-15T19:00:00Z', meeting_url = ''
WHERE id = 'c2000003-0000-0000-0000-000000000001';

-- ============================================================================
-- WEEK 3: Conditioning, Shame, and the Nervous System
-- ============================================================================
INSERT INTO modules (id, course_id, title, description, order_index, unlock_after_days, status, is_published)
VALUES (
  'b3000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Week 3: Conditioning, Shame, and the Nervous System',
  'Week Three deepens the work by bringing compassion and clarity to one of the most misunderstood aspects of being human: conditioning. This week is about dissolving shame by understanding how patterns are formed.',
  2,
  14,
  'live',
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  unlock_after_days = EXCLUDED.unlock_after_days;

-- Week 3 Lessons
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_category, content_url, duration_sec, order_index, status, is_published)
VALUES
  ('c3000001-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'Weekly Orientation: The Roots of Shame',
   'Understanding how shame develops in early life and shapes our sense of self. Conditioning is learned, not chosen.',
   'video', 'orientation', '', 180, 0, 'live', true),

  ('c3000002-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'Transmission: Shame and the Body',
   'Conditioning is not something you chose. It is the result of a nervous system learning how to survive, belong, and orient in the world. Shame arises when we judge adaptive responses through the lens of adult consciousness.',
   'video', 'transmission', '', 1020, 1, 'live', true),

  ('c3000003-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'Live Clarification Call: Week 3',
   'A tender exploration of shame patterns. Safe space for questions and sharing. Regulation always comes before insight.',
   'live', 'clarification', NULL, 5400, 2, 'live', true),

  ('c3000004-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'Embodiment Practice: Tracking Conditioning in the Body',
   'Practical tools for working with shame activation in the body. Notice where tension appears, changes in breath.',
   'video', 'embodiment', '', 540, 3, 'live', true),

  ('c3000005-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'Living Inquiry: What Am I Blaming Myself For That Was Never a Conscious Choice?',
   'Body-based inquiry to locate and witness shame without drowning in it.',
   'text', 'inquiry', NULL, 180, 4, 'live', true),

  ('c3000006-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'Meditation: Safe Haven Within',
   'A restorative meditation to establish inner safety and resource. Meeting the pattern at its origin.',
   'audio', 'meditation', '', 1080, 5, 'live', true),

  ('c3000007-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001',
   'Deeper Assignment: Separating Learning From Identity',
   'A compassionate writing practice to offer understanding to the one who learned to feel ashamed.',
   'text', 'assignment', NULL, 270, 6, 'live', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  lesson_type = EXCLUDED.lesson_type,
  content_category = EXCLUDED.content_category,
  duration_sec = EXCLUDED.duration_sec;

-- Update Week 3 text content
UPDATE lessons SET content_text = E'# Living Inquiry: Week Three\n\nHold this inquiry throughout the week:\n\n**"What am I blaming myself for that was never a conscious choice?"**\n\n## How to Practice\n\nThroughout the week, notice moments when shame appears.\n\nInstead of believing the narrative, name the process:\n\n"This is conditioning."\n\nNotice how naming reduces intensity.\nNotice how compassion restores choice.\n\nThis is not indulgence. It is precision.\n\nLet understanding show itself through sensation, memory, and behavior.\n\nUnderstanding is the beginning of freedom.'
WHERE id = 'c3000005-0000-0000-0000-000000000001';

UPDATE lessons SET content_text = E'# Deeper Assignment: Separating Learning From Identity\n\nChoose one shame-based belief you carry:\n- "I''m too much"\n- "I''m unsafe"\n- "I ruin things"\n- "I''m not enough"\n\nFor 7 days, every time it appears, repeat internally:\n\n**"This is conditioning, not identity."**\n\nDo not argue with the belief.\nDo not replace it.\nJust separate.\n\nThis trains the nervous system to distinguish pattern from self.'
WHERE id = 'c3000007-0000-0000-0000-000000000001';

-- Update Week 3 live call
UPDATE lessons SET scheduled_at = '2025-01-22T19:00:00Z', meeting_url = ''
WHERE id = 'c3000003-0000-0000-0000-000000000001';

-- ============================================================================
-- WEEK 4: The Observer and Inner Authority
-- ============================================================================
INSERT INTO modules (id, course_id, title, description, order_index, unlock_after_days, status, is_published)
VALUES (
  'b4000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Week 4: The Observer and Inner Authority',
  'Week Four completes the first month by stabilizing the observer. This week is about discovering the part of you that can see clearly without abandoning experience. This capacity is what restores inner authority.',
  3,
  21,
  'live',
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  unlock_after_days = EXCLUDED.unlock_after_days;

-- Week 4 Lessons
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_category, content_url, duration_sec, order_index, status, is_published)
VALUES
  ('c4000001-0000-0000-0000-000000000001', 'b4000000-0000-0000-0000-000000000001',
   'Weekly Orientation: Reclaiming Your Authority',
   'Introduction to the shift from seeking external approval to trusting inner wisdom. Moving from external validation to inner knowing.',
   'video', 'orientation', '', 165, 0, 'live', true),

  ('c4000002-0000-0000-0000-000000000001', 'b4000000-0000-0000-0000-000000000001',
   'Transmission: The Authority Within',
   'The observer is not the mind watching itself. It is awareness prior to interpretation. It sees sensation, emotion, impulse, and thought as movements, not as truth. When the observer is present, identity loosens.',
   'video', 'transmission', '', 1140, 1, 'live', true),

  ('c4000003-0000-0000-0000-000000000001', 'b4000000-0000-0000-0000-000000000001',
   'Live Clarification Call: Week 4',
   'Completing Month One with integration and Q&A on inner authority. The foundation is now in place.',
   'live', 'clarification', NULL, 5400, 2, 'live', true),

  ('c4000004-0000-0000-0000-000000000001', 'b4000000-0000-0000-0000-000000000001',
   'Embodiment Practice: Establishing the Observer',
   'A grounding practice to feel the physical experience of inner authority. Recognize that something is aware of all experience.',
   'video', 'embodiment', '', 480, 3, 'live', true),

  ('c4000005-0000-0000-0000-000000000001', 'b4000000-0000-0000-0000-000000000001',
   'Living Inquiry: What Changes When Experience Is Seen Rather Than Believed?',
   'Questions that help distinguish between conditioned beliefs and inner knowing.',
   'text', 'inquiry', NULL, 180, 4, 'live', true),

  ('c4000006-0000-0000-0000-000000000001', 'b4000000-0000-0000-0000-000000000001',
   'Meditation: Connecting to Inner Guidance',
   'A meditation to strengthen the connection to your inner wise one. Seeing without becoming.',
   'audio', 'meditation', '', 960, 5, 'live', true),

  ('c4000007-0000-0000-0000-000000000001', 'b4000000-0000-0000-0000-000000000001',
   'Deeper Assignment: Authority in Action',
   'Reflection and integration of the first month. Preparing for what comes next.',
   'text', 'assignment', NULL, 300, 6, 'live', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  lesson_type = EXCLUDED.lesson_type,
  content_category = EXCLUDED.content_category,
  duration_sec = EXCLUDED.duration_sec;

-- Update Week 4 text content
UPDATE lessons SET content_text = E'# Living Inquiry: Week Four\n\nHold this inquiry lightly throughout the week:\n\n**"What changes when experience is seen rather than believed?"**\n\n## How to Practice\n\nThroughout the day, notice moments of strong reaction.\n\nPause briefly and ask: "Can this be seen?"\n\nDo not change the reaction.\nDo not delay action if action is needed.\n\nSimply notice whether awareness is present.\n\nEven one second of observation changes the trajectory of response.\n\nThis is how inner authority is rebuilt — moment by moment.\n\nLet the answer reveal itself through direct experience.\n\nMonth One ends here — not with mastery, but with capacity.\n\nThe foundation is now in place.'
WHERE id = 'c4000005-0000-0000-0000-000000000001';

UPDATE lessons SET content_text = E'# Deeper Assignment: Authority in Action\n\nFor 7 days, choose one daily moment where you normally react automatically:\n- A conversation\n- A decision\n- A message\n- A request\n\nIn that moment:\n\n1. **Pause for one second**\n2. **Ask internally: "Can this be seen?"**\n3. **Act after awareness is present**\n\nYou are not slowing life down.\n\nYou are letting awareness arrive before action.\n\nThis is inner authority.\n\n---\n\n## Month One Complete\n\nYou have laid the foundation:\n- Awareness before change\n- Meeting the ego with compassion\n- Understanding conditioning and shame\n- Reclaiming inner authority\n\nThe work continues. The foundation is solid.'
WHERE id = 'c4000007-0000-0000-0000-000000000001';

-- Update Week 4 live call
UPDATE lessons SET scheduled_at = '2025-01-29T19:00:00Z', meeting_url = ''
WHERE id = 'c4000003-0000-0000-0000-000000000001';

-- ============================================================================
-- VERIFICATION QUERY (run after seeding to verify)
-- ============================================================================
-- SELECT
--   c.title as course,
--   m.title as module,
--   m.order_index as module_order,
--   COUNT(l.id) as lesson_count
-- FROM courses c
-- JOIN modules m ON m.course_id = c.id
-- JOIN lessons l ON l.module_id = m.id
-- GROUP BY c.title, m.title, m.order_index
-- ORDER BY c.title, m.order_index;
