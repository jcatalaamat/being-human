import { Button, Paragraph, Slider, XStack, YStack } from '@my/ui'
import { Headphones, Pause, Play, RotateCcw, RotateCw } from '@tamagui/lucide-icons'
import { Audio, type AVPlaybackStatus } from 'expo-av'
import { useCallback, useEffect, useRef, useState } from 'react'

import { usePlaybackProgress } from '../../hooks/usePlaybackProgress'
import type { AudioPlayerProps } from './types'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPlayer({ url, lessonId, courseId, initialPositionSec = 0 }: AudioPlayerProps) {
  const soundRef = useRef<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { updatePosition, onPlay, onPause, onSeek } = usePlaybackProgress({
    lessonId,
    courseId,
  })

  // Initialize audio
  useEffect(() => {
    let isMounted = true

    async function loadAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        })

        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { positionMillis: initialPositionSec * 1000 },
          (status) => {
            if (!isMounted) return
            handlePlaybackStatusUpdate(status)
          }
        )

        if (isMounted) {
          soundRef.current = sound
          setIsReady(true)
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load audio')
        }
      }
    }

    loadAudio()

    return () => {
      isMounted = false
      soundRef.current?.unloadAsync()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (status.error) {
          setError(status.error)
        }
        return
      }

      setDuration((status.durationMillis ?? 0) / 1000)
      setCurrentTime((status.positionMillis ?? 0) / 1000)
      setIsPlaying(status.isPlaying)

      if (status.isPlaying) {
        updatePosition(status.positionMillis / 1000)
      }
    },
    [updatePosition]
  )

  const togglePlay = useCallback(async () => {
    if (!soundRef.current) return
    if (isPlaying) {
      await soundRef.current.pauseAsync()
      onPause()
    } else {
      await soundRef.current.playAsync()
      onPlay()
    }
  }, [isPlaying, onPlay, onPause])

  const handleSeek = useCallback(
    async (value: number[]) => {
      if (!soundRef.current) return
      const newTime = value[0] ?? 0
      await soundRef.current.setPositionAsync(newTime * 1000)
      onSeek(newTime)
    },
    [onSeek]
  )

  const skipBack = useCallback(async () => {
    if (!soundRef.current) return
    const newTime = Math.max(0, currentTime - 15)
    await soundRef.current.setPositionAsync(newTime * 1000)
    onSeek(newTime)
  }, [currentTime, onSeek])

  const skipForward = useCallback(async () => {
    if (!soundRef.current) return
    const newTime = Math.min(duration, currentTime + 15)
    await soundRef.current.setPositionAsync(newTime * 1000)
    onSeek(newTime)
  }, [currentTime, duration, onSeek])

  if (error) {
    return (
      <YStack f={1} jc="center" ai="center" p="$4" gap="$4" bg="$color2">
        <Headphones size={64} color="$color11" />
        <Paragraph size="$5" ta="center" fontWeight="600">
          Audio Unavailable
        </Paragraph>
        <Paragraph theme="alt2" ta="center" maxWidth={300}>
          {error}
        </Paragraph>
      </YStack>
    )
  }

  return (
    <YStack f={1} jc="center" ai="center" p="$4" gap="$6" bg="$color2">
      {/* Visual placeholder */}
      <YStack
        w={200}
        h={200}
        br="$10"
        bg="$color4"
        jc="center"
        ai="center"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.1}
        shadowRadius={12}
      >
        <Headphones size={80} color="$color11" />
      </YStack>

      {/* Time display */}
      <YStack ai="center" gap="$2">
        <Paragraph size="$8" fontWeight="600">
          {formatTime(currentTime)}
        </Paragraph>
        <Paragraph size="$3" theme="alt2">
          / {formatTime(duration)}
        </Paragraph>
      </YStack>

      {/* Progress bar */}
      <YStack w="100%" maxWidth={400} px="$4">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
        >
          <Slider.Track bg="$color5" h={6}>
            <Slider.TrackActive bg="$color10" />
          </Slider.Track>
          <Slider.Thumb index={0} circular size="$1.5" bg="$color12" />
        </Slider>
      </YStack>

      {/* Control buttons */}
      <XStack gap="$4" ai="center">
        <Button size="$5" circular chromeless onPress={skipBack} icon={RotateCcw}>
          <Paragraph size="$1" position="absolute" bottom={-4}>
            15
          </Paragraph>
        </Button>

        <Button
          size="$6"
          circular
          themeInverse
          onPress={togglePlay}
          icon={isPlaying ? Pause : Play}
        />

        <Button size="$5" circular chromeless onPress={skipForward} icon={RotateCw}>
          <Paragraph size="$1" position="absolute" bottom={-4}>
            15
          </Paragraph>
        </Button>
      </XStack>
    </YStack>
  )
}
