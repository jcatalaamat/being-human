import { EditEventScreen } from 'app/features/admin/edit-event-screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) return null

  return <EditEventScreen eventId={id} />
}
