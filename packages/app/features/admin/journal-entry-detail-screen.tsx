import {
  Avatar,
  CommentInput,
  CommentThread,
  ErrorState,
  FullscreenSpinner,
  H3,
  MarkdownText,
  Paragraph,
  ScrollView,
  XStack,
  YStack,
  useToastController,
} from '@my/ui'
import { api } from 'app/utils/api'

interface AdminJournalEntryDetailScreenProps {
  entryId: string
}

export function AdminJournalEntryDetailScreen({ entryId }: AdminJournalEntryDetailScreenProps) {
  const toast = useToastController()
  const utils = api.useUtils()

  const { data: entry, isPending, error, refetch } = api.journal.getEntry.useQuery({ entryId })

  const addCommentMutation = api.journal.addComment.useMutation({
    onSuccess: () => {
      utils.journal.getEntry.invalidate({ entryId })
      toast.show('Comment added')
    },
    onError: (err) => {
      toast.show(err.message)
    },
  })

  const handleSubmitComment = (body: string) => {
    addCommentMutation.mutate({ entryId, body })
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />
  }

  if (isPending || !entry) {
    return <FullscreenSpinner />
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        {/* Author info */}
        <XStack gap="$3" ai="center">
          <Avatar size="$4" circular>
            <Avatar.Image src={entry.authorAvatarUrl} />
            <Avatar.Fallback bg="$color5">
              <Paragraph>{entry.authorName?.[0] || '?'}</Paragraph>
            </Avatar.Fallback>
          </Avatar>
          <YStack>
            <Paragraph fontWeight="600">{entry.authorName || 'Unknown'}</Paragraph>
            <Paragraph size="$2" theme="alt2">
              {new Date(entry.createdAt).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Paragraph>
          </YStack>
        </XStack>

        {/* Title */}
        {entry.title && <H3>{entry.title}</H3>}

        {/* Related context */}
        {entry.lessonTitle && (
          <YStack bg="$color3" p="$3" borderRadius="$3">
            <Paragraph size="$2" theme="alt2">
              Related to lesson:
            </Paragraph>
            <Paragraph fontWeight="500">{entry.lessonTitle}</Paragraph>
            {entry.courseTitle && (
              <Paragraph size="$2" theme="alt2">
                {entry.courseTitle}
              </Paragraph>
            )}
          </YStack>
        )}

        {/* Entry body */}
        <YStack borderWidth={1} borderColor="$borderColor" borderRadius="$3" p="$4">
          <MarkdownText>{entry.body}</MarkdownText>
        </YStack>

        {/* Comments section */}
        <YStack gap="$3" mt="$4">
          <Paragraph fontWeight="600" size="$5">
            Comments ({entry.comments?.length || 0})
          </Paragraph>

          {entry.comments && entry.comments.length > 0 && (
            <CommentThread
              comments={entry.comments.map((c) => ({
                id: c.id,
                body: c.body,
                authorName: c.authorName || 'Unknown',
                authorAvatarUrl: c.authorAvatarUrl,
                createdAt: c.createdAt,
              }))}
            />
          )}

          <CommentInput
            onSubmit={handleSubmitComment}
            isLoading={addCommentMutation.isPending}
            placeholder="Add a comment or feedback..."
          />
        </YStack>
      </YStack>
    </ScrollView>
  )
}
