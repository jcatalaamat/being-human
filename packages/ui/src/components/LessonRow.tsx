import { CheckCircle, FileText, Headphones, Video } from '@tamagui/lucide-icons'
import type { IconProps } from '@tamagui/lucide-icons'
import { Button, Paragraph, XStack } from 'tamagui'

export type LessonType = 'video' | 'audio' | 'pdf' | 'text'

export interface LessonRowProps {
  title: string
  type: LessonType
  durationSec?: number
  isComplete?: boolean
  onPress: () => void
}

const iconMap: Record<LessonType, React.FC<IconProps>> = {
  video: Video,
  audio: Headphones,
  pdf: FileText,
  text: FileText,
}

const formatDuration = (seconds?: number): string => {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const LessonRow = ({ title, type, durationSec, isComplete = false, onPress }: LessonRowProps) => {
  const Icon = iconMap[type]

  return (
    <Button
      onPress={onPress}
      jc="flex-start"
      bg="transparent"
      borderWidth={1}
      borderColor="$borderColor"
      pressStyle={{ bg: '$color3' }}
      h="auto"
      py="$3"
      px="$3"
    >
      <XStack gap="$3" ai="center" f={1} w="100%">
        <Icon size={20} color="$color11" />
        <Paragraph f={1} numberOfLines={2} ta="left">
          {title}
        </Paragraph>
        {durationSec && (
          <Paragraph size="$2" theme="alt2" minWidth={40} ta="right">
            {formatDuration(durationSec)}
          </Paragraph>
        )}
        {isComplete && <CheckCircle size={20} color="$green10" />}
      </XStack>
    </Button>
  )
}
