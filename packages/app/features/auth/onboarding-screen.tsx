import { Onboarding, OnboardingStepInfo, StepContent } from '@my/ui'
import { Eye, Heart, Sparkles } from '@tamagui/lucide-icons'
import React from 'react'
import { useRouter } from 'solito/router'

const steps: OnboardingStepInfo[] = [
  {
    theme: 'purple',
    Content: () => (
      <StepContent
        title="Awaken Self-Awareness"
        icon={Eye}
        description="Discover the observer within — the awareness that exists prior to thought. Learn to see yourself clearly, without judgment."
      />
    ),
  },
  {
    theme: 'purple',
    Content: () => (
      <StepContent
        title="Embody Your Truth"
        icon={Heart}
        description="Move beyond intellectual understanding into lived experience. Transform patterns through presence, not force."
      />
    ),
  },
  {
    theme: 'purple',
    Content: () => (
      <StepContent
        title="Reclaim Inner Authority"
        icon={Sparkles}
        description="Trust your own knowing. A 12-month journey of self-discovery, embodied awareness, and inner transformation."
      />
    ),
  },
]

/**
 * note: this screen is used as a standalone page on native and as a sidebar on auth layout on web
 */
export const OnboardingScreen = () => {
  const router = useRouter()
  return <Onboarding autoSwipe onOnboarded={() => router.push('/sign-up')} steps={steps} />
}
