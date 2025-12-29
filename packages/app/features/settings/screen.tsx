import {
  AlertDialog,
  Button,
  H2,
  Paragraph,
  ScrollView,
  Settings,
  XStack,
  YStack,
  useToastController,
} from '@my/ui'
import { Lock, LogOut, Mail, Moon, Shield, Trash2, User } from '@tamagui/lucide-icons'
import { NAV } from 'app/constants/copy'
import { useTenant } from 'app/provider/tenant/TenantContext'
import { useThemeSetting } from 'app/provider/theme'
import { api } from 'app/utils/api'
import { useSupabase } from 'app/utils/supabase/useSupabase'
import { usePathname } from 'app/utils/usePathname'
import { useState } from 'react'
import { useLink } from 'solito/link'

import packageJson from '../../package.json'

export const SettingsScreen = () => {
  const pathname = usePathname()
  const { currentTenant } = useTenant()

  // Only show admin link for owners, admins, and instructors
  const canAccessAdmin =
    currentTenant?.role && ['owner', 'admin', 'instructor'].includes(currentTenant.role)

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>{NAV.settings}</H2>

        {canAccessAdmin && <AdminSettingsSection pathname={pathname} />}

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

        <Settings>
          <Settings.Items>
            <Settings.Group>
              <DeleteAccountAction />
            </Settings.Group>
          </Settings.Items>
        </Settings>

        <Paragraph py="$2" ta="center" theme="alt2">
          Inner Ascend {packageJson.version}
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

const DeleteAccountAction = () => {
  const [open, setOpen] = useState(false)
  const toast = useToastController()
  const utils = api.useUtils()

  const { data: deletionStatus } = api.user.getDeletionStatus.useQuery()

  const requestDeletion = api.user.requestAccountDeletion.useMutation({
    onSuccess: () => {
      utils.user.getDeletionStatus.invalidate()
      toast.show('Deletion request submitted')
      setOpen(false)
    },
    onError: (error) => {
      toast.show(error.message)
    },
  })

  const cancelDeletion = api.user.cancelDeletionRequest.useMutation({
    onSuccess: () => {
      utils.user.getDeletionStatus.invalidate()
      toast.show('Deletion request cancelled')
    },
    onError: (error) => {
      toast.show(error.message)
    },
  })

  if (deletionStatus?.deletionRequested) {
    return (
      <YStack p="$4" gap="$3" bg="$red2" borderRadius="$3">
        <Paragraph theme="alt2" size="$3">
          Account deletion requested on{' '}
          {new Date(deletionStatus.requestedAt!).toLocaleDateString()}
        </Paragraph>
        <Paragraph size="$2" theme="alt2">
          Your account is scheduled for deletion. This process may take up to 30 days.
        </Paragraph>
        <Button
          size="$3"
          onPress={() => cancelDeletion.mutate()}
          disabled={cancelDeletion.isPending}
        >
          Cancel Deletion Request
        </Button>
      </YStack>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <Settings.Item icon={Trash2} accentTheme="red">
          Delete Account
        </Settings.Item>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
          p="$4"
          gap="$4"
          maw={400}
        >
          <AlertDialog.Title size="$7">Delete Account</AlertDialog.Title>
          <AlertDialog.Description size="$3">
            Are you sure you want to delete your account? This action will submit a request to
            permanently delete your account and all associated data. This process may take up to 30
            days to complete.
          </AlertDialog.Description>

          <XStack gap="$3" jc="flex-end">
            <AlertDialog.Cancel asChild>
              <Button>Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                theme="red"
                onPress={() => requestDeletion.mutate()}
                disabled={requestDeletion.isPending}
              >
                Delete Account
              </Button>
            </AlertDialog.Action>
          </XStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  )
}

const AdminSettingsSection = ({ pathname }: { pathname: string | null }) => {
  const adminLinkProps = useLink({ href: '/admin' })

  return (
    <Settings>
      <Settings.Items>
        <Settings.Group>
          <Settings.Item
            icon={Shield}
            isActive={pathname?.startsWith('/admin')}
            {...adminLinkProps}
            accentTheme="purple"
          >
            {NAV.admin}
          </Settings.Item>
        </Settings.Group>
      </Settings.Items>
    </Settings>
  )
}
