import {
  AlertDialog,
  Button,
  EmptyState,
  FormSheet,
  FullscreenSpinner,
  H2,
  Input,
  Paragraph,
  ScrollView,
  Select,
  Settings,
  SizableText,
  TextArea,
  XStack,
  YStack,
  useToastController,
} from '@my/ui'
import { Calendar, Pencil, Plus, Trash, Video } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { formatShortDate, formatTime, formatDateTimeLocal } from 'app/utils/dateFormatting'
import { useAppRouter } from 'app/utils/navigation'
import { useEffect, useState } from 'react'

interface EventFormData {
  title: string
  description: string
  courseId: string
  startsAt: string
  endsAt: string
  timezone: string
  meetingUrl: string
  replayUrl: string
  visibility: 'tenant_members' | 'course_enrolled'
}

const initialFormData: EventFormData = {
  title: '',
  description: '',
  courseId: '',
  startsAt: '',
  endsAt: '',
  timezone: 'America/New_York',
  meetingUrl: '',
  replayUrl: '',
  visibility: 'tenant_members',
}

type EventType = {
  id: string
  title: string
  description?: string | null
  startsAt: string
  endsAt?: string | null
  timezone: string
  meetingUrl?: string | null
  replayUrl?: string | null
  courseId?: string | null
  visibility: string
}

