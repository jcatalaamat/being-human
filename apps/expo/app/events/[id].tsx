import { EventDetailScreen } from 'app/features/events/detail-screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <EventDetailScreen eventId={id!} />
}
