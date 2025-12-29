import { HomeLayout } from 'app/features/home/layout.web'
import { EventsScreen } from 'app/features/events/screen'
import Head from 'next/head'

import type { NextPageWithLayout } from '../_app'

export const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Events - Inner Ascend</title>
      </Head>
      <EventsScreen />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
