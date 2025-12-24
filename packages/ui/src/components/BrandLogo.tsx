import { Image, SizableText, XStack, type XStackProps } from 'tamagui'

export interface BrandLogoProps extends XStackProps {
  /** Show just the icon, or icon + text */
  showText?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: { iconSize: 24, textSize: '$4' as const, gap: '$1.5' },
  md: { iconSize: 32, textSize: '$5' as const, gap: '$2' },
  lg: { iconSize: 48, textSize: '$7' as const, gap: '$2.5' },
}

/**
 * Holistic Training brand logo component.
 *
 * Usage:
 * - <BrandLogo /> - Icon only (default)
 * - <BrandLogo showText /> - Icon + "Holistic Training" text
 * - <BrandLogo showText size="lg" /> - Large variant
 */
export const BrandLogo = ({ showText = false, size = 'md', ...props }: BrandLogoProps) => {
  const config = sizeConfig[size]

  return (
    <XStack ai="center" gap={config.gap} {...props}>
      <Image
        source={{ uri: '/images/holistic-training-logo.png' }}
        width={config.iconSize}
        height={config.iconSize}
        borderRadius={config.iconSize / 4}
      />
      {showText && (
        <SizableText size={config.textSize} fontWeight="700" color="$color12">
          Holistic Training
        </SizableText>
      )}
    </XStack>
  )
}
