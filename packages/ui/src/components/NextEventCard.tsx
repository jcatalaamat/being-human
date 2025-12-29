import { Calendar, Video } from '@tamagui/lucide-icons'
import { Button, Card, H5, Paragraph, XStack, YStack } from 'tamagui'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export interface NextEventCardProps {
  id: string
  title: string
  startsAt: string
  timezone?: string
  meetingUrl?: string | null
  onPress?: () => void
  onJoin?: () => void
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`
}

function formatEventTime(dateStr: string): string {
  const date = new Date(dateStr)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

export const NextEventCard = ({
  title,
  startsAt,
  meetingUrl,
  onPress,
  onJoin,
}: NextEventCardProps) => {
  const eventDate = new Date(startsAt)
  const now = new Date()
  const isLive = eventDate <= now && meetingUrl

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
      <XStack gap="$3" ai="center" pointerEvents="none">
        <YStack
          bg={isLive ? '$red5' : '$purple5'}
          br="$3"
          p="$3"
          ai="center"
          jc="center"
          w={56}
          h={56}
        >
          {isLive ? (
            <Video size={24} color="$red10" />
          ) : (
            <Calendar size={24} color="$purple10" />
          )}
        </YStack>

        <YStack f={1} gap="$1">
          <Paragraph size="$2" theme="alt2">
            {isLive ? 'Live Now' : 'Next Event'}
          </Paragraph>
          <H5 numberOfLines={1}>{title}</H5>
          <Paragraph size="$3" theme="alt1">
            {formatEventDate(startsAt)} at {formatEventTime(startsAt)}
          </Paragraph>
        </YStack>

        {isLive && meetingUrl && (
          <Button
            size="$3"
            themeInverse
            pointerEvents="auto"
            onPress={(e) => {
              e.stopPropagation()
              onJoin?.()
            }}
          >
            Join
          </Button>
        )}
      </XStack>
    </Card>
  )
}
