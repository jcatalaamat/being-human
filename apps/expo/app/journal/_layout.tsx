import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

export default function JournalLayout() {
  const theme = useTheme()

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background.val },
        headerTintColor: theme.color12.val,
      }}
    >
      <Stack.Screen name="[id]" options={{ title: 'Journal Entry' }} />
      <Stack.Screen name="new" options={{ title: 'New Entry' }} />
    </Stack>
  )
}
