import { MarkdownText, ProgressBar } from '@my/ui'
import { Card, H2, Image, Paragraph, XStack, YStack } from '@my/ui'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface CourseHeaderProps {
  courseId: string
  title: string
  description?: string
  coverUrl?: string
  progressPct?: number
}

const DESCRIPTION_COLLAPSED_KEY = 'course_description_collapsed_'

export function CourseHeader({ courseId, title, description, coverUrl, progressPct = 0 }: CourseHeaderProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  // Load collapsed state from storage
  useEffect(() => {
    AsyncStorage.getItem(DESCRIPTION_COLLAPSED_KEY + courseId).then((value) => {
      if (value !== null) {
        setIsCollapsed(value === 'true')
      }
    })
  }, [courseId])

  const toggleCollapsed = useCallback(() => {
    const newValue = !isCollapsed
    setIsCollapsed(newValue)
    AsyncStorage.setItem(DESCRIPTION_COLLAPSED_KEY + courseId, String(newValue))
  }, [isCollapsed, courseId])

  return (
    <YStack gap="$4">
      {coverUrl && (
        <Image
          source={{ uri: coverUrl }}
          h={200}
          w="100%"
          resizeMode="cover"
        />
      )}
      <YStack px="$4" gap="$4">
        <H2>{title}</H2>
        {progressPct > 0 && (
          <YStack gap="$2">
            <XStack jc="space-between" ai="center">
              <Paragraph size="$3" theme="alt2">
                Course Progress
              </Paragraph>
              <Paragraph size="$3" theme="alt2">
                {progressPct}%
              </Paragraph>
            </XStack>
            <ProgressBar value={progressPct} height={10} />
          </YStack>
        )}
        {description && (
          <Card
            bordered
            br="$4"
            bg="$color2"
            pressStyle={{ opacity: 0.8 }}
            onPress={toggleCollapsed}
            cursor="pointer"
          >
            <XStack p="$4" jc="space-between" ai="center">
              <Paragraph size="$4" fontWeight="600">
                About this course
              </Paragraph>
              {isCollapsed ? (
                <ChevronDown size={20} color="$color11" />
              ) : (
                <ChevronUp size={20} color="$color11" />
              )}
            </XStack>
            {!isCollapsed && (
              <YStack px="$4" pb="$4">
                <MarkdownText size="$4">{description}</MarkdownText>
              </YStack>
            )}
          </Card>
        )}
      </YStack>
    </YStack>
  )
}
