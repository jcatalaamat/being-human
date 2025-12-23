import { BookX } from '@tamagui/lucide-icons'
import type { IconProps } from '@tamagui/lucide-icons'
import { H4, Paragraph, YStack } from 'tamagui'

export interface EmptyStateProps {
  icon?: React.FC<IconProps>
  title: string
  message?: string
}

export const EmptyState = ({ icon: Icon = BookX, title, message }: EmptyStateProps) => {
  return (
    <YStack ai="center" jc="center" p="$8" gap="$3" minHeight={300}>
      <Icon size={64} color="$color8" />
      <H4 theme="alt1" ta="center">
        {title}
      </H4>
      {message && (
        <Paragraph theme="alt2" ta="center" maxWidth={300}>
          {message}
        </Paragraph>
      )}
    </YStack>
  )
}
