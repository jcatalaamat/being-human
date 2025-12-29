import { Avatar, Button, EmptyState, FullscreenSpinner, H2, Paragraph, ScrollView, Settings, XStack, YStack, getTokens } from '@my/ui'
import { Eye, User, Users } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { SolitoImage } from 'solito/image'

export function AdminMembersScreen() {
  const router = useAppRouter()
  const { data: members, isPending } = api.members.listAll.useQuery()

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>Members</H2>

        {isPending ? (
          <FullscreenSpinner />
        ) : members && members.length === 0 ? (
          <EmptyState icon={Users} title="No members yet" message="Members will appear here when they enroll in courses" />
        ) : (
          <Settings>
            <Settings.Items>
              <Settings.Group>
                {members?.map((member) => (
                  <Settings.Item
                    key={member.userId}
                    icon={User}
                    onPress={() => router.push(`/admin/members/${member.userId}?courseId=${member.courses[0]?.id || ''}`)}
                    accentTheme="blue"
                  >
                    <XStack ai="center" gap="$3" f={1}>
                      <Avatar size="$3" circular>
                        {member.avatarUrl ? (
                          <SolitoImage
                            src={member.avatarUrl}
                            alt={member.name}
                            width={getTokens().size['3'].val}
                            height={getTokens().size['3'].val}
                          />
                        ) : (
                          <Avatar.Fallback bg="$blue5">
                            <Paragraph size="$3">{member.name?.[0]?.toUpperCase() || '?'}</Paragraph>
                          </Avatar.Fallback>
                        )}
                      </Avatar>
                      <YStack f={1} ov="hidden" miw={0}>
                        <Paragraph fontWeight="600" numberOfLines={1}>
                          {member.name || 'Unknown'}
                        </Paragraph>
                        <Paragraph size="$2" theme="alt2" numberOfLines={1}>
                          {member.email}
                        </Paragraph>
                      </YStack>
                    </XStack>
                    <YStack ai="flex-end" miw={80}>
                      <Paragraph size="$2" theme="alt2">
                        {member.courses.length} {member.courses.length === 1 ? 'course' : 'courses'}
                      </Paragraph>
                      <Paragraph size="$1" theme="alt2">
                        Active {formatDate(member.lastAccessedAt)}
                      </Paragraph>
                    </YStack>
                    <Button size="$2" chromeless icon={Eye} />
                  </Settings.Item>
                ))}
              </Settings.Group>
            </Settings.Items>
          </Settings>
        )}
      </YStack>
    </ScrollView>
  )
}
