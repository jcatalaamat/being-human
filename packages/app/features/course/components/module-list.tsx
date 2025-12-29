import type { LessonType } from '@my/ui'
import { ModuleSection } from '@my/ui'
import { YStack } from '@my/ui'
import { useAppRouter } from 'app/utils/navigation'

interface Lesson {
  id: string
  title: string
  type: LessonType
  durationSec?: number | null
  isComplete?: boolean
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
  isLocked?: boolean
  unlockDate?: string | null
}

interface ModuleListProps {
  modules: Module[]
  courseId: string
}

export function ModuleList({ modules }: ModuleListProps) {
  const router = useAppRouter()

  const handleLessonPress = (lessonId: string) => {
    router.push(`/course/lesson/${lessonId}`)
  }

  return (
    <YStack gap="$3" px="$4" pb="$4">
      {modules.map((module) => (
        <ModuleSection
          key={module.id}
          title={module.title}
          lessons={module.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            durationSec: lesson.durationSec || undefined,
            isComplete: lesson.isComplete,
          }))}
          onLessonPress={handleLessonPress}
          isLocked={module.isLocked}
          unlockDate={module.unlockDate}
        />
      ))}
    </YStack>
  )
}
