import { Button, Paragraph, Slider, XStack, YStack } from '@my/ui'
import { Headphones, Pause, Play, RotateCcw, RotateCw } from '@tamagui/lucide-icons'
import { useCallback, useEffect, useRef, useState } from 'react'

import { usePlaybackProgress } from '../../hooks/usePlaybackProgress'
import type { AudioPlayerProps } from './types'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPlayer({ url, lessonId, courseId, initialPositionSec = 0 }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { updatePosition, onPlay, onPause, onSeek } = usePlaybackProgress({
    lessonId,
    courseId,
  })

  // Set initial position when audio is loaded
  useEffect(() => {
    if (audioRef.current && isReady && initialPositionSec > 0) {
      audioRef.current.currentTime = initialPositionSec
    }
  }, [isReady, initialPositionSec])

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      setIsReady(true)
    }
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime
      setCurrentTime(time)
      updatePosition(time)
    }
  }, [updatePosition])

  const handlePlay = useCallback(() => {
    setIsPlaying(true)
    onPlay()
  }, [onPlay])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
    onPause()
  }, [onPause])

  const handleError = useCallback(() => {
    setError('Failed to load audio. Please check the URL.')
  }, [])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }, [isPlaying])

  const handleSeek = useCallback(
    (value: number[]) => {
      if (!audioRef.current) return
      const newTime = value[0] ?? 0
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
      onSeek(newTime)
    },
    [onSeek]
  )

  const skipBack = useCallback(() => {
    if (!audioRef.current) return
    const newTime = Math.max(0, audioRef.current.currentTime - 15)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
    onSeek(newTime)
  }, [onSeek])

  const skipForward = useCallback(() => {
    if (!audioRef.current) return
    const newTime = Math.min(duration, audioRef.current.currentTime + 15)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
    onSeek(newTime)
  }, [duration, onSeek])

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
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={url}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        style={{ display: 'none' }}
      />

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
