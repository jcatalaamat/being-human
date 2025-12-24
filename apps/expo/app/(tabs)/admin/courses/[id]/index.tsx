import { AdminCourseDetailScreen } from 'app/features/admin/course-detail-screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  if (!id) return null
  return <AdminCourseDetailScreen courseId={id} />
}
