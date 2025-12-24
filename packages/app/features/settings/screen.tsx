import { H2, Paragraph, ScrollView, Settings, YStack } from '@my/ui'
import { Lock, LogOut, Mail, Moon, User } from '@tamagui/lucide-icons'
import { NAV } from 'app/constants/copy'
import { useThemeSetting } from 'app/provider/theme'
import { useSupabase } from 'app/utils/supabase/useSupabase'
import { usePathname } from 'app/utils/usePathname'
import { useLink } from 'solito/link'

import packageJson from '../../package.json'

export const SettingsScreen = () => {
  const pathname = usePathname()

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>{NAV.settings}</H2>

        <Settings>
          <Settings.Items>
            <Settings.Group>
              <Settings.Item
                icon={User}
                isActive={pathname === '/settings/profile'}
                {...useLink({ href: '/settings/profile' })}
                accentTheme="blue"
              >
                Profile
              </Settings.Item>
              <Settings.Item
                icon={Lock}
                isActive={pathname === '/settings/change-password'}
                {...useLink({ href: '/settings/change-password' })}
                accentTheme="green"
              >
                Change Password
              </Settings.Item>
              <Settings.Item
                icon={Mail}
                isActive={pathname === '/settings/change-email'}
                {...useLink({ href: '/settings/change-email' })}
                accentTheme="green"
              >
                Change Email
              </Settings.Item>
            </Settings.Group>
          </Settings.Items>
        </Settings>

        <Settings>
          <Settings.Items>
            <Settings.Group>
              <SettingsThemeAction />
              <SettingsItemLogoutAction />
            </Settings.Group>
          </Settings.Items>
        </Settings>

        <Paragraph py="$2" ta="center" theme="alt2">
          Holistic Training {packageJson.version}
        </Paragraph>
      </YStack>
    </ScrollView>
  )
}

const SettingsThemeAction = () => {
  const { toggle, current } = useThemeSetting()

  return (
    <Settings.Item icon={Moon} accentTheme="blue" onPress={toggle} rightLabel={current}>
      Theme
    </Settings.Item>
  )
}

const SettingsItemLogoutAction = () => {
  const supabase = useSupabase()

  return (
    <Settings.Item icon={LogOut} accentTheme="red" onPress={() => supabase.auth.signOut()}>
      Log Out
    </Settings.Item>
  )
}
