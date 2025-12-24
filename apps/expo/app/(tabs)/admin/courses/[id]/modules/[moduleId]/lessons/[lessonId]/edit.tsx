import { EditLessonScreen } from 'app/features/admin/edit-lesson-screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { id, moduleId, lessonId } = useLocalSearchParams<{ id: string; moduleId: string; lessonId: string }>()
  if (!id || !moduleId || !lessonId) return null
  return <EditLessonScreen courseId={id} moduleId={moduleId} lessonId={lessonId} />
}
