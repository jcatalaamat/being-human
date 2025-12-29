import { Button, H2, Paragraph, ScrollView, YStack, XStack, Spinner } from '@my/ui'
import { Input, TextArea, Label } from 'tamagui'
import { ACTIONS } from 'app/constants/copy'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState, useEffect } from 'react'

type CourseStatus = 'draft' | 'scheduled' | 'live'

interface EditCourseScreenProps {
  courseId: string
}

export function EditCourseScreen({ courseId }: EditCourseScreenProps) {
  const router = useAppRouter()
  const { data: course, isLoading } = api.courses.getById.useQuery({ courseId })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [promoVideoUrl, setPromoVideoUrl] = useState('')
  const [status, setStatus] = useState<CourseStatus>('draft')
  const [releaseAt, setReleaseAt] = useState('')

  const updateMutation = api.admin.updateCourse.useMutation()

  // Populate form when course loads
  useEffect(() => {
    if (course) {
      setTitle(course.title || '')
      setDescription(course.description || '')
      setCoverUrl(course.coverUrl || '')
      setPromoVideoUrl(course.promoVideoUrl || '')
      // Use status if available, fallback to isPublished
      setStatus(course.status || (course.isPublished ? 'live' : 'draft'))
      setReleaseAt(course.releaseAt || '')
    }
  }, [course])

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        promoVideoUrl: promoVideoUrl.trim() || undefined,
        status,
        releaseAt: releaseAt || null,
      })

      router.back()
    } catch (error) {
      alert('Failed to update course')
    }
  }

  if (isLoading) {
    return (
      <YStack f={1} ai="center" jc="center">
        <Spinner />
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>Edit Course</H2>

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

        <YStack gap="$2">
          <Label htmlFor="promoVideoUrl">Promo Video URL</Label>
          <Input
            id="promoVideoUrl"
            value={promoVideoUrl}
            onChangeText={setPromoVideoUrl}
            placeholder="https://youtu.be/... or https://vimeo.com/..."
          />
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
            <Label htmlFor="releaseAt">Release Date</Label>
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
          <Button f={1} themeInverse onPress={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : ACTIONS.save}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
