/**
 * Inner Ascend Brand Configuration
 *
 * Update these values to change the app's brand colors.
 * The brand color is used as the primary accent throughout the app.
 *
 * TODO: Replace with final brand colors when provided by design team
 */

// Brand primary color - Purple for spiritual/consciousness theme
// These map to Tamagui color tokens (e.g., purple4Light, purple4Dark)
export const brandConfig = {
  // Primary brand color name from Tamagui color palette
  // Options: 'blue', 'green', 'orange', 'pink', 'purple', 'red', 'yellow'
  primaryColorName: 'purple' as const,

  // Specific color step for light/dark modes (1-12, where 4 is commonly used for brand)
  lightStep: 4,
  darkStep: 4,
} as const

// Splash/loading screen colors
export const splashColors = {
  light: {
    backgroundColor: '#7C3AED', // Purple-600 for light mode splash
    textColor: '#FFFFFF',
  },
  dark: {
    backgroundColor: '#4C1D95', // Purple-900 for dark mode splash
    textColor: '#FFFFFF',
  },
} as const

// App name for branding
export const APP_NAME = 'Inner Ascend'
