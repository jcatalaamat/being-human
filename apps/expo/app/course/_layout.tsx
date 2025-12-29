import { LESSON, COURSE } from 'app/constants/copy'
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
      <Stack.Screen
        name="[id]"
        options={{
          title: COURSE.screenTitle,
          headerBackVisible: true,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen name="lesson/[id]" options={{ title: LESSON.screenTitle }} />
    </Stack>
  )
}
