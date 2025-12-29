import { EmptyState, ErrorState, FullscreenSpinner, NextEventCard } from '@my/ui'
import { Calendar, Video } from '@tamagui/lucide-icons'
import { Button, H2, H4, Paragraph, ScrollView, XStack, YStack } from 'tamagui'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { Linking } from 'react-native'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMonth(dateStr: string): string {
  return MONTHS[new Date(dateStr).getMonth()] || ''
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

export function EventsScreen() {
  const router = useAppRouter()

  const {
    data: upcomingEvents,
    isPending,
    error,
    refetch,
  } = api.events.listUpcoming.useQuery({ limit: 30 })

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />
  }

  if (isPending) {
    return <FullscreenSpinner />
  }

  const now = new Date()
  const liveEvents =
    upcomingEvents?.filter((e) => new Date(e.startsAt) <= now && e.meetingUrl) || []
  const futureEvents = upcomingEvents?.filter((e) => new Date(e.startsAt) > now) || []

  const handleEventPress = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const handleJoin = (meetingUrl: string) => {
    Linking.openURL(meetingUrl)
  }

  if (!upcomingEvents || upcomingEvents.length === 0) {
    return (
      <ScrollView>
        <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
          <H2>Events</H2>
          <EmptyState
            icon={Calendar}
            title="No upcoming events"
            message="Check back later for scheduled events."
          />
        </YStack>
      </ScrollView>
    )
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$6">
        <H2>Events</H2>

        {liveEvents.length > 0 && (
          <YStack gap="$3">
            <XStack gap="$2" ai="center">
              <Video size={20} color="$red10" />
              <H4>Live Now</H4>
            </XStack>
            {liveEvents.map((event) => (
              <NextEventCard
                key={event.id}
                id={event.id}
                title={event.title}
                startsAt={event.startsAt}
                timezone={event.timezone}
                meetingUrl={event.meetingUrl}
                onPress={() => handleEventPress(event.id)}
                onJoin={() => handleJoin(event.meetingUrl!)}
              />
            ))}
          </YStack>
        )}

        {futureEvents.length > 0 && (
          <YStack gap="$3">
            <H4>Upcoming</H4>
            {futureEvents.map((event) => (
              <Button
                key={event.id}
                onPress={() => handleEventPress(event.id)}
                jc="flex-start"
                bg="$color2"
                borderWidth={1}
                borderColor="$borderColor"
                h="auto"
                py="$3"
                px="$3"
              >
                <XStack gap="$3" ai="center" f={1}>
                  <YStack ai="center" w={50}>
                    <Paragraph size="$5" fontWeight="700">
                      {new Date(event.startsAt).getDate()}
                    </Paragraph>
                    <Paragraph size="$2" theme="alt2">
                      {formatMonth(event.startsAt)}
                    </Paragraph>
                  </YStack>
                  <YStack f={1} gap="$1">
                    <Paragraph fontWeight="500">{event.title}</Paragraph>
                    <Paragraph size="$2" theme="alt2">
                      {formatTime(event.startsAt)}
                    </Paragraph>
                  </YStack>
                </XStack>
              </Button>
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
