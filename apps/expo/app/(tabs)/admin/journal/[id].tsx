import { AdminJournalEntryDetailScreen } from 'app/features/admin/journal-entry-detail-screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) return null

  return <AdminJournalEntryDetailScreen entryId={id} />
}
