import { BottomActionBar, ErrorState, FullscreenSpinner, PromptCard } from '@my/ui'
import { YStack, H3, H4, ScrollView } from '@my/ui'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState } from 'react'

import { AudioPlayer } from './components/audio-player'
import { LiveLesson } from './components/live-lesson'
import { PdfViewer } from './components/pdf-viewer'
import { TextContent } from './components/text-content'
import { VideoPlayer } from './components/video-player'

interface LessonScreenProps {
  lessonId: string
}

export function LessonScreen({ lessonId }: LessonScreenProps) {
  const router = useAppRouter()
  const [isCompleting, setIsCompleting] = useState(false)
  const utils = api.useUtils()

  const { data: lesson, isPending, error, refetch } = api.lessons.getById.useQuery({ lessonId })

  const { data: nextLesson } = api.lessons.getNextLesson.useQuery({ currentLessonId: lessonId })

  // Get prompts for this lesson
  const { data: prompts } = api.prompts.getForLesson.useQuery({ lessonId })

  const completeMutation = api.progress.markLessonComplete.useMutation()

  const handleComplete = async () => {
    if (!lesson) return

    setIsCompleting(true)
    try {
      await completeMutation.mutateAsync({
        lessonId,
        courseId: lesson.module.courseId,
      })

      // Refetch to update completion status
      await refetch()

      // Navigate to next lesson if exists
      if (nextLesson) {
        router.replace(`/course/lesson/${nextLesson.id}`)
      } else {
        // Go back to course detail if this was the last lesson
        router.back()
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleNext = () => {
    if (nextLesson) {
      router.replace(`/course/lesson/${nextLesson.id}`)
    }
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />
  }

  if (isPending || !lesson) {
    return <FullscreenSpinner />
  }

  const renderContent = () => {
    switch (lesson.type) {
      case 'video':
        return (
          <VideoPlayer
            url={lesson.contentUrl || ''}
            lessonId={lessonId}
            courseId={lesson.module.courseId}
            initialPositionSec={lesson.lastPositionSec}
          />
        )
      case 'audio':
        return (
          <AudioPlayer
            url={lesson.contentUrl || ''}
            lessonId={lessonId}
            courseId={lesson.module.courseId}
            initialPositionSec={lesson.lastPositionSec}
          />
        )
      case 'pdf':
        return <PdfViewer url={lesson.contentUrl || ''} />
      case 'text':
        return <TextContent content={lesson.contentText || ''} />
      case 'live':
        return (
          <LiveLesson
            scheduledAt={lesson.scheduledAt}
            replayUrl={lesson.replayUrl}
            meetingUrl={lesson.meetingUrl}
            lessonId={lessonId}
            courseId={lesson.module.courseId}
            initialPositionSec={lesson.lastPositionSec}
          />
        )
      default:
        return <ErrorState message="Unknown lesson type" />
    }
  }

  return (
    <YStack f={1} maw={800} mx="auto" w="100%">
      <YStack py="$6" px="$4" borderBottomWidth={1} borderColor="$borderColor">
        <H3 numberOfLines={2}>{lesson.title}</H3>
      </YStack>

      <ScrollView f={1}>
        <YStack>{renderContent()}</YStack>

        {/* Lesson Prompts/Assignments */}
        {prompts && prompts.length > 0 && (
          <YStack gap="$4" px="$4" py="$6">
            <H4>Assignments</H4>
            {prompts.map((prompt) => (
              <PromptSection key={prompt.id} prompt={prompt} />
            ))}
          </YStack>
        )}
      </ScrollView>

      <BottomActionBar
        onComplete={handleComplete}
        onNext={handleNext}
        hasNext={!!nextLesson}
        isComplete={lesson.isComplete}
        isLoading={isCompleting}
      />
    </YStack>
  )
}

// Separate component for each prompt to handle its own response state
interface PromptSectionProps {
  prompt: {
    id: string
    title: string
    promptBody: string
    responseSchema: {
      id: string
      type: 'text' | 'textarea' | 'markdown'
      label: string
      placeholder?: string
      required?: boolean
    }[]
    required: boolean
  }
}

function PromptSection({ prompt }: PromptSectionProps) {
  const utils = api.useUtils()
  const { data: response } = api.prompts.getMyResponse.useQuery({ promptId: prompt.id })

  const upsertMutation = api.prompts.upsertResponse.useMutation()
  const submitMutation = api.prompts.submitResponse.useMutation({
    onSuccess: () => {
      utils.prompts.getMyResponse.invalidate({ promptId: prompt.id })
      utils.prompts.getPendingRequired.invalidate()
    },
  })

  const handleSave = (data: Record<string, string>) => {
    upsertMutation.mutate({ promptId: prompt.id, response: data })
  }

  const handleSubmit = async (data: Record<string, string>) => {
    await submitMutation.mutateAsync({ promptId: prompt.id, response: data })
  }

  return (
    <PromptCard
      id={prompt.id}
      title={prompt.title}
      promptBody={prompt.promptBody}
      fields={prompt.responseSchema}
      required={prompt.required}
      initialData={response?.response}
      status={response?.status}
      feedback={response?.feedback}
      onSave={handleSave}
      onSubmit={handleSubmit}
      isLoading={submitMutation.isPending}
    />
  )
}
