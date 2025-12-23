import { CreateLessonScreen } from 'app/features/admin/create-lesson-screen'
import { HomeLayout } from 'app/features/home/layout.web'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { NextPageWithLayout } from '../../../../../../_app'

export const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const { id, moduleId } = router.query

  if (!id || typeof id !== 'string' || !moduleId || typeof moduleId !== 'string') return null

  return (
    <>
      <Head>
        <title>Add Lesson</title>
      </Head>
      <CreateLessonScreen courseId={id} moduleId={moduleId} />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
