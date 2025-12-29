import { AdminJournalInboxScreen } from 'app/features/admin/journal-inbox-screen'
import { HomeLayout } from 'app/features/home/layout.web'
import Head from 'next/head'

import type { NextPageWithLayout } from '../../_app'

export const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Admin - Journal Inbox</title>
      </Head>
      <AdminJournalInboxScreen />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
