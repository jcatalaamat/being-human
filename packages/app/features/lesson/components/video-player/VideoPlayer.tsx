import { Button, Paragraph, Slider, XStack, YStack } from '@my/ui'
import { Maximize, Pause, Play, Volume2, VolumeX } from '@tamagui/lucide-icons'
import { useCallback, useEffect, useRef, useState } from 'react'

import { usePlaybackProgress } from '../../hooks/usePlaybackProgress'
import type { VideoPlayerProps } from './types'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function VideoPlayer({ url, lessonId, courseId, initialPositionSec = 0 }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { updatePosition, onPlay, onPause, onSeek } = usePlaybackProgress({
    lessonId,
    courseId,
  })

  // Set initial position when video is loaded
  useEffect(() => {
    if (videoRef.current && isReady && initialPositionSec > 0) {
      videoRef.current.currentTime = initialPositionSec
    }
  }, [isReady, initialPositionSec])

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setIsReady(true)
    }
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
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
    setError('Failed to load video. Please check the URL.')
  }, [])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  const handleSeek = useCallback(
    (value: number[]) => {
      if (!videoRef.current) return
      const newTime = value[0] ?? 0
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      onSeek(newTime)
    },
    [onSeek]
  )

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current.requestFullscreen()
    }
  }, [])

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
    <YStack f={1} bg="$color1" ref={containerRef as any}>
      {/* Video Element */}
      <YStack f={1} jc="center" ai="center" position="relative">
        <video
          ref={videoRef}
          src={url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: '#000',
          }}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onError={handleError}
          playsInline
        />

        {/* Click to play/pause overlay */}
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          jc="center"
          ai="center"
          onPress={togglePlay}
          cursor="pointer"
        >
          {!isPlaying && isReady && (
            <YStack bg="$color1" p="$4" br="$10" o={0.8}>
              <Play size={48} color="$color12" />
            </YStack>
          )}
        </YStack>
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

          <Button size="$3" circular chromeless onPress={handleFullscreen} icon={Maximize} />
        </XStack>
      </YStack>
    </YStack>
  )
}
