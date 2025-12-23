import { H5, Separator, YStack } from 'tamagui'

import type { LessonType } from './LessonRow'
import { LessonRow } from './LessonRow'

export interface Lesson {
  id: string
  title: string
  type: LessonType
  durationSec?: number
  isComplete?: boolean
}

export interface ModuleSectionProps {
  title: string
  lessons: Lesson[]
  onLessonPress: (lessonId: string) => void
}

export const ModuleSection = ({ title, lessons, onLessonPress }: ModuleSectionProps) => {
  return (
    <YStack gap="$2" p="$3" bg="$background" br="$3" borderWidth={1} borderColor="$borderColor">
      <H5 size="$4">{title}</H5>
      <Separator />
      <YStack gap="$2">
        {lessons.map((lesson) => (
          <LessonRow
            key={lesson.id}
            title={lesson.title}
            type={lesson.type}
            durationSec={lesson.durationSec}
            isComplete={lesson.isComplete}
            onPress={() => onLessonPress(lesson.id)}
          />
        ))}
      </YStack>
    </YStack>
  )
}
