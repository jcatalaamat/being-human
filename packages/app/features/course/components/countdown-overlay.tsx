import { Card, H2, H4, Paragraph, XStack, YStack } from '@my/ui'
import { Calendar, Clock } from '@tamagui/lucide-icons'

import { useCountdown } from '../../lesson/hooks/useCountdown'

interface CountdownOverlayProps {
  releaseAt: string
  courseTitle: string
}

interface TimeBlockProps {
  value: number
  label: string
}

function TimeBlock({ value, label }: TimeBlockProps) {
  return (
    <YStack ai="center" gap="$1">
      <YStack
        bg="$color4"
        px="$3"
        py="$2"
        br="$4"
        minWidth={60}
        ai="center"
      >
        <H2 size="$8" fontWeight="700">
          {value.toString().padStart(2, '0')}
        </H2>
      </YStack>
      <Paragraph size="$2" theme="alt2" textTransform="uppercase">
        {label}
      </Paragraph>
    </YStack>
  )
}

export function CountdownOverlay({ releaseAt, courseTitle }: CountdownOverlayProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(releaseAt)

  // Format the release date for display
  const releaseDate = new Date(releaseAt)
  const formattedDate = releaseDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = releaseDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  if (isExpired) {
    return null
  }

  return (
    <YStack f={1} jc="center" ai="center" p="$4" bg="$color2">
      <Card
        elevate
        bordered
        p="$6"
        br="$6"
        w="100%"
        maxWidth={400}
        gap="$4"
        ai="center"
      >
        <YStack
          bg="$color4"
          p="$4"
          br="$10"
        >
          <Clock size={48} color="$color11" />
        </YStack>

        <YStack ai="center" gap="$2">
          <H4 size="$5" ta="center">Coming Soon</H4>
          <Paragraph theme="alt2" ta="center" size="$3">
            {courseTitle}
          </Paragraph>
        </YStack>

        {/* Countdown timer */}
        <XStack gap="$3" flexWrap="wrap" jc="center">
          <TimeBlock value={days} label="Days" />
          <TimeBlock value={hours} label="Hours" />
          <TimeBlock value={minutes} label="Mins" />
          <TimeBlock value={seconds} label="Secs" />
        </XStack>

        {/* Release date info */}
        <YStack
          bg="$color3"
          p="$3"
          br="$4"
          w="100%"
          gap="$2"
        >
          <XStack ai="center" gap="$2">
            <Calendar size={16} color="$color11" />
            <Paragraph size="$3" fontWeight="500">
              {formattedDate}
            </Paragraph>
          </XStack>
          <XStack ai="center" gap="$2">
            <Clock size={16} color="$color11" />
            <Paragraph size="$3" theme="alt2">
              {formattedTime}
            </Paragraph>
          </XStack>
        </YStack>

        <Paragraph size="$2" theme="alt2" ta="center">
          You'll be notified when this course becomes available.
        </Paragraph>
      </Card>
    </YStack>
  )
}
