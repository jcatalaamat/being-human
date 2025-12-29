import { AdminResponsesScreen } from 'app/features/admin/responses-screen'
import { HomeLayout } from 'app/features/home/layout.web'
import Head from 'next/head'

import type { NextPageWithLayout } from '../../_app'

export const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Admin - Responses</title>
      </Head>
      <AdminResponsesScreen />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
