import {
  Avatar,
  Button,
  EmptyState,
  H2,
  Paragraph,
  ScrollView,
  XStack,
  YStack,
} from '@my/ui'
import { BookOpen, Check, Eye, Flag } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'

export function AdminJournalInboxScreen() {
  const router = useAppRouter()
  const utils = api.useUtils()

  const {
    data,
    isPending,
    refetch,
  } = api.journal.listForStaff.useQuery({ status: 'active' })

  const entries = data?.entries

  const markReadMutation = api.journal.markRead.useMutation({
    onSuccess: () => {
      utils.journal.listForStaff.invalidate()
    },
  })

  const setStatusMutation = api.journal.setStatus.useMutation({
    onSuccess: () => {
      utils.journal.listForStaff.invalidate()
    },
  })

  const handleViewEntry = (entryId: string, isRead: boolean) => {
    if (!isRead) {
      markReadMutation.mutate({ entryId })
    }
    router.push(`/admin/journal/${entryId}`)
  }

  const handleArchive = (entryId: string) => {
    setStatusMutation.mutate({ entryId, status: 'archived' })
  }

  const handleFlag = (entryId: string) => {
    setStatusMutation.mutate({ entryId, status: 'flagged' })
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>Journal Inbox</H2>

        {isPending ? (
          <Paragraph>Loading...</Paragraph>
        ) : entries && entries.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No journal entries"
            message="Member journal entries will appear here."
          />
        ) : (
          <YStack gap="$3">
            {entries?.map((entry) => (
              <YStack
                key={entry.id}
                bg={entry.isRead ? '$color2' : '$color3'}
                borderWidth={1}
                borderColor={entry.isRead ? '$borderColor' : '$blue8'}
                borderRadius="$3"
                p="$3"
                gap="$3"
                pressStyle={{ opacity: 0.8 }}
                onPress={() => handleViewEntry(entry.id, entry.isRead)}
              >
                <XStack gap="$3" ai="flex-start">
                  <Avatar size="$3" circular>
                    <Avatar.Image src={entry.author.avatarUrl || undefined} />
                    <Avatar.Fallback bg="$color5">
                      <Paragraph size="$2">{entry.author.name?.[0] || '?'}</Paragraph>
                    </Avatar.Fallback>
                  </Avatar>

                  <YStack f={1} gap="$1">
                    <XStack jc="space-between" ai="center">
                      <Paragraph fontWeight="600">{entry.author.name || 'Unknown'}</Paragraph>
                      <Paragraph size="$1" theme="alt2">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </Paragraph>
                    </XStack>

                    {entry.title && (
                      <Paragraph fontWeight="500">{entry.title}</Paragraph>
                    )}

                    <Paragraph size="$3" theme="alt1" numberOfLines={2}>
                      {entry.bodyPreview}
                    </Paragraph>

                    {entry.courseTitle && (
                      <Paragraph size="$2" theme="alt2">
                        Course: {entry.courseTitle}
                      </Paragraph>
                    )}

                    {!entry.isRead && (
                      <XStack
                        bg="$blue5"
                        px="$2"
                        py="$1"
                        borderRadius="$2"
                        als="flex-start"
                        mt="$1"
                      >
                        <Paragraph size="$1" color="$blue10" fontWeight="600">
                          New
                        </Paragraph>
                      </XStack>
                    )}
                  </YStack>
                </XStack>

                <XStack gap="$2" jc="flex-end">
                  <Button
                    size="$2"
                    chromeless
                    icon={Eye}
                    onPress={(e) => {
                      e.stopPropagation()
                      handleViewEntry(entry.id, entry.isRead)
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="$2"
                    chromeless
                    icon={Check}
                    onPress={(e) => {
                      e.stopPropagation()
                      handleArchive(entry.id)
                    }}
                  >
                    Archive
                  </Button>
                  <Button
                    size="$2"
                    chromeless
                    icon={Flag}
                    theme="red"
                    onPress={(e) => {
                      e.stopPropagation()
                      handleFlag(entry.id)
                    }}
                  >
                    Flag
                  </Button>
                </XStack>
              </YStack>
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
