import { Button, Paragraph, YStack } from '@my/ui'
import { Headphones } from '@tamagui/lucide-icons'
import { Linking } from 'react-native'

interface AudioPlayerProps {
  url: string
  lessonId: string
  courseId: string
}

export function AudioPlayer({ url, lessonId, courseId }: AudioPlayerProps) {
  const handleOpenExternal = () => {
    if (url) {
      Linking.openURL(url)
    }
  }

  return (
    <YStack f={1} jc="center" ai="center" p="$4" gap="$4" bg="$color2">
      <Headphones size={64} color="$color11" />
      <Paragraph size="$5" ta="center" fontWeight="600">
        Audio Player
      </Paragraph>
      <Paragraph theme="alt2" ta="center" maxWidth={300}>
        Native audio player coming soon. For now, you can open the audio in your browser.
      </Paragraph>
      <Button onPress={handleOpenExternal} icon={Headphones} themeInverse>
        Open in Browser
      </Button>
      {url && (
        <Paragraph size="$2" theme="alt2" ta="center" maxWidth={300} numberOfLines={2}>
          {url}
        </Paragraph>
      )}
    </YStack>
  )
}
