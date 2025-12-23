import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function ProfileRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/settings')
  }, [router])

  return null
}
