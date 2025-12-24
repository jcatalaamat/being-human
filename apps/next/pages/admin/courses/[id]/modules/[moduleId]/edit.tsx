import { EditModuleScreen } from 'app/features/admin/edit-module-screen'
import { HomeLayout } from 'app/features/home/layout.web'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { NextPageWithLayout } from '../../../../../_app'

export const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const { id, moduleId } = router.query

  if (!id || typeof id !== 'string') return null
  if (!moduleId || typeof moduleId !== 'string') return null

  return (
    <>
      <Head>
        <title>Edit Module</title>
      </Head>
      <EditModuleScreen courseId={id} moduleId={moduleId} />
    </>
  )
}

Page.getLayout = (page) => <HomeLayout>{page}</HomeLayout>

export default Page
