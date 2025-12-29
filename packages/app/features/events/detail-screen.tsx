import { ErrorState, FullscreenSpinner, MarkdownText } from '@my/ui'
import { Calendar, ExternalLink, Video } from '@tamagui/lucide-icons'
import { Button, H2, Paragraph, ScrollView, XStack, YStack } from 'tamagui'
import { api } from 'app/utils/api'
import { Linking } from 'react-native'

interface EventDetailScreenProps {
  eventId: string
}

export function EventDetailScreen({ eventId }: EventDetailScreenProps) {
  const { data: event, isPending, error, refetch } = api.events.getById.useQuery({ eventId })

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />
  }

  if (isPending || !event) {
    return <FullscreenSpinner />
  }

  const startDate = new Date(event.startsAt)
  const endDate = event.endsAt ? new Date(event.endsAt) : null
  const now = new Date()
  const isLive = startDate <= now && event.meetingUrl
  const isPast = endDate ? endDate < now : startDate < now

  const handleJoin = () => {
    if (event.meetingUrl) {
      Linking.openURL(event.meetingUrl)
    }
  }

  const handleWatchReplay = () => {
    if (event.replayUrl) {
      Linking.openURL(event.replayUrl)
    }
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        {isLive && (
          <XStack bg="$red5" br="$2" px="$3" py="$2" gap="$2" ai="center" als="flex-start">
            <Video size={16} color="$red10" />
            <Paragraph color="$red10" fontWeight="600">
              Live Now
            </Paragraph>
          </XStack>
        )}

        <H2>{event.title}</H2>

        <XStack gap="$2" ai="center">
          <Calendar size={16} color="$color11" />
          <Paragraph>
            {startDate.toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Paragraph>
        </XStack>

        <Paragraph theme="alt1">
          {startDate.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          })}
          {endDate && (
            <>
              {' - '}
              {endDate.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </>
          )}
          {' '}({event.timezone})
        </Paragraph>

        {event.courseTitle && (
          <Paragraph size="$3" theme="alt2">
            Course: {event.courseTitle}
          </Paragraph>
        )}

        {event.description && (
          <YStack mt="$4">
            <MarkdownText>{event.description}</MarkdownText>
          </YStack>
        )}

        <YStack gap="$3" mt="$4">
          {isLive && event.meetingUrl && (
            <Button size="$4" themeInverse icon={Video} onPress={handleJoin}>
              Join Live Event
            </Button>
          )}

          {isPast && event.replayUrl && (
            <Button size="$4" themeInverse icon={ExternalLink} onPress={handleWatchReplay}>
              Watch Replay
            </Button>
          )}

          {!isLive && !isPast && event.meetingUrl && (
            <YStack bg="$color3" p="$4" br="$3" gap="$2">
              <Paragraph fontWeight="500">Meeting Link</Paragraph>
              <Paragraph size="$2" theme="alt1">
                The join button will appear when the event starts.
              </Paragraph>
            </YStack>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
