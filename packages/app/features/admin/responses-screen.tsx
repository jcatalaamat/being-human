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
import { Check, ClipboardList, Eye } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'

export function AdminResponsesScreen() {
  const router = useAppRouter()
  const utils = api.useUtils()

  const { data: responses, isPending, refetch } = api.prompts.listResponses.useQuery({
    status: 'submitted',
  })

  const markReviewedMutation = api.prompts.markReviewed.useMutation({
    onSuccess: () => {
      utils.prompts.listResponses.invalidate()
    },
  })

  const handleViewResponse = (responseId: string) => {
    router.push(`/admin/responses/${responseId}`)
  }

  const handleMarkReviewed = (responseId: string) => {
    markReviewedMutation.mutate({ responseId })
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>Assignment Responses</H2>
        <Paragraph theme="alt2">
          Review and provide feedback on member submissions.
        </Paragraph>

        {isPending ? (
          <Paragraph>Loading...</Paragraph>
        ) : responses && responses.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No pending responses"
            message="Submitted assignment responses will appear here."
          />
        ) : (
          <YStack gap="$3">
            {responses?.map((response) => (
              <YStack
                key={response.id}
                bg="$color2"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$3"
                p="$3"
                gap="$3"
                pressStyle={{ opacity: 0.8 }}
                onPress={() => handleViewResponse(response.id)}
              >
                <XStack gap="$3" ai="flex-start">
                  <Avatar size="$3" circular>
                    <Avatar.Image src={response.user?.avatarUrl || undefined} />
                    <Avatar.Fallback bg="$color5">
                      <Paragraph size="$2">{response.user?.name?.[0] || '?'}</Paragraph>
                    </Avatar.Fallback>
                  </Avatar>

                  <YStack f={1} gap="$1">
                    <XStack jc="space-between" ai="center">
                      <Paragraph fontWeight="600">{response.user?.name || 'Unknown'}</Paragraph>
                      <Paragraph size="$1" theme="alt2">
                        {response.submittedAt
                          ? new Date(response.submittedAt).toLocaleDateString()
                          : 'Draft'}
                      </Paragraph>
                    </XStack>

                    <Paragraph fontWeight="500">{response.promptTitle}</Paragraph>
                    <Paragraph size="$2" theme="alt2">
                      {response.lessonTitle} • {response.courseTitle}
                    </Paragraph>

                    <XStack
                      bg={response.status === 'submitted' ? '$blue5' : '$green5'}
                      px="$2"
                      py="$1"
                      borderRadius="$2"
                      als="flex-start"
                      mt="$1"
                    >
                      <Paragraph
                        size="$1"
                        color={response.status === 'submitted' ? '$blue10' : '$green10'}
                        fontWeight="600"
                      >
                        {response.status === 'submitted' ? 'Needs Review' : 'Reviewed'}
                      </Paragraph>
                    </XStack>
                  </YStack>
                </XStack>

                <XStack gap="$2" jc="flex-end">
                  <Button
                    size="$2"
                    chromeless
                    icon={Eye}
                    onPress={(e) => {
                      e.stopPropagation()
                      handleViewResponse(response.id)
                    }}
                  >
                    View
                  </Button>
                  {response.status === 'submitted' && (
                    <Button
                      size="$2"
                      chromeless
                      icon={Check}
                      onPress={(e) => {
                        e.stopPropagation()
                        handleMarkReviewed(response.id)
                      }}
                    >
                      Mark Reviewed
                    </Button>
                  )}
                </XStack>
              </YStack>
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}
