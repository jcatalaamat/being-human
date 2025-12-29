import { HomeLayout } from 'app/features/home/layout.web'
import { CourseDetailScreen } from 'app/features/course/detail-screen'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { NextPageWithLayout } from '../_app'

const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const { id } = router.query

  if (!id || typeof id !== 'string') {
    return null
  }

  return (
    <>
      <Head>
        <title>Course Details - Inner Ascend</title>
      </Head>
      <CourseDetailScreen courseId={id} />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout fullPage>{page}</HomeLayout>

export default Page
