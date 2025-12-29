import { Button, H3, Paragraph, YStack } from '@my/ui'
import { Calendar, Clock, ExternalLink, Video } from '@tamagui/lucide-icons'
import { useEffect, useState } from 'react'
import { Linking, Platform } from 'react-native'

import { VideoPlayer } from '../video-player'
import type { LiveLessonProps } from './types'

type LiveStatus = 'upcoming' | 'live' | 'ended'

function formatCountdown(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}d ${hours}h ${mins}m`
  } else if (hours > 0) {
    return `${hours}h ${mins}m`
  } else {
    return `${mins}m`
  }
}

function formatScheduledDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function LiveLesson({
  scheduledAt,
  replayUrl,
  meetingUrl,
  lessonId,
  courseId,
  initialPositionSec = 0,
}: LiveLessonProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [status, setStatus] = useState<LiveStatus>('upcoming')

  useEffect(() => {
    if (!scheduledAt) {
      setStatus('ended')
      return
    }

    const checkStatus = () => {
      const now = new Date()
      const scheduled = new Date(scheduledAt)
      const diff = scheduled.getTime() - now.getTime()

      if (diff > 0) {
        // Upcoming - show countdown
        setStatus('upcoming')
        setTimeRemaining(formatCountdown(diff))
      } else if (diff > -90 * 60 * 1000) {
        // Within 90 mins of start time - consider it live
        setStatus('live')
      } else {
        setStatus('ended')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [scheduledAt])

  const handleOpenMeetingUrl = () => {
    if (meetingUrl) {
      if (Platform.OS === 'web') {
        window.open(meetingUrl, '_blank')
      } else {
        Linking.openURL(meetingUrl)
      }
    }
  }

  // Upcoming state - show countdown
  if (status === 'upcoming') {
    return (
      <YStack f={1} jc="center" ai="center" p="$6" gap="$4" bg="$color2">
        <YStack
          w={120}
          h={120}
          br="$10"
          bg="$blue3"
          jc="center"
          ai="center"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.1}
          shadowRadius={12}
        >
          <Calendar size={56} color="$blue10" />
        </YStack>

        <H3 ta="center">Live Call Scheduled</H3>

        <Paragraph size="$8" fontWeight="700" color="$blue10">
          {timeRemaining}
        </Paragraph>

        {scheduledAt && (
          <Paragraph theme="alt2" ta="center">
            {formatScheduledDate(scheduledAt)}
          </Paragraph>
        )}

        {meetingUrl && (
          <Button size="$4" themeInverse mt="$4" icon={ExternalLink} onPress={handleOpenMeetingUrl}>
            Add to Calendar
          </Button>
        )}
      </YStack>
    )
  }

  // Live state - show join button
  if (status === 'live' && meetingUrl) {
    return (
      <YStack f={1} jc="center" ai="center" p="$6" gap="$4" bg="$color2">
        <YStack
          w={120}
          h={120}
          br="$10"
          bg="$red3"
          jc="center"
          ai="center"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.1}
          shadowRadius={12}
        >
          <Video size={56} color="$red10" />
        </YStack>

        <H3 ta="center" color="$red10">
          Live Now!
        </H3>

        <Paragraph theme="alt2" ta="center">
          The call is happening right now. Click below to join.
        </Paragraph>

        <Button size="$5" themeInverse mt="$4" icon={ExternalLink} onPress={handleOpenMeetingUrl}>
          Join Call
        </Button>
      </YStack>
    )
  }

  // Ended state - show replay or waiting message
  if (status === 'ended') {
    if (replayUrl) {
      return (
        <VideoPlayer
          url={replayUrl}
          lessonId={lessonId}
          courseId={courseId}
          initialPositionSec={initialPositionSec}
        />
      )
    }

    return (
      <YStack f={1} jc="center" ai="center" p="$6" gap="$4" bg="$color2">
        <YStack
          w={120}
          h={120}
          br="$10"
          bg="$gray3"
          jc="center"
          ai="center"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.1}
          shadowRadius={12}
        >
          <Clock size={56} color="$gray10" />
        </YStack>

        <H3 ta="center">Call Ended</H3>

        <Paragraph theme="alt2" ta="center" maxWidth={300}>
          The replay will be available soon. Check back later.
        </Paragraph>
      </YStack>
    )
  }

  // Fallback for live without meeting URL
  return (
    <YStack f={1} jc="center" ai="center" p="$6" gap="$4" bg="$color2">
      <Clock size={64} color="$gray10" />
      <H3 ta="center">Live Call</H3>
      <Paragraph theme="alt2" ta="center">
        No meeting link available.
      </Paragraph>
    </YStack>
  )
}
