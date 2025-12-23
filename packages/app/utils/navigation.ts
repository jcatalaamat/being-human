// Cross-platform navigation utility
import { useRouter as useNextRouter } from 'solito/router'

export const useAppRouter = () => {
  const router = useNextRouter()

  return {
    push: (path: string) => router.push(path),
    replace: (path: string) => router.replace(path),
    back: () => router.back(),
  }
}
