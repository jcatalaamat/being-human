import { ChevronLeft } from '@tamagui/lucide-icons'
import { LESSON, COURSE } from 'app/constants/copy'
import { Stack, useRouter } from 'expo-router'
import { Pressable } from 'react-native'
import { Text, useTheme } from 'tamagui'

export default function CourseLayout() {
  const theme = useTheme()
  const router = useRouter()

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
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -16 }}
            >
              <ChevronLeft size={30} color={theme.color12.val} />
              <Text color="$color12" fontSize="$4">
                Courses
              </Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="lesson/[id]" options={{ title: LESSON.screenTitle }} />
    </Stack>
  )
}
