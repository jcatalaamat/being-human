import { HomeLayout } from 'app/features/home/layout.web'
import { JournalScreen } from 'app/features/journal/screen'
import Head from 'next/head'

import type { NextPageWithLayout } from '../_app'

export const Page: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Journal - Inner Ascend</title>
      </Head>
      <JournalScreen />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
