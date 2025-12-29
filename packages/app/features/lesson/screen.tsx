import { BottomActionBar, ErrorState, FullscreenSpinner } from '@my/ui'
import { YStack, H3 } from '@my/ui'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState } from 'react'

import { AudioPlayer } from './components/audio-player'
import { PdfViewer } from './components/pdf-viewer'
import { TextContent } from './components/text-content'
import { VideoPlayer } from './components/video-player'

interface LessonScreenProps {
  lessonId: string
}

export function LessonScreen({ lessonId }: LessonScreenProps) {
  const router = useAppRouter()
  const [isCompleting, setIsCompleting] = useState(false)

  const { data: lesson, isPending, error, refetch } = api.lessons.getById.useQuery({ lessonId })

  const { data: nextLesson } = api.lessons.getNextLesson.useQuery({ currentLessonId: lessonId })

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
      default:
        return <ErrorState message="Unknown lesson type" />
    }
  }

  return (
    <YStack f={1} maw={800} mx="auto" w="100%">
      <YStack py="$6" px="$4" borderBottomWidth={1} borderColor="$borderColor">
        <H3 numberOfLines={2}>{lesson.title}</H3>
      </YStack>

      <YStack f={1}>{renderContent()}</YStack>

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
