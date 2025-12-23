import { H2, Paragraph, ScrollView, YStack } from '@my/ui'
import { useUser } from 'app/utils/useUser'

export function ProfileScreen() {
  const { profile, user } = useUser()

  const name = profile?.name ?? 'No Name'
  const email = user?.email ?? ''

  return (
    <ScrollView>
      <YStack maw={800} mx="auto" w="100%" py="$6" px="$4" ai="center" gap="$2">
        <H2>{name}</H2>
        <Paragraph theme="alt2">{email}</Paragraph>
      </YStack>
    </ScrollView>
  )
}
