import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface Lesson {
  title: string
  description: string
  lesson_type: 'video' | 'audio' | 'pdf' | 'text' | 'live'
  content_category:
    | 'orientation'
    | 'transmission'
    | 'clarification'
    | 'embodiment'
    | 'inquiry'
    | 'meditation'
    | 'assignment'
  duration_sec: number
  content_url?: string
  content_text?: string
  scheduled_at?: string
  meeting_url?: string
}

interface Week {
  title: string
  description: string
  lessons: Lesson[]
}

// Full Inner Ascend Month One Content
const INNER_ASCEND_MONTH_ONE: Week[] = [
  {
    title: 'Week 1: Awareness Before Change',
    description:
      'Week One lays the foundation for the entire INNER ASCEND journey. Nothing in this work moves forward without awareness. Before regulation, before integration, before creation — there is seeing.',
    lessons: [
      {
        title: 'Weekly Orientation: Awareness Before Change',
        description:
          'Set expectations and calm the system before content. Names the tone of the week, normalizes resistance, and prevents over-efforting.',
        lesson_type: 'video',
        content_category: 'orientation',
        duration_sec: 180,
        content_url: '',
      },
      {
        title: 'Transmission: The Observer Within',
        description:
          'Most human suffering does not come from experience itself, but from the unconscious resistance to experience. We try to change what we have not yet fully felt.',
        lesson_type: 'video',
        content_category: 'transmission',
        duration_sec: 900,
        content_url: '',
      },
      {
        title: 'Live Clarification Call: Week 1',
        description:
          'Live Q&A session to anchor presence, clarify misunderstandings, and model how to be with the work. No new content — only clarification, reflection, orientation.',
        lesson_type: 'live',
        content_category: 'clarification',
        duration_sec: 5400,
        scheduled_at: '2025-01-08T19:00:00Z',
        meeting_url: '',
      },
      {
        title: 'Embodiment Practice: Learning to Stay',
        description:
          'A somatic practice to experience raw sensation before the mind creates labels and stories. The practice is not focus — the practice is staying.',
        lesson_type: 'video',
        content_category: 'embodiment',
        duration_sec: 480,
        content_url: '',
      },
      {
        title: 'Living Inquiry: What Do I Try to Change Before I Have Fully Felt It?',
        description: 'A self-inquiry practice to bring into daily life. Let the answer reveal itself through lived moments.',
        lesson_type: 'text',
        content_category: 'inquiry',
        duration_sec: 180,
        content_text: `# Living Inquiry: Week One

Hold this question gently throughout the week:

**"What do I try to change before I have fully felt it?"**

## How to Practice

Do not answer this intellectually. Let the answer reveal itself through lived moments.

Notice when you:
- Want an emotion to end before you've felt it fully
- Want a conversation to resolve quickly
- Want clarity before presence
- Rush ahead of yourself

When you notice this, pause. Take one slow breath. Ask internally: "What is actually happening right now?"

This is awareness in motion.

There is no rush. This work unfolds at the pace of safety.`,
      },
      {
        title: 'Meditation: Staying With What Is',
        description:
          'A guided meditation to settle into pure awareness, the unchanging background of all experience.',
        lesson_type: 'audio',
        content_category: 'meditation',
        duration_sec: 900,
        content_url: '',
      },
      {
        title: 'Deeper Assignment: Interrupting Premature Change',
        description:
          'A contemplative practice to deepen your relationship with the observing presence.',
        lesson_type: 'text',
        content_category: 'assignment',
        duration_sec: 240,
        content_text: `# Deeper Assignment: Interrupting Premature Change

For 7 days, notice one specific pattern:

**The moment you try to change an experience before fully feeling it.**

This might show up as:
- Wanting an emotion to end
- Explaining yourself internally
- Distracting yourself
- Spiritualizing discomfort

## The Practice

Each time you notice this:
1. Pause for one breath
2. Name silently: "Not yet seen."
3. Do nothing else

No journaling required. No correction. Just interruption.

This trains awareness to arrive before action.`,
      },
    ],
  },
  {
    title: 'Week 2: Meeting the Ego as Adaptive Intelligence',
    description:
      'Week Two invites you into a radically different relationship with the ego. Instead of trying to rise above it, silence it, or dismantle it, you are asked to understand it from the inside.',
    lessons: [
      {
        title: 'Weekly Orientation: The Ego as Protector',
        description:
          'Introduction to reframing our relationship with ego from enemy to ally. This week is about ending the inner war.',
        lesson_type: 'video',
        content_category: 'orientation',
        duration_sec: 150,
        content_url: '',
      },
      {
        title: 'Transmission: Adaptive Intelligence',
        description:
          'The ego is not your enemy. It is a constellation of adaptive strategies developed in response to lived experience. Every ego strategy was once intelligent.',
        lesson_type: 'video',
        content_category: 'transmission',
        duration_sec: 1080,
        content_url: '',
      },
      {
        title: 'Live Clarification Call: Week 2',
        description:
          'Exploring our relationship with ego patterns. Safe space for questions and sharing about protective strategies.',
        lesson_type: 'live',
        content_category: 'clarification',
        duration_sec: 5400,
        scheduled_at: '2025-01-15T19:00:00Z',
        meeting_url: '',
      },
      {
        title: 'Embodiment Practice: Naming Protection',
        description:
          'A body-based practice for meeting protective patterns with compassion. Whenever you notice defensiveness, pause and silently say: "This is protection."',
        lesson_type: 'video',
        content_category: 'embodiment',
        duration_sec: 420,
        content_url: '',
      },
      {
        title: 'Living Inquiry: What Is This Part of Me Trying to Protect?',
        description:
          'Questions to bring curiosity to our automatic responses and defenses.',
        lesson_type: 'text',
        content_category: 'inquiry',
        duration_sec: 180,
        content_text: `# Living Inquiry: Week Two

Hold this inquiry gently throughout the week:

**"What is this part of me trying to protect?"**

## How to Practice

Let the answer emerge through sensation, memory, and behavior — not thought alone.

When you notice:
- Defensiveness
- Self-justification
- The urge to explain or withdraw

Ask with genuine curiosity: "What is this protecting?"

You do not need to resolve anything. Curiosity keeps awareness open. Judgment collapses it.

Seeing is enough.`,
      },
      {
        title: 'Meditation: Seeing Protection Without Judgment',
        description:
          'A meditation of radical acceptance for meeting the ego with awareness instead of war.',
        lesson_type: 'audio',
        content_category: 'meditation',
        duration_sec: 1200,
        content_url: '',
      },
      {
        title: 'Deeper Assignment: Mapping Your Protectors',
        description:
          'An exercise to identify and honor the protective strategies that have served you.',
        lesson_type: 'text',
        content_category: 'assignment',
        duration_sec: 300,
        content_text: `# Deeper Assignment: Mapping Protection

Once this week, sit down with a notebook.

Write the answers to these prompts slowly:

1. **What situations trigger protection most often?**

2. **What does protection look like in me?**
   (control, silence, performance, withdrawal, attack)

3. **What does this part seem to be afraid would happen if it relaxed?**

Do not try to heal or reframe.

End the assignment by writing this sentence:

**"This strategy once kept me safe."**

Stop there.`,
      },
    ],
  },
  {
    title: 'Week 3: Conditioning, Shame, and the Nervous System',
    description:
      'Week Three deepens the work by bringing compassion and clarity to one of the most misunderstood aspects of being human: conditioning. This week is about dissolving shame by understanding how patterns are formed.',
    lessons: [
      {
        title: 'Weekly Orientation: The Roots of Shame',
        description:
          'Understanding how shame develops in early life and shapes our sense of self. Conditioning is learned, not chosen.',
        lesson_type: 'video',
        content_category: 'orientation',
        duration_sec: 180,
        content_url: '',
      },
      {
        title: 'Transmission: Shame and the Body',
        description:
          'Conditioning is not something you chose. It is the result of a nervous system learning how to survive, belong, and orient in the world. Shame arises when we judge adaptive responses through the lens of adult consciousness.',
        lesson_type: 'video',
        content_category: 'transmission',
        duration_sec: 1020,
        content_url: '',
      },
      {
        title: 'Live Clarification Call: Week 3',
        description:
          'A tender exploration of shame patterns. Safe space for questions and sharing. Regulation always comes before insight.',
        lesson_type: 'live',
        content_category: 'clarification',
        duration_sec: 5400,
        scheduled_at: '2025-01-22T19:00:00Z',
        meeting_url: '',
      },
      {
        title: 'Embodiment Practice: Tracking Conditioning in the Body',
        description:
          'Practical tools for working with shame activation in the body. Notice where tension appears, changes in breath.',
        lesson_type: 'video',
        content_category: 'embodiment',
        duration_sec: 540,
        content_url: '',
      },
      {
        title: 'Living Inquiry: What Am I Blaming Myself For That Was Never a Conscious Choice?',
        description:
          'Body-based inquiry to locate and witness shame without drowning in it.',
        lesson_type: 'text',
        content_category: 'inquiry',
        duration_sec: 180,
        content_text: `# Living Inquiry: Week Three

Hold this inquiry throughout the week:

**"What am I blaming myself for that was never a conscious choice?"**

## How to Practice

Throughout the week, notice moments when shame appears.

Instead of believing the narrative, name the process:

"This is conditioning."

Notice how naming reduces intensity.
Notice how compassion restores choice.

This is not indulgence. It is precision.

Let understanding show itself through sensation, memory, and behavior.

Understanding is the beginning of freedom.`,
      },
      {
        title: 'Meditation: Safe Haven Within',
        description:
          'A restorative meditation to establish inner safety and resource. Meeting the pattern at its origin.',
        lesson_type: 'audio',
        content_category: 'meditation',
        duration_sec: 1080,
        content_url: '',
      },
      {
        title: 'Deeper Assignment: Separating Learning From Identity',
        description:
          'A compassionate writing practice to offer understanding to the one who learned to feel ashamed.',
        lesson_type: 'text',
        content_category: 'assignment',
        duration_sec: 270,
        content_text: `# Deeper Assignment: Separating Learning From Identity

Choose one shame-based belief you carry:
- "I'm too much"
- "I'm unsafe"
- "I ruin things"
- "I'm not enough"

For 7 days, every time it appears, repeat internally:

**"This is conditioning, not identity."**

Do not argue with the belief.
Do not replace it.
Just separate.

This trains the nervous system to distinguish pattern from self.`,
      },
    ],
  },
  {
    title: 'Week 4: The Observer and Inner Authority',
    description:
      'Week Four completes the first month by stabilizing the observer. This week is about discovering the part of you that can see clearly without abandoning experience. This capacity is what restores inner authority.',
    lessons: [
      {
        title: 'Weekly Orientation: Reclaiming Your Authority',
        description:
          'Introduction to the shift from seeking external approval to trusting inner wisdom. Moving from external validation to inner knowing.',
        lesson_type: 'video',
        content_category: 'orientation',
        duration_sec: 165,
        content_url: '',
      },
      {
        title: 'Transmission: The Authority Within',
        description:
          'The observer is not the mind watching itself. It is awareness prior to interpretation. It sees sensation, emotion, impulse, and thought as movements, not as truth. When the observer is present, identity loosens.',
        lesson_type: 'video',
        content_category: 'transmission',
        duration_sec: 1140,
        content_url: '',
      },
      {
        title: 'Live Clarification Call: Week 4',
        description:
          'Completing Month One with integration and Q&A on inner authority. The foundation is now in place.',
        lesson_type: 'live',
        content_category: 'clarification',
        duration_sec: 5400,
        scheduled_at: '2025-01-29T19:00:00Z',
        meeting_url: '',
      },
      {
        title: 'Embodiment Practice: Establishing the Observer',
        description:
          'A grounding practice to feel the physical experience of inner authority. Recognize that something is aware of all experience.',
        lesson_type: 'video',
        content_category: 'embodiment',
        duration_sec: 480,
        content_url: '',
      },
      {
        title: 'Living Inquiry: What Changes When Experience Is Seen Rather Than Believed?',
        description:
          'Questions that help distinguish between conditioned beliefs and inner knowing.',
        lesson_type: 'text',
        content_category: 'inquiry',
        duration_sec: 180,
        content_text: `# Living Inquiry: Week Four

Hold this inquiry lightly throughout the week:

**"What changes when experience is seen rather than believed?"**

## How to Practice

Throughout the day, notice moments of strong reaction.

Pause briefly and ask: "Can this be seen?"

Do not change the reaction.
Do not delay action if action is needed.

Simply notice whether awareness is present.

Even one second of observation changes the trajectory of response.

This is how inner authority is rebuilt — moment by moment.

Let the answer reveal itself through direct experience.

Month One ends here — not with mastery, but with capacity.

The foundation is now in place.`,
      },
      {
        title: 'Meditation: Connecting to Inner Guidance',
        description:
          'A meditation to strengthen the connection to your inner wise one. Seeing without becoming.',
        lesson_type: 'audio',
        content_category: 'meditation',
        duration_sec: 960,
        content_url: '',
      },
      {
        title: 'Deeper Assignment: Authority in Action',
        description:
          'Reflection and integration of the first month. Preparing for what comes next.',
        lesson_type: 'text',
        content_category: 'assignment',
        duration_sec: 300,
        content_text: `# Deeper Assignment: Authority in Action

For 7 days, choose one daily moment where you normally react automatically:
- A conversation
- A decision
- A message
- A request

In that moment:

1. **Pause for one second**
2. **Ask internally: "Can this be seen?"**
3. **Act after awareness is present**

You are not slowing life down.

You are letting awareness arrive before action.

This is inner authority.

---

## Month One Complete

You have laid the foundation:
- Awareness before change
- Meeting the ego with compassion
- Understanding conditioning and shame
- Reclaiming inner authority

The work continues. The foundation is solid.`,
      },
    ],
  },
]

