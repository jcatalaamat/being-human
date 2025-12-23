import { H2, Paragraph, ScrollView, Settings, YStack } from '@my/ui'
import { Settings as SettingsIcon } from '@tamagui/lucide-icons'
import { useUser } from 'app/utils/useUser'
import { useLink } from 'solito/link'

export function ProfileScreen() {
  const { profile, user } = useUser()

  const name = profile?.name ?? 'No Name'
  const email = user?.email ?? ''

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$6">
        <YStack ai="center" gap="$2">
          <H2>{name}</H2>
          <Paragraph theme="alt2">{email}</Paragraph>
        </YStack>

        <Settings>
          <Settings.Items>
            <Settings.Group>
              <Settings.Item icon={SettingsIcon} accentTheme="blue" {...useLink({ href: '/settings' })}>
                Settings
              </Settings.Item>
            </Settings.Group>
          </Settings.Items>
        </Settings>
      </YStack>
    </ScrollView>
  )
}
