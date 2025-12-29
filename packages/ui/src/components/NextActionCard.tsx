import { Edit3 } from '@tamagui/lucide-icons'
import { Card, H5, Paragraph, XStack, YStack } from 'tamagui'

export interface NextActionCardProps {
  title: string
  lessonTitle: string
  courseTitle: string
  onPress?: () => void
}

export const NextActionCard = ({
  title,
  lessonTitle,
  courseTitle,
  onPress,
}: NextActionCardProps) => {
  return (
    <Card
      bordered
      bg="$color2"
      p="$4"
      pressStyle={{ scale: 0.98, opacity: 0.8 }}
      onPress={onPress}
      cursor="pointer"
      animation="quick"
    >
      <XStack gap="$3" ai="center" pointerEvents="none">
        <YStack bg="$orange5" br="$3" p="$3" ai="center" jc="center" w={56} h={56}>
          <Edit3 size={24} color="$orange10" />
        </YStack>

        <YStack f={1} gap="$1">
          <Paragraph size="$2" theme="alt2">
            Required Assignment
          </Paragraph>
          <H5 numberOfLines={1}>{title}</H5>
          <Paragraph size="$3" theme="alt1" numberOfLines={1}>
            {lessonTitle} - {courseTitle}
          </Paragraph>
        </YStack>
      </XStack>
    </Card>
  )
}
