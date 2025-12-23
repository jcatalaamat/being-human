import { ArrowRight, CheckCircle } from '@tamagui/lucide-icons'
import { useSafeAreaInsets } from 'app/utils/useSafeAreaInsets'
import { Button, View, XStack } from 'tamagui'

export interface BottomActionBarProps {
  onComplete: () => void
  onNext?: () => void
  hasNext?: boolean
  isComplete?: boolean
  isLoading?: boolean
}

export const BottomActionBar = ({
  onComplete,
  onNext,
  hasNext = false,
  isComplete = false,
  isLoading = false,
}: BottomActionBarProps) => {
  const insets = useSafeAreaInsets()

  return (
    <View bg="$background" borderTopWidth={1} borderColor="$borderColor" pb={insets.bottom}>
      <XStack p="$4" gap="$3" jc="space-between">
        <Button
          f={1}
          icon={CheckCircle}
          onPress={onComplete}
          disabled={isComplete || isLoading}
          theme={isComplete ? 'green' : undefined}
        >
          {isComplete ? 'Completed' : 'Mark Complete'}
        </Button>

        {hasNext && (
          <Button f={1} iconAfter={ArrowRight} onPress={onNext || onComplete} disabled={isLoading} themeInverse>
            Next Lesson
          </Button>
        )}
      </XStack>
    </View>
  )
}
