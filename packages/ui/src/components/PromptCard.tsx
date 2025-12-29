import { CheckCircle, Edit3 } from '@tamagui/lucide-icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Avatar, Button, Card, H5, Input, Paragraph, TextArea, XStack, YStack } from 'tamagui'

export interface PromptField {
  id: string
  type: 'text' | 'textarea' | 'markdown'
  label: string
  placeholder?: string
  required?: boolean
}

export interface PromptFeedback {
  id: string
  body: string
  createdAt: string
  author: {
    name: string | null
    avatarUrl: string | null
  }
}

export interface PromptCardProps {
  id: string
  title: string
  promptBody: string
  fields: PromptField[]
  required: boolean
  initialData?: Record<string, string>
  status?: 'draft' | 'submitted' | 'reviewed'
  feedback?: PromptFeedback[]
  onSave?: (data: Record<string, string>) => void
  onSubmit?: (data: Record<string, string>) => void
  isLoading?: boolean
  autosaveDelay?: number
}

export const PromptCard = ({
  title,
  promptBody,
  fields,
  required,
  initialData = {},
  status = 'draft',
  feedback = [],
  onSave,
  onSubmit,
  isLoading = false,
  autosaveDelay = 2000,
}: PromptCardProps) => {
  const [data, setData] = useState<Record<string, string>>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>()

  const handleChange = useCallback((fieldId: string, value: string) => {
    setData((prev) => ({ ...prev, [fieldId]: value }))
    setIsDirty(true)
  }, [])

  // Autosave effect
  useEffect(() => {
    if (!isDirty || status === 'submitted' || status === 'reviewed') return

    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current)
    }

    autosaveTimer.current = setTimeout(() => {
      onSave?.(data)
      setIsDirty(false)
    }, autosaveDelay)

    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current)
      }
    }
  }, [data, isDirty, onSave, autosaveDelay, status])

  const handleSubmit = () => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current)
    }
    onSubmit?.(data)
  }

  const isSubmitted = status === 'submitted' || status === 'reviewed'

  return (
    <Card bordered bg="$color2" p="$4">
      <YStack gap="$4">
        <XStack gap="$2" ai="center">
          {isSubmitted ? (
            <CheckCircle size={20} color="$green10" />
          ) : (
            <Edit3 size={20} color={required ? '$orange10' : '$purple10'} />
          )}
          <H5 f={1}>{title}</H5>
          {required && !isSubmitted && (
            <Paragraph size="$2" color="$orange10">
              Required
            </Paragraph>
          )}
        </XStack>

        {promptBody && (
          <Paragraph size="$3" theme="alt1">
            {promptBody}
          </Paragraph>
        )}

        <YStack gap="$3">
          {fields.map((field) => (
            <YStack key={field.id} gap="$1">
              <XStack gap="$1">
                <Paragraph size="$2" fontWeight="500">
                  {field.label}
                </Paragraph>
                {field.required && (
                  <Paragraph size="$2" color="$red10">
                    *
                  </Paragraph>
                )}
              </XStack>

              {field.type === 'text' ? (
                <Input
                  placeholder={field.placeholder}
                  value={data[field.id] || ''}
                  onChangeText={(v) => handleChange(field.id, v)}
                  disabled={isSubmitted}
                />
              ) : (
                <TextArea
                  placeholder={field.placeholder}
                  value={data[field.id] || ''}
                  onChangeText={(v) => handleChange(field.id, v)}
                  minHeight={field.type === 'markdown' ? 200 : 100}
                  disabled={isSubmitted}
                />
              )}
            </YStack>
          ))}
        </YStack>

        {feedback.length > 0 && (
          <YStack gap="$3" bg="$green3" br="$3" p="$3">
            <Paragraph size="$2" fontWeight="600" color="$green11">
              Instructor Feedback
            </Paragraph>
            {feedback.map((f) => (
              <XStack key={f.id} gap="$2" ai="flex-start">
                <Avatar circular size="$2">
                  {f.author.avatarUrl ? (
                    <Avatar.Image source={{ uri: f.author.avatarUrl }} />
                  ) : (
                    <Avatar.Fallback bg="$purple5" />
                  )}
                </Avatar>
                <YStack f={1} gap="$1">
                  <XStack gap="$2" ai="center">
                    <Paragraph size="$2" fontWeight="500">
                      {f.author.name || 'Instructor'}
                    </Paragraph>
                    <Paragraph size="$1" theme="alt2">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </Paragraph>
                  </XStack>
                  <Paragraph size="$3">{f.body}</Paragraph>
                </YStack>
              </XStack>
            ))}
          </YStack>
        )}

        {!isSubmitted && (
          <XStack jc="flex-end" gap="$2" ai="center">
            {isDirty && (
              <Paragraph size="$2" theme="alt2">
                Saving...
              </Paragraph>
            )}
            <Button themeInverse onPress={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </XStack>
        )}

        {isSubmitted && (
          <XStack gap="$2" ai="center">
            <CheckCircle size={16} color="$green10" />
            <Paragraph size="$2" color="$green10">
              {status === 'reviewed' ? 'Reviewed' : 'Submitted'}
            </Paragraph>
          </XStack>
        )}
      </YStack>
    </Card>
  )
}
