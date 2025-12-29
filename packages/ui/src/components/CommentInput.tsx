import { Send } from '@tamagui/lucide-icons'
import { useState } from 'react'
import { Button, TextArea, XStack } from 'tamagui'

export interface CommentInputProps {
  onSubmit: (body: string) => void
  isLoading?: boolean
  placeholder?: string
}

export const CommentInput = ({
  onSubmit,
  isLoading = false,
  placeholder = 'Write a comment...',
}: CommentInputProps) => {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return
    onSubmit(value.trim())
    setValue('')
  }

  return (
    <XStack gap="$2" ai="flex-end">
      <TextArea
        f={1}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        minHeight={80}
        disabled={isLoading}
      />
      <Button
        size="$3"
        icon={Send}
        themeInverse
        disabled={!value.trim() || isLoading}
        onPress={handleSubmit}
      >
        Send
      </Button>
    </XStack>
  )
}
