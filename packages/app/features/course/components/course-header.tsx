import { ProgressBar } from '@my/ui'
import { H2, Image, Paragraph, XStack, YStack } from '@my/ui'

interface CourseHeaderProps {
  title: string
  description?: string
  coverUrl?: string
  progressPct?: number
}

export function CourseHeader({ title, description, coverUrl, progressPct = 0 }: CourseHeaderProps) {
  return (
    <YStack gap="$3">
      {coverUrl && (
        <Image
          source={{ uri: coverUrl }}
          h={200}
          w="100%"
          resizeMode="cover"
        />
      )}
      <YStack p="$4" gap="$3">
        <H2>{title}</H2>
        {description && (
          <Paragraph size="$4" theme="alt1">
            {description}
          </Paragraph>
        )}
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
      </YStack>
    </YStack>
  )
}
