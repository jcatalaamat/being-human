import { HomeLayout } from 'app/features/home/layout.web'
import { ProfileSettingsScreen } from 'app/features/settings/profile-screen'
import { SettingsLayout } from 'app/features/settings/layout.web'
import Head from 'next/head'
import { NextPageWithLayout } from 'pages/_app'

const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Profile Settings</title>
      </Head>
      <ProfileSettingsScreen />
    </>
  )
}

Page.getLayout = (page) => (
  <HomeLayout fullPage>
    <SettingsLayout>{page}</SettingsLayout>
  </HomeLayout>
)

export default Page
