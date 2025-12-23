import { Play } from '@tamagui/lucide-icons'
import { Button, Card, H5, Paragraph, YStack } from 'tamagui'

import { ProgressBar } from './ProgressBar'

export interface ContinueCardProps {
  courseTitle: string
  lastLessonTitle?: string
  lastAccessedAt?: string
  progressPct?: number
  onContinue: () => void
}

export const ContinueCard = ({
  courseTitle,
  lastLessonTitle,
  lastAccessedAt,
  progressPct = 0,
  onContinue,
}: ContinueCardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return 'Today'
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Card bordered bg="$color2" p="$4" pressStyle={{ scale: 0.98 }}>
      <YStack gap="$3">
        <H5 numberOfLines={1}>{courseTitle}</H5>

        {lastLessonTitle && (
          <Paragraph size="$2" theme="alt2" numberOfLines={1}>
            Last watched: {lastLessonTitle}
          </Paragraph>
        )}

        {lastAccessedAt && (
          <Paragraph size="$2" theme="alt2">
            {formatDate(lastAccessedAt)}
          </Paragraph>
        )}

        <ProgressBar value={progressPct} />

        <Button size="$3" icon={Play} onPress={onContinue} themeInverse>
          Continue ({progressPct}% complete)
        </Button>
      </YStack>
    </Card>
  )
}
