import { AdminMembersScreen } from 'app/features/admin/members-screen'
import { HomeLayout } from 'app/features/home/layout.web'
import Head from 'next/head'

import type { NextPageWithLayout } from '../_app'

export const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Admin - Members</title>
      </Head>
      <AdminMembersScreen />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
