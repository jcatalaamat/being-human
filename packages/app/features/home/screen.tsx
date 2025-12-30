import { NextActionCard, NextEventCard } from '@my/ui'
import { ScrollView, YStack, H1, H2, Paragraph, XStack, Card, SizableText } from '@my/ui'
import { BookOpen, Calendar, PenTool } from '@tamagui/lucide-icons'
import { BRAND } from 'app/constants/copy'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { Linking } from 'react-native'

import { ContinueLearningSection } from '../library/components/continue-learning-section'

export function HomeScreen() {
  const router = useAppRouter()

  const { data: continueLearning } = api.courses.getContinueLearning.useQuery()

  // Next upcoming event
  const { data: nextEvent } = api.events.getNextUpcoming.useQuery()

  // Pending required prompts
  const { data: pendingPrompts } = api.prompts.getPendingRequired.useQuery()

  const handleEventPress = () => {
    if (nextEvent) {
      router.push(`/events/${nextEvent.id}`)
    }
  }

  const handleEventJoin = () => {
    if (nextEvent?.meetingUrl) {
      Linking.openURL(nextEvent.meetingUrl)
    }
  }

  const handlePromptPress = (lessonId: string) => {
    router.push(`/course/lesson/${lessonId}`)
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$6">
        {/* Welcome Header */}
        <YStack gap="$2">
          <H1>Welcome to {BRAND.name}</H1>
          <Paragraph size="$5" color="$color11">
            {BRAND.tagline}
          </Paragraph>
        </YStack>

        {/* Next Event Card */}
        {nextEvent && (
          <NextEventCard
            id={nextEvent.id}
            title={nextEvent.title}
            startsAt={nextEvent.startsAt}
            timezone={nextEvent.timezone}
            meetingUrl={nextEvent.meetingUrl}
            onPress={handleEventPress}
            onJoin={handleEventJoin}
          />
        )}

        {/* Pending Required Prompt */}
        {pendingPrompts && pendingPrompts.length > 0 && (
          <NextActionCard
            title={pendingPrompts[0].title}
            lessonTitle={pendingPrompts[0].lessonTitle}
            courseTitle={pendingPrompts[0].courseTitle}
            thumbnailUrl={pendingPrompts[0].thumbnailUrl}
            onPress={() => handlePromptPress(pendingPrompts[0].lessonId)}
          />
        )}

        {/* Continue Learning */}
        {continueLearning && continueLearning.length > 0 && (
          <ContinueLearningSection courses={continueLearning} />
        )}

        {/* Quick Links */}
        <YStack gap="$3">
          <H2>Quick Links</H2>
          <XStack gap="$3" flexWrap="wrap">
            <QuickLinkCard
              icon={<BookOpen size={24} color="$color11" />}
              title="Course"
              description="Continue your journey"
              onPress={() => router.push('/course')}
            />
            <QuickLinkCard
              icon={<Calendar size={24} color="$color11" />}
              title="Events"
              description="Upcoming live sessions"
              onPress={() => router.push('/events')}
            />
            <QuickLinkCard
              icon={<PenTool size={24} color="$color11" />}
              title="Assignments"
              description="Your reflections"
              onPress={() => router.push('/assignments')}
            />
          </XStack>
        </YStack>
      </YStack>
    </ScrollView>
  )
}

function QuickLinkCard({
  icon,
  title,
  description,
  onPress,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onPress: () => void
}) {
  return (
    <Card
      f={1}
      minWidth={140}
      p="$4"
      pressStyle={{ scale: 0.98, bg: '$backgroundHover' }}
      animation="quick"
      onPress={onPress}
      cursor="pointer"
    >
      <YStack gap="$2" ai="center">
        {icon}
        <SizableText fontWeight="600">{title}</SizableText>
        <SizableText size="$2" color="$color10" ta="center">
          {description}
        </SizableText>
      </YStack>
    </Card>
  )
}
