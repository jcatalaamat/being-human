import { EditModuleScreen } from 'app/features/admin/edit-module-screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { id, moduleId } = useLocalSearchParams<{ id: string; moduleId: string }>()
  if (!id || !moduleId) return null
  return <EditModuleScreen courseId={id} moduleId={moduleId} />
}
