import { Avatar, Paragraph, XStack, YStack } from 'tamagui'

export interface Comment {
  id: string
  body: string
  isStaffComment?: boolean
  createdAt: string
  author: {
    name: string | null
    avatarUrl: string | null
  }
}

export interface CommentThreadProps {
  comments: Comment[]
}

export const CommentThread = ({ comments }: CommentThreadProps) => {
  if (comments.length === 0) {
    return (
      <Paragraph size="$3" theme="alt2" ta="center" py="$4">
        No comments yet
      </Paragraph>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <YStack gap="$3">
      {comments.map((comment) => (
        <XStack key={comment.id} gap="$3" ai="flex-start">
          <Avatar circular size="$3">
            {comment.author.avatarUrl ? (
              <Avatar.Image source={{ uri: comment.author.avatarUrl }} />
            ) : (
              <Avatar.Fallback bg="$purple5" />
            )}
          </Avatar>

          <YStack f={1} gap="$1">
            <XStack gap="$2" ai="center">
              <Paragraph size="$2" fontWeight="600">
                {comment.author.name || 'Anonymous'}
              </Paragraph>
              {comment.isStaffComment && (
                <Paragraph size="$1" color="$purple10" bg="$purple5" px="$2" br="$2">
                  Staff
                </Paragraph>
              )}
              <Paragraph size="$2" theme="alt2">
                {formatDate(comment.createdAt)}
              </Paragraph>
            </XStack>
            <Paragraph size="$3">{comment.body}</Paragraph>
          </YStack>
        </XStack>
      ))}
    </YStack>
  )
}
