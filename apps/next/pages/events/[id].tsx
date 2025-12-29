import { HomeLayout } from 'app/features/home/layout.web'
import { EventDetailScreen } from 'app/features/events/detail-screen'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { NextPageWithLayout } from '../_app'

export const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const { id } = router.query

  if (!id || typeof id !== 'string') {
    return null
  }

  return (
    <>
      <Head>
        <title>Event - Inner Ascend</title>
      </Head>
      <EventDetailScreen eventId={id} />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
