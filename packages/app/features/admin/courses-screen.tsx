import { Button, EmptyState, H2, Paragraph, ScrollView, Settings, YStack } from '@my/ui'
import { Plus, Dumbbell, Pencil, Trash, Users } from '@tamagui/lucide-icons'
import { COURSE, TRAINING } from 'app/constants/copy'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'

export function AdminCoursesScreen() {
  const router = useAppRouter()
  // Use admin endpoint to see all courses (including unpublished)
  const { data: courses, isPending, refetch } = api.admin.listCourses.useQuery()
  const deleteMutation = api.admin.deleteCourse.useMutation()

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete "${title}"?`)) {
      await deleteMutation.mutateAsync({ id })
      refetch()
    }
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <YStack gap="$3">
          <H2>{COURSE.manage}</H2>
          <YStack gap="$2">
            <Button onPress={() => router.push('/admin/courses/new')} icon={Plus} themeInverse>
              {COURSE.create}
            </Button>
            <Button onPress={() => router.push('/admin/members')} icon={Users}>
              View Members
            </Button>
          </YStack>
        </YStack>

        {isPending ? (
          <Paragraph>Loading...</Paragraph>
        ) : courses && courses.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title={TRAINING.noCourses}
            message={COURSE.createFirst}
          />
        ) : (
          <Settings>
            <Settings.Items>
              <Settings.Group>
                {courses?.map((course) => {
                  const statusLabel = {
                    draft: ' (Draft)',
                    scheduled: ' (Scheduled)',
                    live: '',
                  }[course.status] || ''
                  const statusTheme = {
                    draft: 'gray',
                    scheduled: 'blue',
                    live: 'green',
                  }[course.status] || 'gray'

                  return (
                  <Settings.Item
                    key={course.id}
                    icon={Dumbbell}
                    onPress={() => router.push(`/admin/courses/${course.id}`)}
                    accentTheme={statusTheme as 'green' | 'blue' | 'gray'}
                  >
                    <YStack f={1}>
                      <Paragraph fontWeight="600">
                        {course.title}
                        {statusLabel}
                      </Paragraph>
                      <Paragraph size="$2" theme="alt2">
                        {course.description || COURSE.noDescription}
                      </Paragraph>
                    </YStack>
                    <Button
                      size="$2"
                      chromeless
                      icon={Pencil}
                      onPress={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/courses/${course.id}/edit`)
                      }}
                    />
                    <Button
                      size="$2"
                      chromeless
                      icon={Trash}
                      theme="red"
                      onPress={(e) => {
                        e.stopPropagation()
                        handleDelete(course.id, course.title)
                      }}
                    />
                  </Settings.Item>
                  )
                })}
              </Settings.Group>
            </Settings.Items>
          </Settings>
        )}
      </YStack>
    </ScrollView>
  )
}
