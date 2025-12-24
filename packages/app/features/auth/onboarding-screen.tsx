import { Onboarding, OnboardingStepInfo, StepContent } from '@my/ui'
import { Activity, Heart, TrendingUp } from '@tamagui/lucide-icons'
import React from 'react'
import { useRouter } from 'solito/router'

const steps: OnboardingStepInfo[] = [
  {
    theme: 'orange',
    Content: () => (
      <StepContent
        title="Build Strength"
        icon={Activity}
        description="Science-based TRX and Swiss Ball training designed specifically for ages 30-65. Move better, feel stronger, train smarter."
      />
    ),
  },
  {
    theme: 'green',
    Content: () => (
      <StepContent
        title="Pain-Free Movement"
        icon={Heart}
        description="Train smarter, not harder. Protect your muscles while gaining strength and mobility without aggravating old injuries."
      />
    ),
  },
  {
    theme: 'blue',
    Content: () => (
      <StepContent
        title="Progressive Training"
        icon={TrendingUp}
        description="Three carefully designed levels from Beginner to Advanced that safely advance your capabilities at your own pace."
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
