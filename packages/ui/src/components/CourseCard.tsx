import { LinearGradient } from '@tamagui/linear-gradient'
import { Card, type CardProps, H4, Image, Paragraph, XStack, YStack } from 'tamagui'

import { stripMarkdown } from './MarkdownText'
import { ProgressBar } from './ProgressBar'

export interface CourseCardProps extends CardProps {
  id: string
  title: string
  description?: string
  coverUrl?: string
  progressPct?: number
  onPress?: () => void
}

export const CourseCard = ({
  id,
  title,
  description,
  coverUrl,
  progressPct = 0,
  onPress,
  ...props
}: CourseCardProps) => {
  return (
    <Card br="$3" bordered overflow="hidden" pressStyle={{ scale: 0.98 }} cursor="pointer" onPress={onPress} {...props}>
      <Card.Header p="$0">
        {coverUrl && (
          <Image
            source={{
              uri: coverUrl,
            }}
            h={150}
            resizeMode="cover"
          />
        )}
        <YStack padding="$3" gap="$2">
          <H4 size="$5" numberOfLines={2}>
            {title}
          </H4>
          {description && (
            <Paragraph size="$3" theme="alt1" numberOfLines={2}>
              {stripMarkdown(description)}
            </Paragraph>
          )}
          {progressPct > 0 && (
            <XStack gap="$2" ai="center" mt="$2">
              <ProgressBar value={progressPct} f={1} />
              <Paragraph size="$2" theme="alt2" w={40} ta="right">
                {progressPct}%
              </Paragraph>
            </XStack>
          )}
        </YStack>
      </Card.Header>

      <Card.Background>
        <LinearGradient w="100%" h="100%" colors={['$color2', '$color1']} start={[1, 1]} end={[0.85, 0]} />
      </Card.Background>
    </Card>
  )
}
