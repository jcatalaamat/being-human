import { Button, EmptyState, ErrorState, FullscreenSpinner } from '@my/ui'
import { ScrollView, YStack } from '@my/ui'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'

import { CourseHeader } from './components/course-header'
import { ModuleList } from './components/module-list'

interface CourseDetailScreenProps {
  courseId: string
}

export function CourseDetailScreen({ courseId }: CourseDetailScreenProps) {
  const router = useAppRouter()
  const { data: course, isPending: courseLoading, error: courseError } = api.courses.getById.useQuery({ courseId })

  const {
    data: modules,
    isPending: modulesLoading,
    error: modulesError,
  } = api.courses.getModulesWithLessons.useQuery({ courseId })

  const enrollMutation = api.courses.enroll.useMutation()

  const handleStartCourse = async () => {
    // Enroll in the course
    await enrollMutation.mutateAsync({ courseId })

    // Navigate to first lesson if available
    if (modules && modules.length > 0 && modules[0].lessons && modules[0].lessons.length > 0) {
      const firstLesson = modules[0].lessons[0]
      router.push(`/course/lesson/${firstLesson.id}`)
    }
  }

  const handleResumeCourse = () => {
    // Find the first incomplete lesson
    if (modules) {
      for (const module of modules) {
        const incompleteLesson = module.lessons.find((lesson) => !lesson.isComplete)
        if (incompleteLesson) {
          router.push(`/course/lesson/${incompleteLesson.id}`)
          return
        }
      }

      // If all lessons are complete, go to first lesson
      if (modules[0]?.lessons?.[0]) {
        router.push(`/course/lesson/${modules[0].lessons[0].id}`)
      }
    }
  }

  // Show error state if failed to load
  if (courseError || modulesError) {
    return (
      <ErrorState
        message={courseError?.message || modulesError?.message || 'Failed to load course'}
        onRetry={() => router.back()}
      />
    )
  }

  // Show loading state
  if (courseLoading || modulesLoading || !course || !modules) {
    return <FullscreenSpinner />
  }

  // Check if user has started the course (has any progress)
  const hasStarted = course.progressPct > 0

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" gap="$4">
        <CourseHeader
          title={course.title}
          description={course.description || undefined}
          coverUrl={course.coverUrl || undefined}
          progressPct={course.progressPct || 0}
        />

        <Button onPress={hasStarted ? handleResumeCourse : handleStartCourse} size="$5" mx="$4" themeInverse>
          {hasStarted ? 'Resume Course' : 'Start Course'}
        </Button>

        {modules.length > 0 ? (
          <ModuleList modules={modules} courseId={courseId} />
        ) : (
          <EmptyState title="No lessons yet" message="This course doesn't have any lessons yet." />
        )}
      </YStack>
    </ScrollView>
  )
}
