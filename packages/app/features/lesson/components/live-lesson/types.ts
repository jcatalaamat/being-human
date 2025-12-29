export interface LiveLessonProps {
  scheduledAt: string | null
  replayUrl: string | null
  meetingUrl: string | null
  lessonId: string
  courseId: string
  initialPositionSec?: number
}
