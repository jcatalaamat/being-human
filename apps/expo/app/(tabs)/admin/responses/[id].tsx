import { AdminResponseDetailScreen } from 'app/features/admin/response-detail-screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) return null

  return <AdminResponseDetailScreen responseId={id} />
}
