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

interface MonthCourse {
  month: number
  title: string
  description: string
  weeks: Week[]
}

// ============================================================================
// MONTH 1: Foundations of Self-Awareness (Full Content)
// ============================================================================

const MONTH_1_WEEKS: Week[] = [
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

// ============================================================================
// MONTHS 2-12: Placeholder Content Generator
// ============================================================================

const MONTHLY_THEMES: { month: number; title: string; theme: string; description: string; weekThemes: string[] }[] = [
  {
    month: 2,
    title: 'Month 2: Emotional Intelligence',
    theme: 'Emotional Intelligence',
    description: `**Month Two: Emotional Intelligence**

Building on the foundation of awareness, this month explores the landscape of emotions as messengers rather than problems to solve.

Over these four weeks, you will:
- Learn to distinguish between emotion and reaction
- Develop capacity to feel without being overwhelmed
- Understand emotions as information, not instructions
- Build emotional vocabulary and granularity

**Weekly Structure:**
- Weekly Orientation (2-3 min)
- Deep Transmission Teaching (10-20 min)
- Live Clarification Call (60-90 min)
- Embodiment Practice (5-10 min)
- Living Inquiry for Daily Life
- Guided Meditation (10-20 min)
- Deeper Assignment for Integration`,
    weekThemes: [
      'Emotions as Messengers',
      'Feeling Without Fixing',
      'Emotional Granularity',
      'Integration and Flow',
    ],
  },
  {
    month: 3,
    title: 'Month 3: The Body as Teacher',
    theme: 'The Body as Teacher',
    description: `**Month Three: The Body as Teacher**

The body holds wisdom that the mind cannot access. This month deepens your relationship with somatic intelligence.

Over these four weeks, you will:
- Develop interoceptive awareness
- Learn to read body signals before they become symptoms
- Understand how trauma lives in the body
- Build capacity for embodied presence

**Weekly Structure:**
- Weekly Orientation (2-3 min)
- Deep Transmission Teaching (10-20 min)
- Live Clarification Call (60-90 min)
- Embodiment Practice (5-10 min)
- Living Inquiry for Daily Life
- Guided Meditation (10-20 min)
- Deeper Assignment for Integration`,
    weekThemes: [
      'Listening to the Body',
      'Sensation as Language',
      'Trauma and the Soma',
      'Embodied Presence',
    ],
  },
  {
    month: 4,
    title: 'Month 4: Relationships as Mirrors',
    theme: 'Relationships as Mirrors',
    description: `**Month Four: Relationships as Mirrors**

Our relationships reveal what we cannot see in ourselves. This month explores how connection serves awakening.

Over these four weeks, you will:
- Recognize projection and transference
- Understand attachment patterns
- Learn to stay present in relational activation
- Transform conflict into opportunity

**Weekly Structure:**
- Weekly Orientation (2-3 min)
- Deep Transmission Teaching (10-20 min)
- Live Clarification Call (60-90 min)
- Embodiment Practice (5-10 min)
- Living Inquiry for Daily Life
- Guided Meditation (10-20 min)
- Deeper Assignment for Integration`,
    weekThemes: [
      'The Mirror of Relationship',
      'Attachment and Freedom',
      'Staying Present in Activation',
      'Conflict as Teacher',
    ],
  },
  {
    month: 5,
    title: 'Month 5: Shadow Work',
    theme: 'Shadow Work',
    description: `**Month Five: Shadow Work**

What we reject in ourselves doesn't disappear — it operates from the shadows. This month brings light to the disowned parts.

Over these four weeks, you will:
- Understand the nature of psychological shadow
- Learn to recognize projection
- Integrate rejected aspects of self
- Transform shame into wholeness

**Weekly Structure:**
- Weekly Orientation (2-3 min)
- Deep Transmission Teaching (10-20 min)
- Live Clarification Call (60-90 min)
- Embodiment Practice (5-10 min)
- Living Inquiry for Daily Life
- Guided Meditation (10-20 min)
- Deeper Assignment for Integration`,
    weekThemes: [
      'Meeting the Shadow',
      'Projection and Ownership',
      'The Golden Shadow',
      'Integration and Wholeness',
    ],
  },
  {
    month: 6,
    title: 'Month 6: Integration Pause',
    theme: 'Integration Pause',
    description: `**Month Six: Integration Pause**

Halfway through the journey, we pause to integrate. This month is about consolidation, not accumulation.

Over these four weeks, you will:
- Review and deepen the first five months
- Allow insights to settle into embodiment
- Notice what has shifted
- Prepare for the second half of the journey

**Weekly Structure:**
- Weekly Orientation (2-3 min)
- Deep Transmission Teaching (10-20 min)
- Live Clarification Call (60-90 min)
- Embodiment Practice (5-10 min)
- Living Inquiry for Daily Life
- Guided Meditation (10-20 min)
- Deeper Assignment for Integration`,
    weekThemes: [
      'Reviewing the Foundation',
      'Deepening What Has Landed',
      'Noticing Transformation',
      'Preparing for What Comes',
    ],
  },
  {
    month: 7,
    title: 'Month 7: Purpose and Calling',
    theme: 'Purpose and Calling',
    description: `**Month Seven: Purpose and Calling**

With a stable foundation, we turn toward purpose. This month explores authentic expression and calling.

Over these four weeks, you will:
- Distinguish between ego ambition and soul calling
- Learn to listen for what wants to emerge
- Understand purpose as process, not destination
- Align action with essence

**Weekly Structure:**
- Weekly Orientation (2-3 min)
- Deep Transmission Teaching (10-20 min)
- Live Clarification Call (60-90 min)
- Embodiment Practice (5-10 min)
- Living Inquiry for Daily Life
- Guided Meditation (10-20 min)
- Deeper Assignment for Integration`,
    weekThemes: [
      'Ambition vs. Calling',
      'Listening for Emergence',
      'Purpose as Process',
      'Aligned Action',
    ],
  },
  {
    month: 8,
    title: 'Month 8: Creative Expression',
    theme: 'Creative Expression',
    description: `**Month Eight: Creative Expression**

Creativity is not reserved for artists. This month explores the creative force that moves through all of life.

Over these four weeks, you will:
- Reconnect with your creative nature
- Understand blocks to creative flow
- Learn to create without attachment to outcome
- Express from essence rather than ego

**Weekly Structure:**
- Weekly Orientation (2-3 min)
- Deep Transmission Teaching (10-20 min)
- Live Clarification Call (60-90 min)
- Embodiment Practice (5-10 min)
- Living Inquiry for Daily Life
- Guided Meditation (10-20 min)
- Deeper Assignment for Integration`,
    weekThemes: [
      'The Creative Impulse',
      'Blocks and Flow',
      'Creating Without Attachment',
      'Expression from Essence',
    ],
  },
  {
    month: 9,
    title: 'Month 9: Service and Contribution',
    theme: 'Service and Contribution',
    description: `**Month Nine: Service and Contribution**

True service emerges naturally from presence. This month explores how awakening serves the world.

Over these four weeks, you will:
- Distinguish between service and self-sacrifice
- Understand contribution as natural expression
- Learn to give without depletion
- Align service with authentic calling

**Weekly Structure:**
- Weekly Orientation (2-3 min)
- Deep Transmission Teaching (10-20 min)
- Live Clarification Call (60-90 min)
- Embodiment Practice (5-10 min)
- Living Inquiry for Daily Life
- Guided Meditation (10-20 min)
- Deeper Assignment for Integration`,
    weekThemes: [
      'Service vs. Sacrifice',
      'Natural Contribution',
      'Giving Without Depletion',
      'Aligned Service',
    ],
  },
  {
    month: 10,
    title: 'Month 10: Spiritual Practice',
    theme: 'Spiritual Practice',
    description: `**Month Ten: Spiritual Practice**

Practice is not preparation for life — practice is life. This month deepens your relationship with spiritual discipline.

Over these four weeks, you will:
- Understand the role of practice in awakening
- Learn to practice without striving
- Integrate formal and informal practice
- Make all of life your practice

**Weekly Structure:**
- Weekly Orientation (2-3 min)
- Deep Transmission Teaching (10-20 min)
- Live Clarification Call (60-90 min)
- Embodiment Practice (5-10 min)
- Living Inquiry for Daily Life
- Guided Meditation (10-20 min)
- Deeper Assignment for Integration`,
    weekThemes: [
      'The Purpose of Practice',
      'Practice Without Striving',
      'Formal and Informal Practice',
      'Life as Practice',
    ],
  },
  {
    month: 11,
    title: 'Month 11: Death and Impermanence',
    theme: 'Death and Impermanence',
    description: `**Month Eleven: Death and Impermanence**

Awareness of death illuminates life. This month brings conscious attention to impermanence as teacher.

Over these four weeks, you will:
- Develop a healthy relationship with mortality
- Understand how death awareness transforms living
- Learn to hold loss with presence
- Allow impermanence to clarify priorities

**Weekly Structure:**
- Weekly Orientation (2-3 min)
- Deep Transmission Teaching (10-20 min)
- Live Clarification Call (60-90 min)
- Embodiment Practice (5-10 min)
- Living Inquiry for Daily Life
- Guided Meditation (10-20 min)
- Deeper Assignment for Integration`,
    weekThemes: [
      'Befriending Mortality',
      'Death as Teacher',
      'Holding Loss',
      'Living Fully',
    ],
  },
  {
    month: 12,
    title: 'Month 12: Completion and New Beginnings',
    theme: 'Completion and New Beginnings',
    description: `**Month Twelve: Completion and New Beginnings**

The journey comes full circle. This month honors completion while opening to what continues.

Over these four weeks, you will:
- Integrate the full twelve-month journey
- Celebrate transformation without grasping
- Understand completion as threshold
- Step into ongoing awakening

**Weekly Structure:**
- Weekly Orientation (2-3 min)
- Deep Transmission Teaching (10-20 min)
- Live Clarification Call (60-90 min)
- Embodiment Practice (5-10 min)
- Living Inquiry for Daily Life
- Guided Meditation (10-20 min)
- Deeper Assignment for Integration`,
    weekThemes: [
      'Honoring the Journey',
      'Integration and Celebration',
      'Completion as Threshold',
      'Ongoing Awakening',
    ],
  },
]

function generatePlaceholderWeeks(monthData: typeof MONTHLY_THEMES[0]): Week[] {
  const baseDate = new Date('2025-01-01')
  // Calculate start date based on month (month 2 starts at week 5, etc.)
  const monthStartWeek = (monthData.month - 1) * 4

  return monthData.weekThemes.map((weekTheme, weekIndex) => {
    const weekNumber = monthStartWeek + weekIndex + 1
    const callDate = new Date(baseDate)
    callDate.setDate(baseDate.getDate() + (weekNumber - 1) * 7 + 2) // Wednesday of each week
    callDate.setHours(19, 0, 0, 0)

    return {
      title: `Week ${weekIndex + 1}: ${weekTheme}`,
      description: `Week ${weekIndex + 1} of ${monthData.theme}. ${weekTheme} — exploring this dimension of the monthly theme through teaching, practice, and integration.`,
      lessons: [
        {
          title: `Weekly Orientation: ${weekTheme}`,
          description: `Setting the context for this week's exploration of ${weekTheme.toLowerCase()}.`,
          lesson_type: 'video',
          content_category: 'orientation',
          duration_sec: 180,
          content_url: '',
        },
        {
          title: `Transmission: ${weekTheme}`,
          description: `Deep teaching on ${weekTheme.toLowerCase()} and how it relates to ${monthData.theme.toLowerCase()}.`,
          lesson_type: 'video',
          content_category: 'transmission',
          duration_sec: 1020,
          content_url: '',
        },
        {
          title: `Live Clarification Call: ${monthData.theme} Week ${weekIndex + 1}`,
          description: `Live Q&A session for ${weekTheme.toLowerCase()}. Safe space for questions, sharing, and collective presence.`,
          lesson_type: 'live',
          content_category: 'clarification',
          duration_sec: 5400,
          scheduled_at: callDate.toISOString(),
          meeting_url: '',
        },
        {
          title: `Embodiment Practice: ${weekTheme}`,
          description: `A somatic practice to embody the teachings of ${weekTheme.toLowerCase()}.`,
          lesson_type: 'video',
          content_category: 'embodiment',
          duration_sec: 480,
          content_url: '',
        },
        {
          title: `Living Inquiry: ${weekTheme}`,
          description: `Daily inquiry practice for integrating ${weekTheme.toLowerCase()} into lived experience.`,
          lesson_type: 'text',
          content_category: 'inquiry',
          duration_sec: 180,
          content_text: `# Living Inquiry: ${weekTheme}

Hold this inquiry gently throughout the week:

**How does ${weekTheme.toLowerCase()} show up in my daily experience?**

## How to Practice

Do not answer this intellectually. Let the answer reveal itself through lived moments.

Notice:
- When this theme appears naturally
- How your body responds
- What shifts when you bring awareness

When you notice something relevant, pause. Take one slow breath. Simply observe.

This is awareness in motion.

There is no rush. This work unfolds at the pace of safety.`,
        },
        {
          title: `Meditation: ${weekTheme}`,
          description: `A guided meditation to deepen your experience of ${weekTheme.toLowerCase()}.`,
          lesson_type: 'audio',
          content_category: 'meditation',
          duration_sec: 960,
          content_url: '',
        },
        {
          title: `Deeper Assignment: ${weekTheme}`,
          description: `Integration practice for ${weekTheme.toLowerCase()}.`,
          lesson_type: 'text',
          content_category: 'assignment',
          duration_sec: 300,
          content_text: `# Deeper Assignment: ${weekTheme}

For 7 days, bring conscious attention to ${weekTheme.toLowerCase()} in your daily life.

## The Practice

1. **Morning**: Set an intention to notice ${weekTheme.toLowerCase()} throughout the day
2. **Throughout the day**: When you notice it, pause briefly
3. **Evening**: Reflect on what you observed

No journaling required unless it serves you.

The practice is noticing, not analyzing.

This trains awareness to recognize ${weekTheme.toLowerCase()} naturally.`,
        },
      ],
    }
  })
}

// ============================================================================
// ALL 12 MONTHLY COURSES
// ============================================================================

const ALL_COURSES: MonthCourse[] = [
  {
    month: 1,
    title: 'Month 1: Foundations of Self-Awareness',
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
    weeks: MONTH_1_WEEKS,
  },
  ...MONTHLY_THEMES.map((monthData) => ({
    month: monthData.month,
    title: monthData.title,
    description: monthData.description,
    weeks: generatePlaceholderWeeks(monthData),
  })),
]

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seed() {
  console.log('Starting Inner Ascend Monthly Courses seed...')
  console.log('Connected to:', supabaseUrl)
  console.log(`Will create ${ALL_COURSES.length} courses`)

  // 1. Clear existing course data
  console.log('\nClearing existing course data...')

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
  console.log('\nLooking for tenant...')
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

  const now = new Date().toISOString()
  let totalModules = 0
  let totalLessons = 0

  // 4. Create all monthly courses
  for (const courseData of ALL_COURSES) {
    console.log(`\nCreating: ${courseData.title}`)

    const { data: course, error: createCourseError } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        cover_url: '',
        status: 'live',
        release_at: now,
        is_published: true,
        published_at: now,
        tenant_id: tenant.id,
        instructor_id: instructorId,
        order_index: courseData.month, // Month 1 = 1, Month 2 = 2, etc.
      })
      .select()
      .single()

    if (createCourseError) {
      console.error(`Failed to create course ${courseData.title}:`, createCourseError)
      continue
    }

    // 5. Create modules (weeks) and lessons
    for (let weekIndex = 0; weekIndex < courseData.weeks.length; weekIndex++) {
      const week = courseData.weeks[weekIndex]

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
        console.error(`  Failed to create module ${week.title}:`, moduleError)
        continue
      }

      totalModules++

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
          console.error(`    Failed to create lesson "${lesson.title}":`, lessonError)
        } else {
          totalLessons++
        }
      }
    }

    console.log(`  Created ${courseData.weeks.length} modules, ${courseData.weeks.reduce((acc, w) => acc + w.lessons.length, 0)} lessons`)
  }

  console.log('\n✅ Seed complete!')
  console.log(`Created: ${ALL_COURSES.length} courses, ${totalModules} modules, ${totalLessons} lessons`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
