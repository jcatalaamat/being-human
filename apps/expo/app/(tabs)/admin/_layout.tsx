import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

export default function AdminLayout() {
  const theme = useTheme()

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background.val,
        },
        headerTintColor: theme.color12.val,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="courses/new" options={{ title: 'Create Program' }} />
      <Stack.Screen name="courses/[id]/index" options={{ title: 'Manage Program' }} />
      <Stack.Screen name="courses/[id]/edit" options={{ title: 'Edit Program' }} />
      <Stack.Screen name="courses/[id]/modules/new" options={{ title: 'Add Module' }} />
      <Stack.Screen name="courses/[id]/modules/[moduleId]/edit" options={{ title: 'Edit Module' }} />
      <Stack.Screen name="courses/[id]/modules/[moduleId]/lessons/new" options={{ title: 'Add Exercise' }} />
      <Stack.Screen name="courses/[id]/modules/[moduleId]/lessons/[lessonId]/edit" options={{ title: 'Edit Exercise' }} />
      <Stack.Screen name="members/index" options={{ title: 'Members' }} />
      <Stack.Screen name="members/[userId]" options={{ title: 'Member Details' }} />
    </Stack>
  )
}
