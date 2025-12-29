import { MemberDetailScreen } from 'app/features/admin/member-detail-screen'
import { HomeLayout } from 'app/features/home/layout.web'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { NextPageWithLayout } from '../../_app'

export const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const { userId, courseId } = router.query

  if (!userId || typeof userId !== 'string') return null
  if (!courseId || typeof courseId !== 'string') return null

  return (
    <>
      <Head>
        <title>Member Details</title>
      </Head>
      <MemberDetailScreen userId={userId} courseId={courseId} />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
