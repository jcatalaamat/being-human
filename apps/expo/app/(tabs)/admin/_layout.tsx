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
      <Stack.Screen name="courses/new" options={{ title: 'Create Course' }} />
      <Stack.Screen name="courses/[id]/index" options={{ title: 'Manage Course' }} />
      <Stack.Screen name="courses/[id]/edit" options={{ title: 'Edit Course' }} />
      <Stack.Screen name="courses/[id]/modules/new" options={{ title: 'Add Module' }} />
      <Stack.Screen name="courses/[id]/modules/[moduleId]/edit" options={{ title: 'Edit Module' }} />
      <Stack.Screen name="courses/[id]/modules/[moduleId]/lessons/new" options={{ title: 'Add Lesson' }} />
      <Stack.Screen name="courses/[id]/modules/[moduleId]/lessons/[lessonId]/edit" options={{ title: 'Edit Lesson' }} />
      <Stack.Screen name="members/index" options={{ title: 'Members' }} />
      <Stack.Screen name="members/[userId]" options={{ title: 'Member Details' }} />
      <Stack.Screen name="events/index" options={{ title: 'Events' }} />
      <Stack.Screen name="events/new" options={{ title: 'Create Event' }} />
      <Stack.Screen name="events/[id]/edit" options={{ title: 'Edit Event' }} />
      <Stack.Screen name="journal/index" options={{ title: 'Journal Inbox' }} />
      <Stack.Screen name="journal/[id]" options={{ title: 'Journal Entry' }} />
      <Stack.Screen name="responses/index" options={{ title: 'Responses' }} />
      <Stack.Screen name="responses/[id]" options={{ title: 'Response Details' }} />
    </Stack>
  )
}
