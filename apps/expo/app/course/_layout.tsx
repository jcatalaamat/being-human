import { EXERCISE, PROGRAM } from 'app/constants/copy'
import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

export default function CourseLayout() {
  const theme = useTheme()

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background.val,
        },
        headerTintColor: theme.color12.val,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="[id]" options={{ title: PROGRAM.screenTitle }} />
      <Stack.Screen name="lesson/[id]" options={{ title: EXERCISE.screenTitle }} />
    </Stack>
  )
}
