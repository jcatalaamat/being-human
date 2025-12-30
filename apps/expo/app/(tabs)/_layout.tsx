import {
  BookOpen,
  Calendar,
  Download,
  Home,
  PenTool,
  Sparkles,
  Settings as SettingsIcon,
  Shield,
} from '@tamagui/lucide-icons'
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
          title: NAV.home,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="course"
        options={{
          title: NAV.course,
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: NAV.assignments,
          tabBarIcon: ({ color, size }) => <PenTool size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          href: null, // Hidden - redirects to assignments
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          headerShown: false,
          title: NAV.admin,
          href: canAccessAdmin ? undefined : null, // Show for admins/instructors
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
