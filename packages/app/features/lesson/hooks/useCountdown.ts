import { useEffect, useState } from 'react'

interface CountdownResult {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  totalSeconds: number
}

/**
 * Hook for countdown timer to a target date.
 * Updates every second while countdown is active.
 */
export function useCountdown(targetDate: Date | string | null): CountdownResult {
  const [countdown, setCountdown] = useState<CountdownResult>(() => calculateCountdown(targetDate))

  useEffect(() => {
    if (!targetDate) {
      setCountdown({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        totalSeconds: 0,
      })
      return
    }

    // Update immediately
    setCountdown(calculateCountdown(targetDate))

    // Update every second
    const intervalId = setInterval(() => {
      const result = calculateCountdown(targetDate)
      setCountdown(result)

      // Stop interval when expired
      if (result.isExpired) {
        clearInterval(intervalId)
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [targetDate])

  return countdown
}

function calculateCountdown(targetDate: Date | string | null): CountdownResult {
  if (!targetDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalSeconds: 0,
    }
  }

  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalSeconds: 0,
    }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalSeconds,
  }
}
