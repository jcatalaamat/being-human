import { Button, Paragraph, XStack, YStack } from '@my/ui'
import { Download, FileText } from '@tamagui/lucide-icons'
import { useState } from 'react'
import { Linking } from 'react-native'
import { WebView } from 'react-native-webview'

import type { PdfViewerProps } from './types'

export function PdfViewer({ url }: PdfViewerProps) {
  const [error, setError] = useState(false)

  // Use Google Docs viewer for inline PDF display
  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`

  const handleDownload = () => {
    Linking.openURL(url)
  }

  if (error || !url) {
    return (
      <YStack f={1} jc="center" ai="center" p="$4" gap="$4" bg="$color2">
        <FileText size={64} color="$color11" />
        <Paragraph size="$5" ta="center" fontWeight="600">
          PDF Unavailable
        </Paragraph>
        <Paragraph theme="alt2" ta="center" maxWidth={300}>
          Unable to display the PDF. You can try opening it in your browser.
        </Paragraph>
        {url && (
          <Button onPress={handleDownload} icon={Download} themeInverse>
            Open in Browser
          </Button>
        )}
      </YStack>
    )
  }

  return (
    <YStack f={1} bg="$color1">
      {/* Toolbar */}
      <XStack p="$3" bg="$color2" borderBottomWidth={1} borderColor="$borderColor" jc="flex-end">
        <Button size="$3" icon={Download} onPress={handleDownload}>
          Open in Browser
        </Button>
      </XStack>

      {/* PDF WebView */}
      <YStack f={1}>
        <WebView
          source={{ uri: googleDocsUrl }}
          style={{ flex: 1 }}
          onError={() => setError(true)}
          onHttpError={() => setError(true)}
          startInLoadingState
          javaScriptEnabled
        />
      </YStack>
    </YStack>
  )
}
