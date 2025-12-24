import { Button, H2, Paragraph, ScrollView, YStack, XStack, Spinner } from '@my/ui'
import { Input, TextArea, Label } from 'tamagui'
import { ACTIONS } from 'app/constants/copy'
import { api } from 'app/utils/api'
import { useAppRouter } from 'app/utils/navigation'
import { useState, useEffect } from 'react'

interface EditModuleScreenProps {
  courseId: string
  moduleId: string
}

export function EditModuleScreen({ courseId, moduleId }: EditModuleScreenProps) {
  const router = useAppRouter()
  const { data: modules, isLoading } = api.courses.getModulesWithLessons.useQuery({ courseId })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [orderIndex, setOrderIndex] = useState('0')

  const updateMutation = api.admin.updateModule.useMutation()

  const currentModule = modules?.find((m) => m.id === moduleId)

  // Populate form when module loads
  useEffect(() => {
    if (currentModule) {
      setTitle(currentModule.title || '')
      setDescription(currentModule.description || '')
      setOrderIndex(String(currentModule.orderIndex ?? 0))
    }
  }, [currentModule])

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Title is required')
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: moduleId,
        title: title.trim(),
        description: description.trim() || undefined,
        orderIndex: parseInt(orderIndex) || 0,
      })

      router.back()
    } catch (error) {
      alert('Failed to update module')
    }
  }

  if (isLoading) {
    return (
      <YStack f={1} ai="center" jc="center">
        <Spinner />
      </YStack>
    )
  }

  if (!currentModule) {
    return (
      <YStack f={1} ai="center" jc="center">
        <Paragraph>Module not found</Paragraph>
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" gap="$4">
        <H2>Edit Module</H2>

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
            placeholder="0"
            keyboardType="numeric"
          />
          <Paragraph size="$2" theme="alt2">
            Modules are sorted by order index (0 = first)
          </Paragraph>
        </YStack>

        <XStack gap="$3" mt="$4">
          <Button f={1} onPress={() => router.back()}>
            {ACTIONS.cancel}
          </Button>
          <Button f={1} themeInverse onPress={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : ACTIONS.save}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  )
}
