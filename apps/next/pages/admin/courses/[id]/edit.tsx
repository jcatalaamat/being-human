import { EditCourseScreen } from 'app/features/admin/edit-course-screen'
import { HomeLayout } from 'app/features/home/layout.web'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { NextPageWithLayout } from '../../../_app'

export const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const { id } = router.query

  if (!id || typeof id !== 'string') return null

  return (
    <>
      <Head>
        <title>Edit Program</title>
      </Head>
      <EditCourseScreen courseId={id} />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
