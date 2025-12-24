import { EditLessonScreen } from 'app/features/admin/edit-lesson-screen'
import { HomeLayout } from 'app/features/home/layout.web'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { NextPageWithLayout } from '../../../../../../../_app'

export const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const { id, moduleId, lessonId } = router.query

  if (!id || typeof id !== 'string') return null
  if (!moduleId || typeof moduleId !== 'string') return null
  if (!lessonId || typeof lessonId !== 'string') return null

  return (
    <>
      <Head>
        <title>Edit Exercise</title>
      </Head>
      <EditLessonScreen courseId={id} moduleId={moduleId} lessonId={lessonId} />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
