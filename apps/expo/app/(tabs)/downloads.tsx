import { EmptyState } from '@my/ui'
import { Download } from '@tamagui/lucide-icons'

export default function DownloadsScreen() {
  return <EmptyState icon={Download} title="Downloads" message="Offline downloads coming soon." />
}
