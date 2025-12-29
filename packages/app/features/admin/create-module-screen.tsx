import { Button, H2, Paragraph, ScrollView, YStack, XStack } from '@my/ui'
import { Input, TextArea, Label } from 'tamagui'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState } from 'react'

type ModuleStatus = 'draft' | 'scheduled' | 'live'

interface CreateModuleScreenProps {
  courseId: string
}

export function CreateModuleScreen({ courseId }: CreateModuleScreenProps) {
  const router = useAppRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [orderIndex, setOrderIndex] = useState('0')
  const [status, setStatus] = useState<ModuleStatus>('live')
  const [releaseAt, setReleaseAt] = useState('')

  const { data: modules } = api.courses.getModulesWithLessons.useQuery({ courseId })
  const createMutation = api.admin.createModule.useMutation()

  const nextOrder = modules ? modules.length : 0

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }

    if (status === 'scheduled' && !releaseAt) {
      alert('Please set a release date for scheduled modules')
      return
    }

    try {
      await createMutation.mutateAsync({
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        orderIndex: parseInt(orderIndex) || nextOrder,
        status,
        releaseAt: releaseAt || undefined,
      })

      router.back()
    } catch (error) {
      alert('Failed to create module')
    }
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>Add Module</H2>

        <YStack gap="$2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" value={title} onChangeText={setTitle} placeholder="Module title" />
        </YStack>

        <YStack gap="$2">
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            value={description}
            onChangeText={setDescription}
            placeholder="Module description"
            numberOfLines={4}
          />
        </YStack>

        <YStack gap="$2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            value={orderIndex}
            onChangeText={setOrderIndex}
            placeholder={`${nextOrder}`}
            keyboardType="numeric"
          />
          <Paragraph size="$2" theme="alt2">
            Current modules: {nextOrder}. Leave as {nextOrder} to add at end.
          </Paragraph>
        </YStack>

        {/* Status Selector */}
        <YStack gap="$2">
          <Label>Status</Label>
          <XStack gap="$2" flexWrap="wrap">
            <Button
              size="$3"
              theme={status === 'draft' ? 'active' : undefined}
              themeInverse={status === 'draft'}
              onPress={() => setStatus('draft')}
            >
              Draft
            </Button>
            <Button
              size="$3"
              theme={status === 'scheduled' ? 'active' : undefined}
              themeInverse={status === 'scheduled'}
              onPress={() => setStatus('scheduled')}
            >
              Scheduled
            </Button>
            <Button
              size="$3"
              theme={status === 'live' ? 'active' : undefined}
              themeInverse={status === 'live'}
              onPress={() => setStatus('live')}
            >
              Live
            </Button>
          </XStack>
          <Paragraph size="$2" theme="alt2">
            {status === 'draft' && 'Module is hidden from members'}
            {status === 'scheduled' && 'Module visible but locked until release date'}
            {status === 'live' && 'Module is visible and accessible to members'}
          </Paragraph>
        </YStack>

        {/* Release Date - only show for scheduled status */}
        {status === 'scheduled' && (
          <YStack gap="$2">
            <Label htmlFor="releaseAt">Release Date *</Label>
            <Input
              id="releaseAt"
              value={releaseAt ? new Date(releaseAt).toISOString().slice(0, 16) : ''}
              onChangeText={(val) => setReleaseAt(val ? new Date(val).toISOString() : '')}
              placeholder="YYYY-MM-DDTHH:MM"
            />
            <Paragraph size="$2" theme="alt2">
              When should this module become available? (Format: 2025-01-15T09:00)
            </Paragraph>
          </YStack>
        )}

        <XStack gap="$3" mt="$4">
          <Button f={1} onPress={() => router.back()}>
            Cancel
          </Button>
          <Button f={1} themeInverse onPress={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Adding...' : 'Add Module'}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
