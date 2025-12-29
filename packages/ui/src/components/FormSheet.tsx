import { X } from '@tamagui/lucide-icons'
import { Button, H4, Sheet, XStack, YStack } from 'tamagui'

export interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  snapPoints?: number[]
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  children,
  snapPoints = [85],
}: FormSheetProps) {
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      dismissOnSnapToBottom
      zIndex={100_000}
      animation="medium"
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame>
        <YStack f={1}>
          <XStack jc="space-between" ai="center" p="$4" pb="$2">
            <H4>{title}</H4>
            <Button
              size="$2"
              circular
              icon={X}
              chromeless
              onPress={() => onOpenChange(false)}
            />
          </XStack>
          <Sheet.ScrollView>
            <YStack p="$4" pt="$2" gap="$4">
              {children}
            </YStack>
          </Sheet.ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
