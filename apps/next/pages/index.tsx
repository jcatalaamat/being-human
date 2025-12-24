import { HomeLayout } from 'app/features/home/layout.web'
import { LibraryScreen } from 'app/features/library/screen'
import Head from 'next/head'

import type { NextPageWithLayout } from './_app'

export const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Training Programs - Holistic Training</title>
      </Head>
      <LibraryScreen />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
