import { useCallback, useEffect, useRef } from 'react'
import { api } from 'app/utils/api'

interface UsePlaybackProgressOptions {
  lessonId: string
  courseId: string
  enabled?: boolean
  saveIntervalMs?: number
}

/**
 * Hook to save playback position periodically.
 * Saves every 5 seconds (configurable), on pause, and on unmount.
 * Debounces saves to avoid excessive API calls.
 */
export function usePlaybackProgress({
  lessonId,
  courseId,
  enabled = true,
  saveIntervalMs = 5000,
}: UsePlaybackProgressOptions) {
  const lastSavedPosition = useRef<number>(0)
  const currentPosition = useRef<number>(0)
  const isPlaying = useRef<boolean>(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mutation = api.progress.updatePlaybackPosition.useMutation()

  const savePosition = useCallback(
    (positionSec: number, force = false) => {
      // Don't save if disabled or position hasn't changed significantly (< 1 second)
      if (!enabled) return
      if (!force && Math.abs(positionSec - lastSavedPosition.current) < 1) return

      lastSavedPosition.current = positionSec
      mutation.mutate({ lessonId, courseId, positionSec })
    },
    [enabled, lessonId, courseId, mutation]
  )

  // Set up periodic saving while playing
  useEffect(() => {
    if (!enabled || !isPlaying.current) return

    const intervalId = setInterval(() => {
      if (isPlaying.current && currentPosition.current > 0) {
        savePosition(currentPosition.current)
      }
    }, saveIntervalMs)

    return () => clearInterval(intervalId)
  }, [enabled, saveIntervalMs, savePosition])

  // Save on unmount
  useEffect(() => {
    return () => {
      if (currentPosition.current > 0 && enabled) {
        // Use mutate directly for cleanup - don't rely on state
        mutation.mutate({
          lessonId,
          courseId,
          positionSec: currentPosition.current,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, courseId])

  const updatePosition = useCallback((positionSec: number) => {
    currentPosition.current = positionSec
  }, [])

  const onPlay = useCallback(() => {
    isPlaying.current = true
  }, [])

  const onPause = useCallback(() => {
    isPlaying.current = false
    // Save immediately on pause
    if (currentPosition.current > 0) {
      savePosition(currentPosition.current, true)
    }
  }, [savePosition])

  const onSeek = useCallback(
    (positionSec: number) => {
      currentPosition.current = positionSec
      // Debounce seek saves
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        savePosition(positionSec)
      }, 1000)
    },
    [savePosition]
  )

  return {
    updatePosition,
    onPlay,
    onPause,
    onSeek,
    isSaving: mutation.isPending,
  }
}
