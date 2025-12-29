import {
  AlertDialog,
  Button,
  FormSheet,
  Input,
  Paragraph,
  SizableText,
  Switch,
  TextArea,
  XStack,
  YStack,
  useToastController,
} from '@my/ui'
import { Plus, Trash } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useEffect, useState } from 'react'

interface PromptField {
  id: string
  type: 'text' | 'textarea' | 'markdown'
  label: string
  placeholder?: string
  required?: boolean
}

interface PromptFormData {
  title: string
  promptBody: string
  responseSchema: PromptField[]
  required: boolean
}

const initialFormData: PromptFormData = {
  title: '',
  promptBody: '',
  responseSchema: [
    {
      id: 'response',
      type: 'textarea',
      label: 'Your Response',
      placeholder: 'Write your response here...',
      required: true,
    },
  ],
  required: false,
}

interface PromptType {
  id: string
  title: string
  promptBody: string
  responseSchema: PromptField[]
  required: boolean
}

interface PromptFormSheetProps {
  lessonId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPrompt?: PromptType | null
  onSuccess?: () => void
}

export function PromptFormSheet({
  lessonId,
  open,
  onOpenChange,
  editingPrompt,
  onSuccess,
}: PromptFormSheetProps) {
  const toast = useToastController()
  const utils = api.useUtils()

  const [formData, setFormData] = useState<PromptFormData>(initialFormData)

  const createMutation = api.prompts.createPrompt.useMutation({
    onSuccess: () => {
      toast.show('Prompt created')
      onOpenChange(false)
      setFormData(initialFormData)
      utils.prompts.getForLesson.invalidate({ lessonId })
      onSuccess?.()
    },
    onError: (error) => {
      toast.show(error.message)
    },
  })

  const updateMutation = api.prompts.updatePrompt.useMutation({
    onSuccess: () => {
      toast.show('Prompt updated')
      onOpenChange(false)
      setFormData(initialFormData)
      utils.prompts.getForLesson.invalidate({ lessonId })
      onSuccess?.()
    },
    onError: (error) => {
      toast.show(error.message)
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (editingPrompt) {
      setFormData({
        title: editingPrompt.title,
        promptBody: editingPrompt.promptBody,
        responseSchema: editingPrompt.responseSchema,
        required: editingPrompt.required,
      })
    } else {
      setFormData(initialFormData)
    }
  }, [editingPrompt])

  const handleClose = () => {
    onOpenChange(false)
    setFormData(initialFormData)
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.show('Title is required')
      return
    }

    if (!formData.promptBody.trim()) {
      toast.show('Prompt body is required')
      return
    }

    if (formData.responseSchema.length === 0) {
      toast.show('At least one response field is required')
      return
    }

    // Validate all fields have labels
    for (const field of formData.responseSchema) {
      if (!field.label.trim()) {
        toast.show('All fields must have a label')
        return
      }
    }

    if (editingPrompt) {
      updateMutation.mutate({
        id: editingPrompt.id,
        title: formData.title.trim(),
        promptBody: formData.promptBody.trim(),
        responseSchema: formData.responseSchema,
        required: formData.required,
      })
    } else {
      createMutation.mutate({
        lessonId,
        title: formData.title.trim(),
        promptBody: formData.promptBody.trim(),
        responseSchema: formData.responseSchema,
        required: formData.required,
      })
    }
  }

  const addField = () => {
    const newField: PromptField = {
      id: `field_${Date.now()}`,
      type: 'textarea',
      label: '',
      placeholder: '',
      required: false,
    }
    setFormData((f) => ({
      ...f,
      responseSchema: [...f.responseSchema, newField],
    }))
  }

  const removeField = (fieldId: string) => {
    setFormData((f) => ({
      ...f,
      responseSchema: f.responseSchema.filter((field) => field.id !== fieldId),
    }))
  }

  const updateField = (fieldId: string, updates: Partial<PromptField>) => {
    setFormData((f) => ({
      ...f,
      responseSchema: f.responseSchema.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }))
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isEditing = !!editingPrompt

  return (
    <FormSheet
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleClose()}
      title={isEditing ? 'Edit Prompt' : 'New Prompt'}
    >
      <YStack gap="$4">
        {/* Title */}
        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Title <SizableText color="$red10">*</SizableText>
          </Paragraph>
          <Input
            placeholder="e.g., Reflection Exercise"
            value={formData.title}
            onChangeText={(v) => setFormData((f) => ({ ...f, title: v }))}
          />
        </YStack>

        {/* Prompt Body */}
        <YStack gap="$2">
          <Paragraph size="$2" fontWeight="500">
            Instructions <SizableText color="$red10">*</SizableText>
          </Paragraph>
          <TextArea
            placeholder="Write the prompt instructions for the member..."
            value={formData.promptBody}
            onChangeText={(v) => setFormData((f) => ({ ...f, promptBody: v }))}
            minHeight={100}
          />
          <Paragraph size="$1" theme="alt2">
            Supports markdown formatting
          </Paragraph>
        </YStack>

        {/* Required Toggle */}
        <XStack gap="$3" ai="center" jc="space-between">
          <YStack>
            <Paragraph size="$2" fontWeight="500">
              Required Assignment
            </Paragraph>
            <Paragraph size="$1" theme="alt2">
              Members must complete this to progress
            </Paragraph>
          </YStack>
          <Switch
            checked={formData.required}
            onCheckedChange={(checked) =>
              setFormData((f) => ({ ...f, required: checked }))
            }
          >
            <Switch.Thumb animation="quick" />
          </Switch>
        </XStack>

        {/* Response Fields */}
        <YStack gap="$3">
          <XStack jc="space-between" ai="center">
            <Paragraph size="$2" fontWeight="500">
              Response Fields
            </Paragraph>
            <Button size="$2" icon={Plus} onPress={addField}>
              Add Field
            </Button>
          </XStack>

          {formData.responseSchema.map((field, index) => (
            <YStack
              key={field.id}
              gap="$2"
              p="$3"
              bg="$color3"
              borderRadius="$3"
            >
              <XStack jc="space-between" ai="center">
                <Paragraph size="$2" fontWeight="500">
                  Field {index + 1}
                </Paragraph>
                {formData.responseSchema.length > 1 && (
                  <Button
                    size="$2"
                    chromeless
                    icon={Trash}
                    theme="red"
                    onPress={() => removeField(field.id)}
                  />
                )}
              </XStack>

              <Input
                placeholder="Field label (e.g., Your Reflection)"
                value={field.label}
                onChangeText={(v) => updateField(field.id, { label: v })}
              />

              <XStack gap="$2" flexWrap="wrap">
                {(['text', 'textarea', 'markdown'] as const).map((type) => (
                  <Button
                    key={type}
                    size="$2"
                    theme={field.type === type ? 'active' : undefined}
                    themeInverse={field.type === type}
                    onPress={() => updateField(field.id, { type })}
                  >
                    {type === 'text' ? 'Short' : type === 'textarea' ? 'Long' : 'Rich'}
                  </Button>
                ))}
              </XStack>

              <XStack ai="center" jc="space-between">
                <Paragraph size="$2">Required</Paragraph>
                <Switch
                  size="$2"
                  checked={field.required || false}
                  onCheckedChange={(checked) =>
                    updateField(field.id, { required: checked })
                  }
                >
                  <Switch.Thumb animation="quick" />
                </Switch>
              </XStack>

              <Input
                placeholder="Placeholder text (optional)"
                value={field.placeholder || ''}
                onChangeText={(v) => updateField(field.id, { placeholder: v })}
              />
            </YStack>
          ))}
        </YStack>

        {/* Submit Button */}
        <Button themeInverse size="$4" onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? 'Saving...'
              : 'Creating...'
            : isEditing
              ? 'Save Changes'
              : 'Create Prompt'}
        </Button>
      </YStack>
    </FormSheet>
  )
}

// Delete confirmation dialog component
interface DeletePromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading: boolean
}

export function DeletePromptDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeletePromptDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animation="quick"
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          p="$4"
          gap="$4"
          maw={400}
        >
          <AlertDialog.Title>Delete Prompt</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete this prompt? This will also delete all
            member responses. This action cannot be undone.
          </AlertDialog.Description>
          <XStack gap="$3" jc="flex-end">
            <AlertDialog.Cancel asChild>
              <Button>Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button theme="red" onPress={onConfirm} disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialog.Action>
          </XStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  )
}
