import {
  CommentInput,
  CommentThread,
  ErrorState,
  FullscreenSpinner,
  MarkdownText,
} from '@my/ui'
import { Archive, Flag } from '@tamagui/lucide-icons'
import { Button, H2, Paragraph, ScrollView, Separator, XStack, YStack } from 'tamagui'
import { useTenant } from 'app/provider/tenant/TenantContext'
import { api } from 'app/utils/api'

interface JournalEntryScreenProps {
  entryId: string
}

export function JournalEntryScreen({ entryId }: JournalEntryScreenProps) {
  const { currentTenant } = useTenant()
  const utils = api.useUtils()

  const { data: entry, isPending, error, refetch } = api.journal.getEntry.useQuery({ entryId })

  const addCommentMutation = api.journal.addComment.useMutation({
    onSuccess: () => {
      utils.journal.getEntry.invalidate({ entryId })
    },
  })

  const setStatusMutation = api.journal.setStatus.useMutation({
    onSuccess: () => {
      utils.journal.getEntry.invalidate({ entryId })
      utils.journal.listForStaff.invalidate()
    },
  })

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />
  }

  if (isPending || !entry) {
    return <FullscreenSpinner />
  }

  const isStaff =
    currentTenant?.role && ['owner', 'admin', 'instructor'].includes(currentTenant.role)

  const handleAddComment = (body: string) => {
    addCommentMutation.mutate({ entryId, body })
  }

  const handleArchive = () => {
    setStatusMutation.mutate({ entryId, status: 'archived' })
  }

  const handleFlag = () => {
    setStatusMutation.mutate({ entryId, status: 'flagged' })
  }

  const statusColors = {
    active: '$blue10',
    archived: '$green10',
    flagged: '$orange10',
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <XStack jc="space-between" ai="flex-start">
          <YStack gap="$2" f={1}>
            {entry.title && <H2>{entry.title}</H2>}
            <XStack gap="$2" ai="center" flexWrap="wrap">
              <Paragraph
                size="$2"
                color={statusColors[entry.status]}
                bg={`${statusColors[entry.status]}20`}
                px="$2"
                br="$2"
              >
                {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
              </Paragraph>
              <Paragraph size="$2" theme="alt2">
                {new Date(entry.createdAt).toLocaleDateString()}
              </Paragraph>
              {entry.courseTitle && (
                <Paragraph size="$2" theme="alt2">
                  {entry.courseTitle}
                  {entry.lessonTitle && ` > ${entry.lessonTitle}`}
                </Paragraph>
              )}
            </XStack>
          </YStack>

          {isStaff && !entry.isOwner && entry.status === 'active' && (
            <XStack gap="$2">
              <Button
                size="$2"
                icon={Archive}
                chromeless
                onPress={handleArchive}
                disabled={setStatusMutation.isPending}
              />
              <Button
                size="$2"
                icon={Flag}
                chromeless
                onPress={handleFlag}
                disabled={setStatusMutation.isPending}
              />
            </XStack>
          )}
        </XStack>

        <YStack bg="$color2" p="$4" br="$3">
          <MarkdownText>{entry.body}</MarkdownText>
        </YStack>

        <Separator />

        <YStack gap="$4">
          <Paragraph fontWeight="600">
            Comments ({entry.comments.length})
          </Paragraph>

          <CommentThread
            comments={entry.comments.map((c) => ({
              id: c.id,
              body: c.body,
              isStaffComment: c.isStaffComment,
              createdAt: c.createdAt,
              author: c.author,
            }))}
          />

          <CommentInput
            onSubmit={handleAddComment}
            isLoading={addCommentMutation.isPending}
            placeholder={
              entry.isOwner
                ? 'Reply to feedback...'
                : 'Add feedback or encouragement...'
            }
          />
        </YStack>
      </YStack>
    </ScrollView>
  )
}
