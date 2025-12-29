import { H1, H2, H3, H4, Paragraph, Separator, YStack } from 'tamagui'
import { useMemo } from 'react'

interface MarkdownTextProps {
  children: string
  /** Size for paragraph text */
  size?: '$2' | '$3' | '$4' | '$5'
}

// Simple markdown-like parser
function parseMarkdown(content: string) {
  const lines = content.split('\n')
  const elements: Array<{ type: string; content: string }> = []

  lines.forEach((line) => {
    // Headers
    if (line.startsWith('#### ')) {
      elements.push({ type: 'h4', content: line.slice(5) })
    } else if (line.startsWith('### ')) {
      elements.push({ type: 'h3', content: line.slice(4) })
    } else if (line.startsWith('## ')) {
      elements.push({ type: 'h2', content: line.slice(3) })
    } else if (line.startsWith('# ')) {
      elements.push({ type: 'h1', content: line.slice(2) })
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
    // Regular paragraph - handle bold/italic
    else {
      elements.push({ type: 'paragraph', content: line })
    }
  })

  return elements
}

// Parse inline formatting (bold, italic)
function formatInlineText(text: string): string {
  // For now just strip the markdown, we could enhance this later with Text components
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1') // italic
    .replace(/__(.+?)__/g, '$1') // bold
    .replace(/_(.+?)_/g, '$1') // italic
}

/**
 * Strips markdown formatting from text, returning plain text.
 * Useful for excerpts and previews where you don't want markdown rendered.
 */
export function stripMarkdown(content: string): string {
  return content
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove list markers
    .replace(/^[-*]\s+/gm, '')
    // Remove separators
    .replace(/^---$/gm, '')
    // Collapse multiple newlines
    .replace(/\n{2,}/g, ' ')
    // Replace single newlines with space
    .replace(/\n/g, ' ')
    // Trim and collapse spaces
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Renders markdown-formatted text using Tamagui components.
 * Supports: headers (#, ##, ###, ####), lists (-, *), separators (---), and paragraphs.
 */
export function MarkdownText({ children, size = '$4' }: MarkdownTextProps) {
  const parsedContent = useMemo(() => parseMarkdown(children), [children])

  return (
    <YStack gap="$2">
      {parsedContent.map((element, index) => {
        const content = formatInlineText(element.content)

        switch (element.type) {
          case 'h1':
            return (
              <H1 key={index} size="$8" mt="$2">
                {content}
              </H1>
            )
          case 'h2':
            return (
              <H2 key={index} size="$7" mt="$2">
                {content}
              </H2>
            )
          case 'h3':
            return (
              <H3 key={index} size="$6" mt="$1">
                {content}
              </H3>
            )
          case 'h4':
            return (
              <H4 key={index} size="$5" mt="$1">
                {content}
              </H4>
            )
          case 'separator':
            return <Separator key={index} my="$2" />
          case 'list-item':
            return (
              <Paragraph key={index} size={size} pl="$3">
                • {content}
              </Paragraph>
            )
          case 'space':
            return <YStack key={index} h="$1" />
          case 'paragraph':
            return (
              <Paragraph key={index} size={size}>
                {content}
              </Paragraph>
            )
          default:
            return null
        }
      })}
    </YStack>
  )
}
