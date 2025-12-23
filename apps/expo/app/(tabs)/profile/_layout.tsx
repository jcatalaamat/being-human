import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

export default function ProfileLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="support" options={{ title: 'Support' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  )
}
