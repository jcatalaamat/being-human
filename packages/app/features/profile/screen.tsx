import { Avatar, H2, H4, Paragraph, ScrollView, Settings, SizableText, XStack, YStack, getTokens } from '@my/ui'
import { BarChart3, BookOpen, Cog, Trophy, User } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useUser } from 'app/utils/useUser'
import { SolitoImage } from 'solito/image'

export function ProfileScreen() {
  const { profile, avatarUrl, user } = useUser()
  const router = useAppRouter()
  const { data: stats } = api.progress.getUserStats.useQuery()

  const name = profile?.name ?? 'No Name'
  const email = user?.email ?? ''

  return (
    <ScrollView>
      <YStack maw={600} mx="auto" w="100%" py="$6" px="$4" gap="$6">
        {/* User Header */}
        <YStack ai="center" gap="$4">
          <Avatar circular size="$8">
            <SolitoImage
              src={avatarUrl}
              alt="your avatar"
              width={getTokens().size['8'].val}
              height={getTokens().size['8'].val}
            />
          </Avatar>
          <YStack ai="center" gap="$2">
            <H2>{name}</H2>
            <Paragraph theme="alt2">{email}</Paragraph>
          </YStack>
        </YStack>

        {/* Stats Cards */}
        <YStack gap="$3">
          <H4>Learning Progress</H4>
          <XStack gap="$3">
            <YStack
              f={1}
              bg="$background"
              p="$4"
              br="$4"
              borderWidth={1}
              borderColor="$borderColor"
              gap="$2"
              ai="center"
            >
              <BookOpen size={32} color="$blue10" />
              <SizableText size="$8" fontWeight="bold">
                {stats?.enrolledCourses ?? 0}
              </SizableText>
              <Paragraph size="$2" theme="alt2">
                Courses
              </Paragraph>
            </YStack>

            <YStack
              f={1}
              bg="$background"
              p="$4"
              br="$4"
              borderWidth={1}
              borderColor="$borderColor"
              gap="$2"
              ai="center"
            >
              <Trophy size={32} color="$green10" />
              <SizableText size="$8" fontWeight="bold">
                {stats?.completedLessons ?? 0}
              </SizableText>
              <Paragraph size="$2" theme="alt2">
                Completed
              </Paragraph>
            </YStack>
          </XStack>
        </YStack>

        {/* Settings Menu */}
        <YStack gap="$3">
          <H4>Account</H4>
          <Settings>
            <Settings.Items>
              <Settings.Group>
                <Settings.Item icon={User} onPress={() => router.push('/profile/edit')} accentTheme="blue">
                  Edit Profile
                </Settings.Item>
                <Settings.Item icon={BarChart3} onPress={() => router.push('/')} accentTheme="green">
                  My Progress
                </Settings.Item>
                <Settings.Item icon={Cog} onPress={() => router.push('/settings')} accentTheme="gray">
                  Settings
                </Settings.Item>
              </Settings.Group>
            </Settings.Items>
          </Settings>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
