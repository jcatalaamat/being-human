import { CourseCardSkeleton, EmptyState, ErrorState } from '@my/ui'
import { ScrollView, YStack, H2 } from '@my/ui'
import { TRAINING } from 'app/constants/copy'
import { api } from 'app/utils/api'

import { AllCoursesSection } from './components/all-courses-section'
import { ContinueLearningSection } from './components/continue-learning-section'

export function LibraryScreen() {
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

        {continueLearning && continueLearning.length > 0 && !continueError && (
          <ContinueLearningSection courses={continueLearning} />
        )}

        <AllCoursesSection courses={allCourses || []} isLoading={coursesLoading} />
      </YStack>
    </ScrollView>
  )
}
