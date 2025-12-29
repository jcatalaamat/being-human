import { CourseCardSkeleton, EmptyState, ErrorState, NextActionCard, NextEventCard } from '@my/ui'
import { ScrollView, YStack, H2 } from '@my/ui'
import { TRAINING } from 'app/constants/copy'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { Linking } from 'react-native'

import { AllCoursesSection } from './components/all-courses-section'
import { ContinueLearningSection } from './components/continue-learning-section'

export function LibraryScreen() {
  const router = useAppRouter()

  const {
    data: continueLearning,
    isPending: continueLoading,
    error: continueError,
    refetch: refetchContinue,
  } = api.courses.getContinueLearning.useQuery()

  const {
    data: allCourses,
    isPending: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = api.courses.list.useQuery()

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

  // Show error state if courses failed to load
  if (coursesError && !coursesLoading) {
    return <ErrorState message={coursesError.message} onRetry={() => refetchCourses()} />
  }

  // Show loading skeleton on initial load
  if (coursesLoading && !allCourses) {
    return (
      <ScrollView>
        <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
          <H2>{TRAINING.pageTitle}</H2>
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </YStack>
      </ScrollView>
    )
  }

  // Show empty state if no courses
  if (!coursesLoading && (!allCourses || allCourses.length === 0)) {
    return (
      <ScrollView>
        <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$6">
          <H2>{TRAINING.pageTitle}</H2>
          <EmptyState title={TRAINING.noCourses} message={TRAINING.noCoursesMessage} />
        </YStack>
      </ScrollView>
    )
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$6">
        <H2>{TRAINING.pageTitle}</H2>

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
            onPress={() => handlePromptPress(pendingPrompts[0].lessonId)}
          />
        )}

        {continueLearning && continueLearning.length > 0 && !continueError && (
          <ContinueLearningSection courses={continueLearning} />
        )}

        <AllCoursesSection courses={allCourses || []} isLoading={coursesLoading} />
      </YStack>
    </ScrollView>
  )
}
