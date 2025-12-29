import { Button, H2, ScrollView, YStack, XStack, Spinner } from '@my/ui'
import { Input, TextArea, Label, Switch } from 'tamagui'
import { ACTIONS } from 'app/constants/copy'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState, useEffect } from 'react'

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
  const [isPublished, setIsPublished] = useState(false)

  const updateMutation = api.admin.updateCourse.useMutation()

  // Populate form when course loads
  useEffect(() => {
    if (course) {
      setTitle(course.title || '')
      setDescription(course.description || '')
      setCoverUrl(course.coverUrl || '')
      setPromoVideoUrl(course.promoVideoUrl || '')
      setIsPublished(course.isPublished || false)
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
        isPublished,
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

        <XStack gap="$3" ai="center">
          <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
          <Label htmlFor="published">Published</Label>
        </XStack>

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
