import {
  Avatar,
  Button,
  EmptyState,
  ErrorState,
  FullscreenSpinner,
  H2,
  H3,
  Paragraph,
  ScrollView,
  XStack,
  YStack,
  getTokens,
} from '@my/ui'
import { Check, Lock, LockOpen, User } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { SolitoImage } from 'solito/image'

interface MemberDetailScreenProps {
  userId: string
  courseId: string
}

export function MemberDetailScreen({ userId, courseId }: MemberDetailScreenProps) {
  const router = useAppRouter()
  const utils = api.useUtils()

  const {
    data: member,
    isPending,
    error,
  } = api.members.getMemberProgress.useQuery({
    userId,
    courseId,
  })

  const unlockMutation = api.members.unlockModule.useMutation({
    onSuccess: () => {
      utils.members.getMemberProgress.invalidate({ userId, courseId })
    },
  })

  const revokeMutation = api.members.revokeUnlock.useMutation({
    onSuccess: () => {
      utils.members.getMemberProgress.invalidate({ userId, courseId })
    },
  })

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleUnlock = (moduleId: string) => {
    unlockMutation.mutate({ userId, moduleId })
  }

  const handleRevoke = (moduleId: string) => {
    if (confirm('Revoke manual unlock? The module will follow the drip schedule again.')) {
      revokeMutation.mutate({ userId, moduleId })
    }
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={() => router.back()} />
  }

  if (isPending || !member) {
    return <FullscreenSpinner />
  }

  const totalLessons = member.modules.reduce((sum, m) => sum + m.lessonsTotal, 0)
  const completedLessons = member.modules.reduce((sum, m) => sum + m.lessonsCompleted, 0)
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$6">
        {/* Member Header */}
        <XStack ai="center" gap="$4">
          <Avatar size="$6" circular>
            {member.avatarUrl ? (
              <SolitoImage
                src={member.avatarUrl}
                alt={member.name}
                width={getTokens().size['6'].val}
                height={getTokens().size['6'].val}
              />
            ) : (
              <Avatar.Fallback bg="$blue5">
                <User size={32} color="$blue10" />
              </Avatar.Fallback>
            )}
          </Avatar>
          <YStack f={1}>
            <H2 size="$7">{member.name}</H2>
            <Paragraph theme="alt2">{member.email}</Paragraph>
          </YStack>
        </XStack>

        {/* Stats */}
        <XStack gap="$4" flexWrap="wrap">
          <YStack bg="$background" br="$3" p="$4" borderWidth={1} borderColor="$borderColor" f={1} miw={120}>
            <Paragraph size="$2" theme="alt2">
              Enrolled
            </Paragraph>
            <Paragraph fontWeight="600">{formatDate(member.enrolledAt)}</Paragraph>
          </YStack>
          <YStack bg="$background" br="$3" p="$4" borderWidth={1} borderColor="$borderColor" f={1} miw={120}>
            <Paragraph size="$2" theme="alt2">
              Last Active
            </Paragraph>
            <Paragraph fontWeight="600">{formatDate(member.lastAccessedAt)}</Paragraph>
          </YStack>
          <YStack bg="$background" br="$3" p="$4" borderWidth={1} borderColor="$borderColor" f={1} miw={120}>
            <Paragraph size="$2" theme="alt2">
              Progress
            </Paragraph>
            <Paragraph fontWeight="600">
              {progressPct}% ({completedLessons}/{totalLessons} lessons)
            </Paragraph>
          </YStack>
        </XStack>

        {/* Modules */}
        <YStack gap="$3">
          <H3>Module Access</H3>

          {member.modules.length === 0 ? (
            <EmptyState title="No modules" message="This course has no modules yet" />
          ) : (
            member.modules.map((module) => (
              <YStack
                key={module.id}
                bg="$background"
                br="$3"
                p="$4"
                borderWidth={1}
                borderColor={module.isUnlocked ? '$green6' : '$borderColor'}
                gap="$3"
              >
                <XStack ai="center" jc="space-between">
                  <XStack ai="center" gap="$2" f={1}>
                    {module.isUnlocked ? (
                      <LockOpen size={18} color="$green10" />
                    ) : (
                      <Lock size={18} color="$gray10" />
                    )}
                    <Paragraph fontWeight="600" f={1}>
                      {module.title}
                    </Paragraph>
                  </XStack>
                  {module.unlockedManually && (
                    <Paragraph size="$2" color="$green10">
                      Manually unlocked
                    </Paragraph>
                  )}
                </XStack>

                <XStack ai="center" jc="space-between">
                  <YStack gap="$1">
                    <Paragraph size="$2" theme="alt2">
                      {module.isUnlocked
                        ? `Unlocked${module.unlockedManually ? ' (manual)' : ''}`
                        : `Unlocks ${formatDate(module.unlockDate)}`}
                    </Paragraph>
                    <XStack ai="center" gap="$2">
                      <Check size={14} color="$green10" />
                      <Paragraph size="$2">
                        {module.lessonsCompleted}/{module.lessonsTotal} lessons completed
                      </Paragraph>
                    </XStack>
                  </YStack>

                  {module.isUnlocked && module.unlockedManually ? (
                    <Button
                      size="$3"
                      theme="red"
                      onPress={() => handleRevoke(module.id)}
                      disabled={revokeMutation.isPending}
                    >
                      Revoke
                    </Button>
                  ) : !module.isUnlocked ? (
                    <Button
                      size="$3"
                      themeInverse
                      onPress={() => handleUnlock(module.id)}
                      disabled={unlockMutation.isPending}
                      icon={LockOpen}
                    >
                      Unlock
                    </Button>
                  ) : null}
                </XStack>
              </YStack>
            ))
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
