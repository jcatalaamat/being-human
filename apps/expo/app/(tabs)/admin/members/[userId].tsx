import { MemberDetailScreen } from 'app/features/admin/member-detail-screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { userId, courseId } = useLocalSearchParams<{ userId: string; courseId: string }>()

  if (!userId || !courseId) return null

  return <MemberDetailScreen userId={userId} courseId={courseId} />
}
