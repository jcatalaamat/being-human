import { Download, Sparkles, Settings as SettingsIcon, Shield } from '@tamagui/lucide-icons'
import { NAV } from 'app/constants/copy'
import { useTenant } from 'app/provider/tenant/TenantContext'
import { Tabs } from 'expo-router'
import { useTheme } from 'tamagui'

export default function TabsLayout() {
  const theme = useTheme()
  const { currentTenant } = useTenant()

  // Only show admin tab for owners, admins, and instructors
  const canAccessAdmin =
    currentTenant?.role && ['owner', 'admin', 'instructor'].includes(currentTenant.role)

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.color12.val,
        tabBarInactiveTintColor: theme.color10.val,
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopColor: theme.borderColor.val,
        },
        headerStyle: {
          backgroundColor: theme.background.val,
        },
        headerTintColor: theme.color12.val,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: NAV.courses,
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          headerShown: false,
          title: NAV.admin,
          href: canAccessAdmin ? undefined : null,
          tabBarIcon: ({ color, size }) => <Shield size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="downloads"
        options={{
          title: NAV.downloads,
          href: null, // Hide for MVP
          tabBarIcon: ({ color, size }) => <Download size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerShown: false,
          title: NAV.settings,
          tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
