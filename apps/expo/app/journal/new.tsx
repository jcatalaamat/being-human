import { CreateJournalEntryScreen } from 'app/features/journal/create-screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { lessonId, lessonTitle, courseId, moduleId } = useLocalSearchParams<{
    lessonId?: string
    lessonTitle?: string
    courseId?: string
    moduleId?: string
  }>()

  return (
    <CreateJournalEntryScreen
      lessonId={lessonId}
      lessonTitle={lessonTitle}
      courseId={courseId}
      moduleId={moduleId}
    />
  )
}
