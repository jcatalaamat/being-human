import { Button, H2, Paragraph, ScrollView, Settings, YStack } from '@my/ui'
import { Plus, BookOpen, Edit, Trash } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'

export function AdminCoursesScreen() {
  const router = useAppRouter()
  const { data: courses, isPending, refetch } = api.courses.list.useQuery()
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
          <H2>Manage Courses</H2>
          <Button onPress={() => router.push('/admin/courses/new')} icon={Plus} themeInverse>
            Create Course
          </Button>
        </YStack>

        {isPending ? (
          <Paragraph>Loading...</Paragraph>
        ) : (
          <Settings>
            <Settings.Items>
              <Settings.Group>
                {courses?.map((course) => (
                  <Settings.Item
                    key={course.id}
                    icon={BookOpen}
                    onPress={() => router.push(`/admin/courses/${course.id}`)}
                    accentTheme="blue"
                  >
                    <YStack f={1}>
                      <Paragraph fontWeight="600">{course.title}</Paragraph>
                      <Paragraph size="$2" theme="alt2">
                        {course.description || 'No description'}
                      </Paragraph>
                    </YStack>
                    <Button
                      size="$2"
                      chromeless
                      icon={Edit}
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
                ))}
              </Settings.Group>
            </Settings.Items>
          </Settings>
        )}
      </YStack>
    </ScrollView>
  )
}
