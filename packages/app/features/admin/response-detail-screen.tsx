import {
  Avatar,
  Button,
  CommentInput,
  CommentThread,
  ErrorState,
  FullscreenSpinner,
  H3,
  H4,
  Paragraph,
  ScrollView,
  XStack,
  YStack,
  useToastController,
} from '@my/ui'
import { Check } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'

interface AdminResponseDetailScreenProps {
  responseId: string
}

export function AdminResponseDetailScreen({ responseId }: AdminResponseDetailScreenProps) {
  const toast = useToastController()
  const utils = api.useUtils()

  const { data: response, isPending, error, refetch } = api.prompts.getResponseDetail.useQuery({
    responseId,
  })

  const addFeedbackMutation = api.prompts.addFeedback.useMutation({
    onSuccess: () => {
      utils.prompts.getResponseDetail.invalidate({ responseId })
      toast.show('Feedback added')
    },
    onError: (err) => {
      toast.show(err.message)
    },
  })

  const markReviewedMutation = api.prompts.markReviewed.useMutation({
    onSuccess: () => {
      utils.prompts.getResponseDetail.invalidate({ responseId })
      utils.prompts.listResponses.invalidate()
      toast.show('Marked as reviewed')
    },
  })

  const handleSubmitFeedback = (body: string) => {
    addFeedbackMutation.mutate({ responseId, body })
  }

  const handleMarkReviewed = () => {
    markReviewedMutation.mutate({ responseId })
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />
  }

  if (isPending || !response) {
    return <FullscreenSpinner />
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        {/* Member info */}
        <XStack gap="$3" ai="center" jc="space-between">
          <XStack gap="$3" ai="center">
            <Avatar size="$4" circular>
              <Avatar.Image src={response.user?.avatarUrl || undefined} />
              <Avatar.Fallback bg="$color5">
                <Paragraph>{response.user?.name?.[0] || '?'}</Paragraph>
              </Avatar.Fallback>
            </Avatar>
            <YStack>
              <Paragraph fontWeight="600">{response.user?.name || 'Unknown'}</Paragraph>
              <Paragraph size="$2" theme="alt2">
                Submitted{' '}
                {response.submittedAt
                  ? new Date(response.submittedAt).toLocaleDateString()
                  : 'Draft'}
              </Paragraph>
            </YStack>
          </XStack>

          {response.status === 'submitted' && (
            <Button
              size="$3"
              icon={Check}
              onPress={handleMarkReviewed}
              disabled={markReviewedMutation.isPending}
            >
              Mark Reviewed
            </Button>
          )}

          {response.status === 'reviewed' && (
            <XStack bg="$green5" px="$3" py="$2" borderRadius="$2">
              <Paragraph color="$green10" fontWeight="600">
                Reviewed
              </Paragraph>
            </XStack>
          )}
        </XStack>

        {/* Assignment info */}
        <YStack bg="$color3" p="$3" borderRadius="$3">
          <Paragraph size="$2" theme="alt2">
            Assignment
          </Paragraph>
          <Paragraph fontWeight="500">{response.promptTitle}</Paragraph>
          <Paragraph size="$2" theme="alt2">
            {response.lessonTitle} • {response.courseTitle}
          </Paragraph>
        </YStack>

        {/* Prompt body */}
        <YStack gap="$2">
          <H4>Prompt</H4>
          <YStack bg="$color2" p="$3" borderRadius="$3" borderWidth={1} borderColor="$borderColor">
            <Paragraph>{response.promptBody}</Paragraph>
          </YStack>
        </YStack>

        {/* Member's response */}
        <YStack gap="$2">
          <H4>Response</H4>
          <YStack bg="$color2" p="$4" borderRadius="$3" borderWidth={1} borderColor="$borderColor">
            {response.responseSchema?.map((field) => (
              <YStack key={field.id} gap="$1" mb="$3">
                <Paragraph size="$2" fontWeight="500" theme="alt2">
                  {field.label}
                </Paragraph>
                <Paragraph whiteSpace="pre-wrap">
                  {response.response?.[field.id] || '(No answer)'}
                </Paragraph>
              </YStack>
            ))}
          </YStack>
        </YStack>

        {/* Feedback section */}
        <YStack gap="$3" mt="$4">
          <H4>Feedback ({response.feedback?.length || 0})</H4>

          {response.feedback && response.feedback.length > 0 && (
            <CommentThread
              comments={response.feedback.map((f) => ({
                id: f.id,
                body: f.body,
                createdAt: f.createdAt,
                author: f.author,
              }))}
            />
          )}

          <CommentInput
            onSubmit={handleSubmitFeedback}
            isLoading={addFeedbackMutation.isPending}
            placeholder="Add feedback for this response..."
          />
        </YStack>
      </YStack>
    </ScrollView>
  )
}
