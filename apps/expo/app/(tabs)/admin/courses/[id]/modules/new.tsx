import { CreateModuleScreen } from 'app/features/admin/create-module-screen'
import { useLocalSearchParams } from 'expo-router'

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  if (!id) return null
  return <CreateModuleScreen courseId={id} />
}
