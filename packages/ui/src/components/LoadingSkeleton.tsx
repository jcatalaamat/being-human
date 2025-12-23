import { useEffect, useState } from 'react'
import { View, YStack } from 'tamagui'

interface ShimmerProps {
  width?: string | number
  height?: number
}

const Shimmer = ({ width = '100%', height = 20 }: ShimmerProps) => {
  const [opacity, setOpacity] = useState(0.3)

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity((prev) => (prev === 0.3 ? 0.6 : 0.3))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return <View w={width} h={height} bg="$color5" br="$2" opacity={opacity} animation="lazy" />
}

export const CourseCardSkeleton = () => {
  return (
    <YStack gap="$3" p="$3" bordered br="$4" bg="$background">
      <Shimmer width="100%" height={150} />
      <Shimmer width="80%" height={24} />
      <Shimmer width="100%" height={16} />
      <Shimmer width="60%" height={16} />
    </YStack>
  )
}

export const LessonRowSkeleton = () => {
  return (
    <YStack gap="$2" p="$3" bordered br="$3" bg="$background">
      <Shimmer width="70%" height={20} />
    </YStack>
  )
}

export const ModuleSkeleton = () => {
  return (
    <YStack gap="$2" p="$3" bordered br="$3" bg="$background">
      <Shimmer width="40%" height={24} />
      <LessonRowSkeleton />
      <LessonRowSkeleton />
      <LessonRowSkeleton />
    </YStack>
  )
}
