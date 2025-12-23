import { Button, Paragraph, YStack } from '@my/ui'
import { Play } from '@tamagui/lucide-icons'
import { Linking } from 'react-native'

interface VideoPlayerProps {
  url: string
  lessonId: string
  courseId: string
}

export function VideoPlayer({ url, lessonId, courseId }: VideoPlayerProps) {
  const handleOpenExternal = () => {
    if (url) {
      Linking.openURL(url)
    }
  }

  return (
    <YStack f={1} jc="center" ai="center" p="$4" gap="$4" bg="$color2">
      <Play size={64} color="$color11" />
      <Paragraph size="$5" ta="center" fontWeight="600">
        Video Player
      </Paragraph>
      <Paragraph theme="alt2" ta="center" maxWidth={300}>
        Native video player coming soon. For now, you can open the video in your browser.
      </Paragraph>
      <Button onPress={handleOpenExternal} icon={Play} themeInverse>
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
