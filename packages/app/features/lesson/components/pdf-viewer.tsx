import { Button, Paragraph, YStack } from '@my/ui'
import { FileText } from '@tamagui/lucide-icons'
import { EXERCISE } from 'app/constants/copy'
import { Linking } from 'react-native'

interface PdfViewerProps {
  url: string
}

export function PdfViewer({ url }: PdfViewerProps) {
  const handleOpenExternal = () => {
    if (url) {
      Linking.openURL(url)
    }
  }

  return (
    <YStack f={1} jc="center" ai="center" p="$4" gap="$4" bg="$color2">
      <FileText size={64} color="$color11" />
      <Paragraph size="$5" ta="center" fontWeight="600">
        {EXERCISE.pdfViewerTitle}
      </Paragraph>
      <Paragraph theme="alt2" ta="center" maxWidth={300}>
        {EXERCISE.pdfViewerMessage}
      </Paragraph>
      <Button onPress={handleOpenExternal} icon={FileText} themeInverse>
        {EXERCISE.downloadGuide}
      </Button>
      {url && (
        <Paragraph size="$2" theme="alt2" ta="center" maxWidth={300} numberOfLines={2}>
          {url}
        </Paragraph>
      )}
    </YStack>
  )
}
