import { Dumbbell } from '@tamagui/lucide-icons'
import { SizableText, XStack, type XStackProps } from 'tamagui'

export interface BrandLogoProps extends XStackProps {
  /** Show just the icon, or icon + text */
  showText?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: { iconSize: 20, textSize: '$4' as const, gap: '$1.5' },
  md: { iconSize: 24, textSize: '$5' as const, gap: '$2' },
  lg: { iconSize: 32, textSize: '$7' as const, gap: '$2.5' },
}

/**
 * Holistic Training brand logo component.
 *
 * Usage:
 * - <BrandLogo /> - Icon only (default)
 * - <BrandLogo showText /> - Icon + "Holistic Training" text
 * - <BrandLogo showText size="lg" /> - Large variant
 *
 * TODO: Replace Dumbbell icon with actual brand logo asset when available
 */
export const BrandLogo = ({ showText = false, size = 'md', ...props }: BrandLogoProps) => {
  const config = sizeConfig[size]

  return (
    <XStack ai="center" gap={config.gap} {...props}>
      <Dumbbell size={config.iconSize} color="$color12" />
      {showText && (
        <SizableText size={config.textSize} fontWeight="700" color="$color12">
          Holistic Training
        </SizableText>
      )}
    </XStack>
  )
}
