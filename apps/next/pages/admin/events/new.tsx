import { CreateEventScreen } from 'app/features/admin/create-event-screen'
import { HomeLayout } from 'app/features/home/layout.web'
import Head from 'next/head'

import type { NextPageWithLayout } from '../../_app'

export const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Admin - Create Event</title>
      </Head>
      <CreateEventScreen />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
