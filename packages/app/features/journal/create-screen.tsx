import { Button, H2, Input, Paragraph, ScrollView, SizableText, TextArea, YStack } from 'tamagui'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState } from 'react'

interface CreateJournalEntryScreenProps {
  lessonId?: string
  lessonTitle?: string
  courseId?: string
  moduleId?: string
}

export function CreateJournalEntryScreen({
  lessonId,
  lessonTitle,
  courseId,
  moduleId,
}: CreateJournalEntryScreenProps) {
  const router = useAppRouter()
  const utils = api.useUtils()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const createMutation = api.journal.createEntry.useMutation({
    onSuccess: (data) => {
      utils.journal.listMine.invalidate()
      router.replace(`/journal/${data.id}`)
    },
  })

  const handleSubmit = () => {
    if (!body.trim()) return

    createMutation.mutate({
      title: title.trim() || undefined,
      body: body.trim(),
      lessonId,
      courseId,
      moduleId,
    })
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>New Journal Entry</H2>

        {lessonTitle && (
          <Paragraph size="$3" theme="alt2">
            Related to: {lessonTitle}
          </Paragraph>
        )}

        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Title (optional)
          </Paragraph>
          <Input
            placeholder="Give your entry a title..."
            value={title}
            onChangeText={setTitle}
          />
        </YStack>

        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Your reflection <SizableText color="$red10">*</SizableText>
          </Paragraph>
          <TextArea
            placeholder="Write your thoughts, reflections, or questions..."
            value={body}
            onChangeText={setBody}
            minHeight={200}
          />
          <Paragraph size="$2" theme="alt2">
            Your entry will be visible to instructors who can provide feedback.
          </Paragraph>
        </YStack>

        <Button
          themeInverse
          size="$4"
          onPress={handleSubmit}
          disabled={!body.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? 'Saving...' : 'Save Entry'}
        </Button>
      </YStack>
    </ScrollView>
  )
}
