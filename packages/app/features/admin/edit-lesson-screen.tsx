import { Button, H2, Paragraph, ScrollView, YStack, XStack, Spinner } from '@my/ui'
import { Input, TextArea, Label, Select, Adapt, Sheet } from 'tamagui'
import { Check, ChevronDown } from '@tamagui/lucide-icons'
import { ACTIONS } from 'app/constants/copy'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState, useEffect } from 'react'

interface EditLessonScreenProps {
  courseId: string
  moduleId: string
  lessonId: string
}

export function EditLessonScreen({ courseId, moduleId, lessonId }: EditLessonScreenProps) {
  const router = useAppRouter()
  const { data: lesson, isLoading } = api.lessons.getById.useQuery({ lessonId })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lessonType, setLessonType] = useState<'video' | 'audio' | 'pdf' | 'text'>('video')
  const [contentUrl, setContentUrl] = useState('')
  const [contentText, setContentText] = useState('')
  const [durationSec, setDurationSec] = useState('')
  const [orderIndex, setOrderIndex] = useState('0')

  const updateMutation = api.admin.updateLesson.useMutation()

  // Populate form when lesson loads
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '')
      setDescription(lesson.description || '')
      setLessonType(lesson.type as 'video' | 'audio' | 'pdf' | 'text')
      setContentUrl(lesson.contentUrl || '')
      setContentText(lesson.contentText || '')
      setDurationSec(lesson.durationSec ? String(lesson.durationSec) : '')
      setOrderIndex(String(lesson.orderIndex ?? 0))
    }
  }, [lesson])

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: lessonId,
        title: title.trim(),
        description: description.trim() || undefined,
        lessonType,
        contentUrl: contentUrl.trim() || undefined,
        contentText: contentText.trim() || undefined,
        durationSec: durationSec ? parseInt(durationSec) : undefined,
        orderIndex: parseInt(orderIndex) || 0,
      })

      router.back()
    } catch (error) {
      alert('Failed to update lesson')
    }
  }

  if (isLoading) {
    return (
      <YStack f={1} ai="center" jc="center">
        <Spinner />
      </YStack>
    )
  }

  if (!lesson) {
    return (
      <YStack f={1} ai="center" jc="center">
        <Paragraph>Lesson not found</Paragraph>
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>Edit Exercise</H2>

        <YStack gap="$2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={title} onChangeText={setTitle} placeholder="Exercise title" />
        </YStack>

        <YStack gap="$2">
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            value={description}
            onChangeText={setDescription}
            placeholder="Exercise description"
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
              placeholder="Exercise content (supports markdown)"
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
            placeholder="0"
            keyboardType="numeric"
          />
          <Paragraph size="$2" theme="alt2">
            Exercises are sorted by order index (0 = first)
          </Paragraph>
        </YStack>

        <XStack gap="$3" mt="$4">
          <Button f={1} onPress={() => router.back()}>
            {ACTIONS.cancel}
          </Button>
          <Button f={1} themeInverse onPress={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : ACTIONS.save}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