export function AdminEventsScreen() {
  const router = useAppRouter()
  const toast = useToastController()
  const utils = api.useUtils()
  const { data: events, isPending, refetch } = api.events.listUpcoming.useQuery({ limit: 100 })
  const { data: courses } = api.courses.list.useQuery()

  // Sheet state
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null)
  const [formData, setFormData] = useState<EventFormData>(initialFormData)

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const eventToDelete = events?.find((e) => e.id === deleteId)

  // Mutations
  const createMutation = api.events.create.useMutation({
    onSuccess: () => {
      toast.show('Event created')
      setShowCreateSheet(false)
      setFormData(initialFormData)
      utils.events.listUpcoming.invalidate()
    },
    onError: (error) => {
      toast.show(error.message)
    },
  })

  const updateMutation = api.events.update.useMutation({
    onSuccess: () => {
      toast.show('Event updated')
      setEditingEvent(null)
      setFormData(initialFormData)
      utils.events.listUpcoming.invalidate()
    },
    onError: (error) => {
      toast.show(error.message)
    },
  })

  const deleteMutation = api.events.delete.useMutation({
    onSuccess: () => {
      setDeleteId(null)
      refetch()
    },
  })

  // When editing, populate form
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description || '',
        courseId: editingEvent.courseId || '',
        startsAt: formatDateTimeLocal(editingEvent.startsAt),
        endsAt: editingEvent.endsAt ? formatDateTimeLocal(editingEvent.endsAt) : '',
        timezone: editingEvent.timezone,
        meetingUrl: editingEvent.meetingUrl || '',
        replayUrl: editingEvent.replayUrl || '',
        visibility: editingEvent.visibility as EventFormData['visibility'],
      })
    }
  }, [editingEvent])

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync({ eventId: deleteId })
    }
  }

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.startsAt) {
      toast.show('Title and start time are required')
      return
    }

    // Validate date format
    const startsAtDate = new Date(formData.startsAt)
    if (isNaN(startsAtDate.getTime())) {
      toast.show('Invalid start date format. Use: YYYY-MM-DD HH:MM')
      return
    }

    // Validate end time if provided
    if (formData.endsAt) {
      const endsAtDate = new Date(formData.endsAt)
      if (isNaN(endsAtDate.getTime())) {
        toast.show('Invalid end date format. Use: YYYY-MM-DD HH:MM')
        return
      }
      if (endsAtDate <= startsAtDate) {
        toast.show('End time must be after start time')
        return
      }
    }

    if (editingEvent) {
      updateMutation.mutate({
        eventId: editingEvent.id,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        courseId: formData.courseId || null,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
        timezone: formData.timezone,
        meetingUrl: formData.meetingUrl.trim() || null,
        replayUrl: formData.replayUrl.trim() || null,
        visibility: formData.visibility,
      })
    } else {
      createMutation.mutate({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        courseId: formData.courseId || undefined,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : undefined,
        timezone: formData.timezone,
        meetingUrl: formData.meetingUrl.trim() || undefined,
        visibility: formData.visibility,
      })
    }
  }

  const handleOpenCreate = () => {
    setFormData(initialFormData)
    setShowCreateSheet(true)
  }

  const handleOpenEdit = (event: EventType) => {
    setEditingEvent(event)
  }

  const handleCloseSheet = () => {
    setShowCreateSheet(false)
    setEditingEvent(null)
    setFormData(initialFormData)
  }

  const now = new Date()
  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isEditing = !!editingEvent

  const renderForm = () => (
    <>
      <YStack gap="$2">
        <Paragraph size="$2" fontWeight="500">
          Title <SizableText color="$red10">*</SizableText>
        </Paragraph>
        <Input
          placeholder="Event title"
          value={formData.title}
          onChangeText={(v) => setFormData((f) => ({ ...f, title: v }))}
        />
      </YStack>

      <YStack gap="$2">
        <Paragraph size="$2" fontWeight="500">
          Description
        </Paragraph>
        <TextArea
          placeholder="Event description (supports markdown)"
          value={formData.description}
          onChangeText={(v) => setFormData((f) => ({ ...f, description: v }))}
          minHeight={80}
        />
      </YStack>

      <YStack gap="$2">
        <Paragraph size="$2" fontWeight="500">
          Related Course
        </Paragraph>
        <Select
          value={formData.courseId}
          onValueChange={(v) => setFormData((f) => ({ ...f, courseId: v }))}
        >
          <Select.Trigger>
            <Select.Value placeholder="None (visible to all members)" />
          </Select.Trigger>
          <Select.Content zIndex={200000}>
            <Select.ScrollUpButton />
            <Select.Viewport>
              <Select.Item value="" index={0}>
                <Select.ItemText>None (visible to all members)</Select.ItemText>
              </Select.Item>
              {courses?.map((course, i) => (
                <Select.Item key={course.id} value={course.id} index={i + 1}>
                  <Select.ItemText>{course.title}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton />
          </Select.Content>
        </Select>
      </YStack>

      <YStack gap="$2">
        <Paragraph size="$2" fontWeight="500">
          Start Time <SizableText color="$red10">*</SizableText>
        </Paragraph>
        <Input
          placeholder="YYYY-MM-DD HH:MM"
          value={formData.startsAt}
          onChangeText={(v) => setFormData((f) => ({ ...f, startsAt: v }))}
        />
        <Paragraph size="$1" theme="alt2">
          Format: 2025-01-15 19:00
        </Paragraph>
      </YStack>

      <YStack gap="$2">
        <Paragraph size="$2" fontWeight="500">
          End Time
        </Paragraph>
        <Input
          placeholder="YYYY-MM-DD HH:MM"
          value={formData.endsAt}
          onChangeText={(v) => setFormData((f) => ({ ...f, endsAt: v }))}
        />
      </YStack>

      <YStack gap="$2">
        <Paragraph size="$2" fontWeight="500">
          Timezone
        </Paragraph>
        <Select
          value={formData.timezone}
          onValueChange={(v) => setFormData((f) => ({ ...f, timezone: v }))}
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content zIndex={200000}>
            <Select.ScrollUpButton />
            <Select.Viewport>
              <Select.Item value="America/New_York" index={0}>
                <Select.ItemText>Eastern Time (ET)</Select.ItemText>
              </Select.Item>
              <Select.Item value="America/Chicago" index={1}>
                <Select.ItemText>Central Time (CT)</Select.ItemText>
              </Select.Item>
              <Select.Item value="America/Denver" index={2}>
                <Select.ItemText>Mountain Time (MT)</Select.ItemText>
              </Select.Item>
              <Select.Item value="America/Los_Angeles" index={3}>
                <Select.ItemText>Pacific Time (PT)</Select.ItemText>
              </Select.Item>
              <Select.Item value="UTC" index={4}>
                <Select.ItemText>UTC</Select.ItemText>
              </Select.Item>
              <Select.Item value="Europe/London" index={5}>
                <Select.ItemText>London (GMT/BST)</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
            <Select.ScrollDownButton />
          </Select.Content>
        </Select>
      </YStack>

      <YStack gap="$2">
        <Paragraph size="$2" fontWeight="500">
          Meeting URL
        </Paragraph>
        <Input
          placeholder="https://zoom.us/j/..."
          value={formData.meetingUrl}
          onChangeText={(v) => setFormData((f) => ({ ...f, meetingUrl: v }))}
          autoCapitalize="none"
        />
      </YStack>

      {isEditing && (
        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Replay URL
          </Paragraph>
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={formData.replayUrl}
            onChangeText={(v) => setFormData((f) => ({ ...f, replayUrl: v }))}
            autoCapitalize="none"
          />
          <Paragraph size="$1" theme="alt2">
            Add after the event ends for members to watch
          </Paragraph>
        </YStack>
      )}

      <YStack gap="$2">
        <Paragraph size="$2" fontWeight="500">
          Visibility
        </Paragraph>
        <Select
          value={formData.visibility}
          onValueChange={(v) => setFormData((f) => ({ ...f, visibility: v as EventFormData['visibility'] }))}
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content zIndex={200000}>
            <Select.ScrollUpButton />
            <Select.Viewport>
              <Select.Item value="tenant_members" index={0}>
                <Select.ItemText>All Members</Select.ItemText>
              </Select.Item>
              <Select.Item value="course_enrolled" index={1}>
                <Select.ItemText>Course Enrollees Only</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
            <Select.ScrollDownButton />
          </Select.Content>
        </Select>
      </YStack>

      <Button themeInverse size="$4" onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting
          ? isEditing
            ? 'Saving...'
            : 'Creating...'
          : isEditing
            ? 'Save Changes'
            : 'Create Event'}
      </Button>
    </>
  )

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <XStack jc="space-between" ai="center">
          <H2>Events</H2>
          <Button onPress={handleOpenCreate} icon={Plus} size="$3">
            New Event
          </Button>
        </XStack>

        {isPending ? (
          <FullscreenSpinner />
        ) : events && events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events"
            message="Create your first event to get started."
          />
        ) : (
          <Settings>
            <Settings.Items>
              <Settings.Group>
                {events?.map((event) => {
                  const startDate = new Date(event.startsAt)
                  const isLive = startDate <= now && event.meetingUrl
                  const isPast = startDate < now && !isLive

                  return (
                    <Settings.Item
                      key={event.id}
                      icon={isLive ? Video : Calendar}
                      onPress={() => router.push(`/events/${event.id}`)}
                      accentTheme={isLive ? 'red' : isPast ? 'gray' : 'blue'}
                    >
                      <YStack f={1}>
                        <Paragraph fontWeight="600">
                          {event.title}
                          {isLive && ' (Live)'}
                        </Paragraph>
                        <Paragraph size="$2" theme="alt2">
                          {formatShortDate(event.startsAt)} at {formatTime(event.startsAt)}
                        </Paragraph>
                      </YStack>
                      <Button
                        size="$2"
                        chromeless
                        icon={Pencil}
                        onPress={(e) => {
                          e.stopPropagation()
                          handleOpenEdit(event)
                        }}
                      />
                      <Button
                        size="$2"
                        chromeless
                        icon={Trash}
                        theme="red"
                        onPress={(e) => {
                          e.stopPropagation()
                          setDeleteId(event.id)
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

      {/* Create Event Sheet */}
      <FormSheet
        open={showCreateSheet}
        onOpenChange={(open) => !open && handleCloseSheet()}
        title="New Event"
      >
        {renderForm()}
      </FormSheet>

      {/* Edit Event Sheet */}
      <FormSheet
        open={!!editingEvent}
        onOpenChange={(open) => !open && handleCloseSheet()}
        title="Edit Event"
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
            <AlertDialog.Title>Delete Event</AlertDialog.Title>
            <AlertDialog.Description>
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
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
