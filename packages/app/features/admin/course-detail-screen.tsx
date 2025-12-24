import { Button, H2, H4, Paragraph, ScrollView, Settings, YStack, XStack } from '@my/ui'
import { Plus, FileText, Trash, Pencil, ChevronUp, ChevronDown } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'

interface AdminCourseDetailScreenProps {
  courseId: string
}

export function AdminCourseDetailScreen({ courseId }: AdminCourseDetailScreenProps) {
  const router = useAppRouter()
  const { data: course } = api.courses.getById.useQuery({ courseId })
  const { data: modules, refetch } = api.courses.getModulesWithLessons.useQuery({ courseId })
  const deleteModuleMutation = api.admin.deleteModule.useMutation()
  const deleteLessonMutation = api.admin.deleteLesson.useMutation()
  const reorderModuleMutation = api.admin.reorderModule.useMutation()
  const reorderLessonMutation = api.admin.reorderLesson.useMutation()

  const handleDeleteModule = async (id: string, title: string) => {
    if (confirm(`Delete module "${title}" and all its lessons?`)) {
      await deleteModuleMutation.mutateAsync({ id })
      refetch()
    }
  }

  const handleDeleteLesson = async (id: string, title: string) => {
    if (confirm(`Delete lesson "${title}"?`)) {
      await deleteLessonMutation.mutateAsync({ id })
      refetch()
    }
  }

  const handleMoveModule = async (moduleId: string, direction: 'up' | 'down') => {
    if (!modules) return
    const currentIndex = modules.findIndex((m) => m.id === moduleId)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= modules.length) return

    await reorderModuleMutation.mutateAsync({
      id: moduleId,
      newOrderIndex: modules[targetIndex].orderIndex,
    })
    await reorderModuleMutation.mutateAsync({
      id: modules[targetIndex].id,
      newOrderIndex: modules[currentIndex].orderIndex,
    })
    refetch()
  }

  const handleMoveLesson = async (moduleId: string, lessonId: string, direction: 'up' | 'down') => {
    if (!modules) return
    const module = modules.find((m) => m.id === moduleId)
    if (!module) return

    const currentIndex = module.lessons.findIndex((l) => l.id === lessonId)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= module.lessons.length) return

    await reorderLessonMutation.mutateAsync({
      id: lessonId,
      newOrderIndex: module.lessons[targetIndex].orderIndex,
    })
    await reorderLessonMutation.mutateAsync({
      id: module.lessons[targetIndex].id,
      newOrderIndex: module.lessons[currentIndex].orderIndex,
    })
    refetch()
  }

  if (!course) return <Paragraph>Loading...</Paragraph>

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <XStack jc="space-between" ai="flex-start">
          <YStack gap="$2" f={1}>
            <H2>{course.title}</H2>
            <Paragraph theme="alt2">{course.description}</Paragraph>
          </YStack>
          <Button
            size="$3"
            icon={Pencil}
            onPress={() => router.push(`/admin/courses/${courseId}/edit`)}
          >
            Edit
          </Button>
        </XStack>

        <Button onPress={() => router.push(`/admin/courses/${courseId}/modules/new`)} icon={Plus} themeInverse>
          Add Module
        </Button>

        <YStack gap="$4">
          {modules?.map((module, moduleIndex) => (
            <YStack key={module.id} gap="$2" bg="$background" p="$4" br="$4" borderWidth={1} borderColor="$borderColor">
              <XStack jc="space-between" ai="flex-start">
                <XStack gap="$2" ai="center">
                  <YStack>
                    <Button
                      size="$2"
                      chromeless
                      icon={ChevronUp}
                      disabled={moduleIndex === 0}
                      opacity={moduleIndex === 0 ? 0.3 : 1}
                      onPress={() => handleMoveModule(module.id, 'up')}
                    />
                    <Button
                      size="$2"
                      chromeless
                      icon={ChevronDown}
                      disabled={moduleIndex === modules.length - 1}
                      opacity={moduleIndex === modules.length - 1 ? 0.3 : 1}
                      onPress={() => handleMoveModule(module.id, 'down')}
                    />
                  </YStack>
                  <YStack gap="$2" f={1}>
                    <H4>{module.title}</H4>
                    <Paragraph size="$2" theme="alt2">
                      {module.description}
                    </Paragraph>
                  </YStack>
                </XStack>
                <XStack gap="$2">
                  <Button
                    size="$2"
                    chromeless
                    icon={Pencil}
                    onPress={() => router.push(`/admin/courses/${courseId}/modules/${module.id}/edit`)}
                  />
                  <Button
                    size="$2"
                    chromeless
                    icon={Trash}
                    theme="red"
                    onPress={() => handleDeleteModule(module.id, module.title)}
                  />
                </XStack>
              </XStack>

              <Button
                size="$2"
                onPress={() => router.push(`/admin/courses/${courseId}/modules/${module.id}/lessons/new`)}
                icon={Plus}
              >
                Add Exercise
              </Button>

              <Settings>
                <Settings.Items>
                  <Settings.Group>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <Settings.Item key={lesson.id} icon={FileText} accentTheme="gray">
                        <XStack gap="$1" ai="center">
                          <YStack>
                            <Button
                              size="$1"
                              chromeless
                              icon={ChevronUp}
                              disabled={lessonIndex === 0}
                              opacity={lessonIndex === 0 ? 0.3 : 1}
                              onPress={(e) => {
                                e.stopPropagation()
                                handleMoveLesson(module.id, lesson.id, 'up')
                              }}
                            />
                            <Button
                              size="$1"
                              chromeless
                              icon={ChevronDown}
                              disabled={lessonIndex === module.lessons.length - 1}
                              opacity={lessonIndex === module.lessons.length - 1 ? 0.3 : 1}
                              onPress={(e) => {
                                e.stopPropagation()
                                handleMoveLesson(module.id, lesson.id, 'down')
                              }}
                            />
                          </YStack>
                          <YStack f={1}>
                            <Paragraph fontWeight="600">{lesson.title}</Paragraph>
                            <Paragraph size="$2" theme="alt2">
                              {lesson.type} • {lesson.durationSec ? `${Math.floor(lesson.durationSec / 60)}min` : 'No duration'}
                            </Paragraph>
                          </YStack>
                        </XStack>
                        <XStack gap="$2">
                          <Button
                            size="$2"
                            chromeless
                            icon={Pencil}
                            onPress={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}/edit`)
                            }}
                          />
                          <Button
                            size="$2"
                            chromeless
                            icon={Trash}
                            theme="red"
                            onPress={(e) => {
                              e.stopPropagation()
                              handleDeleteLesson(lesson.id, lesson.title)
                            }}
                          />
                        </XStack>
                      </Settings.Item>
                    ))}
                  </Settings.Group>
                </Settings.Items>
              </Settings>
            </YStack>
          ))}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
