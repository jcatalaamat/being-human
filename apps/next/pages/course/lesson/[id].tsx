import { HomeLayout } from 'app/features/home/layout.web'
import { LessonScreen } from 'app/features/lesson/screen'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { NextPageWithLayout } from '../../_app'

const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const { id } = router.query

  if (!id || typeof id !== 'string') {
    return null
  }

  return (
    <>
      <Head>
        <title>Lesson - Holistic Training</title>
      </Head>
      <LessonScreen lessonId={id} />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout fullPage>{page}</HomeLayout>

export default Page