async function seed() {
  console.log('Starting Inner Ascend seed...')
  console.log('Connected to:', supabaseUrl)

  // 1. Clear existing course data
  console.log('Clearing existing course data...')

  // Delete in order due to foreign keys
  const { error: progressError } = await supabase.from('user_lesson_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (progressError) console.log('Note: user_lesson_progress clear:', progressError.message)

  const { error: unlockError } = await supabase.from('user_module_unlocks').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (unlockError) console.log('Note: user_module_unlocks clear:', unlockError.message)

  const { error: courseProgressError } = await supabase.from('user_course_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (courseProgressError) console.log('Note: user_course_progress clear:', courseProgressError.message)

  const { error: lessonsError } = await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (lessonsError) console.log('Note: lessons clear:', lessonsError.message)

  const { error: modulesError } = await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (modulesError) console.log('Note: modules clear:', modulesError.message)

  const { error: coursesError } = await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (coursesError) console.log('Note: courses clear:', coursesError.message)

  // 2. Get existing tenant
  console.log('Looking for tenant...')
  const { data: tenants } = await supabase.from('tenants').select('id, name').limit(1)

  if (!tenants || tenants.length === 0) {
    console.error('No tenant found. Please create a tenant first.')
    process.exit(1)
  }

  const tenant = tenants[0]
  console.log('Using tenant:', tenant.name)

  // 3. Get instructor (first owner/admin)
  const { data: members } = await supabase
    .from('tenant_memberships')
    .select('user_id')
    .eq('tenant_id', tenant.id)
    .in('role', ['owner', 'admin'])
    .limit(1)

  const instructorId = members?.[0]?.user_id || null
  console.log('Instructor ID:', instructorId || 'None (will be null)')

  // 4. Create the Inner Ascend course
  console.log('Creating Inner Ascend course...')
  const now = new Date().toISOString()

  const { data: course, error: createCourseError } = await supabase
    .from('courses')
    .insert({
      title: 'Inner Ascend: A 12-Month Journey of Awakening',
      description: `**Month One: Foundations of Self-Awareness**

This transformative journey begins with the essential foundation: learning to see ourselves clearly, without judgment, and without the agenda to fix.

Over these four weeks, you will:
- Discover the observer within — the awareness that exists prior to thought
- Reframe your relationship with ego from enemy to adaptive ally
- Understand how shame became encoded in your nervous system
- Reclaim your inner authority and trust your own knowing

**Weekly Structure:**
- Weekly Orientation (2-3 min)
- Deep Transmission Teaching (10-20 min)
- Live Clarification Call (60-90 min)
- Embodiment Practice (5-10 min)
- Living Inquiry for Daily Life
- Guided Meditation (10-20 min)
- Deeper Assignment for Integration

**Time Commitment:**
- 1 live call per week
- 10-20 minutes daily practice
- Optional deeper exploration`,
      cover_url: '',
      status: 'live',
      release_at: now,
      is_published: true,
      published_at: now,
      tenant_id: tenant.id,
      instructor_id: instructorId,
    })
    .select()
    .single()

  if (createCourseError) {
    console.error('Failed to create course:', createCourseError)
    process.exit(1)
  }

  console.log('Course created:', course.id)

  // 5. Create modules (weeks) and lessons
  for (let weekIndex = 0; weekIndex < INNER_ASCEND_MONTH_ONE.length; weekIndex++) {
    const week = INNER_ASCEND_MONTH_ONE[weekIndex]
    console.log(`Creating module: ${week.title}`)

    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .insert({
        course_id: course.id,
        title: week.title,
        description: week.description,
        order_index: weekIndex,
        unlock_after_days: weekIndex * 7, // Week 1: 0, Week 2: 7, Week 3: 14, Week 4: 21
        status: 'live',
        is_published: true,
      })
      .select()
      .single()

    if (moduleError) {
      console.error(`Failed to create module ${week.title}:`, moduleError)
      continue
    }

    // Create lessons for this module
    for (let lessonIndex = 0; lessonIndex < week.lessons.length; lessonIndex++) {
      const lesson = week.lessons[lessonIndex]

      const { error: lessonError } = await supabase.from('lessons').insert({
        module_id: module.id,
        title: lesson.title,
        description: lesson.description,
        lesson_type: lesson.lesson_type,
        content_category: lesson.content_category,
        content_url: lesson.content_url || null,
        content_text: lesson.content_text || null,
        duration_sec: lesson.duration_sec,
        scheduled_at: lesson.scheduled_at || null,
        meeting_url: lesson.meeting_url || null,
        order_index: lessonIndex,
        status: 'live',
        is_published: true,
      })

      if (lessonError) {
        console.error(`Failed to create lesson "${lesson.title}":`, lessonError)
      } else {
        console.log(`  - ${lesson.title}`)
      }
    }
  }

  console.log('\n✅ Seed complete!')
  console.log(`Created: 1 course, ${INNER_ASCEND_MONTH_ONE.length} modules, ${INNER_ASCEND_MONTH_ONE.reduce((acc, w) => acc + w.lessons.length, 0)} lessons`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
