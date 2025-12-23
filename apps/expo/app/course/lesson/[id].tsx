import { LessonScreen } from 'app/features/lesson/screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return null
  }

  return <LessonScreen lessonId={id} />
}
