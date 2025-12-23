import { Paragraph, ScrollView, YStack, H1, H2, H3, H4, Separator } from '@my/ui'
import { useMemo } from 'react'

interface TextContentProps {
  content: string
}

// Simple markdown-like parser
function parseMarkdown(content: string) {
  const lines = content.split('\n')
  const elements: Array<{ type: string; content: string; level?: number }> = []

  lines.forEach((line) => {
    // Headers
    if (line.startsWith('### ')) {
      elements.push({ type: 'h3', content: line.slice(4) })
    } else if (line.startsWith('## ')) {
      elements.push({ type: 'h2', content: line.slice(3) })
    } else if (line.startsWith('# ')) {
      elements.push({ type: 'h1', content: line.slice(2) })
    }
    // Code blocks (just show as is for now)
    else if (line.startsWith('```')) {
      elements.push({ type: 'code-fence', content: line })
    }
    // Lists
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push({ type: 'list-item', content: line.slice(2) })
    }
    // Separator
    else if (line.trim() === '---') {
      elements.push({ type: 'separator', content: '' })
    }
    // Empty lines
    else if (line.trim() === '') {
      elements.push({ type: 'space', content: '' })
    }
    // Regular paragraph
    else {
      elements.push({ type: 'paragraph', content: line })
    }
  })

  return elements
}

export function TextContent({ content }: TextContentProps) {
  const parsedContent = useMemo(() => parseMarkdown(content), [content])

  return (
    <ScrollView>
      <YStack p="$4" gap="$3">
        {parsedContent.map((element, index) => {
          switch (element.type) {
            case 'h1':
              return (
                <H1 key={index} size="$8" mt="$4">
                  {element.content}
                </H1>
              )
            case 'h2':
              return (
                <H2 key={index} size="$7" mt="$3">
                  {element.content}
                </H2>
              )
            case 'h3':
              return (
                <H3 key={index} size="$6" mt="$2">
                  {element.content}
                </H3>
              )
            case 'h4':
              return (
                <H4 key={index} size="$5" mt="$2">
                  {element.content}
                </H4>
              )
            case 'separator':
              return <Separator key={index} my="$3" />
            case 'list-item':
              return (
                <Paragraph key={index} pl="$4">
                  • {element.content}
                </Paragraph>
              )
            case 'code-fence':
              return (
                <Paragraph key={index} fontFamily="$mono" bg="$color3" p="$2" br="$2">
                  {element.content}
                </Paragraph>
              )
            case 'space':
              return <YStack key={index} h="$1" />
            case 'paragraph':
              return (
                <Paragraph key={index} size="$4" lineHeight="$4">
                  {element.content}
                </Paragraph>
              )
            default:
              return null
          }
        })}
      </YStack>
    </ScrollView>
  )
}
