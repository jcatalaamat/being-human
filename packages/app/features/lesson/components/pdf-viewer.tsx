import { Button, Paragraph, YStack } from '@my/ui'
import { FileText } from '@tamagui/lucide-icons'
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
        PDF Viewer
      </Paragraph>
      <Paragraph theme="alt2" ta="center" maxWidth={300}>
        Native PDF viewer coming soon. For now, you can open the PDF in your browser.
      </Paragraph>
      <Button onPress={handleOpenExternal} icon={FileText} themeInverse>
        Open PDF
      </Button>
      {url && (
        <Paragraph size="$2" theme="alt2" ta="center" maxWidth={300} numberOfLines={2}>
          {url}
        </Paragraph>
      )}
    </YStack>
  )
}
