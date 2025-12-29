import { CheckCircle, Clock, FileText } from '@tamagui/lucide-icons'
import { Card, H5, Paragraph, XStack, YStack } from 'tamagui'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export type JournalStatus = 'active' | 'archived' | 'flagged'

export interface JournalEntryCardProps {
  id: string
  title?: string | null
  body: string
  status: JournalStatus
  courseTitle?: string | null
  lessonTitle?: string | null
  createdAt: string
  hasNewComments?: boolean
  onPress?: () => void
}

const statusConfig = {
  active: { icon: FileText, color: '$blue10', label: 'Active' },
  archived: { icon: CheckCircle, color: '$green10', label: 'Archived' },
  flagged: { icon: Clock, color: '$orange10', label: 'Flagged' },
}

export const JournalEntryCard = ({
  title,
  body,
  status,
  courseTitle,
  lessonTitle,
  createdAt,
  hasNewComments,
  onPress,
}: JournalEntryCardProps) => {
  const config = statusConfig[status]
  const Icon = config.icon

  // Strip markdown for preview
  const preview = body
    .replace(/[#*_~`>\[\]]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 150)

  return (
    <Card
      bordered
      bg="$color2"
      p="$4"
      pressStyle={{ scale: 0.98, opacity: 0.8 }}
      onPress={onPress}
      cursor="pointer"
      animation="quick"
    >
      <YStack gap="$2" pointerEvents="none">
        <XStack jc="space-between" ai="center">
          <XStack gap="$2" ai="center">
            <Icon size={16} color={config.color} />
            <Paragraph size="$2" color={config.color}>
              {config.label}
            </Paragraph>
            {hasNewComments && (
              <YStack bg="$red10" w={8} h={8} br={4} />
            )}
          </XStack>
          <Paragraph size="$2" theme="alt2">
            {formatDate(createdAt)}
          </Paragraph>
        </XStack>

        {title && (
          <H5 numberOfLines={1}>{title}</H5>
        )}

        <Paragraph size="$3" theme="alt1" numberOfLines={2}>
          {preview}
          {body.length > 150 && '...'}
        </Paragraph>

        {(courseTitle || lessonTitle) && (
          <Paragraph size="$2" theme="alt2" numberOfLines={1}>
            {[courseTitle, lessonTitle].filter(Boolean).join(' > ')}
          </Paragraph>
        )}
      </YStack>
    </Card>
  )
}
