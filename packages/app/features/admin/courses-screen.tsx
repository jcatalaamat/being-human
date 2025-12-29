import {
  AlertDialog,
  Button,
  EmptyState,
  FormSheet,
  H4,
  Input,
  Paragraph,
  ScrollView,
  Settings,
  SizableText,
  TextArea,
  XStack,
  YStack,
  useToastController,
} from '@my/ui'
import { BookOpen, Calendar, ClipboardList, Dumbbell, Pencil, Plus, Trash, Users } from '@tamagui/lucide-icons'
import { COURSE, TRAINING } from 'app/constants/copy'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useEffect, useState } from 'react'

type CourseStatus = 'draft' | 'scheduled' | 'live'

interface CourseFormData {
  title: string
  description: string
  coverUrl: string
  status: CourseStatus
  releaseAt: string
}

const initialFormData: CourseFormData = {
  title: '',
  description: '',
  coverUrl: '',
  status: 'draft',
  releaseAt: '',
}

type CourseType = {
  id: string
  title: string
  description?: string | null
  coverUrl?: string | null
  status: string
  releaseAt?: string | null
}

export function AdminCoursesScreen() {
  const router = useAppRouter()
  const toast = useToastController()
  const utils = api.useUtils()

  // Use admin endpoint to see all courses (including unpublished)
  const { data: courses, isPending, refetch } = api.admin.listCourses.useQuery()

  // Get counts for badges
  const { data: unreadJournal } = api.journal.getUnreadCount.useQuery()
  const { data: pendingResponses } = api.prompts.listResponses.useQuery({ status: 'submitted' })

  // Sheet state
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseType | null>(null)
  const [formData, setFormData] = useState<CourseFormData>(initialFormData)

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const courseToDelete = courses?.find((c) => c.id === deleteId)

  // Mutations
  const createMutation = api.admin.createCourse.useMutation({
    onSuccess: (course) => {
      toast.show('Course created')
      setShowCreateSheet(false)
      setFormData(initialFormData)
      utils.admin.listCourses.invalidate()
      router.push(`/admin/courses/${course.id}`)
    },
    onError: (error) => {
      toast.show(error.message)
    },
  })

  const updateMutation = api.admin.updateCourse.useMutation({
    onSuccess: () => {
      toast.show('Course updated')
      setEditingCourse(null)
      setFormData(initialFormData)
      utils.admin.listCourses.invalidate()
    },
    onError: (error) => {
      toast.show(error.message)
    },
  })

  const deleteMutation = api.admin.deleteCourse.useMutation({
    onSuccess: () => {
      setDeleteId(null)
      toast.show('Course deleted')
      refetch()
    },
    onError: (error) => {
      toast.show(error.message)
    },
  })

  // When editing, populate form
  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title,
        description: editingCourse.description || '',
        coverUrl: editingCourse.coverUrl || '',
        status: editingCourse.status as CourseStatus,
        releaseAt: editingCourse.releaseAt || '',
      })
    }
  }, [editingCourse])

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync({ id: deleteId })
    }
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.show('Title is required')
      return
    }

    if (formData.status === 'scheduled' && !formData.releaseAt) {
      toast.show('Please set a release date for scheduled courses')
      return
    }

    if (editingCourse) {
      updateMutation.mutate({
        id: editingCourse.id,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        coverUrl: formData.coverUrl.trim() || undefined,
        status: formData.status,
        releaseAt: formData.releaseAt || undefined,
      })
    } else {
      createMutation.mutate({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        coverUrl: formData.coverUrl.trim() || undefined,
        status: formData.status,
        releaseAt: formData.releaseAt || undefined,
      })
    }
  }

  const handleOpenCreate = () => {
    setFormData(initialFormData)
    setShowCreateSheet(true)
  }

  const handleOpenEdit = (course: CourseType) => {
    setEditingCourse(course)
  }

  const handleCloseSheet = () => {
    setShowCreateSheet(false)
    setEditingCourse(null)
    setFormData(initialFormData)
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isEditing = !!editingCourse

  const renderForm = () => (
    <>
      <YStack gap="$2">
        <Paragraph size="$2" fontWeight="500">
          Title <SizableText color="$red10">*</SizableText>
        </Paragraph>
        <Input
          placeholder="Course title"
          value={formData.title}
          onChangeText={(v) => setFormData((f) => ({ ...f, title: v }))}
        />
      </YStack>

      <YStack gap="$2">
        <Paragraph size="$2" fontWeight="500">
          Description
        </Paragraph>
        <TextArea
          placeholder="Course description"
          value={formData.description}
          onChangeText={(v) => setFormData((f) => ({ ...f, description: v }))}
          minHeight={80}
        />
      </YStack>

      <YStack gap="$2">
        <Paragraph size="$2" fontWeight="500">
          Cover Image URL
        </Paragraph>
        <Input
          placeholder="https://..."
          value={formData.coverUrl}
          onChangeText={(v) => setFormData((f) => ({ ...f, coverUrl: v }))}
          autoCapitalize="none"
        />
      </YStack>

      <YStack gap="$2">
        <Paragraph size="$2" fontWeight="500">
          Status
        </Paragraph>
        <XStack gap="$2" flexWrap="wrap">
          <Button
            size="$3"
            themeInverse={formData.status === 'draft'}
            onPress={() => setFormData((f) => ({ ...f, status: 'draft' }))}
          >
            Draft
          </Button>
          <Button
            size="$3"
            themeInverse={formData.status === 'scheduled'}
            onPress={() => setFormData((f) => ({ ...f, status: 'scheduled' }))}
          >
            Scheduled
          </Button>
          <Button
            size="$3"
            themeInverse={formData.status === 'live'}
            onPress={() => setFormData((f) => ({ ...f, status: 'live' }))}
          >
            Live
          </Button>
        </XStack>
        <Paragraph size="$1" theme="alt2">
          {formData.status === 'draft' && 'Course is hidden from members'}
          {formData.status === 'scheduled' && 'Course visible but locked until release date'}
          {formData.status === 'live' && 'Course is visible and accessible to members'}
        </Paragraph>
      </YStack>

      {formData.status === 'scheduled' && (
        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Release Date <SizableText color="$red10">*</SizableText>
          </Paragraph>
          <Input
            placeholder="YYYY-MM-DDTHH:MM"
            value={formData.releaseAt ? new Date(formData.releaseAt).toISOString().slice(0, 16) : ''}
            onChangeText={(val) => setFormData((f) => ({ ...f, releaseAt: val ? new Date(val).toISOString() : '' }))}
          />
          <Paragraph size="$1" theme="alt2">
            When should this course become available?
          </Paragraph>
        </YStack>
      )}

      <Button themeInverse size="$4" onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting
          ? isEditing
            ? 'Saving...'
            : 'Creating...'
          : isEditing
            ? 'Save Changes'
            : 'Create Course'}
      </Button>
    </>
  )

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$6">
        {/* Quick Actions */}
        <YStack gap="$3">
          <H4>Quick Actions</H4>
          <XStack gap="$2" flexWrap="wrap">
            <Button
              f={1}
              minWidth={150}
              onPress={() => router.push('/admin/events')}
              icon={Calendar}
            >
              Events
            </Button>
            <Button
              f={1}
              minWidth={150}
              onPress={() => router.push('/admin/journal')}
              icon={BookOpen}
            >
              Journal
              {unreadJournal && unreadJournal > 0 && (
                <XStack bg="$red10" px="$2" py="$1" borderRadius="$10" ml="$2">
                  <Paragraph size="$1" color="white" fontWeight="600">
                    {unreadJournal}
                  </Paragraph>
                </XStack>
              )}
            </Button>
            <Button
              f={1}
              minWidth={150}
              onPress={() => router.push('/admin/responses')}
              icon={ClipboardList}
            >
              Responses
              {pendingResponses && pendingResponses.length > 0 && (
                <XStack bg="$red10" px="$2" py="$1" borderRadius="$10" ml="$2">
                  <Paragraph size="$1" color="white" fontWeight="600">
                    {pendingResponses.length}
                  </Paragraph>
                </XStack>
              )}
            </Button>
            <Button
              f={1}
              minWidth={150}
              onPress={() => router.push('/admin/members')}
              icon={Users}
            >
              Members
            </Button>
          </XStack>
        </YStack>

        {/* Courses Section */}
        <YStack gap="$3">
          <XStack jc="space-between" ai="center">
            <H4>Courses</H4>
            <Button size="$3" onPress={handleOpenCreate} icon={Plus}>
              New Course
            </Button>
          </XStack>
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
                          handleOpenEdit(course)
                        }}
                      />
                      <Button
                        size="$2"
                        chromeless
                        icon={Trash}
                        theme="red"
                        onPress={(e) => {
                          e.stopPropagation()
                          setDeleteId(course.id)
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

      {/* Create Course Sheet */}
      <FormSheet
        open={showCreateSheet}
        onOpenChange={(open) => !open && handleCloseSheet()}
        title="New Course"
      >
        {renderForm()}
      </FormSheet>

      {/* Edit Course Sheet */}
      <FormSheet
        open={!!editingCourse}
        onOpenChange={(open) => !open && handleCloseSheet()}
        title="Edit Course"
      >
        {renderForm()}
      </FormSheet>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <AlertDialog.Content
            bordered
            elevate
            key="content"
            animation="quick"
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            p="$4"
            gap="$4"
            maw={400}
          >
            <AlertDialog.Title>Delete Course</AlertDialog.Title>
            <AlertDialog.Description>
              Are you sure you want to delete "{courseToDelete?.title}"? This will also delete all modules and lessons. This action cannot be undone.
            </AlertDialog.Description>
            <XStack gap="$3" jc="flex-end">
              <AlertDialog.Cancel asChild>
                <Button>Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button theme="red" onPress={handleDelete} disabled={deleteMutation.isPending}>
                  Delete
                </Button>
              </AlertDialog.Action>
            </XStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </ScrollView>
  )
}
