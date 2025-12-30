import { HomeLayout } from 'app/features/home/layout.web'
import { CreateJournalEntryScreen } from 'app/features/journal/create-screen'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { NextPageWithLayout } from '../_app'

export const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const { lessonId, lessonTitle, courseId, moduleId } = router.query

  return (
    <>
      <Head>
        <title>New Assignment - Inner Ascend</title>
      </Head>
      <CreateJournalEntryScreen
        lessonId={typeof lessonId === 'string' ? lessonId : undefined}
        lessonTitle={typeof lessonTitle === 'string' ? lessonTitle : undefined}
        courseId={typeof courseId === 'string' ? courseId : undefined}
        moduleId={typeof moduleId === 'string' ? moduleId : undefined}
      />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
