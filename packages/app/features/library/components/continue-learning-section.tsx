import { ContinueCard } from '@my/ui'
import { H3, YStack } from '@my/ui'
import { TRAINING } from 'app/constants/copy'
import { useAppRouter } from 'app/utils/navigation'

interface Course {
  id: string
  title: string
  lastLessonId?: string | null
  lastLessonTitle?: string | null
  lastAccessedAt?: string | null
  progressPct?: number
}

interface ContinueLearningSectionProps {
  courses: Course[]
}

export function ContinueLearningSection({ courses }: ContinueLearningSectionProps) {
  const router = useAppRouter()

  const handleContinue = (course: Course) => {
    if (course.lastLessonId) {
      // Navigate directly to the last lesson
      router.push(`/course/lesson/${course.lastLessonId}`)
    } else {
      // Navigate to course detail to pick a lesson
      router.push(`/course/${course.id}`)
    }
  }

  return (
    <YStack gap="$3">
      <H3>{TRAINING.continueTraining}</H3>
      {courses.map((course) => (
        <ContinueCard
          key={course.id}
          courseTitle={course.title}
          lastLessonTitle={course.lastLessonTitle || undefined}
          lastAccessedAt={course.lastAccessedAt || undefined}
          progressPct={course.progressPct || 0}
          onContinue={() => handleContinue(course)}
        />
      ))}
    </YStack>
  )
}
