import { Button, Paragraph, Slider, XStack, YStack } from '@my/ui'
import { Maximize, Pause, Play, Volume2, VolumeX } from '@tamagui/lucide-icons'
import { ResizeMode, Video, type AVPlaybackStatus } from 'expo-av'
import { useCallback, useRef, useState } from 'react'

import { usePlaybackProgress } from '../../hooks/usePlaybackProgress'
import type { VideoPlayerProps } from './types'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function VideoPlayer({ url, lessonId, courseId, initialPositionSec = 0 }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const { updatePosition, onPlay, onPause, onSeek } = usePlaybackProgress({
    lessonId,
    courseId,
  })

  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (status.error) {
          setError(status.error)
        }
        return
      }

      setIsReady(true)
      setDuration(Math.round((status.durationMillis ?? 0) / 1000))
      setCurrentTime(Math.round((status.positionMillis ?? 0) / 1000))
      setIsPlaying(status.isPlaying)
      setIsMuted(status.isMuted)

      if (status.isPlaying && status.positionMillis) {
        updatePosition(Math.round(status.positionMillis / 1000))
      }
    },
    [updatePosition]
  )

  const handleLoad = useCallback(async () => {
    if (videoRef.current && initialPositionSec > 0) {
      // Use Math.round to avoid precision issues
      await videoRef.current.setPositionAsync(Math.round(initialPositionSec) * 1000)
    }
  }, [initialPositionSec])

  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return
    if (isPlaying) {
      await videoRef.current.pauseAsync()
      onPause()
    } else {
      await videoRef.current.playAsync()
      onPlay()
    }
  }, [isPlaying, onPlay, onPause])

  const toggleMute = useCallback(async () => {
    if (!videoRef.current) return
    await videoRef.current.setIsMutedAsync(!isMuted)
  }, [isMuted])

  const handleSeek = useCallback(
    async (value: number[]) => {
      if (!videoRef.current) return
      const newTime = Math.round(value[0] ?? 0)
      await videoRef.current.setPositionAsync(newTime * 1000)
      onSeek(newTime)
    },
    [onSeek]
  )

  const toggleFullscreen = useCallback(async () => {
    if (!videoRef.current) return
    if (isFullscreen) {
      await videoRef.current.dismissFullscreenPlayer()
    } else {
      await videoRef.current.presentFullscreenPlayer()
    }
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  if (error) {
    return (
      <YStack f={1} jc="center" ai="center" p="$4" gap="$4" bg="$color2">
        <Play size={64} color="$color11" />
        <Paragraph size="$5" ta="center" fontWeight="600">
          Video Unavailable
        </Paragraph>
        <Paragraph theme="alt2" ta="center" maxWidth={300}>
          {error}
        </Paragraph>
      </YStack>
    )
  }

  return (
    <YStack f={1} bg="$color1">
      {/* Video Element */}
      <YStack f={1} jc="center" ai="center">
        <Video
          ref={videoRef}
          source={{ uri: url }}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onLoad={handleLoad}
          useNativeControls={false}
        />

        {/* Click to play/pause overlay */}
        {!isPlaying && isReady && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            jc="center"
            ai="center"
            onPress={togglePlay}
          >
            <YStack bg="$color1" p="$4" br="$10" o={0.8}>
              <Play size={48} color="$color12" />
            </YStack>
          </YStack>
        )}
      </YStack>

      {/* Controls */}
      <YStack p="$3" gap="$2" bg="$color2" borderTopWidth={1} borderColor="$borderColor">
        {/* Progress bar */}
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
        >
          <Slider.Track bg="$color5" h={4}>
            <Slider.TrackActive bg="$color10" />
          </Slider.Track>
          <Slider.Thumb index={0} circular size="$1" bg="$color12" />
        </Slider>

        {/* Control buttons */}
        <XStack jc="space-between" ai="center">
          <XStack gap="$2" ai="center">
            <Button
              size="$3"
              circular
              chromeless
              onPress={togglePlay}
              icon={isPlaying ? Pause : Play}
            />
            <Button
              size="$3"
              circular
              chromeless
              onPress={toggleMute}
              icon={isMuted ? VolumeX : Volume2}
            />
            <Paragraph size="$2" theme="alt2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </Paragraph>
          </XStack>

          <Button size="$3" circular chromeless onPress={toggleFullscreen} icon={Maximize} />
        </XStack>
      </YStack>
    </YStack>
  )
}
