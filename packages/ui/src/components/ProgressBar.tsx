import type { ViewProps } from 'tamagui'
import { View } from 'tamagui'

export interface ProgressBarProps extends ViewProps {
  value: number // 0-100
  height?: number
  color?: string
  backgroundColor?: string
}

export const ProgressBar = ({
  value,
  height = 8,
  color = '$blue10',
  backgroundColor = '$color3',
  ...props
}: ProgressBarProps) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <View w="100%" h={height} bg={backgroundColor} br="$4" overflow="hidden" {...props}>
      <View w={`${clampedValue}%`} h="100%" bg={color} />
    </View>
  )
}
