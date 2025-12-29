import { Button, H2, Paragraph, ScrollView, YStack, XStack } from '@my/ui'
import { Input, TextArea, Label } from 'tamagui'
import { ACTIONS, COURSE } from 'app/constants/copy'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState } from 'react'

type CourseStatus = 'draft' | 'scheduled' | 'live'

export function CreateCourseScreen() {
  const router = useAppRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [status, setStatus] = useState<CourseStatus>('draft')
  const [releaseAt, setReleaseAt] = useState('')

  const createMutation = api.admin.createCourse.useMutation()

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }

    if (status === 'scheduled' && !releaseAt) {
      alert('Please set a release date for scheduled courses')
      return
    }

    try {
      const course = await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        status,
        releaseAt: releaseAt || undefined,
      })

      router.push(`/admin/courses/${course.id}`)
    } catch (error) {
      alert('Failed to create course')
    }
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>{COURSE.create}</H2>

        <YStack gap="$2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={title} onChangeText={setTitle} placeholder="Course title" />
        </YStack>

        <YStack gap="$2">
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            value={description}
            onChangeText={setDescription}
            placeholder="Course description"
            numberOfLines={4}
          />
        </YStack>

        <YStack gap="$2">
          <Label htmlFor="coverUrl">Cover Image URL</Label>
          <Input id="coverUrl" value={coverUrl} onChangeText={setCoverUrl} placeholder="https://..." />
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
            {status === 'draft' && 'Course is hidden from members'}
            {status === 'scheduled' && 'Course visible but locked until release date'}
            {status === 'live' && 'Course is visible and accessible to members'}
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
              When should this course become available? (Format: 2025-01-15T09:00)
            </Paragraph>
          </YStack>
        )}

        <XStack gap="$3" mt="$4">
          <Button f={1} onPress={() => router.back()}>
            {ACTIONS.cancel}
          </Button>
          <Button f={1} themeInverse onPress={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? COURSE.creating : COURSE.create}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
