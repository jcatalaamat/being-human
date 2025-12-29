import { CourseCard, CourseCardSkeleton } from '@my/ui'
import { H3, YStack } from '@my/ui'
import { TRAINING } from 'app/constants/copy'
import { useAppRouter } from 'app/utils/navigation'

interface Course {
  id: string
  title: string
  description?: string | null
  coverUrl?: string | null
  progressPct?: number
}

interface AllCoursesSectionProps {
  courses: Course[]
  isLoading?: boolean
}

export function AllCoursesSection({ courses, isLoading }: AllCoursesSectionProps) {
  const router = useAppRouter()

  const handleCoursePress = (courseId: string) => {
    router.push(`/course/${courseId}`)
  }

  return (
    <YStack gap="$3">
      <H3>{TRAINING.allCourses}</H3>
      {isLoading ? (
        <>
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </>
      ) : (
        courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.description || undefined}
            coverUrl={course.coverUrl || undefined}
            progressPct={course.progressPct || 0}
            onPress={() => handleCoursePress(course.id)}
          />
        ))
      )}
    </YStack>
  )
}
