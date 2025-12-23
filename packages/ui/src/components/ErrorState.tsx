import { AlertCircle } from '@tamagui/lucide-icons'
import { Button, H4, Paragraph, YStack } from 'tamagui'

export interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <YStack ai="center" jc="center" p="$8" gap="$3" minHeight={300}>
      <AlertCircle size={64} color="$red10" />
      <H4 theme="red" ta="center">
        Error
      </H4>
      <Paragraph theme="alt2" ta="center" maxWidth={300}>
        {message}
      </Paragraph>
      {onRetry && (
        <Button onPress={onRetry} mt="$2">
          Retry
        </Button>
      )}
    </YStack>
  )
}
