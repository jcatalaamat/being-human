import { Button, H2, H4, Paragraph, ScrollView, Settings, YStack, XStack, Spinner, useToastController } from '@my/ui'
import { Input, TextArea, Label, Select, Adapt, Sheet } from 'tamagui'
import { Check, ChevronDown, Edit3, Pencil, Plus, Trash } from '@tamagui/lucide-icons'
import { ACTIONS } from 'app/constants/copy'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState, useEffect } from 'react'
import { PromptFormSheet, DeletePromptDialog } from './prompt-form-sheet'

type LessonStatus = 'draft' | 'scheduled' | 'live'
type LessonType = 'video' | 'audio' | 'pdf' | 'text' | 'live'
type ContentCategory =
  | 'orientation'
  | 'transmission'
  | 'clarification'
  | 'embodiment'
  | 'inquiry'
  | 'meditation'
  | 'assignment'

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
  const [lessonType, setLessonType] = useState<LessonType>('video')
  const [contentUrl, setContentUrl] = useState('')
  const [contentText, setContentText] = useState('')
  const [durationSec, setDurationSec] = useState('')
  const [orderIndex, setOrderIndex] = useState('0')
  const [status, setStatus] = useState<LessonStatus>('live')
  const [releaseAt, setReleaseAt] = useState('')
  const [contentCategory, setContentCategory] = useState<ContentCategory | ''>('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [replayUrl, setReplayUrl] = useState('')

  // Prompts state
  const [promptSheetOpen, setPromptSheetOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<any>(null)
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null)

  const updateMutation = api.admin.updateLesson.useMutation()

  // Prompts queries and mutations
  const { data: prompts, refetch: refetchPrompts } = api.prompts.getForLesson.useQuery({ lessonId })
  const deletePromptMutation = api.prompts.deletePrompt.useMutation({
    onSuccess: () => {
      refetchPrompts()
      setDeletePromptId(null)
    },
  })

  // Populate form when lesson loads
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '')
      setDescription(lesson.description || '')
      setLessonType(lesson.type as LessonType)
      setContentUrl(lesson.contentUrl || '')
      setContentText(lesson.contentText || '')
      setDurationSec(lesson.durationSec ? String(lesson.durationSec) : '')
      setOrderIndex(String(lesson.orderIndex ?? 0))
      setStatus(lesson.status || 'live')
      setReleaseAt(lesson.releaseAt || '')
      setContentCategory((lesson.contentCategory as ContentCategory) || '')
      setScheduledAt(lesson.scheduledAt || '')
      setMeetingUrl(lesson.meetingUrl || '')
      setReplayUrl(lesson.replayUrl || '')
    }
  }, [lesson])

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
      await updateMutation.mutateAsync({
        id: lessonId,
        title: title.trim(),
        description: description.trim() || undefined,
        lessonType,
        contentUrl: contentUrl.trim() || undefined,
        contentText: contentText.trim() || undefined,
        durationSec: durationSec ? parseInt(durationSec) : undefined,
        orderIndex: parseInt(orderIndex) || 0,
        status,
        releaseAt: releaseAt || null,
        contentCategory: contentCategory || null,
        scheduledAt: lessonType === 'live' && scheduledAt ? scheduledAt : null,
        meetingUrl: lessonType === 'live' && meetingUrl.trim() ? meetingUrl.trim() : null,
        replayUrl: lessonType === 'live' && replayUrl.trim() ? replayUrl.trim() : null,
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
        <H2>Edit Lesson</H2>

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
                <Select.Item index={4} value="live">
                  <Select.ItemText>Live Call</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              </Select.Viewport>
              <Select.ScrollDownButton />
            </Select.Content>
          </Select>
        </YStack>

        {/* Content Category (optional) */}
        <YStack gap="$2">
          <Label>Content Category (optional)</Label>
          <Select value={contentCategory} onValueChange={(val) => setContentCategory(val as ContentCategory)}>
            <Select.Trigger iconAfter={ChevronDown}>
              <Select.Value placeholder="Select category" />
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
                <Select.Item index={0} value="orientation">
                  <Select.ItemText>Orientation</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item index={1} value="transmission">
                  <Select.ItemText>Transmission</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item index={2} value="clarification">
                  <Select.ItemText>Clarification</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item index={3} value="embodiment">
                  <Select.ItemText>Embodiment Practice</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item index={4} value="inquiry">
                  <Select.ItemText>Living Inquiry</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item index={5} value="meditation">
                  <Select.ItemText>Meditation</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
                <Select.Item index={6} value="assignment">
                  <Select.ItemText>Deeper Assignment</Select.ItemText>
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

        {/* Live Call specific fields */}
        {lessonType === 'live' && (
          <>
            <YStack gap="$2">
              <Label htmlFor="scheduledAt">Scheduled Date/Time</Label>
              <Input
                id="scheduledAt"
                value={scheduledAt}
                onChangeText={setScheduledAt}
                placeholder="2025-01-15T19:00:00Z"
              />
              <Paragraph size="$2" theme="alt2">
                When is the live call scheduled? (ISO format)
              </Paragraph>
            </YStack>
            <YStack gap="$2">
              <Label htmlFor="meetingUrl">Meeting URL</Label>
              <Input
                id="meetingUrl"
                value={meetingUrl}
                onChangeText={setMeetingUrl}
                placeholder="https://zoom.us/j/..."
              />
            </YStack>
            <YStack gap="$2">
              <Label htmlFor="replayUrl">Replay URL (optional)</Label>
              <Input
                id="replayUrl"
                value={replayUrl}
                onChangeText={setReplayUrl}
                placeholder="https://... (add after call ends)"
              />
            </YStack>
          </>
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
            placeholder="0"
            keyboardType="numeric"
          />
          <Paragraph size="$2" theme="alt2">
            Lessons are sorted by order index (0 = first)
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

        {/* Prompts/Assignments Section */}
        <YStack gap="$3" mt="$4" pt="$4" borderTopWidth={1} borderTopColor="$borderColor">
          <XStack jc="space-between" ai="center">
            <H4>Prompts & Assignments</H4>
            <Button
              size="$3"
              icon={Plus}
              onPress={() => {
                setEditingPrompt(null)
                setPromptSheetOpen(true)
              }}
            >
              Add Prompt
            </Button>
          </XStack>

          {prompts && prompts.length > 0 ? (
            <YStack gap="$2">
              {prompts.map((prompt) => (
                <XStack
                  key={prompt.id}
                  bg="$color2"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$3"
                  p="$3"
                  ai="center"
                  jc="space-between"
                >
                  <YStack f={1} mr="$3">
                    <Paragraph fontWeight="600">{prompt.title}</Paragraph>
                    <Paragraph size="$2" theme="alt2" numberOfLines={1}>
                      {prompt.promptBody}
                    </Paragraph>
                    <XStack gap="$2" mt="$1">
                      <Paragraph size="$1" theme="alt2">
                        {prompt.responseSchema?.length || 0} field(s)
                      </Paragraph>
                      {prompt.required && (
                        <Paragraph size="$1" color="$orange10">
                          Required
                        </Paragraph>
                      )}
                    </XStack>
                  </YStack>
                  <XStack gap="$2">
                    <Button
                      size="$2"
                      chromeless
                      icon={Pencil}
                      onPress={() => {
                        setEditingPrompt(prompt)
                        setPromptSheetOpen(true)
                      }}
                    />
                    <Button
                      size="$2"
                      chromeless
                      icon={Trash}
                      theme="red"
                      onPress={() => setDeletePromptId(prompt.id)}
                    />
                  </XStack>
                </XStack>
              ))}
            </YStack>
          ) : (
            <YStack bg="$color2" p="$4" borderRadius="$3" ai="center">
              <Paragraph theme="alt2">No prompts yet. Add one to collect member responses.</Paragraph>
            </YStack>
          )}
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

      {/* Prompt Form Sheet */}
      <PromptFormSheet
        lessonId={lessonId}
        open={promptSheetOpen}
        onOpenChange={setPromptSheetOpen}
        editingPrompt={editingPrompt}
        onSuccess={() => {
          refetchPrompts()
          setPromptSheetOpen(false)
          setEditingPrompt(null)
        }}
      />

      {/* Delete Prompt Confirmation */}
      <DeletePromptDialog
        open={!!deletePromptId}
        onOpenChange={(open) => !open && setDeletePromptId(null)}
        onConfirm={() => {
          if (deletePromptId) {
            deletePromptMutation.mutate({ id: deletePromptId })
          }
        }}
        isLoading={deletePromptMutation.isPending}
      />
    </ScrollView>
  )
}
