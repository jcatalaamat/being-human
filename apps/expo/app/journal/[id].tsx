import { JournalEntryScreen } from 'app/features/journal/entry-screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <JournalEntryScreen entryId={id!} />
}
