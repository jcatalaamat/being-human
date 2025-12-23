import { Button, H3, Paragraph, YStack } from '@my/ui'
import { Mail } from '@tamagui/lucide-icons'
import { Linking, Platform } from 'react-native'

export function SupportScreen() {
  const supportEmail = 'support@egon.com' // Replace with actual support email

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Course App Support Request')
    const body = encodeURIComponent(
      `\n\n---\nApp Version: 1.0.0\nPlatform: ${Platform.OS}\nOS Version: ${Platform.Version}`
    )
    Linking.openURL(`mailto:${supportEmail}?subject=${subject}&body=${body}`)
  }

  const handleReportBug = () => {
    const subject = encodeURIComponent('Bug Report - Course App')
    const body = encodeURIComponent(
      `Please describe the bug:\n\n\n\nSteps to reproduce:\n1. \n2. \n3. \n\n---\nApp Version: 1.0.0\nPlatform: ${Platform.OS}\nOS Version: ${Platform.Version}`
    )
    Linking.openURL(`mailto:${supportEmail}?subject=${subject}&body=${body}`)
  }

  return (
    <YStack f={1} p="$4" gap="$4" bg="$background">
      <YStack gap="$2">
        <H3>Contact Support</H3>
        <Paragraph theme="alt1">Need help? We're here for you.</Paragraph>
      </YStack>

      <Button icon={Mail} onPress={handleContactSupport} size="$5">
        Email Support
      </Button>

      <Button onPress={handleReportBug} size="$5" variant="outlined">
        Report a Bug
      </Button>

      <YStack gap="$2" mt="$4">
        <Paragraph size="$2" theme="alt2">
          We typically respond within 24 hours during business days.
        </Paragraph>
        <Paragraph size="$2" theme="alt2">
          Email: {supportEmail}
        </Paragraph>
      </YStack>
    </YStack>
  )
}
