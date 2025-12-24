import { EditCourseScreen } from 'app/features/admin/edit-course-screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  if (!id) return null
  return <EditCourseScreen courseId={id} />
}
