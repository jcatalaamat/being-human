/**
 * Holistic Training Brand Configuration
 *
 * Update these values to change the app's brand colors.
 * The brand color is used as the primary accent throughout the app.
 *
 * TODO: Replace with final brand colors when provided by design team
 */

// Brand primary color - Teal/Green for fitness/holistic theme
// These map to Tamagui color tokens (e.g., green4Light, green4Dark)
export const brandConfig = {
  // Primary brand color name from Tamagui color palette
  // Options: 'blue', 'green', 'orange', 'pink', 'purple', 'red', 'yellow'
  primaryColorName: 'green' as const,

  // Specific color step for light/dark modes (1-12, where 4 is commonly used for brand)
  lightStep: 4,
  darkStep: 4,
} as const

// Splash/loading screen colors
export const splashColors = {
  light: {
    backgroundColor: '#0D9488', // Teal-600 for light mode splash
    textColor: '#FFFFFF',
  },
  dark: {
    backgroundColor: '#134E4A', // Teal-900 for dark mode splash
    textColor: '#FFFFFF',
  },
} as const

// App name for branding
export const APP_NAME = 'Holistic Training'
