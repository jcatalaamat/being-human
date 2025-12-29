import { Lock } from '@tamagui/lucide-icons'
import { H5, Paragraph, Separator, XStack, YStack } from 'tamagui'

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
  isLocked?: boolean
  unlockDate?: string | null
}

const formatUnlockDate = (dateString: string | null | undefined): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return ''
  if (diffDays === 1) return 'Unlocks tomorrow'
  if (diffDays <= 7) return `Unlocks in ${diffDays} days`

  return `Unlocks ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export const ModuleSection = ({ title, lessons, onLessonPress, isLocked, unlockDate }: ModuleSectionProps) => {
  const unlockText = formatUnlockDate(unlockDate)

  return (
    <YStack
      gap="$2"
      p="$3"
      bg="$background"
      br="$3"
      borderWidth={1}
      borderColor={isLocked ? '$gray6' : '$borderColor'}
      opacity={isLocked ? 0.7 : 1}
    >
      <XStack ai="center" jc="space-between">
        <XStack ai="center" gap="$2" f={1}>
          {isLocked && <Lock size={16} color="$gray10" />}
          <H5 size="$4" color={isLocked ? '$gray10' : undefined}>
            {title}
          </H5>
        </XStack>
        {isLocked && unlockText && (
          <Paragraph size="$2" color="$gray9">
            {unlockText}
          </Paragraph>
        )}
      </XStack>
      <Separator />
      <YStack gap="$2">
        {lessons.map((lesson) => (
          <LessonRow
            key={lesson.id}
            title={lesson.title}
            type={lesson.type}
            durationSec={lesson.durationSec}
            isComplete={isLocked ? false : lesson.isComplete}
            onPress={isLocked ? undefined : () => onLessonPress(lesson.id)}
            disabled={isLocked}
          />
        ))}
      </YStack>
    </YStack>
  )
}
