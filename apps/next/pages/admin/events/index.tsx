import { AdminEventsScreen } from 'app/features/admin/events-screen'
import { HomeLayout } from 'app/features/home/layout.web'
import Head from 'next/head'

import type { NextPageWithLayout } from '../../_app'

export const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Admin - Events</title>
      </Head>
      <AdminEventsScreen />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
