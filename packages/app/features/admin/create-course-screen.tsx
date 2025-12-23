import { Button, H2, ScrollView, YStack, XStack } from '@my/ui'
import { Input, TextArea, Label, Switch } from 'tamagui'
import { ACTIONS, PROGRAM } from 'app/constants/copy'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState } from 'react'

export function CreateCourseScreen() {
  const router = useAppRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  const createMutation = api.admin.createCourse.useMutation()

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }

    try {
      const course = await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        isPublished,
      })

      router.push(`/admin/courses/${course.id}`)
    } catch (error) {
      alert('Failed to create course')
    }
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>{PROGRAM.create}</H2>

        <YStack gap="$2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={title} onChangeText={setTitle} placeholder="Program title" />
        </YStack>

        <YStack gap="$2">
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            value={description}
            onChangeText={setDescription}
            placeholder="Program description"
            numberOfLines={4}
          />
        </YStack>

        <YStack gap="$2">
          <Label htmlFor="coverUrl">Cover Image URL</Label>
          <Input id="coverUrl" value={coverUrl} onChangeText={setCoverUrl} placeholder="https://..." />
        </YStack>

        <XStack gap="$3" ai="center">
          <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
          <Label htmlFor="published">Published</Label>
        </XStack>

        <XStack gap="$3" mt="$4">
          <Button f={1} onPress={() => router.back()}>
            {ACTIONS.cancel}
          </Button>
          <Button f={1} themeInverse onPress={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? PROGRAM.creating : PROGRAM.create}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
