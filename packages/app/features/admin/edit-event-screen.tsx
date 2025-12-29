import {
  Button,
  ErrorState,
  FullscreenSpinner,
  H2,
  Input,
  Paragraph,
  ScrollView,
  Select,
  SizableText,
  TextArea,
  XStack,
  YStack,
  useToastController,
} from '@my/ui'
import { Check, ChevronDown } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useEffect, useState } from 'react'

interface EditEventScreenProps {
  eventId: string
}

export function EditEventScreen({ eventId }: EditEventScreenProps) {
  const router = useAppRouter()
  const toast = useToastController()

  const { data: event, isPending, error, refetch } = api.events.getById.useQuery({ eventId })
  const { data: courses } = api.courses.list.useQuery()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [courseId, setCourseId] = useState<string>('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [replayUrl, setReplayUrl] = useState('')
  const [visibility, setVisibility] = useState<'tenant_members' | 'course_enrolled'>('tenant_members')

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || '')
      setCourseId(event.courseId || '')
      setStartsAt(formatDateTimeLocal(event.startsAt))
      setEndsAt(event.endsAt ? formatDateTimeLocal(event.endsAt) : '')
      setTimezone(event.timezone)
      setMeetingUrl(event.meetingUrl || '')
      setReplayUrl(event.replayUrl || '')
      setVisibility(event.visibility as typeof visibility)
    }
  }, [event])

  const updateMutation = api.events.update.useMutation({
    onSuccess: () => {
      toast.show('Event updated')
      router.back()
    },
    onError: (error) => {
      toast.show(error.message)
    },
  })

  const handleSubmit = () => {
    if (!title.trim() || !startsAt) {
      toast.show('Title and start time are required')
      return
    }

    updateMutation.mutate({
      eventId,
      title: title.trim(),
      description: description.trim() || undefined,
      courseId: courseId || null,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      timezone,
      meetingUrl: meetingUrl.trim() || null,
      replayUrl: replayUrl.trim() || null,
      visibility,
    })
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />
  }

  if (isPending || !event) {
    return <FullscreenSpinner />
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>Edit Event</H2>

        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Title <SizableText color="$red10">*</SizableText>
          </Paragraph>
          <Input placeholder="Event title" value={title} onChangeText={setTitle} />
        </YStack>

        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Description
          </Paragraph>
          <TextArea
            placeholder="Event description (supports markdown)"
            value={description}
            onChangeText={setDescription}
            minHeight={100}
          />
        </YStack>

        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Related Course
          </Paragraph>
          <Select native value={courseId} onValueChange={setCourseId}>
            <Select.Trigger iconAfter={ChevronDown}>
              <Select.Value placeholder="None (visible to all members)" />
            </Select.Trigger>

            <Select.Content zIndex={200000}>
              <Select.Viewport>
                <Select.Item value="" index={0}>
                  <Select.ItemText>None (visible to all members)</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                {courses?.map((course, i) => (
                  <Select.Item key={course.id} value={course.id} index={i + 1}>
                    <Select.ItemText>{course.title}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select>
        </YStack>

        <XStack gap="$4">
          <YStack gap="$2" f={1}>
            <Paragraph size="$2" fontWeight="500">
              Start Time <SizableText color="$red10">*</SizableText>
            </Paragraph>
            <Input
              placeholder="YYYY-MM-DD HH:MM"
              value={startsAt}
              onChangeText={setStartsAt}
            />
          </YStack>

          <YStack gap="$2" f={1}>
            <Paragraph size="$2" fontWeight="500">
              End Time
            </Paragraph>
            <Input
              placeholder="YYYY-MM-DD HH:MM"
              value={endsAt}
              onChangeText={setEndsAt}
            />
          </YStack>
        </XStack>

        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Timezone
          </Paragraph>
          <Select native value={timezone} onValueChange={setTimezone}>
            <Select.Trigger iconAfter={ChevronDown}>
              <Select.Value />
            </Select.Trigger>

            <Select.Content zIndex={200000}>
              <Select.Viewport>
                <Select.Item value="America/New_York" index={0}>
                  <Select.ItemText>Eastern Time (ET)</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item value="America/Chicago" index={1}>
                  <Select.ItemText>Central Time (CT)</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item value="America/Denver" index={2}>
                  <Select.ItemText>Mountain Time (MT)</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item value="America/Los_Angeles" index={3}>
                  <Select.ItemText>Pacific Time (PT)</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item value="UTC" index={4}>
                  <Select.ItemText>UTC</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item value="Europe/London" index={5}>
                  <Select.ItemText>London (GMT/BST)</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select>
        </YStack>

        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Meeting URL
          </Paragraph>
          <Input
            placeholder="https://zoom.us/j/..."
            value={meetingUrl}
            onChangeText={setMeetingUrl}
            autoCapitalize="none"
          />
        </YStack>

        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Replay URL
          </Paragraph>
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={replayUrl}
            onChangeText={setReplayUrl}
            autoCapitalize="none"
          />
          <Paragraph size="$1" theme="alt2">
            Add after the event ends for members to watch
          </Paragraph>
        </YStack>

        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Visibility
          </Paragraph>
          <Select native value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
            <Select.Trigger iconAfter={ChevronDown}>
              <Select.Value />
            </Select.Trigger>

            <Select.Content zIndex={200000}>
              <Select.Viewport>
                <Select.Item value="tenant_members" index={0}>
                  <Select.ItemText>All Members</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item value="course_enrolled" index={1}>
                  <Select.ItemText>Course Enrollees Only</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select>
        </YStack>

        <Button
          themeInverse
          size="$4"
          onPress={handleSubmit}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </YStack>
    </ScrollView>
  )
}

function formatDateTimeLocal(isoString: string): string {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
