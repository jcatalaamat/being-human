import { Button, H2, Paragraph, ScrollView, YStack, XStack } from '@my/ui'
import { Input, TextArea, Label, Select, Adapt, Sheet } from 'tamagui'
import { Check, ChevronDown } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState } from 'react'

type LessonStatus = 'draft' | 'scheduled' | 'live'

interface CreateLessonScreenProps {
  courseId: string
  moduleId: string
}

export function CreateLessonScreen({ courseId, moduleId }: CreateLessonScreenProps) {
  const router = useAppRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lessonType, setLessonType] = useState<'video' | 'audio' | 'pdf' | 'text'>('video')
  const [contentUrl, setContentUrl] = useState('')
  const [contentText, setContentText] = useState('')
  const [durationSec, setDurationSec] = useState('')
  const [orderIndex, setOrderIndex] = useState('0')
  const [status, setStatus] = useState<LessonStatus>('live')
  const [releaseAt, setReleaseAt] = useState('')

  const { data: modules } = api.courses.getModulesWithLessons.useQuery({ courseId })
  const createMutation = api.admin.createLesson.useMutation()

  const currentModule = modules?.find((m) => m.id === moduleId)
  const nextOrder = currentModule?.lessons.length ?? 0

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }

    if (status === 'scheduled' && !releaseAt) {
      alert('Please set a release date for scheduled lessons')
      return
    }

    try {
      await createMutation.mutateAsync({
        moduleId,
        title: title.trim(),
        description: description.trim() || undefined,
        lessonType,
        contentUrl: contentUrl.trim() || undefined,
        contentText: contentText.trim() || undefined,
        durationSec: durationSec ? parseInt(durationSec) : undefined,
        orderIndex: parseInt(orderIndex) || nextOrder,
        status,
        releaseAt: releaseAt || undefined,
      })

      router.back()
    } catch (error) {
      alert('Failed to create lesson')
    }
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>Add Lesson</H2>

        <YStack gap="$2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={title} onChangeText={setTitle} placeholder="Lesson title" />
        </YStack>

        <YStack gap="$2">
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            value={description}
            onChangeText={setDescription}
            placeholder="Lesson description"
            numberOfLines={3}
          />
        </YStack>

        <YStack gap="$2">
          <Label>Type *</Label>
          <Select value={lessonType} onValueChange={(val) => setLessonType(val as any)}>
            <Select.Trigger iconAfter={ChevronDown}>
              <Select.Value placeholder="Select type" />
            </Select.Trigger>

            <Adapt when="sm" platform="touch">
              <Sheet modal dismissOnSnapToBottom>
                <Sheet.Frame>
                  <Sheet.ScrollView>
                    <Adapt.Contents />
                  </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Overlay />
              </Sheet>
            </Adapt>

            <Select.Content zIndex={200000}>
              <Select.ScrollUpButton />
              <Select.Viewport>
                <Select.Item index={0} value="video">
                  <Select.ItemText>Video</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item index={1} value="audio">
                  <Select.ItemText>Audio</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item index={2} value="pdf">
                  <Select.ItemText>PDF</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item index={3} value="text">
                  <Select.ItemText>Text</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              </Select.Viewport>
              <Select.ScrollDownButton />
            </Select.Content>
          </Select>
        </YStack>

        {(lessonType === 'video' || lessonType === 'audio' || lessonType === 'pdf') && (
          <YStack gap="$2">
            <Label htmlFor="contentUrl">Content URL *</Label>
            <Input
              id="contentUrl"
              value={contentUrl}
              onChangeText={setContentUrl}
              placeholder="https://... (YouTube, Vimeo, direct link)"
            />
          </YStack>
        )}

        {lessonType === 'text' && (
          <YStack gap="$2">
            <Label htmlFor="contentText">Content *</Label>
            <TextArea
              id="contentText"
              value={contentText}
              onChangeText={setContentText}
              placeholder="Lesson content (supports markdown)"
              numberOfLines={10}
            />
          </YStack>
        )}

        {(lessonType === 'video' || lessonType === 'audio') && (
          <YStack gap="$2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              id="duration"
              value={durationSec}
              onChangeText={setDurationSec}
              placeholder="e.g., 300 for 5 minutes"
              keyboardType="numeric"
            />
          </YStack>
        )}

        <YStack gap="$2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            value={orderIndex}
            onChangeText={setOrderIndex}
            placeholder={`${nextOrder}`}
            keyboardType="numeric"
          />
          <Paragraph size="$2" theme="alt2">
            Current lessons in module: {nextOrder}
          </Paragraph>
        </YStack>

        {/* Status Selector */}
        <YStack gap="$2">
          <Label>Status</Label>
          <XStack gap="$2" flexWrap="wrap">
            <Button
              size="$3"
              theme={status === 'draft' ? 'active' : undefined}
              themeInverse={status === 'draft'}
              onPress={() => setStatus('draft')}
            >
              Draft
            </Button>
            <Button
              size="$3"
              theme={status === 'scheduled' ? 'active' : undefined}
              themeInverse={status === 'scheduled'}
              onPress={() => setStatus('scheduled')}
            >
              Scheduled
            </Button>
            <Button
              size="$3"
              theme={status === 'live' ? 'active' : undefined}
              themeInverse={status === 'live'}
              onPress={() => setStatus('live')}
            >
              Live
            </Button>
          </XStack>
          <Paragraph size="$2" theme="alt2">
            {status === 'draft' && 'Lesson is hidden from members'}
            {status === 'scheduled' && 'Lesson visible but locked until release date'}
            {status === 'live' && 'Lesson is visible and accessible to members'}
          </Paragraph>
        </YStack>

        {/* Release Date - only show for scheduled status */}
        {status === 'scheduled' && (
          <YStack gap="$2">
            <Label htmlFor="releaseAt">Release Date *</Label>
            <Input
              id="releaseAt"
              value={releaseAt ? new Date(releaseAt).toISOString().slice(0, 16) : ''}
              onChangeText={(val) => setReleaseAt(val ? new Date(val).toISOString() : '')}
              placeholder="YYYY-MM-DDTHH:MM"
            />
            <Paragraph size="$2" theme="alt2">
              When should this lesson become available? (Format: 2025-01-15T09:00)
            </Paragraph>
          </YStack>
        )}

        <XStack gap="$3" mt="$4">
          <Button f={1} onPress={() => router.back()}>
            Cancel
          </Button>
          <Button f={1} themeInverse onPress={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Adding...' : 'Add Lesson'}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
