import { FormWrapper, H2, H4, KVTable, Separator, SizableText, YStack, isWeb, styled } from '@my/ui'
import { useUser } from 'app/utils/useUser'
import { useState } from 'react'
import { Input, Button, XStack } from 'tamagui'
import { useSupabase } from 'app/utils/supabase/useSupabase'

export const ProfileSettingsScreen = () => {
  const { user, profile } = useUser()
  const supabase = useSupabase()
  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState(profile?.name ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveName = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user?.id)

      if (!error) {
        setIsEditingName(false)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <FormWrapper>
      {isWeb && (
        <YStack px="$4" py="$4" pb="$2">
          <H2>Profile</H2>
        </YStack>
      )}
      <FormWrapper.Body mt="$2" gap="$10">
        <Section>
          <KVTable>
            <YStack gap="$4">
              <H4>Profile Information</H4>
              <Separator />
            </YStack>
            <KVTable.Row>
              <KVTable.Key>
                <SizableText fow="900">Name</SizableText>
              </KVTable.Key>
              <KVTable.Value gap="$4">
                {isEditingName ? (
                  <XStack gap="$2" ai="center">
                    <Input
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your name"
                      f={1}
                    />
                    <Button size="$2" onPress={handleSaveName} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      size="$2"
                      chromeless
                      onPress={() => {
                        setIsEditingName(false)
                        setName(profile?.name ?? '')
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </XStack>
                ) : (
                  <>
                    <SizableText>{profile?.name ?? 'No Name'}</SizableText>
                    <SizableText
                      textDecorationLine="underline"
                      cursor="pointer"
                      onPress={() => setIsEditingName(true)}
                    >
                      Change
                    </SizableText>
                  </>
                )}
              </KVTable.Value>
            </KVTable.Row>
            <KVTable.Row>
              <KVTable.Key>
                <SizableText fow="900">Email</SizableText>
              </KVTable.Key>
              <KVTable.Value>
                <SizableText>{user?.email}</SizableText>
              </KVTable.Value>
            </KVTable.Row>
            <KVTable.Row>
              <KVTable.Key>
                <SizableText fow="900">User ID</SizableText>
              </KVTable.Key>
              <KVTable.Value>
                <SizableText>{user?.id}</SizableText>
              </KVTable.Value>
            </KVTable.Row>
          </KVTable>
        </Section>
      </FormWrapper.Body>
    </FormWrapper>
  )
}

const Section = styled(YStack, {
  boc: '$borderColor',
  bw: 1,
  p: '$4',
  br: '$4',
})
