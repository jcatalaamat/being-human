import { EmptyState, ErrorState, FullscreenSpinner, JournalEntryCard } from '@my/ui'
import { PenTool, Plus, X } from '@tamagui/lucide-icons'
import {
  Button,
  H2,
  H4,
  Input,
  Paragraph,
  ScrollView,
  Sheet,
  TextArea,
  XStack,
  YStack,
} from 'tamagui'
import { ASSIGNMENTS } from 'app/constants/copy'
import { useTenant } from 'app/provider/tenant/TenantContext'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState } from 'react'

export function JournalScreen() {
  const router = useAppRouter()
  const { currentTenant } = useTenant()
  const [showStaffView, setShowStaffView] = useState(false)
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')

  const utils = api.useUtils()

  const isStaff =
    currentTenant?.role && ['owner', 'admin', 'instructor'].includes(currentTenant.role)

  // Member's own entries
  const {
    data: myEntries,
    isPending: myPending,
    error: myError,
    refetch: refetchMine,
  } = api.journal.listMine.useQuery(undefined, {
    enabled: !showStaffView,
  })

  // Staff inbox (if staff)
  const {
    data: staffEntries,
    isPending: staffPending,
    error: staffError,
    refetch: refetchStaff,
  } = api.journal.listForStaff.useQuery(undefined, {
    enabled: showStaffView && !!isStaff,
  })

  const createMutation = api.journal.createEntry.useMutation({
    onSuccess: (data) => {
      utils.journal.listMine.invalidate()
      setShowCreateSheet(false)
      setNewTitle('')
      setNewBody('')
      router.push(`/assignments/${data.id}`)
    },
  })

  const isPending = showStaffView ? staffPending : myPending
  const error = showStaffView ? staffError : myError
  const refetch = showStaffView ? refetchStaff : refetchMine
  const entries = showStaffView ? staffEntries?.entries : myEntries?.entries

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />
  }

  if (isPending) {
    return <FullscreenSpinner />
  }

  const handleEntryPress = (entryId: string) => {
    router.push(`/assignments/${entryId}`)
  }

  const handleCreate = () => {
    setShowCreateSheet(true)
  }

  const handleSubmitEntry = () => {
    if (!newBody.trim()) return
    createMutation.mutate({
      title: newTitle.trim() || undefined,
      body: newBody.trim(),
    })
  }

  return (
    <>
      <ScrollView>
        <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
          <XStack jc="space-between" ai="center">
            <H2>{ASSIGNMENTS.pageTitle}</H2>
            {!showStaffView && (
              <Button size="$3" icon={Plus} onPress={handleCreate} themeInverse>
                {ASSIGNMENTS.newEntry}
              </Button>
            )}
          </XStack>

          {isStaff && (
            <XStack gap="$2">
              <Button
                size="$3"
                bg={!showStaffView ? '$purple9' : '$color3'}
                color={!showStaffView ? 'white' : '$color12'}
                onPress={() => setShowStaffView(false)}
              >
                {ASSIGNMENTS.myEntries}
              </Button>
              <Button
                size="$3"
                bg={showStaffView ? '$purple9' : '$color3'}
                color={showStaffView ? 'white' : '$color12'}
                onPress={() => setShowStaffView(true)}
              >
                {ASSIGNMENTS.staffInbox}
              </Button>
            </XStack>
          )}

          {!entries || entries.length === 0 ? (
            <EmptyState
              icon={PenTool}
              title={showStaffView ? ASSIGNMENTS.noSubmissions : ASSIGNMENTS.noEntries}
              message={
                showStaffView
                  ? ASSIGNMENTS.noSubmissionsMessage
                  : ASSIGNMENTS.noEntriesMessage
              }
            />
          ) : (
            <YStack gap="$3">
              {entries.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  id={entry.id}
                  title={entry.title}
                  body={showStaffView ? entry.bodyPreview || '' : entry.body}
                  status={entry.status}
                  courseTitle={entry.courseTitle}
                  lessonTitle={entry.lessonTitle}
                  createdAt={entry.createdAt}
                  hasNewComments={showStaffView ? !entry.isRead : undefined}
                  onPress={() => handleEntryPress(entry.id)}
                />
              ))}
            </YStack>
          )}
        </YStack>
      </ScrollView>

      <Sheet
        modal
        open={showCreateSheet}
        onOpenChange={setShowCreateSheet}
        snapPoints={[85]}
        dismissOnSnapToBottom
        zIndex={100_000}
        animation="medium"
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
        <Sheet.Frame p="$4" gap="$4">
          <XStack jc="space-between" ai="center">
            <H4>{ASSIGNMENTS.newEntry}</H4>
            <Button
              size="$2"
              circular
              icon={X}
              chromeless
              onPress={() => setShowCreateSheet(false)}
            />
          </XStack>

          <YStack gap="$2">
            <Paragraph size="$2" fontWeight="500">
              Title (optional)
            </Paragraph>
            <Input
              placeholder="Give your entry a title..."
              value={newTitle}
              onChangeText={setNewTitle}
            />
          </YStack>

          <YStack gap="$2" f={1}>
            <Paragraph size="$2" fontWeight="500">
              Your reflection *
            </Paragraph>
            <TextArea
              placeholder="Write your thoughts, reflections, or questions..."
              value={newBody}
              onChangeText={setNewBody}
              f={1}
              minHeight={150}
            />
            <Paragraph size="$2" theme="alt2">
              Your entry will be visible to instructors who can provide feedback.
            </Paragraph>
          </YStack>

          <Button
            themeInverse
            size="$4"
            onPress={handleSubmitEntry}
            disabled={!newBody.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? 'Saving...' : 'Save Entry'}
          </Button>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
